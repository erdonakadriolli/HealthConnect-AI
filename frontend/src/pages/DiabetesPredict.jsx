import { useRef, useState } from "react";
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

export default function DiabetesPredict() {
  const [form, setForm] = useState({
    Pregnancies: "",
    Glucose: "",
    BloodPressure: "",
    SkinThickness: "",
    Insulin: "",
    BMI: "",
    DiabetesPedigreeFunction: "",
    Age: "",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [uploadName, setUploadName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extractedKeys, setExtractedKeys] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    setUploadName(file.name);

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
      if (filled.length > 0) {
        setExtractedData({ ...next });
      }

      if (filled.length === 0) {
        setError(
          "Nuk u gjet asnje vlere ne imazh. Sigurohu qe analiza eshte e dukshme."
        );
      }
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Leximi i imazhit deshtoi. Sigurohu qe backend-i po ekzekutohet dhe LEADTOOLS eshte konfiguruar."
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

    const payload = {
      Pregnancies: Number(form.Pregnancies),
      Glucose: Number(form.Glucose),
      BloodPressure: Number(form.BloodPressure),
      SkinThickness: Number(form.SkinThickness),
      Insulin: Number(form.Insulin),
      BMI: Number(form.BMI),
      DiabetesPedigreeFunction: Number(form.DiabetesPedigreeFunction),
      Age: Number(form.Age),
    };

    try {
      const data = await predictDiabetes(payload);
      setResult(data);
      
      // Wait for React to render the inline result card, then scroll smoothly to it
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Prediction failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page variant="green">
      <Card variant="green" wide>
        <PageHeader
          variant="green"
          icon={<Droplets size={30} />}
          badgeIcon={<Activity size={15} />}
          badgeText="AI Diabetes Prediction"
          title="Diabetes Risk Assessment"
          subtitle="This AI-powered model analyzes key clinical indicators such as glucose levels, BMI, insulin, and age to estimate the likelihood of diabetes. Provide accurate patient data to receive a probability-based risk assessment."
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
          <strong>How it works:</strong> This machine learning model evaluates
          metabolic, genetic, and physiological factors to detect patterns
          commonly associated with diabetes risk. The result is not a medical
          diagnosis, but it can help support early screening and decision-making.
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
            Lexo analizat prej fotos ose PDF (auto-fill me OCR)
          </div>

          <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
            Ngarko foton ose dokumentin PDF të analizës laboratorike. LEADTOOLS OCR
            do të ekstraktojë vlerat në formën e diabetit më poshtë. Mund t&apos;i
            redaktosh para se të bësh parashikim.
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
              {uploading ? "Po lexohet dokumenti..." : "Zgjidh foto ose PDF"}
            </button>

            {uploadName && !uploading && (
              <span style={{ fontSize: "13px", color: "#475569" }}>
                {uploadName}
                {extractedKeys.length > 0 && (
                  <strong style={{ marginLeft: "8px", color: "#15803d" }}>
                    ({extractedKeys.length} fusha u plotesuan)
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
            label="Pregnancies (Number of times pregnant)"
            name="Pregnancies"
            value={form.Pregnancies}
            onChange={handleChange}
            placeholder="Example: 2"
          />

          <InputField
            variant="green"
            icon={<Droplets size={18} />}
            label="Glucose (Blood Sugar Level)"
            name="Glucose"
            value={form.Glucose}
            onChange={handleChange}
            placeholder="Example: 120"
          />

          <InputField
            variant="green"
            icon={<Gauge size={18} />}
            label="Blood Pressure (mm Hg)"
            name="BloodPressure"
            value={form.BloodPressure}
            onChange={handleChange}
            placeholder="Example: 70"
          />

          <InputField
            variant="green"
            icon={<Activity size={18} />}
            label="Skin Thickness (mm)"
            name="SkinThickness"
            value={form.SkinThickness}
            onChange={handleChange}
            placeholder="Example: 20"
          />

          <InputField
            variant="green"
            icon={<Syringe size={18} />}
            label="Insulin Level (mu U/ml)"
            name="Insulin"
            value={form.Insulin}
            onChange={handleChange}
            placeholder="Example: 85"
          />

          <InputField
            variant="green"
            icon={<Scale size={18} />}
            label="BMI (Body Mass Index)"
            name="BMI"
            value={form.BMI}
            onChange={handleChange}
            placeholder="Example: 28.5"
            step="0.1"
          />

          <InputField
            variant="green"
            icon={<Dna size={18} />}
            label="Genetic Risk (Diabetes Pedigree Function)"
            name="DiabetesPedigreeFunction"
            value={form.DiabetesPedigreeFunction}
            onChange={handleChange}
            placeholder="Example: 0.5"
            step="0.001"
          />

          <InputField
            variant="green"
            icon={<UserRound size={18} />}
            label="Age (Years)"
            name="Age"
            value={form.Age}
            onChange={handleChange}
            placeholder="Example: 35"
          />

          <Button type="submit" variant="green" fullWidth disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} />
                Predicting...
              </>
            ) : (
              <>
                <Activity size={18} />
                Predict Diabetes Risk
              </>
            )}
          </Button>
        </FormGrid>

        <ErrorBox message={error} />

        {/* Prediction Result Anchor */}
        <div ref={resultsRef} />

        {result && (
          <div style={{ marginTop: "38px", width: "100%" }}>
            <PredictionModal inline type="diabetes" result={result} />
          </div>
        )}

        {extractedData && (
          <div style={{ marginTop: "38px", width: "100%" }}>
            <OCRDataCharts
              extractedData={extractedData}
              predictionResult={result}
            />
          </div>
        )}
      </Card>
    </Page>
  );
}
