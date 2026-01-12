import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Select from '../../components/common/Select';
import EmptyState from '../../components/common/EmptyState';
import { getMyProfile, getMyStats, getMyMatches } from '../../services/playerService';
import { getSeasonStats } from '../../services/statsService';
import type { AggregatedStats, SeasonStats, PlayerStats } from '../../services/statsService';
import { handleApiError } from '../../utils/errorHandler';
import { showError } from '../../utils/toast';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Stats Page (Player)
 * 
 * Comprehensive statistics breakdown page for players.
 * 
 * Features:
 * - Season/Competition selector
 * - Detailed stats by category (Offensive, Passing, Defensive, Disciplinary, Goalkeeper)
 * - Visual stat cards with icons and colors
 * - All-time vs filtered stats
 * - Loading and empty states
 */
const StatsPage: React.FC = () => {
	const { t } = useTranslation();
	
	// State
	const [profile, setProfile] = useState<any>(null);
	const [allTimeStats, setAllTimeStats] = useState<AggregatedStats | null>(null);
	const [seasonStats, setSeasonStats] = useState<SeasonStats | null>(null);
	const [matches, setMatches] = useState<PlayerStats[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	
	// Filter state
	const [selectedYear, setSelectedYear] = useState<string>('');
	const [selectedCompetition, setSelectedCompetition] = useState<string>('');
	
	// Fetch data on mount
	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const profileData = await getMyProfile();
				setProfile(profileData);
			} catch (err: any) {
				// Silently handle errors (expected for new users without profile)
				console.debug('Failed to fetch profile (expected for new users):', err);
			}
		};

		fetchProfile();
	}, []);

	// Fetch stats when filters change
	useEffect(() => {
		const fetchStats = async () => {
			try {
				setLoading(true);

				if (!profile?.player_profile?.id) {
					return;
				}

				const playerId = profile.player_profile.id;

				// Fetch all-time stats
				const allTime = await getMyStats();
				setAllTimeStats(allTime);

				// Fetch matches data for charts
				const matchesData = await getMyMatches();
				setMatches(matchesData?.results || []);

				// Fetch filtered stats if filters applied
				if (selectedYear || selectedCompetition) {
					const filters: any = {};
					if (selectedYear) filters.year = parseInt(selectedYear);
					if (selectedCompetition) filters.competition = selectedCompetition;
					
					const season = await getSeasonStats(playerId, filters);
					setSeasonStats(season);
				} else {
					setSeasonStats(null);
				}
			} catch (err: any) {
				// Silently handle stats errors - expected for new users without player profiles
				console.log('[StatsPage] Stats fetch error (expected for new users):', err);
				setStats(null);
				setMatches([]);
				setSeasonStats(null);
			} finally {
				setLoading(false);
			}
		};

		if (profile) {
			fetchStats();
		}
	}, [profile, selectedYear, selectedCompetition]);

	// Get available years
	const getAvailableYears = () => {
		const currentYear = new Date().getFullYear();
		const years = [];
		for (let i = 0; i < 10; i++) {
			years.push((currentYear - i).toString());
		}
		return years;
	};

	// Determine which stats to display
	// If filtered, use season stats for basic metrics, but fallback to all-time for detailed stats
	const isFiltered = selectedYear || selectedCompetition;
	
	// For display, we'll use allTimeStats as the base since SeasonStats has limited fields
	const displayStats = allTimeStats;
	
	// Check if player is a goalkeeper
	const isGoalkeeper = profile?.position === 'GK' || profile?.position === 'Goalkeeper';

	// Prepare data for Goals by Competition bar chart
	const prepareGoalsByCompetitionData = () => {
		const competitionData: { [key: string]: number } = {};
		
		matches.forEach((match) => {
			const competition = match.match_info?.competition || 'Unknown';
			if (!competitionData[competition]) {
				competitionData[competition] = 0;
			}
			competitionData[competition] += match.goals;
		});

		return Object.entries(competitionData)
			.map(([name, goals]) => ({ name, goals }))
			.sort((a, b) => b.goals - a.goals)
			.slice(0, 5); // Top 5 competitions
	};

	// Prepare data for Minutes Distribution pie chart
	const prepareMinutesDistributionData = () => {
		const competitionMinutes: { [key: string]: number } = {};
		
		matches.forEach((match) => {
			const competition = match.match_info?.competition || 'Unknown';
			if (!competitionMinutes[competition]) {
				competitionMinutes[competition] = 0;
			}
			competitionMinutes[competition] += match.minutes_played;
		});

		return Object.entries(competitionMinutes)
			.map(([name, minutes]) => ({ name, minutes }))
			.sort((a, b) => b.minutes - a.minutes)
			.slice(0, 5); // Top 5 competitions
	};

	// Colors for pie chart
	const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

	const goalsChartData = prepareGoalsByCompetitionData();
	const minutesChartData = prepareMinutesDistributionData();

	// StatRow Helper Component for alternative layout
	interface StatRowProps {
		label: string;
		value: string | number;
		highlight?: boolean;
	}

	const StatRow: React.FC<StatRowProps> = ({ label, value, highlight = false }) => {
		return (
			<div className={`flex items-center justify-between p-3 rounded-lg ${
				highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
			}`}>
				<span className="text-sm text-gray-700">{label}</span>
				<span className={`text-lg font-semibold ${
					highlight ? 'text-blue-700' : 'text-gray-900'
				}`}>
					{value}
				</span>
			</div>
		);
	};

	return (
		<DashboardLayout>
			<PageHeader
				title={t('stats.myStatistics')}
				subtitle={t('stats.statsSubtitle')}
			/>

			{/* Season Selector */}
			<div className="bg-white rounded-lg shadow p-6 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Select
						label={t('stats.seasonYear')}
						options={[
							{ value: '', label: t('stats.allTime') },
							...getAvailableYears().map((year) => ({ value: year, label: year }))
						]}
						value={selectedYear}
						onChange={(value) => setSelectedYear(value as string)}
					/>
					
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-1.5">
							{t('stats.competitionOptional')}
						</label>
						<input
							type="text"
							placeholder={t('stats.competitionPlaceholder')}
							value={selectedCompetition}
							onChange={(e) => setSelectedCompetition(e.target.value)}
							className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>
				
				{isFiltered && (
					<div className="mt-4 flex items-center justify-between">
						<p className="text-sm text-gray-600">
							{t('stats.showingStatsFor')} <span className="font-semibold">
								{selectedYear || t('stats.allYears')}{selectedCompetition ? ` - ${selectedCompetition}` : ''}
							</span>
						</p>
						<button
							onClick={() => {
								setSelectedYear('');
								setSelectedCompetition('');
							}}
							className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
						>
							{t('stats.viewAllTimeStats')}
						</button>
					</div>
				)}
			</div>

			{loading ? (
				// Loading State
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div key={i} className="h-48 bg-white rounded-lg shadow animate-pulse"></div>
					))}
				</div>
			) : displayStats && displayStats.total_matches > 0 ? (
				// Stats Display
				<div className="space-y-6">
					{/* Overview Card */}
					<div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
						<h2 className="text-xl font-bold mb-4">
							{isFiltered ? t('stats.seasonOverview') : t('stats.careerOverview')}
						</h2>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="text-center">
								<p className="text-3xl font-bold">
									{isFiltered && seasonStats ? seasonStats.matches_played : (allTimeStats?.total_matches || 0)}
								</p>
								<p className="text-sm text-blue-100 mt-1">{t('stats.matches')}</p>
							</div>
							<div className="text-center">
								<p className="text-3xl font-bold">
									{isFiltered && seasonStats ? seasonStats.goals : (allTimeStats?.total_goals || 0)}
								</p>
								<p className="text-sm text-blue-100 mt-1">{t('stats.goals')}</p>
							</div>
							<div className="text-center">
								<p className="text-3xl font-bold">
									{isFiltered && seasonStats ? seasonStats.assists : (allTimeStats?.total_assists || 0)}
								</p>
								<p className="text-sm text-blue-100 mt-1">{t('stats.assists')}</p>
							</div>
							<div className="text-center">
								<p className="text-3xl font-bold">{allTimeStats?.total_minutes || 0}</p>
								<p className="text-sm text-blue-100 mt-1">{t('stats.minutes')}</p>
							</div>
						</div>
						{isFiltered && seasonStats && (
							<div className="mt-4 text-sm text-blue-100 text-center">
								{t('stats.showing')} {selectedYear || t('stats.allYears')}{selectedCompetition ? ` - ${selectedCompetition}` : ''}
								<br />
								<span className="text-xs opacity-75">{t('stats.detailedStatsShowAllTime')}</span>
							</div>
						)}
					</div>

					{/* Career Statistics Sections */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Offensive Stats */}
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
								{t('stats.offensiveStats')}
							</h3>
							<div className="space-y-3">
								<StatRow label={t('stats.goals')} value={displayStats.total_goals || 0} />
								<StatRow label={t('stats.assists')} value={displayStats.total_assists || 0} />
								<StatRow label={t('stats.shots')} value={displayStats.total_shots || 0} />
								<StatRow label={t('stats.shotsOnTarget')} value={displayStats.total_shots_on_target ?? 0} />
							</div>
						</div>

						{/* Passing Stats */}
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
								{t('stats.passingStats')}
							</h3>
							<div className="space-y-3">
								<StatRow label={t('stats.passesCompleted')} value={displayStats.total_passes_completed ?? 0} />
							<StatRow 
								label={t('stats.passAccuracy')} 
								value={displayStats.average_pass_accuracy ? `${Number(displayStats.average_pass_accuracy).toFixed(1)}%` : '0%'} 
							/>
								<StatRow 
									label={t('stats.keyPasses')} 
									value={displayStats.total_key_passes || 0}
									highlight={true}
								/>
								<StatRow 
									label={t('stats.longBalls')} 
									value={displayStats.total_long_balls || 0} 
								/>
								<StatRow 
									label={t('stats.crosses')} 
									value={displayStats.total_crosses || 0} 
								/>
							</div>
						</div>

						{/* Defensive Stats */}
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								</svg>
								{t('stats.defensiveStats')}
							</h3>
							<div className="space-y-3">
								<StatRow label={t('stats.tackles')} value={displayStats.total_tackles || 0} />
								<StatRow label={t('stats.interceptions')} value={displayStats.total_interceptions ?? 0} />
								<StatRow 
									label={t('stats.blocks')} 
									value={displayStats.total_blocks ?? 0}
									highlight={true}
								/>
								<StatRow label={t('stats.clearances')} value={displayStats.total_clearances ?? 0} />
							</div>
						</div>

						{/* Physical Stats - NEW SECTION */}
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
								{t('stats.physicalStats')}
							</h3>
							<div className="space-y-3">
								<StatRow 
									label={t('stats.dribblesSuccessful')} 
									value={displayStats.total_dribbles_successful ?? 0}
									highlight={true}
								/>
								<StatRow 
									label={t('stats.duelsWon')} 
									value={displayStats.total_duels_won ?? 0}
									highlight={true}
								/>
							</div>
						</div>

						{/* Disciplinary */}
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
								{t('stats.disciplinary')}
							</h3>
							<div className="space-y-3">
								<StatRow label={t('stats.foulsCommitted')} value={displayStats.total_fouls_committed ?? 0} />
								<StatRow 
									label={t('stats.foulsSuffered')} 
									value={displayStats.total_fouls_suffered ?? 0}
									highlight={true}
								/>
								<StatRow label={t('stats.yellowCards')} value={displayStats.total_yellow_cards || 0} />
								<StatRow label={t('stats.redCards')} value={displayStats.total_red_cards || 0} />
							</div>
						</div>

						{/* Goalkeeper Stats */}
						{isGoalkeeper && (
							<div className="bg-white rounded-lg shadow p-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
									<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
									</svg>
									{t('stats.goalkeeperStatistics')}
								</h3>
								<div className="space-y-3">
									<StatRow 
										label={t('stats.saves')} 
										value={displayStats.total_saves || 0}
										highlight={true}
									/>
									<StatRow 
										label={t('stats.gkRunsOut')} 
										value={displayStats.total_gk_runs_out || 0}
									/>
									<StatRow 
										label={t('stats.successfulPunches')} 
										value={displayStats.total_successful_punches || 0}
									/>
								</div>
							</div>
						)}

						{/* Performance Metrics - NEW SECTION */}
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
								{t('stats.performanceMetrics')}
							</h3>
							<div className="space-y-3">
								<StatRow 
									label={t('stats.minutesPerGoal')} 
									value={displayStats.total_goals > 0 ? (displayStats.total_minutes / displayStats.total_goals).toFixed(1) : '-'} 
								/>
								<StatRow 
									label={t('stats.avgMinutesPerMatch')} 
									value={displayStats.total_matches > 0 ? (displayStats.total_minutes / displayStats.total_matches).toFixed(0) : 0} 
								/>
							</div>
						</div>
					</div>

					{/* Performance Charts */}
					{matches.length > 0 && (
						<div>
							<h3 className="text-lg font-bold text-gray-900 mb-4">{t('stats.performanceVisualization')}</h3>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								{/* Bar Chart: Goals by Competition */}
								<div className="bg-white rounded-lg shadow p-6">
									<h4 className="text-md font-semibold text-gray-800 mb-4">{t('stats.goalsByCompetition')}</h4>
									{goalsChartData.length > 0 ? (
										<ResponsiveContainer width="100%" height={300}>
											<BarChart data={goalsChartData}>
												<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
												<XAxis 
													dataKey="name" 
													tick={{ fontSize: 12 }}
													angle={-15}
													textAnchor="end"
													height={80}
												/>
												<YAxis tick={{ fontSize: 12 }} />
												<Tooltip 
													contentStyle={{ 
														backgroundColor: '#fff',
														border: '1px solid #e5e7eb',
														borderRadius: '8px',
														padding: '8px'
													}}
												/>
												<Legend />
												<Bar dataKey="goals" fill="#3b82f6" radius={[8, 8, 0, 0]} />
											</BarChart>
										</ResponsiveContainer>
									) : (
										<div className="h-[300px] flex items-center justify-center text-gray-500">
											<p>{t('stats.noGoalData')}</p>
										</div>
									)}
								</div>

								{/* Pie Chart: Minutes Distribution */}
								<div className="bg-white rounded-lg shadow p-6">
									<h4 className="text-md font-semibold text-gray-800 mb-4">{t('stats.minutesDistribution')}</h4>
									{minutesChartData.length > 0 ? (
										<ResponsiveContainer width="100%" height={300}>
											<PieChart>
												<Pie
													data={minutesChartData}
													cx="50%"
													cy="50%"
													labelLine={false}
													label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
													outerRadius={100}
													fill="#8884d8"
													dataKey="minutes"
												>
													{minutesChartData.map((_entry, index) => (
														<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
													))}
												</Pie>
												<Tooltip 
													contentStyle={{ 
														backgroundColor: '#fff',
														border: '1px solid #e5e7eb',
														borderRadius: '8px',
														padding: '8px'
													}}
													formatter={(value: any) => [`${value} ${t('stats.minutes').toLowerCase()}`, t('stats.minutes')]}
												/>
												<Legend />
											</PieChart>
										</ResponsiveContainer>
									) : (
										<div className="h-[300px] flex items-center justify-center text-gray-500">
											<p>{t('stats.noMinutesData')}</p>
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			) : (
				// Empty State
				<EmptyState
					icon={
						<svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
					}
					title={t('stats.noStatisticsAvailable')}
					message={t('stats.noStatisticsMessage')}
				/>
			)}
		</DashboardLayout>
	);
};

export default StatsPage;
