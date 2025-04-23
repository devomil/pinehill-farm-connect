
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
    console.log("Login attempt for:", email);
    
    try {
      // First, try Supabase authentication for real users
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Supabase auth error:", signInError);
        setError(signInError.message);
        toast.error(signInError.message);
        return false;
      }
      
      console.log("Supabase auth response:", data);
      
      if (!data.user || !data.session) {
        console.error("Authentication failed - no user or session returned");
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
        
        if (roleError && roleError.code !== "PGRST116") {
          console.error("Error fetching user role:", roleError);
        }
        
        const role = userRoleData?.role || "employee";
        console.log("User role:", role);
        
        const userData: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || "User",
          email: data.user.email || "",
          role: role as "employee" | "admin" | "hr" | "manager",
          department: data.user.user_metadata?.department || "",
          position: data.user.user_metadata?.position || ""
        };
        
        console.log("Setting user data:", userData);
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
        
        console.log("Setting fallback user data:", basicUserData);
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
    console.log("Logout initiated");
    
    try {
      // Clear state first to provide immediate feedback
      setCurrentUser(null);
      console.log("User state cleared");
      
      // Clear localStorage
      localStorage.removeItem("currentUser");
      console.log("Local storage cleared");
      
      // Sign out from Supabase - even if this fails, the user will be logged out of the app
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Supabase signOut error:", error);
        toast.error("Error during logout, but you've been logged out locally");
      } else {
        console.log("Supabase signOut successful");
        toast.success("Logged out successfully");
      }
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
