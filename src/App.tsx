import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UnifiedAuthProvider } from "@/hooks/useUnifiedAuth";

import { useUnifiedAuth } from "./hooks/useUnifiedAuth";
import { OfflineIndicator } from "./components/OfflineIndicator";
import Index from "./pages/Index";
import UnifiedAuth from "./pages/UnifiedAuth";
import NotFound from "./pages/NotFound";
import Portal from "./pages/Portal";
import UnifiedDashboard from "./pages/UnifiedDashboard";
import PoliceDashboard from "./pages/PoliceDashboard";

import { UnitsAndProfilesPage } from "./pages/UnitsAndProfilesPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UnifiedAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </UnifiedAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Protected Route wrapper - now defined as a separate component that uses hooks properly
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useUnifiedAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Routes component that can use hooks safely
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<UnifiedAuth />} />
      <Route path="/portal" element={<Portal />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
      <Route path="/police" element={<ProtectedRoute><PoliceDashboard /></ProtectedRoute>} />
      <Route path="/units-profiles" element={<ProtectedRoute><UnitsAndProfilesPage /></ProtectedRoute>} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
