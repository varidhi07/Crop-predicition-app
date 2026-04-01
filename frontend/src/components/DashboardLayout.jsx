import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";
import { ChatWidget } from "./ChatWidget";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}