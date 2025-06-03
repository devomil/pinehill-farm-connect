
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

// Clean navigation items - flattened hierarchy with standardized URLs
const ALL_NAV_ITEMS: NavItem[] = [
  // Main navigation (frequently used items at top level)
  {
    id: "dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: createIcon(Home),
    section: 'main',
  },
  {
    id: "communication",
    path: "/communication",
    label: "Communication", 
    icon: createIcon(MessageSquare),
    section: 'main',
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
  
  // Admin-only main navigation
  {
    id: "employees",
    path: "/employees", 
    label: "Employees",
    icon: createIcon(Users),
    section: 'main',
    role: "admin",
  },
  
  // Tools navigation
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

// Validation function as suggested
const validateNavConfig = () => {
  const allItems = ALL_NAV_ITEMS;
  const ids = allItems.map(item => item.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  
  if (duplicates.length > 0) {
    console.error('Duplicate nav IDs found:', duplicates);
    throw new Error(`Navigation configuration contains duplicate IDs: ${duplicates.join(', ')}`);
  }
  
  console.log("Navigation validation passed: All item IDs are unique");
  return true;
};

// Run validation on load
validateNavConfig();

// Get items by section - simplified without cross-validation
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
  return ALL_NAV_ITEMS;
};

// Simplified navigation getter
export const getAllNavSections = (): { main: NavItem[], communication: NavItem[], tools: NavItem[] } => {
  return {
    main: getMainNavItems(),
    communication: getCommunicationNavItems(),
    tools: getToolsNavItems()
  };
};

// Simple role-based filtering
export const filterNavItemsByRole = (items: NavItem[], role?: string | null): NavItem[] => {
  return items.filter(item => {
    if (!item.role) return true; // No role requirement
    return item.role === role;
  });
};
