# 🏥 HealthConnect AI — Personal Health Assistant

Një platformë e fuqizuar nga Inteligjenca Artificiale për monitorimin, analizimin dhe parashikimin e shëndetit metabolik (si rreziku i diabetit), e krijuar posaçërisht për individë dhe pacientë. 

Ky sistem është **100% i përqendruar te pacienti (personal-health-centric)**. Çdo përdorues normal mund të mbikëqyrë në mënyrë të pavarur dhe të sigurt shëndetin e tij.

> **Projekt akademik** — Laboratorike 2 (Programim) & Machine Learning Models (MM)  
> Universiteti për Biznes dhe Teknologji — UBT  
> Viti Akademik 2025-2026

---

## 👥 Ekipi

| Anëtari | Roli | Përgjegjësia |
|---------|------|--------------|
| **Erdona Kadriolli** | Data & ML Engineer | Dataset-et, Preprocessing, Modelet ML, OCR me LEADTOOLS, API Docs |
| **Fatlum Syla** | Backend Developer | FastAPI, Databaza Personale, JWT Auth, WebSockets |
| **Yll Bytyqi** | Frontend Developer | React + Vite, Dashboard, Real-Time Analytics |

---

## 🧠 Veçoritë Kryesore të Sistemit

HealthConnect AI ofron një mjedis të plotë dhe të thjeshtë për monitorim shëndetësor vetjak:

*   🤖 **Parashikim me Inteligjencë Artificiale**: Model i trajnuar ML (Random Forest) që vlerëson menjëherë gjasat e diabetit bazuar në 8 tregues kryesorë metabolikë, si dhe K-Means për grupimin në kategori klinike rreziku.
*   📄 **OCR i Analizave (Foto & PDF)**: Ngarko direkt foton apo dokumentin PDF të analizës laboratorike lokalisht. Sistemi përdor **LEADTOOLS OCR SDK** për të lexuar dhe plotësuar automatikisht të 8 fushat e nevojshme klinike.
*   🌐 **Ndërfaqe plotësisht Dygjuhëshe (SHQIP / ENGLISH)**: Me një klikim të vetëm në krye të dritares kryesore, i gjithë aplikacioni (titujt, shpjegimet, fushat, butonat, grafikët dhe të gjitha rezultatet) kthehet në gjuhën e zgjedhur.
*   🚨 **Sistem i Sigurisë Klinike (Emergjenca si Hipoglikemia)**: Nëse një vlerë është e ulët (si p.sh. Glukoza < 70 mg/dL që tregon Hipoglikemi), sistemi automatikisht ndez alarmin e rrezikut të lartë shëndetësor me ngjyrë të kuqe dhe jep rekomandimin e duhur për kontroll të menjëhershëm, duke parandaluar raportimet e gabuara të modelit 0%.
*   📊 **Vizualizim Interaktiv me Grafikë**: Grafikë interaktivë shtyllë (Bar Chart), profile rreziku (Radar Chart) dhe grafik rrethor i probabilitetit (Donut) të cilët ngjyrosen dinamikisht (e gjelbër = normale, portokalli = vlerë e ulët, e kuqe = vlerë e lartë/rrezik).

---

## 🛠 Stack Teknologjik

| Shtresa | Teknologjia |
|---------|-------------|
| **Backend** | Python — FastAPI |
| **Frontend** | React + Vite (Chart.js, react-chartjs-2, Lucide Icons) |
| **Databaza SQL** | PostgreSQL / SQLAlchemy |
| **ML Models** | scikit-learn, pandas, numpy, joblib |
| **OCR Service** | LEADTOOLS OCR SDK (me mbështetje për formatele PDF, JPEG, PNG, TIFF) |
| **Siguria** | JWT Authentication (Access & Refresh Tokens) |

---

## 📁 Struktura e Projektit

```
HealthConnect-AI/
│
├── backend/                    # Fatlumi — FastAPI & Databases
│   ├── app/
│   │   ├── Controllers/        # auth_controller, ml_controller
│   │   ├── Services/           # auth_service, ml_service, ocr_service
│   │   ├── Repositories/       # auth_repository
│   │   ├── models.py           # Bazat e të dhënave për monitorim personal
│   │   ├── schemas.py          # Pydantic validation schemas
│   │   ├── security.py         # JWT Token secure operations
│   │   ├── database.py         # Database engine setup
│   │   └── deps.py             # User access dependencies
│   ├── main.py                 # FastAPI Entry point
│   └── requirements.txt
│
├── frontend/                   # Ylli — React + Vite (Dashboard)
│   ├── src/
│   │   ├── pages/              # Login, Register, DiabetesPredict (Faqja kryesore e parashikimit)
│   │   ├── components/         # Navbar, ProtectedRoute, ui/* (OCRDataCharts, PredictionModal)
│   │   ├── api/                # axios instanca, authApi, predictionApi
│   │   └── utils/              # Token storage
│   └── package.json
│
├── ml/                         # Erdona — Machine Learning Core
│   ├── 00_generate_datasets.py # Përgatitja e të dhënave fillestare
│   ├── 02_preprocessing.py     # Pastrimi + skalimi i të dhënave
│   ├── 03_train_models.py      # Trajnimi i 5 modeleve ML (RF, kNN, MLP, etj.)
│   ├── 04_kmeans_clustering.py # K-Means për ndarjen e grupeve të rrezikut
│   ├── 05_predict.py           # Integrimi i predikimit për backend
│   └── 06_visualizations.py    # Gjenerimi i matricave të konfuzionit dhe grafikëve ML
│
├── datasets/                   # Pima Indians Diabetes CSV Datasets
├── models/                     # Modelet e trajnuara (.pkl)
├── visualizations/             # Grafikët e analizave të modeleve ML
└── README.md
```

---

## ⚙️ Instalimi dhe Ekzekutimi

### Kërkesat Paraprake
*   Python 3.10+
*   Node.js 18+
*   PostgreSQL
*   **LEADTOOLS SDK v23** (e instaluar në `C:\LEADTOOLS23` me licencë aktive)

---

### 1. Backend Setup

```bash
cd backend

# Krijo dhe aktivizo venv
python -m venv .venv
.venv\Scripts\activate

# Instalo dependencies
pip install -r requirements.txt

# Konfiguro skedarin .env duke vendosur shtigjet e LEADTOOLS:
#   LEADTOOLS_INSTALL_DIR=C:\LEADTOOLS23
#   LEADTOOLS_LICENSE_DIR=C:\LEADTOOLS23\Support\Common\License
#   LEADTOOLS_OCR_RUNTIME_DIR=C:\LEADTOOLS23\Bin\Common\OcrLEADRuntime

# Starto serverin e zhvillimit
python -m uvicorn main:app --reload --port 8000
```
Swagger API Docs do të jetë i disponueshëm në: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Instalo dependencies
npm install

# Ndez serverin e Vite (duke anashkaluar skriptet e bllokuara në PowerShell)
cmd /c "npm run dev"
```
Aplikacioni do të jetë aktiv në: `http://localhost:5174` (ose `http://localhost:5173`)

---

## 🤖 Modelet ML — Rezultatet e Trajnimit

### Klasifikimi i Diabetit (Random Forest kryesori)
*   **Random Forest Acc**: **85.71%** (F1-score: 0.79)
*   kNN Accuracy: 84.42%
*   MLP Neural Network Acc: 83.12%

### K-Means Clustering (Grupimi i Rrezikut të Përdoruesit)
Ndarja e kategorive klinike të rrezikut në bazë të distancave të treguesve klinikë:
1.  **Rrezik i Ulët**: 41.9% e pacientëve (Vetëm 8.1% gjasa pozitive)
2.  **Rrezik Mesatar**: 31.1% e pacientëve
3.  **Rrezik i Lartë**: 27.0% e pacientëve

---

## 🔒 Siguria Klinike dhe Personale
*   **Personal Privacy**: Pa ndarje të dhënash me spitalet. Çdo të dhënë e analizuar ruhet lokalisht dhe personalisht.
*   **JWT Secure Auth**: Qasje e mbrojtur me Access Tokens dhe Refresh Tokens.
*   **Clinical Overrides**: Mbrojtje e plotë shëndetësore nga vendimet e pastra të modelit ML (p.sh. hipoglikemia kapet si rrezik kritik pavarësisht predikimit 0% të diabetit).

---

## 📚 Dataset-i
Sistemi bazohet në databazën e famshme **Pima Indians Diabetes Database** (NIDDK), e cila përmban të dhëna klinike reale të performuara për pacientët femra mbi 21 vjeç me prejardhje nga Pima.

---

## 📄 Licenca
Projekt akademik — UBT 2025-2026. Të gjitha të drejtat e rezervuara.
