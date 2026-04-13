import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Leaf, Thermometer, Droplets, CloudRain, TrendingUp,
  ArrowUpRight, Sprout, BarChart3, Zap,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import { useLand } from "@/contexts/LandContext";
import { useWeather } from "@/hooks/useWeather";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Map N/P/K values → 0-100% of "optimal"
const OPTIMAL = { nitrogen: 120, phosphorus: 80, potassium: 80 };
function pct(val, key) {
  return Math.min(Math.round(((val ?? 0) / OPTIMAL[key]) * 100), 100);
}

const CROP_ICONS = {
  rice: "🌾", wheat: "🌾", maize: "🌽", cotton: "🏵️", jute: "🌿",
  banana: "🍌", mango: "🥭", apple: "🍎", grapes: "🍇", orange: "🍊",
  coconut: "🥥", papaya: "🍈", watermelon: "🍉", potato: "🥔",
  tomato: "🍅", onion: "🧅", coffee: "☕", chickpea: "🫘",
};

const TOOLTIP_STYLE = {
  background: "hsl(150, 15%, 10%)",
  border: "1px solid hsl(150, 12%, 18%)",
  borderRadius: "12px",
  color: "hsl(140, 20%, 90%)",
};

export default function DashboardPage() {
  const { selectedLand, loading: landsLoading } = useLand();
  const { weather } = useWeather();

  const [topCrops,     setTopCrops]     = useState([]);
  const [yieldHistory, setYieldHistory] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(false);

  // ── Auto-predict top crops when selected land changes ──────────────────────
  useEffect(() => {
    if (!selectedLand) return;
    setLoadingCrops(true);
    const token = localStorage.getItem("token");

    fetch(`${API}/api/predictions/crop`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        landId:     selectedLand.id,
        nitrogen:   selectedLand.nitrogen,
        phosphorus: selectedLand.phosphorus,
        potassium:  selectedLand.potassium,
        ph:         selectedLand.ph,
        temperature: selectedLand.temperature,
        humidity:   selectedLand.humidity,
        rainfall:   selectedLand.rainfall,
      }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.top_crops) setTopCrops(d.top_crops.slice(0, 3)); })
      .catch(() => {})
      .finally(() => setLoadingCrops(false));
  }, [selectedLand?.id]);

  // ── Load yield history for chart ───────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/predictions/yield`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        // Group by month, take last 7 months
        const byMonth = {};
        data.forEach((p) => {
          const mon = new Date(p.createdAt).toLocaleString("en", { month: "short" });
          byMonth[mon] = (byMonth[mon] ?? 0) + (p.predictedYield ?? 0);
        });
        const chart = Object.entries(byMonth)
          .slice(-7)
          .map(([month, yld]) => ({ month, yield: +yld.toFixed(2) }));
        setYieldHistory(chart);
      })
      .catch(() => {});
  }, []);

  // ── Derive live values (prefer real weather over stored land values) ────────
  const temp       = weather?.temperature ?? selectedLand?.temperature ?? "—";
  const humidity   = weather?.humidity    ?? selectedLand?.humidity    ?? "—";
  const rainfall   = selectedLand?.rainfall ?? "—";
  const soilHealth = selectedLand
    ? Math.round((pct(selectedLand.nitrogen, "nitrogen") +
                  pct(selectedLand.phosphorus, "phosphorus") +
                  pct(selectedLand.potassium, "potassium")) / 3)
    : null;

  const overviewCards = [
    { title: "Soil Health",  value: soilHealth != null ? `${soilHealth}%` : "—",  icon: Leaf,        color: "text-primary", bg: "bg-primary/15" },
    { title: "Temperature", value: temp !== "—" ? `${temp}°C` : "—",             icon: Thermometer, color: "text-warning", bg: "bg-warning/15" },
    { title: "Humidity",    value: humidity !== "—" ? `${humidity}%` : "—",       icon: Droplets,    color: "text-accent",  bg: "bg-accent/15"  },
    { title: "Rainfall",    value: rainfall !== "—" ? `${rainfall}mm` : "—",      icon: CloudRain,   color: "text-primary", bg: "bg-primary/15" },
  ];

  const soilRadial = selectedLand ? [
    { name: "Nitrogen",   value: pct(selectedLand.nitrogen,   "nitrogen"),   fill: "hsl(142,70%,45%)" },
    { name: "Phosphorus", value: pct(selectedLand.phosphorus, "phosphorus"), fill: "hsl(80,65%,50%)"  },
    { name: "Potassium",  value: pct(selectedLand.potassium,  "potassium"),  fill: "hsl(45,93%,47%)"  },
  ] : [];

  const chartData = yieldHistory.length > 0 ? yieldHistory : [
    { month: "—", yield: 0 },
  ];

  if (landsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!selectedLand) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 text-center py-20">
        <Leaf className="w-16 h-16 text-primary/30 mx-auto" />
        <p className="text-xl font-semibold text-foreground">No land selected</p>
        <p className="text-muted-foreground">Add a land plot to get started.</p>
        <Link
          to="/lands"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold btn-glow"
        >
          <Sprout className="w-4 h-4" /> Go to My Lands
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Land name banner */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">{selectedLand.name}</h2>
          <p className="text-sm text-muted-foreground">{selectedLand.location} · {selectedLand.area} acres</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card, i) => (
          <div key={card.title} className="glass-card-hover p-5" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <span className="stat-badge-success">
                <TrendingUp className="w-3 h-3" />live
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yield Trend Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Yield History</h3>
              <p className="text-sm text-muted-foreground">Predicted yield from your submissions</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-primary">
              <ArrowUpRight className="w-4 h-4" />
              <span className="font-medium">tonnes</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="hsl(142,70%,45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(142,70%,45%)" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,18%)" />
              <XAxis dataKey="month" stroke="hsl(150,10%,55%)" fontSize={12} />
              <YAxis stroke="hsl(150,10%,55%)" fontSize={12} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="yield" stroke="hsl(142,70%,45%)"
                    strokeWidth={2} fill="url(#yieldGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Crops */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sprout className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">AI Top Crops</h3>
          </div>
          {loadingCrops ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-secondary/50 animate-pulse" />
              ))}
            </div>
          ) : topCrops.length === 0 ? (
            <p className="text-sm text-muted-foreground">Run a crop prediction to see results here.</p>
          ) : (
            <div className="space-y-4">
              {topCrops.map((crop, i) => (
                <div key={crop.crop}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                    i === 0
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-secondary/50 hover:bg-secondary"
                  }`}
                >
                  <span className="text-2xl">{CROP_ICONS[crop.crop] ?? "🌱"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground capitalize">{crop.crop}</p>
                      {i === 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">Best</span>
                      )}
                    </div>
                    <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-700"
                           style={{ width: `${crop.confidence}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-mono font-semibold text-primary">{crop.confidence}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soil Nutrients Radial */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Soil Nutrients</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%"
                            data={soilRadial} startAngle={180} endAngle={0}>
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "hsl(150,12%,18%)" }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {soilRadial.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                <span className="text-muted-foreground">
                  {s.name}: <span className="text-foreground font-medium">{s.value}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Predict Crop",     icon: Sprout,   path: "/crop-prediction" },
              { label: "Check Fertilizer", icon: Leaf,     path: "/fertilizer"      },
              { label: "Yield Forecast",   icon: BarChart3, path: "/yield-prediction" },
              { label: "Weather Data",     icon: CloudRain, path: "/weather"         },
            ].map((action) => (
              <Link key={action.label} to={action.path}
                className="flex flex-col items-center gap-3 p-5 rounded-xl bg-secondary/50
                           hover:bg-primary/10 border border-transparent hover:border-primary/30
                           transition-all duration-200 group"
              >
                <action.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
