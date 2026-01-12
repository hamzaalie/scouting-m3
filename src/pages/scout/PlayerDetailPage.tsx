import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import VideoEmbed from '../../components/common/VideoEmbed';
import { getPlayerById } from '../../services/playerService';
import { getAggregatedStats, getPlayerStats } from '../../services/statsService';
import type { Player } from '../../types/player';
import type { AggregatedStats, PlayerStats as PlayerMatchStats } from '../../services/statsService';
import { handleApiError } from '../../utils/errorHandler';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

/**
 * Player Detail Page (Scout View)
 * 
 * Comprehensive player profile page for scouts to evaluate players.
 * 
 * Features:
 * - Player header with profile picture, basic info
 * - Personal information card
 * - Career statistics overview
 * - Season performance breakdown
 * - Recent match history
 * - Action buttons (favorites, compare, export)
 */
const PlayerDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();

	// State
	const [player, setPlayer] = useState<Player | null>(null);
	const [careerStats, setCareerStats] = useState<AggregatedStats | null>(null);
	const [recentMatches, setRecentMatches] = useState<PlayerMatchStats[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [selectedSeason, setSelectedSeason] = useState<string>('all');
	const [expandedMatches, setExpandedMatches] = useState<Set<number>>(new Set());

	// Fetch player data
	useEffect(() => {
		if (!id) return;

		const fetchData = async () => {
			try {
				setLoading(true);
				const playerId = parseInt(id);

				// Fetch player details
				const playerData = await getPlayerById(playerId);
				setPlayer(playerData);

				// Fetch career stats
				try {
					const stats = await getAggregatedStats(playerId);
					setCareerStats(stats);
				} catch (err) {
					console.warn('Failed to fetch career stats:', err);
				}

				// Fetch recent matches (last 10)
				try {
					const matchesResponse = await getPlayerStats({ player: playerId, page_size: 10 });
					setRecentMatches(matchesResponse.results || []);
				} catch (err) {
					console.warn('Failed to fetch match history:', err);
				}

				// Fetch season stats (optional - can be implemented later)
				// try {
				// 	const seasonData = await getSeasonStats(playerId, {});
				// 	// Season stats returns a single object, not an array
				// 	// We'll handle it as needed
				// } catch (err) {
				// 	console.warn('Failed to fetch season stats:', err);
				// }
				} catch (err: any) {
				handleApiError(err, t, navigate, t('scout.failedToLoadPlayerProfile'));
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	// Position color helper
	const getPositionColor = (position: string) => {
		switch (position) {
			case 'GK': return 'bg-orange-100 text-orange-800';
			case 'DF': return 'bg-blue-100 text-blue-800';
			case 'MF': return 'bg-green-100 text-green-800';
			case 'FW': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	// Toggle match expansion
	const toggleMatch = (matchId: number) => {
		setExpandedMatches(prev => {
			const newSet = new Set(prev);
			if (newSet.has(matchId)) {
				newSet.delete(matchId);
			} else {
				newSet.add(matchId);
			}
			return newSet;
		});
	};

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
		return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
	};

	if (loading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center min-h-[400px]">
					<LoadingSpinner size="lg" />
				</div>
			</DashboardLayout>
		);
	}

	if (!player) {
		return (
			<DashboardLayout>
				<EmptyState
					title={t('scout.playerNotFound')}
					message={t('scout.playerNotFoundMessage')}
					action={{
						label: t('scout.backToPlayers'),
						onClick: () => navigate('/scout/players'),
					}}
				/>
			</DashboardLayout>
		);
	}

	const isGoalkeeper = player.position === 'GK';

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Back Button */}
				<button
					onClick={() => navigate('/scout/players')}
					className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
				>
					<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					{t('scout.backToPlayers')}
				</button>

				{/* Section 1: Player Header */}
				<div className="bg-white rounded-lg shadow-sm p-6">
					<div className="flex flex-col md:flex-row items-center md:items-start gap-6">
						{/* Profile Picture */}
						<div className="flex-shrink-0">
							<Avatar
								src={player.user.profile_picture}
								alt={player.full_name}
								size="xl"
								className="w-32 h-32"
							/>
						</div>

						{/* Player Info */}
						<div className="flex-1 text-center md:text-left">
							<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{player.full_name}</h1>
							<div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
								<span className="text-lg text-gray-600">
									{player.age ? `${player.age} ${t('scout.yearsOld')}` : t('common.n/a')}
								</span>
								{player.age && player.nationality && <span className="text-lg text-gray-600">•</span>}
								<span className="text-lg text-gray-600">
									{player.nationality && player.nationality.trim() ? `🌍 ${player.nationality}` : t('common.n/a')}
								</span>
							</div>

							<div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
								<Badge className={getPositionColor(player.position)}>
									{player.position} - {t(`players.position${player.position}`)}
								</Badge>
								{player.team && (
									<div className="flex items-center gap-2">
										<span className="text-gray-700 font-medium">{player.team.name}</span>
									</div>
								)}
								{player.jersey_number && (
									<div className="flex items-center gap-2">
										<span className="text-gray-500">{t('players.jerseyNumber')} #</span>
										<span className="text-2xl font-bold text-gray-900">{player.jersey_number}</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Two Column Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column */}
					<div className="lg:col-span-2 space-y-6">
						{/* Section 2: Personal Info Card */}
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4">{t('scout.personalInformation')}</h2>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								<div>
									<p className="text-sm text-gray-500 mb-1">{t('players.height')}</p>
									<p className="text-lg font-semibold text-gray-900">
										{player.height && player.height > 0 ? `${player.height} cm` : t('common.n/a')}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-500 mb-1">{t('players.weight')}</p>
									<p className="text-lg font-semibold text-gray-900">
										{player.weight && player.weight > 0 ? `${player.weight} kg` : t('common.n/a')}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-500 mb-1">{t('players.dateOfBirth')}</p>
									<p className="text-lg font-semibold text-gray-900">
										{player.date_of_birth ? formatDate(player.date_of_birth) : t('common.n/a')}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-500 mb-1">{t('players.preferredFoot')}</p>
									<p className="text-lg font-semibold text-gray-900">
										{player.preferred_foot && player.preferred_foot.trim() ? player.preferred_foot : t('common.n/a')}
									</p>
								</div>
							</div>
							{player.bio && (
								<div className="mt-6 pt-6 border-t border-gray-200">
									<p className="text-sm text-gray-500 mb-2">{t('players.bio')}</p>
									<p className="text-gray-700 leading-relaxed">{player.bio}</p>
								</div>
							)}
						</div>

						{/* Section 4: Season Performance */}
						<div className="bg-white rounded-lg shadow p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-bold text-gray-900">{t('scout.seasonPerformance')}</h2>
								<select
									value={selectedSeason}
									onChange={(e) => setSelectedSeason(e.target.value)}
									className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
								>
									<option value="all">{t('scout.allSeasons')}</option>
									<option value="2024">2024</option>
									<option value="2023">2023</option>
									<option value="2022">2022</option>
								</select>
							</div>
							<div className="text-center py-8 text-gray-500">
								<p>{t('scout.seasonStatsPlaceholder')}</p>
								<p className="text-sm mt-2">{t('scout.filterBySeason')}</p>
							</div>
						</div>

						{/* Section 5: Match History */}
						<div className="bg-white rounded-lg shadow p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-bold text-gray-900">{t('scout.recentMatches')}</h2>
								{recentMatches.length >= 10 && (
									<button
										onClick={() => navigate(`/scout/players/${id}/matches`)}
										className="text-indigo-600 hover:text-indigo-800 font-medium"
									>
										{t('scout.viewAll')} →
									</button>
								)}
							</div>

							{recentMatches.length > 0 ? (
								<div className="space-y-2">
									{recentMatches.map((match) => (
										<div
											key={match.id || match.match}
											className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
										>
											<div
												className="p-4 cursor-pointer"
												onClick={() => toggleMatch(match.id || match.match)}
											>
												<div className="flex items-center justify-between">
													<div className="flex-1">
														<div className="flex items-center gap-4">
															<span className="text-sm text-gray-500">
																{match.match_info?.match_date ? formatDate(match.match_info.match_date) : t('common.n/a')}
															</span>
															<span className="text-sm font-medium text-gray-700">
																{match.match_info?.competition || t('matches.match')}
															</span>
														</div>
														{match.match_info && (
															<div className="mt-2 text-sm text-gray-600">
																{match.match_info.home_team || t('matches.homeTeam')} {t('matches.vs')} {match.match_info.away_team || t('matches.awayTeam')}
															</div>
														)}
													</div>
													<div className="flex items-center gap-6">
														<div className="text-center">
															<p className="text-xs text-gray-500">{t('stats.goals')}</p>
															<p className="text-lg font-bold">{match.goals || 0}</p>
														</div>
														<div className="text-center">
															<p className="text-xs text-gray-500">{t('stats.assists')}</p>
															<p className="text-lg font-bold">{match.assists || 0}</p>
														</div>
														<div className="text-center">
															<p className="text-xs text-gray-500">{t('stats.minutes')}</p>
															<p className="text-lg font-bold">{match.minutes_played || 0}</p>
														</div>
														<svg
															className={`w-5 h-5 text-gray-400 transition-transform ${expandedMatches.has(match.id || match.match) ? 'rotate-180' : ''
															}`}
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
														</svg>
													</div>
												</div>
											</div>

											{expandedMatches.has(match.id || match.match) && (
												<div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
													{/* Starting XI Badge */}
													{match.starting_xi && (
														<div className="pt-3 pb-2">
															<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
																⭐ {t('stats.startingXi')}
															</span>
														</div>
													)}

													{/* Comprehensive Stats Grid */}
													<div className="space-y-4 pt-4">
														{/* Attacking Stats */}
														<div>
															<h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">{t('stats.offensiveStatistics')}</h4>
															<div className="grid grid-cols-3 md:grid-cols-5 gap-4">
														<div>
															<p className="text-xs text-gray-500">{t('stats.shots')}</p>
															<p className="text-sm font-semibold">{match.shots || 0}</p>
														</div>
														<div>
																	<p className="text-xs text-gray-500">{t('stats.shotsOnTarget')}</p>
																	<p className="text-sm font-semibold">{match.shots_on_target || 0}</p>
																</div>
																<div>
																	<p className="text-xs text-gray-500">{t('stats.keyPasses')}</p>
																	<p className="text-sm font-semibold">{match.key_passes || 0}</p>
																</div>
																<div>
																	<p className="text-xs text-gray-500">{t('stats.dribblesSuccessful')}</p>
																	<p className="text-sm font-semibold">{match.dribbles_successful || 0}</p>
																</div>
																<div>
																	<p className="text-xs text-gray-500">{t('stats.crosses')}</p>
																	<p className="text-sm font-semibold">{match.crosses || 0}</p>
																</div>
															</div>
														</div>

														{/* Passing Stats */}
														<div>
															<h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">{t('stats.passingStatistics')}</h4>
															<div className="grid grid-cols-3 md:grid-cols-4 gap-4">
																<div>
																	<p className="text-xs text-gray-500">{t('stats.passesCompleted')}</p>
																	<p className="text-sm font-semibold">{match.passes_completed || 0}</p>
														</div>
														<div>
															<p className="text-xs text-gray-500">{t('stats.passAccuracy')}</p>
															<p className="text-sm font-semibold">{match.pass_accuracy || 0}%</p>
														</div>
														<div>
																	<p className="text-xs text-gray-500">{t('stats.longBalls')}</p>
																	<p className="text-sm font-semibold">{match.long_balls || 0}</p>
																</div>
															</div>
														</div>

														{/* Defensive Stats */}
														<div>
															<h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">{t('stats.defensiveStatistics')}</h4>
															<div className="grid grid-cols-3 md:grid-cols-5 gap-4">
																<div>
																	<p className="text-xs text-gray-500">{t('stats.tackles')}</p>
																	<p className="text-sm font-semibold">{match.tackles || 0}</p>
																</div>
																<div>
																	<p className="text-xs text-gray-500">{t('stats.interceptions')}</p>
																	<p className="text-sm font-semibold">{match.interceptions || 0}</p>
																</div>
																<div>
																	<p className="text-xs text-gray-500">{t('stats.blocks')}</p>
																	<p className="text-sm font-semibold">{match.blocks || 0}</p>
																</div>
																<div>
																	<p className="text-xs text-gray-500">{t('stats.clearances')}</p>
																	<p className="text-sm font-semibold">{match.clearances || 0}</p>
																</div>
																<div>
																	<p className="text-xs text-gray-500">{t('stats.duelsWon')}</p>
																	<p className="text-sm font-semibold">{match.duels_won || 0}</p>
																</div>
															</div>
														</div>

														{/* Discipline & Physical Stats */}
														<div>
															<h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">{t('stats.disciplinary')}</h4>
															<div className="grid grid-cols-3 md:grid-cols-5 gap-4">
																<div>
																	<p className="text-xs text-gray-500">{t('stats.foulsCommitted')}</p>
																	<p className="text-sm font-semibold">{match.fouls_committed || 0}</p>
																</div>
																<div>
																	<p className="text-xs text-gray-500">{t('stats.foulsSuffered')}</p>
																	<p className="text-sm font-semibold">{match.fouls_suffered || 0}</p>
																</div>
																<div>
																	<p className="text-xs text-gray-500">{t('stats.yellowCards')}</p>
																	<p className="text-sm font-semibold text-yellow-600">{match.yellow_cards || 0}</p>
																</div>
																<div>
																	<p className="text-xs text-gray-500">{t('stats.redCards')}</p>
																	<p className="text-sm font-semibold text-red-600">{match.red_cards || 0}</p>
																</div>
															</div>
														</div>

														{/* Goalkeeper Stats */}
														{isGoalkeeper && (
															<div>
																<h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">{t('stats.goalkeeperStatistics')}</h4>
																<div className="grid grid-cols-3 md:grid-cols-4 gap-4">
																	<div>
																		<p className="text-xs text-gray-500">{t('stats.saves')}</p>
																		<p className="text-sm font-semibold">{match.saves || 0}</p>
																	</div>
																	<div>
																		<p className="text-xs text-gray-500">{t('stats.gkRunsOut')}</p>
																		<p className="text-sm font-semibold">{match.gk_runs_out || 0}</p>
																	</div>
																	<div>
																		<p className="text-xs text-gray-500">{t('stats.successfulPunches')}</p>
																		<p className="text-sm font-semibold">{match.successful_punches || 0}</p>
																	</div>
																</div>
															</div>
														)}
													</div>
												</div>
											)}
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-gray-500">
									<p>{t('scout.noMatchHistory')}</p>
								</div>
							)}
					</div>

						{/* Match Highlights Gallery - NEW SECTION */}
						{recentMatches.filter(m => m.highlights_video_url).length > 0 && (
						<div className="bg-white rounded-lg shadow p-6">
							<div className="flex items-center justify-between mb-6">
									<h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
										<svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
										</svg>
										{t('players.matchHighlightsGallery')}
								</h2>
									<span className="text-sm text-gray-500">
										{recentMatches.filter(m => m.highlights_video_url).length} {t('players.videosAvailable')}
									</span>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{recentMatches
										.filter(match => match.highlights_video_url)
										.map((match) => (
											<div
												key={match.id || match.match}
												className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
											>
												{/* Card Header */}
												<div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200">
													<div className="flex items-center justify-between mb-2">
														<span className="text-xs font-semibold text-indigo-600">
															{match.match_info?.competition || t('matches.match')}
														</span>
														<span className="text-xs text-gray-500">
															{match.match_info?.match_date ? formatDate(match.match_info.match_date) : ''}
														</span>
													</div>
													{match.match_info && (
														<div className="text-sm font-semibold text-gray-900">
															{match.match_info.home_team} {t('matches.vs')} {match.match_info.away_team}
														</div>
								)}
							</div>

												{/* Stats Summary */}
												<div className="p-4 bg-white">
													<div className="flex justify-around mb-4">
														<div className="text-center">
															<p className="text-2xl font-bold text-indigo-600">{match.goals || 0}</p>
															<p className="text-xs text-gray-500">{t('stats.goals')}</p>
														</div>
														<div className="text-center">
															<p className="text-2xl font-bold text-purple-600">{match.assists || 0}</p>
															<p className="text-xs text-gray-500">{t('stats.assists')}</p>
									</div>
														<div className="text-center">
															<p className="text-2xl font-bold text-gray-700">{match.minutes_played || 0}</p>
															<p className="text-xs text-gray-500">{t('stats.minutes')}</p>
												</div>
											</div>

													{/* Video Embed */}
													{match.highlights_video_url && (
														<VideoEmbed
															url={match.highlights_video_url}
															title={`Match Highlights`}
														/>
													)}
												</div>
											</div>
										))}
												</div>
							</div>
						)}
											</div>

					{/* Right Column */}
					<div className="space-y-6">
						{/* Section 3: Career Statistics Card */}
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4">{t('scout.careerStatistics')}</h2>
							{careerStats ? (
								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="text-center p-4 bg-blue-50 rounded-lg">
											<p className="text-3xl font-bold text-blue-600">{careerStats.total_matches}</p>
											<p className="text-sm text-gray-600 mt-1">{t('stats.matches')}</p>
										</div>
										<div className="text-center p-4 bg-green-50 rounded-lg">
											<p className="text-3xl font-bold text-green-600">{careerStats.total_goals}</p>
											<p className="text-sm text-gray-600 mt-1">{t('stats.goals')}</p>
										</div>
										<div className="text-center p-4 bg-purple-50 rounded-lg">
											<p className="text-3xl font-bold text-purple-600">{careerStats.total_assists}</p>
											<p className="text-sm text-gray-600 mt-1">{t('stats.assists')}</p>
										</div>
										<div className="text-center p-4 bg-orange-50 rounded-lg">
											<p className="text-3xl font-bold text-orange-600">{careerStats.total_minutes}</p>
											<p className="text-sm text-gray-600 mt-1">{t('stats.minutes')}</p>
												</div>
											</div>

									<div className="pt-4 border-t border-gray-200">
										<div className="space-y-3">
											<div className="flex justify-between">
												<span className="text-gray-600">{t('stats.goals')} {t('stats.perMatch')}</span>
												<span className="font-semibold">
															{careerStats.goals_per_match ? Number(careerStats.goals_per_match).toFixed(2) : '0.00'}
														</span>
													</div>
											<div className="flex justify-between">
												<span className="text-gray-600">{t('stats.assists')} {t('stats.perMatch')}</span>
												<span className="font-semibold">
															{careerStats.assists_per_match ? Number(careerStats.assists_per_match).toFixed(2) : '0.00'}
														</span>
													</div>
													</div>
												</div>

									<div className="pt-4 border-t border-gray-200">
										<h3 className="text-sm font-semibold text-gray-700 mb-3">{t('scout.disciplinaryRecord')}</h3>
										<div className="flex justify-between">
											<span className="text-gray-600">{t('stats.yellowCards')}</span>
											<span className="font-semibold text-yellow-600">{careerStats.total_yellow_cards}</span>
										</div>
										<div className="flex justify-between mt-2">
											<span className="text-gray-600">{t('stats.redCards')}</span>
											<span className="font-semibold text-red-600">{careerStats.total_red_cards}</span>
											</div>
										</div>

									{isGoalkeeper && (careerStats.total_saves > 0 || careerStats.total_gk_runs_out || careerStats.total_successful_punches) && (
										<div className="pt-4 border-t border-gray-200">
											<h3 className="text-sm font-semibold text-gray-700 mb-3">{t('stats.goalkeeperStatistics')}</h3>
											{careerStats.total_saves > 0 && (
												<div className="flex justify-between mb-2">
													<span className="text-gray-600">{t('stats.saves')}</span>
													<span className="font-semibold text-blue-600">{careerStats.total_saves}</span>
												</div>
											)}
											{careerStats.total_gk_runs_out && careerStats.total_gk_runs_out > 0 && (
												<div className="flex justify-between mb-2">
													<span className="text-gray-600">{t('stats.gkRunsOut')}</span>
													<span className="font-semibold text-blue-600">{careerStats.total_gk_runs_out}</span>
												</div>
											)}
											{careerStats.total_successful_punches && careerStats.total_successful_punches > 0 && (
												<div className="flex justify-between">
													<span className="text-gray-600">{t('stats.successfulPunches')}</span>
													<span className="font-semibold text-blue-600">{careerStats.total_successful_punches}</span>
												</div>
											)}
										</div>
									)}
								</div>
							) : (
								<div className="text-center py-8 text-gray-500">
									<p>{t('scout.noStatisticsAvailable')}</p>
								</div>
							)}
						</div>

						{/* Section 6: Actions */}
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4">{t('scout.actions')}</h2>
							<div className="space-y-3">
								<button
									className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
									disabled
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
									</svg>
									{t('scout.addToFavorites')} ({t('scout.comingSoon')})
								</button>
								<button
									className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
									disabled
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
									</svg>
									{t('scout.compare')} ({t('scout.comingSoon')})
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default PlayerDetailPage;
