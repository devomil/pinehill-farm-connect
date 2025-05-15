
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Toaster />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/time" element={<TimeManagement />} />
            <Route path="/calendar" element={<Navigate to="/time?tab=team-calendar" replace />} />
            <Route path="/training" element={<Training />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/employee" element={<Navigate to="/employees" replace />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/communication" element={<Communication />} />
            
            {/* Legacy redirects - ensure these don't create navigation loops */}
            <Route path="/communications" element={<Navigate to="/communication" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
