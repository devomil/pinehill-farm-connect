
import { useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useAuthSession() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // First check for user in localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("currentUser");
      }
    }
    
    // Check for existing session on load
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
        
        if (session?.user) {
          try {
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
            localStorage.setItem("currentUser", JSON.stringify(userData));
          } catch (err) {
            console.error("Error processing user session:", err);
          }
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
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Get user role
            const { data: userRoleData, error: roleError } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .single();
            
            if (roleError && roleError.code !== "PGRST116") {
              console.error("Error fetching user role on auth state change:", roleError);
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
            localStorage.setItem("currentUser", JSON.stringify(userData));
          } catch (err) {
            console.error("Error processing auth state change:", err);
            // Use basic user data as fallback
            if (session?.user) {
              const basicUserData: User = {
                id: session.user.id,
                name: session.user.email?.split('@')[0] || "User",
                email: session.user.email || "",
                role: "employee",
                department: "",
                position: ""
              };
              setCurrentUser(basicUserData);
              localStorage.setItem("currentUser", JSON.stringify(basicUserData));
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem("currentUser");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { currentUser, setCurrentUser, loading, error, setError };
}
