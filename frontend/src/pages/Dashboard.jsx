import { useEffect, useState } from "react";
import { Activity, AlertCircle, Droplets, Loader2 } from "lucide-react";

import { getPredictionHistory } from "../api/predictionApi";

import Page from "../components/ui/Page";
import Card from "../components/ui/Card";
import ActionCard from "../components/ui/ActionCard";
import LanguageSwitch from "../components/ui/LanguageSwitch";

import EmptyHistory from "../features/dashboard/EmptyHistory";
import HistoryCard from "../features/dashboard/HistoryCard";

import { DASHBOARD_TRANSLATIONS } from "../features/dashboard/dashboardTranslations";
import { dashboardStyles as styles } from "../features/dashboard/dashboardStyles";

export default function Dashboard() {
  const [lang, setLang] = useState("sq");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedIds, setExpandedIds] = useState({});

  const t = DASHBOARD_TRANSLATIONS[lang];

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        setError("");

        const data = await getPredictionHistory();
        setHistory(Array.isArray(data) ? data : []);
      } catch {
        setError(DASHBOARD_TRANSLATIONS[lang].failHistory);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [lang]);

  function toggleExpand(id) {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <Page variant="green">
      <Card variant="green" wide>
        <LanguageSwitch lang={lang} onChange={setLang} />

        <section style={styles.hero}>
          <div style={styles.heroGlow} />

          <div style={{ position: "relative" }}>
            <div style={styles.badge}>
              <Activity size={16} />
              {t.badgeText}
            </div>

            <h1 style={styles.title}>{t.title}</h1>

            <p style={styles.subtitle}>{t.subtitle}</p>

            <div style={styles.actionGrid}>
              <ActionCard
                to="/diabetes"
                variant="green"
                icon={<Droplets size={26} />}
                title={t.actionTitle}
                description={t.actionDesc}
              />
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>{t.historyTitle}</h2>
              <p style={styles.sectionDesc}>{t.historyDesc}</p>
            </div>
          </div>

          {loading && (
            <div style={styles.loadingBox}>
              <Loader2 size={36} className="animate-spin" />
              <span style={styles.loadingText}>{t.loadingHistory}</span>
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {!loading && !error && history.length === 0 && <EmptyHistory t={t} />}

          {!loading && !error && history.length > 0 && (
            <div style={styles.historyList}>
              {history.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  lang={lang}
                  t={t}
                  isExpanded={!!expandedIds[item.id]}
                  onToggle={() => toggleExpand(item.id)}
                />
              ))}
            </div>
          )}
        </section>
      </Card>
    </Page>
  );
}