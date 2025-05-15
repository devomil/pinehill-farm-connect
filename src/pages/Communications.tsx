
import React, { useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";

export default function Communications() {
  const location = useLocation();
  
  useEffect(() => {
    console.log("Communications legacy page loaded, redirecting to /communication");
  }, [location]);
  
  // Automatically redirect to the new route
  return <Navigate to="/communication" replace />;
}
