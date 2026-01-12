import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * DashboardLayout Component Props
 */
export interface DashboardLayoutProps {
  /**
   * Page content to render
   */
  children: React.ReactNode;
  /**
   * Whether sidebar should be collapsed by default
   * @default false
   */
  defaultCollapsed?: boolean;
}

/**
 * DashboardLayout Component
 * 
 * Main layout component for dashboard pages with sidebar and navbar.
 * 
 * Features:
 * - Sidebar navigation (collapsible)
 * - Top navbar
 * - Scrollable content area
 * - Responsive design (sidebar becomes drawer on mobile)
 * - Proper spacing and layout
 * - Background color for content area
 * - Smooth transitions
 * 
 * @example
 * ```tsx
 * // Basic layout
 * <DashboardLayout>
 *   <div>Dashboard content</div>
 * </DashboardLayout>
 * 
 * // With collapsed sidebar by default
 * <DashboardLayout defaultCollapsed>
 *   <AdminDashboard />
 * </DashboardLayout>
 * ```
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  defaultCollapsed = false,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Close mobile sidebar on resize to desktop
      if (window.innerWidth >= 1024 && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileOpen]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileClose = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        isMobileOpen={isMobileOpen}
        onMobileClose={handleMobileClose}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar
          onMenuClick={() => setIsMobileOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50"
          role="main"
        >
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Fade-in animation styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;

