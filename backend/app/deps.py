# ============================================================
# deps.py — Dependencies (Varësi) të Reutilizueshme të FastAPI
# ============================================================
# Ky skedar përmban "dependency" funksione që injektohen
# automatikisht nga FastAPI në endpoint-et e mbrojtura.
#
# Dy funksionet kryesore:
#   1. get_current_user()      → Lexon JWT token dhe kthen përdoruesin
#   2. require_permissions()   → Kontrollon nëse ka lejet e nevojshme
#
# Përdorim tipik:
#   @router.get("/profile")
#   def profile(user = Depends(get_current_user)):
#       return user
# ============================================================

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.Services.auth_service import AuthService


def get_current_user(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None, convert_underscores=False),
):
    """
    Dependency kryesore për endpoint-et e mbrojtura.
    Lexon Authorization header dhe kthen përdoruesin aktual.
    
    Si funksionon:
    1. Lexon header-in "Authorization" nga kërkesa HTTP
    2. Kontrollon nëse ka format "Bearer <token>"
       - Nëse mungon ose format është i gabuar → 401 Unauthorized
    3. Ekstrakt token-in (heq "Bearer " nga fillimi)
    4. Delegon tek AuthService për të gjetur përdoruesin nga token-i
    
    Shembull header:
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    
    Kthehet: objekti User nga DB nëse token-i është valid
    Ngre 401: nëse token-i mungon, është i gabuar ose ka skaduar
    """
    # Kontrollo nëse header-i Authorization ekziston dhe ka format korrekt
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token.")
    
    # Ekstrakt token-in (pjesa pas "Bearer ")
    token = authorization.split(" ", 1)[1]
    
    # Gjen dhe kthen përdoruesin nga token-i (AuthService bën validimin e JWT)
    return AuthService(db).get_current_user_from_token(token)


def require_permissions(required_permissions: list[str]):
    """
    Factory function që krijon një dependency për kontroll lejesh.
    Përdoret për endpoint-et që kërkojnë role specifike (p.sh. admin).
    
    Args:
        required_permissions: Lista e lejeve të nevojshme
                              Shembull: ["manage_users"], ["view_reports", "edit_data"]
    
    Kthehet: Funksion dependency i cili:
        1. Verifikon autentikimin (nëpërmjet get_current_user)
        2. Kontrollon nëse përdoruesi ka TË GJITHA lejet e listuara
        3. Kthen objektin User nëse ka lejet
        4. Ngre 403 Forbidden nëse i mungon ndonjë leje
    
    Shembull përdorimi:
        @router.get("/admin/users")
        def list_users(_: object = Depends(require_permissions(["manage_users"]))):
            ...
    """
    def dependency(
        user=Depends(get_current_user),      # Kërkon autentikim fillimisht
        db: Session = Depends(get_db),
    ):
        # Kontrollon lejet — ngre 403 nëse mungon ndonjë
        AuthService(db).check_permissions(user.id, required_permissions)
        return user  # Kthen përdoruesin nëse kalon të gjitha kontrollet

    return dependency
