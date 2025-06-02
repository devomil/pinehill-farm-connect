
/**
 * Enhanced route utilities with strict deduplication
 */

export interface RouteConfig {
  path: string;
  component: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  deprecated?: boolean;
}

// Definitive list of valid routes (no duplicates allowed)
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
 * Get active routes (non-deprecated) with ultra-strict deduplication
 */
export function getActiveRoutes(): RouteConfig[] {
  console.log('getActiveRoutes: Starting route processing');
  
  const activeRoutes = APP_ROUTES.filter(route => !route.deprecated);
  console.log(`getActiveRoutes: Found ${activeRoutes.length} active routes`);
  
  // Ultra-strict deduplication by path
  const uniqueRoutes = new Map<string, RouteConfig>();
  const duplicates: string[] = [];
  
  activeRoutes.forEach(route => {
    const normalizedPath = route.path.toLowerCase().trim();
    if (uniqueRoutes.has(normalizedPath)) {
      duplicates.push(`Duplicate route: ${route.path}`);
    } else {
      uniqueRoutes.set(normalizedPath, route);
    }
  });
  
  if (duplicates.length > 0) {
    console.error('getActiveRoutes: Duplicates found:', duplicates);
  }
  
  const result = Array.from(uniqueRoutes.values());
  console.log(`getActiveRoutes: Final unique routes: ${result.length}`);
  
  return result;
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
 * Ultra-strict navigation path validation and deduplication
 */
export function validateNavigationPaths(paths: string[]): string[] {
  console.log(`validateNavigationPaths: Processing ${paths.length} paths`);
  
  const validPaths = getActiveRoutes().map(route => route.path);
  const pathSet = new Set<string>();
  const validatedPaths: string[] = [];
  
  paths.forEach(path => {
    const basePath = path.split('?')[0].toLowerCase().trim();
    
    // Check if path is valid
    if (!validPaths.includes(basePath)) {
      console.warn(`validateNavigationPaths: Invalid path detected: ${path}`);
      return;
    }
    
    // Check for duplicates
    if (pathSet.has(basePath)) {
      console.warn(`validateNavigationPaths: Duplicate path detected: ${path}`);
      return;
    }
    
    pathSet.add(basePath);
    validatedPaths.push(path);
  });
  
  console.log(`validateNavigationPaths: Validated ${validatedPaths.length} unique paths`);
  return validatedPaths;
}

/**
 * Debug function to analyze navigation duplicates
 */
export function debugNavigationDuplicates(items: any[]): void {
  console.log('=== NAVIGATION DUPLICATE ANALYSIS ===');
  
  const pathMap = new Map<string, any[]>();
  const idMap = new Map<string, any[]>();
  
  items.forEach((item, index) => {
    const path = item.path?.split('?')[0].toLowerCase() || 'no-path';
    const id = item.id || `no-id-${index}`;
    
    // Track paths
    if (!pathMap.has(path)) {
      pathMap.set(path, []);
    }
    pathMap.get(path)!.push({ ...item, originalIndex: index });
    
    // Track IDs
    if (!idMap.has(id)) {
      idMap.set(id, []);
    }
    idMap.get(id)!.push({ ...item, originalIndex: index });
  });
  
  // Report path duplicates
  pathMap.forEach((items, path) => {
    if (items.length > 1) {
      console.warn(`Path duplicate: ${path}`, items);
    }
  });
  
  // Report ID duplicates
  idMap.forEach((items, id) => {
    if (items.length > 1) {
      console.warn(`ID duplicate: ${id}`, items);
    }
  });
  
  console.log('=== END NAVIGATION ANALYSIS ===');
}
