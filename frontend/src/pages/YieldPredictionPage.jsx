import { useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const comparisonData = [
  { crop: "Rice", predicted: 4.2, actual: 3.9 },
  { crop: "Wheat", predicted: 3.8, actual: 3.5 },
  { crop: "Cotton", predicted: 2.9, actual: 3.1 },
  { crop: "Maize", predicted: 5.1, actual: 4.8 },
];

export default function YieldPredictionPage() {
  const [predicted, setPredicted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePredict = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPredicted(true);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Crop Yield Prediction
        </h2>
        <p className="text-muted-foreground mt-1">
          Estimate expected crop yield based on area, weather, and soil data.
        </p>
      </div>

      <div className="glass-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Area (hectares)", placeholder: "e.g. 5" },
            { label: "Avg Temperature (°C)", placeholder: "e.g. 28" },
            { label: "Soil Quality Score", placeholder: "e.g. 85" },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-sm text-muted-foreground mb-1.5 block">{f.label}</label>
              <input type="number" placeholder={f.placeholder} className="w-full input-glass" />
            </div>
          ))}
        </div>
        <button
          onClick={handlePredict}
          disabled={loading}
          className="mt-5 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold btn-glow hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <TrendingUp className="w-4 h-4" />
          )}
          {loading ? "Calculating..." : "Predict Yield"}
        </button>
      </div>

      {predicted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          {/* Gauge / result */}
          <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground mb-2">Predicted Yield</p>
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(150, 12%, 18%)" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="hsl(142, 70%, 45%)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(4.2 / 6) * 314} 314`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold gradient-text">4.2</span>
                <span className="text-xs text-muted-foreground">tons/ha</span>
              </div>
            </div>
            <p className="text-sm text-primary mt-3 font-medium">Above Average</p>
          </div>

          {/* Comparison chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Predicted vs Actual Yield</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 12%, 18%)" />
                <XAxis dataKey="crop" stroke="hsl(150, 10%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(150, 10%, 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(150, 15%, 10%)",
                    border: "1px solid hsl(150, 12%, 18%)",
                    borderRadius: "12px",
                    color: "hsl(140, 20%, 90%)",
                  }}
                />
                <Bar dataKey="predicted" fill="hsl(142, 70%, 45%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="actual" fill="hsl(80, 65%, 50%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}