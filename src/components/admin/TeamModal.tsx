import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Input from '../common/Input';
import { createTeam, updateTeam, handleApiError } from '../../services/teamService';
import type { Team, TeamCreateUpdate } from '../../types/team';
import { showSuccess, showError } from '../../utils/toast';
import { compressImage, validateImage } from '../../utils/imageCompression';

/**
 * TeamModal Component Props
 */
export interface TeamModalProps {
	/**
	 * Whether the modal is open
	 */
	isOpen: boolean;
	/**
	 * Callback when modal should close
	 */
	onClose: () => void;
	/**
	 * Team object for edit mode (null for create mode)
	 */
	team: Team | null;
	/**
	 * Callback after successful create/update
	 */
	onSuccess: () => void;
}

/**
 * TeamModal Component
 *
 * Modal form for creating and editing teams with file upload support.
 * Features:
 * - Form validation (name, location, founded year, logo)
 * - Image preview for logo uploads
 * - Auto-population in edit mode
 * - Error handling with toast notifications
 * - Memory leak prevention (preview URL cleanup)
 */
const TeamModal: React.FC<TeamModalProps> = ({
	isOpen,
	onClose,
	team,
	onSuccess,
}) => {
	const { t } = useTranslation();

	// Form state
	const [formData, setFormData] = useState<TeamCreateUpdate>({
		name: '',
		location: '',
		founded_year: null,
		logo: null,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState<boolean>(false);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);

	// Refs for cleanup
	const logoPreviewUrlRef = useRef<string | null>(null);
	const firstInputId = useMemo(() => `team-name-input-${Math.random().toString(36).substr(2, 9)}`, []);

	// Initialize form when team prop changes or modal opens
	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			setFormData({
				name: '',
				location: '',
				founded_year: null,
				logo: null,
			});
			setErrors({});
			setLogoPreview(null);
			// Cleanup preview URL
			if (logoPreviewUrlRef.current) {
				URL.revokeObjectURL(logoPreviewUrlRef.current);
				logoPreviewUrlRef.current = null;
			}
			return;
		}

		// Populate form when editing
		if (team) {
			setFormData({
				name: team.name || '',
				location: team.location || '',
				founded_year: team.founded_year,
				logo: null, // Don't pre-populate file input
			});
			// Set preview to existing logo URL if available
			if (team.logo) {
				setLogoPreview(team.logo);
			} else {
				setLogoPreview(null);
			}
		} else {
			// Reset for create mode
			setFormData({
				name: '',
				location: '',
				founded_year: null,
				logo: null,
			});
			setLogoPreview(null);
		}
		setErrors({});

		// Focus first input when modal opens
		setTimeout(() => {
			const firstInput = document.getElementById(firstInputId);
			firstInput?.focus();
		}, 100);
	}, [isOpen, team]);

	// Cleanup preview URL on unmount
	useEffect(() => {
		return () => {
			if (logoPreviewUrlRef.current) {
				URL.revokeObjectURL(logoPreviewUrlRef.current);
			}
		};
	}, []);

	/**
	 * Handle logo file upload
	 */
	const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			setFormData((prev) => ({ ...prev, logo: null }));
			setLogoPreview(null);
			// Cleanup previous preview
			if (logoPreviewUrlRef.current) {
				URL.revokeObjectURL(logoPreviewUrlRef.current);
				logoPreviewUrlRef.current = null;
			}
			return;
		}

		// Validate image file
		const validation = validateImage(file, 5);
		if (!validation.isValid) {
			setErrors((prev) => ({
				...prev,
				logo: t(validation.error!),
			}));
			return;
		}

		// Clear logo error
		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors.logo;
			return newErrors;
		});

		try {
			// Compress image
			const compressedFile = await compressImage(file, {
				maxSizeMB: 0.5,
				maxWidthOrHeight: 1024,
			});

			// Create preview URL
			// Cleanup previous preview URL
			if (logoPreviewUrlRef.current) {
				URL.revokeObjectURL(logoPreviewUrlRef.current);
			}

			const previewUrl = URL.createObjectURL(compressedFile);
			logoPreviewUrlRef.current = previewUrl;
			setLogoPreview(previewUrl);
			setFormData((prev) => ({ ...prev, logo: compressedFile }));
		} catch (error) {
			console.error('Failed to process image:', error);
			showError(t('common.failedToProcessImage'));
		}
	};

	/**
	 * Validate form data
	 */
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Validate name
		if (!formData.name.trim()) {
			newErrors.name = t('teams.nameRequired');
		} else if (formData.name.length > 100) {
			newErrors.name = t('teams.nameMaxLength');
		}

		// Validate location
		if (!formData.location.trim()) {
			newErrors.location = t('teams.locationRequired');
		}

		// Validate founded year
		if (formData.founded_year !== null && formData.founded_year !== undefined) {
			const currentYear = new Date().getFullYear();
			if (formData.founded_year < 1800 || formData.founded_year > currentYear) {
				newErrors.founded_year = t('teams.foundedYearRange', { currentYear });
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	/**
	 * Handle form submission
	 */
	const handleSubmit = async () => {
		// Validate form
		if (!validateForm()) {
			return;
		}

		console.log('[TeamModal] Submitting form data:', formData);
		console.log('[TeamModal] Logo details:', {
			hasLogo: !!formData.logo,
			logo: formData.logo,
			name: formData.logo?.name,
			size: formData.logo?.size,
			type: formData.logo?.type,
			isFile: formData.logo instanceof File,
			isBlob: formData.logo instanceof Blob,
			constructor: formData.logo?.constructor?.name
		});

		setLoading(true);
		setErrors({});

		try {
			if (team) {
				// Update existing team
				await updateTeam(team.id, formData);
				showSuccess(t('teams.teamUpdated'));
			} else {
				// Create new team
				await createTeam(formData);
				showSuccess(t('teams.teamCreated'));
			}

			// Call success callback
			onSuccess();

			// Close modal
			onClose();
		} catch (error: any) {
			// Handle API errors
			const errorMessage = handleApiError(error);
			showError(errorMessage);

			// Try to parse validation errors from API response
			if (error?.response?.data) {
				const apiErrors: Record<string, string> = {};
				const data = error.response.data;

				// DRF validation errors are typically in format: { field: ["error message"] }
				Object.keys(data).forEach((key) => {
					if (Array.isArray(data[key]) && data[key].length > 0) {
						apiErrors[key] = data[key][0];
					} else if (typeof data[key] === 'string') {
						apiErrors[key] = data[key];
					}
				});

				if (Object.keys(apiErrors).length > 0) {
					setErrors(apiErrors);
				}
			}
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Handle input changes
	 */
	const handleInputChange = (field: keyof TeamCreateUpdate, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error for this field when user starts typing
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const isEditMode = !!team;
	const currentYear = new Date().getFullYear();

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isEditMode ? t('teams.editTeam') : t('teams.addTeam')}
			size="md"
			footer={{
				secondary: {
					label: t('common.cancel'),
					onClick: onClose,
				},
				primary: {
					label: loading 
						? t('common.saving')
						: (isEditMode ? t('common.update') : t('common.create')),
					onClick: handleSubmit,
					loading: loading,
				},
			}}
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
				className="space-y-4"
			>
				{/* Team Name */}
				<Input
					id={firstInputId}
					label={t('teams.teamName')}
					type="text"
					value={formData.name}
					onChange={(e) => handleInputChange('name', e.target.value)}
					error={errors.name}
					required
					maxLength={100}
					disabled={loading}
					placeholder={t('teams.teamNamePlaceholder')}
				/>

				{/* Location */}
				<Input
					label={t('teams.location')}
					type="text"
					value={formData.location}
					onChange={(e) => handleInputChange('location', e.target.value)}
					error={errors.location}
					required
					disabled={loading}
					placeholder={t('teams.locationPlaceholder')}
				/>

				{/* Founded Year */}
				<Input
					label={t('teams.foundedYear')}
					type="number"
					value={formData.founded_year || ''}
					onChange={(e) => {
						const value = e.target.value;
						handleInputChange(
							'founded_year',
							value === '' ? null : parseInt(value, 10)
						);
					}}
					error={errors.founded_year}
					min={1800}
					max={currentYear}
					disabled={loading}
					placeholder={t('teams.foundedYearPlaceholder')}
					helperText={t('teams.foundedYearHelper', { currentYear })}
				/>

				{/* Logo Upload */}
				<div className="space-y-2">
					<label className="block text-sm font-medium text-gray-700">
						{t('teams.teamLogo')}
					</label>

					{/* Logo Preview */}
					{logoPreview && (
						<div className="mb-3">
							<img
								src={logoPreview}
								alt={t('teams.teamLogoPreview')}
								className="h-20 w-20 rounded-lg object-cover border-2 border-gray-200"
							/>
						</div>
					)}

					{/* File Input */}
					<input
						type="file"
						accept="image/*"
						onChange={handleLogoUpload}
						disabled={loading}
						className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
					/>

					{/* Error Message */}
					{errors.logo && (
						<p className="text-sm text-red-600 flex items-center gap-1">
							<svg
								className="w-4 h-4 flex-shrink-0"
								fill="currentColor"
								viewBox="0 0 20 20"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clipRule="evenodd"
								/>
							</svg>
							<span>{errors.logo}</span>
						</p>
					)}

					{/* Helper Text */}
					{!errors.logo && (
						<p className="text-sm text-gray-500">
							{t('teams.logoHelperText')}
						</p>
					)}
				</div>
			</form>
		</Modal>
	);
};

export default TeamModal;

