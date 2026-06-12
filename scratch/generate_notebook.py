import json
from pathlib import Path

notebook_content = {
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# 🏥 HealthConnect AI — Pipeline i Plotë i Machine Learning\n",
    "\n",
    "Ky Jupyter Notebook përmban të gjithë procesin e zhvillimit për modelin e Inteligjencës Artificiale të integruar në **HealthConnect AI**:\n",
    "1. **Leximi dhe Inspektimi** i Dataset-it (Pima Indians Diabetes)\n",
    "2. **Preprocessing** (Zëvendësimi i vlerave 0 joreale me medianën dhe capping i outliers me IQR)\n",
    "3. **Ndarja Train/Test (80/20)** dhe **Skalimi** (StandardScaler)\n",
    "4. **Trajnimi i 5 Modeleve Supervised** (k-NN, Random Forest, Logistic Regression, 2x MLP)\n",
    "5. **Cross-Validation** (Stratified 5-Fold) për të vlerësuar qëndrueshmërinë\n",
    "6. **Grupimi Unsupervised** me K-Means (K=3) për zbulimin e profileve të rrezikut metabolik\n",
    "7. **Testimi i Parashikimit** mbi një pacient shembull"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🛠️ Konfigurimi i Mjedisit dhe Importet"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "import os\n",
    "import sys\n",
    "import pickle\n",
    "import warnings\n",
    "import numpy as np\n",
    "import pandas as pd\n",
    "from pathlib import Path\n",
    "\n",
    "# Scikit-Learn imports\n",
    "from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold\n",
    "from sklearn.preprocessing import StandardScaler\n",
    "from sklearn.neighbors import KNeighborsClassifier\n",
    "from sklearn.ensemble import RandomForestClassifier\n",
    "from sklearn.linear_model import LogisticRegression\n",
    "from sklearn.neural_network import MLPClassifier\n",
    "from sklearn.cluster import KMeans\n",
    "from sklearn.metrics import (\n",
    "    accuracy_score, precision_score, recall_score, f1_score,\n",
    "    confusion_matrix, silhouette_score, adjusted_rand_score\n",
    ")\n",
    "\n",
    "warnings.filterwarnings('ignore')\n",
    "\n",
    "# Konfigurimi i shtigjeve\n",
    "BASE_DIR = Path(os.getcwd()).parent if 'ml' in os.getcwd() else Path(os.getcwd())\n",
    "DATASETS_DIR = BASE_DIR / \"datasets\"\n",
    "PROCESSED_DIR = DATASETS_DIR / \"processed\"\n",
    "MODELS_DIR = BASE_DIR / \"models\"\n",
    "\n",
    "PROCESSED_DIR.mkdir(parents=True, exist_ok=True)\n",
    "MODELS_DIR.mkdir(parents=True, exist_ok=True)\n",
    "\n",
    "RANDOM_STATE = 42\n",
    "TEST_SIZE = 0.2\n",
    "\n",
    "print(f\"Base Directory: {BASE_DIR}\")\n",
    "print(f\"Datasets Directory: {DATASETS_DIR}\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🔍 1. Leximi dhe Inspektimi i Dataset-it"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "csv_path = DATASETS_DIR / \"diabetes.csv\"\n",
    "if not csv_path.exists():\n",
    "    raise FileNotFoundError(f\"Nuk u gjet dataset-i ne: {csv_path}\")\n",
    "\n",
    "df = pd.read_csv(csv_path)\n",
    "print(f\"Dimensionet e dataset-it: {df.shape[0]} rreshta x {df.shape[1]} kolona\")\n",
    "print(\"\\n5 Rreshtat e parë:\")\n",
    "print(df.head())\n",
    "\n",
    "print(\"\\nStatistikat Përmbledhëse:\")\n",
    "print(df.describe().round(2))"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "### 1.1 Balanca e Klasave dhe Analiza e Vlerave Munguese (Zeros)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "print(\"Balanca e klasës target 'Outcome':\")\n",
    "counts = df['Outcome'].value_counts()\n",
    "for cls, count in counts.items():\n",
    "    pct = count / len(df) * 100\n",
    "    print(f\"  Klasa {cls} (0=Jo Diabet, 1=Diabet): {count} pacientë ({pct:.1f}%)\")\n",
    "\n",
    "print(\"\\nAnaliza e vlerave zero në kolona joreale:\")\n",
    "cols_with_zeros = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']\n",
    "for col in cols_with_zeros:\n",
    "    n_zeros = (df[col] == 0).sum()\n",
    "    print(f\"  - Kolona {col:<20} ka {n_zeros} vlera zero (0)\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🧼 2. Preprocessing: Zëvendësimi i Zero me Medianë dhe IQR Capping"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "df_clean = df.copy()\n",
    "\n",
    "# 2.1 Median Imputation bazuar në klasën target\n",
    "print(\"Zëvendësimi i zero me medianën e klasës përkatëse:\")\n",
    "for col in cols_with_zeros:\n",
    "    df_clean[col] = df_clean[col].astype(float)\n",
    "    for outcome in [0, 1]:\n",
    "        mask = (df_clean[col] == 0) & (df_clean['Outcome'] == outcome)\n",
    "        median_val = df_clean.loc[(df_clean[col] != 0) & (df_clean['Outcome'] == outcome), col].median()\n",
    "        df_clean.loc[mask, col] = median_val\n",
    "    print(f\"  [OK] Zëvendësuar zeros në: {col}\")\n",
    "\n",
    "# 2.2 IQR Outliers Capping\n",
    "print(\"\\nCapping i vlerave ekstreme (Outliers) me IQR:\")\n",
    "for col in df_clean.columns:\n",
    "    if col == 'Outcome' or df_clean[col].nunique() <= 5:\n",
        "        continue\n",
    "    Q1 = df_clean[col].quantile(0.25)\n",
    "    Q3 = df_clean[col].quantile(0.75)\n",
    "    IQR = Q3 - Q1\n",
    "    lower = Q1 - 1.5 * IQR\n",
    "    upper = Q3 + 1.5 * IQR\n",
    "    \n",
    "    n_capped = ((df_clean[col] < lower) | (df_clean[col] > upper)).sum()\n",
    "    df_clean[col] = df_clean[col].clip(lower, upper)\n",
    "    if n_capped > 0:\n",
    "        print(f\"  - {col:<25}: Capped {n_capped} outliers\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 📊 3. Ndarja Train/Test dhe Skalimi i të Dhënave"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "X = df_clean.drop(columns=['Outcome'])\n",
    "y = df_clean['Outcome']\n",
    "\n",
    "X_train, X_test, y_train, y_test = train_test_split(\n",
    "    X, y, test_size=TEST_SIZE, stratify=y, random_state=RANDOM_STATE\n",
    ")\n",
    "\n",
    "print(f\"Train Set: {X_train.shape[0]} pacientë\")\n",
    "print(f\"Test Set : {X_test.shape[0]} pacientë\")\n",
    "\n",
    "# StandardScaler\n",
    "scaler = StandardScaler()\n",
    "X_train_scaled = pd.DataFrame(scaler.fit_transform(X_train), columns=X_train.columns)\n",
    "X_test_scaled = pd.DataFrame(scaler.transform(X_test), columns=X_test.columns)\n",
    "\n",
    "# Ruajmë skedarët\n",
    "train_save = X_train_scaled.copy()\n",
    "train_save['Outcome'] = y_train.values\n",
    "test_save = X_test_scaled.copy()\n",
    "test_save['Outcome'] = y_test.values\n",
    "\n",
    "train_save.to_csv(PROCESSED_DIR / \"diabetes_train.csv\", index=False)\n",
    "test_save.to_csv(PROCESSED_DIR / \"diabetes_test.csv\", index=False)\n",
    "\n",
    "# Ruajmë skalerin me pickle\n",
    "with open(PROCESSED_DIR / \"scalers.pkl\", 'wb') as f:\n",
    "    pickle.dump({'diabetes': scaler}, f)\n",
    "print(\"\\n[OK] Të dhënat u ndanë, u skaluan dhe u ruajtën me sukses!\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🤖 4. Trajnimi dhe Vlerësimi i 5 Modeleve Supervised"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "models = {\n",
    "    \"kNN (k=5)\": KNeighborsClassifier(n_neighbors=5, metric='euclidean'),\n",
    "    \"Random Forest\": RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE),\n",
    "    \"Logistic Regression\": LogisticRegression(max_iter=1000, random_state=RANDOM_STATE),\n",
    "    \"MLP Neural Network 1\": MLPClassifier(hidden_layer_sizes=(64,), max_iter=500, random_state=RANDOM_STATE, early_stopping=True),\n",
    "    \"MLP Neural Network 2\": MLPClassifier(hidden_layer_sizes=(128, 64, 32), max_iter=500, random_state=RANDOM_STATE, early_stopping=True, learning_rate='adaptive')\n",
    "}\n",
    "\n",
    "results = []\n",
    "best_f1 = 0\n",
    "best_model = None\n",
    "best_model_name = \"\"\n",
    "\n",
    "for name, model in models.items():\n",
    "    model.fit(X_train_scaled, y_train)\n",
    "    y_pred = model.predict(X_test_scaled)\n",
    "    \n",
    "    acc = accuracy_score(y_test, y_pred)\n",
    "    prec = precision_score(y_test, y_pred, zero_division=0)\n",
    "    rec = recall_score(y_test, y_pred, zero_division=0)\n",
    "    f1 = f1_score(y_test, y_pred, zero_division=0)\n",
    "    \n",
    "    print(f\"Modeli: {name:<22} | Accuracy: {acc*100:.2f}% | Precision: {prec:.4f} | Recall: {rec:.4f} | F1-Score: {f1:.4f}\")\n",
    "    \n",
    "    # Ruajmë skedarin .pkl për çdo model\n",
    "    safe_name = name.lower().replace(\" \", \"_\").replace(\"(\", \"\").replace(\")\", \"\").replace(\"=\", \"_\")\n",
    "    with open(MODELS_DIR / f\"diabetes_{safe_name}.pkl\", \"wb\") as f:\n",
    "        pickle.dump(model, f)\n",
    "        \n",
    "    results.append({\"Model\": name, \"Accuracy\": acc, \"Precision\": prec, \"Recall\": rec, \"F1-Score\": f1})\n",
    "    \n",
    "    if f1 > best_f1:\n",
    "        best_f1 = f1\n",
    "        best_model = model\n",
    "        best_model_name = name\n",
    "\n",
    "print(f\"\\n🏆 Modeli më i mirë: {best_model_name} me F1-Score: {best_f1:.4f}\")\n",
    "# Ruajmë modelin më të mirë si modelin kryesor për Backend\n",
    "with open(MODELS_DIR / \"diabetes_production_model.pkl\", \"wb\") as f:\n",
    "    pickle.dump(best_model, f)"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🔄 5. Stratified 5-Fold Cross-Validation"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "print(\"Cross-Validation me Stratified 5-Fold (F1-score):\")\n",
    "skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)\n",
    "\n",
    "for name, model in models.items():\n",
    "    scores = cross_val_score(model, X_train_scaled, y_train, cv=skf, scoring='f1', n_jobs=-1)\n",
    "    print(f\"  - {name:<22} | F1-Mean: {scores.mean():.4f} ± {scores.std():.4f}\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🎯 6. Grupimi Unsupervised me K-Means Clustering (K=3)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "K = 3\n",
    "km = KMeans(n_clusters=K, random_state=RANDOM_STATE, n_init=20)\n",
    "\n",
    "# Bashkojmë të dhënat train + test të skaluara për clustering të plotë\n",
    "X_full_scaled = pd.concat([X_train_scaled, X_test_scaled], ignore_index=True)\n",
    "y_full = pd.concat([y_train, y_test], ignore_index=True)\n",
    "\n",
    "km.fit(X_full_scaled)\n",
    "sil = silhouette_score(X_full_scaled, km.labels_)\n",
    "ars = adjusted_rand_score(y_full, km.labels_)\n",
    "\n",
    "print(f\"Silhouette Score    : {sil:.4f}\")\n",
    "print(f\"Adjusted Rand Index : {ars:.4f}\")\n",
    "\n",
    "# Renditim clusterët sipas Glukozës mesatare për të patur nivele të kuptueshme rreziku\n",
    "df_clust = X_full_scaled.copy()\n",
    "df_clust['cluster'] = km.labels_\n",
    "df_clust['Outcome'] = y_full.values\n",
    "\n",
    "glucose_means = df_clust.groupby('cluster')['Glucose'].mean().sort_values()\n",
    "cluster_order = glucose_means.index.tolist()\n",
    "\n",
    "risk_labels = {\n",
    "    cluster_order[0]: 'Rrezik i Ulet',\n",
    "    cluster_order[1]: 'Rrezik Mesatar',\n",
    "    cluster_order[2]: 'Rrezik i Larte'\n",
    "}\n",
    "\n",
    "print(\"\\nKarakteristikat e Cluster-ave të zbuluar:\")\n",
    "for cid in cluster_order:\n",
    "    subset = df_clust[df_clust['cluster'] == cid]\n",
    "    diab_pct = subset['Outcome'].mean() * 100\n",
    "    print(f\"  * Cluster {cid} ({risk_labels[cid]}): {len(subset)} pacientë | {diab_pct:.1f}% janë diabetikë\")\n",
    "\n",
    "# Ruajmë modelin e K-Means\n",
    "with open(MODELS_DIR / \"diabetes_kmeans.pkl\", \"wb\") as f:\n",
    "    pickle.dump({\n",
    "        'model': km,\n",
    "        'risk_labels': risk_labels,\n",
    "        'feature_names': X.columns.tolist()\n",
    "    }, f)"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🧪 7. Testimi i Parashikimit mbi një Pacient të Ri"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Të dhënat e një pacienti të ri\n",
    "new_patient = {\n",
    "    \"Pregnancies\": 6,\n",
    "    \"Glucose\": 148.0,\n",
    "    \"BloodPressure\": 72.0,\n",
    "    \"SkinThickness\": 35.0,\n",
    "    \"Insulin\": 120.0,\n",
    "    \"BMI\": 33.6,\n",
    "    \"DiabetesPedigreeFunction\": 0.627,\n",
    "    \"Age\": 50\n",
    "}\n",
    "\n",
    "feature_names = X.columns.tolist()\n",
    "df_new = pd.DataFrame([new_patient])[feature_names]\n",
    "\n",
    "# Skalimi\n",
    "df_new_scaled = pd.DataFrame(scaler.transform(df_new), columns=feature_names)\n",
    "\n",
    "# Parashikimi me modelin tonë më të mirë (Random Forest)\n",
    "rf_model = models[\"Random Forest\"]\n",
    "pred = int(rf_model.predict(df_new_scaled)[0])\n",
    "prob = float(rf_model.predict_proba(df_new_scaled)[0][1])\n",
    "\n",
    "# Grupimi me K-Means\n",
    "cid = km.predict(df_new_scaled)[0]\n",
    "risk = risk_labels[cid]\n",
    "\n",
    "print(\"Rezultati i Parashikimit:\")\n",
    "print(f\"  - Parashikimi i Diabetit : {pred} (1 = Po, 0 = Jo)\")\n",
    "print(f\"  - Probabiliteti          : {prob*100:.1f}%\")\n",
    "print(f\"  - Grupi i Rrezikut       : {risk}\")"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "name": "python"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 2
}

output_notebook_path = Path(__file__).resolve().parent.parent / "ml" / "healthconnect_ml.ipynb"
with open(output_notebook_path, "w", encoding="utf-8") as f:
    json.dump(notebook_content, f, indent=1)
print(f"[SUCCESS] Generated Jupyter Notebook at: {output_notebook_path}")
