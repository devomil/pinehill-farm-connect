
import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import TimeManagement from "./pages/TimeManagement";
import Calendar from "./pages/Calendar";
import Communication from "./pages/Communication";
import Reports from "./pages/Reports";
import Training from "./pages/Training";
import AdminTraining from "./pages/AdminTraining";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Index />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/employees",
      element: <Employees />,
    },
    {
      path: "/time",
      element: <TimeManagement />,
    },
    {
      path: "/calendar",
      element: <Calendar />,
    },
    {
      path: "/communication",
      element: <Communication />,
    },
    {
      path: "/reports",
      element: <Reports />,
    },
    {
      path: "/training",
      element: <Training />,
    },
    {
      path: "/admin-training",
      element: <AdminTraining />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
    // Redirecting old communications route to communication
    {
      path: "/communications",
      element: <Navigate to="/communication?tab=messages" replace />,
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
