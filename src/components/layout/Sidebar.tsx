import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { getNavigationForRole } from '../../utils/navigation';
import Badge from '../common/Badge';

/**
 * Sidebar Component Props
 */
export interface SidebarProps {
  /**
   * Whether the sidebar is collapsed (icon-only mode)
   */
  collapsed?: boolean;
  /**
   * Callback when sidebar toggle is clicked
   */
  onToggle?: () => void;
  /**
   * Whether the sidebar is open on mobile (drawer mode)
   */
  isMobileOpen?: boolean;
  /**
   * Callback to close mobile sidebar
   */
  onMobileClose?: () => void;
}

/**
 * Sidebar Component
 * 
 * A beautiful, role-based sidebar navigation component.
 * 
 * Features:
 * - Role-based menu items (Admin, Player, Scout)
 * - Collapsible sidebar (icon-only mode)
 * - Active item highlighting
 * - Smooth hover effects
 * - Badge support for notifications
 * - Mobile drawer support
 * - Section grouping
 * - Keyboard navigation
 * - Smooth transitions
 * 
 * @example
 * ```tsx
 * // Basic sidebar
 * <Sidebar />
 * 
 * // Collapsible sidebar
 * <Sidebar
 *   collapsed={isCollapsed}
 *   onToggle={() => setIsCollapsed(!isCollapsed)}
 * />
 * 
 * // Mobile sidebar
 * <Sidebar
 *   isMobileOpen={isMobileOpen}
 *   onMobileClose={() => setIsMobileOpen(false)}
 * />
 * ```
 */
const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Get navigation config based on user role using centralized navigation utility
  const role = user?.role || 'player';
  const menuSections = getNavigationForRole(role);

  // Translation mapping for navigation items
  const translateNavName = (name: string): string => {
    const navMap: Record<string, string> = {
      'Dashboard': t('navigation.dashboard'),
      'Players': t('navigation.players'),
      'Teams': t('navigation.teams'),
      'Matches': t('navigation.matches'),
      'Users': t('navigation.users'),
      'Statistics': t('navigation.statistics'),
      'Settings': t('navigation.settings'),
      'Profile': t('navigation.profile'),
      'My Profile': t('player.myProfile'),
      'My Matches': t('navigation.myMatches'),
      'My Stats': t('navigation.myStats'),
      'Highlights': t('navigation.highlights'),
      'Favorites': t('navigation.favorites'),
      'Reports': t('navigation.reports'),
    };
    return navMap[name] || name;
  };

  // Translation mapping for section titles
  const translateSectionTitle = (title: string): string => {
    const sectionMap: Record<string, string> = {
      'Management': t('navigation.management'),
      'Analytics': t('navigation.analytics'),
      'Settings': t('navigation.settings'),
      'Performance': t('navigation.performance'),
      'Account': t('navigation.account'),
      'Discovery': t('navigation.discovery'),
      'Tools': t('navigation.tools'),
    };
    return sectionMap[title] || title;
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Mobile backdrop
  const backdrop = isMobileOpen && (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      onClick={onMobileClose}
      aria-hidden="true"
    />
  );

  return (
    <>
      {backdrop}
      <aside
        className={`
          fixed
          top-0
          left-0
          h-full
          bg-[#0066CC]
          border-none
          shadow-lg
          z-50
          flex
          flex-col
          transition-all
          duration-300
          ease-in-out
          flex-shrink-0
          ${collapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          lg:relative
          lg:z-auto
        `}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className="flex flex-col items-center pt-6 pb-2 px-4">
          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center mb-6 shadow-lg backdrop-blur-sm">
            <img src="/LOGO.png" alt="iDA" className="w-9 h-9 object-contain" />
          </div>
          {/* Separator Line */}
          <div className="w-10 h-px bg-white/20 rounded-full mb-2"></div>
          {/* Toggle button (desktop) - Absolute positioned to not mess with flex layout */}
          {onToggle && (
            <button
              onClick={onToggle}
              className="absolute top-4 right-4 hidden lg:block p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          )}
          {/* Close button (mobile) */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 lg:hidden p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {/* Section Title */}
              {!collapsed && section.title && (
                <h3 className="px-4 text-[11px] font-bold text-white/60 uppercase tracking-widest mb-3 mt-6">
                  {translateSectionTitle(section.title)}
                </h3>
              )}

              {/* Menu Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon; // Heroicons React component

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={onMobileClose}
                      title={!collapsed ? undefined : translateNavName(item.name)}
                      className={`
                        relative
                        flex
                        items-center
                        gap-3
                        px-3
                        py-2
                        rounded-lg
                        text-sm
                        font-medium
                        transition-all
                        duration-150
                        ${active
                          ? 'bg-white/20 text-white font-semibold border-l-4 border-white pl-3'
                          : 'text-white hover:bg-white/10 hover:translate-x-1'
                        }
                        ${item.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                      `}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 text-white transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{translateNavName(item.name)}</span>
                          {item.badge !== undefined && item.badge !== null && (
                            <Badge variant="info" size="sm" className="bg-white/25 text-white border-transparent rounded-xl px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                      {collapsed && item.badge !== undefined && item.badge !== null && (
                        <span className="absolute left-9 top-2 w-2 h-2 bg-white rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
