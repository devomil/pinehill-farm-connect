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
      // First, try Supabase authentication for real users
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        toast.error(signInError.message);
        return false;
      }
      
      if (!data.user || !data.session) {
        setError("Authentication failed");
        toast.error("Authentication failed");
        return false;
      }
      
      try {
        // Fetch user role from user_roles table
        const { data: userRoleData, error: roleError } = await supabase
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
      } catch (err) {
        console.error("Error processing user data after authentication:", err);
        
        // Fallback with basic user data
        const basicUserData: User = {
          id: data.user.id,
          name: data.user.email?.split('@')[0] || "User",
          email: data.user.email || "",
          role: "employee",
          department: "",
          position: ""
        };
        
        setCurrentUser(basicUserData);
        localStorage.setItem("currentUser", JSON.stringify(basicUserData));
        toast.success("Login successful");
        return true;
      }
    } catch (err: any) {
      console.error("Login error:", err);
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
      // Clear state first to provide immediate feedback
      setCurrentUser(null);
      
      // Clear localStorage
      localStorage.removeItem("currentUser");
      
      // Sign out from Supabase - even if this fails, the user will be logged out of the app
      await supabase.auth.signOut();
      
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      // Even if there's an error with Supabase, ensure the user is logged out locally
      setCurrentUser(null);
      localStorage.removeItem("currentUser");
      toast.error("Error during logout, but you've been logged out");
    } finally {
      setLoading(false);
    }
  };

  return { login, logout, loading };
}
