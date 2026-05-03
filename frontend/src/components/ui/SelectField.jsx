import { useState } from "react";

export default function SelectField({
  icon,
  label,
  name,
  value,
  onChange,
  options,
  variant = "green",
}) {
  const [focused, setFocused] = useState(false);

  const mainColor = variant === "red" ? "#be123c" : "#0f766e";
  const rgb = variant === "red" ? "244, 63, 94" : "15, 118, 110";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <label
        style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "rgba(15, 23, 42, 0.78)",
        }}
      >
        {label}
      </label>

      <div
        style={{
          height: "52px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 14px",
          borderRadius: "16px",
          background: focused
            ? "rgba(255, 255, 255, 0.90)"
            : `rgba(${rgb}, 0.055)`,
          border: focused
            ? `1px solid rgba(${rgb}, 0.34)`
            : `1px solid rgba(${rgb}, 0.13)`,
          boxShadow: focused ? `0 0 0 4px rgba(${rgb}, 0.09)` : "none",
          transition: "0.2s ease",
        }}
      >
        <span
          style={{
            color: mainColor,
            display: "flex",
            alignItems: "center",
            opacity: 0.85,
          }}
        >
          {icon}
        </span>

        <select
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "#0f172a",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
          name={name}
          value={value}
          onChange={onChange}
          required
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <option value="">Select</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}