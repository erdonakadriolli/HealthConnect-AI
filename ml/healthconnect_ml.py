"""
HealthConnect AI — Pipeline i Plotë i Machine Learning
======================================================
Ky skedar konsolidon të gjithë pipeline-in e Machine Learning për projektin:
1. Leximi dhe Inspektimi i Dataset-it (Pima Indians Diabetes)
2. Preprocessing (Zëvendësimi i vlerave 0 me medianën, IQR outlier capping)
3. Ndarja Train/Test (80/20) dhe Skalimi (StandardScaler)
4. Trajnimi i 5 Modeleve Supervised (k-NN, Random Forest, Logistic Regression, 2x MLP)
5. Cross-Validation (Stratified 5-Fold) per vleresim te plote
6. Grupimi Unsupervised me K-Means (K=3) per nivelet e rrezikut
7. Ruajtja e modeleve (.pkl) dhe testimi i parashikimit

Si ta ekzekutoni:
    python ml/healthconnect_ml.py
"""

import os
import sys
import pickle
import warnings
import numpy as np
import pandas as pd
from pathlib import Path

# Scikit-Learn imports
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.cluster import KMeans
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, silhouette_score, adjusted_rand_score
)

warnings.filterwarnings('ignore')

# Konfigurimi i shtigjeve
BASE_DIR = Path(__file__).resolve().parent.parent
DATASETS_DIR = BASE_DIR / "datasets"
PROCESSED_DIR = DATASETS_DIR / "processed"
MODELS_DIR = BASE_DIR / "models"

# Krijo dosjet nese nuk ekzistojne
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_STATE = 42
TEST_SIZE = 0.2


# =============================================================================
# 1. INSPEKTIMI I DATASET-IT
# =============================================================================
def inspect_dataset(df: pd.DataFrame):
    print("\n" + "="*70)
    print("  HAPI 1: INSPEKTIMI I DATASET-IT (PIMA INDIANS)")
    print("="*70)
    print(f"  Rreshtat total : {len(df)}")
    print(f"  Kolonat total  : {len(df.columns)}")
    
    print("\n  Tipet e kolonave dhe vlerat Null:")
    for col in df.columns:
        nulls = df[col].isnull().sum()
        zeros = (df[col] == 0).sum()
        print(f"    - {col:<30} | Nulls: {nulls:<4} | Zeros (0): {zeros}")
        
    print("\n  Balanca e Klasave (Target 'Outcome'):")
    counts = df['Outcome'].value_counts()
    for cls, count in counts.items():
        pct = count / len(df) * 100
        print(f"    Klasa {cls} (0=Jo Diabet, 1=Diabet): {count:>3} ({pct:.1f}%)")


# =============================================================================
# 2. PREPROCESSING (PASTRIMI DHE OUTLIERS)
# =============================================================================
def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    print("\n" + "="*70)
    print("  HAPI 2: PREPROCESSING (MEDIAN IMPUTATION & OUTLIERS)")
    print("="*70)
    df = df.copy()
    
    # 2.1 Zëvendësimi i vlerave 0 joreale me medianën e klasës
    cols_with_zero_as_missing = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
    print("  Zëvendësimi i vlerave 0 kritike me medianën e klasës:")
    for col in cols_with_zero_as_missing:
        df[col] = df[col].astype(float)
        for outcome in [0, 1]:
            mask = (df[col] == 0) & (df['Outcome'] == outcome)
            median_val = df.loc[(df[col] != 0) & (df['Outcome'] == outcome), col].median()
            df.loc[mask, col] = median_val
        print(f"    - {col:<20}: Vlerat 0 u zëvendësuan.")
        
    # 2.2 Trajtimi i Outliers me IQR Capping (jo fshirje)
    print("\n  Capping i Outliers duke përdorur metodën IQR:")
    for col in df.columns:
        if col == 'Outcome' or df[col].nunique() <= 5:
            continue
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        
        n_capped = ((df[col] < lower) | (df[col] > upper)).sum()
        df[col] = df[col].clip(lower, upper)
        if n_capped > 0:
            print(f"    - {col:<20}: Capped {n_capped} outliers në kufijtë [{lower:.1f}, {upper:.1f}]")
            
    return df


# =============================================================================
# 3. NDARJA TRAIN/TEST DHE SKALIMI
# =============================================================================
def split_and_scale_data(df: pd.DataFrame):
    print("\n" + "="*70)
    print("  HAPI 3: NDARJA TRAIN/TEST (80/20) DHE SKALIMI")
    print("="*70)
    X = df.drop(columns=['Outcome'])
    y = df['Outcome']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, stratify=y, random_state=RANDOM_STATE
    )
    
    print(f"  Train Set: {len(X_train)} mostra (80%)")
    print(f"  Test Set : {len(X_test)} mostra (20%)")
    
    # StandardScaler
    scaler = StandardScaler()
    X_train_scaled = pd.DataFrame(scaler.fit_transform(X_train), columns=X_train.columns)
    X_test_scaled = pd.DataFrame(scaler.transform(X_test), columns=X_test.columns)
    
    # Ruaj skedaret e procesuar
    train_df = X_train_scaled.copy()
    train_df['Outcome'] = y_train.values
    test_df = X_test_scaled.copy()
    test_df['Outcome'] = y_test.values
    
    train_df.to_csv(PROCESSED_DIR / "diabetes_train.csv", index=False)
    test_df.to_csv(PROCESSED_DIR / "diabetes_test.csv", index=False)
    
    # Ruaj skalerin
    with open(PROCESSED_DIR / "scalers.pkl", 'wb') as f:
        pickle.dump({'diabetes': scaler}, f)
        
    print("  [OK] Skaleri dhe të dhënat e procesuara u ruajtën në disk.")
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler


# =============================================================================
# 4. TRAJNIMI I MODELEVE SUPERVISED
# =============================================================================
def train_supervised_models(X_train, X_test, y_train, y_test):
    print("\n" + "="*70)
    print("  HAPI 4: TRAJNIMI I MODELEVE SUPERVISED DHE VLERËSIMI")
    print("="*70)
    
    models = {
        "kNN": KNeighborsClassifier(n_neighbors=5, metric='euclidean'),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=RANDOM_STATE),
        "MLP Arkitektura 1": MLPClassifier(hidden_layer_sizes=(64,), max_iter=500, random_state=RANDOM_STATE, early_stopping=True),
        "MLP Arkitektura 2": MLPClassifier(hidden_layer_sizes=(128, 64, 32), max_iter=500, random_state=RANDOM_STATE, early_stopping=True, learning_rate='adaptive')
    }
    
    results = []
    best_model = None
    best_f1 = 0
    best_model_name = ""
    
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        cm = confusion_matrix(y_test, y_pred)
        
        print(f"  * {name:<22} | Acc: {acc*100:.2f}% | Precision: {prec:.4f} | Recall: {rec:.4f} | F1: {f1:.4f}")
        
        # Ruaj modelin
        safe_name = name.lower().replace(" ", "_")
        with open(MODELS_DIR / f"diabetes_{safe_name}.pkl", "wb") as f:
            pickle.dump(model, f)
            
        results.append({
            "model": name, "accuracy": acc, "precision": prec, "recall": rec, "f1_score": f1
        })
        
        if f1 > best_f1:
            best_f1 = f1
            best_model = model
            best_model_name = name
            
    print(f"\n  Modeli më i mirë (F1-score): {best_model_name} ({best_f1:.4f})")
    # Zgjedhim modelin me te mire si modelin kryesor te parashikimit
    with open(MODELS_DIR / "diabetes_production_model.pkl", "wb") as f:
        pickle.dump(best_model, f)
        
    pd.DataFrame(results).to_csv(MODELS_DIR / "results.csv", index=False)
    return results, best_model_name


# =============================================================================
# 5. CROSS-VALIDATION
# =============================================================================
def perform_cross_validation(X, y):
    print("\n" + "="*70)
    print("  HAPI 5: STRATIFIED 5-FOLD CROSS-VALIDATION (TRAIN SET)")
    print("="*70)
    
    models = {
        "kNN": KNeighborsClassifier(n_neighbors=5, metric='euclidean'),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=RANDOM_STATE),
        "MLP Arkitektura 1": MLPClassifier(hidden_layer_sizes=(64,), max_iter=500, random_state=RANDOM_STATE, early_stopping=True),
        "MLP Arkitektura 2": MLPClassifier(hidden_layer_sizes=(128, 64, 32), max_iter=500, random_state=RANDOM_STATE, early_stopping=True)
    }
    
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    
    for name, model in models.items():
        scores = cross_val_score(model, X, y, cv=skf, scoring='f1', n_jobs=-1)
        print(f"  - {name:<22} | F1-Score: {scores.mean():.4f} ± {scores.std():.4f}")


# =============================================================================
# 6. K-MEANS CLUSTERING (UNSUPERVISED)
# =============================================================================
def perform_clustering(X_scaled, y_real):
    print("\n" + "="*70)
    print("  HAPI 6: K-MEANS CLUSTERING (UNSUPERVISED SEGMENTATION)")
    print("="*70)
    
    K = 3
    km = KMeans(n_clusters=K, random_state=RANDOM_STATE, n_init=20)
    km.fit(X_scaled)
    
    sil = silhouette_score(X_scaled, km.labels_)
    ars = adjusted_rand_score(y_real, km.labels_)
    
    print(f"  Numri i Grupeve (K) : {K}")
    print(f"  Silhouette Score    : {sil:.4f} (Mbi 0 = grupe te ndara)")
    print(f"  Adjusted Rand Index : {ars:.4f} (Krahasimi me diagnozen reale)")
    
    # Renditja e clustereve sipas Glucose mesatare
    df = X_scaled.copy()
    df['cluster'] = km.labels_
    df['Outcome'] = y_real.values
    
    glucose_means = df.groupby('cluster')['Glucose'].mean().sort_values()
    cluster_order = glucose_means.index.tolist()
    
    risk_labels = {
        cluster_order[0]: 'Rrezik i Ulet',
        cluster_order[1]: 'Rrezik Mesatar',
        cluster_order[2]: 'Rrezik i Larte'
    }
    
    print("\n  Karakteristikat e Grupeve të Zbuluara:")
    for cluster_id in cluster_order:
        subset = df[df['cluster'] == cluster_id]
        label = risk_labels[cluster_id]
        total = len(subset)
        diabetic_pct = subset['Outcome'].mean() * 100
        print(f"    * Cluster {cluster_id} ({label}): {total} pacientë | {diabetic_pct:.1f}% Diabetikë realë")
        
    # Ruaj modelin e clustering
    with open(MODELS_DIR / "diabetes_kmeans.pkl", "wb") as f:
        pickle.dump({
            'model': km,
            'risk_labels': risk_labels,
            'feature_names': X_scaled.columns.tolist()
        }, f)


# =============================================================================
# 7. TESTIMI I PARASHIKIMIT END-TO-END
# =============================================================================
def test_prediction(scaler, feature_names):
    print("\n" + "="*70)
    print("  HAPI 7: TESTIMI I PARASHIKIMIT MBI NJË PACIENT SHEMBULL")
    print("="*70)
    
    # Ngarko modelin e Random Forest (production) dhe K-Means
    with open(MODELS_DIR / "diabetes_random_forest.pkl", "rb") as f:
        model = pickle.load(f)
    with open(MODELS_DIR / "diabetes_kmeans.pkl", "rb") as f:
        kmeans_data = pickle.load(f)
        
    # Pacient me parametra metabolike te larte
    pacient_shembull = {
        "Pregnancies": 6,
        "Glucose": 148.0,
        "BloodPressure": 72.0,
        "SkinThickness": 35.0,
        "Insulin": 120.0,
        "BMI": 33.6,
        "DiabetesPedigreeFunction": 0.627,
        "Age": 50
    }
    
    # Konverto ne dataframe me renditje te sakt kolonash
    df_pacient = pd.DataFrame([pacient_shembull])[feature_names]
    
    # Skalo
    df_pacient_scaled = pd.DataFrame(scaler.transform(df_pacient), columns=feature_names)
    
    # Parashiko Diabetin
    prediction = int(model.predict(df_pacient_scaled)[0])
    probability = float(model.predict_proba(df_pacient_scaled)[0][1])
    
    # Parashiko Grupin e Rrezikut me K-Means
    cluster_id = kmeans_data['model'].predict(df_pacient_scaled)[0]
    risk_group = kmeans_data['risk_labels'][cluster_id]
    
    print("  Të dhënat e Pacientit të Testuar:")
    for k, v in pacient_shembull.items():
        print(f"    - {k:<25}: {v}")
        
    print("\n  Rezultatet e Inteligjencës Artificiale:")
    print(f"    * Parashikimi i Diabetit : {prediction} (0=Jo, 1=Po)")
    print(f"    * Probabiliteti i Diabetit: {probability*100:.2f}%")
    print(f"    * Grupi i Rrezikut (K-Means): {risk_group}")


# =============================================================================
# MAIN EXECUTION
# =============================================================================
def main():
    csv_path = DATASETS_DIR / "diabetes.csv"
    if not csv_path.exists():
        print(f"[Gabim] Nuk u gjet dataset-i në: {csv_path}")
        print("Ju lutem sigurohuni që 'datasets/diabetes.csv' ekziston përpara ekzekutimit.")
        sys.exit(1)
        
    df = pd.read_csv(csv_path)
    
    # 1. Inspekto
    inspect_dataset(df)
    
    # 2. Preprocess
    df_clean = preprocess_data(df)
    
    # 3. Ndarja dhe skalimi
    X_train_scaled, X_test_scaled, y_train, y_test, scaler = split_and_scale_data(df_clean)
    
    # 4. Trajnimi i modeleve supervised
    train_supervised_models(X_train_scaled, X_test_scaled, y_train, y_test)
    
    # 5. Cross-Validation
    perform_cross_validation(X_train_scaled, y_train)
    
    # 6. Clustering
    # Bashkojme train dhe test te skaluar per te bere clustering te te gjithe pacientet
    X_full_scaled = pd.concat([X_train_scaled, X_test_scaled], ignore_index=True)
    y_full = pd.concat([y_train, y_test], ignore_index=True)
    perform_clustering(X_full_scaled, y_full)
    
    # 7. Testo Parashikimin
    test_prediction(scaler, X_train_scaled.columns.tolist())
    
    print("\n" + "="*70)
    print("  [SUCCESS] PËRFUNDUAN TË GJITHA HAPAT E PIPELINE-IT ME SUKSES!")
    print("="*70)


if __name__ == "__main__":
    main()
