# ============================================================
# schemas.py — Skemat e të Dhënave (Input/Output Validation)
# ============================================================
# Ky skedar përmban klasat Pydantic të cilat:
#   1. Validojnë të dhënat hyrëse (request body) automatikisht
#   2. Formatojnë të dhënat dalëse (response body)
#   3. Gjenerojnë dokumentacion automatik në /docs
#
# FastAPI i përdor këto si "kontrata" të API-t:
#   - Input schema  → çfarë pret endpoint-i
#   - Output schema → çfarë kthen endpoint-i
# ============================================================

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ============================================================
# INPUT SKEMAT — Çfarë dërgon fronti tek API-t
# ============================================================

class UserCreate(BaseModel):
    """
    Schema për REGJISTRIM të përdoruesit të ri.
    Endpoint: POST /api/auth/register
    
    Validime automatike nga Pydantic:
    - first_name: minimumi 2, maksimumi 100 karaktere
    - last_name:  minimumi 2, maksimumi 100 karaktere
    - email:      format valid email (test@example.com)
    - password:   minimumi 8, maksimumi 128 karaktere
    """
    first_name: str = Field(min_length=2, max_length=100)
    last_name: str = Field(min_length=2, max_length=100)
    email: EmailStr           # Validon formatin e emailit automatikisht
    password: str = Field(min_length=8, max_length=128)


class LoginInput(BaseModel):
    """
    Schema për LOGIN të përdoruesit.
    Endpoint: POST /api/auth/login
    
    Kërkon vetëm email dhe fjalëkalim.
    """
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RefreshInput(BaseModel):
    """
    Schema për RIFRESKIMIN e access token-it.
    Endpoint: POST /api/auth/refresh
    
    Pranon refresh_token-in (të marrë gjatë login-it).
    """
    refresh_token: str


class DiabetesInput(BaseModel):
    """
    Schema për parashikimin e diabetit nga ML.
    Endpoint: POST /api/predict/diabetes
    
    Të 8 fushat janë të dhëna mjekësore të nevojshme
    për modelin e Machine Learning (Random Forest/SVM).
    Vlerat duhet të jenë numerike dhe jo-negative.
    """
    Pregnancies: int                   # Numri i shtatzënive
    Glucose: float                     # Niveli i glukozës në gjak (mg/dL)
    BloodPressure: float               # Presioni i gjakut (mm Hg)
    SkinThickness: float               # Trashësia e lëkurës (mm)
    Insulin: float                     # Niveli i insulinës (mu U/ml)
    BMI: float                         # Indeksi i masës trupore (kg/m²)
    DiabetesPedigreeFunction: float    # Funksioni i pedigrisë së diabetit (trashëgimia)
    Age: int                           # Mosha (vite)


class DiabetesExtractResponse(BaseModel):
    """
    Schema për nxjerrjen e të dhënave nga OCR (analiza e dokumenteve mjekësore).
    Endpoint: POST /api/predict/extract
    
    Të gjitha fushat janë opsionale (None) sepse OCR mund të mos gjejë
    të gjitha vlerat nga dokumenti i ngarkuar.
    """
    Pregnancies: int | None = None
    Glucose: float | None = None
    BloodPressure: float | None = None
    SkinThickness: float | None = None
    Insulin: float | None = None
    BMI: float | None = None
    DiabetesPedigreeFunction: float | None = None
    Age: int | None = None


# ============================================================
# OUTPUT SKEMAT — Çfarë kthen API-i tek fronti
# ============================================================

class TokenResponse(BaseModel):
    """
    Schema e përgjigjes pas LOGIN ose REFRESH të suksesshëm.
    
    Kthen:
    - access_token:  JWT i shkurtër (30 min) — dërgohet me çdo kërkesë
    - refresh_token: JWT i gjatë (7 ditë) — vetëm për marrjen e access token të ri
    - token_type:    gjithmonë "bearer" — formati standard OAuth2
    """
    access_token: str
    refresh_token: str
    token_type: str = "bearer"    # Vlera default "bearer"


class UserRead(BaseModel):
    """
    Schema e përgjigjes kur kthen të dhënat e përdoruesit.
    Endpoints: POST /api/auth/register, GET /api/auth/me
    
    model_config = from_attributes=True → lejon konvertimin nga objekti SQLAlchemy
    (User model) direkt në këtë schema pa bërë konvertim manual.
    
    NUK kthen: password_hash — kurrë nuk ekspozohet fjalëkalimi i hash-uar!
    """
    model_config = ConfigDict(from_attributes=True)   # Lexon nga atributet e objektit SQLAlchemy
    
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    is_active: bool    # True = llogaria është aktive, False = e çaktivizuar
