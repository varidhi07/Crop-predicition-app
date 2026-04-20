import { useState, useEffect } from "react";
import { BrainCircuit } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  PieChart, Pie, Cell,
} from "recharts";
import { useLand } from "@/contexts/LandContext";

const API       = import.meta.env.VITE_API_URL      || "http://localhost:5000";
const FLASK_API = import.meta.env.VITE_FLASK_API_URL || "http://localhost:5001";

const TOOLTIP_STYLE = {
  background:   "hsl(150, 15%, 10%)",
  border:       "1px solid hsl(150, 12%, 18%)",
  borderRadius: "12px",
  color:        "hsl(140, 20%, 90%)",
};

const PIE_COLORS = [
  "hsl(142,70%,45%)", "hsl(80,65%,50%)", "hsl(45,93%,47%)",
  "hsl(200,70%,55%)", "hsl(270,60%,60%)", "hsl(0,70%,55%)",
];

// Optimal reference values for radar normalisation
const RADAR_OPTIMAL = { N: 120, P: 80, K: 80, pH: 7, Temp: 30, Humidity: 80 };

export default function InsightsPage() {
  const { selectedLand }  = useLand();

  const [featureWeights,  setFeatureWeights]  = useState([]);
  const [modelStats,      setModelStats]      = useState(null);
  const [supportedCrops,  setSupportedCrops]  = useState([]);
  const [cropHistory,     setCropHistory]     = useState([]);
  const [loading,         setLoading]         = useState(true);

  // ── Fetch model info from Flask ────────────────────────────────────────────
  useEffect(() => {
    fetch(`${FLASK_API}/model-info`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        setFeatureWeights(d.featureWeights ?? []);
        setModelStats(d.modelStats ?? null);
        setSupportedCrops(d.supportedCrops ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch crop prediction history ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/predictions/crop`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        // Count by crop for pie chart
        const counts = {};
        data.forEach((p) => { counts[p.predictedCrop] = (counts[p.predictedCrop] ?? 0) + 1; });
        const pie = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, value], i) => ({ name, value, color: PIE_COLORS[i] }));
        setCropHistory(pie);
      })
      .catch(() => {});
  }, []);

  // ── Build soil radar from selected land ───────────────────────────────────
  const soilRadar = selectedLand ? [
    { metric: "N",        value: Math.min(Math.round((selectedLand.nitrogen   / RADAR_OPTIMAL.N)        * 100), 100) },
    { metric: "P",        value: Math.min(Math.round((selectedLand.phosphorus / RADAR_OPTIMAL.P)        * 100), 100) },
    { metric: "K",        value: Math.min(Math.round((selectedLand.potassium  / RADAR_OPTIMAL.K)        * 100), 100) },
    { metric: "pH",       value: Math.min(Math.round((selectedLand.ph         / RADAR_OPTIMAL.pH)       * 100), 100) },
    { metric: "Temp",     value: Math.min(Math.round((selectedLand.temperature/ RADAR_OPTIMAL.Temp)     * 100), 100) },
    { metric: "Humidity", value: Math.min(Math.round((selectedLand.humidity   / RADAR_OPTIMAL.Humidity) * 100), 100) },
  ] : [
    { metric: "N", value: 0 }, { metric: "P", value: 0 }, { metric: "K", value: 0 },
    { metric: "pH", value: 0 }, { metric: "Temp", value: 0 }, { metric: "Humidity", value: 0 },
  ];

  const stats = modelStats ? [
    { label: "Total Samples",      value: modelStats.totalSamples?.toLocaleString()    ?? "—" },
    { label: "Training Samples",   value: modelStats.trainingSamples?.toLocaleString() ?? "—" },
    { label: "Test Samples",       value: modelStats.testSamples?.toLocaleString()      ?? "—" },
    { label: "Test Accuracy",      value: modelStats.testAccuracy   ? `${modelStats.testAccuracy}%` : "—" },
    { label: "F1 Score",           value: modelStats.f1Score        ?? "—" },
    { label: "Crops Supported",    value: modelStats.cropsSupported ?? supportedCrops.length },
    { label: "Raw Features",       value: modelStats.rawFeatures    ?? "—" },
    { label: "Engineered Features",value: modelStats.engineeredFeatures ?? "—" },
    { label: "Total Features",     value: modelStats.featuresUsed   ?? featureWeights.length },
    { label: "Calibration Method", value: modelStats.calibrationMethod ?? "—" },
    { label: "CV Folds",           value: modelStats.calibrationCV  ?? "—" },
    { label: "Scaler",             value: modelStats.scaler         ?? "—" },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-primary" />
          Insights &amp; Visualization
        </h2>
        <p className="text-muted-foreground mt-1">
          AI model analytics, feature importance, and your farm's soil profile.
          {selectedLand && <span className="text-primary"> · {selectedLand.name}</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Feature Importance Weights
          </h3>
          {loading ? (
            <div className="h-64 animate-pulse bg-secondary/50 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={featureWeights} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,18%)" />
                <XAxis type="number" stroke="hsl(150,10%,55%)" fontSize={12} tickFormatter={(v) => v.toFixed(2)} />
                <YAxis dataKey="feature" type="category" stroke="hsl(150,10%,55%)" fontSize={11} width={100} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v.toFixed(4), "Weight"]} />
                <Bar dataKey="importance" fill="hsl(142,70%,45%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Soil Radar */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Soil Analytics — {selectedLand?.name ?? "No land selected"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={soilRadar}>
              <PolarGrid stroke="hsl(150,12%,18%)" />
              <PolarAngleAxis dataKey="metric" stroke="hsl(150,10%,55%)" fontSize={12} />
              <Radar dataKey="value" stroke="hsl(142,70%,45%)" fill="hsl(142,70%,45%)"
                     fillOpacity={0.2} strokeWidth={2} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, "of optimal"]} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Prediction History Pie */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Your Crop Prediction History</h3>
          {cropHistory.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
              No predictions yet — run a Crop Prediction to see data here.
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie data={cropHistory} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                       dataKey="value" paddingAngle={4}>
                    {cropHistory.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {cropHistory.map((m) => (
                  <div key={m.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: m.color }} />
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.value} prediction{m.value > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Model Summary Stats */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Model Summary</h3>
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-secondary/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Algorithm name badge */}
              {modelStats?.algorithm && (
                <div className="mb-4 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center gap-2">
                  <span className="text-base">🤖</span>
                  {modelStats.algorithm}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
              {/* Supported Crops */}
              {supportedCrops.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Supported Crops ({supportedCrops.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {supportedCrops.map((c) => (
                      <span key={c}
                        className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}