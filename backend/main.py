from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.Controllers.auth_controller import router as auth_router
from app.Controllers.ml_controller import router as ml_router
from app.Controllers.websocket_controller import router as websocket_router
from app.database import Base, engine

app = FastAPI(title="HealthConnect AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(ml_router)
app.include_router(websocket_router)