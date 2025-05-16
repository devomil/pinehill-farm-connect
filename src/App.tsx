
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext"; 
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import TimeManagement from "@/pages/TimeManagement";
import Calendar from "@/pages/Calendar";
import Training from "@/pages/Training";
import Marketing from "@/pages/Marketing";
import Employees from "@/pages/Employees";
import Reports from "@/pages/Reports";
import Communication from "@/pages/Communication";
import { DebugProvider } from "@/contexts/DebugContext";
import { RouteDebugger } from "@/components/debug/RouteDebugger";
import Index from "@/pages/Index";
import { useUniqueRoutes } from "@/hooks/useUniqueRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  // Define routes with unique IDs and paths
  // Primary routes first, followed by legacy redirects
  const appRoutes = [
    // Primary routes - these are the canonical routes users should use
    { id: "index", path: "/", element: <Index /> },
    { id: "login", path: "/login", element: <Login /> },
    { id: "dashboard", path: "/dashboard", element: <Dashboard /> },
    { id: "time", path: "/time", element: <TimeManagement /> },
    { id: "calendar", path: "/calendar", element: <Navigate to="/time?tab=team-calendar" replace /> },
    { id: "training", path: "/training", element: <Training /> },
    { id: "marketing", path: "/marketing", element: <Marketing /> },
    { id: "employees", path: "/employees", element: <Employees /> },
    { id: "reports", path: "/reports", element: <Reports /> },
    { id: "communication", path: "/communication", element: <Communication /> },
    
    // Legacy redirects - these will redirect old URLs to the new ones
    // These MUST come after the primary routes to ensure they don't override
    { id: "communications-legacy", path: "/communications", element: <Navigate to="/communication" replace /> },
    
    // Catch-all route
    { id: "not-found", path: "*", element: <Navigate to="/dashboard" replace /> }
  ];
  
  // Use our utility hook to ensure unique routes
  const uniqueRoutes = useUniqueRoutes(appRoutes);
  
  // For debugging - log all routes that will be rendered
  console.log("Rendering routes:", uniqueRoutes.map(r => ({ id: r.id, path: r.path })));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <DebugProvider initialDebugMode={false}>
            <Toaster />
            <Routes>
              {uniqueRoutes.map((route) => (
                <Route 
                  key={route.id} 
                  path={route.path} 
                  element={route.element} 
                />
              ))}
            </Routes>
            <RouteDebugger />
          </DebugProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
