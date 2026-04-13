import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Sun, Droplets, LogOut, User, ChevronDown } from "lucide-react";
import { LandSelector } from "./LandSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useWeather } from "@/hooks/useWeather";

export function TopNavbar() {
  const { user, logout } = useAuth();
  const { weather }      = useWeather();
  const navigate         = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Get initials from name
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "FA";

  const firstName = user?.name?.split(" ")[0] ?? "Farmer";

  return (
    <header className="h-16 border-b border-border/50 bg-card/40 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="text-xs text-muted-foreground">Here's your farm overview for today</p>
        </div>
        <LandSelector />
      </div>

      <div className="flex items-center gap-3">
        {/* Live weather mini-chip */}
        <div className="hidden md:flex items-center gap-3 glass-card px-4 py-2">
          <div className="flex items-center gap-1.5 text-sm">
            <Sun className="w-4 h-4 text-warning" />
            <span className="text-foreground font-medium">
              {weather ? `${weather.temperature}°C` : "—°C"}
            </span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-sm">
            <Droplets className="w-4 h-4 text-primary" />
            <span className="text-foreground font-medium">
              {weather ? `${weather.humidity}%` : "—%"}
            </span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-secondary transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {initials}
            </div>
            {user?.name && (
              <span className="hidden md:block text-sm font-medium text-foreground max-w-28 truncate">
                {user.name}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 glass-card py-1.5 shadow-2xl animate-slide-up z-50">
              <div className="px-4 py-2 border-b border-border/50">
                <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}