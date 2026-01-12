import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { showSuccess, showError } from '../../utils/toast';
import { handleApiError } from '../../utils/errorHandler';
import {
	createTeamStats,
	updateTeamStats,
	calculateTeamStatsFromPlayers,
} from '../../services/teamStatsService';
import { getMatchById } from '../../services/matchService';
import type { TeamMatchStatsCreateUpdate, TeamMatchStatsComparison } from '../../types/teamStats';
import type { Match } from '../../types/match';

/**
 * TeamStatsEntryModal Component Props
 */
export interface TeamStatsEntryModalProps {
	/**
	 * Whether the modal is open
	 */
	isOpen: boolean;
	/**
	 * Callback when modal should close
	 */
	onClose: () => void;
	/**
	 * Match ID for which team stats are being entered
	 */
	matchId: number;
	/**
	 * Existing team stats (optional - for edit mode)
	 */
	existingStats?: TeamMatchStatsComparison;
	/**
	 * Callback after successful save
	 */
	onSuccess: () => void;
}

/**
 * Form data for team statistics
 */
interface TeamStatsFormData {
	goals: number;
	key_passes: number;
	long_balls: number;
	total_shots: number;
	shots_on_target: number;
	tackles: number;
	possession_percentage: number;
	blocks: number;
	successful_dribbles: number;
	duels_won: number;
	fouls: number;
	yellow_cards: number;
	red_cards: number;
	fouled_when_dribble: number;
	passes_in_penalty_area: number;
	miscontrols: number;
}

/**
 * Initial form data
 */
const initialFormData: TeamStatsFormData = {
	goals: 0,
	key_passes: 0,
	long_balls: 0,
	total_shots: 0,
	shots_on_target: 0,
	tackles: 0,
	possession_percentage: 0,
	blocks: 0,
	successful_dribbles: 0,
	duels_won: 0,
	fouls: 0,
	yellow_cards: 0,
	red_cards: 0,
	fouled_when_dribble: 0,
	passes_in_penalty_area: 0,
	miscontrols: 0,
};

/**
 * TeamStatsEntryModal Component
 *
 * Modal form for entering or editing team match statistics.
 *
 * Features:
 * - Match info display (read-only)
 * - Home team statistics form
 * - Away team statistics form
 * - Real-time validation
 * - Error handling with toast notifications
 * - Loading states
 */
const TeamStatsEntryModal: React.FC<TeamStatsEntryModalProps> = ({
	isOpen,
	onClose,
	matchId,
	existingStats,
	onSuccess,
}) => {
	const { t } = useTranslation();

	// Match data
	const [match, setMatch] = useState<Match | null>(null);
	const [loadingMatch, setLoadingMatch] = useState<boolean>(false);

	// Form state
	const [homeTeamStats, setHomeTeamStats] = useState<TeamStatsFormData>(initialFormData);
	const [awayTeamStats, setAwayTeamStats] = useState<TeamStatsFormData>(initialFormData);

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState<boolean>(false);
	const [calculating, setCalculating] = useState<boolean>(false);

	const isEditMode = !!existingStats && (!!existingStats.home_team_stats || !!existingStats.away_team_stats);
	
	// Debug log to see what existingStats contains
	useEffect(() => {
		if (isOpen) {
			console.log('[TeamStatsEntryModal] Modal opened');
			console.log('[TeamStatsEntryModal] existingStats prop:', existingStats);
			console.log('[TeamStatsEntryModal] isEditMode:', isEditMode);
			console.log('[TeamStatsEntryModal] home_team_stats:', existingStats?.home_team_stats);
			console.log('[TeamStatsEntryModal] away_team_stats:', existingStats?.away_team_stats);
		}
	}, [isOpen, existingStats, isEditMode]);

	// Load match details on mount
	useEffect(() => {
		const fetchMatch = async () => {
			if (!isOpen) return;

			setLoadingMatch(true);
			try {
				const matchData = await getMatchById(matchId);
				setMatch(matchData);
			} catch (err: any) {
				handleApiError(err, t, undefined, t('stats.failedToLoadMatch'));
			} finally {
				setLoadingMatch(false);
			}
		};

		fetchMatch();
	}, [isOpen, matchId, t]);

	// Load existing stats if in edit mode
	useEffect(() => {
		if (!isOpen || !existingStats) {
			// Reset form when modal closes or no existing stats
			setHomeTeamStats(initialFormData);
			setAwayTeamStats(initialFormData);
			setErrors({});
			return;
		}

		// Populate form with existing stats
		if (existingStats.home_team_stats) {
			const stats = existingStats.home_team_stats;
			setHomeTeamStats({
				goals: stats.goals,
				key_passes: stats.key_passes,
				long_balls: stats.long_balls,
				total_shots: stats.total_shots,
				shots_on_target: stats.shots_on_target,
				tackles: stats.tackles,
				possession_percentage: stats.possession_percentage,
				blocks: stats.blocks,
				successful_dribbles: stats.successful_dribbles,
				duels_won: stats.duels_won,
				fouls: stats.fouls,
				yellow_cards: stats.yellow_cards,
				red_cards: stats.red_cards,
				fouled_when_dribble: stats.fouled_when_dribble,
				passes_in_penalty_area: stats.passes_in_penalty_area,
				miscontrols: stats.miscontrols,
			});
		}

		if (existingStats.away_team_stats) {
			const stats = existingStats.away_team_stats;
			setAwayTeamStats({
				goals: stats.goals,
				key_passes: stats.key_passes,
				long_balls: stats.long_balls,
				total_shots: stats.total_shots,
				shots_on_target: stats.shots_on_target,
				tackles: stats.tackles,
				possession_percentage: stats.possession_percentage,
				blocks: stats.blocks,
				successful_dribbles: stats.successful_dribbles,
				duels_won: stats.duels_won,
				fouls: stats.fouls,
				yellow_cards: stats.yellow_cards,
				red_cards: stats.red_cards,
				fouled_when_dribble: stats.fouled_when_dribble,
				passes_in_penalty_area: stats.passes_in_penalty_area,
				miscontrols: stats.miscontrols,
			});
		}
	}, [isOpen, existingStats]);

	/**
	 * Handle form field change
	 */
	const handleChange = (team: 'home' | 'away', field: keyof TeamStatsFormData, value: number) => {
		if (team === 'home') {
			setHomeTeamStats((prev) => ({ ...prev, [field]: value }));
		} else {
			setAwayTeamStats((prev) => ({ ...prev, [field]: value }));
		}

		// Clear error for this field
		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[`${team}_${field}`];
			return newErrors;
		});
	};

	/**
	 * Validate form data
	 */
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Validate home team
		if (homeTeamStats.shots_on_target > homeTeamStats.total_shots) {
			newErrors.home_shots_on_target = t('stats.shotsOnTargetExceed');
		}
		if (homeTeamStats.possession_percentage < 0 || homeTeamStats.possession_percentage > 100) {
			newErrors.home_possession_percentage = t('stats.passAccuracyRange');
		}

		// Validate away team
		if (awayTeamStats.shots_on_target > awayTeamStats.total_shots) {
			newErrors.away_shots_on_target = t('stats.shotsOnTargetExceed');
		}
		if (awayTeamStats.possession_percentage < 0 || awayTeamStats.possession_percentage > 100) {
			newErrors.away_possession_percentage = t('stats.passAccuracyRange');
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	/**
	 * Handle form submission
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!match) {
			showError(t('stats.failedToLoadMatch'));
			return;
		}

		if (!validateForm()) {
			showError(t('stats.fixValidationErrors'));
			return;
		}

		setLoading(true);

		try {
			// Prepare data for home team
			const homeData: TeamMatchStatsCreateUpdate = {
				match: matchId,
				team: match.home_team.id,
				...homeTeamStats,
			};

			// Prepare data for away team
			const awayData: TeamMatchStatsCreateUpdate = {
				match: matchId,
				team: match.away_team.id,
				...awayTeamStats,
			};

			// Debug logging
		console.log('=== TEAM STATS SUBMISSION DEBUG ===');
		console.log('1. Match ID:', matchId);
		console.log('2. Is Edit Mode:', isEditMode);
		console.log('3. Existing Stats:', existingStats);
		console.log('4. Home Team ID:', match.home_team?.id);
		console.log('5. Away Team ID:', match.away_team?.id);
		console.log('6. Home Data:', homeData);
		console.log('7. Away Data:', awayData);
		console.log('8. Home Team Stats exists?', !!existingStats?.home_team_stats);
		console.log('9. Away Team Stats exists?', !!existingStats?.away_team_stats);

		// Create or update stats
		if (isEditMode && existingStats) {
			console.log('10. Mode: UPDATE (edit mode)');
			// Update existing stats
			const promises = [];
			if (existingStats.home_team_stats) {
				console.log('11. Updating home team stats, ID:', existingStats.home_team_stats.id);
				promises.push(updateTeamStats(existingStats.home_team_stats.id, homeData));
			} else if (match.home_team) {
				console.log('12. Creating home team stats (no existing found)');
				promises.push(createTeamStats(homeData));
			}

			if (existingStats.away_team_stats) {
				console.log('13. Updating away team stats, ID:', existingStats.away_team_stats.id);
				promises.push(updateTeamStats(existingStats.away_team_stats.id, awayData));
			} else if (match.away_team) {
				console.log('14. Creating away team stats (no existing found)');
				promises.push(createTeamStats(awayData));
			}

			console.log('15. Executing', promises.length, 'promises');
			await Promise.all(promises);
			console.log('16. All promises completed successfully');
			showSuccess(t('stats.statsUpdated'));
		} else {
			console.log('10. Mode: CREATE (new stats)');
			console.log('11. Creating stats for both teams simultaneously');
			try {
				await Promise.all([
					createTeamStats(homeData),
					createTeamStats(awayData),
				]);
				console.log('12. Both team stats created successfully');
				showSuccess(t('stats.statsSaved'));
			} catch (createError: any) {
				console.error('13. Error during creation:', createError);
				console.error('14. Error response data:', createError?.response?.data);
				// Re-throw to be caught by outer catch
				throw createError;
			}
		}
		console.log('=== END SUBMISSION DEBUG ===');

			onSuccess();
			onClose();
		} catch (err: any) {
			console.error('=== TEAM STATS ERROR HANDLING ===');
			console.error('Error object:', err);
			console.error('Error response:', err?.response);
			console.error('Error response data:', err?.response?.data);
			console.error('Error response data (stringified):', JSON.stringify(err?.response?.data, null, 2));
			
			// Extract specific error message
			let errorMessage = t('stats.failedToSaveStatistics');
			if (err?.response?.data) {
				const errorData = err.response.data;
				console.error('Error data structure:', errorData);
				
				// Check for nested structure: error.details.non_field_errors
				if (errorData.details && errorData.details.non_field_errors && Array.isArray(errorData.details.non_field_errors) && errorData.details.non_field_errors.length > 0) {
					errorMessage = errorData.details.non_field_errors[0];
					console.error('Extracted non_field_error from details:', errorMessage);
				}
				// Check for direct non_field_errors (unique constraint, etc.)
				else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors) && errorData.non_field_errors.length > 0) {
					errorMessage = errorData.non_field_errors[0];
					console.error('Extracted non_field_error:', errorMessage);
				}
				// Check for field-specific errors
				else if (typeof errorData === 'object') {
					const firstError = Object.values(errorData).find((val: any) => 
						Array.isArray(val) && val.length > 0
					);
					if (firstError && Array.isArray(firstError)) {
						errorMessage = firstError[0] as string;
						console.error('Extracted field error:', errorMessage);
					}
				}
			}
			
			console.error('Final error message:', errorMessage);
			showError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Auto-fill team stats from player statistics
	 */
	const handleAutoFill = async () => {
		if (!match) {
			showError(t('stats.failedToLoadMatch'));
			return;
		}

		const confirmMessage = t('teamStats.autoFillConfirm', {
			defaultValue: 'This will pre-fill team stats based on individual player statistics. You can review and adjust before saving.',
		});

		if (!window.confirm(confirmMessage)) {
			return;
		}

		setCalculating(true);
		try {
			// Calculate for both teams
			const [homeResult, awayResult] = await Promise.all([
				calculateTeamStatsFromPlayers(matchId, match.home_team.id),
				calculateTeamStatsFromPlayers(matchId, match.away_team.id),
			]);

			// Show warnings if any
			const allWarnings: string[] = [];
			if (homeResult.calculation_info.warnings.length > 0) {
				allWarnings.push(...homeResult.calculation_info.warnings);
			}
			if (awayResult.calculation_info.warnings.length > 0) {
				allWarnings.push(...awayResult.calculation_info.warnings);
			}

			if (allWarnings.length > 0) {
				showError(allWarnings.join('\n'));
			}

			// Pre-fill form with calculated stats
			if (homeResult.calculated_stats) {
				setHomeTeamStats({
					goals: homeResult.calculated_stats.goals || 0,
					key_passes: homeResult.calculated_stats.key_passes || 0,
					long_balls: homeResult.calculated_stats.long_balls || 0,
					total_shots: homeResult.calculated_stats.total_shots || 0,
					shots_on_target: homeResult.calculated_stats.shots_on_target || 0,
					tackles: homeResult.calculated_stats.tackles || 0,
					possession_percentage: homeResult.calculated_stats.possession_percentage || 0,
					blocks: homeResult.calculated_stats.blocks || 0,
					successful_dribbles: homeResult.calculated_stats.successful_dribbles || 0,
					duels_won: homeResult.calculated_stats.duels_won || 0,
					fouls: homeResult.calculated_stats.fouls || 0,
					yellow_cards: homeResult.calculated_stats.yellow_cards || 0,
					red_cards: homeResult.calculated_stats.red_cards || 0,
					fouled_when_dribble: homeResult.calculated_stats.fouled_when_dribble || 0,
					passes_in_penalty_area: homeResult.calculated_stats.passes_in_penalty_area || 0,
					miscontrols: homeResult.calculated_stats.miscontrols || 0,
				});
			}

			if (awayResult.calculated_stats) {
				setAwayTeamStats({
					goals: awayResult.calculated_stats.goals || 0,
					key_passes: awayResult.calculated_stats.key_passes || 0,
					long_balls: awayResult.calculated_stats.long_balls || 0,
					total_shots: awayResult.calculated_stats.total_shots || 0,
					shots_on_target: awayResult.calculated_stats.shots_on_target || 0,
					tackles: awayResult.calculated_stats.tackles || 0,
					possession_percentage: awayResult.calculated_stats.possession_percentage || 0,
					blocks: awayResult.calculated_stats.blocks || 0,
					successful_dribbles: awayResult.calculated_stats.successful_dribbles || 0,
					duels_won: awayResult.calculated_stats.duels_won || 0,
					fouls: awayResult.calculated_stats.fouls || 0,
					yellow_cards: awayResult.calculated_stats.yellow_cards || 0,
					red_cards: awayResult.calculated_stats.red_cards || 0,
					fouled_when_dribble: awayResult.calculated_stats.fouled_when_dribble || 0,
					passes_in_penalty_area: awayResult.calculated_stats.passes_in_penalty_area || 0,
					miscontrols: awayResult.calculated_stats.miscontrols || 0,
				});
			}

			showSuccess(t('teamStats.autoFillSuccess', { defaultValue: 'Team stats pre-filled from player statistics. Please review and adjust before saving.' }));
		} catch (err: any) {
			handleApiError(err, t, undefined, t('teamStats.autoFillError', { defaultValue: 'Failed to calculate team stats from player statistics.' }));
		} finally {
			setCalculating(false);
		}
	};

	/**
	 * Handle modal close
	 */
	const handleClose = () => {
		if (!loading && !calculating) {
			setHomeTeamStats(initialFormData);
			setAwayTeamStats(initialFormData);
			setErrors({});
			onClose();
		}
	};

	/**
	 * Render form input
	 */
	const renderInput = (
		team: 'home' | 'away',
		field: keyof TeamStatsFormData,
		label: string,
		props?: Partial<React.ComponentProps<typeof Input>>
	) => {
		const value = team === 'home' ? homeTeamStats[field] : awayTeamStats[field];
		const error = errors[`${team}_${field}`];

		return (
			<Input
				type="number"
				label={label}
				value={value}
				onChange={(e) => handleChange(team, field, parseFloat(e.target.value) || 0)}
				error={error}
				min={0}
				step={field === 'possession_percentage' ? 0.01 : 1}
				{...props}
			/>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={isEditMode ? t('teamStats.editTeamStats') : t('teamStats.addTeamStats')}
			size="xl"
			showCloseButton={!loading}
		>
			{loadingMatch ? (
				<div className="p-8 text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-500">{t('common.loading')}...</p>
				</div>
			) : match ? (
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Match Info Section */}
					<div className="bg-gray-50 rounded-lg p-4">
						<div className="flex justify-between items-start mb-2">
							<h3 className="text-sm font-semibold text-gray-700">{t('matches.matchDetails')}</h3>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleAutoFill}
								disabled={calculating || loading}
								className="text-xs"
							>
								{calculating ? t('common.loading') : t('teamStats.autoFillFromPlayerStats', { defaultValue: 'Auto-Fill from Player Stats' })}
							</Button>
						</div>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-gray-600">{t('matches.homeTeam')}:</span>
								<span className="ml-2 font-medium">{match.home_team.name}</span>
							</div>
							<div>
								<span className="text-gray-600">{t('matches.awayTeam')}:</span>
								<span className="ml-2 font-medium">{match.away_team.name}</span>
							</div>
							<div>
								<span className="text-gray-600">{t('matches.competition')}:</span>
								<span className="ml-2 font-medium">{match.competition}</span>
							</div>
							<div>
								<span className="text-gray-600">{t('matches.score')}:</span>
								<span className="ml-2 font-medium">{match.score_display}</span>
							</div>
						</div>
					</div>

					{/* Home Team Statistics */}
					<div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
						<h3 className="text-lg font-bold text-blue-900 mb-4">
							{t('teamStats.homeTeam')}: {match.home_team.name}
						</h3>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							{renderInput('home', 'goals', t('teamStats.goals'), { required: true })}
							{renderInput('home', 'key_passes', t('teamStats.keyPasses'))}
							{renderInput('home', 'long_balls', t('teamStats.longBalls'))}
							{renderInput('home', 'total_shots', t('teamStats.totalShots'))}
							{renderInput('home', 'shots_on_target', t('teamStats.shotsOnTarget'))}
							{renderInput('home', 'tackles', t('teamStats.tackles'))}
							{renderInput('home', 'possession_percentage', t('teamStats.possession'), { max: 100 })}
							{renderInput('home', 'blocks', t('teamStats.blocks'))}
							{renderInput('home', 'successful_dribbles', t('teamStats.successfulDribbles'))}
							{renderInput('home', 'duels_won', t('teamStats.duelsWon'))}
							{renderInput('home', 'fouls', t('teamStats.fouls'))}
							{renderInput('home', 'yellow_cards', t('teamStats.yellowCards'), { max: 11 })}
							{renderInput('home', 'red_cards', t('teamStats.redCards'), { max: 11 })}
							{renderInput('home', 'fouled_when_dribble', t('teamStats.fouledWhenDribble'))}
							{renderInput('home', 'passes_in_penalty_area', t('teamStats.passesInPenaltyArea'))}
							{renderInput('home', 'miscontrols', t('teamStats.miscontrols'))}
						</div>
					</div>

					{/* Away Team Statistics */}
					<div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
						<h3 className="text-lg font-bold text-gray-900 mb-4">
							{t('teamStats.awayTeam')}: {match.away_team.name}
						</h3>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							{renderInput('away', 'goals', t('teamStats.goals'), { required: true })}
							{renderInput('away', 'key_passes', t('teamStats.keyPasses'))}
							{renderInput('away', 'long_balls', t('teamStats.longBalls'))}
							{renderInput('away', 'total_shots', t('teamStats.totalShots'))}
							{renderInput('away', 'shots_on_target', t('teamStats.shotsOnTarget'))}
							{renderInput('away', 'tackles', t('teamStats.tackles'))}
							{renderInput('away', 'possession_percentage', t('teamStats.possession'), { max: 100 })}
							{renderInput('away', 'blocks', t('teamStats.blocks'))}
							{renderInput('away', 'successful_dribbles', t('teamStats.successfulDribbles'))}
							{renderInput('away', 'duels_won', t('teamStats.duelsWon'))}
							{renderInput('away', 'fouls', t('teamStats.fouls'))}
							{renderInput('away', 'yellow_cards', t('teamStats.yellowCards'), { max: 11 })}
							{renderInput('away', 'red_cards', t('teamStats.redCards'), { max: 11 })}
							{renderInput('away', 'fouled_when_dribble', t('teamStats.fouledWhenDribble'))}
							{renderInput('away', 'passes_in_penalty_area', t('teamStats.passesInPenaltyArea'))}
							{renderInput('away', 'miscontrols', t('teamStats.miscontrols'))}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end gap-3 pt-4 border-t">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={loading}
						>
							{t('common.cancel')}
						</Button>
						<Button
							type="submit"
							variant="primary"
							loading={loading}
							disabled={loading}
						>
							{isEditMode ? t('stats.updateStats') : t('stats.saveStats')}
						</Button>
					</div>
				</form>
			) : (
				<div className="p-8 text-center text-red-600">
					<p>{t('stats.failedToLoadMatch')}</p>
				</div>
			)}
		</Modal>
	);
};

export default TeamStatsEntryModal;
