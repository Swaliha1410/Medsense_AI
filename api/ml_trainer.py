"""
MedSense XGBoost Trainer
========================
Trains three XGBoost models from the project's CSV datasets and saves
them to api/ml_models/ so ai_engine.py can load them at runtime.

Models trained:
  1. symptom_model     — multi-class: symptom binary features → disease label
  2. report_model      — multi-class: lab value features → status (low/normal/high/critical)
  3. intent_model      — multi-class: TF-IDF chat text → intent label

Run:
    python api/ml_trainer.py

Outputs (api/ml_models/):
    symptom_model.json          XGBoost native format
    symptom_label_encoder.pkl   LabelEncoder for disease names
    symptom_feature_names.pkl   Ordered list of binary symptom features
    report_model.json
    report_label_encoder.pkl
    intent_model.json
    intent_label_encoder.pkl
    intent_vectorizer.pkl       TfidfVectorizer
"""

import csv
import json
import os
import re
import sys
import math
import random
import pickle
from pathlib import Path

import numpy as np
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent
DATA_DIR   = BASE_DIR / "datasets"
MODELS_DIR = BASE_DIR / "ml_models"
MODELS_DIR.mkdir(exist_ok=True)

SYMPTOMS_CSV   = DATA_DIR / "symptoms_diseases.csv"
TREATMENTS_CSV = DATA_DIR / "diseases_treatments.csv"
REPORT_CSV     = DATA_DIR / "report_analysis_keywords.csv"

# ── Helpers ────────────────────────────────────────────────────────────────────
def _log(msg: str) -> None:
    print(f"[trainer] {msg}", flush=True)

def _clean(text: str) -> str:
    return text.strip().lower()

def _parse_number(s: str):
    """Return float or None from a string that may contain numbers."""
    if not s:
        return None
    m = re.search(r"[-+]?\d+\.?\d*", s.replace(",", ""))
    return float(m.group()) if m else None


# ══════════════════════════════════════════════════════════════════════════════
# MODEL 1 — Symptom → Disease classifier
# ══════════════════════════════════════════════════════════════════════════════

def _load_symptom_data():
    """
    Load symptoms_diseases.csv and build:
      - all_symptoms : sorted list of unique symptom tokens
      - X            : binary feature matrix  (n_samples × n_symptoms)
      - y            : integer-encoded disease label per sample

    Data augmentation: for each real row we generate 4 synthetic variants
    by randomly masking 10-30 % of the active symptom bits, giving the model
    more generalisation without any external data.
    """
    rows = []
    with open(SYMPTOMS_CSV, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            syms = [_clean(s) for s in row["symptoms"].split(",") if s.strip()]
            if syms:
                rows.append({"disease": row["disease"].strip(), "symptoms": syms})

    # Collect all unique symptoms
    all_symptoms = sorted({s for r in rows for s in r["symptoms"]})
    sym_idx = {s: i for i, s in enumerate(all_symptoms)}
    n_features = len(all_symptoms)

    _log(f"  Unique symptoms (features): {n_features}")
    _log(f"  Disease classes: {len(rows)}")

    # Encode labels
    le = LabelEncoder()
    diseases = [r["disease"] for r in rows]
    le.fit(diseases)

    X_list, y_list = [], []

    for row in rows:
        label = le.transform([row["disease"]])[0]
        base_vec = np.zeros(n_features, dtype=np.float32)
        for s in row["symptoms"]:
            if s in sym_idx:
                base_vec[sym_idx[s]] = 1.0

        # Original sample
        X_list.append(base_vec.copy())
        y_list.append(label)

        # Augmented samples — mask 10-30 % of active bits
        active_idx = np.where(base_vec == 1.0)[0]
        for _ in range(6):  # 6 augmented copies per real row
            aug = base_vec.copy()
            n_mask = max(1, int(len(active_idx) * random.uniform(0.10, 0.30)))
            mask_positions = random.sample(list(active_idx), min(n_mask, len(active_idx)))
            aug[mask_positions] = 0.0
            X_list.append(aug)
            y_list.append(label)

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int32)
    _log(f"  Total samples after augmentation: {len(X)}")
    return X, y, le, all_symptoms


def train_symptom_model():
    _log("=== Training Symptom → Disease model ===")
    X, y, le, feature_names = _load_symptom_data()

    n_classes = len(le.classes_)

    # Train/test split (stratified)
    if len(set(y)) > 1 and np.bincount(y).min() >= 2:
        X_tr, X_te, y_tr, y_te = train_test_split(
            X, y, test_size=0.15, stratify=y, random_state=42
        )
    else:
        X_tr, X_te, y_tr, y_te = X, X, y, y

    model = xgb.XGBClassifier(
        objective="multi:softprob",
        num_class=n_classes,
        n_estimators=300,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.80,
        min_child_weight=2,
        gamma=0.1,
        reg_alpha=0.05,
        reg_lambda=1.0,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
        verbosity=0,
        n_jobs=-1,
    )

    model.fit(
        X_tr, y_tr,
        eval_set=[(X_te, y_te)],
        verbose=False,
    )

    y_pred = model.predict(X_te)
    acc = accuracy_score(y_te, y_pred)
    _log(f"  Test accuracy: {acc*100:.1f}%")

    # Save
    model_path = MODELS_DIR / "symptom_model.json"
    le_path    = MODELS_DIR / "symptom_label_encoder.pkl"
    fn_path    = MODELS_DIR / "symptom_feature_names.pkl"

    model.save_model(str(model_path))
    joblib.dump(le, str(le_path))
    joblib.dump(feature_names, str(fn_path))

    _log(f"  Saved: {model_path.name}, {le_path.name}, {fn_path.name}")
    return acc


# ══════════════════════════════════════════════════════════════════════════════
# MODEL 2 — Lab value → Status classifier  (low / normal / high / critical)
# ══════════════════════════════════════════════════════════════════════════════

def _parse_normal_range(normal_raw: str):
    """Parse normal_range field → (low_normal, high_normal) floats or None."""
    s = normal_raw.strip()
    range_m = re.match(r"([\d.]+)\s*[-–]\s*([\d.]+)", s)
    gt_m    = re.match(r">[\s]*([\d.]+)", s)
    lt_m    = re.match(r"<[\s]*([\d.]+)", s)
    if range_m:
        return float(range_m.group(1)), float(range_m.group(2))
    if gt_m:
        return float(gt_m.group(1)), None
    if lt_m:
        return None, float(lt_m.group(1))
    return None, None


def _load_report_data():
    """
    For each parameter in the report CSV, generate synthetic lab values that
    span below-critical, low, normal, high, and above-critical ranges.
    Features: [value, low_normal, high_normal, crit_low, crit_high,
               ratio_to_low_normal, ratio_to_high_normal]
    Labels: critical_low=0, low=1, normal=2, high=3, critical_high=4
    """
    LABEL_MAP = {
        "critical_low":  0,
        "low":           1,
        "normal":        2,
        "high":          3,
        "critical_high": 4,
    }

    X_list, y_list = [], []

    with open(REPORT_CSV, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            low_n, high_n = _parse_normal_range(row.get("normal_range", ""))
            crit_low  = _parse_number(row.get("critical_low", ""))
            crit_high = _parse_number(row.get("critical_high", ""))

            if low_n is None and high_n is None:
                continue  # can't build useful features

            # Fill sentinel values (−1 means "not applicable")
            ln  = low_n   if low_n   is not None else -1.0
            hn  = high_n  if high_n  is not None else -1.0
            cl  = crit_low  if crit_low  is not None else -1.0
            ch  = crit_high if crit_high is not None else -1.0

            # Use actual mid-point as reference scale
            if low_n is not None and high_n is not None:
                mid = (low_n + high_n) / 2.0
                span = high_n - low_n if high_n != low_n else 1.0
            elif low_n is not None:
                mid = low_n * 1.5
                span = low_n * 0.5 or 1.0
            else:
                mid = high_n * 0.5
                span = high_n * 0.5 or 1.0

            def _feat(v):
                r_low  = v / low_n  if low_n  and low_n  != 0 else 0.0
                r_high = v / high_n if high_n and high_n != 0 else 0.0
                return [v, ln, hn, cl, ch, r_low, r_high]

            def _label(v):
                if crit_low  is not None and v < crit_low:  return LABEL_MAP["critical_low"]
                if crit_high is not None and v > crit_high: return LABEL_MAP["critical_high"]
                if low_n is not None  and v < low_n:  return LABEL_MAP["low"]
                if high_n is not None and v > high_n: return LABEL_MAP["high"]
                return LABEL_MAP["normal"]

            # Generate 80 synthetic values across the range
            lo_bound = (crit_low  * 0.5) if crit_low  is not None else (low_n  * 0.3 if low_n  else 0.0)
            hi_bound = (crit_high * 1.5) if crit_high is not None else (high_n * 2.0 if high_n else mid * 3)

            for _ in range(80):
                v = random.uniform(lo_bound, hi_bound)
                X_list.append(_feat(v))
                y_list.append(_label(v))

            # Also add a guaranteed normal sample
            if low_n is not None and high_n is not None:
                v_norm = random.uniform(low_n, high_n)
                X_list.append(_feat(v_norm))
                y_list.append(LABEL_MAP["normal"])

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int32)
    _log(f"  Report samples: {len(X)}, unique labels: {sorted(set(y))}")
    return X, y, LABEL_MAP


def train_report_model():
    _log("=== Training Lab Report Status model ===")
    X, y, label_map = _load_report_data()

    # Encode labels
    le = LabelEncoder()
    le.fit(list(label_map.keys()))
    # y is already integer-encoded via label_map, remap via le order
    # Build inverse: int → name → le.transform
    int_to_name = {v: k for k, v in label_map.items()}
    names = [int_to_name[i] for i in y]
    y_enc = le.transform(names)

    n_classes = len(le.classes_)

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y_enc, test_size=0.15, stratify=y_enc, random_state=42
    )

    model = xgb.XGBClassifier(
        objective="multi:softprob",
        num_class=n_classes,
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.9,
        colsample_bytree=0.9,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
        verbosity=0,
        n_jobs=-1,
    )

    model.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], verbose=False)

    y_pred = model.predict(X_te)
    acc = accuracy_score(y_te, y_pred)
    _log(f"  Test accuracy: {acc*100:.1f}%")

    model_path = MODELS_DIR / "report_model.json"
    le_path    = MODELS_DIR / "report_label_encoder.pkl"

    model.save_model(str(model_path))
    joblib.dump(le, str(le_path))

    _log(f"  Saved: {model_path.name}, {le_path.name}")
    return acc


# ══════════════════════════════════════════════════════════════════════════════
# MODEL 3 — Chat message → Intent classifier
# ══════════════════════════════════════════════════════════════════════════════

# Labelled training phrases (intent, list_of_phrases).
# Enough variety that TF-IDF gives meaningful features.
_INTENT_DATA = [
    ("greeting", [
        "hi", "hello", "hey", "good morning", "good evening", "good afternoon",
        "howdy", "greetings", "namaste", "sup", "hii", "helo", "what's up",
        "how are you", "hi there", "hello doctor", "hey there",
    ]),
    ("emergency", [
        "emergency", "call 911", "call 112", "need ambulance", "urgent help",
        "i am dying", "he is unconscious", "not breathing", "heart attack",
        "stroke symptoms", "seizure happening", "overdose", "poisoning",
        "chest pain severe", "cannot breathe", "emergency situation",
        "please help emergency", "accident happened", "critical condition",
    ]),
    ("treatment_request", [
        "medicines for headache", "what medicine for fever",
        "treatment for cold", "how to treat cough",
        "remedy for stomach pain", "home remedy for cold",
        "cure for migraine", "how to cure fever",
        "tablets for sore throat", "drugs for allergy",
        "what should I take for nausea", "how to get rid of acidity",
        "natural remedy for back pain", "ayurvedic treatment for diabetes",
        "how to manage high blood pressure", "relief from joint pain",
        "medicines for diarrhea", "treatment of asthma",
        "what to take for flu", "herbal remedy for insomnia",
        "how to stop vomiting", "reduce fever home remedy",
        "cure constipation naturally", "tablet for headache",
    ]),
    ("medicine_info", [
        "side effects of metformin", "uses of paracetamol",
        "dosage of ibuprofen", "what is amoxicillin tablet",
        "composition of aspirin", "price of dolo 650",
        "information on cetirizine", "tell me about pantoprazole tablet",
        "azithromycin side effects", "info on atorvastatin",
        "what does metoprolol do", "losartan composition",
        "is paracetamol safe in pregnancy", "omeprazole dosage",
        "metformin 500mg uses", "dolo 650 price",
        "what is the use of amoxicillin", "cetirizine 10mg side effects",
        "crocin tablet information", "pantoprazole composition",
    ]),
    ("symptoms", [
        "I have fever and headache", "I am feeling dizzy",
        "I have sore throat and cough", "experiencing chest pain",
        "my stomach hurts", "I feel nauseous", "I have body ache",
        "I am having diarrhea", "feeling tired and weak",
        "I have runny nose and sneezing", "my back is hurting",
        "joint pain in knee", "I got rash on my skin",
        "I have shortness of breath", "I am sweating a lot",
        "I have high fever since yesterday", "vomiting since morning",
        "headache and nausea together", "I feel cold and shivering",
        "my eyes are red and itchy", "I have swollen feet",
        "I have abdominal cramps", "I feel fatigue all the time",
        "I am having difficulty swallowing", "my chest is tight",
    ]),
    ("hospital", [
        "find hospital near me", "nearest clinic", "book doctor appointment",
        "find a specialist", "where is the nearest hospital",
        "locate nearby clinic", "find cardiologist near me",
        "book appointment with doctor", "nearest emergency room",
        "good hospital for diabetes", "find physician",
        "nearby healthcare centre", "orthopedic doctor near me",
    ]),
    ("report", [
        "my lab results", "blood test report", "CBC results",
        "interpret my report", "what does my blood test mean",
        "understand my lab report", "my LFT results",
        "kidney function test report", "lipid profile results",
        "HbA1c report", "thyroid test results",
        "what does my hemoglobin level mean", "my urine test report",
        "MRI report", "CT scan results", "X-ray report",
        "ECG interpretation", "my biopsy results",
    ]),
    ("reminder", [
        "set medicine reminder", "remind me to take medicine",
        "set alarm for tablet", "medicine schedule",
        "when to take my dose", "pill reminder",
        "missed my dose", "medication time reminder",
        "set reminder for insulin", "notify me for medicine",
        "medicine alarm", "dose schedule setup",
    ]),
    ("nutrition", [
        "what should I eat for diabetes", "diet for weight loss",
        "healthy food for heart", "foods to avoid for hypertension",
        "calorie intake", "nutrition tips", "diet plan for PCOS",
        "what to eat for anaemia", "healthy eating habits",
        "BMI calculation", "good food for kidney disease",
        "diet after surgery", "vitamin D rich foods",
        "iron rich diet", "high protein foods list",
    ]),
    ("exercise", [
        "what exercise for back pain", "how much should I walk",
        "yoga for weight loss", "gym workout for beginners",
        "exercise for diabetes", "is running good for heart",
        "cycling benefits", "stretching exercises",
        "physical activity for arthritis", "how to lose weight with exercise",
        "exercise during pregnancy", "workout routine",
    ]),
    ("diabetes", [
        "my blood sugar is high", "fasting glucose level",
        "what is HbA1c", "insulin dosage", "type 2 diabetes management",
        "diabetic diet", "blood glucose monitoring",
        "hyperglycemia symptoms", "hypoglycemia treatment",
        "diabetes complications", "metformin for diabetes",
        "sugar level normal range", "random blood sugar",
    ]),
    ("blood_pressure", [
        "my blood pressure is 150/90", "high BP reading",
        "how to lower blood pressure", "hypertension management",
        "systolic diastolic reading", "low blood pressure symptoms",
        "BP medication", "normal blood pressure range",
        "blood pressure mmHg", "hypertension diet",
        "antihypertensive drugs", "blood pressure chart",
    ]),
    ("heart", [
        "heart palpitations", "chest tightness", "high cholesterol",
        "triglycerides level", "ECG result", "cardiac problem",
        "arrhythmia symptoms", "heart rate monitoring",
        "cardiovascular disease prevention", "coronary artery disease",
        "heart failure symptoms", "cardiomyopathy",
        "cholesterol management", "statin medications",
    ]),
    ("covid", [
        "COVID positive", "corona symptoms", "omicron variant",
        "COVID vaccination", "COVID test result", "PCR test",
        "COVID isolation", "long covid symptoms",
        "booster dose", "COVID treatment at home",
        "COVID oxygen level", "post covid recovery",
    ]),
    ("mental_health", [
        "I feel depressed", "I have anxiety", "feeling stressed",
        "mood swings", "I can't sleep", "panic attack",
        "I feel hopeless", "burnout symptoms",
        "overthinking all the time", "I feel lonely and empty",
        "mental health support", "counselling for depression",
        "PTSD symptoms", "trauma therapy",
        "insomnia and anxiety", "feeling worthless",
    ]),
    ("closing", [
        "thank you", "thanks a lot", "bye", "goodbye",
        "that helped", "great advice", "got it thank you",
        "awesome response", "appreciate your help",
        "ok thanks", "perfect", "wonderful",
        "thanks doctor", "very helpful",
    ]),
    ("education", [
        "what is diabetes", "what causes hypertension",
        "how does insulin work", "explain cholesterol",
        "what is hemoglobin", "difference between type 1 and type 2 diabetes",
        "what are white blood cells", "how does the heart work",
        "what happens during a stroke", "define BMI",
        "what is HbA1c test", "explain kidney function test",
        "what are antibiotics", "how do vaccines work",
        "what is sepsis", "explain ECG test",
    ]),
    ("medication", [
        "what medicines are available", "common antibiotics list",
        "over the counter drugs", "OTC painkillers",
        "generic medicine vs branded", "prescription medication",
        "antibiotic for infection", "painkiller options",
        "antacid medicines", "antihistamine drugs",
        "blood pressure tablets", "diabetes pills",
        "cholesterol lowering drugs", "sleeping pills",
    ]),
    ("general", [
        "how are you doing", "can you help me",
        "I need some information", "what can you do",
        "tell me something", "I have a question",
        "please help me", "I want to know",
        "okay understood", "hmm interesting",
    ]),
]


def _build_intent_dataset():
    X_texts, y_labels = [], []
    for intent, phrases in _INTENT_DATA:
        for phrase in phrases:
            X_texts.append(phrase)
            y_labels.append(intent)
            # Light augmentation: duplicate with minor variation
            X_texts.append(phrase + " please")
            y_labels.append(intent)
    return X_texts, y_labels


def train_intent_model():
    _log("=== Training Chat Intent classifier ===")
    X_texts, y_labels = _build_intent_dataset()

    le = LabelEncoder()
    y = le.fit_transform(y_labels)
    n_classes = len(le.classes_)

    # TF-IDF vectorizer with character n-grams for robustness to typos
    vectorizer = TfidfVectorizer(
        analyzer="word",
        ngram_range=(1, 2),
        max_features=3000,
        sublinear_tf=True,
        min_df=1,
    )
    X = vectorizer.fit_transform(X_texts).toarray().astype(np.float32)

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.15, stratify=y, random_state=42
    )

    model = xgb.XGBClassifier(
        objective="multi:softprob",
        num_class=n_classes,
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.9,
        colsample_bytree=0.80,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
        verbosity=0,
        n_jobs=-1,
    )

    model.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], verbose=False)

    y_pred = model.predict(X_te)
    acc = accuracy_score(y_te, y_pred)
    _log(f"  Test accuracy: {acc*100:.1f}%")

    model_path      = MODELS_DIR / "intent_model.json"
    le_path         = MODELS_DIR / "intent_label_encoder.pkl"
    vectorizer_path = MODELS_DIR / "intent_vectorizer.pkl"

    model.save_model(str(model_path))
    joblib.dump(le,         str(le_path))
    joblib.dump(vectorizer, str(vectorizer_path))

    _log(f"  Saved: {model_path.name}, {le_path.name}, {vectorizer_path.name}")
    return acc


# ══════════════════════════════════════════════════════════════════════════════
# Main
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    random.seed(42)
    np.random.seed(42)

    _log("Starting MedSense XGBoost training pipeline...")
    _log(f"Output directory: {MODELS_DIR}")

    acc1 = train_symptom_model()
    acc2 = train_report_model()
    acc3 = train_intent_model()

    _log("")
    _log("══════════════════════════════════════")
    _log("  Training complete — Summary")
    _log("══════════════════════════════════════")
    _log(f"  Symptom → Disease accuracy : {acc1*100:.1f}%")
    _log(f"  Report  → Status  accuracy : {acc2*100:.1f}%")
    _log(f"  Chat    → Intent  accuracy : {acc3*100:.1f}%")

    # Write a meta file so ai_engine.py knows the models are valid
    meta = {
        "version": "1.0",
        "models": {
            "symptom": {"file": "symptom_model.json", "accuracy": round(acc1 * 100, 1)},
            "report":  {"file": "report_model.json",  "accuracy": round(acc2 * 100, 1)},
            "intent":  {"file": "intent_model.json",  "accuracy": round(acc3 * 100, 1)},
        }
    }
    with open(MODELS_DIR / "model_meta.json", "w") as f:
        json.dump(meta, f, indent=2)

    _log(f"  model_meta.json written to {MODELS_DIR}")
    _log("All models ready for use by ai_engine.py")
