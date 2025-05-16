
import React from "react";
import { Navigate } from "react-router-dom";

// This component redirects from the legacy /employee route to the new /employees route
const Employee = () => {
  return <Navigate to="/employees" replace />;
};

export default Employee;
