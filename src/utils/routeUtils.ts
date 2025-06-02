
/**
 * Clean route utilities with only essential routes
 */

export interface RouteConfig {
  path: string;
  component: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

// Clean list of only 10 essential routes - no duplicates
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
  { path: "/diagnostics", component: "GlobalDiagnosticsPage", requiresAuth: true }
];

/**
 * Get all active routes
 */
export function getActiveRoutes(): RouteConfig[] {
  return APP_ROUTES;
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
 * Simple navigation path validation
 */
export function validateNavigationPaths(paths: string[]): string[] {
  const validPaths = getActiveRoutes().map(route => route.path);
  return paths.filter(path => {
    const basePath = path.split('?')[0].toLowerCase().trim();
    return validPaths.includes(basePath);
  });
}
