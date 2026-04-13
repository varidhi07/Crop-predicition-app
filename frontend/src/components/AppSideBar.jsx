import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Sprout, FlaskConical, BarChart3,
  Cloud, BrainCircuit, ChevronLeft, ChevronRight,
  Leaf, MapPin, LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Dashboard",       path: "/dashboard",       icon: LayoutDashboard },
  { title: "My Lands",        path: "/lands",           icon: MapPin          },
  { title: "Crop Prediction", path: "/crop-prediction", icon: Sprout          },
  { title: "Fertilizer",      path: "/fertilizer",      icon: FlaskConical    },
  { title: "Yield Prediction",path: "/yield-prediction",icon: BarChart3       },
  { title: "Weather",         path: "/weather",          icon: Cloud           },
  { title: "Insights",        path: "/insights",         icon: BrainCircuit    },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <aside
      className={`${
        collapsed ? "w-18" : "w-64"
      } h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Leaf className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold gradient-text whitespace-nowrap">
            FarmAssist
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              {!collapsed && <span className="whitespace-nowrap">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout + Collapse */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}