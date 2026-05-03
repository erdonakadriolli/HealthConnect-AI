import { useState } from "react";
import {
  Activity,
  ArrowUpDown,
  CircleGauge,
  Dna,
  HeartPulse,
  Loader2,
  PersonStanding,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Waves,
} from "lucide-react";

import { predictHeart } from "../api/predictionApi";

import Page from "../components/ui/Page";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import InputField from "../components/ui/InputField";
import SelectField from "../components/ui/SelectField";
import Button from "../components/ui/Button";
import FormGrid from "../components/ui/FormGrid";
import ErrorBox from "../components/ui/ErrorBox";
import PredictionModal from "../components/ui/PredictionModal";

export default function HeartPredict() {
  const [form, setForm] = useState({
    age: "",
    sex: "",
    cp: "",
    trestbps: "",
    chol: "",
    fbs: "",
    restecg: "",
    thalach: "",
    exang: "",
    oldpeak: "",
    slope: "",
    ca: "",
    thal: "",
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
      age: Number(form.age),
      sex: Number(form.sex),
      cp: Number(form.cp),
      trestbps: Number(form.trestbps),
      chol: Number(form.chol),
      fbs: Number(form.fbs),
      restecg: Number(form.restecg),
      thalach: Number(form.thalach),
      exang: Number(form.exang),
      oldpeak: Number(form.oldpeak),
      slope: Number(form.slope),
      ca: Number(form.ca),
      thal: Number(form.thal),
    };

    try {
      const data = await predictHeart(payload);
      setResult(data);
      setShowModal(true);
    } catch {
      setError("Prediction failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page variant="red">
      <Card variant="red" wide>
        <PageHeader
          variant="red"
          icon={<HeartPulse size={30} />}
          badgeIcon={<Activity size={15} />}
          badgeText="AI Cardiovascular Prediction"
          title="Heart Disease Risk Assessment"
          subtitle="This AI-powered model analyzes cardiovascular indicators such as blood pressure, cholesterol, chest pain type, heart rate, and exercise response to estimate the likelihood of heart disease."
        />

        <div
          style={{
            marginBottom: "24px",
            padding: "18px",
            borderRadius: "18px",
            background: "rgba(244, 63, 94, 0.08)",
            border: "1px solid rgba(244, 63, 94, 0.12)",
            fontSize: "14px",
            color: "#9f1239",
            lineHeight: "1.6",
          }}
        >
          <strong>How it works:</strong> This machine learning model evaluates
          clinical and cardiovascular patterns to support early heart disease
          screening. The result is not a medical diagnosis, but it can help
          identify whether a patient may need further medical evaluation.
        </div>

        <FormGrid onSubmit={handleSubmit}>
          <InputField
            variant="red"
            icon={<PersonStanding size={18} />}
            label="Age (Years)"
            name="age"
            value={form.age}
            onChange={handleChange}
            placeholder="Example: 52"
          />

          <SelectField
            variant="red"
            icon={<PersonStanding size={18} />}
            label="Sex"
            name="sex"
            value={form.sex}
            onChange={handleChange}
            options={[
              { value: "1", label: "Male" },
              { value: "0", label: "Female" },
            ]}
          />

          <InputField
            variant="red"
            icon={<Stethoscope size={18} />}
            label="Chest Pain Type (cp)"
            name="cp"
            value={form.cp}
            onChange={handleChange}
            placeholder="Example: 1"
          />

          <InputField
            variant="red"
            icon={<CircleGauge size={18} />}
            label="Resting Blood Pressure (mm Hg)"
            name="trestbps"
            value={form.trestbps}
            onChange={handleChange}
            placeholder="Example: 130"
          />

          <InputField
            variant="red"
            icon={<Activity size={18} />}
            label="Cholesterol Level (mg/dl)"
            name="chol"
            value={form.chol}
            onChange={handleChange}
            placeholder="Example: 245"
          />

          <SelectField
            variant="red"
            icon={<Syringe size={18} />}
            label="Fasting Blood Sugar > 120 mg/dl"
            name="fbs"
            value={form.fbs}
            onChange={handleChange}
            options={[
              { value: "1", label: "True" },
              { value: "0", label: "False" },
            ]}
          />

          <InputField
            variant="red"
            icon={<Waves size={18} />}
            label="Resting ECG Result"
            name="restecg"
            value={form.restecg}
            onChange={handleChange}
            placeholder="Example: 1"
          />

          <InputField
            variant="red"
            icon={<HeartPulse size={18} />}
            label="Maximum Heart Rate Achieved"
            name="thalach"
            value={form.thalach}
            onChange={handleChange}
            placeholder="Example: 150"
          />

          <SelectField
            variant="red"
            icon={<Activity size={18} />}
            label="Exercise-Induced Angina"
            name="exang"
            value={form.exang}
            onChange={handleChange}
            options={[
              { value: "1", label: "Yes" },
              { value: "0", label: "No" },
            ]}
          />

          <InputField
            variant="red"
            icon={<ArrowUpDown size={18} />}
            label="Oldpeak (ST Depression)"
            name="oldpeak"
            value={form.oldpeak}
            onChange={handleChange}
            placeholder="Example: 1.2"
            step="0.1"
          />

          <InputField
            variant="red"
            icon={<Activity size={18} />}
            label="Slope of Peak Exercise ST Segment"
            name="slope"
            value={form.slope}
            onChange={handleChange}
            placeholder="Example: 2"
          />

          <InputField
            variant="red"
            icon={<ShieldCheck size={18} />}
            label="CA (Major Vessels Colored)"
            name="ca"
            value={form.ca}
            onChange={handleChange}
            placeholder="Example: 0"
          />

          <InputField
            variant="red"
            icon={<Dna size={18} />}
            label="Thalassemia Type (thal)"
            name="thal"
            value={form.thal}
            onChange={handleChange}
            placeholder="Example: 2"
          />

          <Button type="submit" variant="red" fullWidth disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} />
                Predicting...
              </>
            ) : (
              <>
                <HeartPulse size={18} />
                Predict Heart Disease Risk
              </>
            )}
          </Button>
        </FormGrid>

        <ErrorBox message={error} />

        {showModal && result && (
          <PredictionModal
            type="heart"
            result={result}
            onClose={() => setShowModal(false)}
          />
        )}
      </Card>
    </Page>
  );
} 