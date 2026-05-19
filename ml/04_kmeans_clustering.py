"""
HealthConnect AI - Skripti 04: K-Means Clustering
==================================================
Autor: Erdona Kadriolli

Qellimi: Grupimi i pacienteve sipas rrezikut shendetesor
         pa etiketa paraprake (unsupervised learning).

Hapat:
  1. Elbow Method - gjetja e numrit optimal te clusters (K)
  2. K-Means trajnimi me K optimal
  3. Analiza e cdo grupi (profili i pacientit)
  4. Krahasimi me etiketat reale (sa mire i ndau K-Means?)
  5. Ruajtja e rezultateve

Dataset: Diabeti (Pima Indians) - me i miri per clustering
         sepse ka me shume rreshta (768) dhe features numerike
"""

import pandas as pd
import pickle
from pathlib import Path
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, adjusted_rand_score

# Konfigurimi
PROCESSED_DIR = Path(__file__).parent.parent / "datasets" / "processed"
MODELS_DIR    = Path(__file__).parent.parent / "models"
RANDOM_STATE  = 42


# =============================================================================
# HAPI 1: ELBOW METHOD
# =============================================================================

def elbow_method(X: pd.DataFrame, max_k: int = 10) -> int:
    """
    Gjen numrin optimal te clusters duke perdorur Elbow Method.
    Llogarit WCSS (Within-Cluster Sum of Squares) per K=2..10.
    K optimale = pika ku WCSS fillon te bije me ngadale (bëhet si bërryl).
    """
    print(f"\n  ELBOW METHOD (K=2 deri {max_k})")
    print(f"  {'─'*40}")
    print(f"  {'K':>4} | {'WCSS':>12} | {'Silhouette':>10} | Grafik")
    print(f"  {'─'*40}")

    wcss_values = []
    sil_values  = []

    for k in range(2, max_k + 1):
        km = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10)
        labels = km.fit_predict(X)
        wcss = km.inertia_
        sil  = silhouette_score(X, labels)

        wcss_values.append(wcss)
        sil_values.append(sil)

        # Vizualizim tekstual i WCSS
        bar_len = int(wcss / wcss_values[0] * 30)
        bar = '█' * bar_len

        print(f"  K={k:>2} | {wcss:>12.1f} | {sil:>10.4f} | {bar}")

    # Gjej K optimale me metoden e diferencave
    diffs = [wcss_values[i] - wcss_values[i+1] for i in range(len(wcss_values)-1)]
    diffs2 = [diffs[i] - diffs[i+1] for i in range(len(diffs)-1)]
    optimal_k = diffs2.index(max(diffs2)) + 3  # +3 sepse fillojme nga K=2

    # Gjej K me Silhouette me te larte
    best_sil_k = sil_values.index(max(sil_values)) + 2

    print(f"\n  Elbow Method sugjeron  : K = {optimal_k}")
    print(f"  Silhouette sugjeron    : K = {best_sil_k}")

    # Perdor K=3 si kompromis i mire per interpretim mjekesor
    final_k = 3
    print(f"  K final i zgjedhur     : K = {final_k} (i pershtatshem per rrezik: i-ulet, mesatar, i-larte)")

    return final_k


# =============================================================================
# HAPI 2: TRAJNIMI I K-MEANS
# =============================================================================

def train_kmeans(X: pd.DataFrame, k: int) -> KMeans:
    """Trajnon K-Means me K te dhene."""
    print(f"\n  TRAJNIMI I K-MEANS (K={k})")
    print(f"  {'─'*40}")

    km = KMeans(
        n_clusters=k,
        random_state=RANDOM_STATE,
        n_init=20,        # 20 inicializime te ndryshme
        max_iter=300
    )
    km.fit(X)

    sil = silhouette_score(X, km.labels_)
    print(f"  Silhouette Score : {sil:.4f} (me i larte = grupe me te ndara)")
    print(f"  WCSS (Inertia)   : {km.inertia_:.2f}")
    print(f"  Iteracione       : {km.n_iter_}")

    return km


# =============================================================================
# HAPI 3: ANALIZA E GRUPEVE
# =============================================================================

def analyze_clusters(X: pd.DataFrame, y: pd.Series, km: KMeans, feature_names: list):
    """
    Analizon cdo cluster dhe krijon profilin e pacientit.
    Rendit clusteret sipas nivelit te rrezikut (Glucose mesatare).
    """
    print(f"\n  ANALIZA E GRUPEVE")
    print(f"  {'─'*50}")

    df = X.copy()
    df['cluster'] = km.labels_
    df['outcome'] = y.values

    # Rendit clusteret sipas Glucose (indikator kryesor i diabetit)
    glucose_means = df.groupby('cluster')['Glucose'].mean().sort_values()
    cluster_order = glucose_means.index.tolist()

    # Emrat e rrezikut
    risk_labels = {
        cluster_order[0]: 'Rrezik i Ulet',
        cluster_order[1]: 'Rrezik Mesatar',
        cluster_order[2]: 'Rrezik i Larte',
    }

    results = []

    for cluster_id in cluster_order:
        subset = df[df['cluster'] == cluster_id]
        risk   = risk_labels[cluster_id]
        n      = len(subset)
        pct_diabetic = subset['outcome'].mean() * 100

        print(f"\n  Cluster {cluster_id} — {risk}")
        print(f"    Paciente : {n} ({n/len(df)*100:.1f}%)")
        print(f"    Diabetik : {pct_diabetic:.1f}% e grupit")
        print(f"    Profili  :")

        for feat in feature_names:
            val = subset[feat].mean()
            print(f"      {feat:<28}: {val:.2f}")

        results.append({
            'cluster': cluster_id,
            'risk_level': risk,
            'n_patients': n,
            'pct_diabetic': round(pct_diabetic, 2),
        })

    return risk_labels, results


# =============================================================================
# HAPI 4: KRAHASIMI ME ETIKETAT REALE
# =============================================================================

def compare_with_labels(y: pd.Series, km: KMeans, risk_labels: dict):
    """
    Krahason clusteret e K-Means me etiketat reale (Outcome).
    Perdor Adjusted Rand Score per te matur cilesine.
    """
    print(f"\n  KRAHASIMI ME ETIKETAT REALE")
    print(f"  {'─'*40}")

    ars = adjusted_rand_score(y, km.labels_)
    print(f"  Adjusted Rand Score : {ars:.4f}")
    print(f"  Interpretimi        :", end=" ")

    if ars > 0.5:
        print("Shkelqyer - K-Means i ndau mire pacientet!")
    elif ars > 0.3:
        print("Mire - K-Means gjeti strukture te dobishme")
    elif ars > 0.1:
        print("Mesatar - ka nje lidhje te dobet me diagnozat")
    else:
        print("I dobet - clusteret nuk perputhen me diagnozat")

    print(f"\n  Shperndarja e pacienteve diabetik per cluster:")
    df_check = pd.DataFrame({'cluster': km.labels_, 'outcome': y.values})
    for cluster_id, risk in risk_labels.items():
        subset = df_check[df_check['cluster'] == cluster_id]
        n_diabetic = subset['outcome'].sum()
        n_total    = len(subset)
        print(f"    {risk:<20}: {n_diabetic}/{n_total} diabetik ({n_diabetic/n_total*100:.1f}%)")


# =============================================================================
# MAIN
# =============================================================================

def main():
    print("="*60)
    print("  HEALTHCONNECT AI - K-MEANS CLUSTERING")
    print("="*60)
    print("  Dataset: Diabeti (Pima Indians)")
    print("  Qellimi: Grupimi i pacienteve sipas rrezikut shendetesor")

    # Lexo te dhenat
    train_df = pd.read_csv(PROCESSED_DIR / "diabetes_train.csv")
    test_df  = pd.read_csv(PROCESSED_DIR / "diabetes_test.csv")

    # Bashko train+test per clustering (perdorim te gjithe te dhenat)
    full_df = pd.concat([train_df, test_df], ignore_index=True)

    X = full_df.drop(columns=['Outcome'])
    y = full_df['Outcome']
    feature_names = X.columns.tolist()

    print(f"\n  Te dhena totale: {len(full_df)} paciente")
    print(f"  Features       : {len(feature_names)}")

    # Hapi 1: Elbow Method
    optimal_k = elbow_method(X, max_k=10)

    # Hapi 2: Trajno K-Means
    km = train_kmeans(X, k=optimal_k)

    # Hapi 3: Analizo grupet
    risk_labels, cluster_results = analyze_clusters(X, y, km, feature_names)

    # Hapi 4: Krahasimi me etiketat reale
    compare_with_labels(y, km, risk_labels)

    # Ruaj modelin
    km_path = MODELS_DIR / "diabetes_kmeans.pkl"
    with open(km_path, "wb") as f:
        pickle.dump({
            'model': km,
            'risk_labels': risk_labels,
            'feature_names': feature_names
        }, f)
    print(f"\n  [OK] K-Means model ruajt ne: {km_path.name}")

    # Ruaj rezultatet e clustereve
    results_df = pd.DataFrame(cluster_results)
    results_path = MODELS_DIR / "kmeans_results.csv"
    results_df.to_csv(results_path, index=False)
    print(f"  [OK] Rezultatet ruajt ne  : {results_path.name}")

    print(f"\n{'='*60}")
    print(f"  PERFUNDOI")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
