import { Outlet, Link } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";
import { ChatWidget } from "./ChatWidget";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn } from "lucide-react";

export function DashboardLayout() {
  const { isDemoUser } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-background flex-col">
      {/* Demo mode banner */}
      {isDemoUser && (
        <div className="w-full bg-primary/10 border-b border-primary/25 px-4 py-2 flex items-center justify-center gap-3 text-xs text-primary z-40 shrink-0">
          <span className="font-semibold">🌱 Demo Mode</span>
          <span className="text-muted-foreground hidden sm:inline">— You're exploring FarmAssist as a guest. Data is simulated.</span>
          <Link
            to="/login"
            className="ml-2 flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            <LogIn className="w-3 h-3" />
            Sign up free
          </Link>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}