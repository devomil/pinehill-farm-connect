
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

// CENTRALIZED NAVIGATION REGISTRY - Single source of truth
const NAVIGATION_REGISTRY = new Map<string, NavItem>();

// Helper to register navigation items and prevent duplicates at the source
function registerNavItem(item: NavItem): NavItem {
  const normalizedPath = item.path.split('?')[0].toLowerCase();
  
  // Check if path already exists
  for (const [existingId, existingItem] of NAVIGATION_REGISTRY.entries()) {
    const existingNormalizedPath = existingItem.path.split('?')[0].toLowerCase();
    if (existingNormalizedPath === normalizedPath && existingId !== item.id) {
      console.warn(`BLOCKED DUPLICATE: Attempted to register ${item.id} with path ${item.path}, but ${existingId} already uses ${existingItem.path}`);
      return existingItem; // Return existing item instead of creating duplicate
    }
  }
  
  // Check if ID already exists
  if (NAVIGATION_REGISTRY.has(item.id)) {
    console.warn(`BLOCKED DUPLICATE ID: ${item.id} already exists in registry`);
    return NAVIGATION_REGISTRY.get(item.id)!;
  }
  
  NAVIGATION_REGISTRY.set(item.id, item);
  console.log(`REGISTERED: ${item.id} -> ${item.path}`);
  return item;
}

// Clear and rebuild registry function
function rebuildNavigationRegistry() {
  NAVIGATION_REGISTRY.clear();
  console.log('Navigation registry cleared and rebuilding...');
}

// Main navigation items - register each one
rebuildNavigationRegistry();

export const mainNavItems: NavItem[] = [
  registerNavItem({
    id: "nav-dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: createIcon(Home),
    section: 'main',
  }),
  registerNavItem({
    id: "nav-employees",
    path: "/employees", 
    label: "Employees",
    icon: createIcon(Users),
    section: 'main',
    role: "admin",
  }),
  registerNavItem({
    id: "nav-time",
    path: "/time",
    label: "Time Management",
    icon: createIcon(CalendarIcon),
    section: 'main',
  }),
];

// Communication navigation items
export const communicationNavItems: NavItem[] = [
  registerNavItem({
    id: "nav-announcements",
    path: "/communication",
    label: "Announcements", 
    icon: createIcon(Megaphone),
    section: 'communication',
  }),
  registerNavItem({
    id: "nav-messages",
    path: "/communication?tab=messages",
    label: "Messages",
    icon: createIcon(MessageSquare),
    section: 'communication',
  })
];

// Tools navigation items
export const toolsNavItems: NavItem[] = [
  registerNavItem({
    id: "nav-reports",
    path: "/reports",
    label: "Reports",
    icon: createIcon(BarChart3),
    section: 'tools',
  }),
  registerNavItem({
    id: "nav-marketing",
    path: "/marketing",
    label: "Marketing",
    icon: createIcon(Image),
    section: 'tools',
  }),
  registerNavItem({
    id: "nav-training",
    path: "/training",
    label: "Training Portal",
    icon: createIcon(BookOpen),
    section: 'tools',
  }),
  registerNavItem({
    id: "nav-admin-training",
    path: "/admin-training",
    label: "Training Admin",
    icon: createIcon(BookOpenCheck),
    section: 'tools',
    role: "admin",
  })
];

// Get all unique navigation items from registry
export const getAllNavItems = (): NavItem[] => {
  console.log('getAllNavItems: Retrieving from centralized registry');
  const items = Array.from(NAVIGATION_REGISTRY.values());
  console.log(`getAllNavItems: Registry contains ${items.length} unique items:`);
  items.forEach((item, i) => console.log(`  ${i + 1}. ${item.id}: ${item.path}`));
  return items;
};

// Role-based filtering that maintains registry integrity
export const filterNavItemsByRole = (items: NavItem[], role?: string | null): NavItem[] => {
  console.log(`filterNavItemsByRole: Filtering ${items.length} items by role: ${role || 'none'}`);
  
  const filtered = items.filter(item => {
    if (!item.role) return true; // No role requirement
    return item.role === role;
  });
  
  console.log(`filterNavItemsByRole: Filtered to ${filtered.length} items`);
  return filtered;
};

// Debug function to inspect registry state
export const debugNavigationRegistry = () => {
  console.log('=== NAVIGATION REGISTRY DEBUG ===');
  console.log(`Registry size: ${NAVIGATION_REGISTRY.size}`);
  
  const pathMap = new Map<string, string[]>();
  NAVIGATION_REGISTRY.forEach((item, id) => {
    const normalizedPath = item.path.split('?')[0].toLowerCase();
    if (!pathMap.has(normalizedPath)) {
      pathMap.set(normalizedPath, []);
    }
    pathMap.get(normalizedPath)!.push(id);
  });
  
  pathMap.forEach((ids, path) => {
    if (ids.length > 1) {
      console.error(`CRITICAL: Path ${path} has multiple IDs: ${ids.join(', ')}`);
    } else {
      console.log(`✓ Path ${path} -> ${ids[0]}`);
    }
  });
  
  console.log('=== END REGISTRY DEBUG ===');
};
