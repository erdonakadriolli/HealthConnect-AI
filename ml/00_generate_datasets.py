"""
HealthConnect AI - Skripti 00: Gjenerimi i Dataset-it
======================================================
Autor: Erdona Kadriolli

Qellimi: Gjeneron dataset-in e Diabetit me strukture identike me Pima Indians.

Te dhenat jane te simuluara mbi baze statistikash publike te dataset-it origjinal.
Per produkt final akademik, zevendesoje me dataset-in real nga:
  - https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database
"""

import numpy as np
import pandas as pd
from pathlib import Path

# Random seed per reproducibilitet
np.random.seed(42)

OUTPUT_DIR = Path(__file__).parent.parent / "datasets"
OUTPUT_DIR.mkdir(exist_ok=True)


def generate_diabetes_dataset(n_samples: int = 768) -> pd.DataFrame:
    """
    Gjeneron dataset-in e Diabetit me strukture Pima Indians.
    
    Kolonat (8 features + 1 target):
    - Pregnancies, Glucose, BloodPressure, SkinThickness,
      Insulin, BMI, DiabetesPedigreeFunction, Age, Outcome
    
    Balanca origjinale: ~65% jo-diabetik, ~35% diabetik
    """
    n_negative = int(n_samples * 0.651)  # 500 jo-diabetik
    n_positive = n_samples - n_negative   # 268 diabetik
    
    # --- Pacientet pa diabet (Outcome=0) ---
    negative = pd.DataFrame({
        'Pregnancies': np.random.poisson(3.3, n_negative).clip(0, 17),
        'Glucose': np.random.normal(110, 26, n_negative).clip(44, 199).round().astype(int),
        'BloodPressure': np.random.normal(68, 18, n_negative).clip(0, 122).round().astype(int),
        'SkinThickness': np.random.normal(19.7, 14.9, n_negative).clip(0, 99).round().astype(int),
        'Insulin': np.random.gamma(2, 30, n_negative).clip(0, 846).round().astype(int),
        'BMI': np.random.normal(30.3, 7.7, n_negative).clip(0, 67.1).round(1),
        'DiabetesPedigreeFunction': np.random.gamma(2, 0.2, n_negative).clip(0.078, 2.42).round(3),
        'Age': np.random.gamma(2, 8, n_negative).clip(21, 81).round().astype(int),
        'Outcome': 0
    })
    
    # --- Pacientet me diabet (Outcome=1) ---
    positive = pd.DataFrame({
        'Pregnancies': np.random.poisson(4.9, n_positive).clip(0, 17),
        'Glucose': np.random.normal(141, 32, n_positive).clip(44, 199).round().astype(int),
        'BloodPressure': np.random.normal(70, 21, n_positive).clip(0, 122).round().astype(int),
        'SkinThickness': np.random.normal(22.2, 17.7, n_positive).clip(0, 99).round().astype(int),
        'Insulin': np.random.gamma(2.5, 40, n_positive).clip(0, 846).round().astype(int),
        'BMI': np.random.normal(35.1, 7.3, n_positive).clip(0, 67.1).round(1),
        'DiabetesPedigreeFunction': np.random.gamma(2.5, 0.22, n_positive).clip(0.078, 2.42).round(3),
        'Age': np.random.gamma(2.5, 10, n_positive).clip(21, 81).round().astype(int),
        'Outcome': 1
    })
    
    # Bashkoji dhe perziej
    df = pd.concat([negative, positive], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Shto disa "zero" si ne dataset-in origjinal (vlera mungese te koduara si 0)
    # Kjo eshte tipike per Pima Indians dataset
    zero_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
    zero_rates = [0.007, 0.046, 0.296, 0.487, 0.014]
    for col, rate in zip(zero_cols, zero_rates):
        n_zeros = int(len(df) * rate)
        idx = np.random.choice(df.index, n_zeros, replace=False)
        df.loc[idx, col] = 0
    
    return df


def main():
    print("="*60)
    print("  GJENERIMI I DATASET-IT")
    print("="*60)

    print("\nPo gjenerohet dataset-i i Diabetit...")
    df_diabetes = generate_diabetes_dataset(768)
    diabetes_path = OUTPUT_DIR / "diabetes.csv"
    df_diabetes.to_csv(diabetes_path, index=False)
    print(f"  [OK] Ruajt ne: {diabetes_path}")
    print(f"  Rreshta: {len(df_diabetes)} | Kolona: {len(df_diabetes.columns)}")
    print(f"  Outcome=0: {(df_diabetes['Outcome']==0).sum()} | Outcome=1: {(df_diabetes['Outcome']==1).sum()}")

    print("\n" + "="*60)
    print("  PERFUNDOI")
    print("="*60)


if __name__ == "__main__":
    main()
