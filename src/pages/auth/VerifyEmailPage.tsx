import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import axios from 'axios';

/**
 * Email Verification Page
 * 
 * Handles email verification when user clicks link from email.
 * Shows success, error, or loading state.
 */
const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      return;
    }

    let isCancelled = false;
    let countdownTimer: NodeJS.Timeout | null = null;

    // Function to start countdown and redirect
    const startCountdownAndRedirect = () => {
      if (isCancelled) return;
      
      countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownTimer) clearInterval(countdownTimer);
            if (!isCancelled) navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    // Verify email with backend
    const verifyEmail = async () => {
      try {
        const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3000/api';
        await axios.post(`${AUTH_URL}/auth/verify-email`, { token });
        
        if (!isCancelled) {
          console.log('✅ Email verification successful');
          setStatus('success');
          startCountdownAndRedirect();
        }
      } catch (error: unknown) {
        console.error('❌ Verification error:', error);
        
        if (isCancelled) return;
        
        // Check if already verified (token not found but was successful earlier)
        const axiosError = error as { response?: { status?: number; data?: { message?: string; error?: string; detail?: string } } };
        const errorData = axiosError.response?.data;
        const errorMessage = errorData?.message || errorData?.error || errorData?.detail || '';
        
        console.log('Error message:', errorMessage);
        
        // If already verified or already used, treat as success
        if (errorMessage.toLowerCase().includes('already verified') || 
            errorMessage.toLowerCase().includes('already been verified') ||
            errorMessage.toLowerCase().includes('already used')) {
          console.log('✅ Email already verified, treating as success');
          setStatus('success');
          startCountdownAndRedirect();
        } else if (axiosError.response?.status === 400 && 
            errorMessage.toLowerCase().includes('expired')) {
          console.log('⏰ Verification link expired');
          setStatus('expired');
        } else if (axiosError.response?.status === 400 && 
            (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('not found'))) {
          console.log('❌ Invalid verification token');
          setStatus('error');
        } else {
          console.log('❌ Unknown verification error');
          setStatus('error');
        }
      }
    };

    verifyEmail();
    
    return () => {
      isCancelled = true;
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {status === 'verifying' && (
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-2">
              {t('auth.verifyingEmail')}
            </h1>
            <p className="text-gray-600">
              {t('auth.pleaseWait')}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.emailVerified')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('auth.accountActivated')}
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                {t('auth.redirectingToLogin', { seconds: countdown })}
              </p>
            </div>

            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {t('auth.goToLoginNow')}
            </Link>
          </div>
        )}

        {status === 'expired' && (
          <div className="text-center">
            {/* Warning Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.linkExpired')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('auth.verificationLinkExpired')}
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                {t('auth.requestNewLink')}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/register"
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                {t('auth.registerAgain')}
              </Link>
              <Link
                to="/login"
                className="bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                {t('auth.backToLogin')}
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.verificationFailed')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('auth.verificationError')}
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">
                {t('auth.invalidVerificationLink')}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/register"
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                {t('auth.tryRegisterAgain')}
              </Link>
              <a
                href="mailto:support@scoutingplatform.com"
                className="bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                {t('auth.contactSupport')}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
