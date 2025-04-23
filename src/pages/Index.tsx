
// Redirect to login page
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Index page - isAuthenticated:", isAuthenticated);
    console.log("Index page - currentUser:", currentUser);
    
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, currentUser, navigate]);

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />;
};

export default Index;
