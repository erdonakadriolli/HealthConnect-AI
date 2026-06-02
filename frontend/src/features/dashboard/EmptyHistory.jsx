import { Clock } from "lucide-react";
import { dashboardStyles as styles } from "./dashboardStyles";

export default function EmptyHistory({ t }) {
  return (
    <div style={styles.emptyBox}>
      <div style={styles.emptyIcon}>
        <Clock size={30} />
      </div>

      <h3 style={styles.emptyTitle}>{t.noHistoryTitle}</h3>
      <p style={styles.emptyDesc}>{t.noHistoryDesc}</p>
    </div>
  );
}