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
  const appRoutes = [
    { id: "home", path: "/", element: <Navigate to="/login" replace /> },
    { id: "login", path: "/login", element: <Login /> },
    { id: "dashboard", path: "/dashboard", element: <Dashboard /> },
    { id: "time", path: "/time", element: <TimeManagement /> },
    { id: "calendar", path: "/calendar", element: <Navigate to="/time?tab=team-calendar" replace /> },
    { id: "training", path: "/training", element: <Training /> },
    { id: "marketing", path: "/marketing", element: <Marketing /> },
    { id: "employees", path: "/employees", element: <Employees /> },
    { id: "reports", path: "/reports", element: <Reports /> },
    { id: "communication", path: "/communication", element: <Communication /> },
    
    // Legacy redirects - keep these at the end so they don't override active routes
    { id: "employee-legacy", path: "/employee", element: <Navigate to="/employees" replace /> },
    { id: "communications-legacy", path: "/communications", element: <Navigate to="/communication" replace /> },
    { id: "not-found", path: "*", element: <Navigate to="/dashboard" replace /> }
  ];

  // Use our updated hook for route deduplication
  const uniqueRoutes = useUniqueRoutes(appRoutes);

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
