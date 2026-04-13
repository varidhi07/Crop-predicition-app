/**
 * useWeather — geolocation → Google Weather API (current conditions) +
 *              reverse geocoding → regional average annual rainfall suggestion.
 *
 * `weather.rainfall` = TODAY's QPF from forecast (used on WeatherPage display).
 * `suggestedRainfall` = Average annual rainfall for the detected state/region
 *                       (used in prediction forms — what the ML model expects).
 *
 * Rainfall reference:
 *   Source: India Meteorological Department (IMD), average annual normal rainfall.
 *   For non-Indian locations a world-region fallback is used.
 */

import { useState, useEffect, useCallback } from "react";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_WEATHER_API_KEY;

// ── Indian state → average annual rainfall in mm (IMD normals) ───────────────
const INDIA_STATE_RAINFALL = {
  // North India
  "punjab":              649,
  "haryana":             614,
  "delhi":               714,
  "uttar pradesh":      1025,
  "uttarakhand":        1550,
  "himachal pradesh":   1469,
  "jammu and kashmir":  1011,
  "jammu & kashmir":    1011,
  "ladakh":              116,
  // East India
  "west bengal":        1582,
  "bihar":              1205,
  "jharkhand":          1203,
  "odisha":             1489,
  // Northeast India
  "assam":              2818,
  "meghalaya":          2818,
  "arunachal pradesh":  2782,
  "nagaland":           1963,
  "manipur":            1467,
  "mizoram":            2500,
  "tripura":            2000,
  "sikkim":             2739,
  // Central India
  "madhya pradesh":     1017,
  "chhattisgarh":       1292,
  // West India
  "rajasthan":           313,
  "gujarat":             927,
  "maharashtra":        1178,
  "goa":                3005,
  // South India
  "karnataka":          1248,
  "kerala":             3055,
  "tamil nadu":          998,
  "andhra pradesh":      930,
  "telangana":           902,
  // UTs
  "chandigarh":          617,
  "puducherry":         1200,
  "andaman and nicobar": 3000,
  "lakshadweep":        1515,
};

// ── World-region fallback (Köppen climate zone estimates) ────────────────────
const WORLD_REGION_RAINFALL = {
  // Broad country/region averages where enough granularity isn't needed
  "Bangladesh":   2666,
  "Pakistan":      494,
  "Sri Lanka":    1712,
  "Nepal":        1500,
  "China":         645,
  "Thailand":     1400,
  "Vietnam":      1821,
  "Indonesia":    2702,
  "Philippines":  2348,
  "Myanmar":      2091,
  "Australia":     534,
  "Brazil":       1782,
  "United States": 767,
  "United Kingdom":885,
  "Germany":       700,
  "France":        867,
  "Canada":        537,
  "Nigeria":      1150,
  "Kenya":         630,
  "Egypt":          51,
};

// Default global average if nothing matches
const DEFAULT_RAINFALL = 750;

/** Match a Nominatim state string to our lookup tables */
function lookupRainfall(stateRaw, countryRaw) {
  if (!stateRaw && !countryRaw) return DEFAULT_RAINFALL;

  const state   = (stateRaw   || "").toLowerCase().trim();
  const country = (countryRaw || "").toLowerCase().trim();

  // Try Indian state first (most specific)
  for (const [key, mm] of Object.entries(INDIA_STATE_RAINFALL)) {
    if (state.includes(key) || key.includes(state)) return mm;
  }

  // Try world region by country
  for (const [key, mm] of Object.entries(WORLD_REGION_RAINFALL)) {
    if (country.includes(key.toLowerCase())) return mm;
  }

  return DEFAULT_RAINFALL;
}

// ── Condition code → emoji ────────────────────────────────────────────────────
const CONDITION_ICONS = {
  CLEAR: "☀️", CLOUDY: "☁️", PARTLY_CLOUDY: "⛅", MOSTLY_CLOUDY: "🌥️",
  RAIN: "🌧️", DRIZZLE: "🌦️", HEAVY_RAIN: "⛈️", THUNDERSTORM: "⛈️",
  SNOW: "❄️", SLEET: "🌨️", FOG: "🌫️", HAZE: "🌫️", WINDY: "💨", TORNADO: "🌪️",
};

function iconForCondition(type = "") {
  const key = Object.keys(CONDITION_ICONS).find((k) => type.toUpperCase().includes(k));
  return CONDITION_ICONS[key] ?? "🌤️";
}

function fin(v, decimals = 0) {
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return 0;
  if (decimals === 0) return Math.round(n);
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

// ── Reverse geocode: returns { city, state, country } ────────────────────────
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const d = await res.json();
    const addr = d.address ?? {};
    const city =
      addr.city || addr.town || addr.village || addr.county || d.display_name?.split(",")[0] || "Your location";
    const state   = addr.state   ?? addr.region   ?? "";
    const country = addr.country ?? "";
    return { city, state, country };
  } catch {
    return { city: "Your location", state: "", country: "" };
  }
}

// ── Rainfall QPF for WeatherPage display ─────────────────────────────────────
async function fetchRainfallQPF(lat, lng) {
  try {
    const url =
      `https://weather.googleapis.com/v1/forecast:lookup` +
      `?key=${GOOGLE_KEY}&location.latitude=${lat}&location.longitude=${lng}` +
      `&days=1&unitsSystem=METRIC`;
    const res = await fetch(url);
    if (!res.ok) return 0;
    const d = await res.json();
    const days = d.forecastDays ?? d.forecast?.forecastDays ?? [];
    if (!days.length) return 0;
    const day      = days[0];
    const dayQpf   = fin(day.daytimeForecast?.precipitation?.qpf?.quantity,   1);
    const nightQpf = fin(day.overnightForecast?.precipitation?.qpf?.quantity,  1);
    return fin(dayQpf + nightQpf, 1);
  } catch {
    return 0;
  }
}

// ── Main weather fetch ────────────────────────────────────────────────────────
async function fetchWeather(lat, lng) {
  if (!GOOGLE_KEY) throw new Error("VITE_GOOGLE_WEATHER_API_KEY not set in frontend .env");

  const url =
    `https://weather.googleapis.com/v1/currentConditions:lookup` +
    `?key=${GOOGLE_KEY}&location.latitude=${lat}&location.longitude=${lng}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Weather API ${res.status}`);
  }
  const cc = await res.json();

  const rainfallQPF = await fetchRainfallQPF(lat, lng);

  const conditionType = cc.weatherCondition?.type ?? "";
  return {
    temperature:    fin(cc.temperature?.degrees),
    humidity:       fin(cc.relativeHumidity),
    rainfall:       rainfallQPF,                        // today's QPF mm (for WeatherPage)
    rainfallChance: fin(cc.precipitation?.probability?.percent),
    windSpeed:      fin(cc.wind?.speed?.value),
    uvIndex:        fin(cc.uvIndex),
    condition:      cc.weatherCondition?.description?.text ?? conditionType ?? "",
    conditionIcon:  iconForCondition(conditionType),
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useWeather() {
  const [weather,           setWeather]           = useState(null);
  const [locationName,      setLocationName]      = useState(null);
  const [suggestedRainfall, setSuggestedRainfall] = useState(null); // regional annual avg mm
  const [loading,           setLoading]           = useState(false);
  const [error,             setError]             = useState(null);
  const [permState,         setPermState]         = useState("idle");

  const run = useCallback(async () => {
    if (!navigator.geolocation) {
      setPermState("unavailable");
      setError("Geolocation not supported by this browser.");
      return;
    }
    setLoading(true);
    setError(null);
    setPermState("requesting");

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        setPermState("granted");
        try {
          const [w, geo] = await Promise.all([fetchWeather(lat, lng), reverseGeocode(lat, lng)]);

          const annualMm = lookupRainfall(geo.state, geo.country);
          console.log(
            `[useWeather] ${geo.city}, ${geo.state}, ${geo.country}`,
            `| temp:${w.temperature}°C humidity:${w.humidity}%`,
            `| today's QPF:${w.rainfall}mm | regional avg:${annualMm}mm/yr`
          );

          setWeather(w);
          setLocationName(geo.city);
          setSuggestedRainfall(annualMm);
        } catch (e) {
          console.error("[useWeather]", e);
          setError(e.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setPermState("denied");
        setLoading(false);
        setError(
          err.code === 1
            ? "Location permission denied. Enter values manually."
            : "Unable to get location. Enter values manually."
        );
      },
      { timeout: 10_000, maximumAge: 300_000 }
    );
  }, []);

  useEffect(() => { run(); }, [run]);

  return { weather, loading, error, locationName, suggestedRainfall, permState, retry: run };
}
