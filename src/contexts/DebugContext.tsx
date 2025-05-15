
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DebugLevel } from '@/utils/debugUtils';

interface DebugContextType {
  debugMode: boolean;
  setDebugMode: (mode: boolean) => void;
  debugComponents: Record<string, boolean>;
  toggleComponentDebug: (componentName: string) => void;
  logLevel: DebugLevel;
  setLogLevel: (level: DebugLevel) => void;
  debugLog: (component: string, message: string, data?: any) => void;
  capturedLogs: Array<{component: string, message: string, data: any, timestamp: Date}>;
  clearLogs: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const useDebugContext = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebugContext must be used within a DebugProvider');
  }
  return context;
};

interface DebugProviderProps {
  children: React.ReactNode;
  initialDebugMode?: boolean;
}

export const DebugProvider: React.FC<DebugProviderProps> = ({ 
  children,
  initialDebugMode = false
}) => {
  // Load persisted debug settings from localStorage
  const loadPersistedSettings = () => {
    try {
      const persistedDebugMode = localStorage.getItem('debugMode');
      const persistedComponents = localStorage.getItem('debugComponents');
      const persistedLogLevel = localStorage.getItem('debugLogLevel');
      
      return {
        debugMode: persistedDebugMode ? JSON.parse(persistedDebugMode) : initialDebugMode,
        debugComponents: persistedComponents ? JSON.parse(persistedComponents) : {},
        logLevel: persistedLogLevel ? Number(persistedLogLevel) : DebugLevel.INFO
      };
    } catch (error) {
      console.error('Failed to load debug settings:', error);
      return {
        debugMode: initialDebugMode,
        debugComponents: {},
        logLevel: DebugLevel.INFO
      };
    }
  };

  const { debugMode: initialMode, debugComponents: initialComponents, logLevel: initialLogLevel } = loadPersistedSettings();
  
  const [debugMode, setDebugModeState] = useState<boolean>(initialMode);
  const [debugComponents, setDebugComponents] = useState<Record<string, boolean>>(initialComponents);
  const [logLevel, setLogLevelState] = useState<DebugLevel>(initialLogLevel);
  const [capturedLogs, setCapturedLogs] = useState<Array<{component: string, message: string, data: any, timestamp: Date}>>([]);

  // Persist debug settings to localStorage
  const persistDebugSettings = useCallback(() => {
    try {
      localStorage.setItem('debugMode', JSON.stringify(debugMode));
      localStorage.setItem('debugComponents', JSON.stringify(debugComponents));
      localStorage.setItem('debugLogLevel', String(logLevel));
    } catch (error) {
      console.error('Failed to persist debug settings:', error);
    }
  }, [debugMode, debugComponents, logLevel]);

  // Update debug settings and persist them
  const setDebugMode = useCallback((mode: boolean) => {
    setDebugModeState(mode);
  }, []);

  const setLogLevel = useCallback((level: DebugLevel) => {
    setLogLevelState(level);
  }, []);

  const toggleComponentDebug = useCallback((componentName: string) => {
    setDebugComponents(prev => ({
      ...prev,
      [componentName]: !prev[componentName]
    }));
  }, []);

  const debugLog = useCallback((component: string, message: string, data: any = null) => {
    if (!debugMode) return;
    
    const logEntry = {
      component,
      message,
      data,
      timestamp: new Date()
    };
    
    // Add to captured logs
    setCapturedLogs(prev => [logEntry, ...prev.slice(0, 99)]); // Keep last 100 logs
    
    // Also log to console
    console.log(`[DEBUG/${component}]`, message, data);
  }, [debugMode]);

  const clearLogs = useCallback(() => {
    setCapturedLogs([]);
  }, []);

  // Persist settings when they change
  useEffect(() => {
    persistDebugSettings();
  }, [debugMode, debugComponents, logLevel, persistDebugSettings]);

  const contextValue = {
    debugMode,
    setDebugMode,
    debugComponents,
    toggleComponentDebug,
    logLevel,
    setLogLevel,
    debugLog,
    capturedLogs,
    clearLogs
  };

  return (
    <DebugContext.Provider value={contextValue}>
      {children}
    </DebugContext.Provider>
  );
};
