import { useMemo } from 'react';
import { RouteObject } from 'react-router-dom';

/**
 * Hook to ensure routes are unique based on their path or ID
 * @param routes Array of route objects
 * @returns Array of unique route objects
 */
export function useUniqueRoutes<T extends { path?: string; id?: string; to?: string }>(
  routes: T[]
): T[] {
  return useMemo(() => {
    const routeMap = new Map<string, T>();
    
    // Process routes to keep the most recently added one
    // (assuming newer definitions should override older ones)
    routes.forEach(route => {
      // Use the path, to, or id as the unique key, with fallbacks
      const key = route.path || route.to || route.id || '/';
      routeMap.set(key, route);
    });
    
    // Convert back to array
    return Array.from(routeMap.values());
  }, [routes]);
}
