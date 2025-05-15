import { useMemo } from 'react';

/**
 * Hook to ensure routes are unique based solely on their path (ignoring query parameters)
 * @param routes Array of route objects with at least a path property
 * @returns Array of unique route objects
 */
export function useUniqueRoutes<T extends { path?: string; to?: string; id?: string }>(
  routes: T[]
): T[] {
  return useMemo(() => {
    const routeMap = new Map<string, T>();
    
    // Normalize paths by removing query parameters
    const normalizePath = (path: string): string => path.split('?')[0];
    
    // Process routes to keep only unique paths (most recent definition wins)
    routes.forEach(route => {
      // Determine the path to use as key, normalizing it
      const pathToUse = route.path || route.to || '/';
      const normalizedPath = normalizePath(pathToUse);
      
      // Store in map (overwriting any previous route with same normalized path)
      routeMap.set(normalizedPath, route);
    });
    
    // Convert back to array
    return Array.from(routeMap.values());
  }, [routes]);
}
