import { useEffect } from "react";

export default function PredictionModal({ result, onClose, type = "heart" }) {
  const probability = Math.round(Number(result?.probability || 0) * 100);
  const riskText = translateRisk(result?.risk_level);

  const isHighRisk =
    riskText.toLowerCase().includes("high") ||
    riskText.toLowerCase().includes("lartë");

  const predictionText = getPredictionText(type, result?.prediction);
  const modelText = result?.model_used || "Unknown";
  const groupText =
    result?.group_kmeans ||
    result?.kmeans_group ||
    result?.cluster ||
    result?.group ||
    riskText;

  const messageText =
    result?.message || getDefaultMessage(type, isHighRisk, probability);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");

    return () => {
      document.body.style.overflow = oldOverflow;
      document.body.classList.remove("modal-open");
    };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "transparent",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "95px 20px 24px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "700px",
          background: "#f8fafc",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.12)",
          border: "1px solid rgba(148, 163, 184, 0.16)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            border: "1px solid rgba(148, 163, 184, 0.16)",
            background: "rgba(255, 255, 255, 0.85)",
            cursor: "pointer",
            fontSize: "22px",
            color: "#64748b",
            fontWeight: "700",
          }}
        >
          ×
        </button>

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
            Rezultati i AI-së
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
          Probabiliteti për {type === "diabetes" ? "diabet" : "sëmundje zemre"}:
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
              background:
                "linear-gradient(90deg, #7bd8a3 0%, #eacb73 58%, #ef9a86 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "15px",
              fontWeight: "800",
            }}
          >
            {probability}%
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
          <InfoCard label="PARASHIKIMI" value={predictionText} />
          <InfoCard label="MODELI I PËRDORUR" value={modelText} />
          <InfoCard label="GRUPI K-MEANS" value={groupText} />
          <InfoCard label="KONFIDENCA" value={`${probability}%`} />
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
            probability
          )}
        </div>
      </div>
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

function translateRisk(risk) {
  if (!risk) return "E panjohur";

  const value = String(risk).toLowerCase();

  if (value.includes("i larte") || value.includes("high")) return "Rrezik i Lartë";
  if (value.includes("i ulet") || value.includes("low")) return "Rrezik i Ulët";
  if (value.includes("mes") || value.includes("medium")) return "Rrezik Mesatar";

  return risk;
}

function getPredictionText(type, prediction) {
  const isPositive = Number(prediction) === 1;

  if (type === "diabetes") {
    return isPositive ? "Diabetik" : "Jo Diabetik";
  }

  return isPositive ? "Pozitiv" : "Negativ";
}

function getDefaultMessage(type, isHighRisk, probability) {
  if (type === "diabetes") {
    return isHighRisk
      ? `Rezultati: rrezik i lartë. Pacienti ka ${probability}% probabilitet për diabet. Rekomandohet ekzaminim urgjent.`
      : `Rezultati: rrezik i ulët. Pacienti ka ${probability}% probabilitet për diabet.`;
  }

  return isHighRisk
    ? `Rezultati: rrezik i lartë. Pacienti ka ${probability}% probabilitet për sëmundje zemre. Rekomandohet konsultë kardiologjike.`
    : `Rezultati: rrezik i ulët. Pacienti ka ${probability}% probabilitet për sëmundje zemre.`;
}

function cleanBackendMessage(message, type, predictionText, riskText, probability) {
  if (!message) {
    return getDefaultMessage(
      type,
      riskText.toLowerCase().includes("lartë") ||
      riskText.toLowerCase().includes("high"),
      probability
    );
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