
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CommunicationTabs } from "./CommunicationTabs";
import { AnnouncementManager } from "./announcement/AnnouncementManager";
import { EmployeeCommunications } from "../communications/EmployeeCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployeeDirectory } from "@/hooks/useEmployeeDirectory";
import { CommunicationHeader } from "./CommunicationHeader";
import { useCommunications } from "@/hooks/useCommunications";

const CommunicationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check URL for active tab
  const isMessagesTab = location.search.includes('tab=messages');
  const [activeTab, setActiveTab] = useState<string>(isMessagesTab ? "messages" : "announcements");
  
  // Get unread messages for the badge counter
  const { unreadMessages, refreshMessages } = useCommunications();
  const { unfilteredEmployees } = useEmployeeDirectory();

  // Handle tab changes and update the URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "messages") {
      navigate('/communication?tab=messages');
      // Force refresh messages when switching to messages tab
      refreshMessages();
    } else {
      navigate('/communication');
    }
  };

  // Handle URL changes
  useEffect(() => {
    if (location.search.includes('tab=messages')) {
      setActiveTab("messages");
    } else {
      setActiveTab("announcements");
    }
  }, [location]);

  // Make sure we refresh unread messages when the component mounts
  useEffect(() => {
    refreshMessages();
  }, [refreshMessages]);
  
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <CommunicationHeader />
      
      <CommunicationTabs 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        unreadMessages={unreadMessages}
      >
        <AnnouncementManager 
          currentUser={currentUser} 
          employees={unfilteredEmployees || []} 
        />
        
        <EmployeeCommunications />
      </CommunicationTabs>
    </div>
  );
};

export default CommunicationPage;
