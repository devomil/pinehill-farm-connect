
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
    const deprecatedPaths = ['/communications', '/calendar'];
    
    return items.filter(item => {
      const pathToCheck = item.path || item.to || '';
      const basePath = pathToCheck.split('?')[0];
      return !deprecatedPaths.includes(basePath);
    });
  }

  // Deduplicate navigation items by path
  static deduplicateNavItems(items: NavItem[]): NavItem[] {
    const uniqueItemsMap = new Map<string, NavItem>();
    
    items.forEach(item => {
      const basePath = item.path.split('?')[0];
      
      if (!uniqueItemsMap.has(basePath)) {
        uniqueItemsMap.set(basePath, item);
      }
    });
    
    return Array.from(uniqueItemsMap.values());
  }
}

// Hook for using navigation service
export function useNavigationService() {
  const navigate = useNavigate();
  
  // Set the navigate function on the service
  NavigationService.setNavigate(navigate);
  
  return NavigationService;
}
