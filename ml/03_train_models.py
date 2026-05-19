"""
HealthConnect AI - Skripti 03: Trajnimi i Modeleve ML
======================================================
Autor: Erdona Kadriolli

Modelet:
  1. k-NN (K-Nearest Neighbors)
  2. Random Forest
  3. Logistic Regression
  4. Neural Network MLP - Arkitektura 1 (e thjesht)
  5. Neural Network MLP - Arkitektura 2 (e thelle)

Dataset:
  - Diabeti (Pima Indians)

Output:
  models/diabetes_knn.pkl
  models/diabetes_rf.pkl
  models/diabetes_logreg.pkl
  models/diabetes_mlp1.pkl
  models/diabetes_mlp2.pkl
  models/results.csv  (te gjitha metrikat)
"""

import pandas as pd
import pickle
from pathlib import Path

from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix,
)

# Konfigurimi
PROCESSED_DIR = Path(__file__).parent.parent / "datasets" / "processed"
MODELS_DIR = Path(__file__).parent.parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

RANDOM_STATE = 42


# =============================================================================
# MODELET
# =============================================================================

def get_models():
    """
    Kthen nje dictionary me te gjitha modelet.
    
    Neural Network:
      Arkitektura 1 - E thjesht: 1 shtrese e fshehur (64 neurone)
      Arkitektura 2 - E thelle: 3 shtresa te fshehura (128, 64, 32 neurone)
    """
    return {
        "kNN": KNeighborsClassifier(
            n_neighbors=5,
            metric='euclidean',
            weights='uniform'
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            max_depth=None,
            min_samples_split=2,
            random_state=RANDOM_STATE
        ),
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            random_state=RANDOM_STATE,
            solver='lbfgs'
        ),
        "MLP Arkitektura 1": MLPClassifier(
            hidden_layer_sizes=(64,),
            activation='relu',
            max_iter=500,
            random_state=RANDOM_STATE,
            early_stopping=True,
            validation_fraction=0.1
        ),
        "MLP Arkitektura 2": MLPClassifier(
            hidden_layer_sizes=(128, 64, 32),
            activation='relu',
            max_iter=500,
            random_state=RANDOM_STATE,
            early_stopping=True,
            validation_fraction=0.1,
            learning_rate='adaptive'
        ),
    }


# =============================================================================
# TRAJNIMI DHE VLERESIMI
# =============================================================================

def train_and_evaluate(model, X_train, y_train, X_test, y_test, model_name, dataset_name):
    """Trajnon modelin dhe llogarit te gjitha metrikat."""

    # Trajnimi
    model.fit(X_train, y_train)

    # Parashikimi
    y_pred = model.predict(X_test)

    # Metrikat
    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec  = recall_score(y_test, y_pred, zero_division=0)
    f1   = f1_score(y_test, y_pred, zero_division=0)
    cm   = confusion_matrix(y_test, y_pred)

    # Shfaq rezultatet
    print(f"\n  {'─'*50}")
    print(f"  Model    : {model_name}")
    print(f"  Dataset  : {dataset_name}")
    print(f"  {'─'*50}")
    print(f"  Accuracy : {acc:.4f}  ({acc*100:.2f}%)")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall   : {rec:.4f}")
    print(f"  F1-Score : {f1:.4f}")
    print(f"\n  Confusion Matrix:")
    print(f"    TN={cm[0,0]}  FP={cm[0,1]}")
    print(f"    FN={cm[1,0]}  TP={cm[1,1]}")

    return {
        "dataset": dataset_name,
        "model": model_name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "tn": cm[0,0], "fp": cm[0,1],
        "fn": cm[1,0], "tp": cm[1,1],
    }


def process_dataset(dataset_name: str, target_col: str):
    """Trajnon te gjitha modelet per nje dataset."""

    print(f"\n{'='*60}")
    print(f"  DATASET: {dataset_name.upper()}")
    print(f"{'='*60}")

    # Lexo te dhenat e pergatitura
    train_df = pd.read_csv(PROCESSED_DIR / f"{dataset_name}_train.csv")
    test_df  = pd.read_csv(PROCESSED_DIR / f"{dataset_name}_test.csv")

    X_train = train_df.drop(columns=[target_col])
    y_train = train_df[target_col]
    X_test  = test_df.drop(columns=[target_col])
    y_test  = test_df[target_col]

    print(f"  Train: {X_train.shape} | Test: {X_test.shape}")

    results = []
    models  = get_models()

    for model_name, model in models.items():
        result = train_and_evaluate(
            model, X_train, y_train, X_test, y_test,
            model_name, dataset_name
        )
        results.append(result)

        # Ruaj modelin
        safe_name = model_name.lower().replace(" ", "_").replace("(", "").replace(")", "")
        model_path = MODELS_DIR / f"{dataset_name}_{safe_name}.pkl"
        with open(model_path, "wb") as f:
            pickle.dump(model, f)
        print(f"  [OK] Ruajt: {model_path.name}")

    return results


# =============================================================================
# TABELA KRAHASUESE
# =============================================================================

def print_summary(all_results: list):
    """Shfaq tabelen krahasuese te te gjitha modeleve."""

    df = pd.DataFrame(all_results)

    print(f"\n{'='*60}")
    print(f"  TABELA KRAHASUESE - TE GJITHA MODELET")
    print(f"{'='*60}")

    for dataset in df["dataset"].unique():
        subset = df[df["dataset"] == dataset].copy()
        subset = subset.sort_values("f1_score", ascending=False)

        print(f"\n  Dataset: {dataset.upper()}")
        print(f"  {'Model':<22} {'Acc':>7} {'Prec':>7} {'Rec':>7} {'F1':>7}")
        print(f"  {'─'*52}")

        for _, row in subset.iterrows():
            marker = " <-- BEST" if row.name == subset.index[0] else ""
            print(f"  {row['model']:<22} {row['accuracy']:>7.4f} {row['precision']:>7.4f} {row['recall']:>7.4f} {row['f1_score']:>7.4f}{marker}")

    # Ruaj rezultatet ne CSV per raportin
    results_path = MODELS_DIR / "results.csv"
    df.to_csv(results_path, index=False)
    print(f"\n  [OK] Rezultatet ruajt ne: {results_path}")


# =============================================================================
# MAIN
# =============================================================================

def main():
    print("="*60)
    print("  HEALTHCONNECT AI - TRAJNIMI I MODELEVE ML")
    print("="*60)
    print(f"  Modele: kNN, Random Forest, Logistic Regression, MLP x2")
    print(f"  Dataset: Diabet")

    all_results = []

    results_diabetes = process_dataset("diabetes", target_col="Outcome")
    all_results.extend(results_diabetes)

    print_summary(all_results)

    print(f"\n{'='*60}")
    print(f"  PERFUNDOI - Modelet u ruajten ne dosjen: models/")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
