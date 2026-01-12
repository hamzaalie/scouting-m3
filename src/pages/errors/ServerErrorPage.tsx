import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getDashboardPath } from '../../utils/redirects';

/**
 * Server Error (500) Page
 * 
 * Beautiful error page shown when a server error occurs or something goes wrong.
 * 
 * Features:
 * - Error icon
 * - "Something went wrong" message
 * - "Please try again later" suggestion
 * - "Go home" button
 * - Refresh option
 */
const ServerErrorPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  /**
   * Handle page refresh
   * Reloads the entire page
   */
  const handleRefresh = () => {
    window.location.reload();
  };

  /**
   * Handle "Go Home" button click
   * Redirects to user's appropriate dashboard
   */
  const handleGoHome = () => {
    if (user?.role) {
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-lg w-full text-center animate-fade-in-up">
        {/* Error Icon */}
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-7xl font-bold text-gray-900 mb-2">500</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('errors.serverError')}</h2>

        {/* Messages */}
        <p className="text-gray-600 mb-2 text-lg font-medium">
          {t('errors.somethingWentWrong')}
        </p>
        <p className="text-gray-600 mb-8">
          {t('errors.serverErrorMessage')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="min-w-[120px]"
          >
            {t('errors.refreshPage')}
          </Button>
          <Button
            variant="primary"
            onClick={handleGoHome}
            className="min-w-[120px]"
          >
            {t('errors.goHome')}
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {t('errors.contactSupport')}
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

export default ServerErrorPage;

