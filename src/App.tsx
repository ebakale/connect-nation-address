import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useLocalAuth } from "./hooks/useLocalAuth";
import { OfflineIndicator } from "./components/OfflineIndicator";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import OfflineAuth from "./pages/OfflineAuth";
import NotFound from "./pages/NotFound";
import Portal from "./pages/Portal";
import UnifiedDashboard from "./pages/UnifiedDashboard";
import PoliceDashboard from "./pages/PoliceDashboard";
import { UnitsAndProfilesPage } from "./pages/UnitsAndProfilesPage";

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useLocalAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/offline-auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="fixed top-4 right-4 z-50">
          <OfflineIndicator />
        </div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/offline-auth" element={<OfflineAuth />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/dashboard" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
            <Route path="/police" element={<ProtectedRoute><PoliceDashboard /></ProtectedRoute>} />
            <Route path="/units-profiles" element={<ProtectedRoute><UnitsAndProfilesPage /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
