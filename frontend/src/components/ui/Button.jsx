export default function Button({
  children,
  type = "button",
  disabled = false,
  variant = "green",
  fullWidth = false,
  onClick,
}) {
  const mainColor = variant === "red" ? "190, 18, 60" : "15, 118, 110";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        gridColumn: fullWidth ? "1 / -1" : "auto",
        width: fullWidth ? "100%" : "auto",
        height: "56px",
        border: "none",
        borderRadius: "18px",
        background: `rgba(${mainColor}, 0.90)`,
        color: "white",
        fontSize: "15px",
        fontWeight: "800",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.75 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        boxShadow: `0 16px 35px rgba(${mainColor}, 0.22)`,
        marginTop: "6px",
      }}
    >
      {children}
    </button>
  );
}