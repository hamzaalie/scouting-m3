import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import PasswordInput from './PasswordInput';
import { changePassword, type ChangePasswordData } from '../../services/authService';
import { showSuccess, showError } from '../../utils/toast';

/**
 * PasswordChangeModal Component Props
 */
export interface PasswordChangeModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Callback after successful password change
   */
  onSuccess: () => void;
}

/**
 * Form data interface
 */
interface FormData {
  old_password: string;
  new_password: string;
  new_password2: string;
}

/**
 * Form errors interface
 */
interface FormErrors {
  old_password?: string;
  new_password?: string;
  new_password2?: string;
}

/**
 * PasswordChangeModal Component
 * 
 * Reusable modal for changing user password (works for all roles).
 * 
 * Features:
 * - Three password fields: current, new, confirm
 * - Password strength indicator on new password
 * - Comprehensive validation
 * - Loading state during submission
 * - Toast notifications
 * - Form cleared on close for security
 */
const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    old_password: '',
    new_password: '',
    new_password2: '',
  });

  // Error state
  const [errors, setErrors] = useState<FormErrors>({});

  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // Clear form when modal closes (security)
  useEffect(() => {
    if (!isOpen) {
      // Clear form after modal animation completes
      const timer = setTimeout(() => {
        setFormData({
          old_password: '',
          new_password: '',
          new_password2: '',
        });
        setErrors({});
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /**
   * Validate password strength
   * Requirements: min 8 chars, at least one letter and one number
   */
  const validatePasswordStrength = (password: string): boolean => {
    if (password.length < 8) {
      return false;
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Current password validation
    if (!formData.old_password) {
      newErrors.old_password = 'Current password is required';
    }

    // New password validation
    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (!validatePasswordStrength(formData.new_password)) {
      newErrors.new_password = 'Password must be at least 8 characters with letters and numbers';
    }

    // Confirm password validation
    if (!formData.new_password2) {
      newErrors.new_password2 = 'Please confirm your new password';
    } else if (formData.new_password !== formData.new_password2) {
      newErrors.new_password2 = 'Passwords do not match';
    }

    // Check if new password is same as old password
    if (
      formData.old_password &&
      formData.new_password &&
      formData.old_password === formData.new_password
    ) {
      newErrors.new_password = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form field changes
   */
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Prepare password change data
      const passwordData: ChangePasswordData = {
        old_password: formData.old_password,
        new_password: formData.new_password,
        new_password2: formData.new_password2,
      };

      // Call API to change password
      await changePassword(passwordData);

      // Show success message
      showSuccess('Password changed successfully!');

      // Call onSuccess callback
      onSuccess();

      // Close modal
      onClose();
    } catch (error) {
      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      
      // Check for common error patterns
      if (errorMessage.toLowerCase().includes('incorrect') || 
          errorMessage.toLowerCase().includes('wrong') ||
          errorMessage.toLowerCase().includes('old_password')) {
        setErrors({
          old_password: 'Current password is incorrect',
        });
        showError('Current password is incorrect');
      } else if (errorMessage.toLowerCase().includes('match')) {
        setErrors({
          new_password2: 'Passwords do not match',
        });
        showError('Passwords do not match');
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('settings.changePassword')}
      size="md"
      footer={{
        primary: {
          label: t('settings.changePassword'),
          onClick: handleSubmit,
          variant: 'primary',
          loading: loading,
        },
        secondary: {
          label: t('common.cancel'),
          onClick: handleClose,
          variant: 'outline',
        },
      }}
      closeOnBackdropClick={!loading}
      closeOnEsc={!loading}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-5"
      >
        {/* Current Password */}
        <PasswordInput
          label={t('settings.currentPassword')}
          value={formData.old_password}
          onChange={(e) => handleChange('old_password', e.target.value)}
          error={errors.old_password}
          required
          disabled={loading}
          placeholder={t('settings.currentPassword')}
          showStrengthMeter={false}
          autoComplete="current-password"
        />

        {/* New Password */}
        <PasswordInput
          label={t('settings.newPassword')}
          value={formData.new_password}
          onChange={(e) => handleChange('new_password', e.target.value)}
          error={errors.new_password}
          required
          disabled={loading}
          placeholder={t('settings.newPassword')}
          showStrengthMeter={true}
          minLength={8}
          helperText={t('settings.passwordRequirements')}
          autoComplete="new-password"
        />

        {/* Confirm New Password */}
        <PasswordInput
          label={t('settings.confirmPassword')}
          value={formData.new_password2}
          onChange={(e) => handleChange('new_password2', e.target.value)}
          error={errors.new_password2}
          required
          disabled={loading}
          placeholder={t('settings.confirmPassword')}
          showStrengthMeter={false}
          autoComplete="new-password"
        />

        {/* Security Note */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 mb-1">{t('settings.securityTip')}</p>
            <p className="text-sm text-amber-800">
              {t('settings.securityTipMessage')}
            </p>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">{t('settings.passwordRequirementsTitle')}</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-center gap-2">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t('settings.requirementMinChars')}
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t('settings.requirementOneLetter')}
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t('settings.requirementOneNumber')}
            </li>
          </ul>
        </div>
      </form>
    </Modal>
  );
};

export default PasswordChangeModal;

