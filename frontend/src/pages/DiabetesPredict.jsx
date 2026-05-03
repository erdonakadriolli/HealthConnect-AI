import { useState } from "react";
import {
  Activity,
  Dna,
  Droplets,
  Gauge,
  Loader2,
  Scale,
  Syringe,
  UserRound,
} from "lucide-react";

import { predictDiabetes } from "../api/predictionApi";

import Page from "../components/ui/Page";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import FormGrid from "../components/ui/FormGrid";
import ErrorBox from "../components/ui/ErrorBox";
import PredictionModal from "../components/ui/PredictionModal";

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
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setResult(null);
    setShowModal(false);
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
      setShowModal(true);
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

        {showModal && result && (
          <PredictionModal
            type="diabetes"
            result={result}
            onClose={() => setShowModal(false)}
          />
        )}
      </Card>
    </Page>
  );
}