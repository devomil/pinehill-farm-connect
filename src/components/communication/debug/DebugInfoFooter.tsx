
import React from "react";

interface DebugInfoFooterProps {
  expanded: boolean;
}

export const DebugInfoFooter: React.FC<DebugInfoFooterProps> = ({ expanded }) => {
  return (
    <div className="text-xs text-muted-foreground mt-2">
      {expanded ? (
        <>
          <p>Navigation history is tracked to ensure proper tab selection based on URL parameters.</p>
          <p className="mt-1">If you keep getting kicked out of Messages tab, try these steps:</p>
          <ol className="list-decimal pl-4 mt-1">
            <li>Use the "Fix Navigation Loop" button in the UI</li>
            <li>Try adding "?recovery=true" to the URL</li>
            <li>Check browser console for specific errors</li>
          </ol>
        </>
      ) : (
        "Navigation history is tracked to ensure proper tab selection based on URL parameters."
      )}
    </div>
  );
};
