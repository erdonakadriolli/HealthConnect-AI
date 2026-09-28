"""
HealthConnect AI - Skripti 07: Hyperparameter Tuning
=====================================================
Autor: Erdona Kadriolli

Qellimi: Gjetja e parametrave optimale per cdo model duke perdorur
         GridSearchCV me 5-fold Cross-Validation.

Si funksionon:
  1. Per cdo model definojme nje "grid" me parametra te ndryshem
  2. GridSearchCV provon TE GJITHA kombinimet e mundshme
  3. Per cdo kombinim, perdor 5-fold Cross-Validation
  4. Zgjedh kombinimin me F1-Score me te larte
  5. Krahason me modelin origjinal

Output:
  models/tuned_*.pkl    (modelet e optimizuara)
  models/tuning_results.csv (krahasimi origjinal vs tuned)
"""

import pandas as pd
import numpy as np
import pickle
import warnings
from pathlib import Path
from time import time

from sklearn.model_selection import GridSearchCV
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score
)

warnings.filterwarnings('ignore')

# Konfigurimi
PROCESSED_DIR = Path(__file__).parent.parent / "datasets" / "processed"
MODELS_DIR    = Path(__file__).parent.parent / "models"
RANDOM_STATE  = 42
CV_FOLDS      = 5


# =============================================================================
# GRIDET E PARAMETRAVE
# =============================================================================

def get_param_grids():
    """
    Definon parametrat qe do provohen per cdo model.
    
    Vini re: rritja e kombinimeve = me shume kohe trajnimi.
    Per dataset-e te vegjel mund te perdorim grid me te madh.
    """
    return {
        "kNN": {
            "model": KNeighborsClassifier(),
            "params": {
                "n_neighbors": [3, 5, 7, 9, 11, 15],
                "weights": ["uniform", "distance"],
                "metric": ["euclidean", "manhattan"]
            }
            # Total: 6 x 2 x 2 = 24 kombinime
        },
        "Random Forest": {
            "model": RandomForestClassifier(random_state=RANDOM_STATE, n_jobs=-1),
            "params": {
                "n_estimators": [50, 100, 200],
                "max_depth": [None, 5, 10, 20],
                "min_samples_split": [2, 5, 10]
            }
            # Total: 3 x 4 x 3 = 36 kombinime
        },
        "Logistic Regression": {
            "model": LogisticRegression(random_state=RANDOM_STATE, max_iter=1000),
            "params": {
                "C": [0.01, 0.1, 1.0, 10.0],   # regularization strength
                "penalty": ["l2"],
                "solver": ["lbfgs", "liblinear"]
            }
            # Total: 4 x 1 x 2 = 8 kombinime
        },
        "MLP": {
            "model": MLPClassifier(random_state=RANDOM_STATE, max_iter=500, early_stopping=True),
            "params": {
                "hidden_layer_sizes": [(64,), (128,), (64, 32), (128, 64), (128, 64, 32)],
                "activation": ["relu", "tanh"],
                "learning_rate": ["constant", "adaptive"]
            }
            # Total: 5 x 2 x 2 = 20 kombinime
        }
    }


# =============================================================================
# TUNING I NJE MODELI
# =============================================================================

def tune_model(model_name: str, model_config: dict, X_train, y_train, X_test, y_test):
    """Ekzekuton GridSearchCV per nje model."""
    
    print(f"\n  {'─'*55}")
    print(f"  Model: {model_name}")
    print(f"  {'─'*55}")
    
    n_combos = 1
    for v in model_config["params"].values():
        n_combos *= len(v)
    
    total_fits = n_combos * CV_FOLDS
    print(f"  Kombinime    : {n_combos}")
    print(f"  CV folds     : {CV_FOLDS}")
    print(f"  Total trajnime: {total_fits}")
    
    start = time()
    
    # GridSearchCV
    grid = GridSearchCV(
        estimator=model_config["model"],
        param_grid=model_config["params"],
        cv=CV_FOLDS,
        scoring='f1',
        n_jobs=-1,        # Perdor te gjithe procesoret per shpejtim
        verbose=0
    )
    
    grid.fit(X_train, y_train)
    
    elapsed = time() - start
    
    # Vlereso ne test set
    best_model = grid.best_estimator_
    y_pred = best_model.predict(X_test)
    
    test_acc  = accuracy_score(y_test, y_pred)
    test_prec = precision_score(y_test, y_pred, zero_division=0)
    test_rec  = recall_score(y_test, y_pred, zero_division=0)
    test_f1   = f1_score(y_test, y_pred, zero_division=0)
    
    print(f"\n  Koha          : {elapsed:.1f}s")
    print(f"  Best params   : {grid.best_params_}")
    print(f"  CV F1-Score   : {grid.best_score_:.4f}")
    print(f"  Test F1-Score : {test_f1:.4f}")
    print(f"  Test Accuracy : {test_acc:.4f}")
    
    return {
        "best_model": best_model,
        "best_params": grid.best_params_,
        "cv_f1": grid.best_score_,
        "test_accuracy": test_acc,
        "test_precision": test_prec,
        "test_recall": test_rec,
        "test_f1": test_f1,
        "time_seconds": elapsed
    }


# =============================================================================
# PROCESIMI I NJE DATASETI
# =============================================================================

def process_dataset(dataset_name: str, target_col: str):
    """Bën hyperparameter tuning per te gjitha modelet ne nje dataset."""
    
    print(f"\n{'='*60}")
    print(f"  HYPERPARAMETER TUNING - {dataset_name.upper()}")
    print(f"{'='*60}")
    
    # Lexo te dhenat
    train_df = pd.read_csv(PROCESSED_DIR / f"{dataset_name}_train.csv")
    test_df  = pd.read_csv(PROCESSED_DIR / f"{dataset_name}_test.csv")
    
    X_train = train_df.drop(columns=[target_col])
    y_train = train_df[target_col]
    X_test  = test_df.drop(columns=[target_col])
    y_test  = test_df[target_col]
    
    # Lexo rezultatet origjinale per krahasim
    original_results = pd.read_csv(MODELS_DIR / "results.csv")
    original_subset  = original_results[original_results["dataset"] == dataset_name]
    
    param_grids = get_param_grids()
    results = []
    
    for model_name, config in param_grids.items():
        # Tune
        tuning_result = tune_model(model_name, config, X_train, y_train, X_test, y_test)
        
        # Gjej F1 origjinal per krahasim
        # Lidh emrat: "MLP" ne tuning = "MLP Arkitektura 1" ose "2" ne origjinal
        if model_name == "MLP":
            # Marrim me te miren e dy arkitekturave si baza e krahasimit
            mlp_rows = original_subset[original_subset["model"].str.contains("MLP")]
            original_f1 = mlp_rows["f1_score"].max()
            original_name = "MLP (best of 2)"
        else:
            row = original_subset[original_subset["model"] == model_name]
            original_f1 = float(row["f1_score"].iloc[0]) if len(row) else 0.0
            original_name = model_name
        
        improvement = tuning_result["test_f1"] - original_f1
        improvement_pct = (improvement / original_f1 * 100) if original_f1 > 0 else 0
        
        # Ruaj modelin e tuned
        safe_name = model_name.lower().replace(" ", "_")
        model_path = MODELS_DIR / f"tuned_{dataset_name}_{safe_name}.pkl"
        with open(model_path, "wb") as f:
            pickle.dump(tuning_result["best_model"], f)
        
        results.append({
            "dataset": dataset_name,
            "model": model_name,
            "original_f1": round(original_f1, 4),
            "tuned_f1": round(tuning_result["test_f1"], 4),
            "improvement": round(improvement, 4),
            "improvement_pct": round(improvement_pct, 2),
            "tuned_accuracy": round(tuning_result["test_accuracy"], 4),
            "tuned_precision": round(tuning_result["test_precision"], 4),
            "tuned_recall": round(tuning_result["test_recall"], 4),
            "best_params": str(tuning_result["best_params"]),
            "time_seconds": round(tuning_result["time_seconds"], 1)
        })
    
    return results


# =============================================================================
# TABELA PERMBLEDHESE
# =============================================================================

def print_comparison(all_results):
    """Tregon krahasimin origjinal vs tuned."""
    
    print(f"\n{'='*70}")
    print(f"  KRAHASIMI: ORIGJINAL vs TUNED")
    print(f"{'='*70}")
    
    df = pd.DataFrame(all_results)
    
    for dataset in df["dataset"].unique():
        subset = df[df["dataset"] == dataset]
        
        print(f"\n  Dataset: {dataset.upper()}")
        print(f"  {'Model':<22} {'Origjinal':>10} {'Tuned':>10} {'Δ':>8} {'%':>7}")
        print(f"  {'─'*60}")
        
        for _, row in subset.iterrows():
            arrow = "↑" if row["improvement"] > 0 else ("↓" if row["improvement"] < 0 else "=")
            color_indicator = "✓" if row["improvement"] > 0 else " "
            print(f"  {color_indicator} {row['model']:<20} {row['original_f1']:>10.4f} {row['tuned_f1']:>10.4f} "
                  f"{row['improvement']:>+8.4f} {row['improvement_pct']:>+6.2f}%")
    
    # Ruaj rezultatet
    results_path = MODELS_DIR / "tuning_results.csv"
    df.to_csv(results_path, index=False)
    print(f"\n  [OK] Rezultatet ruajt ne: {results_path}")


# =============================================================================
# MAIN
# =============================================================================

def main():
    print("="*60)
    print("  HEALTHCONNECT AI - HYPERPARAMETER TUNING")
    print("="*60)
    print(f"  Cross-Validation : {CV_FOLDS}-fold")
    print(f"  Scoring metric   : F1-Score")
    print(f"  Modele per tuning: kNN, Random Forest, Logistic Regression, MLP")
    print(f"")
    print(f"  KUJDES: Ky proces mund te marre 5-15 minuta!")
    print(f"  Total trajnime per dataset: ~440 trajnime")
    
    all_results = []

    results_diabetes = process_dataset("diabetes", "Outcome")
    all_results.extend(results_diabetes)

    print_comparison(all_results)
    
    print(f"\n{'='*60}")
    print(f"  PERFUNDOI - Modelet e tuned u ruajten ne models/")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
