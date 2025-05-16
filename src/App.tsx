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
  // Each route must have a unique ID and path
  const appRoutes = [
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
    { id: "employee-legacy", path: "/employee", element: <Navigate to="/employees" replace /> },
    { id: "communications-legacy", path: "/communications", element: <Navigate to="/communication" replace /> },
    { id: "not-found", path: "*", element: <Navigate to="/dashboard" replace /> }
  ];

  // Create a map to ensure only one route per path
  // This will take the first occurrence of each path
  const routeMap = new Map();
  
  // Process each route, only keeping the first one for each path
  appRoutes.forEach(route => {
    const normalizedPath = route.path.split('?')[0]; // Remove query parameters for matching
    if (!routeMap.has(normalizedPath)) {
      routeMap.set(normalizedPath, route);
    }
  });
  
  // Convert the map back to an array of unique routes
  const uniqueRoutes = Array.from(routeMap.values());

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
