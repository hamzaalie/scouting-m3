import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getDashboardPath } from '../../utils/redirects';

/**
 * Not Found (404) Page
 * 
 * Beautiful error page shown when a user navigates to a route that doesn't exist.
 * 
 * Features:
 * - Large 404 text
 * - "Page not found" message
 * - Friendly illustration/icon
 * - "Go back home" button
 * - Centered, beautiful design
 */
const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  /**
   * Handle "Go to Dashboard" button click
   * Redirects to user's appropriate dashboard or home
   */
  const handleGoToDashboard = () => {
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
        {/* Friendly Illustration Icon */}
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 animate-scale-up">
            <svg
              className="h-10 w-10 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Large 404 Text */}
        <h1 className="text-7xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('errors.notFound')}</h2>

        {/* Friendly Message */}
        <p className="text-gray-600 mb-8 text-lg">
          {t('errors.pageNotFoundMessage')}
        </p>

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
            <Link to="/" className="text-blue-600 hover:text-blue-700 underline font-medium">
              {t('errors.goHome')}
            </Link>
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

export default NotFoundPage;

