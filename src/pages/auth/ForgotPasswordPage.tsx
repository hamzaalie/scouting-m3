import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

/**
 * Forgot Password Page
 * 
 * Page for users to request a password reset.
 */
const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!emailRegex.test(email)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement password reset API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setSubmitted(true);
    } catch (err) {
      setError(t('auth.resetEmailFailed'));
    } finally {
      setLoading(false);
    }
  };

  const EmailIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.checkYourEmail')}</h2>
            <p className="text-gray-600 mb-6">
              {t('auth.resetLinkSent', { email })}
            </p>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              {t('auth.backToLogin')}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.forgotPassword')}</h2>
          <p className="text-gray-600">
            {t('auth.forgotPasswordDescription')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="email"
            label={t('auth.emailAddress')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder={t('auth.emailPlaceholder')}
            error={error || undefined}
            icon={EmailIcon}
            required
            autoComplete="email"
            disabled={loading}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {t('auth.sendResetLink')}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            {t('auth.backToLogin')}
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;

