"""
HealthConnect AI - Skripti 02: Preprocessing i te Dhenave
==========================================================
Autor: Erdona Kadriolli

Qellimi: Pastron, pergatit dhe ndan te dhenat per trajnim modeli.

Hapat:
  1. Trajtim vlerash te munguara (zero ne kolona kritike per diabet)
  2. Trajtim outliers (IQR method)
  3. Normalizim/Skalim (StandardScaler)
  4. Ndarje train/test (80/20 stratifikuar)
  5. Ruajtje e te dhenave te pergatitura

Inputi:
  datasets/diabetes.csv

Output:
  datasets/processed/diabetes_train.csv
  datasets/processed/diabetes_test.csv
  datasets/processed/scalers.pkl
"""

import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle

# Konfigurimi
RAW_DIR = Path(__file__).parent.parent / "datasets"
PROCESSED_DIR = RAW_DIR / "processed"
PROCESSED_DIR.mkdir(exist_ok=True)

RANDOM_STATE = 42
TEST_SIZE = 0.2


# =============================================================================
# FUNKSIONE TE PERGJITHSHME
# =============================================================================

def handle_missing_values_diabetes(df: pd.DataFrame) -> pd.DataFrame:
    """
    Te dhenat e Pima Indians kane vlera 0 ne kolona ku 0 nuk eshte realiste
    (p.sh. Glucose=0 do te thote pacient i vdekur). Keto jane vlera te munguara
    te koduara si 0. I zevendesojme me median e klases.
    """
    df = df.copy()
    cols_with_zero_as_missing = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
    
    print(f"  Trajtimi i vlerave te munguara (kodifikuar si 0):")
    # Konverto kolonat numerike ne float per te shmangur problemet me median
    for col in cols_with_zero_as_missing:
        df[col] = df[col].astype(float)
    
    for col in cols_with_zero_as_missing:
        n_zeros = (df[col] == 0).sum()
        if n_zeros > 0:
            # Zevendeso me median e secilës klasë (0 ose 1)
            for outcome in [0, 1]:
                mask = (df[col] == 0) & (df['Outcome'] == outcome)
                # Median e vlerave jo-zero per ate klase
                median_val = df.loc[(df[col] != 0) & (df['Outcome'] == outcome), col].median()
                df.loc[mask, col] = median_val
            print(f"    {col:<20}: {n_zeros} vlera 0 -> zevendesuar me median e klases")
    
    return df


def handle_outliers_iqr(df: pd.DataFrame, target_col: str, threshold: float = 1.5) -> pd.DataFrame:
    """
    Trajton outliers me metoden IQR (Interquartile Range).
    Vlerat jashte [Q1 - 1.5*IQR, Q3 + 1.5*IQR] i kalon ne kufijte perkates (capping).
    Nuk i fshin rreshtat — vetem i "shtrengon" vlerat ekstreme.
    """
    df = df.copy()
    feature_cols = [c for c in df.columns if c != target_col]
    
    n_capped_total = 0
    print(f"  Trajtimi i outliers (IQR capping):")
    
    for col in feature_cols:
        if df[col].dtype not in ['int64', 'float64']:
            continue
        # Anashkalo kolonat kategorike (me pak unike)
        if df[col].nunique() <= 5:
            continue
        
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - threshold * IQR
        upper = Q3 + threshold * IQR
        
        n_below = (df[col] < lower).sum()
        n_above = (df[col] > upper).sum()
        n_capped = n_below + n_above
        
        if n_capped > 0:
            df[col] = df[col].clip(lower, upper)
            n_capped_total += n_capped
            print(f"    {col:<25}: {n_capped} outliers -> capped [{lower:.1f}, {upper:.1f}]")
    
    print(f"  Total outliers te trajtuar: {n_capped_total}")
    return df


def split_and_scale(df: pd.DataFrame, target_col: str, dataset_name: str):
    """
    Ndan te dhenat ne train/test (stratifikuar) dhe i skalon me StandardScaler.
    Skaler-i trajnohet VETEM ne train, pastaj aplikohet ne test (per te shmangur data leakage).
    """
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    # Ndarje stratifikuar (ruan balancen e klasave ne te dy setet)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, 
        test_size=TEST_SIZE, 
        stratify=y, 
        random_state=RANDOM_STATE
    )
    
    print(f"  Ndarja:")
    print(f"    Train : {len(X_train)} rreshta ({(1-TEST_SIZE)*100:.0f}%)")
    print(f"    Test  : {len(X_test)} rreshta ({TEST_SIZE*100:.0f}%)")
    print(f"    Balanca train: {y_train.value_counts(normalize=True).round(3).to_dict()}")
    print(f"    Balanca test : {y_test.value_counts(normalize=True).round(3).to_dict()}")
    
    # Skalim
    scaler = StandardScaler()
    X_train_scaled = pd.DataFrame(
        scaler.fit_transform(X_train), 
        columns=X_train.columns, 
        index=X_train.index
    )
    X_test_scaled = pd.DataFrame(
        scaler.transform(X_test), 
        columns=X_test.columns, 
        index=X_test.index
    )
    
    # Bashko me y per t'i ruajtur si CSV
    train_df = X_train_scaled.copy()
    train_df[target_col] = y_train.values
    test_df = X_test_scaled.copy()
    test_df[target_col] = y_test.values
    
    # Ruaj
    train_path = PROCESSED_DIR / f"{dataset_name}_train.csv"
    test_path = PROCESSED_DIR / f"{dataset_name}_test.csv"
    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)
    print(f"  [OK] Train ruajt ne: {train_path.name}")
    print(f"  [OK] Test  ruajt ne: {test_path.name}")
    
    return scaler


# =============================================================================
# DIABET
# =============================================================================

def process_diabetes():
    print("\n" + "="*60)
    print("  DIABET (Pima Indians)")
    print("="*60)
    
    df = pd.read_csv(RAW_DIR / "diabetes.csv")
    print(f"  Te dhena origjinale: {df.shape[0]} rreshta x {df.shape[1]} kolona")
    
    # 1. Vlerat e munguara
    df = handle_missing_values_diabetes(df)
    
    # 2. Outliers
    df = handle_outliers_iqr(df, target_col='Outcome')
    
    # 3. Ndarje + skalim
    scaler = split_and_scale(df, target_col='Outcome', dataset_name='diabetes')
    
    return scaler


# =============================================================================
# MAIN
# =============================================================================

def main():
    print("="*60)
    print("  HEALTHCONNECT AI - PREPROCESSING")
    print("="*60)
    print(f"  Random state : {RANDOM_STATE}")
    print(f"  Test size    : {TEST_SIZE*100:.0f}%")
    print(f"  Output dir   : {PROCESSED_DIR}")

    scaler_diabetes = process_diabetes()

    scalers = {
        'diabetes': scaler_diabetes,
    }
    scalers_path = PROCESSED_DIR / "scalers.pkl"
    with open(scalers_path, 'wb') as f:
        pickle.dump(scalers, f)

    print("\n" + "="*60)
    print("  PERFUNDOI")
    print("="*60)
    print(f"  Skedaret e gjeneruar:")
    for f in sorted(PROCESSED_DIR.iterdir()):
        size = f.stat().st_size / 1024
        print(f"    {f.name:<30} ({size:.1f} KB)")


if __name__ == "__main__":
    main()
