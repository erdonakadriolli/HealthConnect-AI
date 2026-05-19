import base64
import json
import os

from anthropic import Anthropic, APIError
from fastapi import HTTPException, UploadFile, status

ALLOWED_MEDIA_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024
MODEL_ID = "claude-sonnet-4-6"

EXTRACTION_PROMPT = """Ti je nje asistent OCR per analiza laboratorike te diabetit.

Lexo imazhin e analizes mjekesore dhe ekstrakto VETEM keto fusha si JSON:
- Pregnancies: numri i shtatzanive (int). Nese nuk permendet, vendos null.
- Glucose: glukoza ne gjak (mg/dL, float).
- BloodPressure: presioni diastolik i gjakut (mm Hg, float).
- SkinThickness: trashesia e lekures triceps (mm, float).
- Insulin: insulina serum 2-ore (mu U/ml, float).
- BMI: indeksi i mases trupore (kg/m^2, float).
- DiabetesPedigreeFunction: funksioni i pedigree per diabet (float).
- Age: mosha ne vite (int).

Rregulla:
- Kthe VETEM nje objekt JSON, asgje tjeter.
- Nese nje fushe nuk gjendet, vendos null per ate fushe (mos shpik vlera).
- Nese njesia matese ne analize eshte ndryshe nga ajo qe pritet, kthe vleren ne njesine e kerkuar.

Shembull:
{"Pregnancies": null, "Glucose": 148, "BloodPressure": 72, "SkinThickness": 35, "Insulin": null, "BMI": 33.6, "DiabetesPedigreeFunction": null, "Age": 50}
"""


class OCRService:
    def __init__(self):
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        self.client = Anthropic(api_key=api_key) if api_key else None

    def extract_diabetes_fields(self, file: UploadFile) -> dict:
        if self.client is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="ANTHROPIC_API_KEY nuk eshte konfiguruar ne server.",
            )

        if file.content_type not in ALLOWED_MEDIA_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipi i imazhit '{file.content_type}' nuk pranohet. Perdor JPEG, PNG, WEBP ose GIF.",
            )

        data = file.file.read()
        if len(data) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Imazhi eshte me i madh se 10 MB.",
            )

        b64 = base64.standard_b64encode(data).decode("utf-8")

        try:
            response = self.client.messages.create(
                model=MODEL_ID,
                max_tokens=512,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": file.content_type,
                                    "data": b64,
                                },
                            },
                            {"type": "text", "text": EXTRACTION_PROMPT},
                        ],
                    }
                ],
            )
        except APIError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gabim ne thirrjen e Claude API: {exc}",
            ) from exc

        text = "".join(block.text for block in response.content if getattr(block, "type", None) == "text").strip()

        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Modeli nuk ktheu JSON te vlefshem.",
            )

        try:
            parsed = json.loads(text[start : end + 1])
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Pergjigja e modelit nuk eshte JSON i vlefshem: {exc}",
            ) from exc

        return parsed
