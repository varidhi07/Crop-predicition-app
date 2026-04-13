import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Leaf, Droplets, Thermometer, LocateFixed } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLand } from "@/contexts/LandContext";
import { useWeather } from "@/hooks/useWeather";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SEASON_OPTIONS = ["kharif", "rabi", "zaid", "summer", "winter", "annual"];

const RATING_COLORS = {
  Excellent:     "hsl(142,70%,45%)",
  Good:          "hsl(90,60%,45%)",
  Average:       "hsl(45,90%,50%)",
  "Below Average":"hsl(25,90%,55%)",
  Poor:          "hsl(0,70%,55%)",
};

export default function YieldPredictionPage() {
  const { selectedLand } = useLand();

  const { weather, locationName, suggestedRainfall } = useWeather();

  const [form, setForm] = useState({
    nitrogen:    selectedLand?.nitrogen    ?? "",
    phosphorus:  selectedLand?.phosphorus  ?? "",
    potassium:   selectedLand?.potassium   ?? "",
    ph:          selectedLand?.ph          ?? "",
    temperature: selectedLand?.temperature ?? "",
    humidity:    selectedLand?.humidity    ?? "",
    rainfall:    selectedLand?.rainfall    ?? "",
    crop:        "",
    season:      "kharif",
    area:        "",
  });

  // Auto-fill weather fields once when data arrives.
  // rainfall uses regional annual average (IMD lookup) — NOT today's QPF.
  useEffect(() => {
    if (!weather) return;
    setForm((f) => {
      const shouldFill = (v) => v === "" || v === 0 || v == null;
      return {
        ...f,
        temperature: shouldFill(f.temperature) ? String(weather.temperature)       : f.temperature,
        humidity:    shouldFill(f.humidity)    ? String(weather.humidity)           : f.humidity,
        rainfall:    shouldFill(f.rainfall)    ? String(suggestedRainfall ?? "")   : f.rainfall,
      };
    });
  }, [weather, suggestedRainfall]);

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/predictions/yield`, {
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
          temperature:parseFloat(form.temperature),
          humidity:   parseFloat(form.humidity),
          rainfall:   parseFloat(form.rainfall),
          crop:       form.crop.trim().toLowerCase(),
          season:     form.season,
          area:       parseFloat(form.area),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Prediction failed");
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const soilScore = result?.soil_quality_score ?? 0;
  const ratingColor = RATING_COLORS[result?.soil_rating] ?? "hsl(142,70%,45%)";

  // Synthetic comparison bars (current + ±15% scenario)
  const comparisonData = result
    ? [
        { label: "Poor soil",    yield: +(result.yield_per_acre * 0.70).toFixed(2) },
        { label: "Your soil",    yield: +result.yield_per_acre.toFixed(2) },
        { label: "Ideal soil",   yield: +(result.yield_per_acre * 1.25).toFixed(2) },
      ]
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Crop Yield Prediction
        </h2>
        <p className="text-muted-foreground mt-1">
          Enter soil &amp; climate data to get AI-powered yield estimates with soil quality scoring.
        </p>
        {locationName && (
          <p className="flex items-center gap-1 text-xs text-primary mt-2">
            <LocateFixed className="w-3 h-3" /> {locationName} — temperature &amp; humidity auto-filled
          </p>
        )}
      </div>

      {/* Input form */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Soil &amp; Climate Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Nitrogen (N)",       name: "nitrogen",    ph: "e.g. 90" },
            { label: "Phosphorus (P)",      name: "phosphorus",  ph: "e.g. 42" },
            { label: "Potassium (K)",       name: "potassium",   ph: "e.g. 43" },
            { label: "pH",                  name: "ph",          ph: "e.g. 6.5" },
            { label: "Temperature (°C)",    name: "temperature", ph: "e.g. 28" },
            { label: "Humidity (%)",        name: "humidity",    ph: "e.g. 72" },
            { label: "Rainfall (mm)",       name: "rainfall",    ph: "e.g. 200" },
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

        <h3 className="font-semibold text-foreground pt-2">Crop &amp; Field Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Crop name</label>
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
            <label className="text-sm text-muted-foreground mb-1.5 block">Season</label>
            <select
              name="season"
              value={form.season}
              onChange={handleChange}
              className="w-full input-glass"
            >
              {SEASON_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Area (acres)</label>
            <input
              type="number"
              name="area"
              placeholder="e.g. 5"
              value={form.area}
              onChange={handleChange}
              className="w-full input-glass"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          onClick={handlePredict}
          disabled={loading}
          className="mt-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold
                     btn-glow hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <TrendingUp className="w-4 h-4" />
          )}
          {loading ? "Calculating…" : "Predict Yield"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">

          {/* ── Soil Quality Gauge ── */}
          <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground mb-3 font-medium flex items-center gap-1">
              <Leaf className="w-4 h-4 text-primary" /> AI Soil Quality Score
            </p>
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none"
                        stroke="hsl(150,12%,18%)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none"
                        stroke={ratingColor}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(soilScore / 100) * 314} 314`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold gradient-text">{soilScore.toFixed(0)}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>
            <p className="text-sm font-semibold mt-3" style={{ color: ratingColor }}>
              {result.soil_rating}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Inferred from crop prediction confidence &amp; feature importance
            </p>
          </div>

          {/* ── Yield Result + Chart ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Yield summary cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5 flex flex-col items-center justify-center text-center">
                <Droplets className="w-5 h-5 text-primary mb-2" />
                <p className="text-3xl font-bold gradient-text">
                  {result.predicted_yield_tonnes}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total yield (tonnes)
                </p>
                <p className="text-xs text-muted-foreground">
                  for {form.area} acre(s)
                </p>
              </div>
              <div className="glass-card p-5 flex flex-col items-center justify-center text-center">
                <Thermometer className="w-5 h-5 text-primary mb-2" />
                <p className="text-3xl font-bold gradient-text">
                  {result.yield_per_acre}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Yield per acre (tonnes)
                </p>
              </div>
            </div>

            {/* Comparison chart */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Yield Scenario Comparison
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,18%)" />
                  <XAxis dataKey="label" stroke="hsl(150,10%,55%)" fontSize={11} />
                  <YAxis stroke="hsl(150,10%,55%)" fontSize={11} unit="t" />
                  <Tooltip
                    formatter={(v) => [`${v} t/acre`, "Yield"]}
                    contentStyle={{
                      background: "hsl(150,15%,10%)",
                      border: "1px solid hsl(150,12%,18%)",
                      borderRadius: "12px",
                      color: "hsl(140,20%,90%)",
                    }}
                  />
                  <Bar
                    dataKey="yield"
                    fill="hsl(142,70%,45%)"
                    radius={[6,6,0,0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}