
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import CommunicationPage from '@/components/communication/CommunicationPage';
import { GlobalDiagnosticsPage } from '@/components/debug/GlobalDiagnosticsPage';
import TimeManagementPage from '@/pages/TimeManagementPage';
import EmployeePage from '@/pages/EmployeePage';
import MarketingPage from '@/pages/MarketingPage';
import TrainingPage from '@/pages/TrainingPage';
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
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            <Toaster />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <RequireAuth>
                    <DashboardLayout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/communication" element={<CommunicationPage />} />
                        <Route path="/diagnostics" element={<GlobalDiagnosticsPage />} />
                        <Route path="/time-management" element={<TimeManagementPage />} />
                        <Route path="/employees" element={<EmployeePage />} />
                        <Route path="/marketing" element={<MarketingPage />} />
                        <Route path="/training" element={<TrainingPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                      </Routes>
                    </DashboardLayout>
                  </RequireAuth>
                }
              />
            </Routes>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
