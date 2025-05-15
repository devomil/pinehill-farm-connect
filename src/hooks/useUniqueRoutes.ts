import { useMemo } from 'react';
import { RouteObject } from 'react-router-dom';

/**
 * Hook to ensure routes are unique based on their path
 * @param routes Array of route objects
 * @returns Array of unique route objects
 */
export function useUniqueRoutes(routes: RouteObject[]): RouteObject[] {
  return useMemo(() => {
    const routeMap: Record<string, RouteObject> = {};
    
    // Process routes in reverse to keep the most recently added one
    // (assuming newer definitions should override older ones)
    [...routes].reverse().forEach(route => {
      // Use the path as the unique key
      const key = route.path || '/';
      if (!routeMap[key]) {
        routeMap[key] = route;
      }
    });
    
    // Convert back to array and restore original order
    return Object.values(routeMap).reverse();
  }, [routes]);
}
