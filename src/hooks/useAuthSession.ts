
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
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setLoading(false);
          return;
        }
        
        // If no session but we have a stored user, keep using that
        if (!data.session?.user && currentUser) {
          setLoading(false);
          return;
        }
        
        // If no session and no stored user, we're not authenticated
        if (!data.session?.user) {
          setCurrentUser(null); // Ensure currentUser is null when no session exists
          localStorage.removeItem("currentUser"); // Clear localStorage to be safe
          setLoading(false);
          return;
        }
        
        try {
          // Get user role and profile information
          const { data: userRoleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.session.user.id)
            .single();
            
          if (roleError && roleError.code !== "PGRST116") {
            console.error("Error fetching user role:", roleError);
          }
          
          const role = userRoleData?.role || "employee";
          
          const userData: User = {
            id: data.session.user.id,
            name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || "User",
            email: data.session.user.email || "",
            role: role as "employee" | "admin" | "hr" | "manager",
            department: data.session.user.user_metadata?.department || "",
            position: data.session.user.user_metadata?.position || ""
          };
          
          setCurrentUser(userData);
          localStorage.setItem("currentUser", JSON.stringify(userData));
        } catch (err) {
          console.error("Error processing user session:", err);
          
          // Use basic user data as fallback
          if (data.session?.user) {
            const basicUserData: User = {
              id: data.session.user.id,
              name: data.session.user.email?.split('@')[0] || "User",
              email: data.session.user.email || "",
              role: "employee",
              department: "",
              position: ""
            };
            setCurrentUser(basicUserData);
            localStorage.setItem("currentUser", JSON.stringify(basicUserData));
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
        setCurrentUser(null);
        localStorage.removeItem("currentUser");
      } finally {
        setLoading(false);
      }
    };
    
    // Initial session check
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        
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
          console.log("User signed out, clearing state and storage");
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
