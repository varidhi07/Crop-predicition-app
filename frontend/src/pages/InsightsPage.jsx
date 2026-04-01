import { BrainCircuit } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const featureImportance = [
  { feature: "Rainfall", importance: 0.28 },
  { feature: "Humidity", importance: 0.22 },
  { feature: "Temperature", importance: 0.18 },
  { feature: "Nitrogen", importance: 0.14 },
  { feature: "pH Level", importance: 0.1 },
  { feature: "Potassium", importance: 0.05 },
  { feature: "Phosphorus", importance: 0.03 },
];

const soilRadar = [
  { metric: "N", value: 78 },
  { metric: "P", value: 65 },
  { metric: "K", value: 45 },
  { metric: "pH", value: 85 },
  { metric: "Organic", value: 70 },
  { metric: "Moisture", value: 60 },
];

const modelComparison = [
  { name: "Random Forest", value: 94, color: "hsl(142, 70%, 45%)" },
  { name: "XGBoost", value: 91, color: "hsl(80, 65%, 50%)" },
  { name: "SVM", value: 85, color: "hsl(45, 93%, 47%)" },
  { name: "KNN", value: 78, color: "hsl(150, 10%, 55%)" },
];

const tooltipStyle = {
  background: "hsl(150, 15%, 10%)",
  border: "1px solid hsl(150, 12%, 18%)",
  borderRadius: "12px",
  color: "hsl(140, 20%, 90%)",
};

export default function InsightsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-primary" />
          Insights & Visualization
        </h2>
        <p className="text-muted-foreground mt-1">
          AI model analytics, feature importance, and soil data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Feature Importance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={featureImportance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 12%, 18%)" />
              <XAxis type="number" stroke="hsl(150, 10%, 55%)" fontSize={12} />
              <YAxis dataKey="feature" type="category" stroke="hsl(150, 10%, 55%)" fontSize={11} width={90} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="importance" fill="hsl(142, 70%, 45%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Soil Radar */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Soil Analytics</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={soilRadar}>
              <PolarGrid stroke="hsl(150, 12%, 18%)" />
              <PolarAngleAxis dataKey="metric" stroke="hsl(150, 10%, 55%)" fontSize={12} />
              <Radar
                dataKey="value"
                stroke="hsl(142, 70%, 45%)"
                fill="hsl(142, 70%, 45%)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Model Comparison */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Model Accuracy Comparison</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie
                  data={modelComparison}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {modelComparison.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {modelComparison.map((m) => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: m.color }} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.value}% accuracy</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Model Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Training Samples", value: "22,456" },
              { label: "Test Accuracy", value: "94.2%" },
              { label: "F1 Score", value: "0.937" },
              { label: "Crops Supported", value: "22" },
              { label: "Features Used", value: "7" },
              { label: "Cross-Val Score", value: "0.921" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-secondary/50">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}