import { Cloud, Sun, Droplets, Wind, Eye, Thermometer, LocateFixed, RefreshCw, AlertTriangle } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";

export default function WeatherPage() {
  const { weather, loading, error, locationName, permState, retry } = useWeather();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cloud className="w-6 h-6 text-primary" />
            Weather
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time weather for your farm location.
          </p>
        </div>
        <button
          onClick={retry}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-sm font-medium
                     hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Fetching…" : "Refresh"}
        </button>
      </div>

      {/* Permission / loading states */}
      {permState === "requesting" || loading ? (
        <div className="glass-card p-10 flex flex-col items-center justify-center gap-4">
          <LocateFixed className="w-10 h-10 text-primary animate-pulse" />
          <p className="text-foreground font-semibold">Requesting location…</p>
          <p className="text-sm text-muted-foreground">
            Please allow location access when prompted by your browser.
          </p>
        </div>
      ) : permState === "denied" || error ? (
        <div className="glass-card p-6 flex items-start gap-4 border border-warning/30 bg-warning/5">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">
              {permState === "denied" ? "Location access denied" : "Could not load weather"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <button
              onClick={retry}
              className="mt-3 text-sm text-primary underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      {/* Current conditions */}
      {weather && (
        <>
          <div className="glass-card p-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="text-center">
                <span className="text-7xl block animate-float">
                  {weather.conditionIcon}
                </span>
                <p className="text-sm text-muted-foreground mt-2">{weather.condition}</p>
              </div>
              <div className="flex-1">
                <p className="text-6xl font-bold text-foreground">
                  {weather.temperature}°C
                </p>
                {locationName && (
                  <p className="text-muted-foreground mt-1 flex items-center gap-1">
                    <LocateFixed className="w-3.5 h-3.5" />
                    {locationName}
                  </p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {[
                    { label: "Humidity",      value: `${weather.humidity}%`,                    icon: Droplets },
                    { label: "Wind",          value: `${weather.windSpeed} km/h`,               icon: Wind },
                    { label: "Rainfall (QPF)", value: `${weather.rainfall} mm`,                 icon: Eye },
                    { label: "Rain chance",   value: `${weather.rainfallChance}%`,              icon: Sun },
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

          {/* Farmwise tip */}
          <div className="glass-card p-5 border border-primary/20 bg-primary/5">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
              Farm Advisory
            </p>
            <p className="text-sm text-muted-foreground">
              {weather.humidity > 80
                ? "High humidity detected — watch for fungal diseases. Ensure adequate crop spacing and airflow."
                : weather.temperature > 35
                ? "Extreme heat today. Irrigate early morning or evening to minimise evaporation losses."
                : weather.rainfall > 60
                ? "High rain probability. Delay fertilizer application to prevent nutrient runoff."
                : "Weather conditions are favourable. Good day for field activities."}
            </p>
          </div>
        </>
      )}

      {/* Skeleton placeholder when not yet loaded and no error */}
      {!weather && !loading && !error && (
        <div className="glass-card p-8 text-center text-muted-foreground">
          <Cloud className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Weather data will appear here once location is granted.</p>
        </div>
      )}
    </div>
  );
}