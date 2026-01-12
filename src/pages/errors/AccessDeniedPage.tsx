import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getDashboardPath } from '../../utils/redirects';

/**
 * Access Denied (403) Page
 * 
 * Beautiful error page shown when a user tries to access a resource
 * they don't have permission for.
 * 
 * Features:
 * - Lock icon (security symbol)
 * - "Access Denied" title
 * - Role information display
 * - "Go to Dashboard" button (redirects to user's appropriate dashboard)
 * - Contact admin message
 */
const AccessDeniedPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as { requiredRoles?: string[]; userRole?: string; from?: string } | undefined;

  /**
   * Handle "Go to Dashboard" button click
   * Redirects to user's appropriate dashboard based on their role
   */
  const handleGoToDashboard = () => {
    const dashboardPath = getDashboardPath(user?.role);
    navigate(dashboardPath, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-lg w-full text-center animate-fade-in-up">
        {/* Lock Icon */}
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 animate-scale-up">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-900 mb-2">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('errors.accessDenied')}</h2>

        {/* Message */}
        <p className="text-gray-600 mb-6 text-lg">
          {t('errors.accessDeniedMessage')}
        </p>

        {/* Role Information */}
        {state?.requiredRoles && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold text-gray-900">{t('errors.requiredRoles')}</span>{' '}
              <span className="font-medium text-blue-600">{state.requiredRoles.join(', ')}</span>
            </p>
            {state.userRole && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{t('errors.yourRole')}</span>{' '}
                <span className="font-medium capitalize text-red-600">{state.userRole}</span>
              </p>
            )}
            {state.from && (
              <p className="text-xs text-gray-500 mt-2">
                {t('errors.attempted')}: <span className="font-mono">{state.from}</span>
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="min-w-[120px]"
          >
            {t('common.back')}
          </Button>
          <Button
            variant="primary"
            onClick={handleGoToDashboard}
            className="min-w-[120px]"
          >
            {t('errors.goToDashboard')}
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {t('errors.contactAdministrator')}
          </p>
        </div>
      </Card>

      {/* Animation styles */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.5s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
};

export default AccessDeniedPage;

