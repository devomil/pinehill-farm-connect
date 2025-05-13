import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import TimeManagement from "@/pages/TimeManagement";
import Calendar from "@/pages/Calendar";
import Training from "@/pages/Training";
import Marketing from "@/pages/Marketing";
import Employee from "@/pages/Employee";
import Reports from "@/pages/Reports";
import Communications from "@/pages/Communications";
import Communication from "@/pages/Communication";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
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
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/training" element={<Training />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/employee" element={<Employee />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/communication" element={<Communication />} />
            {/* Keep the legacy route for backward compatibility */}
            <Route path="/communications" element={<Communications />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
