
import React, { createContext, useContext, useEffect } from "react";
import { User } from "@/types";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAuthActions } from "@/hooks/useAuthActions";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, setCurrentUser, loading: sessionLoading, error, setError } = useAuthSession();
  const { login, logout, loading: actionLoading } = useAuthActions(setCurrentUser, setError);

  // Debug log for authentication status
  useEffect(() => {
    console.log("AuthProvider - Authentication status:", currentUser ? "Authenticated" : "Not authenticated");
    console.log("AuthProvider - Current user:", currentUser);
  }, [currentUser]);

  const value = {
    currentUser,
    loading: sessionLoading || actionLoading,
    error,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
