
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
  // Deprecated routes
  { path: "/communications", component: "CommunicationPage", deprecated: true },
  { path: "/calendar", component: "TimeManagementPage", deprecated: true },
  { path: "/time-management", component: "TimeManagementPage", deprecated: true }
];

/**
 * Get active routes (non-deprecated)
 */
export function getActiveRoutes(): RouteConfig[] {
  return APP_ROUTES.filter(route => !route.deprecated);
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
