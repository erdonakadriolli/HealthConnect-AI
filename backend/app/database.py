# ============================================================
# database.py — Konfigurimi i bazës së të dhënave
# ============================================================
# Ky skedar:
#   1. Lexon konfigurimet nga .env (URL e DB-së, sekrete JWT, etj.)
#   2. Krijon "engine" — lidhjen me bazën e të dhënave SQLite
#   3. Krijon "SessionLocal" — fabrikë sesionesh për operacione DB
#   4. Ekspozon "Base" — klasa bazë për të gjitha modelet SQLAlchemy
#   5. Jep funksionin get_db() si dependency për FastAPI
# ============================================================

from sqlalchemy import create_engine                              # Krijon lidhjen (engine) me bazën e të dhënave
from sqlalchemy.orm import declarative_base, sessionmaker         # Base për modele; sessionmaker për sesione DB
from pydantic_settings import BaseSettings, SettingsConfigDict   # Lexon konfigurimet nga .env me validim automatik


# ============================================================
# Settings — Konfigurimet e aplikacionit të lexuara nga .env
# ============================================================
class Settings(BaseSettings):
    # Tregon ku të gjejë skedarin .env dhe të injorojë variablat e panjohura
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # URL e bazës së të dhënave — default: SQLite lokal në skedarin healthconnectai.db
    database_url: str = "sqlite:///./healthconnectai.db"

    # Çelësi sekret për nënshkrimin e JWT token-ave — duhet ndryshuar në prodhim!
    jwt_secret_key: str = "replace-with-strong-secret"

    # Algoritmi kriptografik për JWT — HS256 = HMAC me SHA-256
    jwt_algorithm: str = "HS256"

    # Sa minuta është i vlefshëm access token-i (default: 30 minuta)
    access_token_expire_minutes: int = 30

    # Sa ditë është i vlefshëm refresh token-i (default: 7 ditë)
    refresh_token_expire_days: int = 7


# ============================================================
# Inicializimi i komponentëve të bazës së të dhënave
# ============================================================

# Krijon instancën e Settings duke lexuar vlerat nga .env
settings = Settings()

# Krijon engine-in — lidhja fizike me bazën e të dhënave
# pool_pre_ping=True: kontrollon nëse lidhja është aktive para çdo operacioni (parandalon "stale connections")
engine = create_engine(settings.database_url, pool_pre_ping=True)

# SessionLocal — fabrikë për krijimin e sesioneve të bazës së të dhënave
# autocommit=False: transaksionet duhet të konfirmohen manualisht me db.commit()
# autoflush=False: ndryshimet nuk dërgohen automatikisht në DB pa commit
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base — klasa bazë nga e cila trashëgojnë të gjitha modelet SQLAlchemy (User, Patient, etj.)
Base = declarative_base()


# ============================================================
# get_db() — Dependency Injection për sesionin e bazës së të dhënave
# ============================================================
def get_db():
    """
    Generator function e përdorur si FastAPI Dependency.
    Krijon një sesion DB për çdo kërkesë HTTP, dhe e mbyll
    automatikisht pas përfundimit të kërkesës (edhe nëse ka gabim).

    Përdorim:
        def my_endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()  # Hap sesionin e ri të DB-së
    try:
        yield db          # E jep sesionin endpoint-it — kodi i endpoint-it ekzekutohet këtu
    finally:
        db.close()        # Mbyll sesionin gjithmonë, pavarësisht nëse ka ndodhur gabim