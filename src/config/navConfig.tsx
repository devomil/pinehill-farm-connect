
import { Home, Users, CalendarIcon, BookOpen, BookOpenCheck, BarChart3, Image, Megaphone, MessageSquare, Settings } from "lucide-react";
import { ReactNode } from "react";

export interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: ReactNode;
  badge?: ReactNode | null;
  role?: string;
  section: 'main' | 'communication' | 'tools';
}

// Icon factory function
const createIcon = (Icon: React.FC<any>, className = "h-5 w-5 mr-3") => 
  <Icon className={className} />;

// CLEAN LIST - Only 10 essential pages, no duplicates
const ALL_NAV_ITEMS: NavItem[] = [
  // Main navigation (4 items)
  {
    id: "dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: createIcon(Home),
    section: 'main',
  },
  {
    id: "employees",
    path: "/employees", 
    label: "Employees",
    icon: createIcon(Users),
    section: 'main',
    role: "admin",
  },
  {
    id: "time-management",
    path: "/time",
    label: "Time Management",
    icon: createIcon(CalendarIcon),
    section: 'main',
  },
  {
    id: "reports",
    path: "/reports",
    label: "Reports",
    icon: createIcon(BarChart3),
    section: 'main',
  },
  
  // Communication navigation (2 items)
  {
    id: "announcements",
    path: "/communication",
    label: "Announcements", 
    icon: createIcon(Megaphone),
    section: 'communication',
  },
  {
    id: "messages",
    path: "/communication?tab=messages",
    label: "Messages",
    icon: createIcon(MessageSquare),
    section: 'communication',
  },
  
  // Tools navigation (4 items)
  {
    id: "marketing",
    path: "/marketing",
    label: "Marketing",
    icon: createIcon(Image),
    section: 'tools',
  },
  {
    id: "training",
    path: "/training",
    label: "Training Portal",
    icon: createIcon(BookOpen),
    section: 'tools',
  },
  {
    id: "admin-training",
    path: "/admin-training",
    label: "Training Admin",
    icon: createIcon(BookOpenCheck),
    section: 'tools',
    role: "admin",
  },
  {
    id: "diagnostics",
    path: "/diagnostics",
    label: "Diagnostics",
    icon: createIcon(Settings),
    section: 'tools',
  }
];

// Get items by section
export const getMainNavItems = (): NavItem[] => {
  return ALL_NAV_ITEMS.filter(item => item.section === 'main');
};

export const getCommunicationNavItems = (): NavItem[] => {
  return ALL_NAV_ITEMS.filter(item => item.section === 'communication');
};

export const getToolsNavItems = (): NavItem[] => {
  return ALL_NAV_ITEMS.filter(item => item.section === 'tools');
};

// Get all navigation items
export const getAllNavItems = (): NavItem[] => {
  return [...ALL_NAV_ITEMS];
};

// Simple role-based filtering
export const filterNavItemsByRole = (items: NavItem[], role?: string | null): NavItem[] => {
  return items.filter(item => {
    if (!item.role) return true; // No role requirement
    return item.role === role;
  });
};

// Legacy exports for backwards compatibility (but using new system)
export const mainNavItems = getMainNavItems();
export const communicationNavItems = getCommunicationNavItems();
export const toolsNavItems = getToolsNavItems();
