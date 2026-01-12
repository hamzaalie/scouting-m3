import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  UserIcon,
  VideoCameraIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

/**
 * Navigation Item Type Definition
 * 
 * Represents a single navigation item with all its properties.
 */
export interface NavigationItem {
  /**
   * Display name of the navigation item
   */
  name: string;
  /**
   * Route path for navigation
   */
  path: string;
  /**
   * Heroicons React icon component (from @heroicons/react/24/outline)
   */
  icon: React.ComponentType<{ className?: string }>;
  /**
   * Optional badge (notification count, etc.)
   * null means no badge, number/string shows badge
   */
  badge?: number | string | null;
  /**
   * Whether the navigation item is disabled
   */
  disabled?: boolean;
}

/**
 * Navigation Section Type Definition
 * 
 * Represents a group of navigation items (for sidebar sections).
 */
export interface NavigationSection {
  /**
   * Optional section title
   */
  title?: string;
  /**
   * Navigation items in this section
   */
  items: NavigationItem[];
}

/**
 * Admin Navigation Configuration
 * 
 * Defines all navigation items available to admin users.
 * Organized by functional sections for better UX.
 * 
 * NAVIGATION STRUCTURE:
 * - Dashboard (main overview)
 * - Management Section:
 *   - Players (manage all players)
 *   - Teams (manage teams and rosters)
 *   - Matches (schedule and manage matches)
 *   - Users (manage user accounts)
 * - Analytics Section:
 *   - Statistics (platform analytics)
 * - Account Section:
 *   - Profile (admin profile and settings)
 */
export const adminNavigation: NavigationSection[] = [
  {
    items: [
      {
        name: 'Dashboard',
        path: '/admin/dashboard',
        icon: HomeIcon,
        badge: null,
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        name: 'Players',
        path: '/admin/players',
        icon: UsersIcon,
        badge: null, // Can show count later
      },
      {
        name: 'Teams',
        path: '/admin/teams',
        icon: ShieldCheckIcon,
        badge: null,
      },
      {
        name: 'Matches',
        path: '/admin/matches',
        icon: CalendarIcon,
        badge: null, // Can show upcoming matches count
      },
      {
        name: 'Users',
        path: '/admin/users',
        icon: UserGroupIcon,
        badge: null,
      },
    ],
  },
  {
    title: 'Analytics',
    items: [
      {
        name: 'Statistics',
        path: '/admin/stats',
        icon: ChartBarIcon,
        badge: null,
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        name: 'Profile',
        path: '/admin/profile',
        icon: UserIcon,
        badge: null,
      },
    ],
  },
];

/**
 * Player Navigation Configuration
 * 
 * Defines all navigation items available to player users.
 * Focused on player-specific features like performance tracking.
 * 
 * NAVIGATION STRUCTURE:
 * - Dashboard (performance overview)
 * - Performance Section:
 *   - My Matches (matches the player participated in)
 *   - My Stats (player statistics and analytics)
 *   - Highlights (video highlights)
 * - Account Section:
 *   - My Profile (player profile and settings)
 */
export const playerNavigation: NavigationSection[] = [
  {
    items: [
      {
        name: 'Dashboard',
        path: '/player/dashboard',
        icon: HomeIcon,
        badge: null,
      },
    ],
  },
  {
    title: 'Performance',
    items: [
      {
        name: 'My Matches',
        path: '/player/matches',
        icon: CalendarIcon,
        badge: null,
      },
      {
        name: 'My Stats',
        path: '/player/stats',
        icon: ChartBarIcon,
        badge: null,
      },
      {
        name: 'Highlights',
        path: '/player/highlights',
        icon: VideoCameraIcon,
        badge: null,
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        name: 'My Profile',
        path: '/player/profile',
        icon: UserIcon,
        badge: null,
      },
    ],
  },
];

/**
 * Scout Navigation Configuration
 * 
 * Defines all navigation items available to scout users.
 * Focused on player discovery and scouting activities.
 * 
 * NAVIGATION STRUCTURE:
 * - Dashboard (scouting overview)
 * - Discovery Section:
 *   - Players (browse and search players)
 *   - Matches (watch and analyze matches)
 * - Tools Section:
 *   - Favorites (favorited players - coming soon)
 *   - Reports (scouting reports - coming soon)
 * - Account Section:
 *   - Profile (scout profile and settings)
 */
export const scoutNavigation: NavigationSection[] = [
  {
    items: [
      {
        name: 'Dashboard',
        path: '/scout/dashboard',
        icon: HomeIcon,
        badge: null,
      },
    ],
  },
  {
    title: 'Discovery',
    items: [
      {
        name: 'Players',
        path: '/scout/players',
        icon: UsersIcon,
        badge: null,
      },
      {
        name: 'Matches',
        path: '/scout/matches',
        icon: CalendarIcon,
        badge: null,
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        name: 'Favorites',
        path: '/scout/favorites',
        icon: HeartIcon,
        badge: 'Soon',
        disabled: true,
      },
      {
        name: 'Reports',
        path: '/scout/reports',
        icon: ClipboardDocumentListIcon,
        badge: 'Soon',
        disabled: true,
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        name: 'Profile',
        path: '/scout/profile',
        icon: UserIcon,
        badge: null,
      },
    ],
  },
];

/**
 * User Role Type
 */
export type UserRole = 'admin' | 'player' | 'scout';

/**
 * Get Navigation Configuration for Role
 * 
 * Returns the appropriate navigation configuration based on the user's role.
 * This centralizes navigation logic and ensures consistency across the app.
 * 
 * @param role - User role ('admin', 'player', or 'scout')
 * @returns Navigation sections array for the specified role
 * 
 * @example
 * ```ts
 * // Get admin navigation
 * const adminNav = getNavigationForRole('admin');
 * 
 * // Get player navigation
 * const playerNav = getNavigationForRole('player');
 * 
 * // Get scout navigation
 * const scoutNav = getNavigationForRole('scout');
 * 
 * // Invalid role returns empty array
 * const invalidNav = getNavigationForRole('invalid' as any); // []
 * ```
 */
export const getNavigationForRole = (role?: UserRole | string): NavigationSection[] => {
  switch (role) {
    case 'admin':
      return adminNavigation;
    case 'player':
      return playerNavigation;
    case 'scout':
      return scoutNavigation;
    default:
      // Return empty array for invalid/undefined roles
      return [];
  }
};

/**
 * Flatten Navigation Sections
 * 
 * Converts navigation sections into a flat array of navigation items.
 * Useful when you need a simple list without section grouping.
 * 
 * @param sections - Navigation sections array
 * @returns Flattened array of navigation items
 * 
 * @example
 * ```ts
 * const adminNav = getNavigationForRole('admin');
 * const flatNav = flattenNavigation(adminNav);
 * // Returns all items from all sections in a single array
 * ```
 */
export const flattenNavigation = (sections: NavigationSection[]): NavigationItem[] => {
  return sections.flatMap((section) => section.items);
};

/**
 * Find Navigation Item by Path
 * 
 * Searches through navigation sections to find an item matching the given path.
 * Useful for breadcrumbs or active state management.
 * 
 * @param sections - Navigation sections array
 * @param path - Path to search for
 * @returns Navigation item if found, undefined otherwise
 * 
 * @example
 * ```ts
 * const adminNav = getNavigationForRole('admin');
 * const playersItem = findNavigationItemByPath(adminNav, '/admin/players');
 * // Returns the Players navigation item
 * ```
 */
export const findNavigationItemByPath = (
  sections: NavigationSection[],
  path: string
): NavigationItem | undefined => {
  const flatItems = flattenNavigation(sections);
  return flatItems.find((item) => item.path === path);
};

