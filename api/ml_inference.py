"""
MedSense XGBoost Inference Layer
=================================
Loads the trained XGBoost models once at import time and exposes three
high-level prediction functions that ai_engine.py calls instead of (or
in addition to) its CSV-driven rule logic.

If the model files don't exist yet (first run before ml_trainer.py has
been executed), every function returns None so ai_engine.py falls back
gracefully to its original rule-based behaviour.

Public API
----------
    predict_diseases(symptom_text, top_k=5)
        -> list[dict]  e.g. [{"disease": "Influenza", "confidence": 0.82}, ...]
        or None on failure

    predict_report_status(value, low_normal, high_normal, crit_low, crit_high)
        -> str  one of: "critical_low", "low", "normal", "high", "critical_high"
        or None on failure

    predict_intent(message_text)
        -> str  intent label  e.g. "treatment_request"
        or None on failure
"""

import re
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

_MODELS_DIR = Path(__file__).resolve().parent / "ml_models"

# ── Lazy-loaded singletons ────────────────────────────────────────────────────
_symptom_model        = None
_symptom_le           = None   # LabelEncoder (disease names)
_symptom_feat_names   = None   # list of symptom token strings

_report_model         = None
_report_le            = None   # LabelEncoder (status labels)

_intent_model         = None
_intent_le            = None   # LabelEncoder (intent labels)
_intent_vectorizer    = None   # TfidfVectorizer

_models_loaded        = False
_models_available     = None   # None = unknown, True/False after first check


def _models_exist() -> bool:
    """Return True only if all required model files are present."""
    required = [
        "symptom_model.json",
        "symptom_label_encoder.pkl",
        "symptom_feature_names.pkl",
        "report_model.json",
        "report_label_encoder.pkl",
        "intent_model.json",
        "intent_label_encoder.pkl",
        "intent_vectorizer.pkl",
    ]
    return all((_MODELS_DIR / f).exists() for f in required)


def _load_models() -> bool:
    """
    Load all model artefacts into module-level singletons.
    Returns True on success, False on any error.
    """
    global _symptom_model, _symptom_le, _symptom_feat_names
    global _report_model, _report_le
    global _intent_model, _intent_le, _intent_vectorizer
    global _models_loaded, _models_available

    if _models_loaded:
        return True

    if not _models_exist():
        _models_available = False
        return False

    try:
        import xgboost as xgb
        import joblib

        # Symptom model
        _symptom_model = xgb.XGBClassifier()
        _symptom_model.load_model(str(_MODELS_DIR / "symptom_model.json"))
        _symptom_le         = joblib.load(str(_MODELS_DIR / "symptom_label_encoder.pkl"))
        _symptom_feat_names = joblib.load(str(_MODELS_DIR / "symptom_feature_names.pkl"))

        # Report model
        _report_model = xgb.XGBClassifier()
        _report_model.load_model(str(_MODELS_DIR / "report_model.json"))
        _report_le = joblib.load(str(_MODELS_DIR / "report_label_encoder.pkl"))

        # Intent model
        _intent_model = xgb.XGBClassifier()
        _intent_model.load_model(str(_MODELS_DIR / "intent_model.json"))
        _intent_le         = joblib.load(str(_MODELS_DIR / "intent_label_encoder.pkl"))
        _intent_vectorizer = joblib.load(str(_MODELS_DIR / "intent_vectorizer.pkl"))

        _models_loaded    = True
        _models_available = True
        logger.info("MedSense XGBoost models loaded successfully from %s", _MODELS_DIR)
        return True

    except Exception as exc:
        logger.warning("XGBoost model load failed (%s). Falling back to rule-based engine.", exc)
        _models_available = False
        return False


# ── Try loading at import time (non-fatal if not present yet) ─────────────────
_load_models()


# ── Inference helpers ─────────────────────────────────────────────────────────

def _tokenize_symptoms(text: str) -> set[str]:
    """Return a set of lowercase word tokens + bigrams."""
    words = re.findall(r'[a-z]+', text.lower())
    tokens = set(words)
    for i in range(len(words) - 1):
        tokens.add(f"{words[i]} {words[i+1]}")
    return tokens


def _build_symptom_vector(symptom_text: str) -> "list[float] | None":
    """Convert free-text symptom string to a binary feature vector."""
    if _symptom_feat_names is None:
        return None
    import numpy as np
    tokens = _tokenize_symptoms(symptom_text)
    vec = np.zeros(len(_symptom_feat_names), dtype=np.float32)
    for i, feat in enumerate(_symptom_feat_names):
        feat_tokens = set(feat.split())
        if feat in tokens or feat_tokens.issubset(tokens):
            vec[i] = 1.0
    return vec


# ── Public API ────────────────────────────────────────────────────────────────

def predict_diseases(symptom_text: str, top_k: int = 5) -> "list[dict] | None":
    """
    Predict top-k likely diseases from free-text symptom description.

    Parameters
    ----------
    symptom_text : str
        Natural language description e.g. "fever, body aches, chills, headache"
    top_k : int
        Number of top predictions to return (default 5)

    Returns
    -------
    list[dict] | None
        Each dict has keys: disease (str), confidence (float 0-1)
        Returns None if models not available.
    """
    if not _load_models():
        return None

    try:
        import numpy as np
        vec = _build_symptom_vector(symptom_text)
        if vec is None:
            return None

        # XGBoost predict_proba → shape (1, n_classes)
        proba = _symptom_model.predict_proba(vec.reshape(1, -1))[0]

        top_idx = proba.argsort()[::-1][:top_k]
        results = []
        for idx in top_idx:
            conf = float(proba[idx])
            if conf < 0.01:   # skip negligible predictions
                continue
            disease = _symptom_le.inverse_transform([idx])[0]
            results.append({"disease": disease, "confidence": round(conf, 4)})
        return results if results else None

    except Exception as exc:
        logger.warning("predict_diseases failed: %s", exc)
        return None


def predict_report_status(
    value: float,
    low_normal: "float | None",
    high_normal: "float | None",
    crit_low: "float | None",
    crit_high: "float | None",
) -> "str | None":
    """
    Predict lab value status using the XGBoost report model.

    Parameters
    ----------
    value       : the measured lab value
    low_normal  : lower bound of normal range (None if not applicable)
    high_normal : upper bound of normal range (None if not applicable)
    crit_low    : critical low threshold (None if not applicable)
    crit_high   : critical high threshold (None if not applicable)

    Returns
    -------
    str | None
        One of: "critical_low", "low", "normal", "high", "critical_high"
        Returns None if models not available.
    """
    if not _load_models():
        return None

    try:
        import numpy as np

        ln  = low_normal   if low_normal   is not None else -1.0
        hn  = high_normal  if high_normal  is not None else -1.0
        cl  = crit_low     if crit_low     is not None else -1.0
        ch  = crit_high    if crit_high    is not None else -1.0
        r_low  = value / ln  if ln  > 0 else 0.0
        r_high = value / hn if hn > 0 else 0.0

        feat = np.array([[value, ln, hn, cl, ch, r_low, r_high]], dtype=np.float32)
        pred = _report_model.predict(feat)[0]
        label = _report_le.inverse_transform([pred])[0]
        return label

    except Exception as exc:
        logger.warning("predict_report_status failed: %s", exc)
        return None


def predict_intent(message: str) -> "str | None":
    """
    Predict chat message intent using the XGBoost intent model.

    Parameters
    ----------
    message : str
        User's chat message

    Returns
    -------
    str | None
        Intent label e.g. "treatment_request", "greeting", "emergency"
        Returns None if models not available.
    """
    if not _load_models():
        return None

    try:
        import numpy as np

        X = _intent_vectorizer.transform([message]).toarray().astype(np.float32)
        pred = _intent_model.predict(X)[0]
        label = _intent_le.inverse_transform([pred])[0]
        return label

    except Exception as exc:
        logger.warning("predict_intent failed: %s", exc)
        return None


def models_ready() -> bool:
    """Return True if all XGBoost models are loaded and ready."""
    return _models_loaded


def get_model_info() -> dict:
    """Return a summary of which models are loaded and the models directory."""
    meta_path = _MODELS_DIR / "model_meta.json"
    meta = {}
    if meta_path.exists():
        import json
        with open(meta_path) as f:
            meta = json.load(f)
    return {
        "models_loaded":    _models_loaded,
        "models_directory": str(_MODELS_DIR),
        "meta":             meta,
    }
