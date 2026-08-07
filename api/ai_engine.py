"""
MedSense AI Engine
==================
Dataset-driven medical AI — no external API required.
Loads all CSVs at startup and uses them for:

  1. symptom_analysis(symptoms, age, severity, duration, conditions, meds)
  2. chat_response(message, conversation_history)
  3. analyze_report_text(text)
  4. lookup_medicine(query)          — medicine details + side-effects
  5. lookup_medicine_price(query)    — pricing from A-Z India dataset

XGBoost integration:
  Trained models in api/ml_models/ are loaded by ml_inference.py.
  When available they augment/override the rule-based logic:
    - symptom_analysis   → XGBoost disease probabilities merged with TF-IDF scores
    - analyze_report_text → XGBoost status classifier replaces threshold rules
    - chat_response       → XGBoost intent classifier replaces regex patterns
  Run  python api/ml_trainer.py  once to generate model files.
"""

import csv
import os
import re
import math
import logging
from pathlib import Path
from typing import Any

# ── XGBoost inference (graceful import — falls back if models not trained yet)
try:
    from api.ml_inference import predict_diseases, predict_report_status, predict_intent, models_ready
    _ML_AVAILABLE = True
except ImportError:
    try:
        # Fallback import path when running directly inside the api/ dir
        from ml_inference import predict_diseases, predict_report_status, predict_intent, models_ready
        _ML_AVAILABLE = True
    except ImportError:
        _ML_AVAILABLE = False
        def predict_diseases(*a, **kw): return None      # noqa: E301
        def predict_report_status(*a, **kw): return None  # noqa: E301
        def predict_intent(*a, **kw): return None          # noqa: E301
        def models_ready(): return False                   # noqa: E301

logger = logging.getLogger(__name__)

# ── Dataset paths ─────────────────────────────────────────────────────────────
_BASE = Path(__file__).resolve().parent / "datasets"
_SYMPTOMS_CSV   = _BASE / "symptoms_diseases.csv"
_TREATMENTS_CSV = _BASE / "diseases_treatments.csv"
_REPORT_CSV     = _BASE / "report_analysis_keywords.csv"
_MEDICINE_CSV   = _BASE / "medicine_details.csv"       # NEW
_AZ_MED_CSV     = _BASE / "az_medicines.csv"           # NEW

# ── In-memory stores (loaded once at import time) ─────────────────────────────
_symptom_db:    list[dict] = []          # rows from symptoms_diseases.csv
_treatment_db:  dict[str, dict] = {}     # disease (lower) -> treatment row
_report_db:     dict[str, dict] = {}     # parameter (lower) -> report row
_medicine_db:   dict[str, dict] = {}     # medicine name (lower) -> detail row  NEW
_medicine_list: list[dict] = []          # all medicine_details rows (for fuzzy search) NEW
_az_med_db:     dict[str, dict] = {}     # medicine name (lower) -> az row  NEW


def _load_datasets() -> None:
    """Load all CSVs into memory. Called once at module import."""
    global _symptom_db, _treatment_db, _report_db, _medicine_db, _medicine_list, _az_med_db

    # 1. symptoms_diseases.csv
    if _SYMPTOMS_CSV.exists():
        with open(_SYMPTOMS_CSV, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                row["_symptom_list"] = [
                    s.strip().lower() for s in row.get("symptoms", "").split(",") if s.strip()
                ]
                _symptom_db.append(row)

    # 2. diseases_treatments.csv
    if _TREATMENTS_CSV.exists():
        with open(_TREATMENTS_CSV, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                _treatment_db[row["disease"].strip().lower()] = row

    # 3. report_analysis_keywords.csv
    if _REPORT_CSV.exists():
        with open(_REPORT_CSV, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                key = row.get("parameter", "").strip().lower()
                if key:
                    _report_db[key] = row
                # also index by common abbreviation extracted from parens e.g. "WBC"
                m = re.search(r'\(([^)]+)\)', row.get("parameter", ""))
                if m:
                    _report_db[m.group(1).strip().lower()] = row

    # 4. medicine_details.csv — 11 825 medicines with uses & side-effects
    if _MEDICINE_CSV.exists():
        with open(_MEDICINE_CSV, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                name_key = row.get("Medicine Name", "").strip().lower()
                if name_key:
                    _medicine_db[name_key] = row
                    _medicine_list.append(row)
                    # also index by every word in the name for partial matching
                    # e.g. "augmentin" -> row
                    for word in re.findall(r'[a-z]+', name_key):
                        if len(word) >= 5 and word not in _medicine_db:
                            _medicine_db[word] = row

    # 5. az_medicines.csv — 253 973 medicines with price & composition
    if _AZ_MED_CSV.exists():
        with open(_AZ_MED_CSV, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                name_key = row.get("name", "").strip().lower()
                if name_key and row.get("Is_discontinued", "").upper() != "TRUE":
                    _az_med_db[name_key] = row


_load_datasets()


# ── File text extraction ──────────────────────────────────────────────────────

def extract_text_from_file(file_path: "str | Path") -> str:
    """
    Extract plain text from an uploaded medical report file.

    Supports:
      - PDF  → pdfplumber (reads all pages, plain text + tables)
      - JPG / PNG / JPEG  → pytesseract if Tesseract is installed;
                            returns "" otherwise so the caller can handle gracefully.

    Returns the extracted text string, or "" if extraction fails or is unsupported.
    """
    path = Path(file_path)
    if not path.exists():
        logger.warning("extract_text_from_file: file not found: %s", path)
        return ""

    suffix = path.suffix.lower()

    # ── PDF ─────────────────────────────────────────────────────────────────
    if suffix == ".pdf":
        try:
            import pdfplumber
            parts: list[str] = []
            with pdfplumber.open(str(path)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text() or ""
                    if page_text.strip():
                        parts.append(page_text)
                    # Also pull tabular data (many lab reports are tables)
                    for table in page.extract_tables():
                        for row in table:
                            cells = [str(c).strip() for c in row if c is not None and str(c).strip()]
                            if cells:
                                parts.append("  ".join(cells))
            return "\n".join(parts)
        except Exception as exc:
            logger.error("PDF extraction failed for %s: %s", path, exc)
            return ""

    # ── Image (JPG / PNG) ────────────────────────────────────────────────────
    if suffix in (".jpg", ".jpeg", ".png"):
        try:
            import pytesseract
            from PIL import Image
            img = Image.open(str(path)).convert("L")
            w, h = img.size
            if w < 1000:
                img = img.resize((w * 2, h * 2), Image.LANCZOS)
            text = pytesseract.image_to_string(img, config="--psm 6")
            if text.strip():
                return text
        except Exception:
            pass  # Tesseract not installed — fall through
        return ""

    return ""


def reload_report_db() -> None:
    """Force reload of report_analysis_keywords (call after CSV edits)."""
    global _report_db
    _report_db = {}
    if _REPORT_CSV.exists():
        with open(_REPORT_CSV, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                key = row.get("parameter", "").strip().lower()
                if key:
                    _report_db[key] = row
                m = re.search(r'\(([^)]+)\)', row.get("parameter", ""))
                if m:
                    _report_db[m.group(1).strip().lower()] = row


def compute_model_accuracy() -> dict[str, Any]:
    """
    Compute real-time model accuracy metrics from the loaded datasets.

    Runs a fixed benchmark test suite across three axes:
      1. Symptom analysis  — top-3 disease match rate on 20 known cases
      2. Report analysis   — correct status classification on 10 lab tests
      3. Chat intent       — correct intent routing on 10 natural queries

    Returns a dict with individual scores and a weighted overall accuracy.
    """

    # ── 1. Symptom Top-3 accuracy ─────────────────────────────────────────────
    SYMPTOM_TESTS = [
        ('fever, body aches, chills, headache, fatigue',                'Influenza (Flu)'),
        ('runny nose, sneezing, sore throat, mild fever',               'Common Cold'),
        ('fever, dry cough, fatigue, loss of taste, loss of smell',     'COVID-19'),
        ('chest pain, shortness of breath, sweating, jaw pain',         'Heart Attack'),
        ('frequent urination, excessive thirst, fatigue, blurry vision','Type 2 Diabetes'),
        ('wheezing, shortness of breath, chest tightness, coughing at night', 'Asthma'),
        ('heartburn, acid reflux, regurgitation, difficulty swallowing','GERD'),
        ('severe abdominal pain, nausea, vomiting, fever, loss of appetite', 'Appendicitis'),
        ('high fever, chills, cough with phlegm, chest pain, rapid breathing', 'Pneumonia'),
        ('jaundice, fatigue, abdominal pain, nausea, dark urine',       'Hepatitis A'),
        ('palpitations, rapid heartbeat, dizziness, shortness of breath', 'Arrhythmia'),
        ('headache, nausea, sensitivity to light, vomiting',            'Migraine'),
        ('fatigue, weight gain, cold intolerance, constipation, dry skin', 'Hypothyroidism'),
        ('itchy rash, red spots, blisters, fever, fatigue',             'Chickenpox'),
        ('swollen joints, stiffness, fatigue, fever, reduced range of motion', 'Rheumatoid Arthritis'),
        ('abdominal cramping, bloating, diarrhea, constipation, gas',   'Irritable Bowel Syndrome'),
        ('sudden numbness, face drooping, slurred speech, severe headache', 'Stroke'),
        ('shakiness, sweating, hunger, dizziness, rapid heartbeat',     'Hypoglycemia'),
        ('persistent cough, mucus, fatigue, shortness of breath, chest discomfort', 'Bronchitis'),
        ('weight loss, rapid heartbeat, tremors, sweating, heat intolerance', 'Hyperthyroidism'),
    ]
    top1 = top3 = 0
    for syms, expected in SYMPTOM_TESTS:
        result = symptom_analysis(syms)
        concerns = [c.lower() for c in result.get('concerns', [])]
        if concerns and concerns[0] == expected.lower():
            top1 += 1
        if expected.lower() in concerns[:3]:
            top3 += 1
    sym_top1_pct = round(top1 / len(SYMPTOM_TESTS) * 100, 1)
    sym_top3_pct = round(top3 / len(SYMPTOM_TESTS) * 100, 1)

    # ── 2. Report analysis accuracy ───────────────────────────────────────────
    REPORT_TESTS = [
        ('Hemoglobin: 7.5 g/dL',                                'hemoglobin',                      'low'),
        ('WBC: 14000 cells/uL',                                  'wbc (white blood cells)',          'high'),
        ('HbA1c: 8.5 %',                                         'hba1c (glycated hemoglobin)',      'high'),
        ('Serum Potassium: 2.8 mEq/L',                           'serum potassium',                  'low'),
        ('Total Cholesterol: 260 mg/dL',                         'total cholesterol',                'high'),
        ('Serum Creatinine: 2.1 mg/dL',                          'serum creatinine',                 'high'),
        ('Vitamin D (25-OH): 8 ng/mL',                           'vitamin d (25-oh)',                'low'),
        ('TSH (Thyroid Stimulating Hormone): 8.0 mIU/L',         'tsh (thyroid stimulating hormone)','high'),
        ('Hemoglobin: 15.0 g/dL',                                'hemoglobin',                      'normal'),
        ('Serum Sodium: 140 mEq/L',                              'serum sodium',                    'normal'),
    ]
    report_correct = 0
    for text, param, expected_status in REPORT_TESTS:
        r = analyze_report_text(text)
        for f in r.get('findings', []):
            if f['parameter'].lower() == param:
                if f['status'] == expected_status:
                    report_correct += 1
                break
    report_pct = round(report_correct / len(REPORT_TESTS) * 100, 1)

    # ── 3. Chat intent accuracy ────────────────────────────────────────────────
    CHAT_TESTS = [
        ('medicines for headache',          'treatment_request'),
        ('treatment for cold',              'treatment_request'),
        ('side effects of metformin',       'medicine_info'),
        ('i have high fever and body ache', 'symptom_treatment'),
        ('find hospital near me',           'hospital'),
        ('i am feeling depressed',          'mental_health'),
        ('hello',                           'greeting'),
        ('call 911 i am dying',             'emergency'),
        ('set medicine reminder',           'reminder'),
        ('what is hba1c',                   'diabetes'),
    ]
    chat_correct = sum(
        1 for q, expected in CHAT_TESTS
        if chat_response(q)['intent'] == expected
    )
    chat_pct = round(chat_correct / len(CHAT_TESTS) * 100, 1)

    # ── 4. Dataset coverage ───────────────────────────────────────────────────
    symptom_diseases = {r['disease'].lower() for r in _symptom_db}
    treatment_diseases = set(_treatment_db.keys())
    covered = len(symptom_diseases & treatment_diseases)
    coverage_pct = round(covered / len(symptom_diseases) * 100, 1) if symptom_diseases else 0.0

    # ── Weighted overall ──────────────────────────────────────────────────────
    # Weights: symptom top-3 (40%), report (30%), chat intent (20%), coverage (10%)
    overall = round(
        sym_top3_pct * 0.40 +
        report_pct   * 0.30 +
        chat_pct     * 0.20 +
        coverage_pct * 0.10,
        1
    )

    return {
        "overall_accuracy":        overall,
        "symptom_top1_accuracy":   sym_top1_pct,
        "symptom_top3_accuracy":   sym_top3_pct,
        "report_analysis_accuracy":report_pct,
        "chat_intent_accuracy":    chat_pct,
        "disease_coverage":        coverage_pct,
        "xgboost_models_active":   models_ready(),
        "dataset_stats": {
            "symptom_diseases":    len(_symptom_db),
            "treatment_diseases":  len(_treatment_db),
            "report_parameters":   len(set(v.get("parameter","") for v in _report_db.values())),
            "medicines_indexed":   len({v.get("Medicine Name","") for v in _medicine_db.values()}),
        },
        "benchmark_sizes": {
            "symptom_tests":  len(SYMPTOM_TESTS),
            "report_tests":   len(REPORT_TESTS),
            "chat_tests":     len(CHAT_TESTS),
        },
    }


# ── Medicine lookup helpers ───────────────────────────────────────────────────

def lookup_medicine(query: str) -> dict[str, Any]:
    """
    Search medicine_details.csv for a medicine by name or active ingredient.

    Returns a dict with keys:
        found (bool), name, composition, uses, side_effects,
        manufacturer, rating_summary, az_price (₹) if available
    """
    q = query.strip().lower()
    row = _medicine_db.get(q)

    # Fuzzy fallback: find the first medicine whose name contains the query token
    if row is None:
        for name_key, r in _medicine_db.items():
            if q in name_key:
                row = r
                break

    # Second fallback: search by composition / active ingredient
    if row is None:
        for r in _medicine_list:
            comp = r.get("Composition", "").lower()
            if q in comp:
                row = r
                break

    if row is None:
        return {"found": False, "query": query}

    # Try to enrich with price from az_medicines
    price = None
    med_name_lower = row.get("Medicine Name", "").strip().lower()
    az_row = _az_med_db.get(med_name_lower)
    if az_row:
        price = az_row.get("price(₹)", "")

    # Build rating summary
    exc  = row.get("Excellent Review %", "")
    avg  = row.get("Average Review %", "")
    poor = row.get("Poor Review %", "")
    rating_summary = f"Excellent: {exc}%  Average: {avg}%  Poor: {poor}%" if exc else ""

    return {
        "found":          True,
        "name":           row.get("Medicine Name", ""),
        "composition":    row.get("Composition", ""),
        "uses":           row.get("Uses", ""),
        "side_effects":   row.get("Side_effects", ""),
        "manufacturer":   row.get("Manufacturer", ""),
        "rating_summary": rating_summary,
        "az_price":       price,
    }


def lookup_medicine_price(query: str) -> dict[str, Any]:
    """
    Search az_medicines.csv for pricing and pack information.
    Returns a list of up to 5 matching rows.
    """
    q = query.strip().lower()
    results = []
    for name_key, row in _az_med_db.items():
        if q in name_key:
            results.append({
                "name":         row.get("name", ""),
                "price_inr":    row.get("price(₹)", ""),
                "pack":         row.get("pack_size_label", ""),
                "manufacturer": row.get("manufacturer_name", ""),
                "composition":  f"{row.get('short_composition1','').strip()} {row.get('short_composition2','').strip()}".strip(),
            })
        if len(results) >= 5:
            break
    return {"found": bool(results), "results": results, "query": query}


def _format_medicine_reply(info: dict) -> str:
    """Format a lookup_medicine result into a readable chat response."""
    if not info.get("found"):
        return (
            f"I couldn't find **{info.get('query', 'that medicine')}** in my database. "
            "Please double-check the spelling or ask about the active ingredient (e.g., 'Paracetamol'). "
            "\n\n⚠️ Always consult a pharmacist or doctor before taking any medication."
        )
    lines = [f"**{info['name']}**\n"]
    if info.get("composition"):
        lines.append(f"**Composition:** {info['composition']}")
    if info.get("uses"):
        lines.append(f"**Uses:** {info['uses']}")
    if info.get("side_effects"):
        lines.append(f"**Side effects:** {info['side_effects']}")
    if info.get("manufacturer"):
        lines.append(f"**Manufacturer:** {info['manufacturer']}")
    if info.get("az_price"):
        lines.append(f"**Price (India):** ₹{info['az_price']}")
    if info.get("rating_summary"):
        lines.append(f"**User ratings:** {info['rating_summary']}")
    lines.append(
        "\n⚠️ This information is for reference only. "
        "Always follow your doctor's prescription and consult a pharmacist for dosage guidance."
    )
    return "\n".join(lines)


# ── Internal helpers ──────────────────────────────────────────────────────────

def _tokenize(text: str) -> set[str]:
    """Return a set of lowercase words + bigrams from text."""
    words = re.findall(r'[a-z]+', text.lower())
    tokens = set(words)
    for i in range(len(words) - 1):
        tokens.add(f"{words[i]} {words[i+1]}")
    return tokens


def _score_disease(disease_row: dict, query_tokens: set[str]) -> float:
    """
    TF-IDF-style score: count how many disease symptoms are mentioned
    in the query, weighted by inverse symptom count (rarer symptom = higher weight).
    Returns a 0-1 score.
    """
    symptom_list = disease_row["_symptom_list"]
    if not symptom_list:
        return 0.0

    matched = 0
    for sym in symptom_list:
        sym_tokens = set(sym.split())
        # full phrase match OR all individual words present
        if sym in query_tokens or sym_tokens.issubset(query_tokens):
            matched += 1

    if matched == 0:
        return 0.0

    # weight by rarity: fewer symptoms listed → higher specificity → higher weight
    idf = math.log(1 + 10 / len(symptom_list))
    return (matched / len(symptom_list)) * idf


def _severity_weight(severity: str) -> float:
    return {"mild": 0.8, "moderate": 1.0, "severe": 1.2, "critical": 1.5}.get(
        severity.lower(), 1.0
    )


def _get_treatment(disease_name: str) -> dict | None:
    return _treatment_db.get(disease_name.strip().lower())


# ── 1. Symptom Analysis ───────────────────────────────────────────────────────

def symptom_analysis(
    symptoms: str,
    age: str = "",
    severity: str = "moderate",
    duration: str = "today",
    existing_conditions: str = "",
    medications: str = "",
    allergies: str = "",
) -> dict[str, Any]:
    """
    Analyse free-text symptoms and return structured medical guidance.

    Returns:
        {
          concerns: list of possible disease names,
          identified_symptoms: list of symptom tokens found,
          guidance: str,
          recommendations: list[str],
          warning_signs: list[str],
          seek_care: str,
          treatments: list[dict],   # first-line treatment info per match
          severity_level: str,
          disclaimer: str,
        }
    """
    if not _symptom_db:
        return _fallback_analysis(symptoms)

    query_tokens = _tokenize(symptoms)

    # Score every disease
    scored: list[tuple[float, dict]] = []
    for row in _symptom_db:
        base = _score_disease(row, query_tokens)
        if base > 0:
            weighted = base * _severity_weight(row.get("severity", "moderate"))
            scored.append((weighted, row))

    scored.sort(key=lambda x: x[0], reverse=True)

    # ── XGBoost augmentation ──────────────────────────────────────────────────
    # If trained models are available, blend XGBoost probabilities into the
    # CSV-based scores (weighted average: 60 % XGBoost + 40 % rule-based).
    xgb_preds = predict_diseases(symptoms, top_k=10)
    if xgb_preds:
        # Build a lookup: disease name (lower) → xgb confidence
        xgb_conf = {p["disease"].lower(): p["confidence"] for p in xgb_preds}
        # Re-score: replace score with blended value where XGBoost has opinion
        blended: list[tuple[float, dict]] = []
        for rule_score, row in scored:
            d_lower = row["disease"].lower()
            xgb_score = xgb_conf.get(d_lower, 0.0)
            # Normalise rule score to [0,1] roughly (cap at 2.0)
            norm_rule = min(rule_score / 2.0, 1.0)
            blend = 0.60 * xgb_score + 0.40 * norm_rule
            blended.append((blend, row))
        # Also add XGBoost-only hits not already in CSV results
        csv_diseases = {row["disease"].lower() for _, row in scored}
        for p in xgb_preds:
            d_lower = p["disease"].lower()
            if d_lower not in csv_diseases:
                # Find matching row in symptom_db
                for row in _symptom_db:
                    if row["disease"].lower() == d_lower:
                        blended.append((0.60 * p["confidence"], row))
                        break
        blended.sort(key=lambda x: x[0], reverse=True)
        scored = blended

    top = scored[:5]  # top 5 matches

    if not top:
        return _fallback_analysis(symptoms)

    # ── Build concern list ────────────────────────────────────────────────────
    concerns = [row["disease"] for _, row in top]

    # ── Identify which symptoms from the query were recognised ───────────────
    all_dataset_symptoms: set[str] = set()
    for _, row in top:
        all_dataset_symptoms.update(row["_symptom_list"])

    identified: list[str] = []
    for sym in all_dataset_symptoms:
        sym_tokens = set(sym.split())
        if sym in query_tokens or sym_tokens.issubset(query_tokens):
            identified.append(sym.title())
    # also add raw comma-separated symptom tokens the user typed
    user_syms = [s.strip().title() for s in symptoms.split(",") if s.strip()]
    for us in user_syms:
        if us not in identified:
            identified.append(us)
    identified = identified[:10]  # cap at 10

    # ── Primary match drives guidance ────────────────────────────────────────
    primary_score, primary_row = top[0]
    primary_severity = primary_row.get("severity", "moderate")
    primary_category = primary_row.get("category", "General")

    # ── Duration urgency nudge ────────────────────────────────────────────────
    duration_text = {
        "today":    "You have had these symptoms since today.",
        "few_days": "You have had these symptoms for a few days.",
        "weeks":    "You have had these symptoms for several weeks — this warrants medical evaluation.",
        "more":     "You have had these symptoms for an extended period — please see a doctor soon.",
    }.get(duration, "")

    # ── Age context ───────────────────────────────────────────────────────────
    age_note = ""
    if age:
        try:
            age_int = int(age)
            if age_int < 12:
                age_note = "Given the patient's young age, please consult a paediatrician promptly."
            elif age_int > 65:
                age_note = "Given the patient's age (65+), symptoms should be evaluated by a doctor sooner rather than later."
        except ValueError:
            pass

    # ── Existing conditions cross-reference ──────────────────────────────────
    condition_note = ""
    if existing_conditions:
        condition_note = (
            f"Considering your existing condition(s) ({existing_conditions}), "
            "your symptoms should be evaluated in that context by your healthcare provider."
        )

    # ── Severity-based guidance ───────────────────────────────────────────────
    if primary_severity == "critical":
        guidance_prefix = (
            "⚠️ URGENT: Based on your symptoms, this may be a medical emergency. "
            "Call emergency services (911 / 112) or go to the nearest emergency room immediately."
        )
    elif primary_severity == "severe":
        guidance_prefix = (
            "These symptoms may indicate a serious condition. "
            "Please seek medical attention today — do not wait."
        )
    elif severity == "severe":  # user-reported severity
        guidance_prefix = (
            "You've described your symptoms as severe. "
            "Please consult a healthcare professional promptly, ideally today."
        )
    else:
        guidance_prefix = (
            f"Based on your symptoms, possible conditions include {', '.join(concerns[:3])}. "
            "This is an AI-generated assessment and not a diagnosis."
        )

    guidance_parts = [guidance_prefix]
    if duration_text:
        guidance_parts.append(duration_text)
    if age_note:
        guidance_parts.append(age_note)
    if condition_note:
        guidance_parts.append(condition_note)

    guidance = " ".join(guidance_parts)

    # ── Build prescriptions and treatment data — 100% from datasets ─────────
    recommendations: list[str] = []
    treatments_out: list[dict] = []

    for _, row in top[:3]:
        tx = _get_treatment(row["disease"])
        if not tx:
            continue

        # ── Parse medications from diseases_treatments.csv and enrich each ──
        raw_meds_str = tx.get("medications", "")
        structured_medications: list[dict] = []
        for med_entry in raw_meds_str.split(","):
            med_name = med_entry.strip()
            if not med_name:
                continue
            # Look up full details from medicine_details.csv + az_medicines.csv
            med_info = lookup_medicine(med_name)
            if med_info.get("found"):
                structured_medications.append({
                    "name":         med_info["name"],
                    "composition":  med_info.get("composition", ""),
                    "uses":         med_info.get("uses", ""),
                    "side_effects": med_info.get("side_effects", ""),
                    "manufacturer": med_info.get("manufacturer", ""),
                    "price_inr":    med_info.get("az_price", ""),
                    "rating":       med_info.get("rating_summary", ""),
                })
            else:
                # Still include the medication name even if not in medicine DB
                structured_medications.append({
                    "name":         med_name,
                    "composition":  "",
                    "uses":         "",
                    "side_effects": "",
                    "manufacturer": "",
                    "price_inr":    "",
                    "rating":       "",
                })

        treatments_out.append({
            "disease":              row["disease"],
            "category":             row.get("category", ""),
            "icd_code":             row.get("icd_code", ""),
            "severity":             row.get("severity", ""),
            "first_line":           tx.get("first_line_treatment", ""),
            "medications":          tx.get("medications", ""),          # raw string
            "medications_detail":   structured_medications,             # enriched list
            "home_remedies":        tx.get("home_remedies", ""),
            "lifestyle":            tx.get("lifestyle_changes", ""),
            "specialist":           tx.get("specialist", ""),
            "prognosis":            tx.get("prognosis", ""),
            "duration":             tx.get("duration", ""),
            "emergency_signs":      tx.get("emergency_signs", ""),
        })

        # Pull home remedies into top-level recommendations
        for rem in tx.get("home_remedies", "").split(","):
            r = rem.strip()
            if r and r not in recommendations:
                recommendations.append(r)

    # Always add universal recommendations
    universal = [
        "Stay well hydrated (8+ glasses of water daily)",
        "Get adequate rest and sleep",
        "Monitor your symptoms and note any changes",
        "Avoid self-medicating with antibiotics without a prescription",
    ]
    for u in universal:
        if u not in recommendations:
            recommendations.append(u)
    recommendations = recommendations[:8]

    # ── Warning signs from primary treatment row ──────────────────────────────
    warning_signs: list[str] = []
    if treatments_out:
        emerg = treatments_out[0].get("emergency_signs", "")
        for sign in emerg.split(","):
            s = sign.strip()
            if s and s != "NONE":
                warning_signs.append(s)

    # Generic critical warnings always included
    generic_warnings = [
        "Difficulty breathing or shortness of breath",
        "Chest pain or pressure",
        "Sudden confusion or altered consciousness",
        "High fever above 39.5°C (103°F) that does not respond to medication",
        "Signs of severe allergic reaction (throat swelling, rash spreading rapidly)",
    ]
    for w in generic_warnings:
        if w not in warning_signs:
            warning_signs.append(w)
    warning_signs = warning_signs[:8]

    # ── Seek care text ────────────────────────────────────────────────────────
    specialist = treatments_out[0].get("specialist", "a healthcare professional") if treatments_out else "a healthcare professional"
    seek_care = (
        f"If your symptoms worsen, persist beyond 3-5 days, or any warning signs appear, "
        f"consult a {specialist} immediately. "
        "For emergencies, call 911 or go to the nearest emergency department."
    )

    # ── Overall severity level for UI ────────────────────────────────────────
    severity_level = primary_severity if primary_severity == "critical" else severity

    return {
        "concerns":           concerns,
        "identified_symptoms": identified,
        "guidance":           guidance,
        "recommendations":    recommendations,
        "warning_signs":      warning_signs,
        "seek_care":          seek_care,
        "treatments":         treatments_out,
        "severity_level":     severity_level,
        "top_match":          {
            "disease":  primary_row["disease"],
            "category": primary_category,
            "icd_code": primary_row.get("icd_code", ""),
            "score":    round(primary_score, 3),
        },
        "ai_source": {
            "xgboost_active":   models_ready(),
            "datasets_used":    ["symptoms_diseases.csv", "diseases_treatments.csv",
                                 "medicine_details.csv", "az_medicines.csv"],
            "disease_db_size":  len(_symptom_db),
            "treatment_db_size":len(_treatment_db),
            "medicine_db_size": len(_medicine_list),
        },
        "disclaimer": (
            "This AI-generated analysis is for informational purposes only and does not "
            "constitute a medical diagnosis. Always consult a qualified healthcare professional."
        ),
    }


def _fallback_analysis(symptoms: str) -> dict[str, Any]:
    return {
        "concerns":            ["Unable to determine — dataset unavailable"],
        "identified_symptoms": [s.strip().title() for s in symptoms.split(",") if s.strip()],
        "guidance":            "Please consult a healthcare professional for a proper evaluation.",
        "recommendations":     ["Stay hydrated", "Get rest", "See a doctor"],
        "warning_signs":       ["Difficulty breathing", "Chest pain", "High fever"],
        "seek_care":           "Consult a doctor as soon as possible.",
        "treatments":          [],
        "severity_level":      "moderate",
        "top_match":           {},
        "disclaimer":          "AI analysis unavailable. Please seek professional medical advice.",
    }


# ── 2. Medical Report Text Analysis ──────────────────────────────────────────

_NUMBER_RE = re.compile(r'[-+]?\d+\.?\d*')


def _extract_value(text: str) -> float | None:
    """Pull the first number found in a string."""
    m = _NUMBER_RE.search(text)
    return float(m.group()) if m else None


def _interpret_value(row: dict, value: float) -> str:
    """Return 'low', 'normal', 'high', or 'critical_low'/'critical_high'.
    Uses XGBoost report model when available; falls back to threshold rules."""
    def _num(key: str) -> float | None:
        raw = row.get(key, "").replace("N/A", "").strip()
        if not raw:
            return None
        m = _NUMBER_RE.search(raw)
        return float(m.group()) if m else None

    crit_low  = _num("critical_low")
    crit_high = _num("critical_high")

    # Parse normal range "X-Y" or ">X" or "<X"
    normal_raw = row.get("normal_range", "").strip()
    low_normal = high_normal = None

    range_match = re.match(r'([\d.]+)\s*[-–]\s*([\d.]+)', normal_raw)
    gt_match    = re.match(r'>[\s]*([\d.]+)', normal_raw)
    lt_match    = re.match(r'<[\s]*([\d.]+)', normal_raw)

    if range_match:
        low_normal  = float(range_match.group(1))
        high_normal = float(range_match.group(2))
    elif gt_match:
        low_normal = float(gt_match.group(1))
    elif lt_match:
        high_normal = float(lt_match.group(1))

    # ── XGBoost path ──────────────────────────────────────────────────────────
    xgb_status = predict_report_status(value, low_normal, high_normal, crit_low, crit_high)
    if xgb_status is not None:
        return xgb_status

    # ── Rule-based fallback ────────────────────────────────────────────────────
    if crit_low is not None and value < crit_low:
        return "critical_low"
    if crit_high is not None and value > crit_high:
        return "critical_high"
    if low_normal is not None and high_normal is not None:
        if value < low_normal:
            return "low"
        if value > high_normal:
            return "high"
        return "normal"
    if low_normal is not None:
        return "normal" if value >= low_normal else "low"
    if high_normal is not None:
        return "normal" if value <= high_normal else "high"
    return "normal"


def analyze_report_text(report_text: str) -> dict[str, Any]:
    """
    Parse free-text from a medical report (lab results, CBC, metabolic panel, etc.)
    and return structured findings with interpretations and advice.

    Supports patterns like:
      "Hemoglobin: 9.2 g/dL"
      "HbA1c = 7.8%"
      "WBC 3200"
      "Platelet count 45000"
    """
    if not _report_db:
        return {"findings": [], "summary": "Report database unavailable.", "abnormal_count": 0}

    findings: list[dict] = []
    abnormal_count = 0
    critical_flags: list[str] = []

    # Build candidate patterns from DB keys sorted longest-first (avoid partial matches)
    sorted_keys = sorted(_report_db.keys(), key=len, reverse=True)

    text_lower = report_text.lower()

    matched_params: set[str] = set()

    for param_key in sorted_keys:
        row = _report_db[param_key]
        canonical_name = row.get("parameter", param_key).strip()

        if canonical_name in matched_params:
            continue

        # Build a flexible regex: allow optional punctuation and spaces
        escaped = re.escape(param_key)
        pattern = re.compile(
            rf'{escaped}\s*[:\-=]?\s*([\d.]+)',
            re.IGNORECASE
        )
        match = pattern.search(text_lower)
        if not match:
            continue

        matched_params.add(canonical_name)
        raw_value_str = match.group(1)
        value = _extract_value(raw_value_str)
        if value is None:
            continue

        status = _interpret_value(row, value)
        unit   = row.get("unit", "")

        finding: dict = {
            "parameter":    canonical_name,
            "value":        value,
            "unit":         unit,
            "normal_range": row.get("normal_range", ""),
            "status":       status,
            "category":     row.get("category", ""),
            "interpretation": "",
            "advice":       "",
        }

        if status in ("low", "critical_low"):
            finding["interpretation"] = row.get("low_interpretation", "Below normal range")
            finding["advice"]         = row.get("advice_low", "Consult your doctor")
            abnormal_count += 1
            if status == "critical_low":
                critical_flags.append(f"{canonical_name} critically low ({value} {unit})")
        elif status in ("high", "critical_high"):
            finding["interpretation"] = row.get("high_interpretation", "Above normal range")
            finding["advice"]         = row.get("advice_high", "Consult your doctor")
            abnormal_count += 1
            if status == "critical_high":
                critical_flags.append(f"{canonical_name} critically high ({value} {unit})")
        else:
            finding["interpretation"] = "Within normal range"
            finding["advice"]         = "No action required — maintain healthy habits"

        # ── Dataset-sourced treatment suggestion for abnormal findings ────────
        # Map common lab parameters to conditions in diseases_treatments.csv
        _PARAM_TO_DISEASE: dict[str, str] = {
            "hemoglobin": "Anemia",
            "hba1c":      "Type 2 Diabetes",
            "hba1c (glycated hemoglobin)": "Type 2 Diabetes",
            "fasting blood glucose": "Type 2 Diabetes",
            "total cholesterol": "Hypertension",
            "ldl":        "Hypertension",
            "triglycerides": "Hypertension",
            "tsh":        "Hypothyroidism",
            "tsh (thyroid stimulating hormone)": "Hypothyroidism",
            "t4":         "Hypothyroidism",
            "serum creatinine": "Chronic Kidney Disease",
            "urea":       "Chronic Kidney Disease",
            "uric acid":  "Gout",
            "serum uric acid": "Gout",
            "vitamin d":  "Vitamin D Deficiency",
            "vitamin d (25-oh)": "Vitamin D Deficiency",
            "vitamin b12": "Anemia",
            "ferritin":   "Anemia",
            "iron":       "Anemia",
            "wbc":        "Common Cold",
            "wbc (white blood cells)": "Common Cold",
            "platelet":   "Dengue Fever",
            "alt":        "Hepatitis A",
            "ast":        "Hepatitis A",
            "bilirubin":  "Hepatitis A",
            "serum sodium": "Dehydration",
            "serum potassium": "Dehydration",
            "calcium":    "Osteoporosis",
        }
        if status not in ("normal",):
            param_lower = canonical_name.lower()
            mapped_disease = _PARAM_TO_DISEASE.get(param_lower)
            if mapped_disease:
                tx = _get_treatment(mapped_disease)
                if tx:
                    finding["related_disease"]   = mapped_disease
                    finding["treatment_guidance"] = {
                        "first_line":     tx.get("first_line_treatment", ""),
                        "medications":    tx.get("medications", ""),
                        "home_remedies":  tx.get("home_remedies", ""),
                        "lifestyle":      tx.get("lifestyle_changes", ""),
                        "specialist":     tx.get("specialist", ""),
                    }

        findings.append(finding)

    # ── Summary ───────────────────────────────────────────────────────────────
    if not findings:
        summary = (
            "No recognisable lab parameters were found in the report text. "
            "Please paste values in the format: 'Parameter: value unit' (e.g., Hemoglobin: 12.5 g/dL)."
        )
    elif critical_flags:
        summary = (
            f"⚠️ CRITICAL VALUES DETECTED: {'; '.join(critical_flags)}. "
            "Please seek immediate medical attention."
        )
    elif abnormal_count > 0:
        summary = (
            f"{abnormal_count} abnormal value(s) found out of {len(findings)} parameters analysed. "
            "Please review the highlighted results with your healthcare provider."
        )
    else:
        summary = (
            f"All {len(findings)} parameter(s) analysed are within normal range. "
            "Continue regular health monitoring."
        )

    # Sort: critical first, then abnormal, then normal
    order = {"critical_low": 0, "critical_high": 0, "low": 1, "high": 1, "normal": 2}
    findings.sort(key=lambda f: order.get(f["status"], 2))

    return {
        "findings":       findings,
        "summary":        summary,
        "abnormal_count": abnormal_count,
        "critical_flags": critical_flags,
        "total_analysed": len(findings),
        "disclaimer": (
            "This automated report analysis is for informational purposes only. "
            "A licensed medical professional must interpret all lab results in clinical context."
        ),
    }


# ── 3. Chat Response Engine ───────────────────────────────────────────────────

# ── Intent patterns (order matters — first match wins) ────────────────────────
# treatment_request must come BEFORE medication so "medicines for headache"
# is caught as a treatment query, not a generic medication lookup.
_INTENT_PATTERNS: list[tuple[re.Pattern, str]] = [
    # Greetings
    (re.compile(
        r'\b(hi|hello|hey|good morning|good evening|good afternoon|howdy|greetings|namaste|sup|hii+|helo)\b',
        re.I), 'greeting'),

    # Emergencies — checked early so they are never overridden
    (re.compile(
        r'\b(emergency|911|112|ambulance|urgent|dying|unconscious|not breathing|heart attack|stroke|seizure|overdose|poisoning)\b',
        re.I), 'emergency'),

    # Treatment / remedy request: "medicines for X", "remedy for X", "treatment of X",
    # "what should I take for X", "how to cure X", "how to treat X"
    (re.compile(
        r'\b(medicine[s]?\s+for|drug[s]?\s+for|tablet[s]?\s+for|remedy\s+for|remedies\s+for'
        r'|treatment\s+(of|for)|treat\s+|cure\s+|what\s+(to\s+take|should\s+i\s+take)'
        r'|how\s+to\s+(treat|cure|manage|relieve|reduce|stop|get\s+rid\s+of)'
        r'|relief\s+from|home\s+remedy|natural\s+remedy)\b',
        re.I), 'treatment_request'),

    # Specific medicine lookup — only when user names a medicine explicitly
    (re.compile(
        r'\b(side[\s\-]?effects?\s+of|uses\s+of|dosage\s+of|composition\s+of|price\s+of'
        r'|what\s+is\s+[a-z]+\s*(tablet|capsule|injection|syrup|mg|mcg)'
        r'|tell\s+me\s+about\s+[a-z]+\s*(tablet|capsule)'
        r'|information\s+on|info\s+on)\b',
        re.I), 'medication'),

    # Mental health — checked BEFORE symptoms so "feeling depressed/anxious" hits here
    (re.compile(
        r'\b(mental\s+health|stress|anxiety|depress(ed|ion)?|sad(ness)?|mood\s+swing'
        r'|insomnia|can\'t\s+sleep|panic\s+attack|overthinking|burnout|trauma|ptsd'
        r'|feel\s+(hopeless|worthless|lonely|empty)|suicid)\b',
        re.I), 'mental_health'),

    # Symptom descriptions
    (re.compile(
        r'\b(symptom|i\s+have|i\s+am\s+having|i\s+feel|i\s+am\s+feeling|feeling|experiencing'
        r'|suffering\s+from|i\s+got|diagnosed\s+with|came\s+down\s+with'
        r'|my\s+\w+\s+(hurts?|is\s+hurting|is\s+paining|aches?|is\s+aching)'
        r'|headache|fever|cough|cold|vomit|diarrhea|diarrhoea|nausea|fatigue|tired'
        r'|body\s+ache|sore\s+throat|runny\s+nose|stomach\s+pain|back\s+pain|joint\s+pain'
        r'|chest\s+pain|shortness\s+of\s+breath|dizziness|swelling|rash|itching|burning)\b',
        re.I), 'symptoms'),

    # Hospital / doctor finder
    (re.compile(
        r'\b(hospital|clinic|doctor|physician|specialist|find\s+.*doctor|nearby\s+.*care'
        r'|nearest\s+.*hospital|where\s+.*doctor|book\s+.*appointment)\b',
        re.I), 'hospital'),

    # Medical reports / lab tests
    (re.compile(
        r'\b(report|lab\s+result|test\s+result|blood\s+test|cbc|lft|kft|lipid\s+profile'
        r'|urine\s+test|x[\s\-]?ray|mri|ct\s+scan|ultrasound|ecg|echo|biopsy'
        r'|interpret|understand\s+my\s+report|what\s+does\s+my\s+report)\b',
        re.I), 'report'),

    # Medicine reminders / schedule
    (re.compile(
        r'\b(reminder|remind\s+me|set\s+.*alarm|medicine\s+schedule|when\s+to\s+take'
        r'|medication\s+time|dose\s+time|pill\s+reminder|missed\s+.*dose)\b',
        re.I), 'reminder'),

    # Nutrition / diet
    (re.compile(
        r'\b(diet|food|nutrition|eat|drink|weight\s+loss|weight\s+gain|bmi|calorie'
        r'|healthy\s+eating|what\s+to\s+eat|avoid\s+.*food|good\s+food\s+for)\b',
        re.I), 'nutrition'),

    # Exercise / fitness
    (re.compile(
        r'\b(exercise|workout|fitness|walk(ing)?|yoga|gym|physical\s+activity|running|cycling'
        r'|how\s+(many|much)\s+exercise|is\s+.*exercise\s+good)\b',
        re.I), 'exercise'),

    # Diabetes
    (re.compile(
        r'\b(diabetes|diabetic|blood\s+sugar|glucose\s+level|insulin|hba1c|fasting\s+sugar'
        r'|type\s+[12]\s+diabetes|sugar\s+level|hyperglycemia|hypoglycemia)\b',
        re.I), 'diabetes'),

    # Blood pressure
    (re.compile(
        r'\b(blood\s+pressure|hypertension|high\s+bp|low\s+bp|bp\s+is|systolic|diastolic'
        r'|bp\s+reading|pressure\s+is|mmhg)\b',
        re.I), 'blood_pressure'),

    # Heart
    (re.compile(
        r'\b(heart|cardiac|palpitation|cholesterol|triglyceride|artery|ecg\s+result'
        r'|heart\s+(rate|beat|problem|disease|attack|failure)|cardiovascular)\b',
        re.I), 'heart'),

    # COVID
    (re.compile(
        r'\b(covid|corona(virus)?|omicron|delta\s+variant|vaccination|vaccine|booster'
        r'|covid\s+test|pcr\s+test|covid\s+positive|long\s+covid)\b',
        re.I), 'covid'),

    # Pregnancy
    (re.compile(
        r'\b(pregnan(t|cy)|trimester|prenatal|antenatal|fetal|fetus|labour|delivery'
        r'|morning\s+sickness|gestational|postpartum|breastfeed)\b',
        re.I), 'pregnancy'),

    # Paediatric
    (re.compile(
        r'\b(child(ren)?|kid|infant|toddler|baby|newborn|paediatric|pediatric'
        r'|child\'?s\s+health|my\s+(son|daughter|kid)\s+(has|is))\b',
        re.I), 'pediatric'),

    # Skin
    (re.compile(
        r'\b(skin|rash|itch(ing)?|acne|pimple|eczema|psoriasis|allergy|hive|urticaria'
        r'|wound|cut|bruise|blister|sunburn|fungal\s+infection|dandruff)\b',
        re.I), 'skin'),

    # Closing / thanks
    (re.compile(
        r'\b(thank(s| you)?|bye|goodbye|great|that\s+helped|helpful|got\s+it|ok\s+thanks'
        r'|awesome|perfect|wonderful|appreciate)\b',
        re.I), 'closing'),

    # General medicine info (fallback after treatment_request)
    (re.compile(
        r'\b(medicine|medication|drug|pill|tablet|capsule|syrup|injection|antibiotic'
        r'|painkiller|prescription|over\s+the\s+counter|otc|generic)\b',
        re.I), 'medication'),

    # Education / explanation
    (re.compile(
        r'\b(what\s+is|what\s+are|what\s+causes|how\s+(does|do|is|are)|why\s+(do|does|is)'
        r'|explain|tell\s+me|define|meaning\s+of|difference\s+between|what\s+happens)\b',
        re.I), 'education'),
]


def _detect_intent(message: str) -> str:
    # ── XGBoost path ──────────────────────────────────────────────────────────
    xgb_intent = predict_intent(message)
    if xgb_intent is not None:
        # Always trust the regex for emergency — safety critical
        for pattern, intent in _INTENT_PATTERNS:
            if intent == 'emergency' and pattern.search(message):
                return 'emergency'
        return xgb_intent

    # ── Regex fallback ────────────────────────────────────────────────────────
    for pattern, intent in _INTENT_PATTERNS:
        if pattern.search(message):
            return intent
    return 'general'


# ── Symptom → Disease treatment lookup for natural queries ───────────────────
# Maps common symptom keywords to disease names in the treatment DB
_SYMPTOM_KEYWORD_MAP: dict[str, str] = {
    'headache':         'Migraine',
    'migraine':         'Migraine',
    'fever':            'Influenza (Flu)',
    'cold':             'Common Cold',
    'cough':            'Common Cold',
    'dry cough':        'COVID-19',
    'wet cough':        'Common Cold',
    'phlegm':           'Bronchitis',
    'mucus':            'Bronchitis',
    'sore throat':      'Common Cold',
    'throat pain':      'Common Cold',
    'throat ache':      'Common Cold',
    'tonsil':           'Common Cold',
    'stomach pain':     'Gastritis',
    'stomach ache':     'Gastritis',
    'acidity':          'GERD',
    'acid reflux':      'GERD',
    'heartburn':        'GERD',
    'diarrhea':         'Food Poisoning',
    'diarrhoea':        'Food Poisoning',
    'vomiting':         'Gastritis',
    'nausea':           'Gastritis',
    'back pain':        'Osteoarthritis',
    'joint pain':       'Rheumatoid Arthritis',
    'knee pain':        'Osteoarthritis',
    'skin rash':        'Eczema',
    'itching':          'Urticaria (Hives)',
    'hives':            'Urticaria (Hives)',
    'allergy':          'Allergic Rhinitis',
    'sneezing':         'Allergic Rhinitis',
    'runny nose':       'Common Cold',
    'blocked nose':     'Sinusitis',
    'sinus':            'Sinusitis',
    'high bp':          'Hypertension',
    'high blood pressure': 'Hypertension',
    'diabetes':         'Type 2 Diabetes',
    'blood sugar':      'Type 2 Diabetes',
    'thyroid':          'Hypothyroidism',
    'anxiety':          'Anxiety Disorder',
    'depression':       'Depression',
    'stress':           'Anxiety Disorder',
    'insomnia':         'Insomnia',
    'sleep problem':    'Insomnia',
    'can\'t sleep':     'Insomnia',
    'uti':              'Urinary Tract Infection',
    'urinary infection':'Urinary Tract Infection',
    'kidney stone':     'Kidney Stones',
    'kidney stones':    'Kidney Stones',
    'dengue':           'Dengue Fever',
    'malaria':          'Malaria',
    'typhoid':          'Typhoid Fever',
    'tb':               'Tuberculosis',
    'tuberculosis':     'Tuberculosis',
    'covid':            'COVID-19',
    'corona':           'COVID-19',
    'pneumonia':        'Pneumonia',
    'asthma':           'Asthma',
    'breathing problem':'Asthma',
    'wheezing':         'Asthma',
    'constipation':     'Constipation',
    'piles':            'Hemorrhoids',
    'hemorrhoids':      'Hemorrhoids',
    'gout':             'Gout',
    'uric acid':        'Gout',
    'psoriasis':        'Psoriasis',
    'chickenpox':       'Chickenpox',
    'chicken pox':      'Chickenpox',
    'measles':          'Measles',
    'eye problem':      'Conjunctivitis',
    'red eyes':         'Conjunctivitis',
    'ear pain':         'Otitis Media',
    'ear ache':         'Otitis Media',
    'dizziness':        'Vertigo',
    'vertigo':          'Vertigo',
    'dehydration':      'Dehydration',
    'weakness':         'Anemia',
    'fatigue':          'Chronic Fatigue Syndrome',
    'low haemoglobin':  'Anemia',
    'anemia':           'Anemia',
    'anaemia':          'Anemia',
    'cholesterol':      'Hypertension',
    'jaundice':         'Hepatitis A',
    'liver problem':    'Hepatitis B',
    'fatty liver':      'Fatty Liver Disease',
    'obesity':          'Type 2 Diabetes',
    'overweight':       'Type 2 Diabetes',
    'pcod':             'Polycystic Ovary Syndrome',
    'pcos':             'Polycystic Ovary Syndrome',
    'periods problem':  'Polycystic Ovary Syndrome',
    'irregular periods':'Polycystic Ovary Syndrome',
    'bone pain':        'Osteoporosis',
    'weak bones':       'Osteoporosis',
    'parkinsons':       'Parkinson\'s Disease',
    'alzheimers':       'Alzheimer\'s Disease',
    'memory loss':      'Alzheimer\'s Disease',
    'seizure':          'Epilepsy',
    'epilepsy':         'Epilepsy',
    'leukemia':         'Leukemia',
    'cancer':           'Breast Cancer',
    'sepsis':           'Sepsis',
    'heat stroke':      'Heat Stroke',
    'sunstroke':        'Heat Stroke',
    'food poisoning':   'Food Poisoning',
    'mumps':            'Mumps',
    'shingles':         'Shingles',
    'fungal':           'Fungal Infection',
    'ringworm':         'Fungal Infection',
    'scabies':          'Scabies',
    'sleep apnea':      'Sleep Apnea',
    'snoring':          'Sleep Apnea',
    'fibromyalgia':     'Fibromyalgia',
    'lupus':            'Lupus',
    'crohn':            'Crohn\'s Disease',
    'ibs':              'Irritable Bowel Syndrome',
    'irritable bowel':  'Irritable Bowel Syndrome',
    'ulcer':            'Peptic Ulcer',
    'peptic ulcer':     'Peptic Ulcer',
    'appendix':         'Appendicitis',
    'gallstone':        'Gallstones',
    'pancreatitis':     'Pancreatitis',
    'celiac':           'Celiac Disease',
}


def _treatment_request_response(message: str) -> str | None:
    """
    Handle natural treatment queries: "medicines for headache", "how to treat fever",
    "home remedies for cold", "what to take for stomach pain".
    Returns a formatted response string, or None if no match found.
    """
    msg_lower = message.lower()

    # Try symptom keyword map first (longest match wins)
    matched_disease = None
    matched_kw = ""
    for kw in sorted(_SYMPTOM_KEYWORD_MAP.keys(), key=len, reverse=True):
        if kw in msg_lower:
            disease_name = _SYMPTOM_KEYWORD_MAP[kw]
            tx = _treatment_db.get(disease_name.lower())
            if tx:
                matched_disease = tx
                matched_kw = kw
                break

    # If no keyword match, fall back to disease name lookup
    if not matched_disease:
        matched_disease = _disease_from_message(message)

    if not matched_disease:
        return None

    disease = matched_disease.get("disease", "this condition")
    lines = [f"Here's guidance for **{disease}**:\n"]

    # Is this a home remedy question?
    wants_home_remedy = bool(re.search(
        r'\b(home\s+remedy|natural\s+remedy|without\s+medicine|without\s+medication'
        r'|herbal|ayurvedic|gharelu|natural\s+treatment)\b',
        msg_lower, re.I
    ))

    if wants_home_remedy:
        if matched_disease.get("home_remedies"):
            lines.append(f"**Home remedies:**\n• " + "\n• ".join(
                r.strip() for r in matched_disease["home_remedies"].split(",") if r.strip()
            ))
        if matched_disease.get("lifestyle_changes"):
            lines.append(f"\n**Lifestyle changes:**\n• " + "\n• ".join(
                r.strip() for r in matched_disease["lifestyle_changes"].split(",") if r.strip()
            ))
    else:
        if matched_disease.get("first_line_treatment"):
            lines.append(f"**First-line treatment:** {matched_disease['first_line_treatment']}")
        if matched_disease.get("medications"):
            lines.append(f"\n**Common medications:** {matched_disease['medications']}")
        if matched_disease.get("home_remedies"):
            lines.append(f"\n**Home remedies:** {matched_disease['home_remedies']}")
        if matched_disease.get("specialist"):
            lines.append(f"\n**See a:** {matched_disease['specialist']}")

    emergency_signs = matched_disease.get("emergency_signs", "")
    if emergency_signs and emergency_signs.upper() != "NONE":
        lines.append(f"\n⚠️ **Seek emergency care if:** {emergency_signs}")

    lines.append(
        "\n\n💊 For a personalised treatment plan, use **Health Analysis** to enter your "
        "full symptoms, age, and medical history.\n"
        "⚠️ Always consult a doctor before starting any medication."
    )
    return "\n".join(lines)


def _disease_from_message(message: str) -> dict | None:
    """
    Return a treatment DB row if the message mentions a known disease.
    Pass 1 — exact substring (longest names first).
    Pass 2 — keyword match: every significant word (5+ chars) in the
              disease name appears as a word token in the message.
    """
    msg_lower = message.lower()
    msg_tokens = set(re.findall(r'[a-z]+', msg_lower))

    # Pass 1: exact substring
    for name in sorted(_treatment_db.keys(), key=len, reverse=True):
        if name in msg_lower:
            return _treatment_db[name]

    # Pass 2: keyword overlap (handles "diabetes" → "type 2 diabetes")
    STOPWORDS = {'disease', 'fever', 'syndrome', 'disorder', 'type',
                 'acute', 'chronic', 'viral', 'bacterial', 'common', 'infection'}
    for name, row in _treatment_db.items():
        keywords = [
            w for w in re.findall(r'[a-z]+', name)
            if len(w) >= 5 and w not in STOPWORDS
        ]
        if keywords and all(kw in msg_tokens for kw in keywords):
            return row

    return None


def _format_treatment_reply(tx: dict) -> str:
    disease = tx.get("disease", "this condition")
    lines = [f"Here's what I know about **{disease}**:\n"]

    if tx.get("first_line_treatment"):
        lines.append(f"**First-line treatment:** {tx['first_line_treatment']}")
    if tx.get("medications"):
        lines.append(f"**Common medications:** {tx['medications']}")
    if tx.get("home_remedies"):
        lines.append(f"**Home remedies:** {tx['home_remedies']}")
    if tx.get("lifestyle_changes"):
        lines.append(f"**Lifestyle changes:** {tx['lifestyle_changes']}")
    if tx.get("specialist"):
        lines.append(f"**Recommended specialist:** {tx['specialist']}")
    if tx.get("emergency_signs"):
        lines.append(f"**Seek emergency care if:** {tx['emergency_signs']}")
    if tx.get("prognosis"):
        lines.append(f"**Outlook:** {tx['prognosis']}")
    if tx.get("duration"):
        lines.append(f"**Typical duration:** {tx['duration']}")

    lines.append(
        "\n⚠️ This is general information only. Always consult a qualified doctor "
        "before starting or changing any treatment."
    )
    return "\n".join(lines)


_INTENT_RESPONSES: dict[str, str] = {
    'greeting': (
        "Hello! 👋 I'm **MedSense AI**, your personal health companion.\n\n"
        "Here's what I can help you with:\n"
        "• 🩺 **Symptom checking** — describe how you feel\n"
        "• 💊 **Medicines & treatments** — 'medicines for headache', 'treatment for fever'\n"
        "• 🧪 **Lab report analysis** — paste your test values\n"
        "• 🏥 **Hospital finder** — locate nearby care\n"
        "• 📅 **Medicine reminders** — never miss a dose\n"
        "• 🧠 **Health education** — understand any medical topic\n\n"
        "What can I help you with today?"
    ),
    'hospital': (
        "To find hospitals and clinics near you, use the **Hospital Finder** from the sidebar.\n\n"
        "It shows nearby healthcare facilities on a map with directions and contact details.\n\n"
        "🚨 For emergencies, **call 911 (US) / 112 (India/EU) immediately** — do not wait."
    ),
    'nutrition': (
        "Good nutrition is foundational to health. Key principles:\n"
        "• Fill half your plate with **fruits and vegetables**\n"
        "• Choose **whole grains** over refined carbs\n"
        "• Include lean protein (fish, legumes, eggs) at every meal\n"
        "• Limit processed foods, sugar, and saturated fats\n"
        "• Drink **8+ glasses of water** daily\n"
        "• Limit salt to less than 5g per day\n\n"
        "Would you like specific dietary guidance for a health condition (diabetes, hypertension, PCOS, etc.)? Just ask!"
    ),
    'exercise': (
        "Regular physical activity is one of the most powerful medicines. **WHO recommends:**\n"
        "• **Adults:** 150–300 min of moderate aerobic activity per week\n"
        "• **Strength training:** 2+ days per week\n"
        "• **Reduce sitting time** — even light movement helps\n\n"
        "Good starting options: brisk walking, swimming, cycling, or yoga.\n\n"
        "💡 Tip: Use the **Health Analysis** page to get personalised exercise advice based on your conditions."
    ),
    'mental_health': (
        "Mental health is just as important as physical health. Some evidence-based strategies:\n"
        "• **Exercise** — even 30 min walking significantly reduces anxiety and depression\n"
        "• **Sleep hygiene** — consistent 7–8 hour sleep schedule\n"
        "• **Mindfulness meditation** — 10 min daily makes a measurable difference\n"
        "• **Social connection** — talk to someone you trust\n"
        "• **Limit alcohol and caffeine**\n"
        "• **Journaling** — writing down thoughts reduces rumination\n\n"
        "If you're struggling significantly, please speak to a **psychiatrist or psychologist**.\n\n"
        "🆘 If you're having thoughts of self-harm, contact a crisis helpline immediately:\n"
        "• **India:** iCall 9152987821\n"
        "• **US:** 988 Suicide & Crisis Lifeline (call/text 988)"
    ),
    'diabetes': (
        "Managing diabetes effectively:\n"
        "• **Monitor blood glucose** regularly (target fasting: 70–130 mg/dL)\n"
        "• **HbA1c goal:** below 7% for most adults\n"
        "• **Diet:** low glycemic index foods, limit sugar and refined carbs\n"
        "• **Exercise:** 30 min daily improves insulin sensitivity significantly\n"
        "• **Medication:** take as prescribed (Metformin is usually first-line)\n"
        "• **Annual check-ups:** eye, kidney, and foot exams\n\n"
        "💡 Upload your blood sugar report to the **Medical Reports** page for AI interpretation.\n"
        "Want to check specific symptoms or understand a lab value? Just ask!"
    ),
    'blood_pressure': (
        "**Blood pressure categories:**\n"
        "• Normal: below 120/80 mmHg\n"
        "• Elevated: 120–129 / <80 mmHg\n"
        "• High Stage 1: 130–139 / 80–89 mmHg\n"
        "• High Stage 2: 140+ / 90+ mmHg — needs medication\n\n"
        "**Lifestyle approaches:**\n"
        "• DASH diet (low sodium, rich in fruits/vegetables)\n"
        "• Limit salt to < 2g/day\n"
        "• Regular aerobic exercise (30 min, 5x/week)\n"
        "• Limit alcohol, quit smoking\n"
        "• Stress management — yoga, meditation\n\n"
        "If BP is consistently above 140/90, see a **Cardiologist** for medication."
    ),
    'heart': (
        "**Heart health essentials:**\n"
        "• Know your numbers: blood pressure, cholesterol, blood sugar, BMI\n"
        "• **Diet:** Mediterranean or DASH diet — fish, olive oil, vegetables\n"
        "• **Exercise:** 150 min moderate activity per week\n"
        "• **Quit smoking** — single most impactful change you can make\n"
        "• **Limit alcohol** — no more than 1–2 drinks per day\n\n"
        "⚠️ **Seek emergency care immediately for:**\n"
        "• Chest pain or pressure\n"
        "• Pain radiating to arm, jaw, or back\n"
        "• Sudden shortness of breath with cold sweating\n"
        "These may be signs of a **heart attack — call 911 / 112 now**."
    ),
    'covid': (
        "**COVID-19 guidance:**\n"
        "• **Symptoms:** fever, dry cough, fatigue, loss of taste/smell, shortness of breath\n"
        "• **If positive:** isolate for at least 5 days, monitor symptoms\n"
        "• **Treatment:** rest, hydration, Paracetamol for fever\n"
        "• **Monitor SpO2:** seek care if oxygen saturation drops below 94%\n"
        "• **Vaccination** remains the best protection against severe disease\n\n"
        "Consult a doctor if symptoms are severe or you are high-risk (elderly, immunocompromised)."
    ),
    'pregnancy': (
        "During pregnancy, always consult your **OB/GYN** for medical advice. General guidance:\n"
        "• Attend all scheduled **prenatal visits**\n"
        "• Take prescribed **folic acid** and prenatal vitamins\n"
        "• Avoid alcohol, smoking, and unprescribed medications\n"
        "• Eat a balanced diet rich in iron, calcium, and folate\n\n"
        "⚠️ **Warning signs — go to hospital immediately:**\n"
        "• Severe headache or vision changes\n"
        "• Severe swelling of face or hands\n"
        "• Reduced or absent fetal movement\n"
        "• Heavy bleeding"
    ),
    'pediatric': (
        "For children's health, I strongly recommend consulting a **Paediatrician** — "
        "dosing, normal ranges, and symptoms differ significantly from adults.\n\n"
        "Common childhood conditions I can help with:\n"
        "• Fever management in children\n"
        "• Cold, cough and ear infections\n"
        "• Vaccination schedules\n"
        "• Growth and nutrition\n\n"
        "Just describe your child's symptoms and age and I'll give you guidance.\n"
        "🚨 For any child emergency, call 911 immediately."
    ),
    'skin': (
        "Common skin conditions:\n"
        "• **Eczema/Dermatitis:** moisturise frequently, avoid triggers, mild soaps; Hydrocortisone cream for flares\n"
        "• **Acne:** gentle cleanser twice daily, avoid picking, Benzoyl peroxide or Salicylic acid topically\n"
        "• **Hives/Urticaria:** antihistamines (Cetirizine 10mg), identify and avoid triggers\n"
        "• **Fungal infection:** antifungal cream (Clotrimazole), keep area dry\n"
        "• **Psoriasis:** requires Dermatologist — topical steroids, phototherapy\n\n"
        "⚠️ See a doctor today for any rash that spreads rapidly, is painful, or comes with fever."
    ),
    'closing': (
        "You're welcome! Take care of yourself 🌿\n\n"
        "Remember — I'm here 24/7 for any health questions. Stay healthy!\n\n"
        "Quick access to features:\n"
        "• 🩺 Health Analysis — for symptom checking\n"
        "• 🏥 Hospital Finder — for nearby care\n"
        "• 📋 Medical Reports — for lab analysis\n"
        "• 💊 Medicines — for reminders"
    ),
    'emergency': (
        "🚨 **If this is a medical emergency, call 911 (US) or 112 (India/EU) immediately.**\n\n"
        "**Signs requiring emergency care:**\n"
        "• Chest pain or pressure\n"
        "• Difficulty breathing or gasping\n"
        "• Sudden face drooping, arm weakness, or slurred speech (stroke)\n"
        "• Loss of consciousness or unresponsiveness\n"
        "• Severe bleeding that won't stop\n"
        "• Throat swelling or severe allergic reaction (anaphylaxis)\n"
        "• Seizure lasting more than 5 minutes\n\n"
        "**Please do not wait — call emergency services NOW.**\n\n"
        "India: 108 (ambulance) | 102 (medical) | 112 (general emergency)"
    ),
    'reminder': (
        "You can manage your medicine reminders in the **Medicines** section of the dashboard.\n\n"
        "**What you can do:**\n"
        "• Add new medicines with dose and timing\n"
        "• Set multiple daily reminders\n"
        "• Track taken / missed doses\n"
        "• Get SMS alerts (if phone is configured)\n\n"
        "→ Go to the **Medicine Reminders** page from the sidebar to set up your schedule."
    ),
    'report': (
        "You can upload your medical reports (PDF, JPG, PNG) in the **Medical Reports** section.\n\n"
        "**The AI will automatically:**\n"
        "• Extract text from your PDF\n"
        "• Identify all lab parameters (CBC, LFT, KFT, thyroid, lipids, etc.)\n"
        "• Flag abnormal and critical values\n"
        "• Give interpretation and advice for each result\n\n"
        "You can also **paste your lab values directly here** in this format:\n"
        "`Hemoglobin: 11.2 g/dL`\n"
        "`WBC: 9500`\n"
        "`HbA1c: 6.8 %`\n\n"
        "→ Go to the **Medical Reports** page to upload and analyse your report."
    ),
    'medication': (
        "I can look up detailed information about **11,000+ medicines** — uses, side effects, composition, manufacturer, and price.\n\n"
        "Just ask me specifically, for example:\n"
        "• *'What is Augmentin?'*\n"
        "• *'Side effects of Metformin'*\n"
        "• *'Tell me about Paracetamol 500mg tablet'*\n"
        "• *'Uses of Azithromycin'*\n\n"
        "For **treatment recommendations** (what medicines to take for a condition), ask:\n"
        "• *'Medicines for headache'*\n"
        "• *'Treatment for fever'*\n"
        "• *'Home remedies for cold'*\n\n"
        "⚠️ Always take medications as prescribed by your doctor. Do not self-medicate with antibiotics."
    ),
    'education': (
        "I'm happy to explain any medical term, condition, or health topic.\n\n"
        "For example:\n"
        "• *'What is HbA1c?'*\n"
        "• *'How does insulin resistance work?'*\n"
        "• *'What causes high blood pressure?'*\n"
        "• *'What is the difference between Type 1 and Type 2 diabetes?'*\n"
        "• *'What does a high WBC count mean?'*\n\n"
        "Just ask your question and I'll give you a clear, easy-to-understand explanation."
    ),
    'symptoms': (
        "I'd be happy to help assess your symptoms.\n\n"
        "**For the most accurate analysis**, use the **Health Analysis** page where you can enter:\n"
        "• Symptoms in detail\n"
        "• Duration and severity\n"
        "• Age and medical history\n"
        "• Current medications\n\n"
        "Or describe your symptoms right here and I'll give you an initial assessment.\n"
        "For example: *'I have fever, body ache and sore throat for 2 days'*"
    ),
    'treatment_request': (
        "I can help with treatment and medicine information.\n\n"
        "Please tell me **which condition or symptom** you need help with, for example:\n"
        "• *'Medicines for headache'*\n"
        "• *'Treatment for fever'*\n"
        "• *'Home remedies for cold'*\n"
        "• *'What to take for stomach pain'*\n"
        "• *'How to treat diabetes'*\n\n"
        "I have treatment data for **50+ conditions** including first-line treatments, common medicines, home remedies, and when to see a doctor."
    ),
    'general': (
        "I'm MedSense AI — your 24/7 health companion. Here's what I can do:\n\n"
        "• 🩺 **Symptom checking** — *'I have fever and sore throat'*\n"
        "• 💊 **Treatment info** — *'Medicines for headache'*, *'Treatment for cold'*\n"
        "• 💊 **Medicine lookup** — *'Side effects of Metformin'*\n"
        "• 🧪 **Lab report analysis** — paste values like `Hemoglobin: 10.2`\n"
        "• 🏥 **Hospital finder** — locate nearby care\n"
        "• 📅 **Medicine reminders** — manage your medication schedule\n"
        "• 🧠 **Health education** — *'What is HbA1c?'*, *'What causes hypertension?'*\n\n"
        "What would you like help with?"
    ),
}


def _medicine_from_message(message: str) -> dict | None:
    """
    Return a medicine detail dict if the message asks about a specific named medicine.
    Only used when intent is 'medication' (explicit medicine lookup), NOT treatment requests.
    """
    msg_lower = message.lower()

    # Explicit question patterns — extract the medicine name after the trigger phrase
    triggers = [
        r'(?:side[\s-]?effects?\s+of|uses\s+of|dosage\s+of|what\s+is|tell\s+me\s+about'
        r'|information\s+on|info\s+on|composition\s+of|price\s+of|cost\s+of)\s+([a-z0-9 ]+)',
        r'([a-z0-9 ]+)\s+(?:tablet|capsule|injection|syrup|cream|drops|inhaler|gel|ointment|mg|mcg)',
    ]
    for pattern in triggers:
        m = re.search(pattern, msg_lower)
        if m:
            candidate = m.group(1).strip()
            if len(candidate) >= 4:
                info = lookup_medicine(candidate)
                if info.get("found"):
                    return info

    # Last resort: check every medicine name (6+ char words) present in message
    for name_key in sorted(_medicine_db.keys(), key=len, reverse=True):
        if len(name_key) >= 6 and name_key in msg_lower:
            row = _medicine_db[name_key]
            info = lookup_medicine(row.get("Medicine Name", name_key))
            if info.get("found"):
                return info

    return None


def chat_response(message: str, conversation_history: list[dict] | None = None) -> dict[str, Any]:
    """
    Generate a contextual AI chat response.

    Priority order:
      1. Emergency — always answered first
      2. Treatment request — "medicines for X", "treatment of Y", "home remedy for Z"
      3. Explicit medicine lookup — "side effects of Metformin", "what is Augmentin"
      4. Disease mention — "I have diabetes", "tell me about migraine"
      5. Inline lab values pasted in chat
      6. Generic intent response

    Returns:
        { "response": str, "intent": str, "disease_info": dict|None, "medicine_info": dict|None }
    """
    intent = _detect_intent(message)

    # ── 1. Emergency — highest priority ──────────────────────────────────────
    if intent == 'emergency':
        return {
            "response":      _INTENT_RESPONSES['emergency'],
            "intent":        "emergency",
            "disease_info":  None,
            "medicine_info": None,
        }

    # ── 2. Treatment / remedy request ────────────────────────────────────────
    # "medicines for headache", "treatment for fever", "home remedy for cold"
    if intent == 'treatment_request':
        response_text = _treatment_request_response(message)
        if response_text:
            return {
                "response":      response_text,
                "intent":        "treatment_request",
                "disease_info":  None,
                "medicine_info": None,
            }
        # If no specific match, give a helpful prompt
        return {
            "response":      _INTENT_RESPONSES['treatment_request'],
            "intent":        "treatment_request",
            "disease_info":  None,
            "medicine_info": None,
        }

    # ── 3. Explicit medicine lookup ───────────────────────────────────────────
    if intent == 'medication':
        med_info = _medicine_from_message(message)
        if med_info and med_info.get("found"):
            return {
                "response":      _format_medicine_reply(med_info),
                "intent":        "medicine_info",
                "medicine_info": med_info,
                "disease_info":  None,
            }

    # ── 4. Disease mention lookup ─────────────────────────────────────────────
    tx = _disease_from_message(message)
    if tx and intent not in ('greeting', 'closing', 'reminder'):
        disease_info = {"disease": tx.get("disease", ""), "specialist": tx.get("specialist", "")}
        return {
            "response":      _format_treatment_reply(tx),
            "intent":        "disease_info",
            "disease_info":  disease_info,
            "medicine_info": None,
        }

    # ── 5. Inline lab values pasted directly in chat ──────────────────────────
    lab_pattern = re.compile(
        r'\b(hemoglobin|hba1c|wbc|rbc|platelet|glucose|creatinine|cholesterol'
        r'|tsh|alt|ast|bilirubin|albumin|sodium|potassium|calcium|vitamin\s+d'
        r'|vitamin\s+b12|ferritin|troponin|crp|d[\s-]dimer|inr|uric\s+acid)\b.*\d',
        re.IGNORECASE
    )
    if lab_pattern.search(message):
        report_result = analyze_report_text(message)
        if report_result.get("findings"):
            return {
                "response":      _format_report_reply(report_result),
                "intent":        "inline_report",
                "report_data":   report_result,
                "disease_info":  None,
                "medicine_info": None,
            }

    # ── 6. Symptom-only queries — run quick symptom analysis ─────────────────
    if intent == 'symptoms':
        # Extract symptom phrases and try to get treatment info via keyword map
        tx_from_symptom = _treatment_request_response(message)
        if tx_from_symptom:
            return {
                "response":      tx_from_symptom,
                "intent":        "symptom_treatment",
                "disease_info":  None,
                "medicine_info": None,
            }

    # ── 7. Generic intent response ────────────────────────────────────────────
    response_text = _INTENT_RESPONSES.get(intent, _INTENT_RESPONSES['general'])
    return {
        "response":      response_text,
        "intent":        intent,
        "disease_info":  None,
        "medicine_info": None,
    }


def _format_report_reply(report_result: dict) -> str:
    lines = [f"**Lab Report Analysis**\n\n{report_result['summary']}\n"]
    for f in report_result.get("findings", []):
        icon = {"normal": "✅", "low": "🔽", "high": "🔼",
                "critical_low": "🚨", "critical_high": "🚨"}.get(f["status"], "ℹ️")
        lines.append(
            f"{icon} **{f['parameter']}:** {f['value']} {f['unit']} "
            f"(Normal: {f['normal_range']}) — {f['interpretation']}"
        )
        if f["status"] != "normal":
            lines.append(f"   → *{f['advice']}*")
    lines.append(f"\n_{report_result.get('disclaimer', '')}_")
    return "\n".join(lines)
