import { useRef, useState } from "react";
import { Activity, Droplets } from "lucide-react";

import {
  extractDiabetesFromImage,
  predictDiabetes,
} from "../api/predictionApi";

import Page from "../components/ui/Page";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import ErrorBox from "../components/ui/ErrorBox";
import PredictionModal from "../components/ui/PredictionModal";
import OCRDataCharts from "../components/ui/OCRDataCharts";
import LanguageSwitch from "../components/ui/LanguageSwitch";

import DiabetesOCRUpload from "../features/diabetes/DiabetesOCRUpload";
import DiabetesForm from "../features/diabetes/DiabetesForm";

import { TRANSLATIONS } from "../features/diabetes/diabetesTranslations";
import {
  FIELD_KEYS,
  INITIAL_DIABETES_FORM,
  buildDiabetesPayload,
} from "../features/diabetes/diabetesFields";
import { diabetesStyles as styles } from "../features/diabetes/diabetesStyles";

export default function DiabetesPredict() {
  const [form, setForm] = useState(INITIAL_DIABETES_FORM);
  const [lang, setLang] = useState("en");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [uploadName, setUploadName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extractedKeys, setExtractedKeys] = useState([]);
  const [extractedData, setExtractedData] = useState(null);

  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  const t = TRANSLATIONS[lang];

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    setUploadName(file.name);

    try {
      const data = await extractDiabetesFromImage(file);

      const nextForm = { ...form };
      const filledFields = [];

      FIELD_KEYS.forEach((key) => {
        const value = data?.[key];

        if (value !== null && value !== undefined && value !== "") {
          nextForm[key] = String(value);
          filledFields.push(key);
        }
      });

      setForm(nextForm);
      setExtractedKeys(filledFields);

      if (filledFields.length > 0) {
        setExtractedData(nextForm);
      } else {
        setError(t.errorNoFields);
      }
    } catch (exc) {
      const detail = exc.response?.data?.detail;
      setError(typeof detail === "string" ? detail : t.errorFailed);
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setResult(null);
    setLoading(true);

    const payload = buildDiabetesPayload(form);

    try {
      const data = await predictDiabetes(payload);
      const finalResult = applyClinicalOverrides(data, payload);

      setResult(finalResult);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
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
        <LanguageSwitch lang={lang} onChange={setLang} />

        <PageHeader
          variant="green"
          icon={<Droplets size={30} />}
          badgeIcon={<Activity size={15} />}
          badgeText={t.badgeText}
          title={t.title}
          subtitle={t.subtitle}
        />

        <div style={styles.infoBox}>
          <strong>{t.howItWorksTitle}</strong> {t.howItWorksText}
        </div>

        <DiabetesOCRUpload
          t={t}
          fileInputRef={fileInputRef}
          uploading={uploading}
          uploadName={uploadName}
          extractedKeys={extractedKeys}
          onFileChange={handleFile}
          onSelectFile={() => fileInputRef.current?.click()}
        />

        <DiabetesForm
          t={t}
          form={form}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />

        <ErrorBox message={error} />

        <div ref={resultsRef} />

        {result && (
          <div style={styles.resultSection}>
            <PredictionModal
              inline
              type="diabetes"
              result={result}
              formValues={form}
              lang={lang}
            />
          </div>
        )}

        {extractedData && (
          <div style={styles.resultSection}>
            <OCRDataCharts
              extractedData={extractedData}
              predictionResult={result}
              lang={lang}
            />
          </div>
        )}
      </Card>
    </Page>
  );
}

function applyClinicalOverrides(data, payload) {
  if (payload.Glucose > 0 && payload.Glucose < 70) {
    return {
      ...data,
      risk_level: "High (Hypoglycemia)",
      prediction: 1,
      probability: 1.0,
      risk_group: "Rrezik i Lartë (Hipoglikemi)",
      message: `Rrezik i Lartë! Vlerat e glukozës janë shumë të ulëta (${payload.Glucose} mg/dL), gjë që tregon Hipoglikemi. Kjo paraqet rrezik të lartë shëndetësor! Rekomandohet kontroll i menjëhershëm mjekësor.`,
    };
  }

  return data;
}