import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Radar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ── Normal clinical ranges for each field ── */
const NORMAL_RANGES = {
  Pregnancies: { min: 0, max: 6, unit: "" },
  Glucose: { min: 70, max: 140, unit: "mg/dL" },
  BloodPressure: { min: 60, max: 90, unit: "mmHg" },
  SkinThickness: { min: 10, max: 50, unit: "mm" },
  Insulin: { min: 16, max: 166, unit: "µU/mL" },
  BMI: { min: 18.5, max: 30, unit: "kg/m²" },
  DiabetesPedigreeFunction: { min: 0.08, max: 1.2, unit: "" },
  Age: { min: 18, max: 80, unit: "vjet" },
};

const FIELD_LABELS = {
  sq: {
    Pregnancies: "Shtatzanitë",
    Glucose: "Glukoza",
    BloodPressure: "Tensioni",
    SkinThickness: "Trashësia e Lëkurës",
    Insulin: "Insulina",
    BMI: "BMI",
    DiabetesPedigreeFunction: "Rreziku Gjenetik",
    Age: "Mosha",
  },
  en: {
    Pregnancies: "Pregnancies",
    Glucose: "Glucose",
    BloodPressure: "Blood Pressure",
    SkinThickness: "Skin Thickness",
    Insulin: "Insulin",
    BMI: "BMI",
    DiabetesPedigreeFunction: "Genetic Risk",
    Age: "Age",
  }
};

const TRANSLATIONS = {
  sq: {
    title: "Vizualizimi i të Dhënave OCR",
    patientValuesTitle: "Vlerat e Pacientit (nga OCR)",
    patientValueLabel: "Vlera e Pacientit",
    maxNormalLimitLabel: "Kufiri Max Normal",
    normalRangeTooltip: "Normë",
    probabilityTitle: "Probabiliteti",
    riskLabel: "Rrezik",
    safeLabel: "I sigurtë",
    riskHigh: "RREZIK I LARTË",
    riskLow: "RREZIK I ULËT",
    riskHypo: "HIPOGLIKEMI CRITICAL",
    hypoCenterLabel: "Kritike",
    modelLabel: "Modeli",
    kmeansLabel: "Grupi K-Means",
    levelLabel: "Niveli",
    radarTitle: "Profili i Pacientit (Radar — % e kufirit normal)",
    radarPatientDataset: "Pacienti (%)",
    radarNormalDataset: "Kufiri Normal (100%)",
    tableTitle: "Tabela e Vlerave të Nxjerra nga Foto",
    tableHeaders: ["Fusha", "Vlera", "Njësia", "Kufiri Normal", "Status"],
    statusNormal: "Normale",
    statusLow: "E Ulët",
    statusHigh: "E Lartë",
  },
  en: {
    title: "OCR Data Visualization",
    patientValuesTitle: "Patient Values (from OCR)",
    patientValueLabel: "Patient Value",
    maxNormalLimitLabel: "Max Normal Limit",
    normalRangeTooltip: "Normal",
    probabilityTitle: "Probability",
    riskLabel: "Risk",
    safeLabel: "Safe",
    riskHigh: "HIGH RISK",
    riskLow: "LOW RISK",
    riskHypo: "CRITICAL HYPOGLYCEMIA",
    hypoCenterLabel: "Critical",
    modelLabel: "Model",
    kmeansLabel: "K-Means Group",
    levelLabel: "Level",
    radarTitle: "Patient Profile (Radar — % of normal limit)",
    radarPatientDataset: "Patient (%)",
    radarNormalDataset: "Normal Limit (100%)",
    tableTitle: "Table of Values Extracted from Document",
    tableHeaders: ["Field", "Value", "Unit", "Normal Limit", "Status"],
    statusNormal: "Normal",
    statusLow: "Low",
    statusHigh: "High",
  }
};

function getFieldStatus(field, value, lang) {
  const range = NORMAL_RANGES[field];
  const t = TRANSLATIONS[lang];
  if (!range) return { status: "normal", label: t.statusNormal, color: "#16a34a", bg: "rgba(34, 197, 94, 0.12)", icon: "✅" };
  
  if (value < range.min) {
    return {
      status: "low",
      label: t.statusLow,
      color: "#d97706", // Amber-600
      bg: "rgba(217, 119, 6, 0.12)",
      icon: "⚠️",
    };
  } else if (value > range.max) {
    return {
      status: "high",
      label: t.statusHigh,
      color: "#dc2626", // Red-600
      bg: "rgba(239, 68, 68, 0.12)",
      icon: "⚠️",
    };
  }
  
  return {
    status: "normal",
    label: t.statusNormal,
    color: "#16a34a", // Green-600
    bg: "rgba(34, 197, 94, 0.12)",
    icon: "✅",
  };
}

export default function OCRDataCharts({ extractedData, predictionResult, lang = "sq" }) {
  const fields = Object.keys(FIELD_LABELS[lang]);
  const values = fields.map((f) => Number(extractedData?.[f]) || 0);
  const labels = fields.map((f) => FIELD_LABELS[lang][f]);
  const t = TRANSLATIONS[lang];

  /* ── 1. Bar Chart: Patient Values vs Normal Range ── */
  const barColors = fields.map((f, i) => {
    const v = values[i];
    const stat = getFieldStatus(f, v, lang);
    if (stat.status === "low") return "rgba(217, 119, 6, 0.75)";
    if (stat.status === "high") return "rgba(239, 68, 68, 0.78)";
    return "rgba(15, 118, 110, 0.72)";
  });

  const barBorders = fields.map((f, i) => {
    const v = values[i];
    const stat = getFieldStatus(f, v, lang);
    if (stat.status === "low") return "rgba(217, 119, 6, 1)";
    if (stat.status === "high") return "rgba(239, 68, 68, 1)";
    return "rgba(15, 118, 110, 1)";
  });

  /* Normalize values for radar: value / max_normal to put everything on same scale */
  const normalizedValues = fields.map((f, i) => {
    const range = NORMAL_RANGES[f];
    const maxVal = range.max || 1;
    return Math.min((values[i] / maxVal) * 100, 150);
  });

  const normalBaseline = fields.map(() => 100);

  /* ── Prediction donut ── */
  const probability = predictionResult
    ? Math.round(Number(predictionResult.probability) * 100)
    : 0;
  
  const glucoseVal = Number(extractedData?.Glucose) || 0;
  const isHypoglycemia = glucoseVal > 0 && glucoseVal < 70;
  
  const isHighRisk = probability >= 50 || isHypoglycemia;

  return (
    <div
      style={{
        marginTop: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
      }}
    >
      {/* Section Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          paddingBottom: "14px",
          borderBottom: "2px solid rgba(15, 118, 110, 0.15)",
        }}
      >
        <span style={{ fontSize: "26px" }}>📊</span>
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.5px",
          }}
        >
          {t.title}
        </h2>
      </div>

      {/* Top row: Bar chart + Donut */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: predictionResult ? "2fr 1fr" : "1fr",
          gap: "22px",
        }}
      >
        {/* Bar Chart */}
        <div
          style={{
            background: "rgba(248, 250, 252, 0.9)",
            borderRadius: "20px",
            padding: "22px",
            border: "1px solid rgba(148, 163, 184, 0.14)",
            boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#334155",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "18px" }}>📋</span>
            {t.patientValuesTitle}
          </div>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: t.patientValueLabel,
                  data: values,
                  backgroundColor: barColors,
                  borderColor: barBorders,
                  borderWidth: 2,
                  borderRadius: 8,
                  borderSkipped: false,
                },
                {
                  label: t.maxNormalLimitLabel,
                  data: fields.map((f) => NORMAL_RANGES[f].max),
                  backgroundColor: "rgba(59, 130, 246, 0.12)",
                  borderColor: "rgba(59, 130, 246, 0.5)",
                  borderWidth: 1.5,
                  borderDash: [6, 4],
                  borderRadius: 4,
                  borderSkipped: false,
                  type: "bar",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              aspectRatio: 1.8,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    font: { size: 12, weight: "bold" },
                    usePointStyle: true,
                    pointStyleWidth: 12,
                  },
                },
                tooltip: {
                  callbacks: {
                    afterLabel: (ctx) => {
                      if (ctx.datasetIndex !== 0) return "";
                      const f = fields[ctx.dataIndex];
                      const r = NORMAL_RANGES[f];
                      const unitText = r.unit ? ` ${r.unit}` : "";
                      return `${t.normalRangeTooltip}: ${r.min} – ${r.max}${unitText}`;
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: "rgba(148, 163, 184, 0.1)" },
                  ticks: { font: { size: 11 } },
                },
                x: {
                  grid: { display: false },
                  ticks: { font: { size: 11, weight: "bold" } },
                },
              },
            }}
          />
        </div>

        {/* Donut Chart - Prediction */}
        {predictionResult && (
          <div
            style={{
              background: "rgba(248, 250, 252, 0.9)",
              borderRadius: "20px",
              padding: "22px",
              border: "1px solid rgba(148, 163, 184, 0.14)",
              boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#334155",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "18px" }}>🎯</span>
              {t.probabilityTitle}
            </div>
            <div style={{ position: "relative", maxWidth: "220px" }}>
              <Doughnut
                data={{
                  labels: [t.riskLabel, t.safeLabel],
                  datasets: [
                    {
                      data: isHypoglycemia ? [100, 0] : [probability, 100 - probability],
                      backgroundColor: isHighRisk
                        ? [
                            "rgba(239, 68, 68, 0.82)",
                            "rgba(229, 231, 235, 0.5)",
                          ]
                        : [
                            "rgba(34, 197, 94, 0.82)",
                            "rgba(229, 231, 235, 0.5)",
                          ],
                      borderColor: isHighRisk
                        ? [
                            "rgba(239, 68, 68, 1)",
                            "rgba(229, 231, 235, 0.8)",
                          ]
                        : [
                            "rgba(34, 197, 94, 1)",
                            "rgba(229, 231, 235, 0.8)",
                          ],
                      borderWidth: 2,
                      cutout: "72%",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `${ctx.label}: ${ctx.parsed}%`,
                      },
                    },
                  },
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: isHypoglycemia ? "24px" : "32px",
                    fontWeight: 900,
                    color: isHighRisk ? "#dc2626" : "#16a34a",
                    lineHeight: 1,
                  }}
                >
                  {isHypoglycemia ? t.hypoCenterLabel : `${probability}%`}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  {isHypoglycemia ? t.riskHypo : isHighRisk ? t.riskHigh : t.riskLow}
                </div>
              </div>
            </div>

            {/* Prediction details */}
            <div
              style={{
                marginTop: "16px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <DetailRow
                label={t.modelLabel}
                value={predictionResult.model_used || "Random Forest"}
              />
              <DetailRow
                label={t.kmeansLabel}
                value={
                  isHypoglycemia
                    ? lang === "en"
                      ? "High Risk (Hypoglycemia)"
                      : "Rrezik i Lartë (Hipoglikemi)"
                    : predictionResult.risk_group || "—"
                }
              />
              <DetailRow
                label={t.levelLabel}
                value={
                  isHypoglycemia
                    ? lang === "en"
                      ? "High (Hypoglycemia)"
                      : "Rrezik i Lartë (Hipoglikemi)"
                    : lang === "en"
                    ? (predictionResult.risk_level || "—").replace("High", "High Risk").replace("Low", "Low Risk").replace("Medium", "Medium Risk")
                    : (predictionResult.risk_level || "—").replace("High", "Rrezik i Lartë").replace("Low", "Rrezik i Ulët").replace("Medium", "Rrezik Mesatar")
                }
                highlight={isHighRisk}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Radar Chart */}
      <div
        style={{
          background: "rgba(248, 250, 252, 0.9)",
          borderRadius: "20px",
          padding: "22px",
          border: "1px solid rgba(148, 163, 184, 0.14)",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#334155",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "18px" }}>🕸️</span>
          {t.radarTitle}
        </div>
        <div style={{ maxWidth: "550px", margin: "0 auto" }}>
          <Radar
            data={{
              labels,
              datasets: [
                {
                  label: t.radarPatientDataset,
                  data: normalizedValues,
                  backgroundColor: "rgba(15, 118, 110, 0.15)",
                  borderColor: "rgba(15, 118, 110, 0.8)",
                  borderWidth: 2.5,
                  pointBackgroundColor: fields.map((f, i) => {
                    const v = values[i];
                    const stat = getFieldStatus(f, v, lang);
                    if (stat.status === "low") return "rgba(217, 119, 6, 1)";
                    if (stat.status === "high") return "rgba(239, 68, 68, 1)";
                    return "rgba(15, 118, 110, 1)";
                  }),
                  pointRadius: 5,
                  pointHoverRadius: 8,
                },
                {
                  label: t.radarNormalDataset,
                  data: normalBaseline,
                  backgroundColor: "rgba(59, 130, 246, 0.06)",
                  borderColor: "rgba(59, 130, 246, 0.4)",
                  borderWidth: 1.5,
                  pointRadius: 0,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    font: { size: 12, weight: "bold" },
                    usePointStyle: true,
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      if (ctx.datasetIndex === 1) return `${t.radarNormalDataset}: 100%`;
                      const f = fields[ctx.dataIndex];
                      const r = NORMAL_RANGES[f];
                      const v = values[ctx.dataIndex];
                      const unitText = r.unit ? ` ${r.unit}` : "";
                      return `${FIELD_LABELS[lang][f]}: ${v}${unitText} (${Math.round(ctx.parsed.r)}% ${lang === "en" ? "of normal" : "e kufirit"})`;
                    },
                  },
                },
              },
              scales: {
                r: {
                  beginAtZero: true,
                  max: 150,
                  ticks: {
                    stepSize: 25,
                    font: { size: 10 },
                    backdropColor: "transparent",
                  },
                  grid: { color: "rgba(148, 163, 184, 0.15)" },
                  angleLines: { color: "rgba(148, 163, 184, 0.15)" },
                  pointLabels: { font: { size: 12, weight: "bold" } },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Values Table */}
      <div
        style={{
          background: "rgba(248, 250, 252, 0.9)",
          borderRadius: "20px",
          padding: "22px",
          border: "1px solid rgba(148, 163, 184, 0.14)",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#334155",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "18px" }}>📝</span>
          {t.tableTitle}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 6px",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr>
                {t.tableHeaders.map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontWeight: 800,
                      color: "#475569",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => {
                const range = NORMAL_RANGES[f];
                const v = values[i];
                const stat = getFieldStatus(f, v, lang);
                
                let rowBg = "rgba(255, 255, 255, 0.7)";
                if (stat.status === "low") rowBg = "rgba(217, 119, 6, 0.06)";
                else if (stat.status === "high") rowBg = "rgba(239, 68, 68, 0.06)";

                return (
                  <tr
                    key={f}
                    style={{
                      background: rowBg,
                      borderRadius: "12px",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px 14px",
                        fontWeight: 700,
                        color: "#1e293b",
                        borderRadius: "12px 0 0 12px",
                      }}
                    >
                      {FIELD_LABELS[lang][f]}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        fontWeight: 800,
                        color: stat.color,
                      }}
                    >
                      {v}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#64748b",
                      }}
                    >
                      {range.unit || "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#64748b",
                      }}
                    >
                      {range.min} – {range.max}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        borderRadius: "0 12px 12px 0",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "4px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: stat.bg,
                          color: stat.color,
                        }}
                      >
                        {stat.icon} {stat.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight = false }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 12px",
        borderRadius: "10px",
        background: highlight
          ? "rgba(239, 68, 68, 0.08)"
          : "rgba(241, 245, 249, 0.7)",
      }}
    >
      <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 800,
          color: highlight ? "#dc2626" : "#1e293b",
        }}
      >
        {value}
      </span>
    </div>
  );
}
