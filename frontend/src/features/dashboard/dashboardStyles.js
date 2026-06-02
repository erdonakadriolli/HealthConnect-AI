export const dashboardStyles = {
  hero: {
    position: "relative",
    overflow: "hidden",
    padding: "30px",
    borderRadius: "30px",
    background:
      "linear-gradient(135deg, rgba(240,253,250,0.98), rgba(239,246,255,0.96))",
    border: "1px solid rgba(15, 118, 110, 0.14)",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
    marginBottom: "28px",
  },

  heroGlow: {
    position: "absolute",
    right: "-70px",
    top: "-80px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(37, 99, 235, 0.12)",
    filter: "blur(10px)",
  },

  actionGrid: {
    marginTop: "28px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "18px",
  },

  section: {
    marginTop: "42px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "18px",
    marginBottom: "24px",
  },

  sectionTitle: {
    fontSize: "26px",
    fontWeight: "900",
    color: "#0f172a",
    margin: "0 0 8px",
    letterSpacing: "-0.7px",
  },

  sectionDesc: {
    fontSize: "15px",
    color: "rgba(15, 23, 42, 0.56)",
    margin: 0,
    lineHeight: "1.6",
  },

  loadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "56px 0",
    color: "#0f766e",
  },

  loadingText: {
    fontSize: "15px",
    color: "rgba(15, 23, 42, 0.6)",
  },

  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  historyCard: {
    borderRadius: "26px",
    background: "rgba(255, 255, 255, 0.86)",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
    transition: "all 0.24s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "hidden",
  },

  historyHeader: {
    padding: "22px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    cursor: "pointer",
    userSelect: "none",
  },

  historyMain: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  fileIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, rgba(15,118,110,0.12), rgba(37,99,235,0.1))",
    color: "#0f766e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  dateText: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#0f172a",
  },

  probabilityText: {
    marginTop: "5px",
    fontSize: "13px",
    fontWeight: "700",
    color: "rgba(15, 23, 42, 0.48)",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  historyActions: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  expandedArea: {
    padding: "0 24px 24px",
    borderTop: "1px solid rgba(15, 23, 42, 0.05)",
    background:
      "linear-gradient(180deg, rgba(248,250,252,0.45), rgba(255,255,255,0.95))",
  },

  detailsTitle: {
    fontSize: "13px",
    fontWeight: "900",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    margin: "22px 0 16px",
  },

  valuesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "14px",
  },

  valueCard: {
    padding: "14px 16px",
    borderRadius: "18px",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    boxShadow: "0 8px 22px rgba(15, 23, 42, 0.04)",
  },

  valueTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    fontSize: "12px",
    fontWeight: "800",
    color: "rgba(15, 23, 42, 0.48)",
  },

  valueLabel: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  statusPill: {
    padding: "3px 7px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: "900",
  },

  valueNumber: {
    fontSize: "20px",
    fontWeight: "900",
    color: "#0f172a",
    display: "flex",
    alignItems: "baseline",
    gap: "4px",
  },

  unit: {
    fontSize: "11px",
    fontWeight: "700",
    color: "rgba(15, 23, 42, 0.38)",
  },

  rangeText: {
    fontSize: "11px",
    color: "rgba(15, 23, 42, 0.36)",
    fontWeight: "600",
  },

  riskBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "7px 13px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "900",
    border: "1px solid",
    whiteSpace: "nowrap",
  },

  recommendation: {
    marginTop: "18px",
    padding: "16px 18px",
    borderRadius: "18px",
    fontSize: "14px",
    lineHeight: "1.65",
    border: "1px solid",
  },

  emptyBox: {
    padding: "50px 30px",
    borderRadius: "28px",
    background:
      "linear-gradient(135deg, rgba(240,253,250,0.9), rgba(239,246,255,0.78))",
    border: "1px dashed rgba(15, 118, 110, 0.2)",
    textAlign: "center",
  },

  emptyIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "22px",
    background: "rgba(15, 118, 110, 0.1)",
    color: "#0f766e",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },

  emptyTitle: {
    margin: "0 0 8px",
    fontSize: "19px",
    fontWeight: "900",
    color: "#0f172a",
  },

  emptyDesc: {
    margin: 0,
    maxWidth: "520px",
    marginInline: "auto",
    fontSize: "14px",
    color: "rgba(15, 23, 42, 0.56)",
    lineHeight: "1.7",
  },
};