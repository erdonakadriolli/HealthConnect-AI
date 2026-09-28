# ============================================================
# main.py — Pika hyrëse (entry point) e backend-it
# ============================================================
# Ky skedar inicializon aplikacionin FastAPI, konfiguron
# middleware-in CORS dhe regjistron të gjithë routerat (API routes).
# Ekzekutohet me: python -m uvicorn main:app --reload --port 7001
# ============================================================

from contextlib import asynccontextmanager  # Përdoret për të menaxhuar "lifespan" të app-it (çfarë ndodh kur fillon/mbyllet)

from fastapi import FastAPI                          # Frameworku kryesor REST API
from fastapi.middleware.cors import CORSMiddleware   # Middleware që lejon kërkesat nga browser-i (Cross-Origin)

# Importimi i routerave — çdo router menaxhon një grup endpoint-esh
from app.Controllers.auth_controller import router as auth_router          # Endpoint-et e autentikimit (login, register, etj.)
from app.Controllers.ml_controller import router as ml_router              # Endpoint-et e ML-it (parashikimet e diabetit)
from app.Controllers.websocket_controller import router as websocket_router  # Endpoint-et WebSocket (komunikim në kohë reale)
from app.database import Base, engine  # Base = klasa bazë e modeleve SQLAlchemy; engine = lidhja me bazën e të dhënave


# ============================================================
# lifespan — Funksion që ekzekutohet kur app-i starton/mbyllet
# ============================================================
@asynccontextmanager
async def lifespan(_: FastAPI):
    # Krijon të gjitha tabelat në bazën e të dhënave (nëse nuk ekzistojnë)
    # Base.metadata.create_all lexon të gjithë modelet SQLAlchemy dhe krijon strukturën e DB-së
    Base.metadata.create_all(bind=engine)
    yield  # App-i runnon këtu; çfarë vjen pas yield ekzekutohet kur app-i mbyllet


# ============================================================
# Krijimi i instancës kryesore të FastAPI
# ============================================================
app = FastAPI(
    title="HealthConnect AI Backend",  # Emri i shfaqur në dokumentacionin automatik (/docs)
    version="1.0.0",                   # Versioni i API-t
    lifespan=lifespan                  # Lidhja me funksionin lifespan për inicializim të DB-së
)

# ============================================================
# CORS Middleware — Lejon kërkesat nga frontend-i (browser)
# ============================================================
# Pa CORS, browser-i bllokon kërkesat nga një origin tjetër (localhost:9080 → localhost:7001)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",    # Frontend Vite (porta default)
        "http://127.0.0.1:5173",   # E njëjta, por me IP
        "http://localhost:9080",    # Frontend Vite (porta e konfiguruar për këtë projekt)
        "http://127.0.0.1:9080",   # E njëjta, por me IP
    ],
    allow_credentials=True,  # Lejon dërgimin e cookie-ve dhe Authorization header-ave
    allow_methods=["*"],     # Lejon të gjitha metodat HTTP (GET, POST, PUT, DELETE, OPTIONS, etj.)
    allow_headers=["*"],     # Lejon të gjithë header-at (përfshirë Authorization)
)


# ============================================================
# Health Check Endpoint — Kontrollon nëse serveri është aktiv
# ============================================================
@app.get("/health")
def health():
    # Endpoint i thjeshtë që kthen {"status": "ok"} — përdoret për monitorim
    return {"status": "ok"}


# ============================================================
# Regjistrimi i Routerave — Lidhja e endpoint-eve me app-in
# ============================================================
app.include_router(auth_router)       # /api/auth/* — login, register, refresh, me
app.include_router(ml_router)         # /api/predict/* — parashikimet e diabetit dhe historiku
app.include_router(websocket_router)  # /ws/* — komunikimi WebSocket në kohë reale