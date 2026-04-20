import { createContext, useContext, useState, useEffect, useCallback } from "react";
// useNavigate intentionally not used here – navigation happens in pages

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);   // true while checking stored token

  // ── Restore session from localStorage ─────────────────────────────────────
  useEffect(() => {
    const token  = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (token && stored) {
      try {
        const parsed = JSON.parse(stored);
        // Accept both real users and demo users
        if (parsed && (parsed.id || parsed.demo)) setUser(parsed);
      } catch {
        // Corrupt JSON — clear it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user",  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user",  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // ── Demo login (no backend required) ─────────────────────────────────────
  const loginDemo = useCallback(() => {
    const demoUser = {
      id:    "demo",
      demo:  true,
      name:  "Demo Farmer",
      email: "demo@farmassist.ai",
    };
    // Use a clearly fake token so protected API calls fail gracefully
    localStorage.setItem("token", "demo-token");
    localStorage.setItem("user",  JSON.stringify(demoUser));
    setUser(demoUser);
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const isAuthenticated = !!user;
  const isDemoUser      = !!user?.demo;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, isDemoUser, login, loginDemo, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
