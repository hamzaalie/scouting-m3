import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import VideoPreviewModal from './VideoPreviewModal';
import type { Match, MatchStatus, VideoPlatform, MatchCreateUpdate } from '../../types/match';
import { STATUS_OPTIONS, PLATFORM_OPTIONS } from '../../types/match';
import type { TeamListItem } from '../../types/team';
import { getAllTeams } from '../../services/teamService';
import { createMatch, updateMatch } from '../../services/matchService';
import { validateVideoUrl } from '../../utils/videoHelpers';
import { showSuccess, showError } from '../../utils/toast';

/**
 * MatchModal Component Props
 */
export interface MatchModalProps {
	/**
	 * Whether the modal is open
	 */
	isOpen: boolean;
	/**
	 * Callback when modal should close
	 */
	onClose: () => void;
	/**
	 * Match object for edit mode (null for create mode)
	 */
	match: Match | null;
	/**
	 * Callback after successful create/update
	 */
	onSuccess: () => void;
}

/**
 * MatchModal Component
 *
 * Modal form for creating and editing matches.
 * Part 1: Match details section (home team, away team, date, venue, competition)
 * 
 * Features:
 * - Form validation (all fields required, home ≠ away team)
 * - Team dropdowns with logos
 * - Datetime picker
 * - Auto-population in edit mode
 * - Error handling
 */
const MatchModal: React.FC<MatchModalProps> = ({
	isOpen,
	onClose,
	match,
	onSuccess,
}) => {
	const { t } = useTranslation();
	
	// Teams data
	const [teams, setTeams] = useState<TeamListItem[]>([]);
	const [loadingTeams, setLoadingTeams] = useState<boolean>(false);

	// Form state
	const [formData, setFormData] = useState({
		home_team: null as number | null,
		away_team: null as number | null,
		match_date: '' as string,
		venue: '' as string,
		competition: '' as string,
		status: 'Scheduled' as MatchStatus,
		home_score: 0 as number,
		away_score: 0 as number,
		video_platform: 'Other' as VideoPlatform,
		video_url: '' as string,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState<boolean>(false);
	const [showVideoPreview, setShowVideoPreview] = useState<boolean>(false);
	const [videoValidation, setVideoValidation] = useState<{ valid: boolean; reason?: string } | null>(null);

	const isEditMode = !!match;

	// Load teams on mount
	useEffect(() => {
		const fetchTeams = async () => {
			setLoadingTeams(true);
			try {
				const res = await getAllTeams({});
				const teamList = Array.isArray(res?.results) ? res.results : [];
				setTeams(teamList);
			} catch (err) {
				console.error('Failed to fetch teams:', err);
				setTeams([]);
			} finally {
				setLoadingTeams(false);
			}
		};

		if (isOpen) {
			fetchTeams();
		}
	}, [isOpen]);

	// Initialize form when match prop changes or modal opens
	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			setFormData({
				home_team: null,
				away_team: null,
				match_date: '',
				venue: '',
				competition: '',
				status: 'Scheduled',
				home_score: 0,
				away_score: 0,
				video_platform: 'Other',
				video_url: '',
			});
			setErrors({});
			setVideoValidation(null);
			setShowVideoPreview(false);
			return;
		}

		// Populate form when editing
		if (match) {
			// Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
			const matchDate = match.match_date ? new Date(match.match_date) : new Date();
			const localDateTime = new Date(matchDate.getTime() - matchDate.getTimezoneOffset() * 60000)
				.toISOString()
				.slice(0, 16); // Format: YYYY-MM-DDTHH:mm

			setFormData({
				home_team: match.home_team?.id || null,
				away_team: match.away_team?.id || null,
				match_date: localDateTime,
				venue: match.venue || '',
				competition: match.competition || '',
				status: match.status || 'Scheduled',
				home_score: match.home_score ?? 0,
				away_score: match.away_score ?? 0,
				video_platform: match.video_platform || 'Other',
				video_url: match.video_url || '',
			});
		} else {
			// Reset for create mode
			setFormData({
				home_team: null,
				away_team: null,
				match_date: '',
				venue: '',
				competition: '',
				status: 'Scheduled',
				home_score: 0,
				away_score: 0,
				video_platform: 'Other',
				video_url: '',
			});
		}
		setErrors({});
		setVideoValidation(null);
		setShowVideoPreview(false);
	}, [isOpen, match]);

	/**
	 * Handle form field changes
	 */
	const handleChange = (field: keyof typeof formData, value: any) => {
		// Special handling for status change
		if (field === 'status') {
			const newStatus = value as MatchStatus;
			setFormData((prev) => {
				// If changing away from Completed, reset scores to 0
				if (prev.status === 'Completed' && newStatus !== 'Completed') {
					return {
						...prev,
						status: newStatus,
						home_score: 0,
						away_score: 0,
					};
				}
				return { ...prev, status: newStatus };
			});
			// Clear score errors when status changes
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors.home_score;
				delete newErrors.away_score;
				return newErrors;
			});
		} else if (field === 'video_url' || field === 'video_platform') {
			// Real-time video URL validation
			setFormData((prev) => {
				const newData = { ...prev, [field]: value };
				// Validate video URL if provided
				if (newData.video_url && newData.video_url.trim() !== '') {
					const validation = validateVideoUrl(newData.video_url, newData.video_platform);
					setVideoValidation(validation);
					if (!validation.valid) {
						setErrors((prevErrors) => ({
							...prevErrors,
							video_url: validation.reason || t('matches.invalidVideoUrl'),
						}));
					} else {
						setErrors((prevErrors) => {
							const newErrors = { ...prevErrors };
							delete newErrors.video_url;
							return newErrors;
						});
					}
				} else {
					// Empty URL is valid
					setVideoValidation({ valid: true });
					setErrors((prevErrors) => {
						const newErrors = { ...prevErrors };
						delete newErrors.video_url;
						return newErrors;
					});
				}
				return newData;
			});
		} else {
			setFormData((prev) => ({ ...prev, [field]: value }));
			// Clear error for this field
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	/**
	 * Validate match details section
	 */
	const validateMatchDetails = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Home team
		if (!formData.home_team || formData.home_team === 0) {
			newErrors.home_team = t('matches.homeTeamRequired');
		}

		// Away team
		if (!formData.away_team || formData.away_team === 0) {
			newErrors.away_team = t('matches.awayTeamRequired');
		}

		// Home team ≠ Away team (critical validation)
		if (formData.home_team && formData.away_team && formData.home_team === formData.away_team) {
			newErrors.away_team = t('matches.teamsMustDiffer');
		}

		// Match date
		if (!formData.match_date || formData.match_date.trim() === '') {
			newErrors.match_date = t('matches.matchDateRequired');
		}

		// Venue
		if (!formData.venue || formData.venue.trim() === '') {
			newErrors.venue = t('matches.venueRequired');
		} else if (formData.venue.length > 200) {
			newErrors.venue = t('matches.venueMaxLength');
		}

		// Competition
		if (!formData.competition || formData.competition.trim() === '') {
			newErrors.competition = t('matches.competitionRequired');
		} else if (formData.competition.length > 100) {
			newErrors.competition = t('matches.competitionMaxLength');
		}

		setErrors((prev) => ({ ...prev, ...newErrors }));
		return Object.keys(newErrors).length === 0;
	};

	/**
	 * Validate score and status section
	 */
	const validateScoreAndStatus = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Status
		if (!formData.status) {
			newErrors.status = t('matches.statusRequired');
		}

		// Scores (only required if status is Completed)
		if (formData.status === 'Completed') {
			// Home score
			if (formData.home_score === null || formData.home_score === undefined) {
				newErrors.home_score = t('matches.homeScoreRequired');
			} else if (formData.home_score < 0 || formData.home_score > 99) {
				newErrors.home_score = t('matches.homeScoreRange');
			}

			// Away score
			if (formData.away_score === null || formData.away_score === undefined) {
				newErrors.away_score = t('matches.awayScoreRequired');
			} else if (formData.away_score < 0 || formData.away_score > 99) {
				newErrors.away_score = t('matches.awayScoreRange');
			}
		}

		setErrors((prev) => ({ ...prev, ...newErrors }));
		return Object.keys(newErrors).length === 0;
	};

	/**
	 * Validate video section
	 */
	const validateVideo = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Video URL validation (only if provided)
		if (formData.video_url && formData.video_url.trim() !== '') {
			const validation = validateVideoUrl(formData.video_url, formData.video_platform);
			if (!validation.valid) {
				newErrors.video_url = validation.reason || t('matches.invalidVideoUrl');
			}
		}

		setErrors((prev) => ({ ...prev, ...newErrors }));
		return Object.keys(newErrors).length === 0;
	};

	/**
	 * Handle form submission
	 */
	const handleSubmit = async () => {
		console.log('[MatchModal] Submit button clicked');
		console.log('[MatchModal] Form data:', formData);
		
		// Clear previous errors first
		setErrors({});
		
		// Validate all sections
		const detailsValid = validateMatchDetails();
		const scoreStatusValid = validateScoreAndStatus();
		const videoValid = validateVideo();

		// Get current errors after validation
		setTimeout(() => {
			console.log('[MatchModal] Validation results:', {
				detailsValid,
				scoreStatusValid,
				videoValid,
			});
		}, 0);

		if (!detailsValid || !scoreStatusValid || !videoValid) {
			// Errors are already set by validation functions
			// Show error message to user
			showError(t('matches.fixErrors'));
			// Scroll to first error after a short delay to allow errors to render
			setTimeout(() => {
				const firstErrorField = document.querySelector('[class*="error"], [aria-invalid="true"], .text-red-600');
				if (firstErrorField) {
					firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
				}
			}, 100);
			return;
		}

		console.log('[MatchModal] All validations passed, submitting...');
		setLoading(true);

		try {
			// Convert datetime-local to ISO string
			const matchDateISO = formData.match_date
				? new Date(formData.match_date).toISOString()
				: new Date().toISOString();

			// Prepare payload
			const payload: MatchCreateUpdate = {
				home_team: formData.home_team!,
				away_team: formData.away_team!,
				competition: formData.competition,
				match_date: matchDateISO,
				venue: formData.venue,
				home_score: formData.home_score,
				away_score: formData.away_score,
				video_url: formData.video_url.trim() || null,
				video_platform: formData.video_platform,
				status: formData.status,
			};

			if (isEditMode && match) {
				// Update existing match
				await updateMatch(match.id, payload);
				showSuccess(t('matches.matchUpdated'));
			} else {
				// Create new match
				await createMatch(payload);
				showSuccess(t('matches.matchCreated'));
			}

			// Success: close modal and refresh list
			onSuccess();
			onClose();
		} catch (error: any) {
			console.error('Failed to save match:', error);
			
			// Handle API validation errors
			if (error.response?.data) {
				const apiErrors = error.response.data;
				const fieldErrors: Record<string, string> = {};

				// Map API errors to form fields
				Object.keys(apiErrors).forEach((key) => {
					const errorValue = apiErrors[key];
					if (Array.isArray(errorValue)) {
						fieldErrors[key] = errorValue[0];
					} else if (typeof errorValue === 'string') {
						fieldErrors[key] = errorValue;
					}
				});

				setErrors((prev) => ({ ...prev, ...fieldErrors }));
			}

			showError(error.message || t('matches.failedToSaveMatch'));
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Team options for dropdowns
	 */
	const teamOptions = useMemo(() => {
		return teams.map((team) => ({
			value: team.id,
			label: team.name,
			icon: (
				<Avatar
					src={team.logo || undefined}
					alt={team.name}
					size="sm"
					fallback={team.name.charAt(0).toUpperCase()}
				/>
			),
		}));
	}, [teams]);

	/**
	 * Render team option with logo
	 */
	const renderTeamOption = (option: { value: number | string; label: string; icon?: React.ReactNode }) => {
		return (
			<div className="flex items-center gap-2">
				{option.icon && <div className="flex-shrink-0">{option.icon}</div>}
				<div className="flex-1 font-medium">{option.label}</div>
			</div>
		);
	};

	/**
	 * Render selected team value with logo
	 */
	const renderTeamValue = (selectedOption: { value: number | string; label: string; icon?: React.ReactNode } | { value: number | string; label: string; icon?: React.ReactNode }[] | null) => {
		if (!selectedOption) {
			return null;
		}
		// Handle array case (for multiSelect, though we're not using it)
		const option = Array.isArray(selectedOption) ? selectedOption[0] : selectedOption;
		if (!option) {
			return null;
		}
		return (
			<div className="flex items-center gap-2">
				{option.icon && <div className="flex-shrink-0">{option.icon}</div>}
				<span>{option.label}</span>
			</div>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isEditMode ? t('matches.editMatch') : t('matches.createMatch')}
			size="lg"
			footer={{
				secondary: {
					label: t('common.cancel'),
					onClick: onClose,
					variant: 'outline',
				},
				primary: {
					label: loading 
						? t('common.saving')
						: (isEditMode ? t('common.update') : t('common.create')),
					onClick: handleSubmit,
					loading: loading,
					variant: 'primary',
				},
			}}
		>
			<div className="space-y-6">
				{/* Match Details Section */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">{t('matches.matchDetails')}</h3>
					<div className="space-y-4">
						{/* Home Team */}
						<div>
							<Select
								label={t('matches.homeTeam')}
								options={teamOptions}
								value={formData.home_team || ''}
								onChange={(value) => handleChange('home_team', value ? Number(value) : null)}
								placeholder={t('matches.selectHomeTeam')}
								error={errors.home_team}
								disabled={loadingTeams}
								renderOption={renderTeamOption}
								renderValue={renderTeamValue}
							/>
						</div>

						{/* Away Team */}
						<div>
							<Select
								label={t('matches.awayTeam')}
								options={teamOptions}
								value={formData.away_team || ''}
								onChange={(value) => handleChange('away_team', value ? Number(value) : null)}
								placeholder={t('matches.selectAwayTeam')}
								error={errors.away_team}
								disabled={loadingTeams}
								renderOption={renderTeamOption}
								renderValue={renderTeamValue}
							/>
						</div>

						{/* Match Date & Time */}
						<div>
							<Input
								type="datetime-local"
							label={t('matches.matchDateTime')}
								value={formData.match_date}
								onChange={(e) => handleChange('match_date', e.target.value)}
								error={errors.match_date}
								required
							/>
						</div>

						{/* Venue */}
						<div>
							<Input
								type="text"
								label={t('matches.venue')}
								value={formData.venue}
								onChange={(e) => handleChange('venue', e.target.value)}
								placeholder={t('matches.venuePlaceholder')}
								error={errors.venue}
								maxLength={200}
								required
							/>
						</div>

						{/* Competition */}
						<div>
							<Input
								type="text"
								label={t('matches.competition')}
								value={formData.competition}
								onChange={(e) => handleChange('competition', e.target.value)}
								placeholder={t('matches.competitionPlaceholder')}
								error={errors.competition}
								maxLength={100}
								required
							/>
						</div>
					</div>
				</div>

				{/* Score & Status Section */}
				<div className="pt-6 border-t border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">{t('matches.scoreStatus')}</h3>
					<div className="space-y-4">
						{/* Status */}
						<div>
							<Select
								label={t('matches.matchStatus')}
								options={STATUS_OPTIONS}
								value={formData.status}
								onChange={(value) => handleChange('status', value as MatchStatus)}
								placeholder={t('matches.selectStatus')}
								error={errors.status}
								required
							/>
						</div>

						{/* Conditional Score Inputs */}
						{formData.status === 'Completed' ? (
							<div className="space-y-4 transition-all duration-200 ease-in-out">
								{/* Home Score */}
								<div>
									<Input
										type="number"
										label={t('matches.homeTeamScore')}
										value={formData.home_score}
										onChange={(e) => handleChange('home_score', e.target.value ? Number(e.target.value) : 0)}
										error={errors.home_score}
										min={0}
										max={99}
										required
									/>
								</div>

								{/* Away Score */}
								<div>
									<Input
										type="number"
										label={t('matches.awayTeamScore')}
										value={formData.away_score}
										onChange={(e) => handleChange('away_score', e.target.value ? Number(e.target.value) : 0)}
										error={errors.away_score}
										min={0}
										max={99}
										required
									/>
								</div>
							</div>
						) : (
							<div className="text-sm text-gray-500 italic transition-all duration-200 ease-in-out">
								{t('matches.scoresAvailableWhenCompleted')}
							</div>
						)}
					</div>
				</div>

				{/* Video Section */}
				<div className="pt-6 border-t border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">{t('matches.matchVideo')}</h3>
					<div className="space-y-4">
						{/* Video Platform */}
						<div>
							<Select
								label={t('matches.videoPlatform')}
								options={PLATFORM_OPTIONS}
								value={formData.video_platform}
								onChange={(value) => handleChange('video_platform', value as VideoPlatform)}
								placeholder={t('matches.selectPlatform')}
							/>
						</div>

						{/* Video URL */}
						<div>
							<Input
								type="url"
								label={t('matches.videoUrl')}
								value={formData.video_url}
								onChange={(e) => handleChange('video_url', e.target.value)}
								placeholder={t('matches.videoUrlPlaceholder')}
								error={errors.video_url}
							/>

							{/* Validation Message */}
							{formData.video_url && formData.video_url.trim() !== '' && videoValidation && (
								<div className={`mt-1.5 flex items-center gap-2 text-sm ${videoValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
									{videoValidation.valid ? (
										<>
											<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
											</svg>
											<span>{t('matches.validUrl')} {formData.video_platform}</span>
										</>
									) : (
										<>
											<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
											</svg>
											<span>{videoValidation.reason || t('matches.invalidVideoUrl')}</span>
										</>
									)}
								</div>
							)}
						</div>

						{/* Preview Button */}
						{videoValidation?.valid && formData.video_url && formData.video_url.trim() !== '' && (
							<div>
								<Button
									variant="secondary"
									onClick={() => setShowVideoPreview(true)}
									disabled={loading}
								>
									{t('matches.previewVideo')}
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Video Preview Modal */}
			<VideoPreviewModal
				isOpen={showVideoPreview}
				onClose={() => setShowVideoPreview(false)}
				platform={formData.video_platform}
				videoUrl={formData.video_url}
				matchInfo={{
					homeTeam: teams.find((team) => team.id === formData.home_team)?.name || t('matches.homeTeam'),
					awayTeam: teams.find((team) => team.id === formData.away_team)?.name || t('matches.awayTeam'),
					matchDate: formData.match_date
						? new Date(formData.match_date).toISOString()
						: new Date().toISOString(),
				}}
			/>
		</Modal>
	);
};

export default MatchModal;

