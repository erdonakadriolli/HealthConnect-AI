# 🏥 HealthConnect AI — Personal Health Assistant

Një platformë e fuqizuar nga Inteligjenca Artificiale për monitorimin, analizimin dhe parashikimin e shëndetit metabolik (si rreziku i diabetit), e krijuar posaçërisht për individë dhe pacientë. 

Ky sistem është **100% i përqendruar te pacienti (personal-health-centric)**. Çdo përdorues normal mund të mbikëqyrë në mënyrë të pavarur dhe të sigurt shëndetin e tij.

> **Projekt akademik** — Laboratorike 2 (Programim) & Machine Learning Models (MM)  
> Universiteti për Biznes dhe Teknologji — UBT  
> Viti Akademik 2025-2026

---

## 👥 Ekipi dhe Rolet
*   **Erdona Kadriolli** — *Data & ML Engineer* (Datasetet, Preprocessing, Modelet ML, OCR me LEADTOOLS, Dokumentimi i API)
*   **Fatlum Syla** — *Backend Developer* (FastAPI, Databaza Personale, JWT Auth, WebSockets)
*   **Yll Bytyqi** — *Frontend Developer* (React + Vite, Dashboard, Real-Time Analytics)

---

## 🧠 Veçoritë Kryesore të Sistemit

*   🤖 **Parashikim me Inteligjencë Artificiale**: Model i trajnuar ML (Random Forest) që vlerëson menjëherë gjasat e diabetit bazuar në 8 tregues kryesorë metabolikë, si dhe K-Means për grupimin në kategori klinike rreziku.
*   📄 **OCR i Analizave (Foto & PDF)**: Ngarko direkt foton apo dokumentin PDF të analizës laboratorike. Sistemi përdor **LEADTOOLS OCR SDK** për të lexuar dhe plotësuar automatikisht të 8 fushat e nevojshme klinike.
*   🌐 **Ndërfaqe plotësisht Dygjuhëshe (SHQIP / ENGLISH)**: Me një klikim të vetëm në krye të dritares kryesore, i gjithë aplikacioni (titujt, shpjegimet, fushat, butonat, grafikët dhe të gjitha rezultatet) kthehet në gjuhën e zgjedhur.
*   🚨 **Sistem i Sigurisë (Emergjenca si Hipoglikemi)**: Nëse një vlerë është e ulët (si p.sh. Glukoza < 70 mg/dL që tregon Hipoglikemi), sistemi automatikisht ndez alarmin e rrezikut të lartë shëndetësor me ngjyrë të kuqe dhe jep rekomandimin e duhur për kontroll të menjëhershëm, duke parandaluar raportimet e gabuara të modelit 0%.
*   🗄️ **Arkiva Personale dhe Historiku (Timeline)**: Ruajtja automatike e çdo parashikimi shëndetësor në databazë (tabela `lab_tests`). Në Dashboard, pacienti ka qasje në një linjë të plotë kohore të analizave të kaluara me karta interaktive që hapen për të treguar të gjithë parametrat.
*   📊 **Vizualizim Interaktiv me Grafikë**: Grafikë interaktivë shtyllë (Bar Chart), profile rreziku (Radar Chart) dhe grafikë të tjerë për performancën e modeleve.

---

## 📁 Struktura e Projektit

```
HealthConnect-AI/
│
├── backend/                    # FastAPI & Databaza (SQLAlchemy ORM)
│   ├── app/
│   │   ├── Controllers/        # auth_controller, ml_controller, websocket_controller
│   │   ├── Services/           # auth_service, ml_service, ocr_service
│   │   ├── Repositories/       # auth_repository
│   │   ├── models.py           # 24 tabelat e databazës (Sistemi & Mjekësore)
│   │   ├── schemas.py          # Pydantic schemas për validim
│   │   └── database.py         # Konfigurimi i SQLite/PostgreSQL
│   └── main.py                 # Pika kryesore e hyrjes së Backend-it
│
├── frontend/                   # React + Vite (Dashboard & UI)
│   ├── src/
│   │   ├── pages/              # Login, Register, DiabetesPredict
│   │   ├── components/         # Navbar, ProtectedRoute, PredictionModal
│   │   └── api/                # Konfigurimi i Axios dhe thirrjet API
│   └── package.json
│
├── ml/                         # Machine Learning Core (Erdona)
│   ├── 00_generate_datasets.py # Përgatitja e datasetit fallback
│   ├── 01_inspect_datasets.py  # Inspektimi i strukturës dhe vlerave zero
│   ├── 02_preprocessing.py     # Pastrimi, IQR outliers capping, dhe StandardScaler
│   ├── 03_train_models.py      # Trajnimi i 5 modeleve supervised (RF, kNN, MLP, etj.)
│   ├── 04_kmeans_clustering.py # K-Means për zbulimin e profileve të rrezikut
│   ├── 05_predict.py           # Moduli i parashikimit për backend-in
│   └── 06_visualizations.py    # Gjenerimi i matricave dhe grafikëve ML
│
├── datasets/                   # Datasets (diabetes.csv)
├── models/                     # Modelet e trajnuara (.pkl)
├── visualizations/             # Grafikët e analizave të modeleve ML (.png)
├── docs/                       # Dokumentimi Profesional i Projektit
│   ├── openapi.json            # Dokumentimi i API-ve (Swagger / OpenAPI Spec)
│   └── database_erd.md         # Përshkrimi i detajuar i DB dhe kodi ERD me Mermaid
│
├── ERD.png                     # Diagrami i plotë i databazës (Imazh)
├── requirements.txt            # Python dependencies (ML + Backend)
└── Raporti_HealthConnect_AI.md # Raporti i plotë akademik i projektit
```

---

## ⚙️ Instalimi dhe Konfigurimi

### Kërkesat Paraprake
*   **Python 3.10+**
*   **Node.js 18+**
*   **LEADTOOLS SDK v23** (E instaluar në makinë për OCR mjekësore. Nëse nuk e keni, aktivizoni demo-fallback në `.env`).

---

### 1. Konfigurimi i Backend-it

1.  Hapni terminalin në dosjen `backend`:
    ```bash
    cd backend
    ```
2.  Krijoni dhe aktivizoni mjedisin virtual (virtual environment):
    ```bash
    python -m venv .venv
    
    # Në Windows (PowerShell):
    .venv\Scripts\activate
    
    # Në Mac/Linux:
    source .venv/bin/activate
    ```
3.  Instaloni bibliotekat e nevojshme (nga requirements.txt e përbashkët në root ose ajo e backend):
    ```bash
    pip install -r ../requirements.txt
    ```
4.  Krijoni skedarin `.env` në dosjen `backend` duke kopjuar vlerat e mëposhtme:
    ```env
    # Shtigjet e LEADTOOLS OCR (Nëse e keni të instaluar)
    LEADTOOLS_INSTALL_DIR=C:\LEADTOOLS23
    LEADTOOLS_LICENSE_DIR=C:\LEADTOOLS23\Support\Common\License
    LEADTOOLS_OCR_RUNTIME_DIR=C:\LEADTOOLS23\Bin\Common\OcrLEADRuntime
    
    # NESE NUK KENI LEADTOOLS SDK TË INSTALUAR - Aktivizoni këtë për testimi/demo:
    OCR_DEMO_FALLBACK=true
    ```
5.  Startoni serverin e zhvillimit:
    ```bash
    python -m uvicorn main:app --reload --port 8000
    ```
    *   **Swagger API Docs** do të jetë i disponueshëm në: `http://localhost:8000/docs`
    *   **OpenAPI JSON Schema** gjendet në: `http://localhost:8000/openapi.json` dhe është eksportuar lokalist në [docs/openapi.json](file:///docs/openapi.json).

---

### 2. Konfigurimi i Frontend-it

1.  Hapni një terminal të ri në dosjen `frontend`:
    ```bash
    cd frontend
    ```
2.  Instaloni varësitë e React:
    ```bash
    npm install
    ```
3.  Startoni serverin lokal të zhvillimit (Vite):
    ```bash
    npm run dev
    ```
4.  Hapni aplikacionin në shfletues:
    *   Zakonisht hapet në: `http://localhost:5173` ose `http://localhost:5174`

---

### 3. Ekzekutimi i Pipeline të Machine Learning

Nëse dëshironi të ri-trajnoni modelet ML dhe të ri-gjeneroni vizualizimet:

1.  Sigurohuni që virtual environment është i aktivizuar dhe jeni në dosjen e rrënjës së projektit.
2.  Ekzekutoni skriptet me radhë:
    ```bash
    # 1. Përgatitja dhe pastrimi i të dhënave
    python ml/02_preprocessing.py
    
    # 2. Trajnimi i 5 modeleve supervised
    python ml/03_train_models.py
    
    # 3. Grupimi i pacientëve me K-Means
    python ml/04_kmeans_clustering.py
    
    # 4. Gjenerimi i grafikëve vizualë në dosjen visualizations/
    python ml/06_visualizations.py
    
    # 5. Testimi i parashikimit
    python ml/05_predict.py
    ```

---

## 📚 Dokumentimi i Dorëzuar

*   **Raporti Akademik**: [Raporti_HealthConnect_AI.md](file:///Raporti_HealthConnect_AI.md) (Përmban: Hyrje, Përshkrimi i datasetit, Metodologjia, Rezultatet, Diskutimi, Përfundimi, Referencat).
*   **Struktura e Databazës dhe ERD**: [docs/database_erd.md](file:///docs/database_erd.md) (Përmban koodin Mermaid të diagramit dhe përshkrimin e të 24 tabelave) së bashku me imazhin [ERD.png](file:///ERD.png) në root.
*   **API Documentation (OpenAPI Spec)**: [docs/openapi.json](file:///docs/openapi.json) (Përmban listën e plotë të endpoint-eve, strukturat e kërkesave dhe përgjigjeve).
