
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

// Factory function to create icons
const createIcon = (Icon: React.FC<any>) => {
  return ({ className = "h-5 w-5 mr-3" }: { className?: string }) => 
    <Icon className={className} />;
};

// Main navigation items
export const mainNavItems: NavItem[] = [
  {
    id: "dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: createIcon(Home)({ className: "h-5 w-5 mr-3" }),
    section: 'main',
  },
  {
    id: "employees",
    path: "/employees",
    label: "Employees",
    icon: createIcon(Users)({ className: "h-5 w-5 mr-3" }),
    section: 'main',
    role: "admin",
  },
  {
    id: "time",
    path: "/time",
    label: "Time Management",
    icon: createIcon(CalendarIcon)({ className: "h-5 w-5 mr-3" }),
    section: 'main',
  },
];

// Communication navigation items
export const communicationNavItems: NavItem[] = [
  {
    id: "announcements",
    path: "/communication",
    label: "Announcements",
    icon: createIcon(Megaphone)({ className: "h-5 w-5 mr-3" }),
    section: 'communication',
  },
  {
    id: "messages",
    path: "/communication?tab=messages",
    label: "Messages",
    icon: createIcon(MessageSquare)({ className: "h-5 w-5 mr-3" }),
    section: 'communication',
  }
];

// Tools navigation items
export const toolsNavItems: NavItem[] = [
  {
    id: "reports",
    path: "/reports",
    label: "Reports",
    icon: createIcon(BarChart3)({ className: "h-5 w-5 mr-3" }),
    section: 'tools',
  },
  {
    id: "marketing",
    path: "/marketing",
    label: "Marketing",
    icon: createIcon(Image)({ className: "h-5 w-5 mr-3" }),
    section: 'tools',
  },
  {
    id: "training",
    path: "/training",
    label: "Training Portal",
    icon: createIcon(BookOpen)({ className: "h-5 w-5 mr-3" }),
    section: 'tools',
  },
  {
    id: "admin-training",
    path: "/admin-training",
    label: "Training Admin",
    icon: createIcon(BookOpenCheck)({ className: "h-5 w-5 mr-3" }),
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
