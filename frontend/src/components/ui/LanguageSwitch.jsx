export default function LanguageSwitch({ lang, onChange }) {
  function getButtonStyle(value) {
    const active = lang === value;

    return {
      padding: "8px 16px",
      borderRadius: "999px",
      border: "none",
      fontSize: "12px",
      fontWeight: 800,
      cursor: "pointer",
      transition: "all 0.2s ease",
      letterSpacing: "0.3px",
      background: active
        ? "linear-gradient(135deg, #0f766e, #2563eb)"
        : "transparent",
      color: active ? "#ffffff" : "#475569",
      boxShadow: active ? "0 8px 18px rgba(15, 118, 110, 0.22)" : "none",
    };
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "18px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          gap: "4px",
          background: "#f1f5f9",
          padding: "5px",
          borderRadius: "999px",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
        }}
      >
        <button type="button" onClick={() => onChange("sq")} style={getButtonStyle("sq")}>
          SHQIP
        </button>

        <button type="button" onClick={() => onChange("en")} style={getButtonStyle("en")}>
          ENGLISH
        </button>
      </div>
    </div>
  );
}