
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

// Main navigation items - unique IDs and paths
export const mainNavItems: NavItem[] = [
  {
    id: "nav-dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: createIcon(Home),
    section: 'main',
  },
  {
    id: "nav-employees",
    path: "/employees", 
    label: "Employees",
    icon: createIcon(Users),
    section: 'main',
    role: "admin",
  },
  {
    id: "nav-time",
    path: "/time",
    label: "Time Management",
    icon: createIcon(CalendarIcon),
    section: 'main',
  },
];

// Communication navigation items - unique IDs and paths
export const communicationNavItems: NavItem[] = [
  {
    id: "nav-announcements",
    path: "/communication",
    label: "Announcements", 
    icon: createIcon(Megaphone),
    section: 'communication',
  },
  {
    id: "nav-messages",
    path: "/communication?tab=messages",
    label: "Messages",
    icon: createIcon(MessageSquare),
    section: 'communication',
  }
];

// Tools navigation items - unique IDs and paths
export const toolsNavItems: NavItem[] = [
  {
    id: "nav-reports",
    path: "/reports",
    label: "Reports",
    icon: createIcon(BarChart3),
    section: 'tools',
  },
  {
    id: "nav-marketing",
    path: "/marketing",
    label: "Marketing",
    icon: createIcon(Image),
    section: 'tools',
  },
  {
    id: "nav-training",
    path: "/training",
    label: "Training Portal",
    icon: createIcon(BookOpen),
    section: 'tools',
  },
  {
    id: "nav-admin-training",
    path: "/admin-training",
    label: "Training Admin",
    icon: createIcon(BookOpenCheck),
    section: 'tools',
    role: "admin",
  }
];

// Enhanced deduplication with aggressive checking
const deduplicateNavItems = (items: NavItem[]): NavItem[] => {
  console.log(`Starting deduplication with ${items.length} items`);
  
  const pathMap = new Map<string, NavItem>();
  const idSet = new Set<string>();
  
  items.forEach((item, index) => {
    // Normalize path for comparison
    const normalizedPath = item.path.split('?')[0].toLowerCase();
    
    // Check for ID duplicates first
    if (idSet.has(item.id)) {
      console.warn(`Duplicate ID found: ${item.id} at index ${index} - SKIPPING`);
      return;
    }
    
    // Check for path duplicates
    if (pathMap.has(normalizedPath)) {
      const existing = pathMap.get(normalizedPath);
      console.warn(`Duplicate path found: ${normalizedPath} - keeping '${existing?.label}' (${existing?.id}), skipping '${item.label}' (${item.id})`);
      return;
    }
    
    // Add to tracking
    pathMap.set(normalizedPath, item);
    idSet.add(item.id);
    console.log(`Added item: ${item.id} -> ${normalizedPath}`);
  });
  
  const result = Array.from(pathMap.values());
  console.log(`Deduplication complete: ${items.length} -> ${result.length} items`);
  return result;
};

// Combined navigation items with strict deduplication
export const getAllNavItems = (): NavItem[] => {
  console.log('getAllNavItems: Starting navigation assembly');
  
  // Get all items from each section
  const allItems = [
    ...mainNavItems,
    ...communicationNavItems,
    ...toolsNavItems
  ];
  
  console.log(`getAllNavItems: Total items before dedup: ${allItems.length}`);
  allItems.forEach((item, i) => console.log(`  ${i + 1}. ${item.id}: ${item.path}`));
  
  // Apply strict deduplication
  const dedupedItems = deduplicateNavItems(allItems);
  
  console.log(`getAllNavItems: Final items after dedup: ${dedupedItems.length}`);
  dedupedItems.forEach((item, i) => console.log(`  ${i + 1}. ${item.id}: ${item.path}`));
  
  return dedupedItems;
};

// Helper for filtering items based on user role with deduplication
export const filterNavItemsByRole = (items: NavItem[], role?: string | null): NavItem[] => {
  console.log(`filterNavItemsByRole: Filtering ${items.length} items by role: ${role || 'none'}`);
  
  // First filter by role
  const roleFilteredItems = items.filter(item => {
    if (!item.role) return true; // No role requirement
    return item.role === role;
  });
  
  console.log(`filterNavItemsByRole: After role filtering: ${roleFilteredItems.length} items`);
  
  // Then apply deduplication to ensure no duplicates slip through
  const finalItems = deduplicateNavItems(roleFilteredItems);
  
  console.log(`filterNavItemsByRole: Final filtered items: ${finalItems.length}`);
  return finalItems;
};
