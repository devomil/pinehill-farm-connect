
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
import Employee from "@/pages/Employee";
import Employees from "@/pages/Employees";
import Reports from "@/pages/Reports";
import Communication from "@/pages/Communication";
import { DebugProvider } from "@/contexts/DebugContext";
import { RouteDebugger } from "@/components/debug/RouteDebugger";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Define routes with unique IDs
const appRoutes = [
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/time", element: <TimeManagement /> },
  { path: "/calendar", element: <Navigate to="/time?tab=team-calendar" replace /> },
  { path: "/training", element: <Training /> },
  { path: "/marketing", element: <Marketing /> },
  { path: "/employee", element: <Navigate to="/employees" replace /> },
  { path: "/employees", element: <Employees /> },
  { path: "/reports", element: <Reports /> },
  { path: "/communication", element: <Communication /> },
  
  // Legacy redirects - ensure these don't create navigation loops
  { path: "/communications", element: <Navigate to="/communication" replace /> },
  { path: "*", element: <Navigate to="/dashboard" replace /> }
];

// Create a Set to ensure uniqueness of paths
const uniqueRoutes = Array.from(
  new Map(appRoutes.map(route => [route.path, route])).values()
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <DebugProvider initialDebugMode={false}>
            <Toaster />
            <Routes>
              {uniqueRoutes.map((route) => (
                <Route 
                  key={route.path} 
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
