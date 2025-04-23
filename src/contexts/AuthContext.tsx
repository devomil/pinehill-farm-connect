
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session) {
          // Get user role and profile information
          const { data: userRoleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .single();
            
          if (roleError && roleError.code !== "PGRST116") {
            console.error("Error fetching user role:", roleError);
          }
          
          const role = userRoleData?.role || "employee";
          
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
            email: session.user.email || "",
            role: role as "employee" | "admin" | "hr" | "manager",
            department: session.user.user_metadata?.department || "",
            position: session.user.user_metadata?.position || ""
          };
          
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial session check
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user role
          const { data: userRoleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .single();
          
          const role = userRoleData?.role || "employee";
          
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
            email: session.user.email || "",
            role: role as "employee" | "admin" | "hr" | "manager",
            department: session.user.user_metadata?.department || "",
            position: session.user.user_metadata?.position || ""
          };
          
          setCurrentUser(userData);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, allow logging in with our mock users
      if (email === "admin@pinehillfarm.co" && password.length > 0) {
        const mockUser = {
          id: "1",
          name: "Admin User",
          email: "admin@pinehillfarm.co",
          role: "admin",
          department: "Management",
          position: "Farm Manager"
        };
        setCurrentUser(mockUser);
        localStorage.setItem("currentUser", JSON.stringify(mockUser));
        setLoading(false);
        toast.success("Login successful");
        return true;
      }
      
      if (email === "john@pinehillfarm.co" && password.length > 0) {
        const mockUser = {
          id: "2",
          name: "John Employee",
          email: "john@pinehillfarm.co",
          role: "employee",
          department: "Operations",
          position: "Field Worker"
        };
        setCurrentUser(mockUser);
        localStorage.setItem("currentUser", JSON.stringify(mockUser));
        setLoading(false);
        toast.success("Login successful");
        return true;
      }
      
      // Actual Supabase login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return false;
      }
      
      if (!data.session) {
        setError("Failed to authenticate");
        setLoading(false);
        return false;
      }
      
      toast.success("Login successful");
      return true;
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      setLoading(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      localStorage.removeItem("currentUser");
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to log out");
    }
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
