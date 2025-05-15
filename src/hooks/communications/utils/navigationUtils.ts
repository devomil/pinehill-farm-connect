
/**
 * Utility functions for navigation handling in the communication system
 */

/**
 * Creates a debounced version of a function that will delay execution until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function createDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = window.setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait) as unknown as number;
  };
}

/**
 * Checks if the URL indicates recovery mode
 */
export function isInRecoveryMode(search: string): boolean {
  const urlParams = new URLSearchParams(search);
  return urlParams.get('recovery') === 'true';
}

/**
 * Builds URL path for tab navigation
 */
export function buildTabPath(value: string): string {
  return value === "messages" 
    ? '/communication?tab=messages' 
    : '/communication';
}

/**
 * Builds recovery URL path with recovery parameter
 */
export function buildRecoveryPath(value: string): string {
  return value === "messages" 
    ? '/communication?tab=messages&recovery=true' 
    : '/communication?recovery=true';
}
