import { NORMAL_RANGES } from "./dashboardConfig";

const STATUS_STYLES = {
  normal: {
    color: "#059669",
    bg: "rgba(16, 185, 129, 0.1)",
    border: "rgba(16, 185, 129, 0.2)",
  },
  low: {
    color: "#d97706",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.24)",
  },
  high: {
    color: "#dc2626",
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.24)",
  },
};

export function getFieldStatus(field, value, t) {
  const range = NORMAL_RANGES[field];

  if (!range || Number.isNaN(value)) {
    return {
      status: "normal",
      label: t.statusNormal,
      ...STATUS_STYLES.normal,
    };
  }

  if (value < range.min) {
    return {
      status: "low",
      label: t.statusLow,
      ...STATUS_STYLES.low,
    };
  }

  if (value > range.max) {
    return {
      status: "high",
      label: t.statusHigh,
      ...STATUS_STYLES.high,
    };
  }

  return {
    status: "normal",
    label: t.statusNormal,
    ...STATUS_STYLES.normal,
  };
}

export function formatDate(isoString, lang) {
  if (!isoString) return "";

  return new Date(isoString).toLocaleDateString(
    lang === "sq" ? "sq-AL" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export function getRiskType(item) {
  const glucose = Number(item?.glucose);
  const prediction = Number(item?.ml_prediction);
  const confidence = Number(item?.ml_confidence);

  if (glucose > 0 && glucose < 70) return "hypo";
  if (prediction === 1) return "high";
  if (prediction === 0 && confidence >= 0.3) return "medium";

  return "normal";
}

export function getRecommendationConfig(item, t) {
  const type = getRiskType(item);

  const config = {
    normal: {
      text: t.recNormal,
      color: "#047857",
      bg: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(240,253,250,0.95))",
      border: "rgba(16, 185, 129, 0.18)",
    },

    hypo: {
      text: t.recHypo,
      color: "#b45309",
      bg: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(255,251,235,0.95))",
      border: "rgba(245, 158, 11, 0.24)",
    },

    medium: {
      text: t.recMedium,
      color: "#b45309",
      bg: "linear-gradient(135deg, rgba(217,119,6,0.12), rgba(255,251,235,0.95))",
      border: "rgba(217, 119, 6, 0.24)",
    },

    high: {
      text: t.recHigh,
      color: "#be123c",
      bg: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(255,241,242,0.95))",
      border: "rgba(239, 68, 68, 0.24)",
    },
  };

  return config[type];
}