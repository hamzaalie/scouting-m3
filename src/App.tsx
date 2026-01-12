import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { getDashboardPath, getLoginPath } from './utils/redirects';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth Pages - Keep these eagerly loaded for faster initial login
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import CheckEmailPage from './pages/auth/CheckEmailPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Lazy load all other pages for code splitting
// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const PlayersPage = lazy(() => import('./pages/admin/PlayersPage'));
const TeamsPage = lazy(() => import('./pages/admin/TeamsPage'));
const MatchesPage = lazy(() => import('./pages/admin/MatchesPage'));
const MatchStatsPage = lazy(() => import('./pages/admin/MatchStatsPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const AdminStatsPage = lazy(() => import('./pages/admin/StatsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/ProfilePage'));

// Player Pages
const PlayerDashboard = lazy(() => import('./pages/player/PlayerDashboard'));
const PlayerProfilePage = lazy(() => import('./pages/player/ProfilePage'));
const PlayerSettingsPage = lazy(() => import('./pages/player/SettingsPage'));
const PlayerStatsPage = lazy(() => import('./pages/player/StatsPage'));
const PlayerMatchesPage = lazy(() => import('./pages/player/MatchesPage'));
const PlayerHighlightsPage = lazy(() => import('./pages/player/HighlightsPage'));

// Scout Pages
const ScoutDashboard = lazy(() => import('./pages/scout/ScoutDashboard'));
const ScoutProfilePage = lazy(() => import('./pages/scout/ProfilePage'));
const ScoutSettingsPage = lazy(() => import('./pages/scout/SettingsPage'));
const ScoutPlayersPage = lazy(() => import('./pages/scout/PlayersPage'));
const ScoutMatchesPage = lazy(() => import('./pages/scout/MatchesPage'));
const ScoutReportsPage = lazy(() => import('./pages/scout/ReportsPage'));
const ScoutFavoritesPage = lazy(() => import('./pages/scout/FavoritesPage'));
const ScoutPlayerDetailPage = lazy(() => import('./pages/scout/PlayerDetailPage'));

// Error Pages
const AccessDeniedPage = lazy(() => import('./pages/errors/AccessDeniedPage'));
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'));
const ServerErrorPage = lazy(() => import('./pages/errors/ServerErrorPage'));

/**
 * Public Route Component
 * 
 * Redirects authenticated users to their dashboard.
 * Allows unauthenticated users to access public pages (login, register).
 * 
 * REDIRECT LOGIC:
 * - If authenticated → Redirect to role-based dashboard using getDashboardPath()
 * - If not authenticated → Render public page
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect to role-based dashboard using redirect utility
    const dashboardPath = getDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

/**
 * Role-Based Redirect Component
 * 
 * Handles root route (/) redirects based on authentication status.
 * 
 * REDIRECT LOGIC:
 * - If not authenticated → Redirect to /login
 * - If authenticated → Redirect to role-based dashboard using getDashboardPath()
 * 
 * This component uses the redirect utility functions for consistent navigation.
 */
const RoleBasedRedirect: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={getLoginPath()} replace />;
  }

  // If authenticated, redirect to role-based dashboard using redirect utility
  if (user?.role) {
    const dashboardPath = getDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  // Fallback: redirect to login
  return <Navigate to={getLoginPath()} replace />;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isDashboardPage = location.pathname.startsWith('/admin') || 
                          location.pathname.startsWith('/player') || 
                          location.pathname.startsWith('/scout');
  
  // Detect network status changes globally
  useNetworkStatus();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Only show Navbar/Footer for non-auth, non-dashboard pages */}
      {!isAuthPage && !isDashboardPage && <Navbar />}
      <main className="flex-grow">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        }>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          {/* 
            ============================================
            ADMIN ROUTES (role: admin)
            ============================================
          */}
          {/* Admin dashboard route - supports both /admin and /admin/dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/players"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlayersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TeamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/matches"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MatchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/matches/:id/stats"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MatchStatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />

          {/* 
            ============================================
            PLAYER ROUTES (role: player)
            ============================================
            All player routes are protected with ProtectedRoute component.
            Only users with role='player' can access these routes.
            
            TESTING SCENARIOS:
            1. Unauthenticated user tries /player/dashboard → redirects to /login
            2. Admin user tries /player/dashboard → redirects to /403 (Access Denied)
            3. Player user accesses /player/dashboard → shows PlayerDashboard
            4. Player user accesses /player/stats → shows PlayerStatsPage
            5. Player user accesses /player/highlights → shows PlayerHighlightsPage
          */}
          {/* Player dashboard route - supports both /player and /player/dashboard */}
          <Route
            path="/player/dashboard"
            element={
              <ProtectedRoute allowedRoles={['player']}>
                <PlayerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/player"
            element={
              <ProtectedRoute allowedRoles={['player']}>
                <PlayerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/player/stats"
            element={
              <ProtectedRoute allowedRoles={['player']}>
                <PlayerStatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/player/matches"
            element={
              <ProtectedRoute allowedRoles={['player']}>
                <PlayerMatchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/player/profile"
            element={
              <ProtectedRoute allowedRoles={['player']}>
                <PlayerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/player/settings"
            element={
              <ProtectedRoute allowedRoles={['player']}>
                <PlayerSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/player/highlights"
            element={
              <ProtectedRoute allowedRoles={['player']}>
                <PlayerHighlightsPage />
              </ProtectedRoute>
            }
          />

          {/* 
            ============================================
            SCOUT ROUTES (role: scout)
            ============================================
            All scout routes are protected with ProtectedRoute component.
            Only users with role='scout' can access these routes.
            
            TESTING SCENARIOS:
            1. Unauthenticated user tries /scout/dashboard → redirects to /login
            2. Admin user tries /scout/dashboard → redirects to /403 (Access Denied)
            3. Scout user accesses /scout/dashboard → shows ScoutDashboard
            4. Scout user accesses /scout/players → shows ScoutPlayersPage
            5. Scout user accesses /scout/players/:id → shows PlayerDetailPage
          */}
          {/* Scout dashboard route - supports both /scout and /scout/dashboard */}
          <Route
            path="/scout/dashboard"
            element={
              <ProtectedRoute allowedRoles={['scout']}>
                <ScoutDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scout"
            element={
              <ProtectedRoute allowedRoles={['scout']}>
                <ScoutDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scout/players"
            element={
              <ProtectedRoute allowedRoles={['scout']}>
                <ScoutPlayersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scout/players/:id"
            element={
              <ProtectedRoute allowedRoles={['scout']}>
                <ScoutPlayerDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scout/matches"
            element={
              <ProtectedRoute allowedRoles={['scout']}>
                <ScoutMatchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scout/reports"
            element={
              <ProtectedRoute allowedRoles={['scout']}>
                <ScoutReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scout/favorites"
            element={
              <ProtectedRoute allowedRoles={['scout']}>
                <ScoutFavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scout/profile"
            element={
              <ProtectedRoute allowedRoles={['scout']}>
                <ScoutProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scout/settings"
            element={
              <ProtectedRoute allowedRoles={['scout']}>
                <ScoutSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* 
            ============================================
            ERROR ROUTES
            ============================================
            Error pages for various HTTP error scenarios.
            These are public routes (no authentication required).
          */}
          <Route path="/403" element={<AccessDeniedPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/500" element={<ServerErrorPage />} />

          {/* 
            ============================================
            CATCH-ALL: 404 for unknown routes
            ============================================
            Must be at the end - catches any route that doesn't match above.
            TESTING SCENARIO: Navigate to /unknown-route → shows NotFoundPage
          */}
          <Route path="*" element={<NotFoundPage />} />

          {/* 
            ============================================
            ROOT ROUTE: Redirect based on auth status
            ============================================
            Handles root path (/) redirects:
            - If not authenticated → Redirect to /login
            - If authenticated → Redirect to role-based dashboard
            
            TESTING SCENARIOS:
            1. Unauthenticated user visits / → redirects to /login
            2. Admin user visits / → redirects to /admin/dashboard
            3. Player user visits / → redirects to /player/dashboard
            4. Scout user visits / → redirects to /scout/dashboard
            5. Token expires while on protected route → redirects to /login
          */}
          <Route
            path="/"
            element={<RoleBasedRedirect />}
          />
        </Routes>
        </Suspense>
      </main>
      {!isAuthPage && !isDashboardPage && <Footer />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '0.5rem',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
