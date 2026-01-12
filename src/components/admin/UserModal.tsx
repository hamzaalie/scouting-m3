import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import PasswordInput from '../common/PasswordInput';
import { createUser, updateUser } from '../../services/userService';
import type { UserListItem, UserCreateUpdate, UserRole } from '../../types/user';
import { ROLE_OPTIONS } from '../../types/user';
import { showSuccess } from '../../utils/toast';
import { handleApiError } from '../../utils/errorHandler';

/**
 * UserModal Component Props
 */
export interface UserModalProps {
	/**
	 * Whether the modal is open
	 */
	isOpen: boolean;
	/**
	 * Callback when modal should close
	 */
	onClose: () => void;
	/**
	 * User object for edit mode (null for create mode)
	 */
	user: UserListItem | null;
	/**
	 * Callback after successful create/update
	 */
	onSuccess: () => void;
}

/**
 * UserModal Component
 *
 * Modal form for creating and editing users.
 * Features:
 * - Form validation (email, password, role, names)
 * - Password fields only in create mode
 * - Auto-population in edit mode
 * - Error handling with toast notifications
 */
const UserModal: React.FC<UserModalProps> = ({
	isOpen,
	onClose,
	user,
	onSuccess,
}) => {
	const { t } = useTranslation();
	const isEditMode = !!user;

	// Form state
	const [formData, setFormData] = useState<UserCreateUpdate>({
		email: '',
		first_name: '',
		last_name: '',
		phone: '',
		role: 'player',
		is_active: true,
		password: '',
		password2: '',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState<boolean>(false);

	const firstInputId = useMemo(() => `user-email-input-${Math.random().toString(36).substr(2, 9)}`, []);

	// Initialize form when user prop changes or modal opens
	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			setFormData({
				email: '',
				first_name: '',
				last_name: '',
				phone: '',
				role: 'player',
				is_active: true,
				password: '',
				password2: '',
			});
			setErrors({});
			return;
		}

		// Populate form when editing
		if (user) {
			setFormData({
				email: user.email || '',
				first_name: user.first_name || '',
				last_name: user.last_name || '',
				phone: user.phone || '',
				role: user.role || 'player',
				is_active: user.is_active !== undefined ? user.is_active : true,
				password: '',
				password2: '',
			});
		} else {
			// Reset for create mode
			setFormData({
				email: '',
				first_name: '',
				last_name: '',
				phone: '',
				role: 'player',
				is_active: true,
				password: '',
				password2: '',
			});
		}
		setErrors({});

		// Focus first input when modal opens
		setTimeout(() => {
			const firstInput = document.getElementById(firstInputId);
			firstInput?.focus();
		}, 100);
	}, [isOpen, user, firstInputId]);

	/**
	 * Handle input changes
	 */
	const handleChange = (field: keyof UserCreateUpdate, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error for this field
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	/**
	 * Validate form data
	 */
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Email validation
		if (!formData.email?.trim()) {
			newErrors.email = t('users.emailRequired');
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = t('users.invalidEmail');
		}

		// First name validation
		if (!formData.first_name?.trim()) {
			newErrors.first_name = t('users.firstNameRequired');
		}

		// Last name validation
		if (!formData.last_name?.trim()) {
			newErrors.last_name = t('users.lastNameRequired');
		}

		// Role validation
		if (!formData.role) {
			newErrors.role = t('users.roleRequired');
		}

		// Password validation (only in create mode)
		if (!isEditMode) {
			if (!formData.password) {
				newErrors.password = t('users.passwordRequired');
			} else if (formData.password.length < 8) {
				newErrors.password = t('users.passwordMinLength');
			}

			if (!formData.password2) {
				newErrors.password2 = t('users.confirmPasswordRequired');
			} else if (formData.password !== formData.password2) {
				newErrors.password2 = t('users.passwordsMustMatch');
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	/**
	 * Handle form submission
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			// Prepare data for submission
			const submitData: UserCreateUpdate = {
				email: formData.email.trim(),
				first_name: formData.first_name?.trim() || '',
				last_name: formData.last_name?.trim() || '',
				phone: formData.phone?.trim() || '',
				role: formData.role,
				is_active: formData.is_active,
			};

			// Add password fields only in create mode
			if (!isEditMode) {
				submitData.password = formData.password;
				submitData.password2 = formData.password2;
			}

			if (isEditMode && user) {
				// Update existing user
				await updateUser(user.id, submitData);
				showSuccess(t('users.userUpdatedSuccessfully'));
			} else {
				// Create new user
				await createUser(submitData);
				showSuccess(t('users.userCreatedSuccessfully'));
			}

			onSuccess();
			onClose();
		} catch (err: any) {
			console.error('Failed to save user:', err);
			const fieldErrors = handleApiError(err, t, undefined, t('users.failedToSaveUser'));
			if (fieldErrors) {
				setErrors(fieldErrors);
			}
		} finally {
			setLoading(false);
		}
	};

	// Role options for select
	const roleSelectOptions = useMemo(() => {
		return ROLE_OPTIONS.map(opt => ({
			value: opt.value,
			label: opt.label,
		}));
	}, []);

	// Active status options
	const activeOptions = useMemo(() => {
		return [
			{ value: 'true', label: t('users.active') },
			{ value: 'false', label: t('users.inactive') },
		];
	}, [t]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isEditMode ? t('users.editUser') : t('users.createUser')}
			size="md"
		>
			<form onSubmit={handleSubmit}>
				<div className="space-y-4">
					{/* Email */}
					<Input
						id={firstInputId}
						label={t('users.email')}
						type="email"
						value={formData.email}
						onChange={(e) => handleChange('email', e.target.value)}
						required
						error={errors.email}
						disabled={loading}
						helperText={t('users.emailHelper')}
					/>

					{/* First Name */}
					<Input
						label={t('users.firstName')}
						type="text"
						value={formData.first_name}
						onChange={(e) => handleChange('first_name', e.target.value)}
						required
						error={errors.first_name}
						disabled={loading}
					/>

					{/* Last Name */}
					<Input
						label={t('users.lastName')}
						type="text"
						value={formData.last_name}
						onChange={(e) => handleChange('last_name', e.target.value)}
						required
						error={errors.last_name}
						disabled={loading}
					/>

					{/* Phone */}
					<Input
						label={t('users.phone')}
						type="tel"
						value={formData.phone}
						onChange={(e) => handleChange('phone', e.target.value)}
						error={errors.phone}
						disabled={loading}
					/>

					{/* Role */}
					<Select
						label={t('users.role')}
						options={roleSelectOptions}
						value={formData.role}
						onChange={(value) => handleChange('role', value as UserRole)}
						required
						error={errors.role}
						disabled={loading}
					/>

					{/* Active Status */}
					<Select
						label={t('users.status')}
						options={activeOptions}
						value={formData.is_active ? 'true' : 'false'}
						onChange={(value) => handleChange('is_active', value === 'true')}
						required
						disabled={loading}
					/>

					{/* Password fields - only in create mode */}
					{!isEditMode && (
						<>
							<PasswordInput
								label={t('users.password')}
								value={formData.password}
								onChange={(e) => handleChange('password', e.target.value)}
								required
								error={errors.password}
								disabled={loading}
							/>

							<PasswordInput
								label={t('users.confirmPassword')}
								value={formData.password2}
								onChange={(e) => handleChange('password2', e.target.value)}
								required
								error={errors.password2}
								disabled={loading}
							/>
						</>
					)}
				</div>

				{/* Form Actions */}
				<div className="mt-6 flex justify-end gap-3">
					<button
						type="button"
						onClick={onClose}
						disabled={loading}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{t('common.cancel')}
					</button>
					<button
						type="submit"
						disabled={loading}
						className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? t('common.saving') : isEditMode ? t('common.update') : t('common.create')}
					</button>
				</div>
			</form>
		</Modal>
	);
};

export default UserModal;

