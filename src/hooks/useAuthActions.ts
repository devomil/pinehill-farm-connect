
import { useState } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthActions(
  setCurrentUser: (user: User | null) => void,
  setError: (error: string | null) => void
) {
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, allow logging in with our mock users
      if (email === "admin@pinehillfarm.co" && password.length > 0) {
        const mockUser: User = {
          id: "1",
          name: "Admin User",
          email: "admin@pinehillfarm.co",
          role: "admin",
          department: "Management",
          position: "Farm Manager"
        };
        setCurrentUser(mockUser);
        localStorage.setItem("currentUser", JSON.stringify(mockUser));
        toast.success("Login successful");
        return true;
      }
      
      if (email === "john@pinehillfarm.co" && password.length > 0) {
        const mockUser: User = {
          id: "2",
          name: "John Employee",
          email: "john@pinehillfarm.co",
          role: "employee",
          department: "Operations",
          position: "Field Worker"
        };
        setCurrentUser(mockUser);
        localStorage.setItem("currentUser", JSON.stringify(mockUser));
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
        return false;
      }
      
      if (!data.session) {
        setError("Failed to authenticate");
        return false;
      }
      
      toast.success("Login successful");
      return true;
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      return false;
    } finally {
      setLoading(false);
    }
  };

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

  return { login, logout, loading };
}
