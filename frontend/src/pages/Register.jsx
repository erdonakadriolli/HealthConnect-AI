import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Activity,
  Loader2,
  LockKeyhole,
  Mail,
  UserPlus,
  UserRound,
} from "lucide-react";

import { registerUser } from "../api/authApi";

import Page from "../components/ui/Page";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import ErrorBox from "../components/ui/ErrorBox";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(form);
      navigate("/login");
    } catch {
      setError("Register failed. Check your data or try another email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page variant="green">
      <Card variant="green">
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "7px 13px",
            borderRadius: "999px",
            background: "rgba(15, 118, 110, 0.12)",
            color: "#0f766e",
            fontSize: "13px",
            fontWeight: "700",
            marginBottom: "14px",
          }}
        >
          <Activity size={15} />
          Create account
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
          Register
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: "16px",
            lineHeight: "1.7",
            color: "rgba(15, 23, 42, 0.65)",
          }}
        >
          Create your HealthConnect AI account and start using prediction tools.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "14px",
            }}
          >
            <InputField
              variant="green"
              type="text"
              icon={<UserRound size={18} />}
              label="First Name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="First name"
            />

            <InputField
              variant="green"
              type="text"
              icon={<UserRound size={18} />}
              label="Last Name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last name"
            />
          </div>

          <InputField
            variant="green"
            type="email"
            icon={<Mail size={18} />}
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
          />

          <InputField
            variant="green"
            type="password"
            icon={<LockKeyhole size={18} />}
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
          />

          <ErrorBox message={error} />

          <Button type="submit" variant="green" disabled={loading} fullWidth>
            {loading ? (
              <>
                <Loader2 size={18} />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Register
              </>
            )}
          </Button>
        </form>

        <p
          style={{
            margin: "22px 0 0",
            textAlign: "center",
            fontSize: "14px",
            color: "rgba(15, 23, 42, 0.62)",
            fontWeight: "600",
          }}
        >
          Already have an account?{" "}
          <Link
            style={{
              color: "#0f766e",
              textDecoration: "none",
              fontWeight: "800",
            }}
            to="/login"
          >
            Login
          </Link>
        </p>
      </Card>
    </Page>
  );
}