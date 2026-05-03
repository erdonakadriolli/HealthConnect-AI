export default function FormInput({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
    </div>
  );
}