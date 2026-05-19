"""
HealthConnect AI - Skripti 01: Inspektimi i Dataset-it
=======================================================
Autor: Erdona Kadriolli
Qellimi: Lexon dataset-in e Diabetit, tregon statistika baze
         dhe verifikon strukturen.

Si te perdoret:
    1. Vendos CSV-ne ne dosjen datasets/:
       - datasets/diabetes.csv
    2. Ekzekuto: python 01_inspect_datasets.py
"""

import pandas as pd
from pathlib import Path

# Rruga e dosjes me dataset-e
DATASETS_DIR = Path(__file__).parent.parent / "datasets"


def inspect_dataset(filename: str, name: str) -> pd.DataFrame | None:
    """Lexon dhe inspekton nje dataset."""
    filepath = DATASETS_DIR / filename
    
    print(f"\n{'='*60}")
    print(f"  DATASET: {name}")
    print(f"{'='*60}")
    
    if not filepath.exists():
        print(f"  [GABIM] Skedari nuk u gjet: {filepath}")
        print(f"  Vendos CSV-ne ne: {filepath}")
        return None
    
    # Lexo CSV-ne
    df = pd.read_csv(filepath)
    
    print(f"  Numri i rreshtave   : {len(df)}")
    print(f"  Numri i kolonave    : {len(df.columns)}")
    print(f"  Madhesia ne MB      : {filepath.stat().st_size / 1024:.2f} KB")
    
    print(f"\n  Kolonat:")
    for i, col in enumerate(df.columns, 1):
        dtype = df[col].dtype
        nulls = df[col].isnull().sum()
        unique = df[col].nunique()
        print(f"    {i:2}. {col:<30} | tip: {str(dtype):<10} | null: {nulls:<4} | unike: {unique}")
    
    print(f"\n  5 rreshtat e pare:")
    print(df.head().to_string(index=False))
    
    print(f"\n  Statistika numerike:")
    print(df.describe().round(2).to_string())
    
    # Kontrollo balancen e klasave (nese ka kolone target)
    target_candidates = ['Outcome', 'outcome', 'target', 'Target', 'condition', 'class']
    for tc in target_candidates:
        if tc in df.columns:
            print(f"\n  Balanca e klasave ('{tc}'):")
            counts = df[tc].value_counts().sort_index()
            for cls, count in counts.items():
                pct = count / len(df) * 100
                bar = '█' * int(pct / 2)
                print(f"    Klasa {cls}: {count:>4} ({pct:.1f}%) {bar}")
            break
    
    return df


def main():
    print("\n" + "="*60)
    print("  HEALTHCONNECT AI - INSPEKTIMI I DATASET-IT")
    print("="*60)
    print(f"  Dosja e dataset-it: {DATASETS_DIR}")

    df_diabetes = inspect_dataset("diabetes.csv", "Diabeti (Pima Indians)")

    print(f"\n{'='*60}")
    print(f"  PERMBLEDHJE")
    print(f"{'='*60}")

    if df_diabetes is not None:
        print(f"  [OK] Diabet : {len(df_diabetes)} rreshta x {len(df_diabetes.columns)} kolona")
    else:
        print(f"  [MUNGON] Diabet")

    print()


if __name__ == "__main__":
    main()
