"""
HealthConnect AI - Skripti 05: Funksioni Predict
=================================================
Autor: Erdona Kadriolli

Qellimi: Ky skript eshte "ura" mes modeleve ML dhe backend-it.
         Backend-i e importon kete modul ne FastAPI dhe e therret
         kur nje mjek fut te dhenat e nje pacienti.

Perdorimi:
  from ml.predict import predict_diabetes

  result = predict_diabetes({
      "Pregnancies": 2,
      "Glucose": 148,
      "BloodPressure": 72,
      "SkinThickness": 35,
      "Insulin": 0,
      "BMI": 33.6,
      "DiabetesPedigreeFunction": 0.627,
      "Age": 50
  })

  # Rezultati:
  # {
  #   "prediction": 1,
  #   "probability": 0.82,
  #   "risk_level": "I larte",
  #   "model_used": "Random Forest",
  #   "risk_group": "Rrezik i Larte"
  # }
"""

import pickle
import pandas as pd
from pathlib import Path

# Rruga e modeleve
MODELS_DIR = Path(__file__).parent.parent / "models"
PROCESSED_DIR = Path(__file__).parent.parent / "datasets" / "processed"


# =============================================================================
# NGARKIMI I MODELEVE (behet njehere kur starton serveri)
# =============================================================================

def load_model(filename: str):
    """Ngarkon nje model nga disku."""
    path = MODELS_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Modeli nuk u gjet: {path}")
    with open(path, "rb") as f:
        return pickle.load(f)


def load_scaler(dataset_name: str):
    """Ngarkon StandardScaler per nje dataset."""
    path = PROCESSED_DIR / "scalers.pkl"
    with open(path, "rb") as f:
        scalers = pickle.load(f)
    return scalers[dataset_name]


# Ngarko modelet me te mira (bazuar ne rezultatet e trajnimit)
# Diabeti: Random Forest ishte me i miri (F1=0.7963)
try:
    MODEL_DIABETES  = load_model("diabetes_random_forest.pkl")
    MODEL_KMEANS    = load_model("diabetes_kmeans.pkl")
    SCALER_DIABETES = load_scaler("diabetes")
    print("[OK] Te gjitha modelet u ngarkuan me sukses.")
except FileNotFoundError as e:
    print(f"[GABIM] {e}")
    print("Ekzekuto fillimisht: python 03_train_models.py dhe 04_kmeans_clustering.py")


# =============================================================================
# KOLONAT E PRITUARA (rendi duhet te jete i njejte me trajnimin)
# =============================================================================

DIABETES_FEATURES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
]


# =============================================================================
# FUNKSIONET E PARASHIKIMIT
# =============================================================================

def predict_diabetes(patient_data: dict) -> dict:
    """
    Parashikon rrezikun e diabetit per nje pacient.

    Args:
        patient_data: dict me fushat:
            Pregnancies, Glucose, BloodPressure, SkinThickness,
            Insulin, BMI, DiabetesPedigreeFunction, Age

    Returns:
        dict me:
            prediction    : 0 (jo diabet) ose 1 (diabet)
            probability   : probabiliteti (0.0 - 1.0)
            risk_level    : "I ulet" / "Mesatar" / "I larte"
            model_used    : emri i modelit
            risk_group    : grupi i K-Means
            message       : mesazh per mjekun
    """
    # Valido inputin
    missing = [f for f in DIABETES_FEATURES if f not in patient_data]
    if missing:
        return {"error": f"Fushat mungojne: {missing}"}

    # Pergatit te dhenat
    values = pd.DataFrame([[patient_data[f] for f in DIABETES_FEATURES]], columns=DIABETES_FEATURES)

    # Skalo
    values_scaled = pd.DataFrame(SCALER_DIABETES.transform(values), columns=DIABETES_FEATURES)

    # Parashiko
    prediction  = int(MODEL_DIABETES.predict(values_scaled)[0])
    probability = float(MODEL_DIABETES.predict_proba(values_scaled)[0][1])

    # Niveli i rrezikut
    if probability < 0.3:
        risk_level = "I ulet"
    elif probability < 0.6:
        risk_level = "Mesatar"
    else:
        risk_level = "I larte"

    # Grupi K-Means
    km_model     = MODEL_KMEANS['model']
    risk_labels  = MODEL_KMEANS['risk_labels']
    cluster_id   = int(km_model.predict(values_scaled)[0])
    risk_group   = risk_labels.get(cluster_id, "E panjohur")

    # Mesazhi per mjekun
    if prediction == 1:
        message = f"Pacienti ka {probability*100:.1f}% probabilitet per diabet. Rekomandohet ekzaminim i metejshem."
    else:
        message = f"Rreziku i diabetit eshte i ulet ({probability*100:.1f}%). Monitorim rutine rekomandohet."

    return {
        "prediction": prediction,
        "probability": round(probability, 4),
        "risk_level": risk_level,
        "model_used": "Random Forest",
        "risk_group": risk_group,
        "message": message
    }


# =============================================================================
# TESTIMI I DREJTPERDREJTE
# =============================================================================

def run_tests():
    """Teston funksionet me paciente shembull."""

    print("\n" + "="*60)
    print("  TEST 1: Pacient me rrezik te larte diabeti")
    print("="*60)
    result1 = predict_diabetes({
        "Pregnancies": 6,
        "Glucose": 148,
        "BloodPressure": 72,
        "SkinThickness": 35,
        "Insulin": 0,
        "BMI": 33.6,
        "DiabetesPedigreeFunction": 0.627,
        "Age": 50
    })
    for key, val in result1.items():
        print(f"  {key:<15}: {val}")

    print("\n" + "="*60)
    print("  TEST 2: Pacient i shendetshem (rrezik i ulet)")
    print("="*60)
    result2 = predict_diabetes({
        "Pregnancies": 1,
        "Glucose": 85,
        "BloodPressure": 66,
        "SkinThickness": 29,
        "Insulin": 0,
        "BMI": 26.6,
        "DiabetesPedigreeFunction": 0.351,
        "Age": 31
    })
    for key, val in result2.items():
        print(f"  {key:<15}: {val}")

    print("\n" + "="*60)
    print("  TE GJITHA TESTET PERFUNDUAN")
    print("="*60)


if __name__ == "__main__":
    run_tests()
