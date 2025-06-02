
import { useNavigate } from "react-router-dom";
import { NavItem } from "@/config/navConfig";

/**
 * Centralized navigation service with enhanced deduplication
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

  // Ultra-strict deduplication with multiple validation layers
  static deduplicateNavItems(items: NavItem[]): NavItem[] {
    console.log(`NavigationService: Ultra-strict deduplication starting with ${items.length} items`);
    
    // Layer 1: Remove invalid items
    const validItems = items.filter(item => {
      if (!item.id || !item.path || !item.label) {
        console.warn(`NavigationService: Invalid item removed:`, item);
        return false;
      }
      return true;
    });
    
    // Layer 2: Track by both normalized path and exact ID
    const seenPaths = new Set<string>();
    const seenIds = new Set<string>();
    const finalItems: NavItem[] = [];
    
    validItems.forEach((item, index) => {
      const normalizedPath = item.path.split('?')[0].toLowerCase().trim();
      
      // Check for exact ID match
      if (seenIds.has(item.id)) {
        console.warn(`NavigationService: Duplicate ID '${item.id}' at index ${index} - REJECTED`);
        return;
      }
      
      // Check for path collision
      if (seenPaths.has(normalizedPath)) {
        console.warn(`NavigationService: Duplicate path '${normalizedPath}' for item '${item.label}' (${item.id}) - REJECTED`);
        return;
      }
      
      // Item is unique, add it
      seenPaths.add(normalizedPath);
      seenIds.add(item.id);
      finalItems.push(item);
      console.log(`NavigationService: Added unique item: ${item.id} -> ${normalizedPath}`);
    });
    
    // Layer 3: Final validation check
    const pathCheck = new Set();
    const idCheck = new Set();
    let hasCollision = false;
    
    finalItems.forEach(item => {
      const basePath = item.path.split('?')[0].toLowerCase();
      if (pathCheck.has(basePath) || idCheck.has(item.id)) {
        console.error(`NavigationService: CRITICAL - Duplicate survived: ${item.id} - ${item.path}`);
        hasCollision = true;
      }
      pathCheck.add(basePath);
      idCheck.add(item.id);
    });
    
    if (!hasCollision) {
      console.log(`NavigationService: ✅ Ultra-strict deduplication successful: ${items.length} -> ${finalItems.length} items`);
    }
    
    return finalItems;
  }

  // Master processing pipeline with complete validation
  static processNavigationItems(items: NavItem[]): NavItem[] {
    console.log(`NavigationService: Processing ${items.length} items through complete pipeline`);
    
    // Step 1: Remove deprecated routes
    const nonDeprecatedItems = this.filterDeprecatedRoutes(items);
    console.log(`NavigationService: After deprecated filter: ${nonDeprecatedItems.length} items`);
    
    // Step 2: Ultra-strict deduplication
    const uniqueItems = this.deduplicateNavItems(nonDeprecatedItems);
    console.log(`NavigationService: After ultra-strict dedup: ${uniqueItems.length} items`);
    
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
