import { useState } from "react";
import { Sprout, Zap, Award } from "lucide-react";
import { useLand } from "@/contexts/LandContext";

const mockResults = [
  { name: "Rice", confidence: 94, icon: "🌾", best: true },
  { name: "Cotton", confidence: 87, icon: "🏵️", best: false },
  { name: "Jute", confidence: 82, icon: "🌿", best: false },
];

const fields = [
  { label: "Nitrogen (N)", key: "nitrogen", placeholder: "e.g. 90" },
  { label: "Phosphorus (P)", key: "phosphorus", placeholder: "e.g. 42" },
  { label: "Potassium (K)", key: "potassium", placeholder: "e.g. 43" },
  { label: "Temperature (°C)", key: "temperature", placeholder: "e.g. 28" },
  { label: "Humidity (%)", key: "humidity", placeholder: "e.g. 72" },
  { label: "pH Level", key: "ph", placeholder: "e.g. 6.5" },
  { label: "Rainfall (mm)", key: "rainfall", placeholder: "e.g. 200" },
];

export default function CropPredictionPage() {
  const { selectedLand } = useLand();
  const [predicted, setPredicted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePredict = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPredicted(true);
    }, 1500);
  };

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
        <h3 className="font-semibold text-foreground mb-4">Input Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-sm text-muted-foreground mb-1.5 block">{f.label}</label>
              <input
                type="number"
                placeholder={f.placeholder}
                defaultValue={selectedLand ? (selectedLand)[f.key] : ""}
                className="w-full input-glass"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handlePredict}
          disabled={loading}
          className="mt-6 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold btn-glow hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Predicting...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Predict Crop
            </>
          )}
        </button>
      </div>

      {predicted && (
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground text-lg">Top Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mockResults.map((crop, i) => (
              <div
                key={crop.name}
                className={`relative p-6 rounded-2xl text-center transition-all duration-300 ${
                  crop.best
                    ? "bg-primary/10 border-2 border-primary/40 scale-[1.03]"
                    : "bg-secondary/50 border border-border/30"
                }`}
              >
                {crop.best && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary text-primary-foreground">
                    Best Match
                  </span>
                )}
                <span className="text-4xl block mt-2">{crop.icon}</span>
                <p className="text-lg font-bold text-foreground mt-3">{crop.name}</p>
                <p className="text-3xl font-mono font-bold gradient-text mt-2">{crop.confidence}%</p>
                <p className="text-xs text-muted-foreground mt-1">confidence</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}