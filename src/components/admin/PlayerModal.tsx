import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Select, { type SelectOption } from '../common/Select';
import { 
	createPlayer, 
	updatePlayer, 
	getAllUsers,
} from '../../services/playerService';
import { getAllTeams } from '../../services/teamService';
import type { Player, PlayerCreateUpdate, UserOption, Position, PreferredFoot } from '../../types/player';
import type { TeamListItem } from '../../types/team';
import { showSuccess, showError } from '../../utils/toast';
import { POSITION_OPTIONS, PREFERRED_FOOT_OPTIONS } from '../../types/player';

/**
 * PlayerModal Component Props
 */
export interface PlayerModalProps {
	/**
	 * Whether the modal is open
	 */
	isOpen: boolean;
	/**
	 * Callback when modal should close
	 */
	onClose: () => void;
	/**
	 * Player object for edit mode (null for create mode)
	 */
	player: Player | null;
	/**
	 * Callback after successful create/update
	 */
	onSuccess: () => void;
}

/**
 * Tab IDs for the multi-step form
 */
const TABS = {
	PERSONAL_INFO: 0,
	TEAM_POSITION: 1,
	PHYSICAL_STATS: 2,
	BIO: 3,
} as const;

/**
 * Tab labels - will be translated in component
 */
const TAB_LABELS_KEYS = [
	'players.personalInfo',
	'players.teamPosition',
	'players.physicalStats',
	'players.biography',
];

/**
 * PlayerModal Component
 *
 * Multi-tab modal form for creating and editing players.
 * Features:
 * - 4-step form with tab navigation
 * - Form validation per tab
 * - User and team dropdown loading
 * - Position selection with visual indicators
 * - Physical stats with unit display
 * - Bio with character counter
 * - Error handling with toast notifications
 * - Responsive design
 */
const PlayerModal: React.FC<PlayerModalProps> = ({
	isOpen,
	onClose,
	player,
	onSuccess,
}) => {
	const { t } = useTranslation();
	
	// Tab labels
	const TAB_LABELS = TAB_LABELS_KEYS.map(key => t(key));
	
	// Tab state
	const [currentTab, setCurrentTab] = useState<number>(TABS.PERSONAL_INFO);

	// Form state
	const [formData, setFormData] = useState<PlayerCreateUpdate>({
		user: null as any,
		team: null,
		position: 'FW' as Position,
		jersey_number: 1,
		date_of_birth: '',
		nationality: '',
		height: 170,
		weight: 70,
		preferred_foot: 'Right' as PreferredFoot,
		bio: '',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState<boolean>(false);

	// Dropdown data
	const [users, setUsers] = useState<UserOption[]>([]);
	const [teams, setTeams] = useState<TeamListItem[]>([]);
	const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
	const [loadingTeams, setLoadingTeams] = useState<boolean>(false);

	// Determine if we're in edit mode
	const isEditMode = player !== null;

	// Load users and teams on modal open
	useEffect(() => {
		if (!isOpen) return;

		// Fetch users (only in create mode)
		if (!isEditMode) {
			setLoadingUsers(true);
			getAllUsers('player')
				.then((data) => {
					setUsers(data);
				})
				.catch((err) => {
					console.error('Failed to load users:', err);
					showError(t('players.failedToLoadUsers'));
				})
				.finally(() => {
					setLoadingUsers(false);
				});
		}

		// Fetch teams
		setLoadingTeams(true);
		getAllTeams({ page: 1, ordering: 'name' })
			.then((res) => {
				setTeams(res.results);
			})
			.catch((err) => {
				console.error('Failed to load teams:', err);
				showError(t('players.failedToLoadTeams'));
			})
			.finally(() => {
				setLoadingTeams(false);
			});
	}, [isOpen, isEditMode]);

	// Initialize form when player changes or modal opens
	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			setFormData({
				user: null as any,
				team: null,
				position: 'FW' as Position,
				jersey_number: 1,
				date_of_birth: '',
				nationality: '',
				height: 170,
				weight: 70,
				preferred_foot: 'Right' as PreferredFoot,
				bio: '',
			});
			setErrors({});
			setCurrentTab(TABS.PERSONAL_INFO);
			return;
		}

		// Populate form when editing
		if (player) {
			setFormData({
				user: player.user.id,
				team: player.team?.id || null,
				position: player.position,
				jersey_number: player.jersey_number || 1,
				date_of_birth: player.date_of_birth || '',
				nationality: player.nationality || '',
				height: player.height || 170,
			weight: player.weight || 70,
			preferred_foot: player.preferred_foot || 'Right' as PreferredFoot,
			bio: player.bio || '',
		});
		} else {
			// Reset for create mode
			setFormData({
				user: null as any,
				team: null,
				position: 'FW' as Position,
				jersey_number: 1,
				date_of_birth: '',
				nationality: '',
				height: 170,
				weight: 70,
			preferred_foot: 'Right' as PreferredFoot,
			bio: '',
		});
	}
	setErrors({});
	setCurrentTab(TABS.PERSONAL_INFO);
	}, [isOpen, player]);

	/**
	 * Handle input change
	 */
	const handleChange = (field: keyof PlayerCreateUpdate, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error for this field
		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[field];
			return newErrors;
		});
	};

	/**
	 * Validate current tab
	 */
	const validateTab = (tabIndex: number): boolean => {
		const newErrors: Record<string, string> = {};

		if (tabIndex === TABS.PERSONAL_INFO) {
			// User (create mode only)
			if (!isEditMode && (!formData.user || formData.user === 0 || formData.user === null)) {
				newErrors.user = t('players.selectUserRequired');
			}

			// Date of birth
			if (!formData.date_of_birth) {
				newErrors.date_of_birth = t('players.dateOfBirthRequired');
			} else {
				const dob = new Date(formData.date_of_birth);
				const today = new Date();
			const age = today.getFullYear() - dob.getFullYear();
			if (age < 10 || age > 60) {
				newErrors.date_of_birth = t('players.ageRange');
			}
			}

			// Nationality
			if (!formData.nationality || formData.nationality.trim() === '') {
				newErrors.nationality = t('players.nationalityRequired');
			}
		}

		if (tabIndex === TABS.TEAM_POSITION) {
			// Position
			if (!formData.position) {
				newErrors.position = t('players.positionRequired');
			}

			// Jersey number (if provided)
			if (formData.jersey_number !== null && formData.jersey_number !== undefined) {
				const num = Number(formData.jersey_number);
				if (num < 1 || num > 99) {
					newErrors.jersey_number = t('players.jerseyNumberRange');
				}
			}

			// Preferred foot
			if (!formData.preferred_foot) {
				newErrors.preferred_foot = t('players.preferredFootRequired');
			}
		}

		if (tabIndex === TABS.PHYSICAL_STATS) {
			// Height (if provided)
			if (formData.height !== null && formData.height !== undefined) {
				const h = Number(formData.height);
				if (h < 140 || h > 230) {
					newErrors.height = t('players.heightRange');
				}
			}

			// Weight (if provided)
			if (formData.weight !== null && formData.weight !== undefined) {
				const w = Number(formData.weight);
				if (w < 40 || w > 150) {
					newErrors.weight = t('players.weightRange');
				}
			}
		}

		// Tab 3 (Bio) has no validation (optional field)

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	/**
	 * Navigate to next tab
	 */
	const handleNext = (e?: React.MouseEvent) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		if (validateTab(currentTab)) {
			const nextTab = Math.min(currentTab + 1, TABS.BIO);
			setCurrentTab(nextTab);
		}
	};

	/**
	 * Navigate to previous tab
	 */
	const handlePrevious = () => {
		setCurrentTab((prev) => Math.max(prev - 1, TABS.PERSONAL_INFO));
	};

	/**
	 * Submit form
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate all tabs
		let allValid = true;
		for (let i = TABS.PERSONAL_INFO; i <= TABS.BIO; i++) {
			if (!validateTab(i)) {
				allValid = false;
				// Navigate to first tab with errors
				setCurrentTab(i);
				break;
			}
		}

		if (!allValid) {
			showError(t('players.fixValidationErrors'));
			return;
		}

		setLoading(true);

		try {
			// Prepare data for submission
			const submitData: PlayerCreateUpdate = {
				...formData,
				// Convert to numbers where needed
				jersey_number: formData.jersey_number ? Number(formData.jersey_number) : 1,
				height: formData.height ? Number(formData.height) : 170,
				weight: formData.weight ? Number(formData.weight) : 70,
			};

			if (isEditMode && player) {
				// Update existing player
				await updatePlayer(player.id, submitData);
				showSuccess(t('players.playerUpdated'));
			} else {
				// Create new player
				await createPlayer(submitData);
				showSuccess(t('players.playerCreated'));
			}

			// Call success callback and close modal
			onSuccess();
			onClose();
		} catch (err: any) {
			console.error('=== PLAYER CREATION ERROR DEBUG ===');
			console.error('1. Full error object:', err);
			console.error('2. Error message:', err?.message);
			console.error('3. Error response:', err?.response);
			console.error('4. Error response status:', err?.response?.status);
			console.error('5. Error response data:', err?.response?.data);
			console.error('6. Error response data type:', typeof err?.response?.data);
			console.error('7. Error response data keys:', err?.response?.data ? Object.keys(err?.response?.data) : 'N/A');
			
			// Try to parse field-specific errors from API first
			let errorMessage = t('players.failedToSave');
			
			if (err?.response?.data && typeof err.response.data === 'object') {
				console.error('8. Parsing API errors from response.data...');
				const responseData = err.response.data;
				const apiErrors: Record<string, string> = {};
				const errorMessages: string[] = [];
				
				// Check if there's a 'details' object (nested error structure)
				console.error('9. Full responseData:', JSON.stringify(responseData, null, 2));
				console.error('10. responseData.details:', responseData.details);
				console.error('11. responseData.details type:', typeof responseData.details);
				const errorData = responseData.details || responseData;
				console.error('12. Error data to parse:', errorData);
				console.error('13. Error data type:', typeof errorData);
				console.error('14. Error data keys:', Object.keys(errorData));
				
				for (const [key, value] of Object.entries(errorData)) {
					console.error(`15. Processing field "${key}":`, value, 'Type:', typeof value, 'IsArray:', Array.isArray(value));
					if (Array.isArray(value) && value.length > 0) {
						const firstError = value[0];
						const msg = typeof firstError === 'string' ? firstError : String(firstError);
						console.error(`16. Array first element for "${key}":`, firstError, 'Extracted message:', msg);
						apiErrors[key] = msg;
						errorMessages.push(msg);
					} else if (typeof value === 'string') {
						apiErrors[key] = value;
						errorMessages.push(value);
					} else if (typeof value === 'object' && value !== null) {
						// Handle nested objects - recursively parse them
						console.error(`17. Nested object for "${key}":`, value);
						console.error(`18. Nested object keys:`, Object.keys(value));
						for (const [nestedKey, nestedValue] of Object.entries(value)) {
							console.error(`19. Nested field "${nestedKey}":`, nestedValue, 'Type:', typeof nestedValue, 'IsArray:', Array.isArray(nestedValue));
							if (Array.isArray(nestedValue) && nestedValue.length > 0) {
								const nestedMsg = typeof nestedValue[0] === 'string' ? nestedValue[0] : String(nestedValue[0]);
								apiErrors[nestedKey] = nestedMsg;
								errorMessages.push(nestedMsg);
							}
						}
					}
				}
				console.error('20. Parsed API errors:', apiErrors);
				console.error('21. Error messages array:', errorMessages);
				
				// Use the first error message for toast
				if (errorMessages.length > 0) {
					errorMessage = errorMessages[0];
					console.error('22. Using API error message:', errorMessage);
				} else if (responseData.error && typeof responseData.error === 'string') {
					// Fallback to top-level error field
					errorMessage = responseData.error;
					console.error('23. Using top-level error field:', errorMessage);
				}
				
				setErrors(apiErrors);

				// Navigate to tab with first error
				if (apiErrors.user || apiErrors.date_of_birth || apiErrors.nationality) {
					setCurrentTab(TABS.PERSONAL_INFO);
				} else if (apiErrors.position || apiErrors.jersey_number || apiErrors.preferred_foot || apiErrors.team) {
					setCurrentTab(TABS.TEAM_POSITION);
				} else if (apiErrors.height || apiErrors.weight) {
					setCurrentTab(TABS.PHYSICAL_STATS);
				}
			} else {
				console.error('24. No response.data or not an object, using default error message');
				errorMessage = err?.message || t('players.failedToSave');
			}
			
			console.error('25. Final error message to show:', errorMessage);
			showError(errorMessage);
			console.error('=== END ERROR DEBUG ===');
		} finally {
			setLoading(false);
		}
	};

	// Team dropdown options
	const teamOptions: SelectOption[] = useMemo(() => {
		return [
			{ value: '', label: t('players.freeAgentNoTeam') },
			...teams.map((team) => ({
				value: String(team.id),
				label: team.name,
			})),
		];
	}, [teams, t]);

	// Position button helper
	const getPositionColor = (pos: Position): string => {
		if (formData.position === pos) {
			switch (pos) {
				case 'GK': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
				case 'DF': return 'bg-blue-100 border-blue-500 text-blue-700';
				case 'MF': return 'bg-green-100 border-green-500 text-green-700';
				case 'FW': return 'bg-red-100 border-red-500 text-red-700';
			}
		}
		return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
	};

	// Character count for bio
	const bioCharCount = formData.bio?.length || 0;
	const bioMaxLength = 1000;

	return (
		<Modal 
			isOpen={isOpen} 
			onClose={onClose} 
			title={isEditMode ? t('players.editPlayer') : t('players.addPlayer')}
			size="lg"
		>
			<form onSubmit={handleSubmit}>
				{/* Tab Navigation */}
				<div className="mb-6">
					<div className="flex items-center justify-between border-b border-gray-200">
						{TAB_LABELS.map((label, index) => (
							<button
								key={index}
								type="button"
								onClick={() => setCurrentTab(index)}
								className={`
									flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors
									${currentTab === index
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
									}
								`}
							>
								{label}
							</button>
						))}
					</div>

					{/* Progress Indicator */}
					<div className="mt-2 text-center text-sm text-gray-500">
						{t('players.step')} {currentTab + 1} {t('players.of')} {TAB_LABELS.length}
					</div>
				</div>

				{/* Tab Content */}
				<div className="space-y-4 min-h-[400px]">
					{/* TAB 1: PERSONAL INFO */}
					{currentTab === TABS.PERSONAL_INFO && (
						<div className="space-y-4 animate-fade-in">
							{/* User Selection (Create mode only) */}
							{!isEditMode && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										{t('players.selectUser')} <span className="text-red-500">*</span>
									</label>
									<select
										value={formData.user ? String(formData.user) : ''}
										onChange={(e) => handleChange('user', e.target.value ? Number(e.target.value) : null)}
										disabled={loadingUsers || loading}
										className={`
											w-full px-4 py-2.5 text-base
											border rounded-lg bg-white
											transition-all duration-200 ease-in-out
											focus:outline-none focus:ring-2 focus:ring-offset-0
											${errors.user
												? 'border-red-500 focus:border-red-500 focus:ring-red-500'
												: 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500'
											}
											disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
										`}
									>
										<option value="">{t('players.selectUserPlaceholder')}</option>
										{users.map((user) => (
											<option key={user.id} value={String(user.id)}>
												{user.full_name} ({user.email})
											</option>
										))}
									</select>
									{errors.user && (
										<p className="mt-1 text-sm text-red-600">{errors.user}</p>
									)}
									{loadingUsers && (
										<p className="mt-1 text-sm text-gray-500">{t('players.loadingUsers')}</p>
									)}
								</div>
							)}

							{/* User Display (Edit mode) */}
							{isEditMode && player && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										{t('players.user')}
									</label>
									<div className="p-3 bg-gray-50 rounded-md border border-gray-200">
										<p className="text-sm font-medium text-gray-900">
											{player.user.first_name} {player.user.last_name}
										</p>
										<p className="text-sm text-gray-500">{player.user.email}</p>
									</div>
								</div>
							)}

							{/* Date of Birth */}
							<Input
								label={t('players.dateOfBirth')}
								type="date"
								value={formData.date_of_birth}
								onChange={(e) => handleChange('date_of_birth', e.target.value)}
								max={new Date().toISOString().split('T')[0]}
								required
								error={errors.date_of_birth}
								helperText={t('players.dateOfBirthHelper')}
								disabled={loading}
							/>

							{/* Nationality */}
							<Input
								label={t('players.nationality')}
								type="text"
								value={formData.nationality}
								onChange={(e) => handleChange('nationality', e.target.value)}
								placeholder={t('players.nationalityPlaceholder')}
								required
								error={errors.nationality}
								disabled={loading}
							/>
						</div>
					)}

					{/* TAB 2: TEAM & POSITION */}
					{currentTab === TABS.TEAM_POSITION && (
						<div className="space-y-6 animate-fade-in">
							{/* Team Selection */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{t('players.team')}
								</label>
								<Select
									options={teamOptions}
									value={formData.team ? String(formData.team) : ''}
									onChange={(value) => handleChange('team', value ? Number(value) : null)}
									placeholder={t('players.selectTeamPlaceholder')}
									disabled={loadingTeams || loading}
								/>
								{errors.team && (
									<p className="mt-1 text-sm text-red-600">{errors.team}</p>
								)}
								{loadingTeams && (
									<p className="mt-1 text-sm text-gray-500">{t('players.loadingTeams')}</p>
								)}
							</div>

							{/* Position Selection */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t('players.position')} <span className="text-red-500">*</span>
								</label>
								<div className="grid grid-cols-2 gap-3">
									{POSITION_OPTIONS.map((option) => (
										<button
											key={option.value}
											type="button"
											onClick={() => handleChange('position', option.value)}
											disabled={loading}
											className={`
												p-4 rounded-lg border-2 transition-all
												${getPositionColor(option.value)}
												disabled:opacity-50 disabled:cursor-not-allowed
											`}
										>
											<div className="text-lg font-bold">{option.value}</div>
											<div className="text-sm">{option.label}</div>
										</button>
									))}
								</div>
								{errors.position && (
									<p className="mt-1 text-sm text-red-600">{errors.position}</p>
								)}
							</div>

							{/* Jersey Number */}
							<Input
								label={t('players.jerseyNumber')}
								type="number"
								min="1"
								max="99"
								value={formData.jersey_number !== null ? String(formData.jersey_number) : ''}
								onChange={(e) => handleChange('jersey_number', e.target.value ? Number(e.target.value) : null)}
								placeholder={t('players.jerseyNumberPlaceholder')}
								error={errors.jersey_number}
								helperText={t('players.jerseyNumberHelper')}
								disabled={loading}
							/>

							{/* Preferred Foot */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t('players.preferredFoot')} <span className="text-red-500">*</span>
								</label>
								<div className="flex gap-3">
									{PREFERRED_FOOT_OPTIONS.map((option) => (
										<button
											key={option.value}
											type="button"
											onClick={() => handleChange('preferred_foot', option.value)}
											disabled={loading}
											className={`
												flex-1 p-3 rounded-lg border-2 transition-all
												${formData.preferred_foot === option.value
													? 'bg-blue-100 border-blue-500 text-blue-700'
													: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
												}
												disabled:opacity-50 disabled:cursor-not-allowed
											`}
										>
											{option.label}
										</button>
									))}
								</div>
								{errors.preferred_foot && (
									<p className="mt-1 text-sm text-red-600">{errors.preferred_foot}</p>
								)}
							</div>
						</div>
					)}

					{/* TAB 3: PHYSICAL STATS */}
					{currentTab === TABS.PHYSICAL_STATS && (
						<div className="space-y-4 animate-fade-in">
							{/* Height */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{t('players.height')} (cm)
								</label>
								<div className="relative">
									<Input
										type="number"
										min="140"
										max="230"
										value={formData.height !== null ? String(formData.height) : ''}
										onChange={(e) => handleChange('height', e.target.value ? Number(e.target.value) : null)}
										placeholder={t('players.heightPlaceholder')}
										error={errors.height}
										disabled={loading}
									/>
									<div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
										cm
									</div>
								</div>
								<p className="mt-1 text-sm text-gray-500">
									{t('players.heightHelper')}
								</p>
							</div>

							{/* Weight */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{t('players.weight')} (kg)
								</label>
								<div className="relative">
									<Input
										type="number"
										min="40"
										max="150"
										value={formData.weight !== null ? String(formData.weight) : ''}
										onChange={(e) => handleChange('weight', e.target.value ? Number(e.target.value) : null)}
										placeholder={t('players.weightPlaceholder')}
										error={errors.weight}
										disabled={loading}
									/>
									<div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
										kg
									</div>
								</div>
								<p className="mt-1 text-sm text-gray-500">
									{t('players.weightHelper')}
								</p>
							</div>

							{/* Visual Stats Display */}
							{formData.height && formData.weight && (
								<div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
									<h4 className="text-sm font-semibold text-blue-900 mb-2">
										{t('players.physicalProfile')}
									</h4>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<span className="text-blue-700">{t('players.height')}:</span>{' '}
											<span className="font-medium text-blue-900">{formData.height} cm</span>
										</div>
										<div>
											<span className="text-blue-700">{t('players.weight')}:</span>{' '}
											<span className="font-medium text-blue-900">{formData.weight} kg</span>
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					{/* TAB 4: BIO */}
					{currentTab === TABS.BIO && (
						<div className="space-y-4 animate-fade-in">
							{/* Biography */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{t('players.bio')}
								</label>
								<textarea
									rows={8}
									maxLength={bioMaxLength}
									value={formData.bio || ''}
									onChange={(e) => handleChange('bio', e.target.value)}
									placeholder={t('players.bioPlaceholder')}
									disabled={loading}
									className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
								/>
								<div className="mt-1 flex justify-between text-sm">
									<span className="text-gray-500">{t('players.optionalField')}</span>
									<span className={`${bioCharCount > bioMaxLength * 0.9 ? 'text-red-600' : 'text-gray-500'}`}>
										{bioCharCount} / {bioMaxLength} {t('players.characters')}
									</span>
							</div>
						</div>

						{/* Summary */}
							<div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
								<h4 className="text-sm font-semibold text-green-900 mb-3">
									{t('players.readyTo')} {isEditMode ? t('common.update') : t('common.create')} {t('players.player')}
								</h4>
								<div className="space-y-2 text-sm text-green-800">
								<p><span className="font-medium">{t('players.name')}:</span> {
									isEditMode 
										? (player?.full_name || t('players.newPlayer'))
										: (formData.user ? users.find(u => u.id === formData.user)?.full_name || t('players.newPlayer') : t('players.newPlayer'))
								}</p>
								<p><span className="font-medium">{t('players.position')}:</span> {formData.position}</p>
								<p><span className="font-medium">{t('players.team')}:</span> {formData.team ? teams.find(t => t.id === formData.team)?.name : t('players.freeAgentNoTeam')}</p>
								<p><span className="font-medium">{t('players.nationality')}:</span> {formData.nationality}</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Footer - Navigation Buttons */}
				<div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
					<div className="flex gap-2">
						{currentTab > TABS.PERSONAL_INFO && (
							<Button
								type="button"
								variant="secondary"
								onClick={handlePrevious}
								disabled={loading}
							>
								{t('common.previous')}
							</Button>
						)}
					</div>

					<div className="flex gap-2">
						<Button
							type="button"
							variant="ghost"
							onClick={onClose}
							disabled={loading}
						>
							{t('common.cancel')}
						</Button>

						{currentTab < TABS.BIO ? (
							<Button
								type="button"
								variant="primary"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									handleNext(e);
								}}
								disabled={loading}
							>
								{t('common.next')}
							</Button>
						) : (
							<Button
								type="submit"
								variant="primary"
								loading={loading}
								disabled={loading}
							>
								{loading 
									? t('common.saving') 
									: (isEditMode ? t('players.updatePlayer') : t('players.createPlayer'))
								}
							</Button>
						)}
					</div>
				</div>
			</form>
		</Modal>
	);
};

export default PlayerModal;

