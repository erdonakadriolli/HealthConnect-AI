import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ActionCard({
  to,
  icon,
  title,
  description,
  variant = "green",
}) {
  const isRed = variant === "red";
  const mainColor = isRed ? "#be123c" : "#0f766e";
  const rgb = isRed ? "244, 63, 94" : "15, 118, 110";

  return (
    <Link
      to={to}
      style={{
        minHeight: "104px",
        padding: "20px",
        borderRadius: "24px",
        background: `rgba(${rgb}, ${isRed ? "0.12" : "0.14"})`,
        color: mainColor,
        textDecoration: "none",
        border: `1px solid rgba(${rgb}, ${isRed ? "0.16" : "0.18"})`,
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: `0 14px 35px rgba(${rgb}, ${isRed ? "0.08" : "0.10"})`,
      }}
    >
      <div
        style={{
          minWidth: "52px",
          height: "52px",
          borderRadius: "18px",
          background: "rgba(255, 255, 255, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.7)",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <strong>{title}</strong>

        <small
          style={{
            fontSize: "13px",
            fontWeight: "600",
            opacity: 0.7,
          }}
        >
          {description}
        </small>
      </div>

      <ArrowRight size={20} style={{ opacity: 0.65 }} />
    </Link>
  );
}