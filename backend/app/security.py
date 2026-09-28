# ============================================================
# security.py — Siguria e aplikacionit (Fjalëkalime + JWT)
# ============================================================
# Ky skedar menaxhon gjithçka që ka të bëjë me sigurinë:
#   1. Hash-imin (kriptimin) e fjalëkalimeve me bcrypt
#   2. Verifikimin e fjalëkalimeve gjatë login-it
#   3. Krijimin e JWT token-ave (access + refresh)
#   4. Dekodimin dhe validimin e JWT token-ave
#   5. Hash-imin e refresh token-ave për ruajtje të sigurt në DB
# ============================================================

from datetime import datetime, timedelta, timezone
from hashlib import sha256

from jose import JWTError, jwt          # Librari për krijimin dhe leximin e JWT token-ave
from passlib.context import CryptContext  # Librari për hash-imin e fjalëkalimeve (bcrypt)

from app.database import settings       # Importon konfigurimet (çelësi sekret, algoritmi, etj.)

# ============================================================
# Konfigurimi i hash-imit të fjalëkalimeve
# ============================================================
# CryptContext me bcrypt — algoritmi standard i industrisë për fjalëkalime
# "deprecated=auto" do të thotë: versioni i vjetër i hash-it do të ri-hash-ohet automatikisht
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Kthen hash-in bcrypt të fjalëkalimit të dhënë.
    Fjalëkalimi nuk ruhet kurrë i pastër (plain-text) në bazën e të dhënave.
    
    Shembull: "MyPass123" → "$2b$12$Kz8xQ..." (string i gjatë i hash-uar)
    """
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Kontrollon nëse fjalëkalimi i dhënë (plain-text) përputhet me hash-in nga DB.
    Kthehet True nëse janë të njëjta, False nëse jo.
    
    Përdoret gjatë LOGIN-it për të verifikuar fjalëkalimin e përdoruesit.
    """
    return pwd_context.verify(password, hashed_password)


# ============================================================
# Funksionet për krijimin e JWT Token-ave
# ============================================================

def create_token(subject: str, expires_delta: timedelta, token_type: str) -> str:
    """
    Funksioni bazë për krijimin e çdo JWT token-i.
    
    Args:
        subject: ID-ja e përdoruesit (si string) — kush është i loguar
        expires_delta: Sa kohë është i vlefshëm token-i
        token_type: "access" ose "refresh" — lloji i token-it
    
    Payload i token-it përmban:
        "sub"  → ID e përdoruesit (subject)
        "type" → Lloji i token-it ("access" ose "refresh")
        "exp"  → Koha e skadimit (Unix timestamp)
    """
    payload = {
        "sub": subject,        # Kush është i loguar (user ID)
        "type": token_type,    # "access" ose "refresh"
        "exp": datetime.now(timezone.utc) + expires_delta,  # Kur skadon
    }
    # Nënshkruhet me çelësin sekret dhe algoritmin HS256
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(subject: str) -> str:
    """
    Krijon ACCESS TOKEN — token i shkurtër (default: 30 minuta).
    Dërgohet me çdo kërkesë API si: Authorization: Bearer <token>
    Përdoret për të verifikuar kush po bën kërkesën.
    """
    return create_token(subject, timedelta(minutes=settings.access_token_expire_minutes), "access")


def create_refresh_token(subject: str) -> str:
    """
    Krijon REFRESH TOKEN — token i gjatë (default: 7 ditë).
    Përdoret për të marrë access token të ri kur ai skadon,
    pa u dashur të bëjë login përsëri.
    Ruhet i hash-uar në bazën e të dhënave.
    """
    return create_token(subject, timedelta(days=settings.refresh_token_expire_days), "refresh")


def decode_token(token: str) -> dict:
    """
    Dekodon dhe verifikon një JWT token.
    
    Nëse token-i është i vlefshëm, kthen payload-in (dict) me "sub", "type", "exp".
    Nëse token-i është i pavlefshëm ose ka skaduar, ngre ValueError.
    """
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError("Invalid token") from exc


def hash_token(token: str) -> str:
    """
    Krijon hash SHA-256 të refresh token-it.
    
    Refresh token-at NUK ruhen të pastër (plain-text) në DB — vetëm hash-i i tyre.
    Kjo mbrohet nga sulmet ku dikush akseson direkt bazën e të dhënave.
    
    Shembull: "eyJhbGc..." → "a3f8d2c1..." (hash SHA-256)
    """
    return sha256(token.encode("utf-8")).hexdigest()
