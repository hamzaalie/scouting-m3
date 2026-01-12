import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { getNavigationForRole } from '../../utils/navigation';
import { generateBreadcrumbFromNav } from '../common/Breadcrumb';
import Breadcrumb from '../common/Breadcrumb';
import Dropdown from '../common/Dropdown';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import LanguageSwitcher from '../common/LanguageSwitcher';

/**
 * Navbar Component Props
 */
export interface NavbarProps {
  /**
   * Callback when mobile menu button is clicked
   */
  onMenuClick?: () => void;
  /**
   * Whether sidebar is collapsed (for showing menu button)
   */
  sidebarCollapsed?: boolean;
}

/**
 * Navbar Component
 * 
 * Professional top navigation bar with user profile dropdown and notifications.
 * 
 * Features:
 * - Logo on left
 * - Mobile menu button (hamburger)
 * - Notifications icon with badge
 * - User profile dropdown
 * - Fixed position with backdrop blur
 * - Shadow on scroll
 * - Responsive design
 * 
 * @example
 * ```tsx
 * // Basic navbar
 * <Navbar />
 * 
 * // With mobile menu handler
 * <Navbar onMenuClick={() => setIsMobileOpen(true)} />
 * ```
 */
const Navbar: React.FC<NavbarProps> = ({
  onMenuClick,
  sidebarCollapsed: _sidebarCollapsed = false,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  // Translate user role
  const translateRole = (role: string | undefined): string => {
    if (!role) return '';
    const roleMap: Record<string, string> = {
      'admin': t('common.admin'),
      'player': t('common.player'),
      'scout': t('common.scout'),
    };
    return roleMap[role] || role;
  };

  // Generate breadcrumbs from navigation config
  const breadcrumbItems = React.useMemo(() => {
    if (!user?.role) return [];
    const navSections = getNavigationForRole(user.role);
    return generateBreadcrumbFromNav(location.pathname, navSections);
  }, [location.pathname, user?.role]);

  // Handle scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    navigate('/login', { replace: true });
    logout().catch(console.error);
  };

  if (!isAuthenticated || !user) {
    // Public navbar (for auth pages)
    return (
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center p-1">
                <img src="/LOGO.png" alt="iDA" className="h-full w-full object-contain" />
              </div>
              <Link to="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                iDA
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Profile dropdown items
  const profileMenuItems = [
    {
      key: 'profile',
      label: t('navigation.profile'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      onClick: () => navigate(`/${user.role}/profile`),
    },
    {
      key: 'settings',
      label: t('navigation.settings'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: () => navigate(`/${user.role}/settings`),
    },
    {
      key: 'divider',
      divider: true,
    },
    {
      key: 'logout',
      label: t('common.logout'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      onClick: handleLogout,
      variant: 'danger' as const,
    },
  ];

  return (
    <nav
      className={`
        bg-white
        border-b
        border-gray-200
        sticky
        top-0
        z-40
        h-16
        transition-shadow
        duration-200
        ${scrolled ? 'shadow-md' : 'shadow-sm'}
      `}
    >
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left Section */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Breadcrumb Navigation (Desktop) */}
            {breadcrumbItems.length > 0 && (
              <div className="hidden md:block flex-1 min-w-0">
                <Breadcrumb items={breadcrumbItems} showHome={false} />
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Profile Dropdown */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.email}
                    </p>
                    <div className="flex items-center gap-2 justify-end">
                      <p className="text-xs text-gray-500">{translateRole(user.role)}</p>
                      <Badge variant="success" size="sm" className="text-xs">
                        {translateRole(user.role)}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <Avatar
                      src={user.profile_picture}
                      alt={user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}
                      fallback={
                        user.first_name && user.last_name
                          ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                          : user.email[0].toUpperCase()
                      }
                      size="sm"
                    />
                    {/* Role Badge on Avatar */}
                    <div className="absolute -bottom-1 -right-1">
                      <Badge variant="success" size="sm" className="text-xs px-1.5 py-0.5">
                        {user.role?.[0]?.toUpperCase() || 'U'}
                      </Badge>
                    </div>
                  </div>
                  <svg className="hidden sm:block w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              }
              items={profileMenuItems}
              position="bottom-right"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

