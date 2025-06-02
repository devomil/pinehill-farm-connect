
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

  // Route validation
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
    
    const basePath = path.split('?')[0];
    return validRoutes.includes(basePath);
  }

  // Filter deprecated routes
  static filterDeprecatedRoutes<T extends { path?: string; to?: string }>(items: T[]): T[] {
    const deprecatedPaths = ['/communications', '/calendar', '/time-management'];
    
    return items.filter(item => {
      const pathToCheck = item.path || item.to || '';
      const basePath = pathToCheck.split('?')[0];
      const isDeprecated = deprecatedPaths.includes(basePath);
      
      if (isDeprecated) {
        console.log(`Filtering out deprecated route: ${basePath}`);
      }
      
      return !isDeprecated;
    });
  }

  // Enhanced deduplicate navigation items by both path and ID
  static deduplicateNavItems(items: NavItem[]): NavItem[] {
    const uniqueItemsMap = new Map<string, NavItem>();
    const seenIds = new Set<string>();
    
    items.forEach(item => {
      const basePath = item.path.split('?')[0];
      
      // Skip if we've already seen this ID or base path
      if (seenIds.has(item.id) || uniqueItemsMap.has(basePath)) {
        console.log(`Skipping duplicate navigation item in service: ${item.label} (${item.path})`);
        return;
      }
      
      seenIds.add(item.id);
      uniqueItemsMap.set(basePath, item);
    });
    
    return Array.from(uniqueItemsMap.values());
  }

  // Process navigation items with full cleanup pipeline
  static processNavigationItems(items: NavItem[]): NavItem[] {
    console.log(`Processing ${items.length} navigation items`);
    
    // Step 1: Filter deprecated routes
    const filteredItems = this.filterDeprecatedRoutes(items);
    console.log(`After filtering deprecated routes: ${filteredItems.length} items`);
    
    // Step 2: Deduplicate items
    const uniqueItems = this.deduplicateNavItems(filteredItems);
    console.log(`After deduplication: ${uniqueItems.length} items`);
    
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
