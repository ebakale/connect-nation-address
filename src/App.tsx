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
import Documentation from "./pages/Documentation";
import TrackDelivery from "./pages/TrackDelivery";

import { UnitsAndProfilesPage } from "./pages/UnitsAndProfilesPage";
import CitizenPortalUnified from "./pages/CitizenPortalUnified";
import { DemoPresentationPage } from "./pages/DemoPresentationPage";
import { DemoScriptPage } from "./pages/DemoScriptPage";
import { BusinessAddressRegistrationForm } from "./components/BusinessAddressRegistrationForm";
import MyBusinesses from "./pages/MyBusinesses";
import PostalPage from "./pages/PostalPage";

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
      <Route path="/citizen" element={<CitizenPortalUnified />} />
      <Route path="/demo-presentation" element={<DemoPresentationPage />} />
      <Route path="/demo-script" element={<DemoScriptPage />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/track" element={<TrackDelivery />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
      <Route path="/police" element={<ProtectedRoute><PoliceDashboard /></ProtectedRoute>} />
      <Route path="/units-profiles" element={<ProtectedRoute><UnitsAndProfilesPage /></ProtectedRoute>} />
      <Route path="/business/register" element={<ProtectedRoute><BusinessAddressRegistrationForm /></ProtectedRoute>} />
      <Route path="/my-businesses" element={<ProtectedRoute><MyBusinesses /></ProtectedRoute>} />
      <Route path="/postal" element={<ProtectedRoute><PostalPage /></ProtectedRoute>} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
