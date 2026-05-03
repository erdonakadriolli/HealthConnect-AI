import { Activity, Droplets, HeartPulse } from "lucide-react";

import Page from "../components/ui/Page";
import Card from "../components/ui/Card";
import ActionCard from "../components/ui/ActionCard";

export default function Dashboard() {
  return (
    <Page variant="green">
      <Card variant="green" wide>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderRadius: "999px",
            background: "rgba(15, 118, 110, 0.12)",
            color: "#0f766e",
            fontSize: "14px",
            fontWeight: "700",
            marginBottom: "18px",
          }}
        >
          <Activity size={16} />
          HealthConnect AI
        </div>

        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "42px",
            lineHeight: "1.1",
            color: "#0f172a",
            letterSpacing: "-1px",
          }}
        >
          Dashboard
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: "560px",
            fontSize: "17px",
            lineHeight: "1.7",
            color: "rgba(15, 23, 42, 0.68)",
          }}
        >
          Welcome to HealthConnect AI. Choose which prediction model you want to
          use.
        </p>

        <div
          style={{
            marginTop: "34px",
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "18px",
          }}
        >
          <ActionCard
            to="/diabetes"
            variant="green"
            icon={<Droplets size={26} />}
            title="Diabetes Prediction"
            description="Check diabetes risk"
          />

          <ActionCard
            to="/heart"
            variant="red"
            icon={<HeartPulse size={26} />}
            title="Heart Disease Prediction"
            description="Check heart disease risk"
          />
        </div>
      </Card>
    </Page>
  );
}