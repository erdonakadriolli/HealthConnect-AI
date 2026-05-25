import { useEffect, useState } from "react";
import {
  Activity,
  Droplets,
  Calendar,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Gauge,
  Syringe,
  Scale,
  Dna,
  UserRound,
  FileText,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Loader2,
  Clock,
} from "lucide-react";

import { getPredictionHistory } from "../api/predictionApi";
import Page from "../components/ui/Page";
import Card from "../components/ui/Card";
import ActionCard from "../components/ui/ActionCard";

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

const FIELD_ICONS = {
  Pregnancies: <UserRound size={16} />,
  Glucose: <Droplets size={16} />,
  BloodPressure: <Gauge size={16} />,
  SkinThickness: <Activity size={16} />,
  Insulin: <Syringe size={16} />,
  BMI: <Scale size={16} />,
  DiabetesPedigreeFunction: <Dna size={16} />,
  Age: <Calendar size={16} />,
};

const TRANSLATIONS = {
  sq: {
    badgeText: "Paneli Shëndetësor",
    title: "Arkiva Shëndetësore",
    subtitle: "Mirëseerdhët në HealthConnect AI. Këtu mund të monitoroni ecurinë tuaj shëndetësore, të shihni historikun e analizave të ruajtura dhe të kryeni parashikime të reja të rrezikut të diabetit.",
    btnNewPredict: "Kryej Parashikim të Ri",
    historyTitle: "Arkiva e Analizave të Mëparshme",
    historyDesc: "Këtu janë parashikimet e arkivuara automatikisht çdo herë që keni kontrolluar analizat tuaja.",
    noHistoryTitle: "Nuk u gjet asnjë analizë e arkivuar",
    noHistoryDesc: "Ju nuk keni kryer ende asnjë parashikim shëndetësor. Klikoni butonin më sipër për të parashikuar rrezikun tuaj të diabetit nga një foto, PDF ose duke i shkruar vlerat vetë.",
    dateLabel: "Data e Kontrollit",
    riskLabel: "Vlerësimi i Rrezikut",
    detailsLabel: "Detajet e Vlerave Klinike",
    normalBadge: "Normal (Rrezik i Ulët)",
    lowSugarBadge: "Kritike: Sheqer i Ulët (Hipoglikemi)",
    mediumRiskBadge: "Rrezik Mesatar",
    highRiskBadge: "Rrezik i Lartë",
    pregnancies: "Shtatzanitë",
    glucose: "Glukoza",
    bloodPressure: "Tensioni i Gjakut",
    skinThickness: "Trashësia e Lëkurës",
    insulin: "Niveli i Insulinës",
    bmi: "BMI (Indeksi i Masës)",
    pedigree: "Rreziku Gjenetik",
    age: "Mosha",
    probability: "Probabiliteti i Rrezikut",
    recommendationTitle: "Rekomandimi",
    recNormal: "Vlerat tuaja metabolike janë brenda normave. Vazhdoni të mbani një stil jete të shëndetshëm dhe aktiv.",
    recHypo: "Vlera e glukozës është jashtëzakonisht e ulët! Kjo tregon gjendje hipoglikemie, e cila paraqet rrezik kritik. Rekomandohet kontroll i menjëhershëm shëndetësor.",
    recMedium: "Ekziston një rrezik mesatar. Këshillohet të kujdeseni për ushqimin, të kryeni aktivitet fizik dhe të monitoroni rregullisht vlerat.",
    recHigh: "Rrezik i lartë për diabet! Rekomandohet vizitë te mjeku për ekzaminim dhe këshillim të mëtejshëm mjekësor profesional.",
    loadingHistory: "Duke ngarkuar historikun e analizave...",
    failHistory: "Dështoi ngarkimi i historikut. Provoni të rifreskoni faqen.",
  },
  en: {
    badgeText: "Health Panel",
    title: "Health Archive",
    subtitle: "Welcome to HealthConnect AI. Here you can monitor your health progress, view your archived clinical analyses, and run new AI-based diabetes risk predictions.",
    btnNewPredict: "Run New Prediction",
    historyTitle: "Archived Medical History",
    historyDesc: "Below are your medical tests automatically archived every time you ran a risk assessment.",
    noHistoryTitle: "No archived analyses found",
    noHistoryDesc: "You haven't run any health predictions yet. Click the button above to assess your diabetes risk from a photo, PDF, or by typing values manually.",
    dateLabel: "Checkup Date",
    riskLabel: "Risk Assessment",
    detailsLabel: "Clinical Values Details",
    normalBadge: "Normal (Low Risk)",
    lowSugarBadge: "Critical: Low Sugar (Hypoglycemia)",
    mediumRiskBadge: "Medium Risk",
    highRiskBadge: "High Risk",
    pregnancies: "Pregnancies",
    glucose: "Glucose",
    bloodPressure: "Blood Pressure",
    skinThickness: "Skin Thickness",
    insulin: "Insulin Level",
    bmi: "BMI (Body Mass Index)",
    pedigree: "Genetic Risk",
    age: "Age",
    probability: "Risk Probability",
    recommendationTitle: "Recommendation",
    recNormal: "Your metabolic indicators are within healthy range. Maintain a balanced diet and regular physical activity.",
    recHypo: "Glucose level is dangerously low! This indicates hypoglycemia, representing a critical risk. Immediate medical attention is recommended.",
    recMedium: "A moderate risk has been detected. We advise improving diet, increasing exercise, and regularly monitoring metabolic values.",
    recHigh: "High risk of diabetes detected! A professional consultation with your doctor is highly recommended for proper clinical screening.",
    loadingHistory: "Loading analysis history...",
    failHistory: "Failed to load history. Please try refreshing the page.",
  }
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

function getFieldStatus(field, value, lang) {
  const range = NORMAL_RANGES[field];
  if (!range) return { status: "normal", label: lang === "sq" ? "Normale" : "Normal", color: "#10b981", bg: "rgba(16, 185, 129, 0.08)" };
  
  if (value < range.min) {
    return {
      status: "low",
      label: lang === "sq" ? "E Ulët" : "Low",
      color: "#f59e0b", // Amber
      bg: "rgba(245, 158, 11, 0.08)",
    };
  } else if (value > range.max) {
    return {
      status: "high",
      label: lang === "sq" ? "E Lartë" : "High",
      color: "#ef4444", // Red
      bg: "rgba(239, 68, 68, 0.08)",
    };
  }
  
  return {
    status: "normal",
    label: lang === "sq" ? "Normale" : "Normal",
    color: "#10b981", // Emerald Green
    bg: "rgba(16, 185, 129, 0.08)",
  };
}

function formatDate(isoString, lang) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString(lang === "sq" ? "sq-AL" : "en-US", options);
}

export default function Dashboard() {
  const [lang, setLang] = useState("sq"); // Default to SQ as user requested Shqip / English toggle support
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedIds, setExpandedIds] = useState({});

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        setError("");
        const data = await getPredictionHistory();
        setHistory(data || []);
      } catch (err) {
        setError(t.failHistory);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [lang]);

  function toggleExpand(id) {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  function renderRiskBadge(item) {
    const isHypo = item.glucose > 0 && item.glucose < 70;
    const isHigh = item.ml_prediction === 1;
    const isMedium = item.ml_prediction === 0 && item.ml_confidence >= 0.3;

    if (isHypo) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "8px",
            background: "rgba(245, 158, 11, 0.12)",
            color: "#d97706",
            fontSize: "13px",
            fontWeight: "700",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <AlertCircle size={14} />
          {t.lowSugarBadge}
        </span>
      );
    }

    if (isHigh) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "8px",
            background: "rgba(239, 68, 68, 0.12)",
            color: "#dc2626",
            fontSize: "13px",
            fontWeight: "700",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <AlertCircle size={14} />
          {t.highRiskBadge}
        </span>
      );
    }

    if (isMedium) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "8px",
            background: "rgba(217, 119, 6, 0.12)",
            color: "#d97706",
            fontSize: "13px",
            fontWeight: "700",
            border: "1px solid rgba(217, 119, 6, 0.2)",
          }}
        >
          <AlertCircle size={14} />
          {t.mediumRiskBadge}
        </span>
      );
    }

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "8px",
          background: "rgba(16, 185, 129, 0.12)",
          color: "#059669",
          fontSize: "13px",
          fontWeight: "700",
          border: "1px solid rgba(16, 185, 129, 0.2)",
        }}
      >
        <CheckCircle size={14} />
        {t.normalBadge}
      </span>
    );
  }

  function renderRecommendation(item) {
    const isHypo = item.glucose > 0 && item.glucose < 70;
    const isHigh = item.ml_prediction === 1;
    const isMedium = item.ml_prediction === 0 && item.ml_confidence >= 0.3;

    let text = t.recNormal;
    let color = "#047857";
    let bg = "rgba(16, 185, 129, 0.08)";
    let border = "1px solid rgba(16, 185, 129, 0.14)";

    if (isHypo) {
      text = t.recHypo;
      color = "#b45309";
      bg = "rgba(245, 158, 11, 0.08)";
      border = "1px solid rgba(245, 158, 11, 0.14)";
    } else if (isHigh) {
      text = t.recHigh;
      color = "#be123c";
      bg = "rgba(239, 68, 68, 0.08)";
      border = "1px dashed rgba(239, 68, 68, 0.22)";
    } else if (isMedium) {
      text = t.recMedium;
      color = "#b45309";
      bg = "rgba(217, 119, 6, 0.08)";
      border = "1px solid rgba(217, 119, 6, 0.14)";
    }

    return (
      <div
        style={{
          marginTop: "16px",
          padding: "14px 18px",
          borderRadius: "16px",
          background: bg,
          border: border,
          color: color,
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        <strong>{t.recommendationTitle}:</strong> {text}
      </div>
    );
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

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderRadius: "999px",
            background: "rgba(15, 118, 110, 0.12)",
            color: "#0f766e",
            fontSize: "14px",
            fontWeight: "700",
            marginBottom: "18px",
          }}
        >
          <Activity size={16} />
          {t.badgeText}
        </div>

        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "42px",
            lineHeight: "1.1",
            color: "#0f172a",
            letterSpacing: "-1px",
          }}
        >
          {t.title}
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: "680px",
            fontSize: "17px",
            lineHeight: "1.7",
            color: "rgba(15, 23, 42, 0.68)",
          }}
        >
          {t.subtitle}
        </p>

        <div
          style={{
            marginTop: "34px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: "18px",
          }}
        >
          <ActionCard
            to="/diabetes"
            variant="green"
            icon={<Droplets size={26} />}
            title={lang === "sq" ? "Vlerëso Rrezikun e Diabetit" : "Assess Diabetes Risk"}
            description={lang === "sq" ? "Ekstrakto analizat me OCR ose shkruaji manualisht" : "Extract analyses via OCR or type values manually"}
          />
        </div>

        {/* ── Predictions History Section ── */}
        <div style={{ marginTop: "48px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#0f172a",
              margin: "0 0 8px",
              letterSpacing: "-0.5px",
            }}
          >
            {t.historyTitle}
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(15, 23, 42, 0.56)",
              margin: "0 0 24px",
            }}
          >
            {t.historyDesc}
          </p>

          {loading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                padding: "48px 0",
              }}
            >
              <Loader2 size={36} className="animate-spin" style={{ color: "#0f766e" }} />
              <span style={{ fontSize: "15px", color: "rgba(15, 23, 42, 0.6)" }}>
                {t.loadingHistory}
              </span>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "18px",
                borderRadius: "18px",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.16)",
                color: "#dc2626",
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div
              style={{
                padding: "44px 28px",
                borderRadius: "24px",
                background: "rgba(15, 118, 110, 0.04)",
                border: "1px dashed rgba(15, 118, 110, 0.16)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "20px",
                  background: "rgba(15, 118, 110, 0.08)",
                  color: "#0f766e",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <Clock size={28} />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                {t.noHistoryTitle}
              </h3>
              <p
                style={{
                  margin: 0,
                  maxWidth: "480px",
                  marginInline: "auto",
                  fontSize: "14px",
                  color: "rgba(15, 23, 42, 0.52)",
                  lineHeight: "1.6",
                }}
              >
                {t.noHistoryDesc}
              </p>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {history.map((item) => {
                const isExpanded = !!expandedIds[item.id];
                return (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: "24px",
                      background: "rgba(255, 255, 255, 0.72)",
                      border: "1px solid rgba(15, 23, 42, 0.08)",
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.03)",
                      transition: "all 0.24s cubic-bezier(0.4, 0, 0.2, 1)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleExpand(item.id)}
                      style={{
                        padding: "20px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "14px",
                            background: "rgba(15, 118, 110, 0.08)",
                            color: "#0f766e",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FileText size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                            {formatDate(item.created_at, lang)}
                          </div>
                          <div
                            style={{
                              marginTop: "4px",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "rgba(15, 23, 42, 0.44)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <TrendingUp size={12} />
                            {t.probability}: {(item.ml_confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        {renderRiskBadge(item)}
                        <div style={{ color: "rgba(15, 23, 42, 0.36)" }}>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Clinical Details */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: "0 24px 24px",
                          borderTop: "1px solid rgba(15, 23, 42, 0.04)",
                          background: "rgba(248, 250, 252, 0.35)",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "14px",
                            fontWeight: "800",
                            color: "#334155",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            margin: "20px 0 14px",
                          }}
                        >
                          {t.detailsLabel}
                        </h4>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: "14px",
                          }}
                        >
                          {Object.keys(FIELD_LABELS[lang]).map((key) => {
                            const rawKey = key;
                            const val = item[rawKey.charAt(0).toLowerCase() + rawKey.slice(1)];
                            const range = NORMAL_RANGES[rawKey];
                            const status = getFieldStatus(rawKey, Number(val), lang);

                            return (
                              <div
                                key={rawKey}
                                style={{
                                  padding: "12px 16px",
                                  borderRadius: "16px",
                                  background: "white",
                                  border: `1px solid ${status.status !== "normal" ? status.color + "30" : "rgba(15, 23, 42, 0.06)"}`,
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "6px",
                                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.01)",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    color: "rgba(15, 23, 42, 0.44)",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ color: "#0f766e" }}>{FIELD_ICONS[rawKey]}</span>
                                    {FIELD_LABELS[lang][rawKey]}
                                  </div>

                                  <span
                                    style={{
                                      padding: "2px 6px",
                                      borderRadius: "6px",
                                      fontSize: "10px",
                                      fontWeight: "800",
                                      background: status.bg,
                                      color: status.color,
                                    }}
                                  >
                                    {status.label}
                                  </span>
                                </div>

                                <div
                                  style={{
                                    fontSize: "18px",
                                    fontWeight: "800",
                                    color: "#0f172a",
                                    display: "flex",
                                    alignItems: "baseline",
                                    gap: "4px",
                                  }}
                                >
                                  {val !== null && val !== undefined ? val : "N/A"}{" "}
                                  <small style={{ fontSize: "11px", fontWeight: "600", color: "rgba(15, 23, 42, 0.36)" }}>
                                    {range?.unit}
                                  </small>
                                </div>

                                <div style={{ fontSize: "11px", color: "rgba(15, 23, 42, 0.32)", fontWeight: "500" }}>
                                  {lang === "sq" ? "Norma" : "Normal"}: {range?.min}
                                  {range?.unit ? ` ${range.unit}` : ""} - {range?.max}
                                  {range?.unit ? ` ${range.unit}` : ""}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {renderRecommendation(item)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </Page>
  );
}