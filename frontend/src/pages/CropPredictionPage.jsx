import { useState, useEffect } from "react";
import { Sprout, Zap, Award, Leaf, LocateFixed } from "lucide-react";
import { useLand } from "@/contexts/LandContext";
import { useWeather } from "@/hooks/useWeather";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CROP_ICONS = {
  rice: "🌾", wheat: "🌾", maize: "🌽", cotton: "🏵️", jute: "🌿",
  banana: "🍌", mango: "🥭", apple: "🍎", grapes: "🍇", orange: "🍊",
  coconut: "🥥", papaya: "🍈", watermelon: "🍉", potato: "🥔",
  tomato: "🍅", onion: "🧅", garlic: "🧄", coffee: "☕",
};
const defaultIcon = "🌱";

const fields = [
  { label: "Nitrogen (N)",      key: "nitrogen",    placeholder: "e.g. 90" },
  { label: "Phosphorus (P)",    key: "phosphorus",  placeholder: "e.g. 42" },
  { label: "Potassium (K)",     key: "potassium",   placeholder: "e.g. 43" },
  { label: "Temperature (°C)",  key: "temperature", placeholder: "e.g. 28" },
  { label: "Humidity (%)",      key: "humidity",    placeholder: "e.g. 72" },
  { label: "pH Level",          key: "ph",          placeholder: "e.g. 6.5" },
  { label: "Rainfall (mm)",     key: "rainfall",    placeholder: "e.g. 200" },
];

const RATING_COLORS = {
  Excellent:      "hsl(142,70%,45%)",
  Good:           "hsl(90,60%,45%)",
  Average:        "hsl(45,90%,50%)",
  "Below Average":"hsl(25,90%,55%)",
  Poor:           "hsl(0,70%,55%)",
};

export default function CropPredictionPage() {
  const { selectedLand } = useLand();

  const { weather, locationName, suggestedRainfall } = useWeather();

  const [form, setForm] = useState(
    Object.fromEntries(fields.map((f) => [f.key, selectedLand?.[f.key] ?? ""]))
  );
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Auto-fill weather fields once when data arrives.
  // temperature & humidity: current conditions (what model expects)
  // rainfall: regional annual average from IMD lookup (NOT today's QPF)
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

  const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/predictions/crop`, {
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
          temperature:parseFloat(form.temperature),
          humidity:   parseFloat(form.humidity),
          ph:         parseFloat(form.ph),
          rainfall:   parseFloat(form.rainfall),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Prediction failed");
      }
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const soilScore   = result?.soil_quality_score ?? 0;
  const soilRating  = soilScore >= 80 ? "Excellent"
    : soilScore >= 65 ? "Good"
    : soilScore >= 50 ? "Average"
    : soilScore >= 35 ? "Below Average"
    : "Poor";
  const ratingColor = RATING_COLORS[soilRating] ?? "hsl(142,70%,45%)";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sprout className="w-6 h-6 text-primary" />
          Crop Prediction
        </h2>
        <p className="text-muted-foreground mt-1">
          Enter your soil and weather parameters to get AI-powered crop recommendations.
        </p>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Input Parameters</h3>
          {locationName && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <LocateFixed className="w-3 h-3" /> {locationName} — weather auto-filled
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-sm text-muted-foreground mb-1.5 block">{f.label}</label>
              <input
                type="number"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="w-full input-glass"
              />
            </div>
          ))}
        </div>

        {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

        <button
          onClick={handlePredict}
          disabled={loading}
          className="mt-6 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold
                     btn-glow hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Predicting…
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Predict Crop
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-4 animate-slide-up">
          {/* Top crop cards */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground text-lg">Top Recommendations</h3>
              {!result.reliable && (
                <span className="ml-auto text-xs text-warning bg-warning/10 px-2 py-1 rounded-full">
                  Below 70% confidence — consider retesting soil
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(result.top_crops ?? []).map((crop, i) => (
                <div
                  key={crop.crop}
                  className={`relative p-6 rounded-2xl text-center transition-all duration-300 ${
                    i === 0
                      ? "bg-primary/10 border-2 border-primary/40 scale-[1.03]"
                      : "bg-secondary/50 border border-border/30"
                  }`}
                >
                  {i === 0 && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary text-primary-foreground">
                      Best Match
                    </span>
                  )}
                  <span className="text-4xl block mt-2">
                    {CROP_ICONS[crop.crop] ?? defaultIcon}
                  </span>
                  <p className="text-lg font-bold text-foreground mt-3 capitalize">{crop.crop}</p>
                  <p className="text-3xl font-mono font-bold gradient-text mt-2">{crop.confidence}%</p>
                  <p className="text-xs text-muted-foreground mt-1">confidence</p>
                </div>
              ))}
            </div>
          </div>

          {/* Soil quality score */}
          <div className="glass-card p-6 flex items-center gap-6">
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none"
                        stroke="hsl(150,12%,18%)" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none"
                        stroke={ratingColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(soilScore / 100) * 314} 314`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold gradient-text">{soilScore.toFixed(0)}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary" />
                <p className="font-semibold text-foreground">AI Soil Quality Score</p>
              </div>
              <p className="text-2xl font-bold mt-1" style={{ color: ratingColor }}>
                {soilRating}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Inferred from prediction confidence &amp; feature importance weightings
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}