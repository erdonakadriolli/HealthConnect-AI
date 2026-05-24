import { useEffect } from "react";

export default function PredictionModal({
  result,
  onClose,
  type = "diabetes",
  inline = false,
  formValues = null,
  lang = "sq",
}) {
  const probability = Math.round(Number(result?.probability || 0) * 100);
  
  const glucoseVal = Number(formValues?.Glucose) || 0;
  const isHypoglycemia = type === "diabetes" && glucoseVal > 0 && glucoseVal < 70;

  let riskText = translateRisk(result?.risk_level, lang);
  let isHighRisk =
    riskText.toLowerCase().includes("high") ||
    riskText.toLowerCase().includes("lartë") ||
    riskText.toLowerCase().includes("risk");

  let predictionText = getPredictionText(type, result?.prediction, lang);
  let modelText = result?.model_used || "Unknown";
  
  let groupText =
    result?.group_kmeans ||
    result?.kmeans_group ||
    result?.cluster ||
    result?.group ||
    riskText;

  if (groupText === result?.risk_level) {
    groupText = riskText;
  }

  let messageText =
    result?.message || getDefaultMessage(type, isHighRisk, probability, lang);

  if (isHypoglycemia) {
    isHighRisk = true;
    if (lang === "en") {
      riskText = "High Risk (Hypoglycemia)";
      predictionText = "Hypoglycemic";
      messageText = `High Risk! Glucose values are very low (${glucoseVal} mg/dL), indicating Hypoglycemia. This represents a high health risk! Immediate medical check-up is recommended.`;
      groupText = "High Risk (Hypoglycemia)";
    } else {
      riskText = "Rrezik i Lartë (Hipoglikemi)";
      predictionText = "Hipoglikemik";
      messageText = `Rrezik i Lartë! Vlerat e glukozës janë shumë të ulëta (${glucoseVal} mg/dL), gjë që tregon Hipoglikemi. Kjo paraqet rrezik të lartë shëndetësor! Rekomandohet kontroll i menjëhershëm mjekësor.`;
      groupText = "Rrezik i Lartë (Hipoglikemi)";
    }
  }

  if (lang === "en" && !isHypoglycemia) {
    messageText = getEnglishMessage(messageText, type, isHighRisk, probability);
  }

  useEffect(() => {
    if (inline) return;
    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");

    return () => {
      document.body.style.overflow = oldOverflow;
      document.body.classList.remove("modal-open");
    };
  }, [inline]);

  const cardContent = (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: inline ? "100%" : "680px",
        background: "#ffffff",
        borderRadius: "28px",
        padding: "32px",
        boxShadow: inline
          ? "0 10px 30px rgba(15, 23, 42, 0.04)"
          : "0 25px 60px -12px rgba(15, 23, 42, 0.25)",
        border: inline
          ? "1px solid rgba(15, 118, 110, 0.15)"
          : "1px solid rgba(255, 255, 255, 0.8)",
        position: "relative",
        marginTop: inline ? "0" : "auto",
        marginBottom: inline ? "0" : "auto",
      }}
    >
      {!inline && (
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "1px solid rgba(148, 163, 184, 0.16)",
            background: "#f1f5f9",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            color: "#64748b",
            fontWeight: "400",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e2e8f0";
            e.currentTarget.style.color = "#1e293b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          ×
        </button>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "25px" }}>🎯</span>

        <h2
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: "800",
            color: "#1f4b7a",
          }}
        >
          {lang === "en" ? "AI Prediction Results" : "Rezultati i AI-së"}
        </h2>
      </div>

      <div
        style={{
          height: "1px",
          background: "rgba(148, 163, 184, 0.18)",
          marginBottom: "22px",
        }}
      />

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "11px 16px",
          borderRadius: "999px",
          background: isHighRisk
            ? "rgba(239, 68, 68, 0.10)"
            : "rgba(34, 197, 94, 0.10)",
          color: isHighRisk ? "#b42318" : "#15803d",
          fontSize: "14px",
          fontWeight: "800",
          marginBottom: "22px",
        }}
      >
        <span>{isHighRisk ? "🚨" : "✅"}</span>
        {riskText}
      </div>

      <div
        style={{
          fontSize: "16px",
          fontWeight: "700",
          color: "#1e293b",
          marginBottom: "12px",
        }}
      >
        {isHypoglycemia
          ? lang === "en"
            ? "Health Risk Status:"
            : "Statusi i Rrezikut Shëndetësor:"
          : lang === "en"
          ? `Probability of ${type === "diabetes" ? "diabetes" : "heart disease"}:`
          : `Probabiliteti për ${type === "diabetes" ? "diabet" : "sëmundje zemre"}:`}
      </div>

      <div
        style={{
          width: "100%",
          height: "28px",
          borderRadius: "999px",
          background: "#dbe5ef",
          overflow: "hidden",
          position: "relative",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: `${Math.max(10, Math.min(probability, 100))}%`,
            height: "100%",
            borderRadius: "999px",
            background: isHypoglycemia
              ? "linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)"
              : "linear-gradient(90deg, #7bd8a3 0%, #eacb73 58%, #ef9a86 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "13px",
            fontWeight: "800",
            transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {isHypoglycemia
            ? lang === "en"
              ? "Critical: 100% Risk (Hypoglycemia)"
              : "Kritike: 100% Rrezik (Hipoglikemi)"
            : `${probability}%`}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        <InfoCard label={lang === "en" ? "PREDICTION" : "PARASHIKIMI"} value={predictionText} />
        <InfoCard label={lang === "en" ? "MODEL USED" : "MODELI I PËRDORUR"} value={modelText} />
        <InfoCard label={lang === "en" ? "K-MEANS GROUP" : "GRUPI K-MEANS"} value={groupText} />
        <InfoCard label={lang === "en" ? "CONFIDENCE" : "KONFIDENCA"} value={`${probability}%`} />
      </div>

      <div
        style={{
          borderLeft: "4px solid #60a5fa",
          background: "rgba(96, 165, 250, 0.10)",
          padding: "16px",
          borderRadius: "14px",
          fontSize: "15px",
          color: "#335b7d",
          lineHeight: "1.6",
        }}
      >
        <span style={{ marginRight: "8px" }}>
          {isHighRisk ? "🚨" : "✅"}
        </span>
        {cleanBackendMessage(
          messageText,
          type,
          predictionText,
          riskText,
          probability,
          lang
        )}
      </div>
    </div>
  );

  if (inline) {
    return cardContent;
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "60px 20px",
        overflowY: "auto",
        scrollBehavior: "smooth",
      }}
    >
      {cardContent}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div
      style={{
        background: "rgba(241, 245, 249, 0.82)",
        borderRadius: "16px",
        padding: "18px",
        borderLeft: "4px solid #60a5fa",
        minHeight: "88px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: "700",
          color: "#718096",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "17px",
          fontWeight: "800",
          color: "#1e293b",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function translateRisk(risk, lang) {
  if (!risk) return lang === "en" ? "Unknown" : "E panjohur";

  const value = String(risk).toLowerCase();

  if (lang === "en") {
    if (value.includes("i larte") || value.includes("high")) return "High Risk";
    if (value.includes("i ulet") || value.includes("low")) return "Low Risk";
    if (value.includes("mes") || value.includes("medium")) return "Medium Risk";
    return risk;
  } else {
    if (value.includes("i larte") || value.includes("high")) return "Rrezik i Lartë";
    if (value.includes("i ulet") || value.includes("low")) return "Rrezik i Ulët";
    if (value.includes("mes") || value.includes("medium")) return "Rrezik Mesatar";
    return risk;
  }
}

function getPredictionText(type, prediction, lang) {
  const isPositive = Number(prediction) === 1;

  if (type === "diabetes") {
    if (lang === "en") {
      return isPositive ? "Diabetic" : "Non-Diabetic";
    }
    return isPositive ? "Diabetik" : "Jo Diabetik";
  }

  if (lang === "en") {
    return isPositive ? "Positive" : "Negative";
  }
  return isPositive ? "Pozitiv" : "Negativ";
}

function getDefaultMessage(type, isHighRisk, probability, lang) {
  if (type === "diabetes") {
    if (lang === "en") {
      return isHighRisk
        ? `Result: High Risk. The patient has a ${probability}% probability of diabetes. Immediate medical check-up is recommended.`
        : `Result: Low Risk. The patient has a ${probability}% probability of diabetes.`;
    }
    return isHighRisk
      ? `Rezultati: rrezik i lartë. Pacienti ka ${probability}% probabilitet për diabet. Rekomandohet ekzaminim urgjent.`
      : `Rezultati: rrezik i ulët. Pacienti ka ${probability}% probabilitet për diabet.`;
  }

  if (lang === "en") {
    return isHighRisk
      ? `Result: High Risk. The patient has a ${probability}% probability of heart disease. Immediate cardiology consult is recommended.`
      : `Result: Low Risk. The patient has a ${probability}% probability of heart disease.`;
  }
  return isHighRisk
    ? `Rezultati: rrezik i lartë. Pacienti ka ${probability}% probabilitet për sëmundje zemre. Rekomandohet konsultë kardiologjike.`
    : `Rezultati: rrezik i ulët. Pacienti ka ${probability}% probabilitet për sëmundje zemre.`;
}

function getEnglishMessage(message, type, isHighRisk, probability) {
  if (message.startsWith("Rrezik i Lartë!")) {
    return `High Risk! Glucose values are very low, indicating Hypoglycemia. This represents a high health risk! Immediate medical check-up is recommended.`;
  }
  
  if (message.includes("rrezik i ulet") || message.includes("low")) {
    return `Result: Low Risk. The patient has a ${probability}% probability of diabetes. Routine monitoring is recommended.`;
  }
  
  if (message.includes("rrezik i larte") || message.includes("high")) {
    return `Result: High Risk. The patient has a ${probability}% probability of diabetes. Immediate medical check-up is recommended.`;
  }

  return getDefaultMessage(type, isHighRisk, probability, "en");
}

function cleanBackendMessage(message, type, predictionText, riskText, probability, lang) {
  if (!message) {
    return getDefaultMessage(
      type,
      riskText.toLowerCase().includes("lartë") ||
      riskText.toLowerCase().includes("high") ||
      riskText.toLowerCase().includes("risk"),
      probability,
      lang
    );
  }

  if (message.startsWith("Rrezik i Lartë!") || message.startsWith("High Risk!")) {
    return message;
  }

  if (lang === "en") {
    return message;
  }

  if (type === "diabetes") {
    return (
      message
        .replace("Pacienti ka", "")
        .replace("probabilitet per diabet.", "")
        .replace("Rekomandohet kontroll mjekesor.", "Rekomandohet kontroll mjekësor.")
        .trim() || `Rezultati: ${predictionText.toLowerCase()}.`
    );
  }

  return message
    .replace("Pacienti ka", "")
    .replace("probabilitet per semundje zemre.", "")
    .replace("Rekomandohet konsulte kardiologjike.", "Rekomandohet konsultë kardiologjike.")
    .trim();
}