import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import { updateProfile, type User } from '../../services/authService';
import { showSuccess, showError } from '../../utils/toast';

/**
 * ProfileEditModal Component Props
 */
export interface ProfileEditModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Current user data
   */
  user: User;
  /**
   * Callback after successful update
   */
  onSuccess: (updatedUser: User) => void;
}

/**
 * Form data interface
 */
interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  bio: string;
}

/**
 * Form errors interface
 */
interface FormErrors {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
}

/**
 * ProfileEditModal Component
 * 
 * Modal for editing user profile information.
 * 
 * Features:
 * - Edit first name, last name, phone, and bio
 * - Email field is disabled (cannot be changed)
 * - Form validation (required fields, phone format, bio character limit)
 * - Loading state during save
 * - Toast notifications for success/error
 * - Error messages displayed below inputs
 */
const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
  });

  // Error state
  const [errors, setErrors] = useState<FormErrors>({});

  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize form data when user changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: '', // Bio not in User interface yet, prepare for future
      });
      setErrors({});
    }
  }, [isOpen, user]);

  /**
   * Validate phone number format (optional field)
   * Accepts formats: +1234567890, (123) 456-7890, 123-456-7890, 1234567890
   */
  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.trim());
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    // Phone validation
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    // Bio validation (max 500 characters)
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
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
      // Prepare update data (only send fields that are in the User interface)
      const updateData: Partial<User> = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim() || undefined, // Send undefined if empty
      };

      // Call API to update profile
      const updatedUser = await updateProfile(updateData);

      // Show success message
      showSuccess('Profile updated successfully!');

      // Call onSuccess callback with updated user data
      onSuccess(updatedUser);

      // Close modal
      onClose();
    } catch (error) {
      // Error is already formatted by authService
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      showError(errorMessage);
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
      title={t('player.editProfile')}
      size="md"
      footer={{
        primary: {
          label: t('player.saveChanges'),
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
        {/* First Name */}
        <Input
          label={t('player.firstName')}
          type="text"
          value={formData.first_name}
          onChange={(e) => handleChange('first_name', e.target.value)}
          error={errors.first_name}
          required
          disabled={loading}
          placeholder={t('player.firstName')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        {/* Last Name */}
        <Input
          label={t('player.lastName')}
          type="text"
          value={formData.last_name}
          onChange={(e) => handleChange('last_name', e.target.value)}
          error={errors.last_name}
          required
          disabled={loading}
          placeholder={t('player.lastName')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        {/* Email (Disabled) */}
        <Input
          label={t('player.email')}
          type="email"
          value={user.email}
          disabled={true}
          helperText={t('player.emailCannotBeChanged')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        {/* Phone */}
        <Input
          label={t('player.phone')}
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          disabled={loading}
          placeholder="+1 (234) 567-8900"
          helperText={t('player.bioHelper')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
        />

        {/* Bio/Description */}
        <Textarea
          label={t('player.bio')}
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          error={errors.bio}
          disabled={loading}
          placeholder={t('player.bioPlaceholder')}
          helperText={t('player.bioHelper')}
          rows={4}
          maxLength={500}
          showCounter={true}
          autoResize={false}
        />

        {/* Information Note */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800">
            {t('player.profileInfoNote')}
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileEditModal;

