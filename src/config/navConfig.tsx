
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

// Main navigation items - ensuring unique paths and IDs
export const mainNavItems: NavItem[] = [
  {
    id: "main-dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: createIcon(Home),
    section: 'main',
  },
  {
    id: "main-employees",
    path: "/employees",
    label: "Employees",
    icon: createIcon(Users),
    section: 'main',
    role: "admin",
  },
  {
    id: "main-time",
    path: "/time",
    label: "Time Management",
    icon: createIcon(CalendarIcon),
    section: 'main',
  },
];

// Communication navigation items - ensuring unique paths and IDs
export const communicationNavItems: NavItem[] = [
  {
    id: "comm-announcements",
    path: "/communication",
    label: "Announcements",
    icon: createIcon(Megaphone),
    section: 'communication',
  },
  {
    id: "comm-messages",
    path: "/communication?tab=messages",
    label: "Messages",
    icon: createIcon(MessageSquare),
    section: 'communication',
  }
];

// Tools navigation items - ensuring unique paths and IDs
export const toolsNavItems: NavItem[] = [
  {
    id: "tools-reports",
    path: "/reports",
    label: "Reports",
    icon: createIcon(BarChart3),
    section: 'tools',
  },
  {
    id: "tools-marketing",
    path: "/marketing",
    label: "Marketing",
    icon: createIcon(Image),
    section: 'tools',
  },
  {
    id: "tools-training",
    path: "/training",
    label: "Training Portal",
    icon: createIcon(BookOpen),
    section: 'tools',
  },
  {
    id: "tools-admin-training",
    path: "/admin-training",
    label: "Training Admin",
    icon: createIcon(BookOpenCheck),
    section: 'tools',
    role: "admin",
  }
];

// Enhanced deduplication that works with both path and ID
const deduplicateNavItems = (items: NavItem[]): NavItem[] => {
  const seenPaths = new Set<string>();
  const seenIds = new Set<string>();
  const uniqueItems: NavItem[] = [];

  for (const item of items) {
    // Normalize path for comparison (remove query params)
    const basePath = item.path.split('?')[0].toLowerCase();
    
    // Skip if we've already seen this base path or ID
    if (seenPaths.has(basePath) || seenIds.has(item.id)) {
      console.log(`Deduplicating: Skipping duplicate item ${item.label} (ID: ${item.id}, Path: ${item.path})`);
      continue;
    }
    
    seenPaths.add(basePath);
    seenIds.add(item.id);
    uniqueItems.push(item);
  }

  console.log(`Deduplication complete: ${items.length} -> ${uniqueItems.length} items`);
  return uniqueItems;
};

// Combined navigation items with strict deduplication
export const getAllNavItems = (): NavItem[] => {
  console.log('getAllNavItems called - combining navigation sections');
  
  // Get all items from each section
  const allItems = [
    ...mainNavItems,
    ...communicationNavItems, 
    ...toolsNavItems
  ];
  
  console.log(`Before deduplication: ${allItems.length} total items`);
  console.log('Items before dedup:', allItems.map(item => `${item.id}: ${item.path}`));
  
  // Apply deduplication
  const dedupedItems = deduplicateNavItems(allItems);
  
  console.log(`After deduplication: ${dedupedItems.length} items`);
  console.log('Final items:', dedupedItems.map(item => `${item.id}: ${item.path}`));
  
  return dedupedItems;
};

// Helper for filtering items based on user role with enhanced deduplication
export const filterNavItemsByRole = (items: NavItem[], role?: string | null): NavItem[] => {
  console.log(`Filtering ${items.length} items by role: ${role || 'none'}`);
  
  // First filter by role
  const roleFilteredItems = items.filter(item => {
    if (!item.role) return true; // No role requirement
    return item.role === role;
  });
  
  console.log(`After role filtering: ${roleFilteredItems.length} items`);
  
  // Then deduplicate to ensure no duplicates slip through
  const finalItems = deduplicateNavItems(roleFilteredItems);
  
  console.log(`Final filtered items: ${finalItems.length}`);
  return finalItems;
};
