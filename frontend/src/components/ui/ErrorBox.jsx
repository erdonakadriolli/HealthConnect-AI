import { AlertCircle } from "lucide-react";

export default function ErrorBox({ message }) {
  if (!message) return null;

  return (
    <div
      style={{
        marginTop: "22px",
        padding: "14px 16px",
        borderRadius: "18px",
        background: "rgba(220, 38, 38, 0.10)",
        color: "#dc2626",
        border: "1px solid rgba(220, 38, 38, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontWeight: "700",
      }}
    >
      <AlertCircle size={19} />
      <span>{message}</span>
    </div>
  );
}