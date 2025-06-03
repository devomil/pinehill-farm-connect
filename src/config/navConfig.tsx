
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

// Clean navigation items - exactly one of each, no duplicates
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
  
  // Tools navigation (3 items - removed diagnostics as it's not a main nav item)
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
  }
];

// Validate no duplicate IDs
const validateNavItems = () => {
  const ids = ALL_NAV_ITEMS.map(item => item.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    console.error("Duplicate navigation item IDs detected:", ids);
    throw new Error("Navigation configuration contains duplicate IDs");
  }
};

// Run validation
validateNavItems();

// Get items by section with validation
export const getMainNavItems = (): NavItem[] => {
  const items = ALL_NAV_ITEMS.filter(item => item.section === 'main');
  console.log("getMainNavItems returning:", items.map(i => i.label));
  return items;
};

export const getCommunicationNavItems = (): NavItem[] => {
  const items = ALL_NAV_ITEMS.filter(item => item.section === 'communication');
  console.log("getCommunicationNavItems returning:", items.map(i => i.label));
  return items;
};

export const getToolsNavItems = (): NavItem[] => {
  const items = ALL_NAV_ITEMS.filter(item => item.section === 'tools');
  console.log("getToolsNavItems returning:", items.map(i => i.label));
  return items;
};

// Get all navigation items
export const getAllNavItems = (): NavItem[] => {
  return ALL_NAV_ITEMS;
};

// Simple role-based filtering with debugging
export const filterNavItemsByRole = (items: NavItem[], role?: string | null): NavItem[] => {
  const filtered = items.filter(item => {
    if (!item.role) return true; // No role requirement
    return item.role === role;
  });
  console.log(`filterNavItemsByRole: ${items.length} items -> ${filtered.length} items for role: ${role}`);
  return filtered;
};
