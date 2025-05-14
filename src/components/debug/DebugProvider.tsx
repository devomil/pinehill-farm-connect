
import React, { createContext, useState, useContext, useEffect } from 'react';
import { DebugPanel } from './DebugPanel';
import { DebugLevel } from '@/utils/debugUtils';

interface DebugContextType {
  showDebugPanel: boolean;
  toggleDebugPanel: () => void;
  setDebugLevel: (component: string, level: DebugLevel) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const useDebugContext = () => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebugContext must be used within a DebugProvider');
  }
  return context;
};

interface DebugProviderProps {
  children: React.ReactNode;
  initiallyOpen?: boolean;
}

export const DebugProvider: React.FC<DebugProviderProps> = ({ 
  children,
  initiallyOpen = false
}) => {
  const [showDebugPanel, setShowDebugPanel] = useState(initiallyOpen);

  // Listen for keyboard shortcut (Ctrl+Shift+D) to toggle debug panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyD') {
        event.preventDefault();
        setShowDebugPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDebugPanel = () => {
    setShowDebugPanel(prev => !prev);
  };

  const contextValue: DebugContextType = {
    showDebugPanel,
    toggleDebugPanel,
    setDebugLevel: (component, level) => {
      // Implementation provided by debugUtils
    }
  };

  return (
    <DebugContext.Provider value={contextValue}>
      {children}
      {showDebugPanel && <DebugPanel open={showDebugPanel} onClose={toggleDebugPanel} />}
    </DebugContext.Provider>
  );
};
