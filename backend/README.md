# HealthConnect AI Backend

## Setup

1. `cd backend`
2. `python -m venv .venv`
3. `.venv\Scripts\activate`
4. `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and set your PostgreSQL credentials.
6. Configure LEADTOOLS OCR if you want to use `/api/predict/diabetes/extract`:
   - `LEADTOOLS_INSTALL_DIR=C:\LEADTOOLS23`
   - `LEADTOOLS_LICENSE_DIR=C:\LEADTOOLS23\Support\Common\License`
   - `LEADTOOLS_OCR_RUNTIME_DIR=C:\LEADTOOLS23\Bin\Common\OcrLEADRuntime`
7. Run `uvicorn main:app --reload`

## What is implemented

- FastAPI backend with layered structure: `Controllers/`, `Services/`, `Repositories/`
- PostgreSQL connection via SQLAlchemy
- 24 SQL tables in 3NF-oriented modeling in `app/models.py`
- JWT access + refresh token auth
- RBAC dependency (`require_permissions`)
- ML endpoints:
  - `POST /api/predict/diabetes`
  - `POST /api/predict/diabetes/extract` (OCR e analizave me LEADTOOLS)
- WebSockets:
  - `/ws/notifications/{user_id}`
  - `/ws/chat/{room_id}`

## ERD

Project ERD image is available at repository root: `ERD.png`.
