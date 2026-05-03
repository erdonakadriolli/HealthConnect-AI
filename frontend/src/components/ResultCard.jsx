export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="result-card">
      <h3>Prediction Result</h3>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}