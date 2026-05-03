import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  Droplets,
  HeartPulse,
  Home,
  LogIn,
  LogOut,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { getAccessToken, removeTokens } from "../utils/token";
import NavButton from "./ui/NavButton";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = Boolean(getAccessToken());

  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 40) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      setLastScrollY(currentScrollY);
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);
  useEffect(() => {
    function checkModalOpen() {
      setModalOpen(document.body.classList.contains("modal-open"));
    }

    checkModalOpen();

    const observer = new MutationObserver(checkModalOpen);

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  function handleLogout() {
    removeTokens();
    navigate("/login");
  }

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <header
      style={{
        ...styles.header,
        transform: hidden || modalOpen ? "translateY(-120%)" : "translateY(0)",
      }}
    >
      <nav style={styles.navbar}>
        <Link to="/dashboard" style={styles.brand}>
          <div style={styles.logoBox}>
            <Activity size={24} />
          </div>

          <div>
            <div style={styles.brandText}>
              HealthConnect <span style={styles.aiText}>AI</span>
            </div>

            <div style={styles.brandSubtext}>
              <Sparkles size={12} />
              Smart health predictions
            </div>
          </div>
        </Link>

        <div style={styles.navLinks}>
          <NavButton
            to="/dashboard"
            icon={<Home size={17} />}
            label="Dashboard"
            active={isActive("/dashboard")}
            variant="green"
          />

          <NavButton
            to="/diabetes"
            icon={<Droplets size={17} />}
            label="Diabetes"
            active={isActive("/diabetes")}
            variant="green"
          />

          <NavButton
            to="/heart"
            icon={<HeartPulse size={17} />}
            label="Heart"
            active={isActive("/heart")}
            variant="red"
          />

          <div style={styles.divider} />

          {isLoggedIn ? (
            <NavButton
              type="button"
              icon={<LogOut size={17} />}
              label="Logout"
              variant="red"
              active
              onClick={handleLogout}
            />
          ) : (
            <>
              <NavButton
                to="/login"
                icon={<LogIn size={17} />}
                label="Login"
                active={isActive("/login")}
                variant="green"
              />

              <NavButton
                to="/register"
                icon={<UserPlus size={17} />}
                label="Register"
                active={isActive("/register")}
                variant="red"
              />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

const styles = {
  header: {
    width: "100%",
    padding: "8px 18px",
    background:
      "linear-gradient(135deg, rgba(15, 118, 110, 0.10), rgba(244, 63, 94, 0.08))",
    borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(18px)",
    transition: "transform 0.28s ease",
  },

  navbar: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "8px 14px",
    borderRadius: "22px",
    background: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(255, 255, 255, 0.75)",
    boxShadow: "0 14px 38px rgba(15, 23, 42, 0.07)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textDecoration: "none",
  },

  logoBox: {
    width: "52px",
    height: "52px",
    borderRadius: "18px",
    color: "#0f766e",
    background:
      "linear-gradient(135deg, rgba(15, 118, 110, 0.16), rgba(244, 63, 94, 0.12))",
    border: "1px solid rgba(15, 118, 110, 0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 30px rgba(15, 118, 110, 0.12)",
  },

  brandText: {
    fontSize: "22px",
    fontWeight: "900",
    letterSpacing: "-0.7px",
    color: "#0f172a",
    lineHeight: "1.1",
  },

  aiText: {
    color: "#be123c",
  },

  brandSubtext: {
    marginTop: "5px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    fontWeight: "700",
    color: "rgba(15, 23, 42, 0.48)",
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  divider: {
    width: "1px",
    height: "28px",
    background: "rgba(15, 23, 42, 0.10)",
    margin: "0 2px",
  },
};