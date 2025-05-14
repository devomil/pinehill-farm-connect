
import React, { useState } from "react";

interface ShiftCoverageErrorDebugPanelProps {
  error: any;
}

export const ShiftCoverageErrorDebugPanel: React.FC<ShiftCoverageErrorDebugPanelProps> = ({
  error
}) => {
  const [showDebug, setShowDebug] = useState(false);
  
  if (!error) return null;
  
  return (
    <div className="mt-4 text-left">
      <button
        className="text-xs text-muted-foreground hover:text-foreground text-left"
        onClick={() => setShowDebug(!showDebug)}
      >
        {showDebug ? "Hide" : "Show"} Debug Info
      </button>
      
      {showDebug && (
        <pre className="mt-2 p-3 bg-muted text-xs rounded-md overflow-auto max-h-[200px]">
          {JSON.stringify(error, null, 2)}
        </pre>
      )}
    </div>
  );
};
