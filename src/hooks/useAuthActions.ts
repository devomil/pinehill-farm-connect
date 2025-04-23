
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
        toast.error(signInError.message);
        return false;
      }
      
      if (!data.session) {
        setError("Failed to authenticate");
        toast.error("Failed to authenticate");
        return false;
      }
      
      // Get user role and data
      const { data: userRoleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();
      
      const role = userRoleData?.role || "employee";
      
      const userData: User = {
        id: data.user.id,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || "User",
        email: data.user.email || "",
        role: role as "employee" | "admin" | "hr" | "manager",
        department: data.user.user_metadata?.department || "",
        position: data.user.user_metadata?.position || ""
      };
      
      setCurrentUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      toast.success("Login successful");
      return true;
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      toast.error(err.message || "An error occurred during login");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Clear localStorage first
      localStorage.removeItem("currentUser");
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear state last
      setCurrentUser(null);
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Failed to log out");
    } finally {
      setLoading(false);
    }
  };

  return { login, logout, loading };
}
