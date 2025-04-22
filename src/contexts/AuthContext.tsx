
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";

// Mock users for development purposes
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@pinehillfarm.co",
    role: "admin",
    department: "Management",
    position: "Farm Manager"
  },
  {
    id: "2",
    name: "John Employee",
    email: "john@pinehillfarm.co",
    role: "employee",
    department: "Operations",
    position: "Field Worker"
  },
  {
    id: "3",
    name: "Sarah Johnson",
    email: "sarah@pinehillfarm.co",
    role: "employee",
    department: "Retail",
    position: "Sales Associate"
  }
];

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on load
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For demo, we're using mock data
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        setError("User not found");
        setLoading(false);
        return false;
      }
      
      // In real app, we'd verify password here
      // For demo, any password works
      
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      setLoading(false);
      return true;
    } catch (err) {
      setError("An error occurred during login");
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const value = {
    currentUser,
    loading,
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
