import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Check Email Page
 * 
 * Shown after successful registration.
 * Tells user to check their email for verification link.
 */
const CheckEmailPage: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const email = (location.state as any)?.email || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('auth.checkYourEmail')}
          </h1>
          <p className="text-gray-600">
            {t('auth.verificationEmailSent')}
          </p>
        </div>

        {/* Email Display */}
        {email && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-gray-500 mb-1">{t('auth.emailSentTo')}</p>
            <p className="font-semibold text-gray-900">{email}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('auth.nextSteps')}
          </h2>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex">
              <span className="font-semibold mr-2">1.</span>
              <span>{t('auth.checkInbox')}</span>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">2.</span>
              <span>{t('auth.clickVerificationLink')}</span>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">3.</span>
              <span>{t('auth.loginAfterVerification')}</span>
            </li>
          </ol>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2 text-sm flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {t('auth.emailNotReceived')}
          </h3>
          <ul className="text-xs text-yellow-800 space-y-1">
            <li>• {t('auth.checkSpamFolder')}</li>
            <li>• {t('auth.waitFewMinutes')}</li>
            <li>• {t('auth.checkEmailCorrect')}</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to="/login"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
          >
            {t('auth.goToLogin')}
          </Link>
          <Link
            to="/register"
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-center"
          >
            {t('auth.backToRegister')}
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {t('auth.needHelp')}{' '}
          <a href="mailto:support@scoutingplatform.com" className="text-blue-600 hover:text-blue-700 font-semibold">
            {t('auth.contactSupport')}
          </a>
        </p>
      </div>
    </div>
  );
};

export default CheckEmailPage;
