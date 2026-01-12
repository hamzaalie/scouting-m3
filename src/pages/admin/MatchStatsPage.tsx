import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatsEntryModal from '../../components/admin/StatsEntryModal';
import { getMatchById } from '../../services/matchService';
import { getMatchStats, deletePlayerStats, type MatchStatsItem } from '../../services/statsService';
import type { Match } from '../../types/match';
import { showSuccess, showError } from '../../utils/toast';

/**
 * MatchStatsPage Component
 * 
 * Dedicated page to view and manage statistics for a specific match.
 * 
 * Features:
 * - Display match details
 * - List all player statistics for the match
 * - Add new player statistics
 * - Edit existing statistics
 * - Delete statistics
 * - Empty state handling
 * - Loading and error states
 */
const MatchStatsPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const matchId = id ? Number(id) : 0;

	// Data state
	const [match, setMatch] = useState<Match | null>(null);
	const [stats, setStats] = useState<MatchStatsItem[]>([]);
	const [loadingMatch, setLoadingMatch] = useState<boolean>(false);
	const [loadingStats, setLoadingStats] = useState<boolean>(false);

	// View state
	const [showAdvancedStats, setShowAdvancedStats] = useState<boolean>(false);

	// Modal state
	const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
	const [selectedStat, setSelectedStat] = useState<MatchStatsItem | null>(null);

	// Delete state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [statToDelete, setStatToDelete] = useState<MatchStatsItem | null>(null);
	const [deleting, setDeleting] = useState<boolean>(false);

	// Fetch match details
	const fetchMatch = useCallback(async () => {
		if (!matchId) return;

		setLoadingMatch(true);
		try {
			const matchData = await getMatchById(matchId);
			setMatch(matchData);
		} catch (err: any) {
			console.error('Failed to fetch match:', err);
			showError('Failed to load match details');
		} finally {
			setLoadingMatch(false);
		}
	}, [matchId]);

	// Fetch match statistics
	const fetchStats = useCallback(async () => {
		if (!matchId) return;

		setLoadingStats(true);
		try {
			const statsData = await getMatchStats(matchId);
			setStats(statsData || []);
		} catch (err: any) {
			console.error('Failed to fetch stats:', err);
			// If 404, it means no stats entered yet
			if (err.message?.includes('404') || err.message?.includes('not found')) {
				setStats([]);
			} else {
				showError('Failed to load statistics');
			}
		} finally {
			setLoadingStats(false);
		}
	}, [matchId]);

	useEffect(() => {
		fetchMatch();
		fetchStats();
	}, [fetchMatch, fetchStats]);

	// Handlers
	const handleBack = () => {
		navigate('/admin/matches');
	};

	const handleAddStats = () => {
		setSelectedStat(null);
		setShowStatsModal(true);
	};

	const handleEditStats = (stat: MatchStatsItem) => {
		setSelectedStat(stat);
		setShowStatsModal(true);
	};

	const handleDeleteStats = (stat: MatchStatsItem) => {
		setStatToDelete(stat);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!statToDelete) return;

		setDeleting(true);
		try {
			await deletePlayerStats(statToDelete.id);
			showSuccess('Statistics deleted successfully');
			fetchStats(); // Refresh list
			setDeleteDialogOpen(false);
			setStatToDelete(null);
		} catch (err: any) {
			console.error('Failed to delete stats:', err);
			showError(err.message || 'Failed to delete statistics');
		} finally {
			setDeleting(false);
		}
	};

	const handleModalSuccess = () => {
		fetchStats(); // Refresh stats list
	};

	const handleModalClose = () => {
		setShowStatsModal(false);
		setSelectedStat(null);
	};

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Get position badge color
	const getPositionColor = (position: string) => {
		switch (position) {
			case 'GK':
				return 'bg-orange-100 text-orange-800';
			case 'DF':
				return 'bg-blue-100 text-blue-800';
			case 'MF':
				return 'bg-green-100 text-green-800';
			case 'FW':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Page Header */}
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-3 mb-2">
							<button
								onClick={handleBack}
								className="text-gray-600 hover:text-gray-900 transition-colors"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
							</button>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-900">Match Statistics</h1>
						</div>
						{match && (
							<p className="text-gray-600">
								{match.home_team.name} vs {match.away_team.name}
							</p>
						)}
					</div>
					<Button
						variant="primary"
						onClick={handleAddStats}
						disabled={loadingMatch || !match}
					>
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Add Player Stats
					</Button>
				</div>

				{/* Match Info Card */}
				{match && (
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Match Details</h2>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div>
								<p className="text-sm text-gray-500">Date & Time</p>
								<p className="text-gray-900 font-medium">{formatDate(match.match_date)}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Competition</p>
								<p className="text-gray-900 font-medium">{match.competition}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Venue</p>
								<p className="text-gray-900 font-medium">{match.venue}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Score</p>
								<p className="text-gray-900 font-medium text-xl">
									{match.status === 'Completed' ? `${match.home_score} - ${match.away_score}` : 'TBD'}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Stats View Toggle */}
				{stats.length > 0 && (
					<div className="mb-4 flex items-center justify-end gap-3">
						<span className="text-sm text-gray-600">
							{showAdvancedStats ? t('stats.showingAdvanced') : t('stats.showingBasic')}
						</span>
						<button
							onClick={() => setShowAdvancedStats(!showAdvancedStats)}
							className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
							{showAdvancedStats ? t('stats.hideAdvanced') : t('stats.showAdvanced')}
						</button>
					</div>
				)}

				{/* Stats Table */}
				<div className="bg-white rounded-lg shadow overflow-hidden">
					{loadingStats ? (
						<div className="p-12 text-center">
							<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
							<p className="mt-4 text-gray-600">Loading statistics...</p>
						</div>
					) : stats.length === 0 ? (
						<div className="p-12 text-center">
							<svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">No Statistics Yet</h3>
							<p className="text-gray-600 mb-4">Click "Add Player Stats" to begin entering match statistics.</p>
							<Button variant="primary" onClick={handleAddStats}>
								Add Player Stats
							</Button>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 border-b border-gray-200">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Player
										</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Team
										</th>
										<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Position
										</th>
										<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Minutes
										</th>
										<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Goals
										</th>
										<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Assists
										</th>
										
										{/* Advanced Stats Columns - Passing */}
										{showAdvancedStats && (
											<>
												<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
													{t('stats.keyPasses')}
												</th>
												<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
													{t('stats.crosses')}
												</th>
												<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
													{t('stats.longBalls')}
												</th>
											</>
										)}
										
										<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Shots
										</th>
										<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Tackles
										</th>
										
										{/* Advanced Stats Columns - Defensive & Physical */}
										{showAdvancedStats && (
											<>
												<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
													{t('stats.blocks')}
												</th>
												<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
													{t('stats.dribblesSuccessful')}
												</th>
												<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
													{t('stats.duelsWon')}
												</th>
											</>
										)}
										
										<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Fouls
										</th>
										<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Cards
										</th>
										
										{/* Advanced Stats Columns - Goalkeeper */}
										{showAdvancedStats && (
											<>
												<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
													{t('stats.gkRunsOut')}
												</th>
												<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
													{t('stats.successfulPunches')}
												</th>
											</>
										)}

										<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{stats.map((stat) => (
										<tr key={stat.id} className="hover:bg-gray-50 transition-colors">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="ml-0">
														<div className="text-sm font-medium text-gray-900">
															{stat.player_info.full_name}
														</div>
														<div className="text-xs text-gray-500">
															#{stat.player_info.jersey_number || 'N/A'}
															{stat.starting_xi && (
																<span className="ml-2 text-green-600 font-semibold">(XI)</span>
															)}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{stat.player_info.team_name || 'N/A'}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-center">
												<span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPositionColor(stat.player_info.position)}`}>
													{stat.player_info.position}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
												{stat.minutes_played}'
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-900">
												{stat.goals}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
												{stat.assists}
											</td>
											
											{/* Advanced Stats Cells - Passing */}
											{showAdvancedStats && (
												<>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
														{stat.key_passes || 0}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
														{stat.crosses || 0}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
														{stat.long_balls || 0}
													</td>
												</>
											)}
											
											<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
												{stat.shots} ({stat.shots_on_target})
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
												{stat.tackles}
											</td>
											
											{/* Advanced Stats Cells - Defensive & Physical */}
											{showAdvancedStats && (
												<>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
														{stat.blocks || 0}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
														{stat.dribbles_successful !== null && stat.dribbles_successful !== undefined ? stat.dribbles_successful : '-'}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
														{stat.duels_won !== null && stat.duels_won !== undefined ? stat.duels_won : '-'}
													</td>
												</>
											)}
											
											{/* Fouls Column - Update to show both */}
											<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
												<div className="flex flex-col">
													<span className="text-red-600">{stat.fouls_committed || 0} C</span>
													{showAdvancedStats && (
														<span className="text-blue-600 text-xs">{stat.fouls_suffered || 0} S</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-center">
												<div className="flex items-center justify-center gap-1">
													{stat.yellow_cards > 0 && (
														<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
															{stat.yellow_cards}Y
														</span>
													)}
													{stat.red_cards > 0 && (
														<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
															{stat.red_cards}R
														</span>
													)}
													{stat.yellow_cards === 0 && stat.red_cards === 0 && (
														<span className="text-gray-400 text-xs">-</span>
													)}
												</div>
											</td>

										{/* Advanced Stats Cells - Goalkeeper */}
										{showAdvancedStats && (
											<>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
													{stat.gk_runs_out || 0}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
													{stat.successful_punches || 0}
												</td>
											</>
										)}
											
											<td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
												<div className="flex items-center justify-center gap-2">
													<button
														onClick={() => handleEditStats(stat)}
														className="text-blue-600 hover:text-blue-900 transition-colors"
														title="Edit"
													>
														<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
													</button>
													<button
														onClick={() => handleDeleteStats(stat)}
														className="text-red-600 hover:text-red-900 transition-colors"
														title="Delete"
													>
														<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
														</svg>
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Summary Card */}
				{stats.length > 0 && (
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<h3 className="text-sm font-semibold text-blue-900 mb-2">Statistics Summary</h3>
						<div className="text-sm text-blue-800">
							<p>
								<span className="font-semibold">{stats.length}</span> player{stats.length !== 1 ? 's' : ''} recorded •{' '}
								<span className="font-semibold">{stats.filter(s => s.starting_xi).length}</span> in Starting XI •{' '}
								<span className="font-semibold">{stats.reduce((sum, s) => sum + s.goals, 0)}</span> Total Goals •{' '}
								<span className="font-semibold">{stats.reduce((sum, s) => sum + s.assists, 0)}</span> Total Assists
								{showAdvancedStats && (
									<>
										{' '}•{' '}
										<span className="font-semibold">{stats.reduce((sum, s) => sum + (s.key_passes || 0), 0)}</span> Key Passes •{' '}
										<span className="font-semibold">{stats.reduce((sum, s) => sum + (s.blocks || 0), 0)}</span> Blocks
									</>
								)}
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Stats Entry Modal */}
			<StatsEntryModal
				isOpen={showStatsModal}
				onClose={handleModalClose}
				matchId={matchId}
				playerId={selectedStat?.player}
				statsId={selectedStat?.id}
				existingStats={selectedStat}
				onSuccess={handleModalSuccess}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={deleteDialogOpen}
				title="Delete Statistics"
				message={`Are you sure you want to delete statistics for ${statToDelete?.player_info.full_name}? This action cannot be undone.`}
				onConfirm={confirmDelete}
				onCancel={() => {
					setDeleteDialogOpen(false);
					setStatToDelete(null);
				}}
				danger={true}
				confirmLabel="Delete"
				loading={deleting}
			/>
		</DashboardLayout>
	);
};

export default MatchStatsPage;

