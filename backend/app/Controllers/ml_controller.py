from fastapi import APIRouter, File, UploadFile, Depends, Query
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.deps import get_current_user
from app.schemas import DiabetesExtractResponse, DiabetesInput
from app.Services.ml_service import MLService
from app.Services.ocr_service import OCRService

router = APIRouter(prefix="/api/predict", tags=["ML Predictions"])
ml_service = MLService()
ocr_service = OCRService()


@router.post("/diabetes")
def predict_diabetes(
    payload: DiabetesInput,
    persist: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Perform prediction
    result = ml_service.diabetes(payload.model_dump())
    
    # Apply clinical safety overrides (such as the Hypoglycemia override if Glucose < 70)
    # matching the frontend behavior
    glucose = payload.Glucose
    prediction = result.get("prediction", 0)
    probability = result.get("probability", 0.0)
    risk_level = result.get("risk_level", "I ulet")
    risk_group = result.get("risk_group", "E panjohur")
    
    if glucose > 0 and glucose < 70:
        prediction = 1
        probability = 1.0
        risk_level = "High (Hypoglycemia)"
        risk_group = "Rrezik i Lartë (Hipoglikemi)"
        result["prediction"] = prediction
        result["probability"] = probability
        result["risk_level"] = risk_level
        result["risk_group"] = risk_group
        result["message"] = f"Rrezik i Lartë! Vlerat e glukozës janë shumë të ulëta ({glucose} mg/dL), gjë që tregon Hipoglikemi. Kjo paraqet rrezik të lartë shëndetësor! Rekomandohet kontroll i menjëhershëm mjekësor."

    if not persist:
        return result

    # Get or create patient profile for current user
    patient = db.query(models.Patient).filter(models.Patient.user_id == current_user.id).first()
    if not patient:
        patient = models.Patient(user_id=current_user.id)
        db.add(patient)
        db.commit()
        db.refresh(patient)

    # Save to lab_tests
    lab_test = models.LabTest(
        patient_id=patient.id,
        pregnancies=payload.Pregnancies,
        glucose=payload.Glucose,
        blood_pressure=payload.BloodPressure,
        skin_thickness=payload.SkinThickness,
        insulin=payload.Insulin,
        bmi=payload.BMI,
        diabetes_pedigree_function=payload.DiabetesPedigreeFunction,
        age=payload.Age,
        ml_prediction=prediction,
        ml_confidence=probability
    )
    db.add(lab_test)
    db.commit()
    db.refresh(lab_test)

    return result


@router.post("/diabetes/extract", response_model=DiabetesExtractResponse)
def extract_diabetes_from_image(file: UploadFile = File(...)):
    return ocr_service.extract_diabetes_fields(file)


@router.get("/history")
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    patient = db.query(models.Patient).filter(models.Patient.user_id == current_user.id).first()
    if not patient:
        return []
    
    tests = (
        db.query(models.LabTest)
        .filter(models.LabTest.patient_id == patient.id)
        .order_by(models.LabTest.created_at.desc())
        .all()
    )
    
    # Return serialized predictions
    history = []
    for t in tests:
        prob = t.ml_confidence or 0.0
        pred = t.ml_prediction or 0
        
        # Determine consistent risk status labels
        if t.glucose and t.glucose > 0 and t.glucose < 70:
            risk_level = "High (Hypoglycemia)"
            risk_group = "Rrezik i Lartë (Hipoglikemi)"
        else:
            if prob < 0.3:
                risk_level = "I ulet"
                risk_group = "Rrezik i Ulet"
            elif prob < 0.6:
                risk_level = "Mesatar"
                risk_group = "Rrezik Mesatar"
            else:
                risk_level = "I larte"
                risk_group = "Rrezik i Lartë"

        history.append({
            "id": t.id,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "pregnancies": t.pregnancies,
            "glucose": t.glucose,
            "blood_pressure": t.blood_pressure,
            "skin_thickness": t.skin_thickness,
            "insulin": t.insulin,
            "bmi": t.bmi,
            "diabetes_pedigree_function": t.diabetes_pedigree_function,
            "age": t.age,
            "ml_prediction": pred,
            "ml_confidence": prob,
            "risk_level": risk_level,
            "risk_group": risk_group
        })
        
    return history

