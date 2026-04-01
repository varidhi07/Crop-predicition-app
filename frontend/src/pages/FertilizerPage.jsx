import { FlaskConical, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useLand } from "@/contexts/LandContext";

function getNutrients(n, p, k) {
  const getStatus = (val, optimal) =>
    val >= optimal ? "good"  : val >= optimal * 0.6 ? "low"  : "critical" ;
  return [
    { name: "Nitrogen (N)", value: n, optimal: 60, status: getStatus(n, 60) },
    { name: "Phosphorus (P)", value: p, optimal: 50, status: getStatus(p, 50) },
    { name: "Potassium (K)", value: k, optimal: 40, status: getStatus(k, 40) },
  ];
}

const statusConfig = {
  good: { color: "stat-badge-success", icon: CheckCircle, label: "Sufficient" },
  low: { color: "stat-badge-warning", icon: AlertTriangle, label: "Low" },
  critical: { color: "stat-badge-danger", icon: XCircle, label: "Critical" },
};

const fertilizers = [
  { name: "Urea (46-0-0)", reason: "Boost Nitrogen levels", priority: "High" },
  { name: "MOP (0-0-60)", reason: "Critical Potassium deficiency", priority: "Urgent" },
  { name: "DAP (18-46-0)", reason: "Maintain Phosphorus balance", priority: "Low" },
];

export default function FertilizerPage() {
  const { selectedLand } = useLand();
  const nutrients = getNutrients(
    selectedLand?.nitrogen ?? 45,
    selectedLand?.phosphorus ?? 55,
    selectedLand?.potassium ?? 20
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-primary" />
          Fertilizer Recommendation
        </h2>
        <p className="text-muted-foreground mt-1">
          Soil nutrient analysis and personalized fertilizer suggestions.
        </p>
      </div>

      {/* Nutrient Levels */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-foreground mb-4">Nutrient Levels</h3>
        <div className="space-y-5">
          {nutrients.map((n) => {
            const config = statusConfig[n.status];
            const percentage = Math.min((n.value / n.optimal) * 100, 100);
            return (
              <div key={n.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{n.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground">
                      {n.value}/{n.optimal} mg/kg
                    </span>
                    <span className={config.color}>
                      <config.icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      n.status === "critical"
                        ? "bg-destructive"
                        : n.status === "low"
                        ? "bg-warning"
                        : "bg-primary"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fertilizer Suggestions */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-foreground mb-4">Suggested Fertilizers</h3>
        <div className="space-y-3">
          {fertilizers.map((f) => (
            <div
              key={f.name}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div>
                <p className="font-semibold text-foreground">{f.name}</p>
                <p className="text-sm text-muted-foreground">{f.reason}</p>
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  f.priority === "Urgent"
                    ? "bg-destructive/15 text-destructive"
                    : f.priority === "High"
                    ? "bg-warning/15 text-warning"
                    : "bg-primary/15 text-primary"
                }`}
              >
                {f.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}