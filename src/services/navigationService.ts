
import { useNavigate } from "react-router-dom";
import { NavItem } from "@/config/navConfig";

/**
 * Centralized navigation service for handling all navigation logic
 */
export class NavigationService {
  private static navigate: ReturnType<typeof useNavigate> | null = null;

  static setNavigate(navigateFn: ReturnType<typeof useNavigate>) {
    this.navigate = navigateFn;
  }

  // Dashboard navigation handlers
  static navigateToTimeOff() {
    this.navigate?.("/time?tab=my-requests");
  }

  static navigateToTraining() {
    this.navigate?.("/training");
  }

  static navigateToAnnouncements() {
    this.navigate?.("/communication?tab=announcements");
  }

  static navigateToCalendar() {
    this.navigate?.("/time?tab=team-calendar");
  }

  static navigateToAdminTimeOff() {
    this.navigate?.("/time?tab=pending-approvals");
  }

  static navigateToSchedule() {
    this.navigate?.("/time?tab=work-schedules");
  }

  static navigateToMarketing() {
    this.navigate?.("/marketing");
  }

  // Route validation with normalized paths
  static isValidRoute(path: string): boolean {
    const validRoutes = [
      '/dashboard',
      '/communication',
      '/time',
      '/employees',
      '/marketing',
      '/training',
      '/admin-training',
      '/reports',
      '/diagnostics'
    ];
    
    const basePath = path.split('?')[0].toLowerCase();
    return validRoutes.includes(basePath);
  }

  // Filter deprecated routes
  static filterDeprecatedRoutes<T extends { path?: string; to?: string }>(items: T[]): T[] {
    const deprecatedPaths = ['/communications', '/calendar', '/time-management'];
    
    return items.filter(item => {
      const pathToCheck = item.path || item.to || '';
      const basePath = pathToCheck.split('?')[0].toLowerCase();
      const isDeprecated = deprecatedPaths.includes(basePath);
      
      if (isDeprecated) {
        console.log(`NavigationService: Filtering out deprecated route: ${basePath}`);
      }
      
      return !isDeprecated;
    });
  }

  // Strict deduplication by both path and ID with enhanced logging
  static deduplicateNavItems(items: NavItem[]): NavItem[] {
    console.log(`NavigationService: Starting deduplication of ${items.length} items`);
    
    const pathMap = new Map<string, NavItem>();
    const idSet = new Set<string>();
    const duplicates: string[] = [];
    
    items.forEach((item, index) => {
      const normalizedPath = item.path.split('?')[0].toLowerCase();
      
      // Check for ID duplicates
      if (idSet.has(item.id)) {
        duplicates.push(`ID '${item.id}' at index ${index}`);
        return;
      }
      
      // Check for path duplicates
      if (pathMap.has(normalizedPath)) {
        const existing = pathMap.get(normalizedPath);
        duplicates.push(`Path '${normalizedPath}' - keeping '${existing?.label}', skipping '${item.label}'`);
        return;
      }
      
      // Add to our tracking
      pathMap.set(normalizedPath, item);
      idSet.add(item.id);
    });
    
    if (duplicates.length > 0) {
      console.warn('NavigationService: Found duplicates:', duplicates);
    }
    
    const result = Array.from(pathMap.values());
    console.log(`NavigationService: Deduplication complete: ${items.length} -> ${result.length} items`);
    
    return result;
  }

  // Master processing pipeline with enhanced validation
  static processNavigationItems(items: NavItem[]): NavItem[] {
    console.log(`NavigationService: Processing ${items.length} navigation items through full pipeline`);
    
    // Step 1: Input validation
    const validItems = items.filter(item => {
      if (!item.id || !item.path || !item.label) {
        console.warn(`NavigationService: Invalid item detected:`, item);
        return false;
      }
      return true;
    });
    
    console.log(`NavigationService: After validation: ${validItems.length} items`);
    
    // Step 2: Filter deprecated routes
    const nonDeprecatedItems = this.filterDeprecatedRoutes(validItems);
    console.log(`NavigationService: After deprecated filter: ${nonDeprecatedItems.length} items`);
    
    // Step 3: Strict deduplication
    const uniqueItems = this.deduplicateNavItems(nonDeprecatedItems);
    console.log(`NavigationService: Final processed items: ${uniqueItems.length}`);
    
    // Step 4: Final verification
    const pathSet = new Set();
    const idSet = new Set();
    let hasIssues = false;
    
    uniqueItems.forEach(item => {
      const basePath = item.path.split('?')[0].toLowerCase();
      if (pathSet.has(basePath) || idSet.has(item.id)) {
        console.error(`NavigationService: CRITICAL - Duplicate survived processing: ${item.id} - ${item.path}`);
        hasIssues = true;
      }
      pathSet.add(basePath);
      idSet.add(item.id);
    });
    
    if (!hasIssues) {
      console.log('NavigationService: ✅ All duplicates successfully removed');
    }
    
    return uniqueItems;
  }
}

// Hook for using navigation service
export function useNavigationService() {
  const navigate = useNavigate();
  
  // Set the navigate function on the service
  NavigationService.setNavigate(navigate);
  
  return NavigationService;
}
