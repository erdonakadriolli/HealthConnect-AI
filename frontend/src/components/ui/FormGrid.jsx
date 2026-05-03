export default function FormGrid({ children, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "18px",
      }}
    >
      {children}
    </form>
  );
}