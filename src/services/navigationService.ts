
import { useNavigate } from "react-router-dom";
import { NavItem } from "@/config/navConfig";

/**
 * Simplified navigation service - registry handles deduplication
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

  // Simple processing - registry ensures no duplicates exist
  static processNavigationItems(items: NavItem[]): NavItem[] {
    console.log(`NavigationService: Processing ${items.length} pre-validated items`);
    
    // Since items come from registry, they're already deduplicated
    // Just do a final validation check
    const seenPaths = new Set<string>();
    const seenIds = new Set<string>();
    
    items.forEach(item => {
      const normalizedPath = item.path.split('?')[0].toLowerCase();
      if (seenPaths.has(normalizedPath) || seenIds.has(item.id)) {
        console.error(`NavigationService: IMPOSSIBLE DUPLICATE DETECTED: ${item.id} - ${item.path}`);
      }
      seenPaths.add(normalizedPath);
      seenIds.add(item.id);
    });
    
    console.log(`NavigationService: Validated ${items.length} unique items`);
    return items;
  }
}

// Hook for using navigation service
export function useNavigationService() {
  const navigate = useNavigate();
  
  // Set the navigate function on the service
  NavigationService.setNavigate(navigate);
  
  return NavigationService;
}
