
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { DebugProvider } from '@/contexts/DebugContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import Communication from '@/pages/Communication';
import { GlobalDiagnosticsPage } from '@/components/debug/GlobalDiagnosticsPage';
import TimeManagementPage from '@/pages/TimeManagementPage';
import EmployeePage from '@/pages/EmployeePage';
import MarketingPage from '@/pages/MarketingPage';
import TrainingPage from '@/pages/TrainingPage';
import AdminTrainingPage from '@/pages/AdminTrainingPage';
import ReportsPage from '@/pages/ReportsPage';
import './App.css';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <DebugProvider>
            <ThemeProvider defaultTheme="light" storageKey="ui-theme">
              <Toaster />
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/*"
                  element={
                    <RequireAuth>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        {/* Communication page renders without DashboardLayout to eliminate left padding */}
                        <Route path="/communication" element={<Communication />} />
                        <Route path="/diagnostics" element={<GlobalDiagnosticsPage />} />
                        <Route path="/time" element={<TimeManagementPage />} />
                        <Route path="/employees" element={<EmployeePage />} />
                        <Route path="/marketing" element={<MarketingPage />} />
                        <Route path="/training" element={<TrainingPage />} />
                        <Route path="/admin-training" element={<AdminTrainingPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                      </Routes>
                    </RequireAuth>
                  }
                />
              </Routes>
            </ThemeProvider>
          </DebugProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
