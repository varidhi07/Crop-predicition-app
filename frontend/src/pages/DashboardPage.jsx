import {
  Leaf,
  Thermometer,
  Droplets,
  CloudRain,
  TrendingUp,
  ArrowUpRight,
  Sprout,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";

const overviewCards = [
  {
    title: "Soil Health",
    value: "87%",
    change: "+3.2%",
    icon: Leaf,
    color: "text-primary",
    bgColor: "bg-primary/15",
  },
  {
    title: "Temperature",
    value: "28°C",
    change: "+1.5°C",
    icon: Thermometer,
    color: "text-warning",
    bgColor: "bg-warning/15",
  },
  {
    title: "Humidity",
    value: "72%",
    change: "-2.1%",
    icon: Droplets,
    color: "text-accent",
    bgColor: "bg-accent/15",
  },
  {
    title: "Rainfall",
    value: "45mm",
    change: "+12mm",
    icon: CloudRain,
    color: "text-primary",
    bgColor: "bg-primary/15",
  },
];

const yieldData = [
  { month: "Jan", yield: 2.4 },
  { month: "Feb", yield: 2.8 },
  { month: "Mar", yield: 3.2 },
  { month: "Apr", yield: 3.8 },
  { month: "May", yield: 4.1 },
  { month: "Jun", yield: 3.9 },
  { month: "Jul", yield: 4.5 },
];

const soilRadial = [
  { name: "Nitrogen", value: 78, fill: "hsl(142, 70%, 45%)" },
  { name: "Phosphorus", value: 65, fill: "hsl(80, 65%, 50%)" },
  { name: "Potassium", value: 82, fill: "hsl(45, 93%, 47%)" },
];

const recommendedCrops = [
  { name: "Rice", confidence: 94, icon: "🌾" },
  { name: "Cotton", confidence: 87, icon: "🏵️" },
  { name: "Jute", confidence: 82, icon: "🌿" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card, i) => (
          <div
            key={card.title}
            className="glass-card-hover p-5"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <span className="stat-badge-success">
                <TrendingUp className="w-3 h-3" />
                {card.change}
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
              <h3 className="text-lg font-semibold text-foreground">Yield Trend</h3>
              <p className="text-sm text-muted-foreground">Monthly crop yield overview</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-primary">
              <ArrowUpRight className="w-4 h-4" />
              <span className="font-medium">+18.2%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={yieldData}>
              <defs>
                <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 12%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(150, 10%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(150, 10%, 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(150, 15%, 10%)",
                  border: "1px solid hsl(150, 12%, 18%)",
                  borderRadius: "12px",
                  color: "hsl(140, 20%, 90%)",
                }}
              />
              <Area
                type="monotone"
                dataKey="yield"
                stroke="hsl(142, 70%, 45%)"
                strokeWidth={2}
                fill="url(#yieldGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recommended Crops */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sprout className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Top Crops</h3>
          </div>
          <div className="space-y-4">
            {recommendedCrops.map((crop, i) => (
              <div
                key={crop.name}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                  i === 0
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-secondary/50 hover:bg-secondary"
                }`}
              >
                <span className="text-2xl">{crop.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{crop.name}</p>
                    {i === 0 && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        Best Match
                      </span>
                    )}
                  </div>
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${crop.confidence}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-mono font-semibold text-primary">
                  {crop.confidence}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soil Nutrients */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Soil Nutrients</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="90%"
              data={soilRadial}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: "hsl(150, 12%, 18%)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(150, 15%, 10%)",
                  border: "1px solid hsl(150, 12%, 18%)",
                  borderRadius: "12px",
                  color: "hsl(140, 20%, 90%)",
                }}
              />
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
              { label: "Predict Crop", icon: Sprout, path: "/crop-prediction" },
              { label: "Check Fertilizer", icon: Leaf, path: "/fertilizer" },
              { label: "Yield Forecast", icon: BarChart3, path: "/yield-prediction" },
              { label: "Weather Data", icon: CloudRain, path: "/weather" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.path}
                className="flex flex-col items-center gap-3 p-5 rounded-xl bg-secondary/50 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all duration-200 group"
              >
                <action.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
