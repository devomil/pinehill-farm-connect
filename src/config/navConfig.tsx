
import { Home, Users, CalendarIcon, BookOpen, BookOpenCheck, BarChart3, Image, MessageSquare, Settings } from "lucide-react";
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
const createIcon = (Icon: React.FC<any>, className = "h-4 w-4") => 
  <Icon className={className} />;

// EXACTLY 9 essential pages (no duplicates) - cleaned up navigation
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
  
  // Communication navigation (1 item only)
  {
    id: "communication",
    path: "/communication",
    label: "Communication", 
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

// Get items by section with deduplication
export const getMainNavItems = (): NavItem[] => {
  const items = ALL_NAV_ITEMS.filter(item => item.section === 'main');
  // Ensure no duplicates by ID
  return items.filter((item, index, array) => 
    array.findIndex(i => i.id === item.id) === index
  );
};

export const getCommunicationNavItems = (): NavItem[] => {
  const items = ALL_NAV_ITEMS.filter(item => item.section === 'communication');
  return items.filter((item, index, array) => 
    array.findIndex(i => i.id === item.id) === index
  );
};

export const getToolsNavItems = (): NavItem[] => {
  const items = ALL_NAV_ITEMS.filter(item => item.section === 'tools');
  return items.filter((item, index, array) => 
    array.findIndex(i => i.id === item.id) === index
  );
};

// Get all navigation items with deduplication
export const getAllNavItems = (): NavItem[] => {
  return ALL_NAV_ITEMS.filter((item, index, array) => 
    array.findIndex(i => i.id === item.id) === index
  );
};

// Simple role-based filtering
export const filterNavItemsByRole = (items: NavItem[], role?: string | null): NavItem[] => {
  return items.filter(item => {
    if (!item.role) return true; // No role requirement
    return item.role === role;
  });
};
