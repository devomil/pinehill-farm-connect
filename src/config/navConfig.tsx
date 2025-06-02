
import { Home, Users, CalendarIcon, BookOpen, BookOpenCheck, BarChart3, Image, Megaphone, MessageSquare } from "lucide-react";
import { ReactNode } from "react";

export interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: ReactNode;
  badge?: ReactNode | null;
  role?: string;
  section?: 'main' | 'communication' | 'tools';
}

// Icon factory function
const createIcon = (Icon: React.FC<any>, className = "h-5 w-5 mr-3") => 
  <Icon className={className} />;

// Main navigation items - ensuring unique paths
export const mainNavItems: NavItem[] = [
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
    id: "time",
    path: "/time",
    label: "Time Management",
    icon: createIcon(CalendarIcon),
    section: 'main',
  },
];

// Communication navigation items - ensuring unique paths
export const communicationNavItems: NavItem[] = [
  {
    id: "communication-announcements",
    path: "/communication",
    label: "Announcements",
    icon: createIcon(Megaphone),
    section: 'communication',
  },
  {
    id: "communication-messages",
    path: "/communication?tab=messages",
    label: "Messages",
    icon: createIcon(MessageSquare),
    section: 'communication',
  }
];

// Tools navigation items - ensuring unique paths
export const toolsNavItems: NavItem[] = [
  {
    id: "reports",
    path: "/reports",
    label: "Reports",
    icon: createIcon(BarChart3),
    section: 'tools',
  },
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

// Enhanced deduplication function
const deduplicateNavItems = (items: NavItem[]): NavItem[] => {
  const seenPaths = new Set<string>();
  const seenIds = new Set<string>();
  const uniqueItems: NavItem[] = [];

  for (const item of items) {
    const basePath = item.path.split('?')[0];
    
    // Skip if we've already seen this base path or ID
    if (seenPaths.has(basePath) || seenIds.has(item.id)) {
      console.log(`Skipping duplicate navigation item: ${item.label} (${item.path})`);
      continue;
    }
    
    seenPaths.add(basePath);
    seenIds.add(item.id);
    uniqueItems.push(item);
  }

  return uniqueItems;
};

// Combined navigation items with proper deduplication
export const getAllNavItems = (): NavItem[] => {
  const allItems = [...mainNavItems, ...communicationNavItems, ...toolsNavItems];
  return deduplicateNavItems(allItems);
};

// Helper for filtering items based on user role with deduplication
export const filterNavItemsByRole = (items: NavItem[], role?: string | null): NavItem[] => {
  const filteredItems = items.filter(item => !item.role || item.role === role);
  return deduplicateNavItems(filteredItems);
};
