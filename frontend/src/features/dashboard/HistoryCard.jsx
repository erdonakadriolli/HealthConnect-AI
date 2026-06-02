import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  TrendingUp,
} from "lucide-react";

import {
  FIELD_DB_KEYS,
  FIELD_ICONS,
  FIELD_KEYS,
  NORMAL_RANGES,
} from "./dashboardConfig";

import {
  formatDate,
  getFieldStatus,
  getRecommendationConfig,
  getRiskType,
} from "./dashboardHelpers";

import { dashboardStyles as styles } from "./dashboardStyles";

function RiskBadge({ item, t }) {
  const type = getRiskType(item);

  const config = {
    normal: {
      icon: CheckCircle,
      label: t.normalBadge,
      bg: "rgba(16, 185, 129, 0.12)",
      color: "#059669",
      border: "rgba(16, 185, 129, 0.22)",
    },
    hypo: {
      icon: AlertCircle,
      label: t.lowSugarBadge,
      bg: "rgba(245, 158, 11, 0.13)",
      color: "#d97706",
      border: "rgba(245, 158, 11, 0.25)",
    },
    medium: {
      icon: AlertCircle,
      label: t.mediumRiskBadge,
      bg: "rgba(217, 119, 6, 0.13)",
      color: "#d97706",
      border: "rgba(217, 119, 6, 0.25)",
    },
    high: {
      icon: AlertCircle,
      label: t.highRiskBadge,
      bg: "rgba(239, 68, 68, 0.13)",
      color: "#dc2626",
      border: "rgba(239, 68, 68, 0.25)",
    },
  };

  const selected = config[type] || config.normal;
  const Icon = selected.icon;

  return (
    <span
      style={{
        ...styles.riskBadge,
        background: selected.bg,
        color: selected.color,
        borderColor: selected.border,
      }}
    >
      <Icon size={14} />
      {selected.label}
    </span>
  );
}

function RecommendationBox({ item, t }) {
  const config = getRecommendationConfig(item, t);

  return (
    <div
      style={{
        ...styles.recommendation,
        background: config.bg,
        borderColor: config.border,
        color: config.color,
      }}
    >
      <strong>{t.recommendationTitle}:</strong> {config.text}
    </div>
  );
}

export default function HistoryCard({ item, lang, t, isExpanded, onToggle }) {
  return (
    <div style={styles.historyCard}>
      <div onClick={onToggle} style={styles.historyHeader}>
        <div style={styles.historyMain}>
          <div style={styles.fileIcon}>
            <FileText size={21} />
          </div>

          <div>
            <div style={styles.dateText}>{formatDate(item.created_at, lang)}</div>

            <div style={styles.probabilityText}>
              <TrendingUp size={13} />
              {t.probability}: {(Number(item.ml_confidence || 0) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div style={styles.historyActions}>
          <RiskBadge item={item} t={t} />

          <div style={{ color: "rgba(15, 23, 42, 0.36)" }}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div style={styles.expandedArea}>
          <h4 style={styles.detailsTitle}>{t.detailsLabel}</h4>

          <div style={styles.valuesGrid}>
            {FIELD_KEYS.map((fieldKey) => {
              const dbKey = FIELD_DB_KEYS[fieldKey];
              const value = item[dbKey];
              const numericValue = Number(value);
              const range = NORMAL_RANGES[fieldKey];
              const status = getFieldStatus(fieldKey, numericValue, t);
              const Icon = FIELD_ICONS[fieldKey];

              return (
                <div
                  key={fieldKey}
                  style={{
                    ...styles.valueCard,
                    border: `1px solid ${
                      status.status !== "normal"
                        ? status.border
                        : "rgba(15, 23, 42, 0.06)"
                    }`,
                  }}
                >
                  <div style={styles.valueTop}>
                    <div style={styles.valueLabel}>
                      <span
                        style={{
                          color: "#0f766e",
                          display: "inline-flex",
                        }}
                      >
                        <Icon size={16} />
                      </span>

                      {t.fields[fieldKey]}
                    </div>

                    <span
                      style={{
                        ...styles.statusPill,
                        background: status.bg,
                        color: status.color,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div style={styles.valueNumber}>
                    {value !== null && value !== undefined ? value : "N/A"}

                    <small style={styles.unit}>{range?.unit}</small>
                  </div>

                  <div style={styles.rangeText}>
                    {t.normalRange}: {range?.min}
                    {range?.unit ? ` ${range.unit}` : ""} - {range?.max}
                    {range?.unit ? ` ${range.unit}` : ""}
                  </div>
                </div>
              );
            })}
          </div>

          <RecommendationBox item={item} t={t} />
        </div>
      )}
    </div>
  );
}