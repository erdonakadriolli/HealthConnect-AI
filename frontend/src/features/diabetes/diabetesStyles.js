export const diabetesTheme = {
  primary: "#0f766e",
  primaryDark: "#115e59",
  primarySoft: "rgba(15, 118, 110, 0.08)",

  blue: "#2563eb",
  blueDark: "#1d4ed8",
  blueSoft: "rgba(37, 99, 235, 0.08)",

  text: "#0f172a",
  muted: "#64748b",
  border: "rgba(15, 23, 42, 0.1)",

  surface: "#ffffff",
  surfaceSoft: "#f8fafc",
};

export const diabetesStyles = {
  infoBox: {
    marginBottom: "26px",
    padding: "22px",
    borderRadius: "22px",
    background:
      "linear-gradient(135deg, rgba(240, 253, 250, 0.95), rgba(239, 246, 255, 0.92))",
    border: "1px solid rgba(15, 118, 110, 0.14)",
    fontSize: "14px",
    color: "#134e4a",
    lineHeight: "1.75",
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.06)",
  },

  uploadBox: {
    marginBottom: "28px",
    padding: "22px",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(239,246,255,0.82))",
    border: "1px dashed rgba(37, 99, 235, 0.32)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    boxShadow: "0 18px 42px rgba(37, 99, 235, 0.08)",
  },

  uploadTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "15px",
    fontWeight: "800",
    color: "#1e3a8a",
  },

  uploadDescription: {
    fontSize: "13.5px",
    color: "#475569",
    lineHeight: "1.65",
  },

  uploadActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  uploadName: {
    fontSize: "13px",
    color: "#475569",
    background: "#f8fafc",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    padding: "8px 12px",
    borderRadius: "999px",
  },

  successText: {
    marginLeft: "8px",
    color: "#15803d",
  },

  resultSection: {
    marginTop: "38px",
    width: "100%",
  },
};