export default function Card({ children, variant = "green", wide = false }) {
  const color = variant === "red" ? "244, 63, 94" : "15, 118, 110";

  return (
    <section
      style={{
        width: "100%",
        maxWidth: wide ? "1040px" : "520px",
        padding: "38px",
        borderRadius: "30px",
        background: "rgba(255, 255, 255, 0.82)",
        backdropFilter: "blur(16px)",
        border: `1px solid rgba(${color}, 0.15)`,
        boxShadow: `0 24px 70px rgba(${color}, 0.13)`,
      }}
    >
      {children}
    </section>
  );
}