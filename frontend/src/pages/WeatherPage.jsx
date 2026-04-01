import { Cloud, Sun, Droplets, Wind, Eye, Thermometer } from "lucide-react";

const hourly = [
  { time: "6 AM", temp: 22, icon: "🌤️" },
  { time: "9 AM", temp: 25, icon: "☀️" },
  { time: "12 PM", temp: 30, icon: "☀️" },
  { time: "3 PM", temp: 32, icon: "⛅" },
  { time: "6 PM", temp: 28, icon: "🌤️" },
  { time: "9 PM", temp: 24, icon: "🌙" },
];

const forecast = [
  { day: "Tomorrow", high: 31, low: 21, icon: "☀️", rain: "5%" },
  { day: "Wednesday", high: 29, low: 20, icon: "⛅", rain: "20%" },
  { day: "Thursday", high: 27, low: 19, icon: "🌧️", rain: "65%" },
  { day: "Friday", high: 28, low: 20, icon: "⛅", rain: "30%" },
  { day: "Saturday", high: 30, low: 21, icon: "☀️", rain: "10%" },
];

export default function WeatherPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Cloud className="w-6 h-6 text-primary" />
          Weather Integration
        </h2>
        <p className="text-muted-foreground mt-1">Real-time weather data for your farm location.</p>
      </div>

      {/* Current */}
      <div className="glass-card p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="text-center">
            <span className="text-7xl block animate-float">☀️</span>
            <p className="text-sm text-muted-foreground mt-2">Clear Sky</p>
          </div>
          <div className="flex-1">
            <p className="text-6xl font-bold text-foreground">28°C</p>
            <p className="text-muted-foreground mt-1">Feels like 30°C • Punjab, India</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {[
                { label: "Humidity", value: "72%", icon: Droplets },
                { label: "Wind", value: "12 km/h", icon: Wind },
                { label: "Visibility", value: "10 km", icon: Eye },
                { label: "UV Index", value: "6 (High)", icon: Sun },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50">
                  <s.icon className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-semibold text-foreground">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-foreground mb-4">Today's Forecast</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {hourly.map((h) => (
            <div
              key={h.time}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 min-w-20 hover:bg-primary/10 transition-colors"
            >
              <span className="text-xs text-muted-foreground">{h.time}</span>
              <span className="text-xl">{h.icon}</span>
              <span className="text-sm font-semibold text-foreground">{h.temp}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5-day */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-foreground mb-4">5-Day Forecast</h3>
        <div className="space-y-2">
          {forecast.map((d) => (
            <div
              key={d.day}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <span className="text-sm font-medium text-foreground w-28">{d.day}</span>
              <span className="text-xl">{d.icon}</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Droplets className="w-3 h-3" /> {d.rain}
              </span>
              <span className="text-sm font-mono text-foreground">
                {d.high}° / <span className="text-muted-foreground">{d.low}°</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}