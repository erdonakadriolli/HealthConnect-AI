import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, LockKeyhole, LogIn, Mail } from "lucide-react";

import { loginUser } from "../api/authApi";
import { saveTokens } from "../utils/token";

import Page from "../components/ui/Page";
import Card from "../components/ui/Card";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import ErrorBox from "../components/ui/ErrorBox";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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
      const data = await loginUser(form);
      saveTokens(data.access_token, data.refresh_token);
      navigate("/dashboard");
    } catch {
      setError("Login failed. Check your email and password.");
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
          <LogIn size={15} />
          Welcome back
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
          Login
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: "16px",
            lineHeight: "1.7",
            color: "rgba(15, 23, 42, 0.65)",
          }}
        >
          Sign in to continue to your HealthConnect AI dashboard.
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
            placeholder="Enter password"
          />

          <ErrorBox message={error} />

          <Button type="submit" variant="green" disabled={loading} fullWidth>
            {loading ? (
              <>
                <Loader2 size={18} />
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Login
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
          Don&apos;t have an account?{" "}
          <Link
            style={{
              color: "#0f766e",
              textDecoration: "none",
              fontWeight: "800",
            }}
            to="/register"
          >
            Register
          </Link>
        </p>
      </Card>
    </Page>
  );
}