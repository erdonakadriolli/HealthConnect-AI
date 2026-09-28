// ============================================================
// Login.jsx — Faqja e Hyrjes (Login Page)
// ============================================================
// Ky komponent React menaxhon të gjithë UI-n dhe logjikën e login-it.
//
// Çfarë bën:
//   1. Shfaq formën me email + fjalëkalim
//   2. Menaxhon gjendjen (state) e formës dhe gabimeve
//   3. Dërgon të dhënat tek API /api/auth/login
//   4. Ruan token-at në localStorage pas login-it
//   5. Ridrejton në /dashboard pas login-it të suksesshëm
//   6. Shfaq gabime nëse login dështon
//
// Struktura vizuale:
//   ┌─────────────────────┬─────────────────────┐
//   │  FORMA E LOGIN-IT   │   PANELI DJATHTAS   │
//   │  (e majtë, e bardhë)│  (e djathtë, gjelbr)│
//   │  • Email            │  • "New to Health?" │
//   │  • Fjalëkalim       │  • Butoni Register  │
//   │  • Butoni Login     │                     │
//   └─────────────────────┴─────────────────────┘
// ============================================================

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ClipboardPlus,   // Ikona për panelin djathtas (clipboard mjekësor)
  Loader2,         // Ikona e spinning-ut (gjatë ngarkimit)
  LockKeyhole,     // Ikona e bllokimit (për fushën e fjalëkalimit)
  LogIn,           // Ikona e login-it (për butonin Submit)
  Mail,            // Ikona e emailit (për fushën email)
  ShieldCheck,     // Ikona e sigurisë (për badge "Secure access")
} from "lucide-react";

import { loginUser } from "../api/authApi";    // Funksioni API që dërgon POST /api/auth/login
import { saveTokens } from "../utils/token";  // Ruan token-at në localStorage

// Importo komponentet UI të reutilizueshme
import Page from "../components/ui/Page";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import ErrorBox from "../components/ui/ErrorBox";

export default function Login() {
  // useNavigate → për ridrejtim programatik (pas login-it të suksesshëm)
  const navigate = useNavigate();

  // ============================================================
  // STATE (Gjendja e Komponentit)
  // ============================================================

  // "form" mban vlerat aktuale të inputeve (email dhe fjalëkalim)
  // Përditësohet me çdo tastë të shtypur nëpërmjet handleChange()
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // "error" mban mesazhin e gabimit (shfaqet nëse login dështon)
  const [error, setError] = useState("");

  // "loading" kontrollon gjendjen e ngarkimit (e çaktivizon butonin dhe shfaq spinner)
  const [loading, setLoading] = useState(false);

  // ============================================================
  // HANDLERE (Funksionet e Ngjarjeve)
  // ============================================================

  /**
   * handleChange — Përditëson gjendjen e formës kur ndryshon ndonjë input.
   * 
   * e.target.name  → emri i fushës ("email" ose "password")
   * e.target.value → vlera e re e shkruar
   * 
   * "...form" (spread) kopjon vlerat ekzistuese dhe ndryshon vetëm fushën e prekur.
   * Kjo parandalon fshirjen e vlerës tjetër (p.sh. nëse ndryshohet email, fjalëkalimi mbetet).
   */
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,  // Computed property — ndryshon fushën sipas emrit
    });
  }

  /**
   * handleSubmit — Dërgon formën dhe bën login.
   * 
   * Hapat:
   * 1. e.preventDefault() → parandalon rifreskimin e faqes (sjellja default e <form>)
   * 2. Pastron gabimet e vjetra
   * 3. Aktivizon loading (spinner + çaktivizo buton)
   * 4. Dërgon të dhënat tek API /api/auth/login
   * 5. Nëse sukses: ruan token-at → ridrejto në /dashboard
   * 6. Nëse dështon: shfaq mesazh gabimi
   * 7. Çaktivizo gjithmonë loading (finally)
   */
  async function handleSubmit(e) {
    e.preventDefault();      // Mos e rifresko faqen!
    setError("");            // Pastro gabimet e vjetra
    setLoading(true);        // Aktivizo spinner

    try {
      // Dërgon POST /api/auth/login me { email, password }
      const data = await loginUser(form);

      // Ruan access_token dhe refresh_token në localStorage
      saveTokens(data.access_token, data.refresh_token);

      // Ridrejto në faqen kryesore (Dashboard)
      navigate("/dashboard");
    } catch {
      // Nëse API kthen gabim (401 kredenciale të gabuara, ose gabim rrjeti)
      setError("Login failed. Check your email and password.");
    } finally {
      // Gjithmonë çaktivizo loading — pavarësisht nëse ka sukses ose gabim
      setLoading(false);
    }
  }

  // ============================================================
  // JSX — Interfacja Vizuale
  // ============================================================
  return (
    <Page variant="green">
      {/* Animacionet CSS — hyrja e formës nga e majta, panelit nga e djathta */}
      <style>
        {`
          /* Forma (e majta) hyn nga e majta me fade-in */
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

          /* Paneli (i djathtë) hyn nga e djathta me fade-in */
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

          /* Efekti i ngritjes nga poshtë për elementet brenda panelit */
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

          /* Efekti hover i butonit "Create account" */
          .auth-ghost-button:hover {
            background: #ffffff !important;
            color: #0f766e !important;
            transform: translateY(-2px);
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.16);
          }

          /* Karta mini e vogël brenda panelit */
          .auth-mini-card {
            margin-top: 28px;
            padding: 18px;
            border-radius: 22px;
            background: rgba(255, 255, 255, 0.72);
            border: 1px solid rgba(255, 255, 255, 0.72);
            color: rgba(255, 255, 255, 0.96);
            text-align: left;
          }

          /* Responsive: në ekrane të vogla (<820px), vendos kolonat vertikalisht */
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

      {/* Kontejneri kryesor — grid me 2 kolona (forma + panel) */}
      <div style={styles.shell} className="auth-shell-responsive">

        {/* KOLONA E MAJTË — Forma e Login-it */}
        <div style={styles.leftSide} className="auth-side-responsive">

          {/* Badge "Secure access" — tregon se faqja është e sigurt */}
          <div style={styles.badge}>
            <ShieldCheck size={15} />
            Secure access
          </div>

          {/* Titulli kryesor i faqes */}
          <h1 style={styles.title}>Welcome back</h1>

          {/* Teksti përshkrues */}
          <p style={styles.text}>
            Sign in to access your HealthConnect AI workspace and patient
            prediction tools.
          </p>

          {/* FORMA — onSubmit thirret handleSubmit() */}
          <form onSubmit={handleSubmit} style={styles.form}>

            {/* Fusha Email — me ikonë dhe label */}
            <InputField
              variant="green"
              type="email"
              icon={<Mail size={18} />}
              label="Email"
              name="email"           // Ky "name" i përgjigjet çelësit në objekt "form"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

            {/* Fusha Fjalëkalim — type="password" fsheh karakteret */}
            <InputField
              variant="green"
              type="password"
              icon={<LockKeyhole size={18} />}
              label="Password"
              name="password"        // Ky "name" i përgjigjet çelësit në objekt "form"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />

            {/* Kutia e gabimit — shfaqet vetëm nëse "error" ka vlerë */}
            <ErrorBox message={error} />

            {/* Butoni Submit — i çaktivizuar gjatë loading */}
            <Button type="submit" variant="green" disabled={loading} fullWidth>
              {loading ? (
                /* Gjatë loading: spinner + teksti "Signing in..." */
                <>
                  <Loader2 size={18} />
                  Signing in...
                </>
              ) : (
                /* Normal: ikona e login-it + "Sign in" */
                <>
                  <LogIn size={18} />
                  Sign in
                </>
              )}
            </Button>
          </form>
        </div>

        {/* KOLONA E DJATHTË — Paneli Promocional (Register) */}
        <div
          style={styles.rightSide}
          className="auth-side-responsive auth-panel-responsive"
        >
          <div style={styles.panelContent}>

            {/* Ikona dekorative e panelit */}
            <div style={styles.panelIcon}>
              <ClipboardPlus size={32} />
            </div>

            {/* Titulli i panelit */}
            <h2 style={styles.panelTitle}>New to HealthConnect?</h2>

            {/* Teksti përshkrues */}
            <p style={styles.panelText}>
              Create an account to start using intelligent health prediction
              tools in a clean, secure dashboard.
            </p>

            {/* Linku për faqen e Regjistrimit */}
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

// ============================================================
// STILET — Objekti i stileve inline (CSS-in-JS)
// ============================================================
// Preferohen stilet inline këtu për izolim të komponentit
// (pa ndikim nga stile globale) dhe animacione dinamike.
const styles = {
  // Kontejneri kryesor — 2 kolona me shadow dhe border-radius
  shell: {
    width: "min(1020px, 100%)",       // Max 1020px, responsive
    minHeight: "640px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",   // Dy kolona të barabarta
    overflow: "hidden",
    borderRadius: "32px",
    background: "#ffffff",
    boxShadow: "0 26px 70px rgba(15, 23, 42, 0.14)",
    border: "1px solid rgba(15, 23, 42, 0.08)",
  },

  // Kolona e majtë — fonde e bardhë me gradient të lehtë gjelbër
  leftSide: {
    padding: "58px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background:
      "linear-gradient(180deg, #ffffff 0%, rgba(240, 253, 250, 0.62) 100%)",
    animation: "loginFormIn 0.65s cubic-bezier(0.22, 1, 0.36, 1)",  // Animacion hyrje
  },

  // Kolona e djathtë — fond gjelbër (teal #0f766e)
  rightSide: {
    padding: "58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "white",
    background: "#0f766e",            // Ngjyra kryesore e temës (teal)
    animation: "loginPanelIn 0.7s cubic-bezier(0.22, 1, 0.36, 1)",  // Animacion hyrje
  },

  // Kontejneri i brendshëm i panelit djathtas
  panelContent: {
    maxWidth: "360px",
    animation: "softFadeUp 0.55s ease 0.12s both",  // Ngrihet nga poshtë me vonesë
  },

  // Kutia rrethore me ikonën e panelit
  panelIcon: {
    width: "78px",
    height: "78px",
    margin: "0 auto 24px",
    borderRadius: "24px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255, 255, 255, 0.14)",   // E tejdukshme mbi fond gjelbër
    border: "1px solid rgba(255, 255, 255, 0.24)",
  },

  // Titulli i panelit djathtas
  panelTitle: {
    margin: "0 0 14px",
    fontSize: "34px",
    lineHeight: "1.12",
    letterSpacing: "-1px",
  },

  // Teksti përshkrues i panelit
  panelText: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "1.75",
    opacity: 0.9,
  },

  // Butoni "Create account" — outline style mbi fond gjelbër
  ghostButton: {
    marginTop: "30px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "13px 30px",
    borderRadius: "999px",                           // Shumë i rrumbullakët
    border: "1.5px solid rgba(255,255,255,0.84)",    // Kufi i bardhë
    color: "white",
    textDecoration: "none",
    fontWeight: "800",
    transition: "0.25s ease",                        // Animacion i lëmuar hover
  },

  // Badge "Secure access" sipër formës
  badge: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    gap: "8px",
    padding: "7px 13px",
    borderRadius: "999px",
    background: "rgba(15, 118, 110, 0.1)",   // Gjelbër shumë i lehtë
    color: "#0f766e",
    fontSize: "13px",
    fontWeight: "800",
    marginBottom: "16px",
  },

  // Titulli "Welcome back"
  title: {
    margin: "0 0 12px",
    fontSize: "42px",
    lineHeight: "1.08",
    letterSpacing: "-1.2px",
    color: "#0f172a",   // Gri shumë i errët (pothuajse i zi)
  },

  // Teksti përshkrues nën titull
  text: {
    margin: 0,
    fontSize: "16px",
    lineHeight: "1.75",
    color: "rgba(15, 23, 42, 0.62)",  // Gri i mesëm
  },

  // Kontejneri i formës — flex colonë me gap
  form: {
    marginTop: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",    // Hapësirë midis fushave
  },

  // Stile të tjera (për elementin mini-card nëse shtohet)
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