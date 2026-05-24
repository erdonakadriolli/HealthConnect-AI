import os
import re
import sys
import tempfile
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from pydantic_settings import BaseSettings, SettingsConfigDict

ALLOWED_MEDIA_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/tiff": ".tif",
    "application/pdf": ".pdf",
}
MAX_FILE_SIZE = 10 * 1024 * 1024
DEMO_VALUES = {
    "Pregnancies": 2,
    "Glucose": 148.0,
    "BloodPressure": 72.0,
    "SkinThickness": 35.0,
    "Insulin": 85.0,
    "BMI": 33.6,
    "DiabetesPedigreeFunction": 0.627,
    "Age": 50,
}

FIELD_LABELS = {
    "Pregnancies": [
        "pregnancies", "pregnancy",
        "shtatzani", "shtatzanive", "shtatzanite", "shtatzenite", "shtatzeni", "shtatzene", "barra", "graviditeti", "graviditet",
        "schwangerschaften", "schwangerschaft",
        "gravidanze", "gravidanza"
    ],
    "Glucose": [
        "glucose", "glukoze", "glukoza", "sheqeri ne gjak", "sheqer ne gjak", "sheqeri", "sheqer",
        "glicemi", "glicemia", "glycemia", "fasting blood sugar", "fbs",
        "glukose", "blutzucker", "glicemia a digiuno"
    ],
    "BloodPressure": [
        "blood pressure", "bp", "presion", "presioni", "presioni i gjakut", "tensioni i gjakut", "tensioni", "tension",
        "diastolic", "presioni diastolik", "diastolike", "ta", "pa",
        "blutdruck", "blutdruck diastolisch",
        "pressione arteriosa", "pressione diastolica"
    ],
    "SkinThickness": [
        "skin thickness", "triceps", "lekures", "lekura", "trashesia e lekures", "trashesia", "plika lekurore",
        "hautdicke", "hautfaltendicke",
        "spessore cutaneo", "plica cutanea"
    ],
    "Insulin": [
        "insulin", "insulina", "insulin serum", "insuline", "insulinë",
        "insulin",
        "insulina"
    ],
    "BMI": [
        "bmi", "body mass index", "masa trupore", "indeksi i mases trupore", "imt", "indeksi i mases",
        "body-mass-index",
        "indice di massa corporea", "imc"
    ],
    "DiabetesPedigreeFunction": [
        "diabetes pedigree function", "pedigree", "dpf",
        "historiku i diabetit", "trashegimia", "trashegimi",
        "vererbung",
        "familiarita"
    ],
    "Age": [
        "age", "mosha", "vitet", "vjet", "years", "mosha (vitet)",
        "alter",
        "eta"
    ],
}


class OCRSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    leadtools_install_dir: str = r"C:\LEADTOOLS23"
    leadtools_license_dir: str | None = None
    leadtools_ocr_runtime_dir: str | None = None
    ocr_demo_fallback: bool = False


class OCRService:
    def __init__(self):
        self.settings = OCRSettings()
        self.install_dir = os.environ.get("LEADTOOLS_INSTALL_DIR", self.settings.leadtools_install_dir)
        self.license_dir = (
            os.environ.get("LEADTOOLS_LICENSE_DIR")
            or self.settings.leadtools_license_dir
            or str(Path(self.install_dir) / "Support" / "Common" / "License")
        )
        self.runtime_dir = (
            os.environ.get("LEADTOOLS_OCR_RUNTIME_DIR")
            or self.settings.leadtools_ocr_runtime_dir
            or str(Path(self.install_dir) / "Bin" / "Common" / "OcrLEADRuntime")
        )
        self.demo_fallback = self._env_bool("OCR_DEMO_FALLBACK", self.settings.ocr_demo_fallback)

    def extract_diabetes_fields(self, file: UploadFile) -> dict:
        if file.content_type not in ALLOWED_MEDIA_TYPES:
            allowed = ", ".join(sorted(ALLOWED_MEDIA_TYPES))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipi i imazhit '{file.content_type}' nuk pranohet. Perdor nje nga: {allowed}.",
            )

        data = file.file.read()
        if len(data) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Imazhi eshte me i madh se 10 MB.",
            )

        text = self._extract_text_with_leadtools(data, ALLOWED_MEDIA_TYPES[file.content_type])
        return self._parse_diabetes_fields(text)

    def _extract_text_with_leadtools(self, data: bytes, suffix: str) -> str:
        self._configure_leadtools()

        try:
            from Leadtools.Document.Writer import DocumentFormat
            from Leadtools.Ocr import OcrEngineManager, OcrEngineType
        except Exception as exc:
            if self.demo_fallback:
                return self._demo_text()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "LEADTOOLS nuk eshte instaluar ose DLL-te nuk jane ne PATH. "
                    "Per demo pa SDK vendos OCR_DEMO_FALLBACK=true ne backend/.env."
                ),
            ) from exc

        with tempfile.TemporaryDirectory() as temp_dir:
            input_path = Path(temp_dir) / f"upload{suffix}"
            output_path = Path(temp_dir) / "ocr.txt"
            input_path.write_bytes(data)

            engine = None
            try:
                engine = OcrEngineManager.CreateEngine(OcrEngineType.LEAD)
                engine.Startup(None, None, None, self.runtime_dir)
                engine.AutoRecognizeManager.Run(
                    str(input_path),
                    str(output_path),
                    DocumentFormat.Text,
                    None,
                    None,
                )
                return output_path.read_text(encoding="utf-8", errors="ignore")
            except Exception as exc:
                if self.demo_fallback:
                    return self._demo_text()
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Gabim gjate OCR me LEADTOOLS: {exc}",
                ) from exc
            finally:
                if engine is not None:
                    try:
                        engine.Shutdown()
                    except Exception:
                        pass

    def _configure_leadtools(self) -> None:
        examples_common = Path(self.install_dir) / "Examples" / "Common" / "Python"
        if examples_common.exists() and str(examples_common) not in sys.path:
            sys.path.append(str(examples_common))

        try:
            from leadtools import LibraryLoader

            LibraryLoader.add_reference("Leadtools")
            LibraryLoader.add_reference("Leadtools.Codecs")
            LibraryLoader.add_reference("Leadtools.Document.Writer")
            LibraryLoader.add_reference("Leadtools.Ocr")
        except Exception as exc:
            if self.demo_fallback:
                return
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Paketa Python 'leadtools' mungon. Instaloje me: pip install leadtools. "
                    "Per demo pa SDK vendos OCR_DEMO_FALLBACK=true ne backend/.env."
                ),
            ) from exc

        try:
            from UnlockSupport import Support

            Support.set_license(self.license_dir)
        except Exception as exc:
            if self.demo_fallback:
                return
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Licenca e LEADTOOLS nuk eshte konfiguruar. Vendos LEADTOOLS_LICENSE_DIR "
                    "te folderi ku jane LEADTOOLS.LIC dhe LEADTOOLS.LIC.KEY."
                ),
            ) from exc

    def _parse_diabetes_fields(self, text: str) -> dict:
        parsed = {field: None for field in FIELD_LABELS}

        for field, labels in FIELD_LABELS.items():
            value = self._find_value_after_label(text, labels)
            if value is None:
                continue

            if field in {"Pregnancies", "Age"}:
                parsed[field] = int(round(value))
            else:
                parsed[field] = value

        return parsed

    def _find_value_after_label(self, text: str, labels: list[str]) -> float | None:
        normalized_text = self._normalize_text(text)
        for label in labels:
            pattern = re.compile(
                rf"\b{re.escape(self._normalize_text(label))}\b[^\d+-]{{0,40}}([+-]?\d+(?:[.,]\d+)?(?:\s*/\s*[+-]?\d+(?:[.,]\d+)?)?)",
                re.IGNORECASE,
            )
            match = pattern.search(normalized_text)
            if not match:
                continue

            raw_value = match.group(1)
            if "/" in raw_value:
                parts = re.findall(r"[+-]?\d+(?:[.,]\d+)?", raw_value)
                raw_value = parts[-1] if parts else raw_value

            return float(raw_value.replace(",", "."))

        return None

    def _normalize_text(self, value: str) -> str:
        replacements = {
            "ë": "e",
            "Ë": "e",
            "ç": "c",
            "Ç": "c",
            "\t": " ",
            "\r": "\n",
        }
        normalized = value
        for source, target in replacements.items():
            normalized = normalized.replace(source, target)
        normalized = re.sub(r"[ ]+", " ", normalized)
        return normalized

    def _demo_text(self) -> str:
        return "\n".join(f"{key}: {value}" for key, value in DEMO_VALUES.items())

    def _env_bool(self, name: str, default: bool) -> bool:
        value = os.environ.get(name)
        if value is None:
            return default
        return value.strip().lower() in {"1", "true", "yes", "on"}
