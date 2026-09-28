# ============================================================
# auth_service.py — Logjika e Biznesit për Autentikim
# ============================================================
# Ky skedar përmban të gjithë logjikën e autentikimit:
#   - register()                    → Krijon llogari të re
#   - login()                       → Verifikon dhe kthen token-a
#   - refresh()                     → Rifresko token-at (rotation)
#   - get_current_user_from_token() → Gjen përdoruesin nga token-i
#   - check_permissions()           → Kontrollon lejet e rolit
#
# Arkitektura:
#   Controller → AuthService (LOGJIKA ËSHTË KËTU) → AuthRepository → DB
#
# AuthService NUK di asgjë për HTTP/FastAPI — vetëm logjikë biznesi.
# ============================================================

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.Repositories.auth_repository import AuthRepository  # Qasja në bazën e të dhënave
from app.database import settings                             # Konfigurimet (expire times, etj.)
from app.security import (
    create_access_token,   # Krijon JWT access token (30 min)
    create_refresh_token,  # Krijon JWT refresh token (7 ditë)
    decode_token,          # Dekodon dhe verifikon JWT token
    hash_password,         # Hash-on fjalëkalimin me bcrypt
    hash_token,            # Hash-on refresh token me SHA-256
    verify_password,       # Verifikon fjalëkalimin gjatë login-it
)


class AuthService:
    """
    Shërbimi kryesor i autentikimit.
    Merr sesionin e DB-së dhe krijon AuthRepository për të gjitha operacionet.
    ensure_base_roles() sigurohet që rolet "admin" dhe "patient" ekzistojnë gjithmonë.
    """
    def __init__(self, db: Session):
        self.repo = AuthRepository(db)  # Repository për operacione DB
        self.repo.ensure_base_roles()   # Sigurohet që rolet bazë ekzistojnë

    def register(self, first_name: str, last_name: str, email: str, password: str):
        """
        Regjistron një përdorues të ri.
        
        Hapat:
        1. Kontrollon nëse emaili ekziston → 409 Conflict nëse po
        2. Krijon përdoruesin me fjalëkalim të hash-uar (bcrypt)
        3. I cakton rolin "patient" automatikisht
        4. Kthen objektin e përdoruesit të ri
        """
        # Nëse emaili është i regjistruar tashmë, kthe gabim 409
        if self.repo.get_user_by_email(email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")
        
        # Krijon përdoruesin — fjalëkalimi hash-ohet para ruajtjes
        user = self.repo.create_user(first_name, last_name, email, hash_password(password))
        
        # Cakton rolin "patient" (nëse nuk e ka tashmë)
        self.repo.assign_role_if_absent(user.id, "patient")
        
        return user

    def login(self, email: str, password: str):
        """
        Autentikon përdoruesin dhe kthen çift token-ash.
        
        Hapat:
        1. Gjen përdoruesin nga emaili → 401 nëse nuk gjendet
        2. Verifikon fjalëkalimin → 401 nëse është i gabuar
        3. Krijon access token (30 min) dhe refresh token (7 ditë)
        4. Ruhet hash-i i refresh token-it në DB (jo token-i i pastër)
        5. Kthen {access_token, refresh_token}
        """
        user = self.repo.get_user_by_email(email)
        
        # Nëse emaili nuk ekziston OSE fjalëkalimi është i gabuar → 401
        # (mesazhi i njëjtë parandalon "enumeration attacks" — sulmues nuk di cila është e gabuar)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

        # Krijon access token dhe refresh token
        access_token = create_access_token(str(user.id))
        refresh_token = create_refresh_token(str(user.id))
        
        # Llogarit kohën e skadimit të refresh token-it
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
        
        # Ruhet HASH-i i refresh token-it në DB (jo token-i i pastër — siguri shtesë)
        self.repo.save_refresh_token(user.id, hash_token(refresh_token), expires_at)

        return {"access_token": access_token, "refresh_token": refresh_token}

    def refresh(self, refresh_token: str):
        """
        Rifresko access token duke përdorur refresh token-in ekzistues.
        Implementon "Token Rotation" — refresh token i ri çdo herë.
        
        Hapat:
        1. Dekodon refresh token-in → 401 nëse është i pavlefshëm/skaduar
        2. Kontrollon tipin e token-it → duhet "refresh"
        3. Gjen token-in në DB (nga hash-i) → 401 nëse ka skaduar/anulohet
        4. Anulon (revoke) token-in e vjetër
        5. Krijon çift të ri token-ash dhe i ruan
        6. Kthen {access_token, refresh_token} të rinj
        """
        # Dekodo dhe verifiko token-in — nëse ka skaduar ose është falsifikuar, ngre 401
        try:
            payload = decode_token(refresh_token)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token.")
        
        # Sigurohet që token-i është vërtet refresh (jo access) type
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token type.")

        # Kontrollo nëse ekziston në DB dhe nuk është anuluar
        token_row = self.repo.get_active_refresh_token(hash_token(refresh_token))
        if not token_row:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or revoked.")

        # Anulo token-in e vjetër (Token Rotation — parandalon ripërdorimin)
        self.repo.revoke_refresh_token(token_row.id)
        
        # Merr ID-në e përdoruesit nga payload
        user_id = payload.get("sub")
        
        # Krijon token-a të rinj
        access_token = create_access_token(user_id)
        new_refresh = create_refresh_token(user_id)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
        
        # Ruan token-in e ri refresh në DB
        self.repo.save_refresh_token(int(user_id), hash_token(new_refresh), expires_at)
        
        return {"access_token": access_token, "refresh_token": new_refresh}

    def get_current_user_from_token(self, token: str):
        """
        Merr objektin e përdoruesit nga access token-i.
        Përdoret nga get_current_user() dependency në çdo endpoint të mbrojtur.
        
        Hapat:
        1. Dekodon token-in → 401 nëse invalid/skaduar
        2. Kontrollon tipin → duhet "access" (jo "refresh")
        3. Merr user_id nga "sub" payload
        4. Gjen përdoruesin nga DB → 404 nëse nuk ekziston
        5. Kthen objektin User
        """
        try:
            payload = decode_token(token)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token.")
        
        # Sigurohet që nuk po përdoret refresh token si access token
        if payload.get("type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token type.")
        
        # Merr ID-në e përdoruesit dhe gjen nga DB
        user_id = payload.get("sub")
        user = self.repo.get_user_by_id(int(user_id))
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        return user

    def check_permissions(self, user_id: int, required: list[str]) -> None:
        """
        Kontrollon nëse përdoruesi ka lejet e nevojshme.
        
        Merr listën e lejeve nga DB (përmes roleve të caktuara).
        Nëse mungon ndonjë leje → ngre 403 Forbidden.
        
        Shembull: require_permissions(["manage_users"]) → kjo thirrja kontrollon
        nëse roli i përdoruesit (p.sh. "admin") ka lejen "manage_users".
        """
        permissions = self.repo.get_user_permissions(user_id)
        
        # Gjen cilat leje mungojnë
        missing = [perm for perm in required if perm not in permissions]
        if missing:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Missing permissions: {missing}")
