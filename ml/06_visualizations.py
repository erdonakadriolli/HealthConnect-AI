"""
HealthConnect AI - Skripti 06: Vizualizimi i Rezultateve
=========================================================
Autor: Erdona Kadriolli

Qellimi: Krijon grafike profesionale per raportin dhe dashboard-in.

Output (ne dosjen visualizations/):
  1. confusion_matrix_diabetes.png
  2. model_comparison.png
  3. kmeans_clusters.png
  4. feature_importance.png
  5. metrics_radar.png
"""

import pandas as pd
import numpy as np
import pickle
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.metrics import confusion_matrix
from sklearn.decomposition import PCA

# Konfigurimi
PROCESSED_DIR = Path(__file__).parent.parent / "datasets" / "processed"
MODELS_DIR    = Path(__file__).parent.parent / "models"
VIS_DIR       = Path(__file__).parent.parent / "visualizations"
VIS_DIR.mkdir(exist_ok=True)

# Stili
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette("husl")


# =============================================================================
# 1. CONFUSION MATRIX HEATMAPS
# =============================================================================

def plot_confusion_matrix(dataset_name: str, target_col: str, model_filename: str, model_label: str):
    """Krijon Confusion Matrix si heatmap."""

    # Lexo te dhenat
    test_df = pd.read_csv(PROCESSED_DIR / f"{dataset_name}_test.csv")
    X_test = test_df.drop(columns=[target_col])
    y_test = test_df[target_col]

    # Ngarko modelin
    with open(MODELS_DIR / model_filename, "rb") as f:
        model = pickle.load(f)

    # Parashiko
    y_pred = model.predict(X_test)
    cm = confusion_matrix(y_test, y_pred)

    # Plot
    fig, ax = plt.subplots(figsize=(8, 6))

    labels = ['Jo Diabetik', 'Diabetik']
    title = f'Confusion Matrix - Diabeti ({model_label})'

    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=labels, yticklabels=labels,
                cbar_kws={'label': 'Numri i Pacienteve'},
                annot_kws={'size': 18, 'weight': 'bold'},
                ax=ax)

    ax.set_xlabel('Parashikim', fontsize=12, fontweight='bold')
    ax.set_ylabel('Reale', fontsize=12, fontweight='bold')
    ax.set_title(title, fontsize=14, fontweight='bold', pad=15)

    plt.tight_layout()
    output_path = VIS_DIR / f"confusion_matrix_{dataset_name}.png"
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  [OK] Ruajt: {output_path.name}")


# =============================================================================
# 2. KRAHASIMI I MODELEVE (Bar Chart)
# =============================================================================

def plot_model_comparison():
    """Krijon bar chart te krahasimit te modeleve."""

    df = pd.read_csv(MODELS_DIR / "results.csv")

    fig, ax = plt.subplots(figsize=(10, 6))
    metrics = ['accuracy', 'precision', 'recall', 'f1_score']
    metric_labels = ['Accuracy', 'Precision', 'Recall', 'F1-Score']

    subset = df[df['dataset'] == 'diabetes'].copy()
    subset = subset.sort_values('f1_score', ascending=False)

    x = np.arange(len(subset))
    width = 0.2
    colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']

    for i, (metric, label, color) in enumerate(zip(metrics, metric_labels, colors)):
        offset = (i - 1.5) * width
        ax.bar(x + offset, subset[metric], width, label=label, color=color, alpha=0.85)

    ax.set_xticks(x)
    ax.set_xticklabels(subset['model'], rotation=20, ha='right', fontsize=10)
    ax.set_ylabel('Score', fontweight='bold')
    ax.set_title('Krahasimi i Modeleve - DIABETI', fontsize=13, fontweight='bold')
    ax.legend(loc='lower right', framealpha=0.9)
    ax.set_ylim(0, 1.05)
    ax.grid(axis='y', alpha=0.3)
    ax.axvspan(-0.4, 0.4, alpha=0.15, color='green', label='_nolegend_')

    plt.suptitle('Krahasimi i Performances se Modeleve ML', fontsize=15, fontweight='bold', y=1.02)
    plt.tight_layout()

    output_path = VIS_DIR / "model_comparison.png"
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  [OK] Ruajt: {output_path.name}")


# =============================================================================
# 3. K-MEANS CLUSTERS (PCA 2D)
# =============================================================================

def plot_kmeans_clusters():
    """Vizualizon clusteret K-Means ne hapesire 2D me PCA."""

    train_df = pd.read_csv(PROCESSED_DIR / "diabetes_train.csv")
    test_df  = pd.read_csv(PROCESSED_DIR / "diabetes_test.csv")
    full_df  = pd.concat([train_df, test_df], ignore_index=True)

    X = full_df.drop(columns=['Outcome'])
    y = full_df['Outcome']

    # Ngarko K-Means
    with open(MODELS_DIR / "diabetes_kmeans.pkl", "rb") as f:
        km_data = pickle.load(f)

    km = km_data['model']
    risk_labels = km_data['risk_labels']

    # PCA per 2D
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X)

    fig, axes = plt.subplots(1, 2, figsize=(16, 6))

    # Plot 1: Cluster-at K-Means
    ax = axes[0]
    cluster_colors = ['#2ecc71', '#f39c12', '#e74c3c']  # gjelber, portokalli, kuqe
    cluster_order_for_legend = sorted(risk_labels.keys(), key=lambda c: list(risk_labels.values())[c].count('Ulet') + list(risk_labels.values())[c].count('Mesatar'))

    # Renditje sipas: i Ulet -> Mesatar -> i Larte
    risk_order = ['Rrezik i Ulet', 'Rrezik Mesatar', 'Rrezik i Larte']
    for i, risk_name in enumerate(risk_order):
        cluster_id = [k for k, v in risk_labels.items() if v == risk_name][0]
        mask = km.labels_ == cluster_id
        ax.scatter(X_pca[mask, 0], X_pca[mask, 1],
                  c=cluster_colors[i], label=risk_name,
                  s=40, alpha=0.6, edgecolors='white', linewidth=0.5)

    # Centroids
    centroids_pca = pca.transform(km.cluster_centers_)
    ax.scatter(centroids_pca[:, 0], centroids_pca[:, 1],
              c='black', marker='X', s=300, edgecolors='white', linewidth=2,
              label='Qendrat e Clustereve', zorder=5)

    ax.set_xlabel(f'PCA 1 ({pca.explained_variance_ratio_[0]*100:.1f}% variancë)', fontweight='bold')
    ax.set_ylabel(f'PCA 2 ({pca.explained_variance_ratio_[1]*100:.1f}% variancë)', fontweight='bold')
    ax.set_title('K-Means Clusters: 3 Grupe Rreziku', fontsize=13, fontweight='bold')
    ax.legend(loc='best', framealpha=0.9)
    ax.grid(alpha=0.3)

    # Plot 2: Etiketat reale
    ax = axes[1]
    ax.scatter(X_pca[y == 0, 0], X_pca[y == 0, 1],
              c='#3498db', label='Jo Diabetik', s=40, alpha=0.6,
              edgecolors='white', linewidth=0.5)
    ax.scatter(X_pca[y == 1, 0], X_pca[y == 1, 1],
              c='#e74c3c', label='Diabetik', s=40, alpha=0.6,
              edgecolors='white', linewidth=0.5)

    ax.set_xlabel(f'PCA 1 ({pca.explained_variance_ratio_[0]*100:.1f}% variancë)', fontweight='bold')
    ax.set_ylabel(f'PCA 2 ({pca.explained_variance_ratio_[1]*100:.1f}% variancë)', fontweight='bold')
    ax.set_title('Etiketat Reale (per krahasim)', fontsize=13, fontweight='bold')
    ax.legend(loc='best', framealpha=0.9)
    ax.grid(alpha=0.3)

    plt.suptitle('K-Means Clustering i Pacienteve me Diabet', fontsize=15, fontweight='bold', y=1.02)
    plt.tight_layout()

    output_path = VIS_DIR / "kmeans_clusters.png"
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  [OK] Ruajt: {output_path.name}")


# =============================================================================
# 4. FEATURE IMPORTANCE (Random Forest)
# =============================================================================

def plot_feature_importance():
    """Tregon feature importance nga Random Forest."""

    fig, ax = plt.subplots(figsize=(10, 6))

    train_df = pd.read_csv(PROCESSED_DIR / "diabetes_train.csv")
    feature_names = [c for c in train_df.columns if c != 'Outcome']

    with open(MODELS_DIR / "diabetes_random_forest.pkl", "rb") as f:
        rf_diabetes = pickle.load(f)

    importances = pd.Series(rf_diabetes.feature_importances_, index=feature_names).sort_values()

    bars = ax.barh(importances.index, importances.values, color='#3498db', alpha=0.85)
    ax.set_xlabel('Rëndësia', fontweight='bold')
    ax.set_title('Feature Importance - Diabeti (Random Forest)', fontsize=13, fontweight='bold')
    ax.grid(axis='x', alpha=0.3)

    for bar, val in zip(bars, importances.values):
        ax.text(val + 0.005, bar.get_y() + bar.get_height()/2,
               f'{val:.3f}', va='center', fontsize=9)

    plt.suptitle('Cilat Features Jane Me te Rendesishme per Parashikim?',
                fontsize=15, fontweight='bold', y=1.02)
    plt.tight_layout()

    output_path = VIS_DIR / "feature_importance.png"
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  [OK] Ruajt: {output_path.name}")


# =============================================================================
# 5. RADAR CHART - METRIKAT E MODELEVE
# =============================================================================

def plot_metrics_radar():
    """Krijon radar chart per krahasim te metrikave."""

    df = pd.read_csv(MODELS_DIR / "results.csv")

    fig, ax = plt.subplots(figsize=(8, 7), subplot_kw=dict(projection='polar'))

    metrics = ['accuracy', 'precision', 'recall', 'f1_score']
    metric_labels = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
    angles = np.linspace(0, 2 * np.pi, len(metrics), endpoint=False).tolist()
    angles += angles[:1]

    colors = plt.cm.viridis(np.linspace(0, 0.9, 5))
    subset = df[df['dataset'] == 'diabetes']

    for i, (_, row) in enumerate(subset.iterrows()):
        values = [row[m] for m in metrics]
        values += values[:1]

        ax.plot(angles, values, 'o-', linewidth=2, label=row['model'], color=colors[i])
        ax.fill(angles, values, alpha=0.1, color=colors[i])

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(metric_labels, fontsize=11, fontweight='bold')
    ax.set_ylim(0, 1)
    ax.set_yticks([0.2, 0.4, 0.6, 0.8, 1.0])
    ax.set_yticklabels(['0.2', '0.4', '0.6', '0.8', '1.0'], fontsize=8)
    ax.set_title('DIABETI', fontsize=13, fontweight='bold', pad=20)
    ax.legend(loc='upper right', bbox_to_anchor=(1.4, 1.1), fontsize=8)
    ax.grid(alpha=0.4)

    plt.suptitle('Profili i Performances se Modeleve (Radar Chart)',
                fontsize=15, fontweight='bold', y=1.05)
    plt.tight_layout()

    output_path = VIS_DIR / "metrics_radar.png"
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  [OK] Ruajt: {output_path.name}")


# =============================================================================
# MAIN
# =============================================================================

def main():
    print("="*60)
    print("  HEALTHCONNECT AI - VIZUALIZIMI I REZULTATEVE")
    print("="*60)

    print("\n[1/5] Confusion Matrix...")
    plot_confusion_matrix("diabetes", "Outcome", "diabetes_random_forest.pkl", "Random Forest")

    print("\n[2/5] Krahasimi i modeleve...")
    plot_model_comparison()

    print("\n[3/5] K-Means clusters...")
    plot_kmeans_clusters()

    print("\n[4/5] Feature importance...")
    plot_feature_importance()

    print("\n[5/5] Radar chart...")
    plot_metrics_radar()

    print(f"\n{'='*60}")
    print(f"  PERFUNDOI - 5 grafike u ruajten ne: visualizations/")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
