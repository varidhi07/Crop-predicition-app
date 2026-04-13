import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LandContext = createContext(undefined);

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function LandProvider({ children }) {
  const [lands,          setLands]          = useState([]);
  const [selectedLandId, setSelectedLandId] = useState(null);
  const [loading,        setLoading]        = useState(true);

  // ── Fetch all lands from the backend ─────────────────────────────────────
  const fetchLands = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/lands`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setLands(data);
      // Auto-select active land or first land
      const active = data.find((l) => l.isActive) ?? data[0];
      if (active) setSelectedLandId((prev) => prev ?? active.id);
    } catch {
      // silently fail (user not logged in yet, etc.)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLands(); }, [fetchLands]);

  // ── CRUD operations ───────────────────────────────────────────────────────
  const addLand = useCallback(async (landData) => {
    try {
      const res = await fetch(`${API}/api/lands`, {
        method:  "POST",
        headers: authHeaders(),
        body:    JSON.stringify(landData),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const newLand = await res.json();
      setLands((prev) => [newLand, ...prev]);
      if (!selectedLandId) setSelectedLandId(newLand.id);
      return newLand;
    } catch (e) {
      throw e;
    }
  }, [selectedLandId]);

  const updateLand = useCallback(async (id, data) => {
    try {
      const res = await fetch(`${API}/api/lands/${id}`, {
        method:  "PUT",
        headers: authHeaders(),
        body:    JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setLands((prev) => prev.map((l) => (l.id === id ? updated : l)));
      return updated;
    } catch (e) {
      throw e;
    }
  }, []);

  const deleteLand = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/api/lands/${id}`, {
        method:  "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setLands((prev) => {
        const next = prev.filter((l) => l.id !== id);
        if (selectedLandId === id) setSelectedLandId(next[0]?.id ?? null);
        return next;
      });
    } catch (e) {
      throw e;
    }
  }, [selectedLandId]);

  const selectLand = useCallback((id) => setSelectedLandId(id), []);

  const selectedLand = lands.find((l) => l.id === selectedLandId) ?? null;

  return (
    <LandContext.Provider
      value={{
        lands,
        loading,
        selectedLandId,
        selectedLand,
        addLand,
        updateLand,
        deleteLand,
        selectLand,
        refetch: fetchLands,
      }}
    >
      {children}
    </LandContext.Provider>
  );
}

export function useLand() {
  const ctx = useContext(LandContext);
  if (!ctx) throw new Error("useLand must be used within LandProvider");
  return ctx;
}