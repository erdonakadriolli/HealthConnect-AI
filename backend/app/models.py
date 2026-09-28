# ============================================================
# models.py — Modelet e Bazës së të Dhënave (SQLAlchemy ORM)
# ============================================================
# Ky skedar përmban të gjitha "tabelat" e bazës së të dhënave
# të përfaqësuara si klasa Python (ORM = Object-Relational Mapping).
#
# Çdo klasë = një tabelë në bazën e të dhënave SQLite.
# SQLAlchemy i konverton automatikisht klasat → tabela SQL.
#
# STRUKTURA E MODELEVE:
# ┌─────────────────────────────────────────────────────┐
# │  AuditMixin     → Fushat created_at, updated_at     │
# │  User           → Tabela e përdoruesve (login)      │
# │  Role           → Rolet (admin, patient, doctor)    │
# │  UserRole       → Lidhja Shumë-me-Shumë User↔Role  │
# │  Permission     → Lejet (manage_users, etj.)        │
# │  RolePermission → Lidhja Role↔Permission            │
# │  RefreshToken   → Token-at refresh të ruajtura      │
# │  AuditLog       → Historia e ndryshimeve            │
# │  Notification   → Njoftimet e përdoruesve           │
# │  Setting        → Cilësimet e aplikacionit          │
# │  File           → Skedaret e ngarkuara              │
# │  Patient        → Të dhënat mjekësore të pacientit  │
# │  Doctor         → Të dhënat e mjekut                │
# │  Appointment    → Takimet pacient-mjek              │
# │  Specialization → Specializimet e mjekut            │
# │  MedicalRecord  → Kartelat mjekësore                │
# │  LabTest        → Testet laboratorike + ML rezultat │
# │  Prescription   → Recetat mjekësore                 │
# │  Medication     → Ilaçet brenda recetave            │
# │  Symptom        → Lista e simptomave                │
# │  SymptomReport  → Raportet e simptomave             │
# │  Clinic         → Klinikt                          │
# │  Vaccination    → Vaksinacioni                      │
# │  EmergencyContact → Kontaktet emergjente            │
# │  InsurancePolicy  → Polica e sigurimit              │
# └─────────────────────────────────────────────────────┘
# ============================================================

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


# ============================================================
# AuditMixin — Fushat e Auditimit (trashëgohen nga të gjitha modelet)
# ============================================================
class AuditMixin:
    """
    Mixin class që shton automatikisht fushat e gjurmimit kohor.
    Trashëgohet nga të gjitha modelet.
    
    created_at → kur është krijuar rekordi (vendoset automatikisht)
    updated_at → kur është modifikuar herën e fundit (përditësohet automatikisht)
    created_by → ID e përdoruesit që e ka krijuar (optional)
    """
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    created_by: Mapped[int | None] = mapped_column(Integer, nullable=True)


# ============================================================
# MODELET E AUTENTIKIMIT DHE AUTORIZIMIT
# ============================================================

class User(Base, AuditMixin):
    """
    Tabela "users" — Përdoruesit e sistemit.
    Çdo person që regjistrohet ka një rekord këtu.
    
    Fjalëkalimi ruhet I HASH-ATUR (bcrypt) — KURRË plain-text!
    email është UNIK — dy persona nuk mund të kenë të njëjtin email.
    is_active=False → llogaria është çaktivizuar (ban-uar).
    """
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)  # index=True → kërkim i shpejtë
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)  # bcrypt hash, kurrë plain-text
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Role(Base, AuditMixin):
    """
    Tabela "roles" — Rolet e sistemit.
    Shembuj: "admin", "doctor", "patient"
    
    Çdo rol ka një emër unik dhe përshkrim opsional.
    Rolet i japin përdoruesve leje të ndryshme.
    """
    __tablename__ = "roles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)  # p.sh. "admin", "patient"
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class UserRole(Base, AuditMixin):
    """
    Tabela "user_roles" — Lidhja Shumë-me-Shumë midis User dhe Role.
    
    Një user mund të ketë shumë role (p.sh. edhe "doctor" edhe "admin").
    Një rol mund t'i takojë shumë user-ave.
    
    UniqueConstraint → i njëjti rol nuk mund t'i caktohet dy herë të njëjtit user.
    ondelete="CASCADE" → nëse fshihet user-i ose roli, fshihet edhe lidhja.
    """
    __tablename__ = "user_roles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    __table_args__ = (UniqueConstraint("user_id", "role_id", name="uq_user_roles"),)  # Çift unik


class Permission(Base, AuditMixin):
    """
    Tabela "permissions" — Lejet e sistemit.
    Shembuj: "manage_users", "view_reports", "create_appointment"
    
    Lejet janë granulare — kontrollojnë aksione specifike.
    Caktohen tek Role (jo direkt tek User).
    """
    __tablename__ = "permissions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)  # p.sh. "manage_users"
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class RolePermission(Base, AuditMixin):
    """
    Tabela "role_permissions" — Lidhja Shumë-me-Shumë midis Role dhe Permission.
    
    Shembull: roli "admin" ka lejet ["manage_users", "view_all_records"]
    Shembull: roli "patient" ka lejet ["view_own_records"]
    
    Rrjedha: User → UserRole → Role → RolePermission → Permission
    """
    __tablename__ = "role_permissions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    permission_id: Mapped[int] = mapped_column(ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False)
    __table_args__ = (UniqueConstraint("role_id", "permission_id", name="uq_role_permissions"),)


class RefreshToken(Base, AuditMixin):
    """
    Tabela "refresh_tokens" — Refresh Token-at aktive.
    
    Ruhet vetëm HASH-i i token-it (SHA-256) — jo token-i i pastër.
    token_hash → i krahasohet me hash(token_dërguar) gjatë refresh-it.
    revoked=True → token-i është anuluar (pas refresh ose logout).
    expires_at → kur skadon (nuk pranohet pas kësaj date).
    
    Kjo tabelë mundëson:
    - Token Rotation (token i ri pas çdo refresh)
    - Revokimin e token-ave (logout i sigurt)
    - Kontrollin e shumë sesioneve aktive
    """
    __tablename__ = "refresh_tokens"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash: Mapped[str] = mapped_column(Text, nullable=False)            # SHA-256 hash (jo plain token)
    expires_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)  # True = i anuluar


class AuditLog(Base, AuditMixin):
    """
    Tabela "audit_logs" — Historia e të gjitha ndryshimeve.
    
    Regjistron kush, çfarë dhe kur ka ndryshuar.
    Shembull: "user 5 ndryshoi email të patient 12 nga x@y.com në z@y.com"
    
    old_value/new_value → ruhen si JSON (për ndryshimet e fushave)
    ip_address → adresa IP e kërkesës (për investigim sigurie)
    """
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))  # Kush veproi
    action: Mapped[str] = mapped_column(String(120), nullable=False)          # çfarë bëri (p.sh. "UPDATE_EMAIL")
    entity: Mapped[str | None] = mapped_column(String(120))                   # cilën tabelë (p.sh. "users")
    entity_id: Mapped[int | None] = mapped_column(Integer)                    # cilën rekord (ID)
    old_value: Mapped[dict | None] = mapped_column(JSON)                      # vlera para ndryshimit
    new_value: Mapped[dict | None] = mapped_column(JSON)                      # vlera pas ndryshimit
    ip_address: Mapped[str | None] = mapped_column(String(64))                # IP e kërkesës


# ============================================================
# MODELET E SISTEMIT
# ============================================================

class Notification(Base, AuditMixin):
    """
    Tabela "notifications" — Njoftimet për përdoruesit.
    
    Shembuj: "Takimi juaj është nesër", "Rezultati i testit është gati"
    is_read=False → njoftimi nuk është lexuar ende
    """
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[str | None] = mapped_column(String(60))        # p.sh. "appointment", "lab_result"
    title: Mapped[str | None] = mapped_column(String(255))
    message: Mapped[str | None] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class Setting(Base, AuditMixin):
    """
    Tabela "settings" — Cilësimet globale të aplikacionit.
    
    Çifte çelës-vlerë (key-value) për konfigurime dinamike.
    Shembuj: "maintenance_mode"="false", "max_appointments_per_day"="20"
    """
    __tablename__ = "settings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    value: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)


class File(Base, AuditMixin):
    """
    Tabela "files" — Skedarët e ngarkuar (p.sh. dokumente mjekësore, imazhe).
    
    entity/entity_id → polimorfizëm: skedari mund t'i takojë çdo tabele
    Shembull: entity="patients", entity_id=5 → dokument i pacientit 5
    file_path → vendndodhja e skedarit në server
    """
    __tablename__ = "files"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    entity: Mapped[str | None] = mapped_column(String(100))            # cilës tabele i takon
    entity_id: Mapped[int | None] = mapped_column(Integer)             # ID e rekordit
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)       # rruga fizike në server
    file_size: Mapped[int | None] = mapped_column(Integer)             # madhësia në bytes
    uploaded_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))


# ============================================================
# MODELET MJEKËSORE
# ============================================================

class Patient(Base, AuditMixin):
    """
    Tabela "patients" — Profili mjekësor i pacientit.
    
    Çdo pacient lidhet me një User (user_id).
    Ruan të dhëna shtesë mjekësore si datëlindja, gjinia, grupi i gjakut.
    user_id=SET NULL → nëse llogaria fshihet, pacienti mbetet (historiku ruhet).
    """
    __tablename__ = "patients"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    dob: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True))   # datëlindja
    gender: Mapped[str | None] = mapped_column(String(20))
    blood_type: Mapped[str | None] = mapped_column(String(5))               # p.sh. "A+", "O-"


class Doctor(Base, AuditMixin):
    """
    Tabela "doctors" — Profili i mjekut.
    
    Çdo mjek lidhet me një User (user_id).
    license_number → numri unik i licencës mjekësore.
    """
    __tablename__ = "doctors"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    license_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    years_experience: Mapped[int | None] = mapped_column(Integer)


class Appointment(Base, AuditMixin):
    """
    Tabela "appointments" — Takimet midis pacientit dhe mjekut.
    
    status → gjendja e takimit: "scheduled", "completed", "cancelled"
    scheduled_at → data dhe ora e takimit (me timezone)
    """
    __tablename__ = "appointments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    scheduled_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="scheduled", nullable=False)


class Specialization(Base, AuditMixin):
    """
    Tabela "specializations" — Specializimet e mjekut.
    
    Shembuj: "Kardiologji", "Endokrinologji", "Mjekësi e Përgjithshme"
    Një mjek mund të ketë shumë specializime.
    """
    __tablename__ = "specializations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)


class MedicalRecord(Base, AuditMixin):
    """
    Tabela "medical_records" — Kartelat mjekësore.
    
    diagnosis → diagnoza e mjekut (tekstualisht)
    treatment_plan → plani i trajtimit (tekstualisht)
    Nëse mjeku fshihet, kartela mbetet (doctor_id = SET NULL).
    """
    __tablename__ = "medical_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id: Mapped[int | None] = mapped_column(ForeignKey("doctors.id", ondelete="SET NULL"))
    diagnosis: Mapped[str | None] = mapped_column(Text)
    treatment_plan: Mapped[str | None] = mapped_column(Text)


class LabTest(Base, AuditMixin):
    """
    Tabela "lab_tests" — Testet Laboratorike + Rezultati i ML-it.
    
    Kjo tabelë ruan të dhënat hyrëse për modelin ML (diabeti):
    - pregnancies, glucose, blood_pressure, skin_thickness
    - insulin, bmi, diabetes_pedigree_function, age
    
    Dhe rezultatin e parashikimit ML:
    - ml_prediction → 0 = jo diabetik, 1 = diabetik
    - ml_confidence  → probabiliteti (0.0 - 1.0), p.sh. 0.87 = 87%
    """
    __tablename__ = "lab_tests"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id: Mapped[int | None] = mapped_column(ForeignKey("doctors.id", ondelete="SET NULL"))
    
    # ── Të dhënat hyrëse për modelin ML ──
    pregnancies: Mapped[int | None] = mapped_column(Integer)                # Numri i shtatzënive
    glucose: Mapped[float | None] = mapped_column(Float)                    # Glukoza (mg/dL)
    blood_pressure: Mapped[float | None] = mapped_column(Float)             # Presioni i gjakut (mm Hg)
    skin_thickness: Mapped[float | None] = mapped_column(Float)             # Trashësia lëkure (mm)
    insulin: Mapped[float | None] = mapped_column(Float)                    # Insulina (mu U/ml)
    bmi: Mapped[float | None] = mapped_column(Float)                        # BMI (kg/m²)
    diabetes_pedigree_function: Mapped[float | None] = mapped_column(Float) # Funksioni trashëgimor
    age: Mapped[int | None] = mapped_column(Integer)                        # Mosha (vite)
    
    # ── Rezultati i parashikimit ML ──
    ml_prediction: Mapped[int | None] = mapped_column(Integer)              # 0 = jo diabetik, 1 = diabetik
    ml_confidence: Mapped[float | None] = mapped_column(Float)              # Siguria e parashikimit (0.0-1.0)


class Prescription(Base, AuditMixin):
    """
    Tabela "prescriptions" — Recetat mjekësore.
    
    Çdo recetë i lëshohet një pacienti nga një mjek.
    note → shënime shtesë të mjekut
    Ilaçet specifike ruhen në tabelën "medications".
    """
    __tablename__ = "prescriptions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    note: Mapped[str | None] = mapped_column(Text)


class Medication(Base, AuditMixin):
    """
    Tabela "medications" — Ilaçet brenda recetave.
    
    Çdo ilaç i takon një recete (prescription_id).
    Një recetë mund të ketë shumë ilaçe.
    dosage → doza (p.sh. "500mg 2x ditë")
    """
    __tablename__ = "medications"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    prescription_id: Mapped[int] = mapped_column(ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)    # p.sh. "Metformin"
    dosage: Mapped[str | None] = mapped_column(String(120))           # p.sh. "500mg 2x ditë"


class Symptom(Base, AuditMixin):
    """
    Tabela "symptoms" — Katalogu i simptomave.
    
    Lista e simptomave të njohura në sistem (të paracaktuara).
    Shembuj: "Etje e madhe", "Lodhje", "Shikim i paqartë"
    name është unik — çdo simptomë ka emër të ndryshëm.
    """
    __tablename__ = "symptoms"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)


class SymptomReport(Base, AuditMixin):
    """
    Tabela "symptom_reports" — Raportet e simptomave të pacientëve.
    
    Kur një pacient raporton simptoma, ruhet këtu.
    severity → ashpërsia (p.sh. 1-10)
    notes → shënime shtesë për simptomën specifike
    """
    __tablename__ = "symptom_reports"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    symptom_id: Mapped[int] = mapped_column(ForeignKey("symptoms.id", ondelete="CASCADE"), nullable=False)
    severity: Mapped[int | None] = mapped_column(Integer)   # Ashpërsia 1-10
    notes: Mapped[str | None] = mapped_column(Text)


class Clinic(Base, AuditMixin):
    """
    Tabela "clinics" — Klinikt dhe spitalet.
    
    Informacioni bazë i klinikave ku operojnë mjekët.
    """
    __tablename__ = "clinics"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    address: Mapped[str | None] = mapped_column(Text)


class Vaccination(Base, AuditMixin):
    """
    Tabela "vaccinations" — Historiku i vaksinacionit.
    
    Regjistron çdo vaksinë të marrë nga pacienti.
    administered_on → data kur është marrë vaksina
    """
    __tablename__ = "vaccinations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    vaccine_name: Mapped[str] = mapped_column(String(150), nullable=False)  # p.sh. "COVID-19 Pfizer"
    administered_on: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True))


class EmergencyContact(Base, AuditMixin):
    """
    Tabela "emergency_contacts" — Kontaktet emergjente të pacientit.
    
    Personi që duhet kontaktuar në rast emergjence.
    relationship → lidhja familjare (p.sh. "Bashkëshort", "Prind")
    """
    __tablename__ = "emergency_contacts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    relationship: Mapped[str | None] = mapped_column(String(80))  # p.sh. "Bashkëshort", "Fëmijë"


class InsurancePolicy(Base, AuditMixin):
    """
    Tabela "insurance_policies" — Poliçat e sigurimeve shëndetësore.
    
    Informacioni i sigurimit të pacientit.
    policy_number → numri unik i poliçës
    expiry_date → kur skadon poliça (për kontroll validiteti)
    """
    __tablename__ = "insurance_policies"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    provider: Mapped[str] = mapped_column(String(150), nullable=False)          # p.sh. "Sigal", "Uniqa"
    policy_number: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    expiry_date: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True))
