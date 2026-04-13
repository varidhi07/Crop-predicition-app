import { useState, useEffect } from "react";
import { FlaskConical, AlertTriangle, CheckCircle, XCircle, Zap, LocateFixed } from "lucide-react";
import { useLand } from "@/contexts/LandContext";
import { useWeather } from "@/hooks/useWeather";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SOIL_TYPES = [
  "Sandy", "Sandy Loam", "Loam", "Silt Loam",
  "Clay Loam", "Clay", "Peat", "Chalky", "Other",
];

const PRIORITY_STYLES = {
  Urgent: "bg-destructive/15 text-destructive",
  High:   "bg-warning/15 text-warning",
  Low:    "bg-primary/15 text-primary",
  Info:   "bg-secondary text-muted-foreground",
};

const STATUS_CONFIG = {
  Critical: { color: "stat-badge-danger",   icon: XCircle,       label: "Critical" },
  Low:      { color: "stat-badge-warning",  icon: AlertTriangle, label: "Low"      },
  Normal:   { color: "stat-badge-success",  icon: CheckCircle,   label: "Optimal"  },
  High:     { color: "stat-badge-success",  icon: CheckCircle,   label: "High"     },
};

// Optimal values used only for the progress bar width calculation
const DISPLAY_OPTIMA = { N: 80, P: 50, K: 50 };

export default function FertilizerPage() {
  const { selectedLand } = useLand();

  const { weather, locationName } = useWeather();

  const [form, setForm] = useState({
    nitrogen:   selectedLand?.nitrogen   ?? "",
    phosphorus: selectedLand?.phosphorus ?? "",
    potassium:  selectedLand?.potassium  ?? "",
    ph:         selectedLand?.ph         ?? "",
    crop:       "",
    soilType:   selectedLand?.soilType   ?? "Loam",
  });

  // Auto-fill pH if blank & land data missing (from weather context we can't fill pH)
  useEffect(() => {
    if (!weather) return;
    // temperature/humidity not used by fertilizer endpoint but keep form consistent
    // No weather data maps to pH or NPK — those must come from the user / land
  }, [weather]);

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/fertilizer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          landId:     selectedLand?.id ?? null,
          nitrogen:   parseFloat(form.nitrogen),
          phosphorus: parseFloat(form.phosphorus),
          potassium:  parseFloat(form.potassium),
          ph:         parseFloat(form.ph),
          crop:       form.crop.trim(),
          soilType:   form.soilType,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Build nutrient bars from result or current form values
  const nutrients = result
    ? [
        { name: "Nitrogen (N)",    value: result.nitrogen,   status: result.nitrogenStatus,   optimal: DISPLAY_OPTIMA.N },
        { name: "Phosphorus (P)",  value: result.phosphorus, status: result.phosphorusStatus, optimal: DISPLAY_OPTIMA.P },
        { name: "Potassium (K)",   value: result.potassium,  status: result.potassiumStatus,  optimal: DISPLAY_OPTIMA.K },
      ]
    : [
        { name: "Nitrogen (N)",   value: parseFloat(form.nitrogen)   || 0, status: null, optimal: DISPLAY_OPTIMA.N },
        { name: "Phosphorus (P)", value: parseFloat(form.phosphorus) || 0, status: null, optimal: DISPLAY_OPTIMA.P },
        { name: "Potassium (K)",  value: parseFloat(form.potassium)  || 0, status: null, optimal: DISPLAY_OPTIMA.K },
      ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-primary" />
          Fertilizer Recommendation
        </h2>
        <p className="text-muted-foreground mt-1">
          AI-powered soil nutrient analysis and fertilizer suggestions.
        </p>
        {locationName && (
          <p className="flex items-center gap-1 text-xs text-primary mt-2">
            <LocateFixed className="w-3 h-3" /> Location detected: {locationName}
          </p>
        )}
      </div>

      {/* Input form */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Soil Parameters</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Nitrogen (N)", name: "nitrogen",   ph: "e.g. 90" },
            { label: "Phosphorus (P)", name: "phosphorus", ph: "e.g. 42" },
            { label: "Potassium (K)", name: "potassium",  ph: "e.g. 43" },
            { label: "pH",           name: "ph",          ph: "e.g. 6.5" },
          ].map((f) => (
            <div key={f.name}>
              <label className="text-sm text-muted-foreground mb-1.5 block">{f.label}</label>
              <input
                type="number"
                name={f.name}
                placeholder={f.ph}
                value={form[f.name]}
                onChange={handleChange}
                className="w-full input-glass"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Crop</label>
            <input
              type="text"
              name="crop"
              placeholder="e.g. rice"
              value={form.crop}
              onChange={handleChange}
              className="w-full input-glass"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Soil Type</label>
            <select
              name="soilType"
              value={form.soilType}
              onChange={handleChange}
              className="w-full input-glass"
            >
              {SOIL_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold
                     btn-glow hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {loading ? "Analysing…" : "Get Recommendation"}
        </button>
      </div>

      {/* Nutrient Levels */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-foreground mb-4">Nutrient Levels</h3>
        <div className="space-y-5">
          {nutrients.map((n) => {
            const cfg = n.status ? STATUS_CONFIG[n.status] ?? STATUS_CONFIG["Normal"] : null;
            const pct = Math.min((n.value / n.optimal) * 100, 110);
            const barColor =
              n.status === "Critical" ? "bg-destructive"
              : n.status === "Low"    ? "bg-warning"
              : "bg-primary";
            return (
              <div key={n.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{n.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground">
                      {n.value.toFixed(0)} mg/kg
                    </span>
                    {cfg && (
                      <span className={cfg.color}>
                        <cfg.icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {result?.recommendations && (
        <div className="glass-card p-6 animate-slide-up space-y-4">
          <h3 className="font-semibold text-foreground">Suggested Fertilizers</h3>
          <div className="space-y-3">
            {result.recommendations.map((f) => (
              <div
                key={f.name}
                className="flex items-start justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{f.name}</p>
                    {f.npk_ratio && (
                      <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                        {f.npk_ratio}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-snug">{f.reason}</p>
                  {f.quantity_kg_per_acre > 0 && (
                    <p className="text-xs text-primary mt-1 font-medium">
                      ≈ {f.quantity_kg_per_acre} kg / acre
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shrink-0 ${
                    PRIORITY_STYLES[f.priority] ?? PRIORITY_STYLES["Low"]
                  }`}
                >
                  {f.priority}
                </span>
              </div>
            ))}
          </div>

          {/* Advice block */}
          {result.advice && (
            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wide">
                Agronomic Advice
              </p>
              {result.advice.split("\n").map((line, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}