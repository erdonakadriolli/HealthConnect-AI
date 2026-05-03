import { Link } from "react-router-dom";

export default function NavButton({
  to,
  icon,
  label,
  active = false,
  variant = "green",
  onClick,
  type = "link",
}) {
  const isRed = variant === "red";

  const mainColor = isRed ? "#be123c" : "#0f766e";
  const rgb = isRed ? "244, 63, 94" : "15, 118, 110";

  const baseStyle = {
    height: "42px",
    padding: "0 14px",
    borderRadius: "15px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    color: active ? mainColor : "rgba(15, 23, 42, 0.62)",
    background: active ? `rgba(${rgb}, 0.13)` : "rgba(15, 23, 42, 0.035)",
    border: active
      ? `1px solid rgba(${rgb}, 0.16)`
      : "1px solid rgba(15, 23, 42, 0.05)",
    boxShadow: active ? `0 10px 24px rgba(${rgb}, 0.10)` : "none",
  };

  if (type === "button") {
    return (
      <button style={baseStyle} onClick={onClick}>
        {icon}
        {label}
      </button>
    );
  }

  return (
    <Link to={to} style={baseStyle}>
      {icon}
      {label}
    </Link>
  );
}