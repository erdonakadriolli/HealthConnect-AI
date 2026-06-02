import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ClipboardPlus,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { loginUser } from "../api/authApi";
import { saveTokens } from "../utils/token";

import Page from "../components/ui/Page";
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
      <style>
        {`
          @keyframes loginFormIn {
            from {
              opacity: 0;
              transform: translateX(-28px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes loginPanelIn {
            from {
              opacity: 0;
              transform: translateX(70px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes softFadeUp {
            from {
              opacity: 0;
              transform: translateY(14px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .auth-ghost-button:hover {
            background: #ffffff !important;
            color: #0f766e !important;
            transform: translateY(-2px);
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.16);
          }

          .auth-mini-card {
            margin-top: 28px;
            padding: 18px;
            border-radius: 22px;
            background: rgba(255, 255, 255, 0.72);
            border: 1px solid rgba(255, 255, 255, 0.72);
            color: rgba(255, 255, 255, 0.96);
            text-align: left;
          }

          @media (max-width: 820px) {
            .auth-shell-responsive {
              grid-template-columns: 1fr !important;
              min-height: auto !important;
            }

            .auth-side-responsive {
              padding: 34px 24px !important;
            }

            .auth-panel-responsive {
              min-height: 300px !important;
            }
          }
        `}
      </style>

      <div style={styles.shell} className="auth-shell-responsive">
        <div style={styles.leftSide} className="auth-side-responsive">
          <div style={styles.badge}>
            <ShieldCheck size={15} />
            Secure access
          </div>

          <h1 style={styles.title}>Welcome back</h1>

          <p style={styles.text}>
            Sign in to access your HealthConnect AI workspace and patient
            prediction tools.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <InputField
              variant="green"
              type="email"
              icon={<Mail size={18} />}
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

            <InputField
              variant="green"
              type="password"
              icon={<LockKeyhole size={18} />}
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />

            <ErrorBox message={error} />

            <Button type="submit" variant="green" disabled={loading} fullWidth>
              {loading ? (
                <>
                  <Loader2 size={18} />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign in
                </>
              )}
            </Button>
          </form>
        </div>

        <div
          style={styles.rightSide}
          className="auth-side-responsive auth-panel-responsive"
        >
          <div style={styles.panelContent}>
            <div style={styles.panelIcon}>
              <ClipboardPlus size={32} />
            </div>

            <h2 style={styles.panelTitle}>New to HealthConnect?</h2>

            <p style={styles.panelText}>
              Create an account to start using intelligent health prediction
              tools in a clean, secure dashboard.
            </p>

            <Link
              to="/register"
              style={styles.ghostButton}
              className="auth-ghost-button"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </Page>
  );
}

const styles = {
  shell: {
    width: "min(1020px, 100%)",
    minHeight: "640px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    overflow: "hidden",
    borderRadius: "32px",
    background: "#ffffff",
    boxShadow: "0 26px 70px rgba(15, 23, 42, 0.14)",
    border: "1px solid rgba(15, 23, 42, 0.08)",
  },

  leftSide: {
    padding: "58px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background:
      "linear-gradient(180deg, #ffffff 0%, rgba(240, 253, 250, 0.62) 100%)",
    animation: "loginFormIn 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
  },

  rightSide: {
    padding: "58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "white",
    background: "#0f766e",
    animation: "loginPanelIn 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
  },

  panelContent: {
    maxWidth: "360px",
    animation: "softFadeUp 0.55s ease 0.12s both",
  },

  panelIcon: {
    width: "78px",
    height: "78px",
    margin: "0 auto 24px",
    borderRadius: "24px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255, 255, 255, 0.14)",
    border: "1px solid rgba(255, 255, 255, 0.24)",
  },

  panelTitle: {
    margin: "0 0 14px",
    fontSize: "34px",
    lineHeight: "1.12",
    letterSpacing: "-1px",
  },

  panelText: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "1.75",
    opacity: 0.9,
  },

  ghostButton: {
    marginTop: "30px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "13px 30px",
    borderRadius: "999px",
    border: "1.5px solid rgba(255,255,255,0.84)",
    color: "white",
    textDecoration: "none",
    fontWeight: "800",
    transition: "0.25s ease",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    gap: "8px",
    padding: "7px 13px",
    borderRadius: "999px",
    background: "rgba(15, 118, 110, 0.1)",
    color: "#0f766e",
    fontSize: "13px",
    fontWeight: "800",
    marginBottom: "16px",
  },

  title: {
    margin: "0 0 12px",
    fontSize: "42px",
    lineHeight: "1.08",
    letterSpacing: "-1.2px",
    color: "#0f172a",
  },

  text: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "1.75",
    color: "rgba(15, 23, 42, 0.62)",
  },

  form: {
    marginTop: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  miniCardTitle: {
    margin: "0 0 6px",
    fontSize: "14px",
    fontWeight: "800",
    color: "#ffffff",
  },

  miniCardText: {
    margin: 0,
    fontSize: "13px",
    lineHeight: "1.6",
    color: "rgba(255, 255, 255, 0.86)",
  },
};