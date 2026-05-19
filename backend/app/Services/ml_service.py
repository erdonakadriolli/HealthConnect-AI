from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from fastapi import HTTPException, status


class MLService:
    def __init__(self):
        ml_file = Path(__file__).resolve().parents[3] / "ml" / "05_predict.py"
        spec = spec_from_file_location("hc_ml_predict", ml_file.resolve())
        if not spec or not spec.loader:
            raise RuntimeError("Could not load ML prediction module.")
        module = module_from_spec(spec)
        spec.loader.exec_module(module)
        self.predict_diabetes = module.predict_diabetes

    def diabetes(self, payload: dict) -> dict:
        result = self.predict_diabetes(payload)
        if "error" in result:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
        return result
