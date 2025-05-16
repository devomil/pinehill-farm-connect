
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
    // Create a map to store unique routes
    const routeMap = new Map<string, T>();
    
    // List of deprecated paths that should be excluded
    const deprecatedPaths = ['/communications', '/calendar'];
    
    // Normalize paths by removing query parameters
    const normalizePath = (path: string): string => {
      // Handle undefined paths
      if (!path) return '/';
      
      // Remove query parameters and trailing slashes for matching
      return path.split('?')[0].replace(/\/+$/, '') || '/';
    };
    
    // Process routes to keep only unique normalized paths
    // Preserve the canonical route (usually the one with the shorter path)
    routes.forEach(route => {
      // Determine the path to use as key
      const pathToUse = route.path || route.to || '/';
      const normalizedPath = normalizePath(pathToUse);
      
      // Skip deprecated routes - explicit check
      if (deprecatedPaths.includes(normalizedPath)) {
        console.log(`Skipping deprecated route: ${normalizedPath}`);
        return;
      }
      
      // Only add if not already in the map, or if this is a "primary" route 
      // (routes with simple path are preferred over longer ones with the same base)
      if (!routeMap.has(normalizedPath) || 
          (route.id && !route.id.includes('legacy') && routeMap.get(normalizedPath)?.id?.includes('legacy'))) {
        routeMap.set(normalizedPath, route);
      }
    });
    
    // Convert back to array
    return Array.from(routeMap.values());
  }, [routes]);
}
