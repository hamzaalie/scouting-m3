import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Button from '../common/Button';
import PasswordInput from '../common/PasswordInput';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../utils/redirects';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

/**
 * Login Form Component
 * 
 * Features:
 * - Email input with icon
 * - Password input with show/hide toggle
 * - Remember me checkbox
 * - Forgot password link
 * - Form validation
 * - Loading state
 * - Error handling
 */
const LoginForm: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Get intended destination from location state (set by ProtectedRoute)
  const state = location.state as { from?: { pathname: string } } | undefined;
  const from = state?.from?.pathname || null;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: true,
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    if (!emailRegex.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: t('auth.invalidEmail') }));
      return;
    }
    if (formData.password.length < 6) {
      setErrors((prev) => ({ ...prev, password: t('auth.passwordMinLength') }));
      return;
    }

    try {
      const authResponse = await login(formData.email, formData.password);
      // Redirect immediately after login - user is already set in context
      const currentUser = authResponse.user;

      // SECURITY: Redirect to intended destination if available, otherwise to role-based dashboard
      if (from && from !== '/login' && from !== '/register') {
        // Redirect back to the page the user was trying to access
        navigate(from, { replace: true });
      } else if (currentUser?.role) {
        // Redirect to role-based dashboard using redirect utility
        const dashboardPath = getDashboardPath(currentUser.role);
        navigate(dashboardPath, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      // Error handling is done in AuthContext with toast
      // Form will remain on login page
    }
  };

  // Email icon SVG
  const EmailIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email Input */}
      <Input
        type="email"
        label={t('auth.emailAddress')}
        value={formData.email}
        onChange={(e) => {
          setFormData({ ...formData, email: e.target.value });
          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        placeholder={t('auth.emailPlaceholder')}
        error={errors.email}
        icon={EmailIcon}
        required
        autoComplete="email"
        disabled={loading}
      />

      {/* Password Input */}
      <div>
        <PasswordInput
          label={t('auth.password')}
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder={t('auth.enterPassword')}
          error={errors.password}
          showStrengthMeter={false}
          required
          autoComplete="current-password"
          disabled={loading}
        />
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            checked={formData.remember}
            onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
            disabled={loading}
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
            {t('auth.rememberMe')}
          </span>
        </label>
        <Link
          to="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
        >
          {t('auth.forgotPassword')}
        </Link>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={loading}
        >
          {t('auth.loginButton')}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
