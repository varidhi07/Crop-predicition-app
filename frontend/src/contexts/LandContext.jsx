import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();                          // ← subscribe to auth

  const [lands,          setLands]          = useState([]);
  const [selectedLandId, setSelectedLandId] = useState(null);
  const [loading,        setLoading]        = useState(false);

  // ── Fetch lands for the CURRENT user ────────────────────────────────────────
  const fetchLands = useCallback(async () => {
    const token = localStorage.getItem("token");

    // Demo users or unauthenticated: no backend call, just clear state
    if (!token || token === "demo-token") {
      setLands([]);
      setSelectedLandId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/lands`, { headers: authHeaders() });
      if (!res.ok) {
        setLands([]);
        return;
      }
      const data = await res.json();
      setLands(data);
      // Auto-select first active land (or first land) for the new user
      const active = data.find((l) => l.isActive) ?? data[0];
      setSelectedLandId(active?.id ?? null);
    } catch {
      setLands([]);
    } finally {
      setLoading(false);
    }
  }, []); // no deps – we call it imperatively when user changes

  // ── Re-fetch (or clear) whenever the logged-in user changes ─────────────────
  useEffect(() => {
    if (!user) {
      // Logged out → wipe immediately, no fetch
      setLands([]);
      setSelectedLandId(null);
      setLoading(false);
      return;
    }
    // New user logged in → clear stale data first, then fetch their lands
    setLands([]);
    setSelectedLandId(null);
    fetchLands();
  }, [user?.id]);   // keyed on user.id: fires on login, logout, and user switch

  // ── CRUD operations ──────────────────────────────────────────────────────────
  const addLand = useCallback(async (landData) => {
    const res = await fetch(`${API}/api/lands`, {
      method:  "POST",
      headers: authHeaders(),
      body:    JSON.stringify(landData),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const newLand = await res.json();
    setLands((prev) => [newLand, ...prev]);
    setSelectedLandId((prev) => prev ?? newLand.id);
    return newLand;
  }, []);

  const updateLand = useCallback(async (id, data) => {
    const res = await fetch(`${API}/api/lands/${id}`, {
      method:  "PUT",
      headers: authHeaders(),
      body:    JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const updated = await res.json();
    setLands((prev) => prev.map((l) => (l.id === id ? updated : l)));
    return updated;
  }, []);

  const deleteLand = useCallback(async (id) => {
    const res = await fetch(`${API}/api/lands/${id}`, {
      method:  "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    setLands((prev) => {
      const next = prev.filter((l) => l.id !== id);
      setSelectedLandId((sel) => (sel === id ? (next[0]?.id ?? null) : sel));
      return next;
    });
  }, []);

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