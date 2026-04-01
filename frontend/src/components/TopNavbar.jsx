import { Bell, Sun, Droplets } from "lucide-react";
import { LandSelector } from "./LandSelector";

export function TopNavbar() {
  return (
    <header className="h-16 border-b border-border/50 bg-card/40 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Welcome back, Farmer</h1>
          <p className="text-xs text-muted-foreground">Here's your farm overview for today</p>
        </div>
        <LandSelector />
      </div>

      <div className="flex items-center gap-4">
        {/* Weather mini */}
        <div className="hidden md:flex items-center gap-3 glass-card px-4 py-2">
          <div className="flex items-center gap-1.5 text-sm">
            <Sun className="w-4 h-4 text-warning" />
            <span className="text-foreground font-medium">28°C</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-sm">
            <Droplets className="w-4 h-4 text-primary" />
            <span className="text-foreground font-medium">72%</span>
          </div>
        </div>


        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Profile */}
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
          FK
        </div>
      </div>
    </header>
  );
}