import { useMemo, useRef, useState } from "react";
import {
  Activity,
  Dna,
  Droplets,
  FileImage,
  Gauge,
  Loader2,
  Scale,
  Syringe,
  Upload,
  UserRound,
} from "lucide-react";

import {
  extractDiabetesFromImage,
  predictDiabetes,
} from "../api/predictionApi";

import Page from "../components/ui/Page";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import FormGrid from "../components/ui/FormGrid";
import ErrorBox from "../components/ui/ErrorBox";
import PredictionModal from "../components/ui/PredictionModal";
import OCRDataCharts from "../components/ui/OCRDataCharts";

const FIELD_KEYS = [
  "Pregnancies",
  "Glucose",
  "BloodPressure",
  "SkinThickness",
  "Insulin",
  "BMI",
  "DiabetesPedigreeFunction",
  "Age",
];

const TRANSLATIONS = {
  sq: {
    badgeText: "Parashikimi i Diabetit me IA",
    title: "Vlerësimi i Rrezikut të Diabetit",
    subtitle: "Ky model i fuqizuar nga Inteligjenca Artificiale analizon treguesit kryesorë klinikë si nivelet e glukozës, BMI-së, insulinës dhe moshës për të vlerësuar gjasat e diabetit. Plotësoni të dhënat e sakta të pacientit për të marrë një vlerësim probabiliteti të rrezikut.",
    howItWorksTitle: "Si funksionon:",
    howItWorksText: "Ky model i mësimit të makinës vlerëson faktorët metabolikë, gjenetikë dhe fiziologjikë për të zbuluar modelet e lidhura zakonisht me rrezikun e diabetit. Rezultati nuk është një diagnozë mjekësore, por mund të ndihmojë në mbështetjen e skriningut të hershëm dhe vendimmarrjes.",
    ocrTitle: "Lexo analizat prej fotos ose PDF (auto-fill me OCR)",
    ocrDesc: "Ngarko foton ose dokumentin PDF të analizës laboratorike. LEADTOOLS OCR do të ekstraktojë vlerat në formën e diabetit më poshtë. Mund t'i redaktosh para se të bësh parashikim.",
    ocrBtnSelect: "Zgjidh foto ose PDF",
    ocrBtnReading: "Po lexohet dokumenti...",
    fieldsFilled: "fusha u plotësuan",
    errorNoFields: "Nuk u gjet asnjë vlerë në imazh. Sigurohu që analiza është e dukshme.",
    errorFailed: "Leximi i imazhit dështoi. Sigurohu që backend-i po ekzekutohet dhe LEADTOOLS është konfiguruar.",
    labelPregnancies: "Shtatzanitë (Numri i shtatzanive)",
    labelGlucose: "Glukoza (Niveli i sheqerit në gjak)",
    labelBloodPressure: "Tensioni i Gjakut (mm Hg)",
    labelSkinThickness: "Trashësia e Lëkurës (mm)",
    labelInsulin: "Niveli i Insulinës (mu U/ml)",
    labelBMI: "BMI (Indeksi i masës trupore)",
    labelPedigree: "Rreziku Gjenetik (Diabetes Pedigree Function)",
    labelAge: "Mosha (Vitet)",
    placeholderPregnancies: "P.sh. 2",
    placeholderGlucose: "P.sh. 120",
    placeholderBloodPressure: "P.sh. 70",
    placeholderSkinThickness: "P.sh. 20",
    placeholderInsulin: "P.sh. 85",
    placeholderBMI: "P.sh. 28.5",
    placeholderPedigree: "P.sh. 0.5",
    placeholderAge: "P.sh. 35",
    btnPredict: "Parashiko Rrezikun e Diabetit",
    btnPredicting: "Duke parashikuar...",
    errorPredictionFailed: "Parashikimi dështoi. Sigurohu që backend-i po ekzekutohet.",
  },
  en: {
    badgeText: "AI Diabetes Prediction",
    title: "Diabetes Risk Assessment",
    subtitle: "This AI-powered model analyzes key clinical indicators such as glucose levels, BMI, insulin, and age to estimate the likelihood of diabetes. Provide accurate patient data to receive a probability-based risk assessment.",
    howItWorksTitle: "How it works:",
    howItWorksText: "This machine learning model evaluates metabolic, genetic, and physiological factors to detect patterns commonly associated with diabetes risk. The result is not a medical diagnosis, but it can help support early screening and decision-making.",
    ocrTitle: "Read analysis from photo or PDF (auto-fill with OCR)",
    ocrDesc: "Upload the lab analysis photo or PDF document. LEADTOOLS OCR will extract values into the diabetes form below. You can edit them before making a prediction.",
    ocrBtnSelect: "Select photo or PDF",
    ocrBtnReading: "Reading document...",
    fieldsFilled: "fields filled",
    errorNoFields: "No values found in the image. Make sure the lab analysis is visible.",
    errorFailed: "Reading image failed. Make sure backend is running and LEADTOOLS is configured.",
    labelPregnancies: "Pregnancies (Number of times pregnant)",
    labelGlucose: "Glucose (Blood Sugar Level)",
    labelBloodPressure: "Blood Pressure (mm Hg)",
    labelSkinThickness: "Skin Thickness (mm)",
    labelInsulin: "Insulin Level (mu U/ml)",
    labelBMI: "BMI (Body Mass Index)",
    labelPedigree: "Genetic Risk (Diabetes Pedigree Function)",
    labelAge: "Age (Years)",
    placeholderPregnancies: "Example: 2",
    placeholderGlucose: "Example: 120",
    placeholderBloodPressure: "Example: 70",
    placeholderSkinThickness: "Example: 20",
    placeholderInsulin: "Example: 85",
    placeholderBMI: "Example: 28.5",
    placeholderPedigree: "Example: 0.5",
    placeholderAge: "Example: 35",
    btnPredict: "Predict Diabetes Risk",
    btnPredicting: "Predicting...",
    errorPredictionFailed: "Prediction failed. Make sure backend is running.",
  }
};

export default function DiabetesPredict() {
  const emptyForm = {
    Pregnancies: "",
    Glucose: "",
    BloodPressure: "",
    SkinThickness: "",
    Insulin: "",
    BMI: "",
    DiabetesPedigreeFunction: "",
    Age: "",
  };

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [lang, setLang] = useState("en"); // Language state: 'en' or 'sq' (defaults to English EN)
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previousValues, setPreviousValues] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  const [uploadName, setUploadName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extractedKeys, setExtractedKeys] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  const t = TRANSLATIONS[lang];
  const currentPayload = useMemo(() => toPayload(form), [form]);
  const hasCompleteValues = FIELD_KEYS.every(
    (key) => form[key] !== "" && Number.isFinite(Number(form[key]))
  );
  const formSignature = FIELD_KEYS.map((key) => form[key]).join("|");

  function handleChange(e) {
    setResult(null);
    setSubmittedData(null);
    setForm((prev) => {
      const next = {
        ...prev,
        [e.target.name]: e.target.value,
      };
      return next;
    });
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    setUploadName(file.name);
    setResult(null);
    setSubmittedData(null);

    try {
      const data = await extractDiabetesFromImage(file);
      const next = { ...form };
      const filled = [];

      for (const key of FIELD_KEYS) {
        const value = data?.[key];
        if (value !== null && value !== undefined && value !== "") {
          next[key] = String(value);
          filled.push(key);
        }
      }

      setForm(next);
      setExtractedKeys(filled);
      setExtractedData(filled.length > 0 ? { ...next } : null);

      if (filled.length === 0) {
        setError(t.errorNoFields);
      }
    } catch (exc) {
      const detail = exc.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : t.errorFailed
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setResult(null);
    setLoading(true);

    const payload = currentPayload;
    const dataSnapshot = { ...form };

    try {
      const data = await predictDiabetes(payload, { persist: true });
      setPreviousValues(submittedData);
      setSubmittedData(dataSnapshot);
      setResult(applyClinicalOverride(data, payload));
      
      // Wait for React to render the inline result card, then scroll smoothly to it
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError(t.errorPredictionFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page variant="green">
      <Card variant="green" wide>
        {/* Beautiful Glassmorphism Language Switcher */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <div
            style={{
              display: "inline-flex",
              background: "rgba(15, 118, 110, 0.08)",
              padding: "4px",
              borderRadius: "12px",
              border: "1px solid rgba(15, 118, 110, 0.12)",
            }}
          >
            <button
              onClick={() => setLang("sq")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                background: lang === "sq" ? "#0f766e" : "transparent",
                color: lang === "sq" ? "#ffffff" : "#0f766e",
                transition: "all 0.2s ease",
              }}
            >
              SHQIP
            </button>
            <button
              onClick={() => setLang("en")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                background: lang === "en" ? "#0f766e" : "transparent",
                color: lang === "en" ? "#ffffff" : "#0f766e",
                transition: "all 0.2s ease",
              }}
            >
              ENGLISH
            </button>
          </div>
        </div>

        <PageHeader
          variant="green"
          icon={<Droplets size={30} />}
          badgeIcon={<Activity size={15} />}
          badgeText={t.badgeText}
          title={t.title}
          subtitle={t.subtitle}
        />

        <div
          style={{
            marginBottom: "24px",
            padding: "18px",
            borderRadius: "18px",
            background: "rgba(15, 118, 110, 0.08)",
            border: "1px solid rgba(15, 118, 110, 0.12)",
            fontSize: "14px",
            color: "#065f46",
            lineHeight: "1.6",
          }}
        >
          <strong>{t.howItWorksTitle}</strong> {t.howItWorksText}
        </div>

        <div
          style={{
            marginBottom: "24px",
            padding: "18px",
            borderRadius: "18px",
            background: "rgba(59, 130, 246, 0.07)",
            border: "1px dashed rgba(59, 130, 246, 0.28)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "15px",
              fontWeight: "700",
              color: "#1e40af",
            }}
          >
            <FileImage size={18} />
            {t.ocrTitle}
          </div>

          <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
            {t.ocrDesc}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/tiff,application/pdf"
            onChange={handleFile}
            style={{ display: "none" }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(59, 130, 246, 0.35)",
                background: "white",
                color: "#1e40af",
                fontWeight: "700",
                fontSize: "14px",
                cursor: uploading ? "wait" : "pointer",
                opacity: uploading ? 0.7 : 1,
              }}
            >
              {uploading ? <Loader2 size={16} /> : <Upload size={16} />}
              {uploading ? t.ocrBtnReading : t.ocrBtnSelect}
            </button>

            {uploadName && !uploading && (
              <span style={{ fontSize: "13px", color: "#475569" }}>
                {uploadName}
                {extractedKeys.length > 0 && (
                  <strong style={{ marginLeft: "8px", color: "#15803d" }}>
                    ({extractedKeys.length} {t.fieldsFilled})
                  </strong>
                )}
              </span>
            )}
          </div>
        </div>

        <FormGrid onSubmit={handleSubmit}>
          <InputField
            variant="green"
            icon={<UserRound size={18} />}
            label={t.labelPregnancies}
            name="Pregnancies"
            value={form.Pregnancies}
            onChange={handleChange}
            placeholder={t.placeholderPregnancies}
          />

          <InputField
            variant="green"
            icon={<Droplets size={18} />}
            label={t.labelGlucose}
            name="Glucose"
            value={form.Glucose}
            onChange={handleChange}
            placeholder={t.placeholderGlucose}
          />

          <InputField
            variant="green"
            icon={<Gauge size={18} />}
            label={t.labelBloodPressure}
            name="BloodPressure"
            value={form.BloodPressure}
            onChange={handleChange}
            placeholder={t.placeholderBloodPressure}
          />

          <InputField
            variant="green"
            icon={<Activity size={18} />}
            label={t.labelSkinThickness}
            name="SkinThickness"
            value={form.SkinThickness}
            onChange={handleChange}
            placeholder={t.placeholderSkinThickness}
          />

          <InputField
            variant="green"
            icon={<Syringe size={18} />}
            label={t.labelInsulin}
            name="Insulin"
            value={form.Insulin}
            onChange={handleChange}
            placeholder={t.placeholderInsulin}
          />

          <InputField
            variant="green"
            icon={<Scale size={18} />}
            label={t.labelBMI}
            name="BMI"
            value={form.BMI}
            onChange={handleChange}
            placeholder={t.placeholderBMI}
            step="0.1"
          />

          <InputField
            variant="green"
            icon={<Dna size={18} />}
            label={t.labelPedigree}
            name="DiabetesPedigreeFunction"
            value={form.DiabetesPedigreeFunction}
            onChange={handleChange}
            placeholder={t.placeholderPedigree}
            step="0.001"
          />

          <InputField
            variant="green"
            icon={<UserRound size={18} />}
            label={t.labelAge}
            name="Age"
            value={form.Age}
            onChange={handleChange}
            placeholder={t.placeholderAge}
          />

          <Button type="submit" variant="green" fullWidth disabled={loading || !hasCompleteValues}>
            {loading ? (
              <>
                <Loader2 size={18} />
                {t.btnPredicting}
              </>
            ) : (
              <>
                <Activity size={18} />
                {t.btnPredict}
              </>
            )}
          </Button>
        </FormGrid>

        <ErrorBox message={error} />

        {/* Prediction Result Anchor */}
        <div ref={resultsRef} />

        {result && (
          <div style={{ marginTop: "38px", width: "100%" }}>
            <PredictionModal
              inline
              type="diabetes"
              result={result}
              formValues={form}
              lang={lang}
            />
          </div>
        )}

        {result && submittedData && (
          <div style={{ marginTop: "38px", width: "100%" }}>
            <OCRDataCharts
              key={`results-${formSignature}`}
              extractedData={submittedData}
              predictionResult={result}
              previousData={previousValues}
              sourceLabel={extractedData ? "OCR + manual edits" : "Manual input"}
              lang={lang}
            />
          </div>
        )}
      </Card>
    </Page>
  );
}

function toPayload(values) {
  return {
    Pregnancies: Number(values.Pregnancies),
    Glucose: Number(values.Glucose),
    BloodPressure: Number(values.BloodPressure),
    SkinThickness: Number(values.SkinThickness),
    Insulin: Number(values.Insulin),
    BMI: Number(values.BMI),
    DiabetesPedigreeFunction: Number(values.DiabetesPedigreeFunction),
    Age: Number(values.Age),
  };
}

function applyClinicalOverride(data, payload) {
  const next = { ...data };
  if (payload.Glucose > 0 && payload.Glucose < 70) {
    next.risk_level = "High (Hypoglycemia)";
    next.prediction = 1;
    next.probability = 1.0;
    next.risk_group = "Rrezik i Lartë (Hipoglikemi)";
    next.message = `Rrezik i Lartë! Vlerat e glukozës janë shumë të ulëta (${payload.Glucose} mg/dL), gjë që tregon Hipoglikemi. Kjo paraqet rrezik të lartë shëndetësor! Rekomandohet kontroll i menjëhershëm mjekësor.`;
  }
  return next;
}
