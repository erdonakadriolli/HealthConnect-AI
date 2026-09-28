# ============================================================
# auth_controller.py — Kontrolluesi i Autentikimit (Login/Register)
# ============================================================
# Ky skedar përmban të gjitha endpoint-et e API-t për autentikim:
#   POST /api/auth/register  → Regjistrim i përdoruesit të ri
#   POST /api/auth/login     → Login (merr access + refresh token)
#   POST /api/auth/refresh   → Rifresko access token me refresh token
#   GET  /api/auth/me        → Shfaq të dhënat e përdoruesit të loguar
#   GET  /api/auth/admin/users → (Admin) Listo të gjithë përdoruesit
#
# Arkitektura: Controller → Service → Repository → DB
# Controller-i nuk bën logjikë biznesi — delegon tek AuthService.
# ============================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.deps import get_current_user, require_permissions
from app.schemas import LoginInput, RefreshInput, TokenResponse, UserCreate, UserRead
from app.Services.auth_service import AuthService

# ============================================================
# Router — grupon të gjithë endpoint-et e autentikimit
# prefix="/api/auth" → të gjitha URL-të fillojnë me /api/auth/...
# tags=["Auth"]      → grupimi në dokumentacionin automatik (/docs)
# ============================================================
router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ============================================================
# POST /api/auth/register — Regjistrim i përdoruesit të ri
# ============================================================
@router.post("/register", response_model=UserRead)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Regjistron një përdorues të ri.
    
    Pranon: first_name, last_name, email, password (validohen nga UserCreate schema)
    Kthen: të dhënat e përdoruesit të ri (pa fjalëkalim) sipas UserRead schema
    
    Nëse emaili ekziston → 409 Conflict
    Fjalëkalimi hash-ohet para ruajtjes në DB.
    Roli "patient" i caktohet automatikisht.
    """
    return AuthService(db).register(payload.first_name, payload.last_name, payload.email, payload.password)


# ============================================================
# POST /api/auth/login — Hyrja e përdoruesit
# ============================================================
@router.post("/login", response_model=TokenResponse)
def login(payload: LoginInput, db: Session = Depends(get_db)):
    """
    Autentikon përdoruesin me email dhe fjalëkalim.
    
    Pranon: email, password
    Kthen: access_token (30 min) + refresh_token (7 ditë) + token_type="bearer"
    
    Nëse email/fjalëkalimi janë të gabuara → 401 Unauthorized
    Refresh token-i ruhet i hash-uar në tabelën refresh_tokens.
    """
    return AuthService(db).login(payload.email, payload.password)


# ============================================================
# POST /api/auth/refresh — Rifreskim i access token-it
# ============================================================
@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshInput, db: Session = Depends(get_db)):
    """
    Merr access token të ri duke përdorur refresh token-in.
    
    Pranon: refresh_token (i marrë gjatë login-it)
    Kthen: access_token i ri + refresh_token i ri (rotation)
    
    Refresh token rotation: pas çdo refresh, token-i i vjetër anulohet (revoked)
    dhe krijohet një i ri — parandalon ripërdorimin e token-ave të vjedhur.
    Nëse refresh token-i ka skaduar ose është anuluar → 401 Unauthorized
    """
    return AuthService(db).refresh(payload.refresh_token)


# ============================================================
# GET /api/auth/me — Të dhënat e përdoruesit të loguar
# ============================================================
@router.get("/me", response_model=UserRead)
def me(user=Depends(get_current_user)):
    """
    Kthen informacionin e përdoruesit aktual të loguar.
    
    Kërkon: Authorization: Bearer <access_token> në header
    Kthen: id, first_name, last_name, email, is_active
    
    get_current_user() lexon token-in nga header-i dhe gjen përdoruesin nga DB.
    Nëse token-i mungon ose është i pavlefshëm → 401 Unauthorized
    """
    return user


# ============================================================
# GET /api/auth/admin/users — (Vetëm Admin) Lista e përdoruesve
# ============================================================
@router.get("/admin/users")
def list_users_for_admin(
    _: object = Depends(require_permissions(["manage_users"])),  # Kërkon leje "manage_users"
    db: Session = Depends(get_db),
):
    """
    Kthen listën e të gjithë përdoruesve — vetëm për admin.
    
    Kërkon: leje "manage_users" (vetëm roli "admin" e ka)
    Kthen: [{id, email, is_active}, ...] për çdo përdorues
    
    require_permissions(["manage_users"]) kontrollon nëse përdoruesi
    i loguar ka lejen e nevojshme — nëse jo → 403 Forbidden
    """
    return [{"id": u.id, "email": u.email, "is_active": u.is_active} for u in db.query(models.User).all()]
