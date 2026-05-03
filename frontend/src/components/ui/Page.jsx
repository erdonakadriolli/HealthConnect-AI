export default function Page({ children, variant = "green" }) {
  const background =
    variant === "red"
      ? "linear-gradient(135deg, rgba(244, 63, 94, 0.10), rgba(59, 130, 246, 0.08))"
      : "linear-gradient(135deg, rgba(15, 118, 110, 0.10), rgba(59, 130, 246, 0.08))";

  return (
    <main
      style={{
        minHeight: "calc(100vh - 98px)",
        padding: "50px 20px",
        display: "flex",
        justifyContent: "center",
        background,
      }}
    >
      {children}
    </main>
  );
}