
import { useNavigationService } from "@/services/navigationService";

export const useDashboardNavigation = () => {
  const navigationService = useNavigationService();

  return {
    handleTimeOffClick: navigationService.navigateToTimeOff,
    handleTrainingClick: navigationService.navigateToTraining,
    handleAnnouncementsClick: navigationService.navigateToAnnouncements,
    handleCalendarClick: navigationService.navigateToCalendar,
    handleAdminTimeOffClick: navigationService.navigateToAdminTimeOff,
    handleScheduleClick: navigationService.navigateToSchedule,
    handleMarketingClick: navigationService.navigateToMarketing
  };
};
