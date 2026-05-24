# Notes për Prezantim — HealthConnect AI

---

## 🎯 SLIDE 1 — Ideja e Projektit

**Problemi:** Njerëzit marrin analizat laboratorike, por nuk i kuptojnë vlerat. Presin mjekun ose interpretojnë vetë në Google.

**Zgjidhja:** HealthConnect AI — një platformë ku përdoruesi:
1. Regjistrohet me llogarinë e tij
2. Fut të dhënat e analizave **vetë**, OSE ngarkon **foton** e analizës dhe AI-ja i lexon
3. Merr menjëherë rrezikun për diabet + nivelin (i ulët / mesatar / i lartë)

**Pa mjek. Pa klinik. Çdo person për veten e tij.**

---

## 🎯 SLIDE 2 — Ekipi (3 anëtarë)

| Anëtari | Roli |
|---|---|
| **Erdona Kadriolli** | Data & ML Engineer — datasetet, 5 modele ML, OCR me LEADTOOLS |
| **Fatlum Syla** | Backend Developer — FastAPI, 24 tabela, JWT, WebSockets |
| **Yll Bytyqi** | Frontend Developer — React + Vite, UI komplet |

---

## 🎯 SLIDE 3 — Stack Teknologjik (mund të krenohesh me të)

- **Backend:** Python 3.10+, FastAPI, SQLAlchemy 2.x
- **Frontend:** React 19, Vite 8, React Router 7, Axios, Lucide Icons
- **Databaza:** SQLite (default) / PostgreSQL (prodhim)
- **ML:** scikit-learn, pandas, matplotlib, seaborn
- **OCR:** **LEADTOOLS OCR SDK** (leximi automatik i analizave)
- **Real-Time:** WebSockets (FastAPI native)
- **Auth:** JWT (python-jose) + bcrypt (passlib)

---

## 🎯 SLIDE 4 — Çfarë ka Backend-i

**FastAPI app me arkitekturë me 3 shtresa (Controllers / Services / Repositories):**

- `auth_controller` — register, login, refresh, me, admin/users
- `ml_controller` — parashikimi i diabetit + OCR e fotos
- `websocket_controller` — njoftime live + chat

**Shërbimet (Services):**
- `AuthService` — logjika e JWT, refresh rotation, permissions
- `MLService` — ngarkon modelet ML dhe i thërret
- `OCRService` — integrimi me LEADTOOLS OCR SDK
- `ConnectionManager` — menaxhon lidhjet WebSocket

**Siguria:**
- JWT Access Token (30 min) + Refresh Token (7 ditë) **me rotation**
- Bcrypt për fjalëkalime
- RBAC (Role-Based Access Control): admin / doctor / patient + permissions
- Pydantic validation në çdo endpoint
- konfigurimi/licenca e LEADTOOLS vetëm në server

---

## 🎯 SLIDE 5 — Databaza (24 Tabela, ERD i plotë)

**10 tabela sistemi:**
`users`, `roles`, `user_roles`, `permissions`, `role_permissions`, `refresh_tokens`, `audit_logs`, `notifications`, `settings`, `files`

**14 tabela mjekësore:**
`patients`, `doctors`, `appointments`, `specializations`, `medical_records`, `lab_tests`, `prescriptions`, `medications`, `symptoms`, `symptom_reports`, `clinics`, `vaccinations`, `emergency_contacts`, `insurance_policies`

→ ERD i vizualizuar në `ERD.png`

---

## 🎯 SLIDE 6 — Frontend (UI Design System)

**4 faqe kryesore:**
- `/login` — identifikim
- `/register` — regjistrim
- `/dashboard` — pikë hyrëse
- `/diabetes` — formulari + upload i fotos

**10 komponentë UI të ripërdorshëm (design system):**
`Page`, `Card`, `Button`, `InputField`, `FormGrid`, `ErrorBox`, `NavButton`, `PageHeader`, `ActionCard`, `PredictionModal`

**Karakteristika:**
- ProtectedRoute / PublicRoute për rrjedhën e auth-it
- Bearer token interceptor automatik te axios
- Navbar që fshihet kur lëviz poshtë
- Modal i animuar për rezultatet me bar progresi për probabilitetin

---

## 🎯 SLIDE 7 — Machine Learning (9 skripta, 5 modele)

**Pipeline-i i plotë (00 → 08):**

| Hapi | Skripti | Çfarë bën |
|---|---|---|
| 0 | `00_generate_datasets.py` | Gjeneron dataset fallback |
| 1 | `01_inspect_datasets.py` | Statistika, balanca e klasave |
| 2 | `02_preprocessing.py` | NaN handling, outliers IQR, StandardScaler, train/test split 80/20 |
| 3 | `03_train_models.py` | Trajnon **5 modele** |
| 4 | `04_kmeans_clustering.py` | Elbow method + K-Means (K=3) |
| 5 | `05_predict.py` | Funksioni `predict_diabetes()` për backend |
| 6 | `06_visualizations.py` | 5 grafikë PNG |
| 7 | `07_hyperparameter_tuning.py` | GridSearchCV — ~440 trajnime |
| 8 | `08_cross_validation.py` | Stratified 5-Fold CV |

---

## 🎯 SLIDE 8 — Modelet ML & Rezultatet ⭐

**Dataset:** Pima Indians Diabetes (NIDDK, 1988) — 768 rreshta, 8 features

| Modeli | Accuracy | F1-Score |
|---|---:|---:|
| **Random Forest** ⭐ | **85.71%** | **0.7963** |
| kNN (k=5) | 84.42% | 0.7692 |
| MLP (128-64-32) | 83.12% | 0.7679 |
| Logistic Regression | 75.32% | 0.6481 |
| MLP (64) | 74.68% | 0.5979 |

→ **Modeli kryesor në production: Random Forest** (i ruajtur si `models/diabetes_random_forest.pkl`)

---

## 🎯 SLIDE 9 — K-Means Clustering (Unsupervised Learning)

3 grupe rreziku të zbuluara automatikisht nga K-Means:

| Grupi | Pacientë | % Diabetik | Profili |
|---|---:|---:|---|
| **Rrezik i Ulët** | 322 (41.9%) | 8.1% | Glukozë e ulët, BMI normal |
| **Rrezik Mesatar** | 239 (31.1%) | 53.1% | Glukozë mesatare, BMI në kufi |
| **Rrezik i Lartë** | 207 (27.0%) | 55.6% | Glukozë e lartë, BMI e lartë |

**Metrikat:** Silhouette Score, Adjusted Rand Score (krahasim me etiketat reale)

---

## 🎯 SLIDE 10 — OCR me LEADTOOLS (Pjesa Inovative)

**Rrjedha:**
1. Përdoruesi ngarkon foton e analizës (JPEG/PNG/WEBP/GIF/TIFF, max 10MB)
2. Backend e ruan përkohësisht imazhin dhe e lexon me **LEADTOOLS OCR SDK**
3. Parser-i kërkon emërtimet klinike në tekstin e nxjerrë
4. Sistemi kthen JSON me 8 fushat: `Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age`
5. Formulari plotësohet automatikisht — përdoruesi mund të editojë para parashikimit

**Cilësi:**
- Mbështet shqip + anglisht (p.sh. "Glukoza në gjak" → `Glucose`)
- Fushat që mungojnë kthehen `null` (nuk shpiken vlera)
- Punon lokalisht me SDK/licencë LEADTOOLS, pa API key të jashtëm

---

## 🎯 SLIDE 11 — Vizualizimet (5 grafikë profesionalë)

1. **`confusion_matrix_diabetes.png`** — TP/TN/FP/FN për Random Forest
2. **`model_comparison.png`** — Bar chart i të 5 modeleve (accuracy, precision, recall, F1)
3. **`kmeans_clusters.png`** — PCA 2D plot me 3 ngjyra për 3 grupet
4. **`feature_importance.png`** — Cilat features ndikojnë më shumë (Glukoza dominon)
5. **`metrics_radar.png`** — Radar chart krahasues mes modeleve

---

## 🎯 SLIDE 12 — API Endpoints (cfg-ato i marrësh nga Swagger)

```
POST   /api/auth/register             # Regjistrim
POST   /api/auth/login                # → JWT tokens
POST   /api/auth/refresh              # Rifresko access token
GET    /api/auth/me                   # Përdoruesi aktual
GET    /api/auth/admin/users          # Lista (RBAC)

POST   /api/predict/diabetes          # Parashikim nga JSON
POST   /api/predict/diabetes/extract  # OCR multipart

WS     /ws/notifications/{user_id}    # Stream njoftimesh
WS     /ws/chat/{room_id}             # Chat room

GET    /health                        # Health check
GET    /docs                          # Swagger UI interaktiv
```

---

## 🎯 SLIDE 13 — Numra mbresëlënës për slide-in përmbledhës

- 📊 **5** modele ML të trajnuara
- 🎯 **85.71%** accuracy me Random Forest
- 📁 **24** tabela SQLAlchemy
- 🔌 **10** API endpoints + 2 WebSocket
- 🧩 **10** komponentë UI të ripërdorshëm
- 📜 **9** skripta ML (pipeline e plotë)
- 🖼️ **5** grafikë vizualizimi
- 🔐 **JWT + Bcrypt + RBAC** për sigurinë
- 🔎 **LEADTOOLS OCR SDK** për lexim automatik të analizave

---

## 🎯 SLIDE 14 — Demo Live (rrjedha që mund të tregosh)

1. **Hape** http://localhost:5173
2. **Regjistrohu** (krijo llogari të re)
3. **Login** → token-at ruhen në localStorage
4. **Klik** "Diabetes Prediction"
5. **Ngarko foton** e analizës → trego se formulari plotësohet automatikisht
6. **Klik** "Predict Diabetes Risk"
7. **Trego modalin** me probabilitetin, rrezikun, grupin K-Means dhe mesazhin

Backup nëse OCR-ja nuk funksionon: fut vlerat manualisht (p.sh. Glukozë 148, BMI 33.6, etj.) dhe trego rezultatin.

---

## 🎯 SLIDE 15 — Çfarë mësuam (përfundimi)

- **Full-stack development** — Python backend + React frontend + ML pipeline
- **Integrim me OCR SDK profesional** — LEADTOOLS për lexim dokumentesh mjekësore
- **Best practices** — JWT me refresh rotation, RBAC, Pydantic validation, ORM (jo raw SQL)
- **MLOps bazik** — preprocessing, training, evaluation, hyperparameter tuning, cross-validation, deployment në API
- **Punë në ekip** — 3 zhvillues, struktura modulare, git workflow
