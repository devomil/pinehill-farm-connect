
/**
 * Utility functions for enhanced debugging throughout the application
 */

// Control debug levels
export enum DebugLevel {
  OFF = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5
}

// Default to INFO in development, ERROR in production
export const DEFAULT_DEBUG_LEVEL = process.env.NODE_ENV === 'production' 
  ? DebugLevel.ERROR 
  : DebugLevel.INFO;

// Store debug settings per component
const debugSettings: Record<string, DebugLevel> = {};

// Get the effective debug level for a component
export const getDebugLevel = (component: string): DebugLevel => {
  // Check if we have a specific setting for this component
  if (debugSettings[component] !== undefined) {
    return debugSettings[component];
  }
  
  // Check if we have a wildcard setting for parent components
  // e.g. "communication.*" would match "communication.header"
  const wildcardMatches = Object.keys(debugSettings)
    .filter(key => key.endsWith('.*') && component.startsWith(key.slice(0, -2)))
    .sort((a, b) => b.length - a.length); // Sort by specificity (longest first)
  
  if (wildcardMatches.length > 0) {
    return debugSettings[wildcardMatches[0]];
  }
  
  return DEFAULT_DEBUG_LEVEL;
};

// Set debug level for a component
export const setDebugLevel = (component: string, level: DebugLevel): void => {
  debugSettings[component] = level;
  // Store in localStorage for persistence
  try {
    const allSettings = { ...debugSettings };
    localStorage.setItem('debugSettings', JSON.stringify(allSettings));
  } catch (e) {
    console.error('Failed to save debug settings to localStorage:', e);
  }
};

// Load debug settings from localStorage
export const loadDebugSettings = (): void => {
  try {
    const savedSettings = localStorage.getItem('debugSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      Object.keys(parsed).forEach(key => {
        debugSettings[key] = parsed[key] as DebugLevel;
      });
    }
  } catch (e) {
    console.error('Failed to load debug settings from localStorage:', e);
  }
};

// Initialize on import
loadDebugSettings();

// Enhanced console logging with component context
export const debugLog = (
  component: string,
  level: DebugLevel,
  message: string,
  ...args: any[]
): void => {
  const componentLevel = getDebugLevel(component);
  
  if (level <= componentLevel) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${component}] `;
    
    switch (level) {
      case DebugLevel.ERROR:
        console.error(prefix + message, ...args);
        break;
      case DebugLevel.WARN:
        console.warn(prefix + message, ...args);
        break;
      case DebugLevel.INFO:
        console.info(prefix + message, ...args);
        break;
      case DebugLevel.DEBUG:
      case DebugLevel.TRACE:
      default:
        console.log(prefix + message, ...args);
        break;
    }
  }
};

// Convenience methods
export const error = (component: string, message: string, ...args: any[]): void => 
  debugLog(component, DebugLevel.ERROR, message, ...args);

export const warn = (component: string, message: string, ...args: any[]): void => 
  debugLog(component, DebugLevel.WARN, message, ...args);

export const info = (component: string, message: string, ...args: any[]): void => 
  debugLog(component, DebugLevel.INFO, message, ...args);

export const debug = (component: string, message: string, ...args: any[]): void => 
  debugLog(component, DebugLevel.DEBUG, message, ...args);

export const trace = (component: string, message: string, ...args: any[]): void => 
  debugLog(component, DebugLevel.TRACE, message, ...args);

// Component timing measurement
export const measureTime = (
  component: string, 
  operation: string, 
  callback: () => any,
  level: DebugLevel = DebugLevel.DEBUG
): any => {
  const start = performance.now();
  try {
    const result = callback();
    const end = performance.now();
    debugLog(
      component,
      level,
      `Operation "${operation}" completed in ${(end - start).toFixed(2)}ms`
    );
    return result;
  } catch (err) {
    const end = performance.now();
    debugLog(
      component,
      DebugLevel.ERROR,
      `Operation "${operation}" failed after ${(end - start).toFixed(2)}ms`,
      err
    );
    throw err;
  }
};

// Create a debug context for a component
export const createDebugContext = (componentName: string) => {
  return {
    error: (message: string, ...args: any[]) => error(componentName, message, ...args),
    warn: (message: string, ...args: any[]) => warn(componentName, message, ...args),
    info: (message: string, ...args: any[]) => info(componentName, message, ...args),
    debug: (message: string, ...args: any[]) => debug(componentName, message, ...args),
    trace: (message: string, ...args: any[]) => trace(componentName, message, ...args),
    measure: (operation: string, callback: () => any) => measureTime(componentName, operation, callback),
    getDebugLevel: () => getDebugLevel(componentName),
    setDebugLevel: (level: DebugLevel) => setDebugLevel(componentName, level)
  };
};

// React component render count tracker
const componentRenderCounts: Record<string, number> = {};

export const trackRender = (componentName: string): number => {
  componentRenderCounts[componentName] = (componentRenderCounts[componentName] || 0) + 1;
  const count = componentRenderCounts[componentName];
  
  if (count % 10 === 0 || count === 1) { // Log on first render and every 10th render
    debug(componentName, `Component rendered ${count} times`);
  }
  
  return count;
};
