export default function PageHeader({
  icon,
  badgeIcon,
  badgeText,
  title,
  subtitle,
  variant = "green",
}) {
  const mainColor = variant === "red" ? "#be123c" : "#0f766e";
  const rgb = variant === "red" ? "244, 63, 94" : "15, 118, 110";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "20px",
        marginBottom: "34px",
      }}
    >
      <div
        style={{
          minWidth: "64px",
          height: "64px",
          borderRadius: "22px",
          background: `rgba(${rgb}, 0.14)`,
          color: mainColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid rgba(${rgb}, 0.18)`,
          boxShadow: `0 12px 30px rgba(${rgb}, 0.10)`,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "7px 13px",
            borderRadius: "999px",
            background: `rgba(${rgb}, 0.12)`,
            color: mainColor,
            fontSize: "13px",
            fontWeight: "700",
            marginBottom: "12px",
          }}
        >
          {badgeIcon}
          {badgeText}
        </div>

        <h1
          style={{
            margin: "0 0 10px",
            fontSize: "40px",
            lineHeight: "1.1",
            letterSpacing: "-1px",
            color: "#0f172a",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: "680px",
            fontSize: "16px",
            lineHeight: "1.7",
            color: "rgba(15, 23, 42, 0.65)",
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}