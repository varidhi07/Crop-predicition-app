import { useState } from "react";
import { useLand } from "@/contexts/LandContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWeather } from "@/hooks/useWeather";
import { MapPin, Plus, Pencil, Trash2, Save, X, Loader2, LocateFixed } from "lucide-react";

const fieldDefs = [
  { key: "name", label: "Land Name", type: "text", placeholder: "e.g. North Field" },
  { key: "location", label: "Location", type: "text", placeholder: "e.g. Punjab, India" },
  { key: "area", label: "Area (acres)", type: "number", placeholder: "e.g. 12" },
  { key: "nitrogen", label: "Nitrogen (N)", type: "number", placeholder: "e.g. 90" },
  { key: "phosphorus", label: "Phosphorus (P)", type: "number", placeholder: "e.g. 42" },
  { key: "potassium", label: "Potassium (K)", type: "number", placeholder: "e.g. 43" },
  { key: "ph", label: "pH Level", type: "number", placeholder: "e.g. 6.5" },
  { key: "temperature", label: "Temperature (°C)", type: "number", placeholder: "e.g. 28" },
  { key: "humidity", label: "Humidity (%)", type: "number", placeholder: "e.g. 72" },
  { key: "rainfall", label: "Rainfall (mm)", type: "number", placeholder: "e.g. 200" },
];

const emptyForm = {
  name: "", location: "", area: "",
  nitrogen: "", phosphorus: "", potassium: "",
  ph: "",
  // weather-derived: start blank so auto-fill is visible
  temperature: "", humidity: "", rainfall: "",
};

export default function LandsPage() {
  const { lands, loading, addLand, updateLand, deleteLand, selectLand, selectedLandId } = useLand();
  const { isDemoUser } = useAuth();
  const { weather, locationName, suggestedRainfall } = useWeather();

  const [editingId, setEditingId] = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [form,      setForm]      = useState(emptyForm);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);

  // Open Add form and pre-populate weather fields
  const openAddForm = () => {
    const hasWeather = weather != null;
    setForm({
      ...emptyForm,
      location:    locationName ?? "",
      temperature: hasWeather ? String(weather.temperature)        : "",
      humidity:    hasWeather ? String(weather.humidity)           : "",
      // Use regional annual average (IMD), not today's QPF
      rainfall:    suggestedRainfall != null ? String(suggestedRainfall) : "",
    });
    setShowAdd(true);
    setEditingId(null);
    setError(null);
  };

  const startEdit = (land) => {
    setEditingId(land.id);
    const { id, userId, createdAt, updatedAt, ...rest } = land;
    setForm(rest);
    setError(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true); setError(null);
    try {
      await updateLand(editingId, form);
      setEditingId(null);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true); setError(null);
    try {
      await addLand(form);
      setForm(emptyForm);
      setShowAdd(false);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this land?")) return;
    try { await deleteLand(id); } catch (e) { setError(e.message); }
  };

  const setField = (key, value) => {
    const numFields = ["area", "nitrogen", "phosphorus", "potassium", "ph", "temperature", "humidity", "rainfall"];
    setForm((prev) => ({
      ...prev,
      [key]: numFields.includes(key) ? parseFloat(value) || 0 : value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Demo users: no real data
  if (isDemoUser) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">My Lands</h2>
        </div>
        <div className="glass-card p-12 text-center">
          <MapPin className="w-12 h-12 text-primary/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Demo Mode — No Lands Yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            You're exploring as a demo user. Land data is user-specific and stored securely.
            <br /><br />
            <a href="/login" className="text-primary hover:underline font-medium">Create a free account</a> to add and manage your own farm lands.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            My Lands
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your farm lands and their soil parameters.
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold btn-glow hover:bg-primary/90 transition-all flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Land
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Add New Land Form */}
      {showAdd && (
        <div className="glass-card p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">New Land</h3>
            <div className="flex items-center gap-3">
              {locationName && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <LocateFixed className="w-3 h-3" />
                  {locationName}
                  {suggestedRainfall != null && (
                    <span className="text-muted-foreground ml-1">
                      · rainfall: <strong className="text-primary">{suggestedRainfall} mm/yr</strong> (regional avg)
                    </span>
                  )}
                </span>
              )}
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fieldDefs.map((f) => (
              <div key={f.key}>
                <label className="text-sm text-muted-foreground mb-1.5 block">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key] || ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  className="w-full input-glass"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Land"}
          </button>
        </div>
      )}

      {/* Land Cards */}
      <div className="space-y-4">
        {lands.length === 0 && !showAdd && (
          <div className="glass-card p-12 text-center">
            <MapPin className="w-12 h-12 text-primary/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Lands Added Yet</h3>
            <p className="text-muted-foreground text-sm mb-5">
              Add your first farm land to start getting crop predictions, fertilizer recommendations, and yield estimates.
            </p>
            <button
              onClick={openAddForm}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold btn-glow hover:bg-primary/90 transition-all flex items-center gap-2 text-sm mx-auto"
            >
              <Plus className="w-4 h-4" /> Add Your First Land
            </button>
          </div>
        )}
        {lands.map((land) => (
          <div
            key={land.id}
            className={`glass-card p-6 transition-all ${land.id === selectedLandId ? "border border-primary/40" : ""}`}
          >
            {editingId === land.id ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fieldDefs.map((f) => (
                    <div key={f.key}>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{f.label}</label>
                      <input
                        type={f.type}
                        value={form[f.key] || ""}
                        onChange={(e) => setField(f.key, e.target.value)}
                        className="w-full input-glass"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={saveEdit} disabled={saving}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl bg-secondary text-foreground text-sm hover:bg-secondary/80">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{land.name}</h3>
                      {land.id === selectedLandId && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{land.location} · {land.area} acres</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {land.id !== selectedLandId && (
                      <button
                        onClick={() => selectLand(land.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        Set Active
                      </button>
                    )}
                    <button onClick={() => startEdit(land)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteLand(land.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* NPK + Params Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { label: "N", value: land.nitrogen, unit: "mg/kg", color: "text-primary" },
                    { label: "P", value: land.phosphorus, unit: "mg/kg", color: "text-accent" },
                    { label: "K", value: land.potassium, unit: "mg/kg", color: "text-warning" },
                    { label: "pH", value: land.ph, unit: "", color: "text-foreground" },
                    { label: "Temp", value: land.temperature, unit: "°C", color: "text-warning" },
                    { label: "Humidity", value: land.humidity, unit: "%", color: "text-accent" },
                    { label: "Rainfall", value: land.rainfall, unit: "mm", color: "text-primary" },
                  ].map((param) => (
                    <div key={param.label} className="bg-secondary/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground">{param.label}</p>
                      <p className={`text-lg font-bold font-mono ${param.color}`}>
                        {param.value}
                        <span className="text-xs font-normal text-muted-foreground ml-0.5">{param.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}