# HealthConnect AI Backend

## Setup

1. `cd backend`
2. `python -m venv .venv`
3. `.venv\Scripts\activate`
4. `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and set your PostgreSQL credentials.
6. Run `uvicorn main:app --reload`

## What is implemented

- FastAPI backend with layered structure: `Controllers/`, `Services/`, `Repositories/`
- PostgreSQL connection via SQLAlchemy
- 24 SQL tables in 3NF-oriented modeling in `app/models.py`
- JWT access + refresh token auth
- RBAC dependency (`require_permissions`)
- ML endpoints:
  - `POST /api/predict/diabetes`
  - `POST /api/predict/diabetes/extract` (OCR e analizave me Claude vision)
- WebSockets:
  - `/ws/notifications/{user_id}`
  - `/ws/chat/{room_id}`

## ERD

Project ERD image is available at repository root: `ERD.png`.
