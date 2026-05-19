"""
HealthConnect AI - Skripti 08: Cross-Validation
================================================
Autor: Erdona Kadriolli

Qellimi: Vlereson modelet me k-Fold Cross-Validation per te marre
         rezultate me te besueshme sesa ndarja train/test e vetme.

Si funksionon:
  1. Per cdo model, kryen 5-fold dhe 10-fold Cross-Validation
  2. Llogarit Accuracy, Precision, Recall, F1-Score per cdo fold
  3. Tregon mesataren ± deviacionin standard
  4. Krahason me rezultatet e ndarjes train/test te vetme

Output:
  models/cross_validation_results.csv
"""

import pandas as pd
import numpy as np
import warnings
from pathlib import Path
import pickle

from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier

warnings.filterwarnings('ignore')

# Konfigurimi
PROCESSED_DIR = Path(__file__).parent.parent / "datasets" / "processed"
MODELS_DIR    = Path(__file__).parent.parent / "models"
RANDOM_STATE  = 42


# =============================================================================
# MODELET (njejte si ne 03_train_models.py)
# =============================================================================

def get_models():
    """Modelet me parametra default per nje krahasim te paster."""
    return {
        "kNN": KNeighborsClassifier(n_neighbors=5, metric='euclidean'),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=RANDOM_STATE),
        "MLP Arkitektura 1": MLPClassifier(hidden_layer_sizes=(64,), max_iter=500,
                                           random_state=RANDOM_STATE, early_stopping=True),
        "MLP Arkitektura 2": MLPClassifier(hidden_layer_sizes=(128, 64, 32), max_iter=500,
                                           random_state=RANDOM_STATE, early_stopping=True,
                                           learning_rate='adaptive'),
    }


# =============================================================================
# CROSS-VALIDATION I NJE MODELI
# =============================================================================

def cross_validate_model(model, X, y, model_name, k_folds=5):
    """
    Kryen k-fold cross-validation per nje model.
    Llogarit te gjitha metrikat (accuracy, precision, recall, f1).
    Perdor StratifiedKFold per te ruajtur balancen e klasave.
    """
    skf = StratifiedKFold(n_splits=k_folds, shuffle=True, random_state=RANDOM_STATE)

    # Llogarit metrikat me cross_val_score per cdo metrike
    metrics = {}
    for metric in ['accuracy', 'precision', 'recall', 'f1']:
        scores = cross_val_score(model, X, y, cv=skf, scoring=metric, n_jobs=-1)
        metrics[metric] = {
            'mean': scores.mean(),
            'std': scores.std(),
            'min': scores.min(),
            'max': scores.max(),
            'all_folds': scores.tolist()
        }

    return metrics


# =============================================================================
# PROCESIMI I NJE DATASETI
# =============================================================================

def process_dataset(dataset_name: str, target_col: str, k_folds: int = 5):
    """Kryen Cross-Validation per te gjitha modelet ne nje dataset."""

    print(f"\n{'='*70}")
    print(f"  CROSS-VALIDATION ({k_folds}-fold) - {dataset_name.upper()}")
    print(f"{'='*70}")

    # Lexo te dhenat (perdorim TRAIN-in se test-i mbahet i veçante)
    train_df = pd.read_csv(PROCESSED_DIR / f"{dataset_name}_train.csv")
    X = train_df.drop(columns=[target_col])
    y = train_df[target_col]

    print(f"  Te dhenat: {len(X)} rreshta, {len(X.columns)} features")
    print(f"  Balanca  : {y.value_counts(normalize=True).round(3).to_dict()}")

    models = get_models()
    results = []

    for model_name, model in models.items():
        print(f"\n  {'─'*60}")
        print(f"  Model: {model_name}")
        print(f"  {'─'*60}")

        metrics = cross_validate_model(model, X, y, model_name, k_folds=k_folds)

        # Shfaq rezultatet
        for metric_name, metric_data in metrics.items():
            mean = metric_data['mean']
            std = metric_data['std']
            print(f"  {metric_name.capitalize():<10}: {mean:.4f} ± {std:.4f}  "
                  f"(min={metric_data['min']:.4f}, max={metric_data['max']:.4f})")

        # Vizualizim i folds
        print(f"\n  F1-Score per cdo fold:")
        for i, score in enumerate(metrics['f1']['all_folds'], 1):
            bar_len = int(score * 30)
            bar = '█' * bar_len
            print(f"    Fold {i}: {score:.4f}  {bar}")

        results.append({
            "dataset": dataset_name,
            "model": model_name,
            "k_folds": k_folds,
            "accuracy_mean": round(metrics['accuracy']['mean'], 4),
            "accuracy_std": round(metrics['accuracy']['std'], 4),
            "precision_mean": round(metrics['precision']['mean'], 4),
            "precision_std": round(metrics['precision']['std'], 4),
            "recall_mean": round(metrics['recall']['mean'], 4),
            "recall_std": round(metrics['recall']['std'], 4),
            "f1_mean": round(metrics['f1']['mean'], 4),
            "f1_std": round(metrics['f1']['std'], 4),
            "f1_min": round(metrics['f1']['min'], 4),
            "f1_max": round(metrics['f1']['max'], 4),
        })

    return results


# =============================================================================
# KRAHASIMI ME REZULTATET ORIGJINALE
# =============================================================================

def compare_with_train_test(cv_results):
    """Krahason CV mean me train/test te thjeshte."""

    df_cv = pd.DataFrame(cv_results)
    df_orig = pd.read_csv(MODELS_DIR / "results.csv")

    print(f"\n{'='*70}")
    print(f"  KRAHASIMI: TRAIN/TEST vs CROSS-VALIDATION")
    print(f"{'='*70}")

    for dataset in df_cv["dataset"].unique():
        cv_subset = df_cv[df_cv["dataset"] == dataset]
        orig_subset = df_orig[df_orig["dataset"] == dataset]

        print(f"\n  Dataset: {dataset.upper()}")
        print(f"  {'Model':<22} {'Train/Test F1':>13} {'CV F1 (5-fold)':>20} {'Vlersim':>14}")
        print(f"  {'─'*72}")

        for _, cv_row in cv_subset.iterrows():
            orig_row = orig_subset[orig_subset["model"] == cv_row["model"]]
            if len(orig_row) == 0:
                continue

            tt_f1 = float(orig_row["f1_score"].iloc[0])
            cv_f1 = cv_row["f1_mean"]
            cv_std = cv_row["f1_std"]

            # Diferenca
            diff = tt_f1 - cv_f1

            # Verdikt
            if abs(diff) < 0.05 and cv_std < 0.05:
                verdict = "I qëndrueshëm ✓"
            elif abs(diff) < 0.10:
                verdict = "I pranueshëm"
            else:
                verdict = "I paqëndrueshëm"

            print(f"  {cv_row['model']:<22} {tt_f1:>13.4f} {cv_f1:>10.4f} ± {cv_std:.4f}  {verdict:>14}")


# =============================================================================
# MAIN
# =============================================================================

def main():
    print("="*70)
    print("  HEALTHCONNECT AI - CROSS-VALIDATION")
    print("="*70)
    print("  Teknika    : Stratified K-Fold Cross-Validation")
    print("  Folds      : 5")
    print("  Modele     : kNN, Random Forest, Logistic Regression, MLP x2")
    print("  Metrikat   : Accuracy, Precision, Recall, F1-Score")
    print("")
    print("  Pse perdorim: per te marre rezultate me te besueshme")
    print("  Si funksion : modeli vleresohet 5 here ne ndarje te ndryshme")

    all_results = []

    results_diabetes = process_dataset("diabetes", "Outcome", k_folds=5)
    all_results.extend(results_diabetes)

    compare_with_train_test(all_results)

    # Ruaj rezultatet
    df = pd.DataFrame(all_results)
    output_path = MODELS_DIR / "cross_validation_results.csv"
    df.to_csv(output_path, index=False)
    print(f"\n  [OK] Rezultatet ruajt ne: {output_path}")

    print(f"\n{'='*70}")
    print(f"  PERFUNDOI")
    print(f"{'='*70}")


if __name__ == "__main__":
    main()
