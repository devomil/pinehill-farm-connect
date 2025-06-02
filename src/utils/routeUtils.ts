
/**
 * Utility functions for route management and validation
 */

export interface RouteConfig {
  path: string;
  component: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  deprecated?: boolean;
}

// Comprehensive list of all valid routes (no duplicates)
export const APP_ROUTES: RouteConfig[] = [
  { path: "/", component: "Navigate", requiresAuth: false },
  { path: "/login", component: "LoginPage", requiresAuth: false },
  { path: "/dashboard", component: "DashboardPage", requiresAuth: true },
  { path: "/communication", component: "CommunicationPage", requiresAuth: true },
  { path: "/time", component: "TimeManagementPage", requiresAuth: true },
  { path: "/employees", component: "EmployeePage", requiresAuth: true, requiresAdmin: true },
  { path: "/marketing", component: "MarketingPage", requiresAuth: true },
  { path: "/training", component: "TrainingPage", requiresAuth: true },
  { path: "/admin-training", component: "AdminTrainingPage", requiresAuth: true, requiresAdmin: true },
  { path: "/reports", component: "ReportsPage", requiresAuth: true },
  { path: "/diagnostics", component: "GlobalDiagnosticsPage", requiresAuth: true },
  // Deprecated routes - these should redirect
  { path: "/communications", component: "CommunicationPage", deprecated: true },
  { path: "/calendar", component: "TimeManagementPage", deprecated: true },
  { path: "/time-management", component: "TimeManagementPage", deprecated: true }
];

/**
 * Get active routes (non-deprecated) with deduplication
 */
export function getActiveRoutes(): RouteConfig[] {
  const activeRoutes = APP_ROUTES.filter(route => !route.deprecated);
  
  // Deduplicate by path
  const uniqueRoutes = new Map<string, RouteConfig>();
  activeRoutes.forEach(route => {
    if (!uniqueRoutes.has(route.path)) {
      uniqueRoutes.set(route.path, route);
    }
  });
  
  return Array.from(uniqueRoutes.values());
}

/**
 * Check if a route is deprecated
 */
export function isDeprecatedRoute(path: string): boolean {
  const route = APP_ROUTES.find(r => r.path === path);
  return route?.deprecated || false;
}

/**
 * Get redirect for deprecated routes
 */
export function getRedirectForDeprecatedRoute(path: string): string | null {
  switch (path) {
    case "/communications":
      return "/communication";
    case "/calendar":
      return "/time?tab=team-calendar";
    case "/time-management":
      return "/time";
    default:
      return null;
  }
}

/**
 * Validate if user has access to route
 */
export function hasRouteAccess(
  route: RouteConfig, 
  isAuthenticated: boolean, 
  isAdmin: boolean
): boolean {
  if (route.requiresAuth && !isAuthenticated) {
    return false;
  }
  
  if (route.requiresAdmin && !isAdmin) {
    return false;
  }
  
  return true;
}

/**
 * Validate and clean navigation paths
 */
export function validateNavigationPaths(paths: string[]): string[] {
  const validPaths = getActiveRoutes().map(route => route.path);
  const uniquePaths = [...new Set(paths)]; // Remove duplicates
  
  return uniquePaths.filter(path => {
    const basePath = path.split('?')[0];
    const isValid = validPaths.includes(basePath);
    
    if (!isValid) {
      console.warn(`Invalid navigation path detected: ${path}`);
    }
    
    return isValid;
  });
}
