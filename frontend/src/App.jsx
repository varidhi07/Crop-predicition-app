import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LandProvider } from "@/contexts/LandContext";
import { DashboardLayout } from "./components/DashboardLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CropPredictionPage from "./pages/CropPredictionPage";
import FertilizerPage from "./pages/FertilizerPage";
import YieldPredictionPage from "./pages/YieldPredictionPage";
import WeatherPage from "./pages/WeatherPage";
import InsightsPage from "./pages/InsightsPage";
import LandsPage from "./pages/LandsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LandProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/lands" element={<LandsPage />} />
              <Route path="/crop-prediction" element={<CropPredictionPage />} />
              <Route path="/fertilizer" element={<FertilizerPage />} />
              <Route path="/yield-prediction" element={<YieldPredictionPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/insights" element={<InsightsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LandProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;