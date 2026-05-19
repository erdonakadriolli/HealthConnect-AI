from fastapi import APIRouter, File, UploadFile

from app.schemas import DiabetesExtractResponse, DiabetesInput
from app.Services.ml_service import MLService
from app.Services.ocr_service import OCRService

router = APIRouter(prefix="/api/predict", tags=["ML Predictions"])
ml_service = MLService()
ocr_service = OCRService()


@router.post("/diabetes")
def predict_diabetes(payload: DiabetesInput):
    return ml_service.diabetes(payload.model_dump())


@router.post("/diabetes/extract", response_model=DiabetesExtractResponse)
def extract_diabetes_from_image(file: UploadFile = File(...)):
    return ocr_service.extract_diabetes_fields(file)
