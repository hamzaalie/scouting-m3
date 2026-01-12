import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Button from '../common/Button';
import PasswordInput from '../common/PasswordInput';
import RoleSelector from '../common/RoleSelector';
import type { UserRole } from '../common/RoleSelector';
import { useAuth } from '../../hooks/useAuth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

/**
 * Register Form Component
 * 
 * Features:
 * - First Name & Last Name
 * - Email with validation
 * - Phone (optional)
 * - Role selection with cards
 * - Password with strength meter
 * - Confirm Password
 * - Terms & Conditions checkbox
 * - Real-time validation
 * - Auto-login after registration
 */
const RegisterForm: React.FC = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'player' as UserRole,
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: string;
    acceptTerms?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    let hasErrors = false;

    if (!formData.first_name.trim()) {
      setErrors((prev) => ({ ...prev, first_name: t('auth.firstNameRequired') }));
      hasErrors = true;
    }

    if (!formData.last_name.trim()) {
      setErrors((prev) => ({ ...prev, last_name: t('auth.lastNameRequired') }));
      hasErrors = true;
    }

    if (!emailRegex.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: t('auth.invalidEmail') }));
      hasErrors = true;
    }

    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      setErrors((prev) => ({ ...prev, phone: t('auth.invalidPhone') }));
      hasErrors = true;
    }

    if (!formData.role) {
      setErrors((prev) => ({ ...prev, role: t('auth.roleRequired') }));
      hasErrors = true;
    }

    if (formData.password.length < 8) {
      setErrors((prev) => ({ ...prev, password: t('auth.passwordMinLength') }));
      hasErrors = true;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: t('auth.passwordsDoNotMatch') }));
      hasErrors = true;
    }

    if (!formData.acceptTerms) {
      setErrors((prev) => ({ ...prev, acceptTerms: t('auth.acceptTermsRequired') }));
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
      });

      // Redirect to check-email page instead of auto-login
      navigate('/check-email', { 
        replace: true,
        state: { email: formData.email }
      });
    } catch (error) {
      // Error handling is done in AuthContext with toast
      // Form will remain on register page
    }
  };

  // Icon components
  const UserIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const EmailIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const PhoneIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="text"
          label={t('auth.firstName')}
          value={formData.first_name}
          onChange={(e) => {
            setFormData({ ...formData, first_name: e.target.value });
            if (errors.first_name) setErrors((prev) => ({ ...prev, first_name: undefined }));
          }}
          placeholder={t('auth.firstNamePlaceholder')}
          error={errors.first_name}
          icon={UserIcon}
          required
          autoComplete="given-name"
          disabled={loading}
        />
        <Input
          type="text"
          label={t('auth.lastName')}
          value={formData.last_name}
          onChange={(e) => {
            setFormData({ ...formData, last_name: e.target.value });
            if (errors.last_name) setErrors((prev) => ({ ...prev, last_name: undefined }));
          }}
          placeholder={t('auth.lastNamePlaceholder')}
          error={errors.last_name}
          icon={UserIcon}
          required
          autoComplete="family-name"
          disabled={loading}
        />
      </div>

      {/* Email */}
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

      {/* Phone (Optional) */}
      <Input
        type="tel"
        label={t('auth.phoneNumberOptional')}
        value={formData.phone}
        onChange={(e) => {
          setFormData({ ...formData, phone: e.target.value });
          if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
        }}
        placeholder={t('auth.phonePlaceholder')}
        error={errors.phone}
        icon={PhoneIcon}
        autoComplete="tel"
        disabled={loading}
      />

      {/* Role Selection */}
      <div>
        <RoleSelector
          label={t('auth.selectYourRole')}
          value={formData.role}
          onChange={(role) => {
            setFormData({ ...formData, role });
            if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
          }}
          error={errors.role}
          required
          disabled={loading}
        />
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PasswordInput
          label={t('auth.password')}
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder={t('auth.enterPassword')}
          error={errors.password}
          showStrengthMeter={true}
          minLength={8}
          required
          autoComplete="new-password"
          disabled={loading}
        />
        <PasswordInput
          label={t('auth.confirmPassword')}
          value={formData.confirmPassword}
          onChange={(e) => {
            setFormData({ ...formData, confirmPassword: e.target.value });
            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          error={errors.confirmPassword}
          showStrengthMeter={false}
          required
          autoComplete="new-password"
          disabled={loading}
        />
      </div>

      {/* Terms & Conditions */}
      <div>
        <label className="inline-flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="w-5 h-5 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            checked={formData.acceptTerms}
            onChange={(e) => {
              setFormData({ ...formData, acceptTerms: e.target.checked });
              if (errors.acceptTerms) setErrors((prev) => ({ ...prev, acceptTerms: undefined }));
            }}
            disabled={loading}
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
            {t('auth.iAgreeTo')}{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700 underline">
              {t('auth.termsAndConditions')}
            </Link>
            {' '}{t('auth.and')}{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700 underline">
              {t('auth.privacyPolicy')}
            </Link>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.acceptTerms}
          </p>
        )}
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
          {t('auth.createAccount')}
        </Button>
      </div>

      {/* Login Link */}
      <div className="text-center pt-2">
        <p className="text-sm text-gray-600">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
          >
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
