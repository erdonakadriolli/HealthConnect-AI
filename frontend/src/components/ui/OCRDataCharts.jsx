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
import { Bar, Doughnut, Line, Radar } from "react-chartjs-2";

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

const FIELD_ORDER = [
  "Pregnancies",
  "Glucose",
  "BloodPressure",
  "SkinThickness",
  "Insulin",
  "BMI",
  "DiabetesPedigreeFunction",
  "Age",
];

const NORMAL_RANGES = {
  Pregnancies: { min: 0, max: 6, unit: "" },
  Glucose: { min: 70, max: 140, unit: "mg/dL" },
  BloodPressure: { min: 60, max: 90, unit: "mmHg" },
  SkinThickness: { min: 10, max: 50, unit: "mm" },
  Insulin: { min: 16, max: 166, unit: "uU/mL" },
  BMI: { min: 18.5, max: 30, unit: "kg/m2" },
  DiabetesPedigreeFunction: { min: 0.08, max: 1.2, unit: "" },
  Age: { min: 18, max: 80, unit: "years" },
};

const FEATURE_WEIGHTS = {
  Glucose: 0.33,
  BMI: 0.19,
  Age: 0.14,
  DiabetesPedigreeFunction: 0.12,
  Insulin: 0.09,
  BloodPressure: 0.06,
  SkinThickness: 0.04,
  Pregnancies: 0.03,
};

const FIELD_LABELS = {
  sq: {
    Pregnancies: "Shtatzanite",
    Glucose: "Glukoza",
    BloodPressure: "Tensioni",
    SkinThickness: "Trashesia e Lekures",
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
  },
};

const TRANSLATIONS = {
  sq: {
    title: "OCR Data Visualization",
    source: "Burimi",
    refreshing: "Duke rifreskuar parashikimin...",
    prediction: "Parashikimi",
    confidence: "Konfidenca",
    riskLevel: "Niveli i rrezikut",
    featureImportance: "Rendesia e faktoreve",
    statistics: "Permbledhje statistikore",
    distribution: "Shperndarja e te dhenave",
    insights: "Verejtje shendetesore",
    recommendations: "Rekomandime",
    comparison: "Krahasim me vlerat paraprake",
    exactValues: "Vlerat ekzakte te perdorura",
    patientValues: "Patient Values (from OCR)",
    riskShare: "Ndarja e statusit te vlerave",
    trend: "Aktuale vs paraprake",
    profile: "Patient Profile (Radar - % of normal limit)",
    field: "Fusha",
    value: "Vlera",
    unit: "Njesia",
    normal: "Norma",
    status: "Statusi",
    low: "E ulet",
    high: "E larte",
    ok: "Normale",
    unknown: "Ne pritje",
    noPrevious: "Nuk ka vlere paraprake per krahasim.",
    nonDiabetic: "Jo diabetik",
    diabetic: "Diabetik",
  },
  en: {
    title: "OCR Data Visualization",
    source: "Source",
    refreshing: "Refreshing prediction...",
    prediction: "Prediction",
    confidence: "Confidence",
    riskLevel: "Risk Level",
    featureImportance: "Feature Importance",
    statistics: "Statistical Summary",
    distribution: "Data Distribution",
    insights: "Health Insights",
    recommendations: "Recommendations",
    comparison: "Comparison with Previous Values",
    exactValues: "Exact Values Used",
    patientValues: "Patient Values (from OCR)",
    riskShare: "Value status share",
    trend: "Current vs previous",
    profile: "Patient Profile (Radar - % of normal limit)",
    field: "Field",
    value: "Value",
    unit: "Unit",
    normal: "Normal",
    status: "Status",
    low: "Low",
    high: "High",
    ok: "Normal",
    unknown: "Pending",
    noPrevious: "No previous value available for comparison.",
    nonDiabetic: "Non-Diabetic",
    diabetic: "Diabetic",
  },
};

export default function OCRDataCharts({
  extractedData,
  predictionResult,
  previousData,
  isPredictionRefreshing = false,
  sourceLabel = "Current data",
  lang = "en",
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const labels = FIELD_ORDER.map((field) => FIELD_LABELS[lang][field]);
  const values = FIELD_ORDER.map((field) => Number(extractedData?.[field]) || 0);
  const rows = FIELD_ORDER.map((field, index) => {
    const value = values[index];
    const status = getFieldStatus(field, value, lang);
    const range = NORMAL_RANGES[field];
    return { field, label: FIELD_LABELS[lang][field], value, status, range };
  });

  const probability = Number(predictionResult?.probability);
  const confidence = Number.isFinite(probability) ? Math.round(probability * 100) : null;
  const isHypoglycemia = values[1] > 0 && values[1] < 70;
  const riskText = getRiskText(predictionResult, isHypoglycemia, lang);
  const predictionText =
    Number(predictionResult?.prediction) === 1 ? t.diabetic : t.nonDiabetic;
  const counts = {
    low: rows.filter((row) => row.status.status === "low").length,
    normal: rows.filter((row) => row.status.status === "normal").length,
    high: rows.filter((row) => row.status.status === "high").length,
  };
  const abnormalCount = counts.low + counts.high;
  const numericValues = values.filter((value) => Number.isFinite(value));
  const summary = {
    mean: average(numericValues),
    min: Math.min(...numericValues),
    max: Math.max(...numericValues),
    abnormalCount,
  };
  const importanceRows = getFeatureImportanceRows(rows);
  const insights = buildInsights(rows, confidence, isHypoglycemia, lang);
  const recommendations = buildRecommendations(rows, confidence, isHypoglycemia, lang);
  const previousValues = FIELD_ORDER.map((field) => Number(previousData?.[field]) || 0);

  return (
    <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "28px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          paddingBottom: "14px",
          borderBottom: "2px solid rgba(15, 118, 110, 0.15)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={titleIconStyle}>📊</span>
          <div>
            <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 900, color: "#0f172a" }}>
              {t.title}
            </h2>
            <div style={{ marginTop: "6px", fontSize: "13px", color: "#64748b", fontWeight: 700 }}>
              {t.source}: {sourceLabel}
            </div>
          </div>
        </div>
        {isPredictionRefreshing && (
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f766e" }}>
            {t.refreshing}
          </span>
        )}
      </div>

      <div style={statGridStyle}>
        <MetricCard label={t.prediction} value={predictionResult ? predictionText : t.unknown} />
        <MetricCard label={t.confidence} value={confidence === null ? t.unknown : `${confidence}%`} />
        <MetricCard label={t.riskLevel} value={riskText} highlight={abnormalCount > 0 || confidence >= 50} />
        <MetricCard
          label={t.statistics}
          value={`${formatValue(summary.mean)} avg | ${formatValue(summary.min)}-${formatValue(summary.max)}`}
        />
      </div>

      <Panel title={t.patientValues} icon="📋">
        <div style={largeChartStyle}>
          <Bar data={barData(labels, values, rows)} options={barOptions(t, rows)} />
        </div>
      </Panel>

      <Panel title={t.profile} icon="☼">
        <div style={largeRadarStyle}>
          <Radar data={radarData(labels, rows)} options={radarOptions()} />
        </div>
      </Panel>

      <Panel title={t.exactValues} icon="📝">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px", fontSize: "16px" }}>
            <thead>
              <tr>
                {[t.field, t.value, t.unit, t.normal, t.status].map((header) => (
                  <th key={header} style={tableHeaderStyle}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.field} style={{ background: "rgba(255, 255, 255, 0.78)" }}>
                  <td style={tableCellFirstStyle}>{row.label}</td>
                  <td style={{ ...tableCellStyle, color: row.status.color, fontWeight: 900 }}>{formatValue(row.value)}</td>
                  <td style={tableCellStyle}>{row.range.unit || "-"}</td>
                  <td style={tableCellStyle}>{row.range.min} - {row.range.max}</td>
                  <td style={tableCellLastStyle}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        borderRadius: "999px",
                        background: row.status.bg,
                        color: row.status.color,
                        fontWeight: 900,
                        fontSize: "14px",
                      }}
                    >
                      {row.status.icon} {row.status.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div style={chartGridStyle}>
        <Panel title={t.riskShare}>
          <div style={compactChartStyle}>
            <Doughnut data={statusData(counts, t)} options={pieOptions()} />
          </div>
        </Panel>
        <Panel title={t.trend}>
          <Line data={lineData(labels, values, previousValues, lang)} options={lineOptions()} />
        </Panel>
      </div>

      <div style={chartGridStyle}>
        <Panel title={t.featureImportance}>
          <Bar
            data={{
              labels: importanceRows.map((row) => row.label),
              datasets: [
                {
                  label: t.featureImportance,
                  data: importanceRows.map((row) => row.score),
                  backgroundColor: "rgba(15, 118, 110, 0.72)",
                  borderColor: "rgba(15, 118, 110, 1)",
                  borderWidth: 2,
                  borderRadius: 8,
                },
              ],
            }}
            options={horizontalBarOptions()}
          />
        </Panel>
        <Panel title={t.distribution}>
          <Bar
            data={{
              labels: [t.low, t.ok, t.high],
              datasets: [
                {
                  label: t.distribution,
                  data: [counts.low, counts.normal, counts.high],
                  backgroundColor: ["#d97706", "#16a34a", "#dc2626"],
                  borderRadius: 8,
                },
              ],
            }}
            options={distributionOptions()}
          />
        </Panel>
      </div>

      <div style={twoColumnStyle}>
        <Panel title={t.insights}>
          <SimpleList items={insights} />
        </Panel>
        <Panel title={t.recommendations}>
          <SimpleList items={recommendations} />
        </Panel>
      </div>

      <Panel title={t.comparison}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "10px" }}>
          {rows.map((row) => {
            const previous = Number(previousData?.[row.field]);
            const hasPrevious = Number.isFinite(previous);
            const delta = hasPrevious ? row.value - previous : 0;
            return (
              <div key={row.field} style={miniCardStyle}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 800 }}>{row.label}</div>
                <div style={{ fontSize: "18px", color: "#0f172a", fontWeight: 900 }}>{formatValue(row.value)}</div>
                <div style={{ fontSize: "12px", color: delta > 0 ? "#dc2626" : delta < 0 ? "#0f766e" : "#64748b", fontWeight: 800 }}>
                  {hasPrevious ? `${delta >= 0 ? "+" : ""}${formatValue(delta)} vs previous` : t.noPrevious}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

    </div>
  );
}

function getFieldStatus(field, value, lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const range = NORMAL_RANGES[field];
  if (value < range.min) {
    return { status: "low", label: t.low, color: "#d97706", bg: "rgba(217, 119, 6, 0.12)", icon: "⚠" };
  }
  if (value > range.max) {
    return { status: "high", label: t.high, color: "#dc2626", bg: "rgba(239, 68, 68, 0.12)", icon: "⚠" };
  }
  return { status: "normal", label: t.ok, color: "#16a34a", bg: "rgba(34, 197, 94, 0.14)", icon: "☑" };
}

function getRiskText(result, isHypoglycemia, lang) {
  if (isHypoglycemia) return lang === "en" ? "High Risk (Hypoglycemia)" : "Rrezik i Larte (Hipoglikemi)";
  if (!result) return TRANSLATIONS[lang].unknown;
  const value = String(result.risk_level || "").toLowerCase();
  if (lang === "en") {
    if (value.includes("high") || value.includes("larte")) return "High Risk";
    if (value.includes("medium") || value.includes("mes")) return "Medium Risk";
    if (value.includes("low") || value.includes("ulet")) return "Low Risk";
  }
  if (value.includes("high") || value.includes("larte")) return "Rrezik i Larte";
  if (value.includes("medium") || value.includes("mes")) return "Rrezik Mesatar";
  if (value.includes("low") || value.includes("ulet")) return "Rrezik i Ulet";
  return result.risk_level || TRANSLATIONS[lang].unknown;
}

function getFeatureImportanceRows(rows) {
  return rows
    .map((row) => {
      const range = row.range;
      const distance =
        row.value < range.min
          ? (range.min - row.value) / Math.max(range.min, 1)
          : row.value > range.max
          ? (row.value - range.max) / Math.max(range.max, 1)
          : 0;
      return {
        label: row.label,
        score: Math.round((FEATURE_WEIGHTS[row.field] * (1 + distance) * 100) * 10) / 10,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function buildInsights(rows, confidence, isHypoglycemia, lang) {
  const highRows = rows.filter((row) => row.status.status === "high");
  const lowRows = rows.filter((row) => row.status.status === "low");
  if (lang === "en") {
    return [
      confidence === null ? "Prediction is waiting for complete current values." : `Current model confidence is ${confidence}%.`,
      isHypoglycemia ? "Glucose is below 70 mg/dL, which is clinically urgent." : "Glucose is evaluated against the current entered value.",
      highRows.length ? `${highRows.map((row) => row.label).join(", ")} above normal range.` : "No entered value is above the normal range.",
      lowRows.length ? `${lowRows.map((row) => row.label).join(", ")} below normal range.` : "No entered value is below the normal range.",
    ];
  }
  return [
    confidence === null ? "Parashikimi pret vlera te plota aktuale." : `Konfidenca aktuale e modelit eshte ${confidence}%.`,
    isHypoglycemia ? "Glukoza eshte nen 70 mg/dL dhe kerkon vemendje urgjente." : "Glukoza vleresohet nga vlera aktuale e futur.",
    highRows.length ? `${highRows.map((row) => row.label).join(", ")} mbi norme.` : "Asnje vlere nuk eshte mbi norme.",
    lowRows.length ? `${lowRows.map((row) => row.label).join(", ")} nen norme.` : "Asnje vlere nuk eshte nen norme.",
  ];
}

function buildRecommendations(rows, confidence, isHypoglycemia, lang) {
  const glucose = rows.find((row) => row.field === "Glucose")?.value || 0;
  const bmi = rows.find((row) => row.field === "BMI")?.value || 0;
  const pressure = rows.find((row) => row.field === "BloodPressure")?.value || 0;
  if (lang === "en") {
    return [
      isHypoglycemia ? "Seek immediate medical advice for possible hypoglycemia." : "Review these values with a qualified clinician before making care decisions.",
      glucose > 140 ? "Monitor blood sugar closely and discuss diabetes screening with your doctor." : "Keep glucose monitoring consistent with your care plan.",
      bmi > 30 ? "BMI is above the normal range; nutrition and activity planning may reduce risk." : "Maintain healthy nutrition and regular physical activity.",
      pressure > 90 ? "Blood pressure is above the normal limit used here; follow up with clinical measurement." : `Current risk confidence: ${confidence === null ? "pending" : `${confidence}%`}.`,
    ];
  }
  return [
    isHypoglycemia ? "Kerko keshille mjekesore menjehere per hipoglikemi te mundshme." : "Diskuto keto vlera me mjek para vendimeve shendetesore.",
    glucose > 140 ? "Monitoro sheqerin ne gjak dhe diskuto skriningun e diabetit." : "Vazhdo monitorimin e glukozes sipas planit shendetesor.",
    bmi > 30 ? "BMI eshte mbi norme; ushqimi dhe aktiviteti fizik mund te ulin rrezikun." : "Mbaj ushqim te balancuar dhe aktivitet fizik te rregullt.",
    pressure > 90 ? "Tensioni eshte mbi kufirin normal te perdorur ketu; kontrolloje klinikisht." : `Konfidenca aktuale: ${confidence === null ? "ne pritje" : `${confidence}%`}.`,
  ];
}

function barData(labels, values, rows) {
  return {
    labels,
    datasets: [
      {
        label: "Current value",
        data: values,
        backgroundColor: rows.map((row) => hexToRgba(row.status.color, 0.72)),
        borderColor: rows.map((row) => row.status.color),
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: "Max normal",
        data: rows.map((row) => row.range.max),
        backgroundColor: "rgba(59, 130, 246, 0.12)",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderDash: [6, 4],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };
}

function statusData(counts, t) {
  return {
    labels: [t.low, t.ok, t.high],
    datasets: [
      {
        data: [counts.low, counts.normal, counts.high],
        backgroundColor: ["#d97706", "#16a34a", "#dc2626"],
        borderColor: ["#b45309", "#15803d", "#b91c1c"],
        borderWidth: 2,
      },
    ],
  };
}

function lineData(labels, values, previousValues, lang) {
  return {
    labels,
    datasets: [
      {
        label: lang === "en" ? "Current" : "Aktuale",
        data: values,
        borderColor: "#0f766e",
        backgroundColor: "rgba(15, 118, 110, 0.12)",
        tension: 0.35,
        fill: true,
      },
      {
        label: lang === "en" ? "Previous" : "Paraprake",
        data: previousValues,
        borderColor: "#64748b",
        backgroundColor: "rgba(100, 116, 139, 0.08)",
        borderDash: [6, 4],
        tension: 0.35,
      },
    ],
  };
}

function radarData(labels, rows) {
  return {
    labels,
    datasets: [
      {
        label: "Current %",
        data: rows.map((row) => Math.min(Math.round((row.value / row.range.max) * 100), 160)),
        backgroundColor: "rgba(15, 118, 110, 0.14)",
        borderColor: "#0f766e",
        pointBackgroundColor: rows.map((row) => row.status.color),
        borderWidth: 2,
      },
      {
        label: "Normal limit",
        data: rows.map(() => 100),
        backgroundColor: "rgba(59, 130, 246, 0.05)",
        borderColor: "rgba(59, 130, 246, 0.45)",
        pointRadius: 0,
      },
    ],
  };
}

function barOptions(t, rows) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 8 } },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "rectRounded",
          font: { size: 14, weight: "bold" },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: (ctx) => {
            const row = rows[ctx.dataIndex];
            return `${t.normal}: ${row.range.min} - ${row.range.max} ${row.range.unit}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(148, 163, 184, 0.16)" },
        ticks: { font: { size: 13 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 13, weight: "bold" } },
      },
    },
  };
}

function pieOptions() {
  return { responsive: true, plugins: { legend: { position: "bottom" } } };
}

function lineOptions() {
  return { responsive: true, plugins: { legend: { position: "top" } }, scales: { y: { beginAtZero: true } } };
}

function radarOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, font: { size: 14, weight: "bold" }, padding: 20 },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 150,
        ticks: { stepSize: 25, backdropColor: "transparent", font: { size: 12 } },
        grid: { color: "rgba(148, 163, 184, 0.18)" },
        angleLines: { color: "rgba(148, 163, 184, 0.18)" },
        pointLabels: { font: { size: 14, weight: "bold" } },
      },
    },
  };
}

function horizontalBarOptions() {
  return {
    indexAxis: "y",
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true } },
  };
}

function distributionOptions() {
  return {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function Panel({ title, icon, children }) {
  return (
    <div style={panelStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "18px",
          fontWeight: 900,
          color: "#334155",
          marginBottom: "24px",
        }}
      >
        {icon ? <span style={{ fontSize: "22px" }}>{icon}</span> : null}
        {title}
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value, highlight = false }) {
  return (
    <div style={{ ...miniCardStyle, borderLeft: `4px solid ${highlight ? "#dc2626" : "#0f766e"}` }}>
      <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: "8px", fontSize: "20px", fontWeight: 900, color: highlight ? "#dc2626" : "#0f172a" }}>
        {value}
      </div>
    </div>
  );
}

function SimpleList({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {items.map((item) => (
        <div key={item} style={{ padding: "10px 12px", borderRadius: "10px", background: "rgba(241, 245, 249, 0.8)", color: "#334155", fontSize: "14px", lineHeight: 1.5 }}>
          {item}
        </div>
      ))}
    </div>
  );
}

const statGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: "16px",
};

const chartGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "22px",
};

const twoColumnStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "18px",
};

const panelStyle = {
  background: "rgba(248, 250, 252, 0.86)",
  borderRadius: "22px",
  padding: "28px 30px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.035)",
};

const miniCardStyle = {
  background: "rgba(255, 255, 255, 0.75)",
  borderRadius: "12px",
  padding: "14px",
  border: "1px solid rgba(148, 163, 184, 0.14)",
};

const compactChartStyle = {
  width: "100%",
  maxWidth: "240px",
  minHeight: "240px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
};

const radarChartStyle = {
  width: "100%",
  maxWidth: "360px",
  minHeight: "300px",
  margin: "0 auto",
};

const largeChartStyle = {
  width: "100%",
  height: "570px",
};

const largeRadarStyle = {
  width: "100%",
  height: "580px",
  maxWidth: "760px",
  margin: "0 auto",
};

const titleIconStyle = {
  width: "36px",
  height: "36px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  background: "rgba(226, 232, 240, 0.7)",
  boxShadow: "inset 0 0 0 1px rgba(148, 163, 184, 0.18)",
  fontSize: "24px",
};

const tableHeaderStyle = {
  padding: "0 18px 12px",
  textAlign: "left",
  fontWeight: 900,
  color: "#475569",
  fontSize: "15px",
  textTransform: "uppercase",
  letterSpacing: "0.7px",
};

const tableCellStyle = {
  padding: "14px 18px",
  color: "#64748b",
  fontWeight: 700,
};

const tableCellFirstStyle = {
  ...tableCellStyle,
  borderRadius: "12px 0 0 12px",
  color: "#1e293b",
  fontWeight: 900,
};

const tableCellLastStyle = {
  ...tableCellStyle,
  borderRadius: "0 12px 12px 0",
};
