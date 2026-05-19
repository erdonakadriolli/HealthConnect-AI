# 🏥 HealthConnect AI

Një platformë për diagnostikim prediktiv të diabetit përmes Inteligjencës Artificiale, me lexim automatik të analizave laboratorike nga fotot.

> **Projekt akademik** — Laboratorike 2 (Programim) & Machine Learning Models (MM)  
> Universiteti për Biznes dhe Teknologji — UBT  
> Viti Akademik 2025-2026

---

## 👥 Ekipi

| Anëtari | Roli | Përgjegjësia |
|---------|------|--------------|
| **Erdona Kadriolli** | Data & ML Engineer | Dataset-et, Preprocessing, Modelet ML, OCR me Claude vision, API Docs |
| **Fatlum Syla** | Backend Developer | FastAPI, 24 Tabelat, JWT Auth, WebSockets |
| **Yll Bytyqi** | Frontend Developer | React + Vite, Dashboard, Real-Time Chat |

---

## 🧠 Çfarë bën ky sistem?

HealthConnect AI bashkon tri fusha:

1. **Menaxhim Klinik** — Mjekët, pacientët, takimet, recetat dhe historiku mjekësor menaxhohen dixhitalisht.
2. **Diagnostikim me AI** — Modeli ML (Random Forest) parashikon rrezikun e diabetit bazuar në 8 tregues klinikë; K-Means grupon pacientët në 3 kategori rreziku.
3. **OCR e analizave** — Mjeku ngarkon foton e analizave laboratorike dhe Claude Sonnet 4.6 (vision) ekstrakton automatikisht vlerat në formë të strukturuar JSON, që pastaj plotësojnë formën e parashikimit.

---

## 🛠 Stack Teknologjik

| Shtresa | Teknologjia |
|---------|-------------|
| **Backend** | Python — FastAPI |
| **Frontend** | React + Vite |
| **Databaza SQL** | PostgreSQL |
| **Databaza NoSQL** | MongoDB / Redis |
| **ML** | scikit-learn, pandas, numpy |
| **AI Vision (OCR)** | Anthropic Claude Sonnet 4.6 |
| **Real-Time** | WebSockets |
| **Auth** | JWT (Access + Refresh Tokens) |

---

## 📁 Struktura e Projektit

```
HealthConnect-AI/
│
├── backend/                    # Fatlumi — FastAPI
│   ├── app/
│   │   ├── Controllers/        # auth_controller, ml_controller, websocket_controller
│   │   ├── Services/           # auth_service, ml_service, ocr_service
│   │   ├── Repositories/       # auth_repository
│   │   ├── models.py           # SQLAlchemy (24 tabela)
│   │   ├── schemas.py          # Pydantic schemas
│   │   ├── security.py         # JWT + password hashing
│   │   ├── database.py         # SQLAlchemy engine
│   │   └── deps.py             # Dependencies (RBAC, current_user)
│   ├── main.py                 # Entry point
│   └── requirements.txt
│
├── frontend/                   # Ylli — React + Vite
│   ├── src/
│   │   ├── pages/              # Login, Register, Dashboard, DiabetesPredict
│   │   ├── components/         # Navbar, ProtectedRoute, ui/*
│   │   ├── api/                # axios, authApi, predictionApi
│   │   └── utils/              # token storage
│   └── package.json
│
├── ml/                         # Erdona — Machine Learning
│   ├── 00_generate_datasets.py # Gjenerimi i dataset-it
│   ├── 01_inspect_datasets.py  # Inspektimi i dataset-it
│   ├── 02_preprocessing.py     # Pastrimi + skalimi + ndarja
│   ├── 03_train_models.py      # Trajnimi i 5 modeleve
│   ├── 04_kmeans_clustering.py # K-Means clustering
│   ├── 05_predict.py           # Funksioni predict për backend
│   ├── 06_visualizations.py    # Confusion matrix, feature importance, etj.
│   ├── 07_hyperparameter_tuning.py
│   └── 08_cross_validation.py
│
├── datasets/                   # Të dhënat
│   ├── diabetes.csv            # Pima Indians Diabetes (768 rreshta)
│   └── processed/              # Të dhënat e pastruara
│       ├── diabetes_train.csv
│       ├── diabetes_test.csv
│       └── scalers.pkl
│
├── models/                     # Modelet e trajnuara (.pkl)
│   ├── diabetes_random_forest.pkl    ⭐ (modeli kryesor)
│   ├── diabetes_knn.pkl
│   ├── diabetes_logistic_regression.pkl
│   ├── diabetes_mlp_arkitektura_1.pkl
│   ├── diabetes_mlp_arkitektura_2.pkl
│   ├── diabetes_kmeans.pkl
│   ├── tuned_diabetes_*.pkl          # Modelet pas hyperparameter tuning
│   ├── results.csv
│   ├── tuning_results.csv
│   ├── cross_validation_results.csv
│   └── kmeans_results.csv
│
├── visualizations/             # Grafiket (.png)
├── ERD.png                     # Diagrami i bazës së të dhënave
└── README.md
```

---

## ⚙️ Instalimi dhe Ekzekutimi

### Kërkesat paraprake

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git
- **API key i Anthropic** (për leximin e analizave nga fotot) — merre falas në https://console.anthropic.com

---

### 1. Klono Repository-n

```bash
git clone https://github.com/username/HealthConnect-AI.git
cd HealthConnect-AI
```

---

### 2. Backend (Fatlumi)

```bash
cd backend

# Krijo virtual environment
python -m venv venv

# Aktivo (Windows)
venv\Scripts\activate

# Aktivo (Mac/Linux)
source venv/bin/activate

# Instalo dependencies
pip install -r requirements.txt

# Konfiguro .env
cp .env.example .env
# Edito .env me kredencialet e databazës dhe API key-in:
#   DATABASE_URL=postgresql://...
#   JWT_SECRET=...
#   ANTHROPIC_API_KEY=sk-ant-...

# Starto serverin
uvicorn main:app --reload
```

Backend do të jetë aktiv në: `http://localhost:8000`  
Swagger UI: `http://localhost:8000/docs`

> ⚠️ Pa `ANTHROPIC_API_KEY`, endpoint-i `/api/predict/diabetes/extract` kthen 500. Parashikimi i thjeshtë (`/api/predict/diabetes`) funksionon pa të.

---

### 3. Frontend (Ylli)

```bash
cd frontend

# Instalo dependencies
npm install

# Starto serverin e zhvillimit
npm run dev
```

Frontend do të jetë aktiv në: `http://localhost:5173`

---

### 4. Machine Learning (Erdona)

```bash
cd ml

# Instalo dependencies
pip install pandas numpy scikit-learn matplotlib seaborn

# Hapi 0: Gjenero dataset-in (opsionale, vetëm nëse mungon diabetes.csv)
python 00_generate_datasets.py

# Hapi 1: Inspekto dataset-in
python 01_inspect_datasets.py

# Hapi 2: Preprocessing
python 02_preprocessing.py

# Hapi 3: Trajno modelet (kNN, RF, LogReg, MLP x2)
python 03_train_models.py

# Hapi 4: K-Means Clustering
python 04_kmeans_clustering.py

# Hapi 5: Testo funksionin predict
python 05_predict.py

# Hapi 6: Gjenero grafiket
python 06_visualizations.py

# Hapi 7: Hyperparameter tuning (opsionale, merr 5-15 min)
python 07_hyperparameter_tuning.py

# Hapi 8: Cross-validation (opsionale)
python 08_cross_validation.py
```

---

## 🤖 Modelet ML — Rezultatet

### Diabeti (Pima Indians Diabetes Database)

| Modeli | Accuracy | F1-Score |
|--------|----------|----------|
| **Random Forest** ⭐ | 85.71% | 0.7963 |
| kNN | 84.42% | 0.7692 |
| MLP Arkitektura 2 | 83.12% | 0.7679 |
| Logistic Regression | 75.32% | 0.6481 |
| MLP Arkitektura 1 | 74.68% | 0.5979 |

### K-Means Clustering (3 Grupe Rreziku)

| Grupi | Pacientë | % Diabetik |
|-------|----------|------------|
| Rrezik i Ulët | 322 (41.9%) | 8.1% |
| Rrezik Mesatar | 239 (31.1%) | 53.1% |
| Rrezik i Lartë | 207 (27.0%) | 55.6% |

---

## 👁️ OCR e Analizave (Claude Vision)

Mjeku ngarkon foton e analizave laboratorike te faqja **Diabetes Prediction**, dhe sistemi:

1. E dërgon imazhin (base64) te Claude Sonnet 4.6 me një prompt të strukturuar.
2. Modeli kthen JSON me 8 fushat e nevojshme për parashikim:
   `Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age`.
3. Formulari plotësohet automatikisht; mjeku mund t'i redaktojë vlerat para se të bëjë parashikimin.

**Karakteristikat:**
- Formate të pranuara: JPEG, PNG, WEBP, GIF
- Madhësia maksimale: 10 MB
- Fusha që nuk gjenden në foto kthehen si `null` (nuk shpiken vlera)
- Modeli kupton kontekstin (p.sh. "Glukoza në gjak" → fusha `Glucose`)

---

## 🔌 API Endpoints (kryesorët)

### Autentifikimi
```
POST   /api/auth/register        # Regjistrim
POST   /api/auth/login           # Login — kthen JWT
POST   /api/auth/refresh         # Rifresko token-in
POST   /api/auth/logout          # Logout
```

### Pacientët
```
GET    /api/patients             # Lista e pacientëve
GET    /api/patients/{id}        # Detajet e pacientit
POST   /api/patients             # Shto pacient
PUT    /api/patients/{id}        # Edito pacient
DELETE /api/patients/{id}        # Fshi pacient
```

### Mjekët & Takimet
```
GET    /api/doctors              # Lista e mjekëve
GET    /api/appointments         # Takimet
POST   /api/appointments         # Rezervo takim
PUT    /api/appointments/{id}    # Ndrysho takim
```

### Machine Learning ⭐
```
POST   /api/predict/diabetes          # Parashiko diabetin (JSON me 8 fusha)
POST   /api/predict/diabetes/extract  # OCR e analizave (multipart, foto) — Claude vision
GET    /api/predict/history/{id}      # Historiku i parashikimeve
```

### Raportet
```
GET    /api/reports/patient/{id}/pdf    # Eksporto PDF
GET    /api/reports/patient/{id}/excel  # Eksporto Excel
```

**Dokumentim i plotë:** `http://localhost:8000/docs` (Swagger UI)

---

## 🔒 Siguria

- **JWT Authentication** — Access Token (15 min) + Refresh Token (7 ditë)
- **RBAC** — Role-Based Access Control (Admin, Mjek, Pacient)
- **SQL Injection Protection** — ORM queries + input validation
- **Input Validation** — Pydantic models për të gjitha request-et
- **API key i fshehur** — `ANTHROPIC_API_KEY` lexohet vetëm nga environment, asnjëherë nuk del te klienti
- **HTTPS** — i detyrueshëm në production

---

## 📡 Real-Time (WebSockets)

```
WS  /ws/notifications/{user_id}   # Njoftime live
WS  /ws/chat/{room_id}            # Chat mjek-pacient
```

---

## 📊 Databaza

**24 Tabela** të ndara në dy grupe:

**10 Tabelat e Detyrueshme (Auth & System):**
`Users, Roles, UserRoles, Permissions, RolePermissions, RefreshTokens, AuditLogs, Notifications, Settings, Files`

**14 Tabelat e Domenit (Mjekësor):**
`Patients, Doctors, Appointments, Specializations, MedicalRecords, LabTests, Prescriptions, Medications, Symptoms, SymptomReports, Clinics, Vaccinations, EmergencyContacts, InsurancePolicies`

ERD Diagram: `ERD.png` në rrënjën e repository-t.

---

## 📋 Menaxhimi i Projektit

- **GitHub Projects** — To Do / In Progress / Done
- **Commits** — çdo anëtar bën commit individualisht
- **Branch strategy** — `main` (production), `dev` (zhvillim), `feature/*` (features)

---

## 📚 Dataset-i

| Dataset | Burimi | Rreshta | Features |
|---------|--------|---------|----------|
| Pima Indians Diabetes | NIDDK, Smith et al. 1988 | 768 | 8 |

---

## 📄 Licenca

Projekt akademik — UBT 2025-2026. Të gjitha të drejtat e rezervuara.
