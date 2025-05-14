
import { useNavigate } from "react-router-dom";

export const useDashboardNavigation = () => {
  const navigate = useNavigate();

  // Navigation handlers for dashboard widgets
  const handleTimeOffClick = () => {
    navigate("/time?tab=my-requests");
  };

  const handleTrainingClick = () => {
    navigate("/training");
  };

  const handleAnnouncementsClick = () => {
    navigate("/communication?tab=announcements");
  };

  const handleCalendarClick = () => {
    navigate("/calendar");
  };

  const handleAdminTimeOffClick = () => {
    navigate("/time?tab=pending-approvals");
  };

  const handleScheduleClick = () => {
    navigate("/time?tab=work-schedules");
  };

  const handleMarketingClick = () => {
    navigate("/marketing");
  };

  return {
    handleTimeOffClick,
    handleTrainingClick,
    handleAnnouncementsClick,
    handleCalendarClick,
    handleAdminTimeOffClick,
    handleScheduleClick,
    handleMarketingClick
  };
};
