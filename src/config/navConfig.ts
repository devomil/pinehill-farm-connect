
import { Home, Users, CalendarIcon, BookOpen, BookOpenCheck, BarChart3, Image, Megaphone, MessageSquare } from "lucide-react";
import { ReactNode } from "react";

export interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: ReactNode;
  // Optional properties
  showIf?: boolean;
  badge?: ReactNode | null;
  role?: string; // For role-based access control
  section?: 'main' | 'communication' | 'tools'; // To categorize nav items
}

// Main navigation items
export const mainNavItems: NavItem[] = [
  {
    id: "dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: <Home className="h-5 w-5 mr-3" />,
    section: 'main',
  },
  {
    id: "employees",
    path: "/employees",
    label: "Employees",
    icon: <Users className="h-5 w-5 mr-3" />,
    section: 'main',
    role: "admin",
  },
  {
    id: "time",
    path: "/time",
    label: "Time Management",
    icon: <CalendarIcon className="h-5 w-5 mr-3" />,
    section: 'main',
  },
];

// Communication navigation items
export const communicationNavItems: NavItem[] = [
  {
    id: "announcements",
    path: "/communication",
    label: "Announcements",
    icon: <Megaphone className="h-5 w-5 mr-3" />,
    section: 'communication',
  },
  {
    id: "messages",
    path: "/communication?tab=messages",
    label: "Messages",
    icon: <MessageSquare className="h-5 w-5 mr-3" />,
    section: 'communication',
  }
];

// Tools navigation items
export const toolsNavItems: NavItem[] = [
  {
    id: "reports",
    path: "/reports",
    label: "Reports",
    icon: <BarChart3 className="h-5 w-5 mr-3" />,
    section: 'tools',
  },
  {
    id: "marketing",
    path: "/marketing",
    label: "Marketing",
    icon: <Image className="h-5 w-5 mr-3" />,
    section: 'tools',
  },
  {
    id: "training",
    path: "/training",
    label: "Training Portal",
    icon: <BookOpen className="h-5 w-5 mr-3" />,
    section: 'tools',
  },
  {
    id: "admin-training",
    path: "/admin-training",
    label: "Training Admin",
    icon: <BookOpenCheck className="h-5 w-5 mr-3" />,
    section: 'tools',
    role: "admin",
  }
];

// Combine all navigation items
export const getAllNavItems = (): NavItem[] => {
  return [...mainNavItems, ...communicationNavItems, ...toolsNavItems];
};

// Helper for filtering items based on user role
export const filterNavItemsByRole = (items: NavItem[], role?: string | null): NavItem[] => {
  return items.filter(item => !item.role || item.role === role);
};
