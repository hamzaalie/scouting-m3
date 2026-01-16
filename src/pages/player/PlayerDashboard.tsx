import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import { getMyProfile, getMyStats, getMyMatches } from '../../services/playerService';
import type { AggregatedStats, PlayerStats } from '../../services/statsService';
import { handleApiError } from '../../utils/errorHandler';

/**
 * Player Dashboard Page
 * 
 * Modern dashboard for players to view their performance.
 * 
 * Features:
 * - Welcome header with player info
 * - Quick stats cards (matches, goals, assists, minutes)
 * - Career overview section
 * - Recent matches table
 * - Upcoming features placeholder
 * - Loading and empty states
 */
const PlayerDashboard: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	// Data state
	const [profile, setProfile] = useState<any>(null);
	const [stats, setStats] = useState<AggregatedStats | null>(null);
	const [recentMatches, setRecentMatches] = useState<PlayerStats[]>([]);

	// Loading states
	const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
	const [loadingStats, setLoadingStats] = useState<boolean>(true);
	const [loadingMatches, setLoadingMatches] = useState<boolean>(true);

	// Fetch data on mount
	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch profile
				setLoadingProfile(true);
				const profileData = await getMyProfile();
				setProfile(profileData);
			} catch (err: any) {
				// Silently handle profile fetch errors (new users may not have profile yet)
				console.debug('[PlayerDashboard] Profile fetch error (expected for new users):', err);
				setProfile(null);
			} finally {
				setLoadingProfile(false);
			}

			try {
				// Fetch stats
				setLoadingStats(true);
				const statsData = await getMyStats();
				if (statsData === null) {
					// No player profile exists - this is expected for new users
					setStats(null);
				} else {
					setStats(statsData);
				}
			} catch (err: any) {
				// Silently handle stats errors (expected if no player profile exists)
				console.debug('[PlayerDashboard] Stats fetch error (expected for new users):', err);
				setStats(null);
			} finally {
				setLoadingStats(false);
			}

			try {
				// Fetch recent matches
				setLoadingMatches(true);
				const matchesData = await getMyMatches();
				if (matchesData === null) {
					// No player profile exists - this is expected for new users
					setRecentMatches([]);
				} else {
					setRecentMatches(matchesData.results?.slice(0, 5) || []);
				}
			} catch (err: any) {
				// Silently handle matches errors (expected if no player profile exists)
				console.debug('[PlayerDashboard] Matches fetch error (expected for new users):', err);
				setRecentMatches([]);
			} finally {
				setLoadingMatches(false);
			}
		};

		fetchData();
	}, []);

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	// Get position badge color
	const getPositionColor = (position: string) => {
		switch (position) {
			case 'GK': return 'bg-orange-100 text-orange-800';
			case 'DF': return 'bg-blue-100 text-blue-800';
			case 'MF': return 'bg-green-100 text-green-800';
			case 'FW': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	const playerProfile = profile?.player_profile;
	const hasStats = stats && stats.total_matches > 0;
	const hasPlayerProfile = !!playerProfile;

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Show message if no player profile exists */}
				{!loadingProfile && !hasPlayerProfile && (
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<div className="flex items-start gap-3">
							<svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
							<div>
								<h3 className="text-sm font-semibold text-yellow-800 mb-1">
									{t('dashboard.playerProfileNotSet')}
								</h3>
								<p className="text-sm text-yellow-700">
									{t('dashboard.playerProfileNotSetMessage')}
								</p>
							</div>
						</div>
					</div>
				)}
				{/* Section 1: Welcome Header */}
				<div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-6">
							{loadingProfile ? (
								<div className="w-24 h-24 bg-white/20 rounded-full animate-pulse"></div>
							) : (
								<Avatar
									src={profile?.profile_picture}
									alt={profile?.full_name || t('players.player')}
									size="xl"
									className="border-4 border-white/30"
								/>
							)}
							<div>
								{loadingProfile ? (
									<>
										<div className="h-8 w-48 bg-white/20 rounded animate-pulse mb-2"></div>
										<div className="h-5 w-32 bg-white/20 rounded animate-pulse"></div>
									</>
								) : (
									<>
										<h1 className="text-2xl md:text-3xl font-bold mb-2">
											{t('dashboard.welcome')}, {profile?.full_name || profile?.username}!
										</h1>
										{playerProfile && (
											<div className="flex items-center gap-4 text-blue-100">
												<span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPositionColor(playerProfile.position)} text-opacity-90`}>
													{playerProfile.position}
												</span>
												{playerProfile.team && (
													<span className="font-medium">{playerProfile.team.name}</span>
												)}
												{playerProfile.jersey_number && (
													<span className="font-medium">#{playerProfile.jersey_number}</span>
												)}
											</div>
										)}
									</>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Section 2: Quick Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* Card 1: Total Matches */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between mb-4">
							<div className="p-3 bg-blue-100 rounded-lg">
								<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
						</div>
						<div>
							{loadingStats ? (
								<>
									<Skeleton width="w-16" height="h-8" className="mb-2" />
									<Skeleton width="w-24" height="h-4" />
								</>
							) : (
								<>
									<p className="text-3xl font-bold text-gray-900">{stats?.total_matches || 0}</p>
									<p className="text-sm text-gray-600">{t('stats.totalMatches')}</p>
								</>
							)}
						</div>
					</div>

					{/* Card 2: Goals */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between mb-4">
							<div className="p-3 bg-green-100 rounded-lg">
								<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
						</div>
						<div>
							{loadingStats ? (
								<>
									<Skeleton width="w-16" height="h-8" className="mb-2" />
									<Skeleton width="w-32" height="h-4" />
								</>
							) : (
								<>
									<p className="text-3xl font-bold text-gray-900">{stats?.total_goals || 0}</p>
									<p className="text-sm text-gray-600">
										{t('stats.goals')} ({stats?.goals_per_match != null ? Number(stats.goals_per_match).toFixed(2) : '0.00'} {t('stats.perMatch')})
									</p>
								</>
							)}
						</div>
					</div>

					{/* Card 3: Assists */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between mb-4">
							<div className="p-3 bg-purple-100 rounded-lg">
								<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
						</div>
						<div>
							{loadingStats ? (
								<>
									<Skeleton width="w-16" height="h-8" className="mb-2" />
									<Skeleton width="w-32" height="h-4" />
								</>
							) : (
								<>
									<p className="text-3xl font-bold text-gray-900">{stats?.total_assists || 0}</p>
									<p className="text-sm text-gray-600">
										{t('stats.assists')} ({stats?.assists_per_match != null ? Number(stats.assists_per_match).toFixed(2) : '0.00'} {t('stats.perMatch')})
									</p>
								</>
							)}
						</div>
					</div>

					{/* Card 4: Key Passes - NEW */}
					<div className="bg-white rounded-lg shadow p-6 border-2 border-orange-200">
						<div className="flex items-center justify-between mb-4">
							<div className="p-3 bg-orange-100 rounded-lg">
								<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
								</svg>
							</div>
						</div>
						<div>
							{loadingStats ? (
								<>
									<Skeleton width="w-16" height="h-8" className="mb-2" />
									<Skeleton width="w-24" height="h-4" />
								</>
							) : (
								<>
									<p className="text-3xl font-bold text-orange-700">{stats?.total_key_passes || 0}</p>
									<p className="text-sm text-gray-600">
										{t('stats.keyPasses')} ({stats?.key_passes_per_match != null ? Number(stats.key_passes_per_match).toFixed(2) : '0.00'} {t('stats.perMatch')})
									</p>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Section 3: Career Overview */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-xl font-bold text-gray-900 mb-6">{t('player.careerOverview')}</h2>
					{loadingStats ? (
						<div className="h-48 bg-gray-100 rounded animate-pulse"></div>
					) : hasStats ? (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
							<div className="text-center">
								<p className="text-3xl font-bold text-blue-600">{stats?.total_shots || 0}</p>
								<p className="text-sm text-gray-600 mt-1">{t('stats.shots')}</p>
							</div>
							<div className="text-center">
								<p className="text-3xl font-bold text-green-600">{stats?.total_tackles || 0}</p>
								<p className="text-sm text-gray-600 mt-1">{t('stats.tackles')}</p>
							</div>
							<div className="text-center">
								<p className="text-3xl font-bold text-yellow-600">{stats?.total_yellow_cards || 0}</p>
								<p className="text-sm text-gray-600 mt-1">{t('stats.yellowCards')}</p>
							</div>
							<div className="text-center">
								<p className="text-3xl font-bold text-red-600">{stats?.total_red_cards || 0}</p>
								<p className="text-sm text-gray-600 mt-1">{t('stats.redCards')}</p>
							</div>
						</div>
					) : (
						<EmptyState
							icon={<ChartBarIcon className="w-16 h-16 text-gray-400" />}
							title={t('stats.noStatsYet')}
							message={t('stats.noStatsDescription')}
						/>
					)}
				</div>

				{/* Section 4: Recent Matches */}
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
						<h2 className="text-xl font-bold text-gray-900">{t('player.recentMatches')}</h2>
						{recentMatches.length > 0 && (
							<button
								onClick={() => navigate('/player/matches')}
								className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
							>
								{t('common.view')} {t('common.all')} →
							</button>
						)}
					</div>
					<div>
						{loadingMatches ? (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-gray-50 border-b border-gray-200">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
												{t('matches.matchDate')}
											</th>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
												{t('matches.title')}
											</th>
											<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
												{t('stats.minutes')}
											</th>
											<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
												{t('stats.goals')}
											</th>
											<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
												{t('stats.assists')}
											</th>
											<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
												{t('stats.cards')}
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{[1, 2, 3, 4, 5].map((i) => (
											<tr key={i}>
												<td className="px-6 py-4 whitespace-nowrap">
													<Skeleton width="w-24" height="h-4" />
												</td>
												<td className="px-6 py-4">
													<Skeleton width="w-48" height="h-4" />
												</td>
												<td className="px-6 py-4 text-center">
													<Skeleton width="w-8" height="h-4" className="mx-auto" />
												</td>
												<td className="px-6 py-4 text-center">
													<Skeleton width="w-8" height="h-4" className="mx-auto" />
												</td>
												<td className="px-6 py-4 text-center">
													<Skeleton width="w-8" height="h-4" className="mx-auto" />
												</td>
												<td className="px-6 py-4 text-center">
													<Skeleton width="w-16" height="h-4" className="mx-auto" />
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : recentMatches.length > 0 ? (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-gray-50 border-b border-gray-200">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
												{t('matches.matchDate')}
											</th>
											<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
												{t('matches.title')}
											</th>
											<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
												{t('stats.minutes')}
											</th>
											<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
												{t('stats.goals')}
											</th>
											<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
												{t('stats.assists')}
											</th>
											<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
												{t('stats.cards')}
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{recentMatches.map((match) => (
											<tr key={match.id} className="hover:bg-gray-50 transition-colors">
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{match.match_info?.match_date ? formatDate(match.match_info.match_date) : t('common.n/a')}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm font-medium text-gray-900">
														{match.match_info?.home_team} {t('matches.vs')} {match.match_info?.away_team}
													</div>
													<div className="text-xs text-gray-500">{match.match_info?.competition}</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
													{match.minutes_played}'
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
													{match.goals}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
													{match.assists}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-center">
													<div className="flex items-center justify-center gap-1">
														{match.yellow_cards > 0 && (
															<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
																{match.yellow_cards}{t('stats.yellowCardAbbr')}
															</span>
														)}
														{match.red_cards > 0 && (
															<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
																{match.red_cards}{t('stats.redCardAbbr')}
															</span>
														)}
														{match.yellow_cards === 0 && match.red_cards === 0 && (
															<span className="text-gray-400 text-xs">-</span>
														)}
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<div className="text-center py-12">
								<svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								<p className="text-gray-600">{t('matches.noMatches')}</p>
								<p className="text-sm text-gray-500 mt-2">{t('player.matchHistoryWillAppear')}</p>
							</div>
						)}
					</div>
				</div>

			</div>
		</DashboardLayout>
	);
};

export default PlayerDashboard;
