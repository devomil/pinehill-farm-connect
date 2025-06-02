
import { useNavigate } from "react-router-dom";

/**
 * Simplified navigation service with unified communication handling
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
    this.navigate?.("/communication");
  }

  static navigateToMessages() {
    this.navigate?.("/communication?tab=messages");
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

  // Route validation - updated to remove duplicate communication paths
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
}

// Hook for using navigation service
export function useNavigationService() {
  const navigate = useNavigate();
  
  // Set the navigate function on the service
  NavigationService.setNavigate(navigate);
  
  return NavigationService;
}
