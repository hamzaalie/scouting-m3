import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select, { type SelectOption } from '../common/Select';
import Button from '../common/Button';
import { showSuccess, showError, showWarning } from '../../utils/toast';
import { handleApiError } from '../../utils/errorHandler';
import {
	createPlayerStats,
	updatePlayerStats,
	type PlayerStatsCreateUpdate,
} from '../../services/statsService';
import { getMatchById } from '../../services/matchService';
import { getAllPlayers } from '../../services/playerService';
import type { PlayerListItem } from '../../types/player';
import type { Match } from '../../types/match';

/**
 * StatsEntryModal Component Props
 */
export interface StatsEntryModalProps {
	/**
	 * Whether the modal is open
	 */
	isOpen: boolean;
	/**
	 * Callback when modal should close
	 */
	onClose: () => void;
	/**
	 * Match ID for which stats are being entered
	 */
	matchId: number;
	/**
	 * Player ID (optional - for editing existing stats)
	 */
	playerId?: number;
	/**
	 * Existing stats ID (optional - for editing)
	 */
	statsId?: number;
	/**
	 * Existing stats data (optional - for editing)
	 */
	existingStats?: any;
	/**
	 * Callback after successful save
	 */
	onSuccess: () => void;
}

/**
 * StatsEntryModal Component
 *
 * Modal form for entering or editing player match statistics.
 * 
 * Features:
 * - Player selection dropdown (filtered by match teams)
 * - Organized form sections: Playing Time, Offensive, Passing, Defensive, Disciplinary, Goalkeeper
 * - Real-time validation
 * - Conditional display (goalkeeper stats only for GK position)
 * - Error handling with toast notifications
 * - Loading states
 */
const StatsEntryModal: React.FC<StatsEntryModalProps> = ({
	isOpen,
	onClose,
	matchId,
	playerId,
	statsId,
	existingStats,
	onSuccess,
}) => {
	const { t } = useTranslation();

	// Match and players data
	const [match, setMatch] = useState<Match | null>(null);
	const [players, setPlayers] = useState<PlayerListItem[]>([]);
	const [loadingMatch, setLoadingMatch] = useState<boolean>(false);
	const [loadingPlayers, setLoadingPlayers] = useState<boolean>(false);

	// Form state
	const [formData, setFormData] = useState<PlayerStatsCreateUpdate>({
		player: playerId || 0,
		match: matchId,
		minutes_played: 0,
		goals: 0,
		assists: 0,
		shots: 0,
		shots_on_target: 0,
		passes_completed: 0,
		pass_accuracy: 0,
		key_passes: 0,  // NEW
		long_balls: 0,  // NEW
		crosses: 0,  // NEW
		tackles: 0,
		interceptions: 0,
		blocks: 0,  // NEW
		clearances: 0,
		dribbles_successful: 0,  // NEW
		duels_won: 0,  // NEW
		fouls_committed: 0,
		fouls_suffered: 0,  // NEW
		yellow_cards: 0,
		red_cards: 0,
		saves: 0,
		gk_runs_out: 0,  // NEW - Goalkeeper runs out
		successful_punches: 0,  // NEW - Successful punches
		highlights_video_url: '',  // NEW - Match-specific highlight video
		starting_xi: false,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState<boolean>(false);

	const isEditMode = !!statsId && !!existingStats;

	// Selected player details
	const selectedPlayer = useMemo(() => {
		return players.find(p => p.id === formData.player) || null;
	}, [players, formData.player]);

	// Check if selected player is a goalkeeper
	const isGoalkeeper = useMemo(() => {
		return selectedPlayer?.position === 'GK';
	}, [selectedPlayer]);

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
	}, [isOpen, matchId]);

	// Load players from both teams
	useEffect(() => {
		const fetchPlayers = async () => {
			if (!isOpen || !match) return;

			setLoadingPlayers(true);
			try {
				// Fetch all players, then filter by teams in frontend
				// Alternatively, fetch players per team via /api/teams/{id}/players/
				const homeTeamId = match.home_team?.id;
				const awayTeamId = match.away_team?.id;

				if (!homeTeamId || !awayTeamId) {
					showError(t('stats.matchTeamsNotFound'));
					return;
				}

				// Fetch players from both teams
				const [homePlayers, awayPlayers] = await Promise.all([
					getAllPlayers({ team: homeTeamId, page_size: 100 }),
					getAllPlayers({ team: awayTeamId, page_size: 100 }),
				]);

				const allPlayers = [
					...(homePlayers.results || []),
					...(awayPlayers.results || []),
				];

				setPlayers(allPlayers);
			} catch (err) {
				console.error('Failed to fetch players:', err);
				showError(t('stats.failedToLoadPlayers'));
				setPlayers([]);
			} finally {
				setLoadingPlayers(false);
			}
		};

		fetchPlayers();
	}, [isOpen, match]);

	// Populate form in edit mode
	useEffect(() => {
		if (isEditMode && existingStats && isOpen) {
			setFormData({
				player: existingStats.player || playerId || 0,
				match: matchId,
				minutes_played: existingStats.minutes_played ?? 0,
				goals: existingStats.goals ?? 0,
				assists: existingStats.assists ?? 0,
				shots: existingStats.shots ?? 0,
				shots_on_target: existingStats.shots_on_target ?? 0,
				passes_completed: existingStats.passes_completed ?? 0,
				pass_accuracy: existingStats.pass_accuracy ?? 0,
				key_passes: existingStats.key_passes ?? 0,  // NEW
				long_balls: existingStats.long_balls ?? 0,  // NEW
				crosses: existingStats.crosses ?? 0,  // NEW
				tackles: existingStats.tackles ?? 0,
				interceptions: existingStats.interceptions ?? 0,
				blocks: existingStats.blocks ?? 0,  // NEW
				clearances: existingStats.clearances ?? 0,
				dribbles_successful: existingStats.dribbles_successful ?? 0,  // NEW
				duels_won: existingStats.duels_won ?? 0,  // NEW
				fouls_committed: existingStats.fouls_committed ?? 0,
				fouls_suffered: existingStats.fouls_suffered ?? 0,  // NEW
				yellow_cards: existingStats.yellow_cards ?? 0,
				red_cards: existingStats.red_cards ?? 0,
				saves: existingStats.saves ?? 0,
				gk_runs_out: existingStats.gk_runs_out ?? 0,  // NEW
				successful_punches: existingStats.successful_punches ?? 0,  // NEW
				highlights_video_url: existingStats.highlights_video_url || '',  // NEW
				starting_xi: existingStats.starting_xi ?? false,
			});
		} else if (!isEditMode && isOpen) {
			// Reset form for create mode
			setFormData({
				player: playerId || 0,
				match: matchId,
				minutes_played: 0,
				goals: 0,
				assists: 0,
				shots: 0,
				shots_on_target: 0,
				passes_completed: 0,
				pass_accuracy: 0,
				key_passes: 0,  // NEW
				long_balls: 0,  // NEW
				crosses: 0,  // NEW
				tackles: 0,
				interceptions: 0,
				blocks: 0,  // NEW
				clearances: 0,
				dribbles_successful: 0,  // NEW
				duels_won: 0,  // NEW
				fouls_committed: 0,
				fouls_suffered: 0,  // NEW
				yellow_cards: 0,
				red_cards: 0,
				saves: 0,
			gk_runs_out: 0,  // NEW
			successful_punches: 0,  // NEW
				highlights_video_url: '',  // NEW
				starting_xi: false,
			});
		}
	}, [isEditMode, existingStats, playerId, matchId, isOpen]);

	// Reset errors when modal closes
	useEffect(() => {
		if (!isOpen) {
			setErrors({});
		}
	}, [isOpen]);

	// Player options for dropdown
	const playerOptions: SelectOption[] = useMemo(() => {
		return players.map(player => ({
			value: String(player.id),
			label: `${player.full_name} (#${player.jersey_number || 'N/A'}) - ${player.position} - ${player.team_name || 'No Team'}`,
		}));
	}, [players]);

	// Handle form field changes
	const handleChange = (field: keyof PlayerStatsCreateUpdate, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error for this field
		if (errors[field]) {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	// Validate form
	const validate = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Player selection
		if (!formData.player || formData.player === 0) {
			newErrors.player = t('stats.selectPlayerRequired');
		}

		// Minutes played
		const minutesPlayed = formData.minutes_played ?? 0;
		if (minutesPlayed < 0) {
			newErrors.minutes_played = t('stats.minutesCannotBeNegative');
		}
		if (minutesPlayed > 120) {
			newErrors.minutes_played = t('stats.minutesCannotExceed');
		}

		// Shots on target validation
		const shots = formData.shots ?? 0;
		const shotsOnTarget = formData.shots_on_target ?? 0;
		if (shotsOnTarget > shots) {
			newErrors.shots_on_target = t('stats.shotsOnTargetExceed');
		}

		// Pass accuracy validation
		const passAccuracy = Number(formData.pass_accuracy ?? 0);
		if (passAccuracy < 0 || passAccuracy > 100) {
			newErrors.pass_accuracy = t('stats.passAccuracyRange');
		}

		// Yellow cards validation
		const yellowCards = formData.yellow_cards ?? 0;
		if (yellowCards > 2) {
			newErrors.yellow_cards = t('stats.yellowCardsExceed');
		} else if (yellowCards === 2) {
			showWarning(t('stats.twoYellowCards'));
		}

		// Red cards validation
		const redCards = formData.red_cards ?? 0;
		if (redCards > 1) {
			newErrors.red_cards = t('stats.redCardsExceed');
		}

		// All numbers must be non-negative
		const numericFields: (keyof PlayerStatsCreateUpdate)[] = [
			'goals',
			'assists',
			'shots',
			'passes_completed',
			'key_passes',  // NEW
			'long_balls',  // NEW
			'crosses',  // NEW
			'tackles',
			'interceptions',
			'blocks',  // NEW
			'clearances',
			'dribbles_successful',  // NEW
			'duels_won',  // NEW
			'fouls_committed',
			'fouls_suffered',  // NEW
			'saves',
		];

		numericFields.forEach(field => {
			const value = Number(formData[field]);
			if (value < 0) {
				// Use a generic error message since field names vary
				newErrors[field] = t('stats.cannotBeNegative', { field: field.replace(/_/g, ' ') });
			}
		});


		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validate()) {
			showError(t('stats.fixValidationErrors'));
			return;
		}

		setLoading(true);

		try {
			// Prepare payload
			const payload: PlayerStatsCreateUpdate = {
				...formData,
				player: Number(formData.player),
				match: matchId,
			};

			if (isEditMode && statsId) {
				// Update existing stats
				await updatePlayerStats(statsId, payload);
				showSuccess(t('stats.statsUpdated'));
			} else {
				// Create new stats
				await createPlayerStats(payload);
				showSuccess(t('stats.statsSaved'));
			}

			onSuccess();
			onClose();
		} catch (err: any) {
			// Check if this is a duplicate statistics error (unique_together constraint)
			const errorMessage = err?.message || err?.toString() || '';
			const isDuplicateError =
				errorMessage.includes('unique set') ||
				errorMessage.includes('must make a unique set') ||
				errorMessage.includes('already exists') ||
				(err?.response?.data?.non_field_errors &&
					Array.isArray(err.response.data.non_field_errors) &&
					err.response.data.non_field_errors.some((msg: string) =>
						msg.includes('unique set') || msg.includes('already exists')
					));

			if (isDuplicateError && !isEditMode) {
				// Show user-friendly message for duplicate statistics
				const playerName = selectedPlayer?.full_name || 'This player';
				showError(
					`${playerName} already has statistics for this match. ` +
					`Please use the "Edit" button next to their existing statistics instead of creating new ones.`
				);
				return;
			}

			// Handle other errors - preserve form data, show field-specific errors if available
			const fieldErrors = handleApiError(err, t, undefined, t('stats.failedToSaveStatistics'));
			if (fieldErrors) {
				setErrors(fieldErrors);
			}
		} finally {
			setLoading(false);
		}
	};

	// Handle cancel
	const handleCancel = () => {
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isEditMode ? t('stats.editMatchStatistics') : t('stats.enterMatchStatistics')}
			size="xl"
		>
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Match Info */}
				{match && (
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<h3 className="text-sm font-semibold text-blue-900 mb-2">{t('matches.matchDetails')}</h3>
						<div className="text-sm text-blue-800">
							<p>
								{match.home_team?.name} vs {match.away_team?.name}
							</p>
							<p className="text-xs text-blue-600 mt-1">
								{new Date(match.match_date).toLocaleDateString()} • {match.competition}
							</p>
						</div>
					</div>
				)}

				{/* Player Selection */}
				{!isEditMode && (
					<div className="space-y-4">
						<h3 className="text-base font-semibold text-gray-900 border-b pb-2">
							{t('stats.playerSelection')}
						</h3>
						<Select
							label={t('stats.selectPlayer')}
							value={String(formData.player)}
							onChange={(value) => handleChange('player', Number(value))}
							options={playerOptions}
							error={errors.player}
							disabled={loadingPlayers}
							required
						/>
						{selectedPlayer && (
							<div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
								<span className="font-medium">{t('players.position')}:</span> {selectedPlayer.position} •{' '}
								<span className="font-medium">{t('players.team')}:</span> {selectedPlayer.team_name || t('common.n/a')} •{' '}
								<span className="font-medium">{t('players.jerseyNumber')}:</span> #{selectedPlayer.jersey_number || t('common.n/a')}
							</div>
						)}
					</div>
				)}

				{/* Section 1: Playing Time */}
				<div className="space-y-4">
					<h3 className="text-base font-semibold text-gray-900 border-b pb-2">
						{t('stats.playingTime')}
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label={t('stats.minutesPlayed')}
							type="number"
							value={String(formData.minutes_played)}
							onChange={(e) => handleChange('minutes_played', Number(e.target.value))}
							error={errors.minutes_played}
							min="0"
							max="120"
							placeholder={t('stats.minutesPlayedPlaceholder')}
							required
						/>
						<div className="flex items-center space-x-2 pt-8">
							<input
								type="checkbox"
								id="starting_xi"
								checked={formData.starting_xi}
								onChange={(e) => handleChange('starting_xi', e.target.checked)}
								className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
							/>
							<label htmlFor="starting_xi" className="text-sm font-medium text-gray-700">
								{t('stats.startingXi')}
							</label>
						</div>
					</div>
				</div>

				{/* Section 2: Offensive Stats */}
				<div className="space-y-4">
					<h3 className="text-base font-semibold text-gray-900 border-b pb-2">
						{t('stats.offensiveStatistics')}
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label={t('stats.goals')}
							type="number"
							value={String(formData.goals)}
							onChange={(e) => handleChange('goals', Number(e.target.value))}
							error={errors.goals}
							min="0"
							placeholder="0"
						/>
						<Input
							label={t('stats.assists')}
							type="number"
							value={String(formData.assists)}
							onChange={(e) => handleChange('assists', Number(e.target.value))}
							error={errors.assists}
							min="0"
							placeholder="0"
						/>
						<Input
							label={t('stats.shots')}
							type="number"
							value={String(formData.shots)}
							onChange={(e) => handleChange('shots', Number(e.target.value))}
							error={errors.shots}
							min="0"
							placeholder="0"
						/>
						<Input
							label={t('stats.shotsOnTarget')}
							type="number"
							value={String(formData.shots_on_target)}
							onChange={(e) => handleChange('shots_on_target', Number(e.target.value))}
							error={errors.shots_on_target}
							min="0"
							placeholder="0"
						/>
					</div>
				</div>

				{/* Section 3: Passing Stats */}
				<div className="space-y-4">
					<h3 className="text-base font-semibold text-gray-900 border-b pb-2">
						{t('stats.passingStatistics')}
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label={t('stats.passesCompleted')}
							type="number"
							value={String(formData.passes_completed)}
							onChange={(e) => handleChange('passes_completed', Number(e.target.value))}
							error={errors.passes_completed}
							min="0"
							placeholder="0"
						/>
						<Input
							label={t('stats.passAccuracyPercent')}
							type="number"
							value={String(formData.pass_accuracy)}
							onChange={(e) => handleChange('pass_accuracy', Number(e.target.value))}
							error={errors.pass_accuracy}
							min="0"
							max="100"
							step="0.01"
							placeholder={t('stats.passAccuracyPlaceholder')}
						/>
						<Input
							label={t('stats.keyPasses')}
							type="number"
							value={String(formData.key_passes)}
							onChange={(e) => handleChange('key_passes', Number(e.target.value))}
							error={errors.key_passes}
							min="0"
							placeholder="0"
							helperText={t('stats.keyPassesHelp')}
						/>
						<Input
							label={t('stats.longBalls')}
							type="number"
							value={String(formData.long_balls)}
							onChange={(e) => handleChange('long_balls', Number(e.target.value))}
							error={errors.long_balls}
							min="0"
							placeholder="0"
							helperText={t('stats.longBallsHelp')}
						/>
						<Input
							label={t('stats.crosses')}
							type="number"
							value={String(formData.crosses)}
							onChange={(e) => handleChange('crosses', Number(e.target.value))}
							error={errors.crosses}
							min="0"
							placeholder="0"
							helperText={t('stats.crossesHelp')}
						/>
					</div>
				</div>

				{/* Section 4: Defensive Stats */}
				<div className="space-y-4">
					<h3 className="text-base font-semibold text-gray-900 border-b pb-2">
						{t('stats.defensiveStatistics')}
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label={t('stats.tackles')}
							type="number"
							value={String(formData.tackles)}
							onChange={(e) => handleChange('tackles', Number(e.target.value))}
							error={errors.tackles}
							min="0"
							placeholder="0"
						/>
						<Input
							label={t('stats.interceptions')}
							type="number"
							value={String(formData.interceptions)}
							onChange={(e) => handleChange('interceptions', Number(e.target.value))}
							error={errors.interceptions}
							min="0"
							placeholder="0"
						/>
						<Input
							label={t('stats.blocks')}
							type="number"
							value={String(formData.blocks)}
							onChange={(e) => handleChange('blocks', Number(e.target.value))}
							error={errors.blocks}
							min="0"
							placeholder="0"
							helperText={t('stats.blocksHelp')}
						/>
						<Input
							label={t('stats.clearances')}
							type="number"
							value={String(formData.clearances)}
							onChange={(e) => handleChange('clearances', Number(e.target.value))}
							error={errors.clearances}
							min="0"
							placeholder="0"
						/>
					</div>
				</div>

				{/* Section 5: Disciplinary */}
				<div className="space-y-4">
					<h3 className="text-base font-semibold text-gray-900 border-b pb-2">
						{t('stats.disciplinary')}
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label={t('stats.foulsCommitted')}
							type="number"
							value={String(formData.fouls_committed)}
							onChange={(e) => handleChange('fouls_committed', Number(e.target.value))}
							error={errors.fouls_committed}
							min="0"
							placeholder="0"
						/>
						<Input
							label={t('stats.foulsSuffered')}
							type="number"
							value={String(formData.fouls_suffered)}
							onChange={(e) => handleChange('fouls_suffered', Number(e.target.value))}
							error={errors.fouls_suffered}
							min="0"
							placeholder="0"
							helperText={t('stats.foulsSufferedHelp')}
						/>
						<Input
							label={t('stats.yellowCards')}
							type="number"
							value={String(formData.yellow_cards)}
							onChange={(e) => handleChange('yellow_cards', Number(e.target.value))}
							error={errors.yellow_cards}
							min="0"
							max="2"
							placeholder={t('stats.yellowCardsPlaceholder')}
						/>
						<Input
							label={t('stats.redCards')}
							type="number"
							value={String(formData.red_cards)}
							onChange={(e) => handleChange('red_cards', Number(e.target.value))}
							error={errors.red_cards}
							min="0"
							max="1"
							placeholder={t('stats.redCardsPlaceholder')}
						/>
					</div>
				</div>

				{/* Section 6: Physical Statistics */}
				<div className="space-y-4">
					<h3 className="text-base font-semibold text-gray-900 border-b pb-2">
						{t('stats.physicalStats')}
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label={t('stats.dribblesSuccessful')}
							type="number"
							value={String(formData.dribbles_successful || 0)}
							onChange={(e) => handleChange('dribbles_successful', Number(e.target.value))}
							error={errors.dribbles_successful}
							min="0"
							placeholder="0"
							helperText={t('stats.dribblesSuccessfulHelp')}
						/>
						<Input
							label={t('stats.duelsWon')}
							type="number"
							value={String(formData.duels_won || 0)}
							onChange={(e) => handleChange('duels_won', Number(e.target.value))}
							error={errors.duels_won}
							min="0"
							placeholder="0"
							helperText={t('stats.duelsWonHelp')}
						/>
					</div>
				</div>


				{/* Section 8: Player Highlights Video */}
				<div className="space-y-4">
					<h3 className="text-base font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
						<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						{t('players.playerHighlights')}
					</h3>
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
						<p className="text-sm text-blue-800">
							<span className="font-semibold">{t('common.note')}:</span> {t('stats.playerHighlightsNote')}
						</p>
					</div>
					<Input
						label={t('stats.playerHighlightsUrl')}
						type="url"
						value={formData.highlights_video_url || ''}
						onChange={(e) => handleChange('highlights_video_url', e.target.value)}
						error={errors.highlights_video_url}
						placeholder="https://youtube.com/watch?v=... or https://vimeo.com/... or direct link"
						helperText={t('stats.playerHighlightsHelp')}
					/>
				</div>

				{/* Section 9: Goalkeeper Stats (conditional) */}
				{isGoalkeeper && (
					<div className="space-y-4">
						<h3 className="text-base font-semibold text-gray-900 border-b pb-2">
							{t('stats.goalkeeperStatistics')}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Input
								label={t('stats.saves')}
								type="number"
								value={String(formData.saves)}
								onChange={(e) => handleChange('saves', Number(e.target.value))}
								error={errors.saves}
								min="0"
								placeholder="0"
							/>
							<Input
								label={t('stats.gkRunsOut')}
								type="number"
								value={String(formData.gk_runs_out)}
								onChange={(e) => handleChange('gk_runs_out', Number(e.target.value))}
								error={errors.gk_runs_out}
								min="0"
								placeholder="0"
							/>
							<Input
								label={t('stats.successfulPunches')}
								type="number"
								value={String(formData.successful_punches)}
								onChange={(e) => handleChange('successful_punches', Number(e.target.value))}
								error={errors.successful_punches}
								min="0"
								placeholder="0"
							/>
						</div>
					</div>
				)}

				{/* Form Actions */}
				<div className="flex items-center justify-end space-x-3 pt-4 border-t">
					<Button
						type="button"
						variant="secondary"
						onClick={handleCancel}
						disabled={loading}
					>
						{t('common.cancel')}
					</Button>
					<Button
						type="submit"
						variant="primary"
						loading={loading}
						disabled={loading || loadingMatch || loadingPlayers}
					>
						{loading
							? t('common.saving')
							: (isEditMode ? t('stats.updateStats') : t('stats.saveStats'))
						}
					</Button>
				</div>
			</form>
		</Modal>
	);
};

export default StatsEntryModal;

