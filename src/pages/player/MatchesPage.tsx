import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { getMyMatches, getMyProfile } from '../../services/playerService';
import type { PlayerStats } from '../../services/statsService';
import { showError } from '../../utils/toast';

/**
 * Matches Page (Player)
 * 
 * Comprehensive match history page for players to view all their matches
 * with detailed statistics, filters, and expandable details.
 * 
 * Features:
 * - Match list with team info, date, competition
 * - Player's match statistics (minutes, goals, assists, shots, tackles, cards)
 * - Filters: Season (year), Competition, Date range
 * - Sort by date (newest first)
 * - Expand/collapse for detailed stats view
 * - Pagination
 * - Loading and empty states
 */
const MatchesPage: React.FC = () => {
	const { t } = useTranslation();
	
	// State
	const [matches, setMatches] = useState<PlayerStats[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
	const [profile, setProfile] = useState<any>(null);
	
	// Filter state
	const [filters, setFilters] = useState({
		year: '',
		competition: '',
		dateFrom: '',
		dateTo: '',
	});

	// Pagination state
	const [page, setPage] = useState<number>(1);
	const [totalMatches, setTotalMatches] = useState<number>(0);
	const matchesPerPage = 10;

	// Fetch matches on mount and when filters/page change
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				
				// Fetch profile to get player ID
				if (!profile) {
					const profileData = await getMyProfile();
					setProfile(profileData);
				}

				// Fetch matches
				const response = await getMyMatches();
				
				// Apply local filters (if backend doesn't support all filters)
				let filteredMatches = response?.results || [];
				
				// Filter by year
				if (filters.year) {
					filteredMatches = filteredMatches.filter((match) => {
						const matchYear = new Date(match.match_info?.match_date || '').getFullYear();
						return matchYear.toString() === filters.year;
					});
				}
				
				// Filter by competition
				if (filters.competition) {
					filteredMatches = filteredMatches.filter((match) =>
						match.match_info?.competition?.toLowerCase().includes(filters.competition.toLowerCase())
					);
				}
				
				// Filter by date range
				if (filters.dateFrom) {
					const fromDate = new Date(filters.dateFrom);
					filteredMatches = filteredMatches.filter((match) => {
						const matchDate = new Date(match.match_info?.match_date || '');
						return matchDate >= fromDate;
					});
				}
				
				if (filters.dateTo) {
					const toDate = new Date(filters.dateTo);
					filteredMatches = filteredMatches.filter((match) => {
						const matchDate = new Date(match.match_info?.match_date || '');
						return matchDate <= toDate;
					});
				}
				
				// Sort by date (newest first)
				filteredMatches.sort((a, b) => {
					const dateA = new Date(a.match_info?.match_date || '').getTime();
					const dateB = new Date(b.match_info?.match_date || '').getTime();
					return dateB - dateA;
				});
				
				setTotalMatches(filteredMatches.length);
				
				// Paginate
				const startIndex = (page - 1) * matchesPerPage;
				const paginatedMatches = filteredMatches.slice(startIndex, startIndex + matchesPerPage);
				
				setMatches(paginatedMatches);
			} catch (err: any) {
				// Silently handle errors (expected for new users without data)
				console.debug('Failed to fetch matches (expected for new users):', err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [filters, page]); // Re-fetch when filters or page change

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	// Get unique years from matches for filter dropdown
	const getAvailableYears = () => {
		const currentYear = new Date().getFullYear();
		const years = [];
		for (let i = 0; i < 10; i++) {
			years.push((currentYear - i).toString());
		}
		return years;
	};

	// Toggle expanded match details
	const toggleExpandMatch = (matchId: number) => {
		setExpandedMatch(expandedMatch === matchId ? null : matchId);
	};

	// Clear all filters
	const clearFilters = () => {
		setFilters({
			year: '',
			competition: '',
			dateFrom: '',
			dateTo: '',
		});
		setPage(1);
	};

	// Calculate total pages
	const totalPages = Math.ceil(totalMatches / matchesPerPage);

	return (
		<DashboardLayout>
			<PageHeader
				title={t('stats.myMatches')}
				subtitle={t('stats.matchesSubtitle')}
			/>

			{/* Filters Section */}
			<div className="bg-white rounded-lg shadow p-6 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
					{/* Year Filter */}
					<Select
						label={t('stats.seasonYear')}
						options={[
							{ value: '', label: t('stats.allSeasons') },
							...getAvailableYears().map((year) => ({ value: year, label: year }))
						]}
						value={filters.year}
						onChange={(value) => setFilters({ ...filters, year: value as string })}
					/>

					{/* Competition Filter */}
					<Input
						label={t('stats.competition')}
						type="text"
						placeholder={t('stats.competitionPlaceholder')}
						value={filters.competition}
						onChange={(e) => setFilters({ ...filters, competition: e.target.value })}
					/>

					{/* Date From */}
					<Input
						label={t('stats.fromDate')}
						type="date"
						value={filters.dateFrom}
						onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
					/>

					{/* Date To */}
					<Input
						label={t('stats.toDate')}
						type="date"
						value={filters.dateTo}
						onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
					/>
				</div>

				{/* Filter Actions */}
				<div className="flex items-center justify-between">
					<p className="text-sm text-gray-600">
						{t('stats.showingMatches')} {matches.length} {t('stats.ofMatches')} {totalMatches} {t('stats.matches')}
					</p>
					{(filters.year || filters.competition || filters.dateFrom || filters.dateTo) && (
						<Button variant="outline" size="sm" onClick={clearFilters}>
							{t('stats.clearFilters')}
						</Button>
					)}
				</div>
			</div>

			{/* Matches List */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				{loading ? (
					// Loading State
					<div className="p-6 space-y-4">
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
						))}
					</div>
				) : matches.length > 0 ? (
					// Matches Table/List
					<div className="divide-y divide-gray-200">
						{matches.map((match) => (
							<div key={match.id} className="hover:bg-gray-50 transition-colors">
								{/* Match Row */}
								<div
									className="p-6 cursor-pointer"
									onClick={() => toggleExpandMatch(match.id!)}
								>
									<div className="flex items-center justify-between">
										{/* Match Info */}
										<div className="flex-1">
											<div className="flex items-center gap-4 mb-2">
												<h3 className="text-lg font-semibold text-gray-900">
													{match.match_info?.home_team} vs {match.match_info?.away_team}
												</h3>
												{match.starting_xi && (
													<span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
														{t('stats.startingXi')}
													</span>
												)}
											</div>
											<div className="flex items-center gap-4 text-sm text-gray-600">
												<span className="flex items-center gap-1">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
													</svg>
													{formatDate(match.match_info?.match_date || '')}
												</span>
												<span className="flex items-center gap-1">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
													</svg>
													{match.match_info?.competition}
												</span>
											</div>
										</div>

										{/* Quick Stats */}
										<div className="flex items-center gap-8 mr-8">
											<div className="text-center">
												<p className="text-2xl font-bold text-gray-900">{match.minutes_played}'</p>
												<p className="text-xs text-gray-600">{t('stats.minutes')}</p>
											</div>
											<div className="text-center">
												<p className="text-2xl font-bold text-green-600">{match.goals}</p>
												<p className="text-xs text-gray-600">{t('stats.goals')}</p>
											</div>
											<div className="text-center">
												<p className="text-2xl font-bold text-blue-600">{match.assists}</p>
												<p className="text-xs text-gray-600">{t('stats.assists')}</p>
											</div>
										</div>

										{/* Expand Icon */}
										<div>
											<svg
												className={`w-6 h-6 text-gray-400 transition-transform ${
													expandedMatch === match.id ? 'transform rotate-180' : ''
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

								{/* Expanded Details */}
								{expandedMatch === match.id && (
									<div className="px-6 pb-6 bg-gray-50 border-t border-gray-200">
										<div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
											{/* Offensive Stats */}
											<div>
												<h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
													{t('stats.offensive')}
												</h4>
												<div className="space-y-2">
													<div className="flex justify-between text-sm">
														<span className="text-gray-600">{t('stats.shots')}:</span>
														<span className="font-semibold text-gray-900">{match.shots}</span>
													</div>
													<div className="flex justify-between text-sm">
														<span className="text-gray-600">{t('stats.onTarget')}:</span>
														<span className="font-semibold text-gray-900">{match.shots_on_target}</span>
													</div>
												</div>
											</div>

											{/* Passing Stats */}
											<div>
												<h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
													{t('stats.passing')}
												</h4>
												<div className="space-y-2">
													<div className="flex justify-between text-sm">
														<span className="text-gray-600">{t('stats.completed')}:</span>
														<span className="font-semibold text-gray-900">{match.passes_completed}</span>
													</div>
													<div className="flex justify-between text-sm">
														<span className="text-gray-600">{t('stats.accuracy')}:</span>
														<span className="font-semibold text-gray-900">{match.pass_accuracy}%</span>
													</div>
												</div>
											</div>

											{/* Defensive Stats */}
											<div>
												<h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
													{t('stats.defensive')}
												</h4>
												<div className="space-y-2">
													<div className="flex justify-between text-sm">
														<span className="text-gray-600">{t('stats.tackles')}:</span>
														<span className="font-semibold text-gray-900">{match.tackles}</span>
													</div>
													<div className="flex justify-between text-sm">
														<span className="text-gray-600">{t('stats.interceptions')}:</span>
														<span className="font-semibold text-gray-900">{match.interceptions}</span>
													</div>
													<div className="flex justify-between text-sm">
														<span className="text-gray-600">{t('stats.clearances')}:</span>
														<span className="font-semibold text-gray-900">{match.clearances}</span>
													</div>
												</div>
											</div>

											{/* Disciplinary */}
											<div>
												<h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
													{t('stats.disciplinary')}
												</h4>
												<div className="space-y-2">
													<div className="flex justify-between text-sm">
														<span className="text-gray-600">{t('stats.fouls')}:</span>
														<span className="font-semibold text-gray-900">{match.fouls_committed}</span>
													</div>
													<div className="flex justify-between text-sm">
														<span className="text-gray-600">{t('stats.yellowCards')}:</span>
														<span className="font-semibold text-yellow-600">{match.yellow_cards}</span>
													</div>
													<div className="flex justify-between text-sm">
														<span className="text-gray-600">{t('stats.redCards')}:</span>
														<span className="font-semibold text-red-600">{match.red_cards}</span>
													</div>
												</div>
											</div>

											{/* Goalkeeper Stats (if applicable) */}
											{(match.saves !== undefined && match.saves > 0) || (match.gk_runs_out !== undefined && match.gk_runs_out > 0) || (match.successful_punches !== undefined && match.successful_punches > 0) ? (
												<div>
													<h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
														{t('stats.goalkeeper')}
													</h4>
													<div className="space-y-2">
														{match.saves !== undefined && match.saves > 0 && (
															<div className="flex justify-between text-sm">
																<span className="text-gray-600">{t('stats.saves')}:</span>
																<span className="font-semibold text-gray-900">{match.saves}</span>
															</div>
														)}
														{match.gk_runs_out !== undefined && match.gk_runs_out > 0 && (
															<div className="flex justify-between text-sm">
																<span className="text-gray-600">{t('stats.gkRunsOut')}:</span>
																<span className="font-semibold text-gray-900">{match.gk_runs_out}</span>
															</div>
														)}
														{match.successful_punches !== undefined && match.successful_punches > 0 && (
															<div className="flex justify-between text-sm">
																<span className="text-gray-600">{t('stats.successfulPunches')}:</span>
																<span className="font-semibold text-gray-900">{match.successful_punches}</span>
															</div>
														)}
													</div>
												</div>
											) : null}
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					// Empty State
					<EmptyState
						icon={
							<svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						}
						title={t('stats.noMatchesFound')}
						message={t('stats.noMatchesMessage')}
					/>
				)}

				{/* Pagination */}
				{!loading && matches.length > 0 && totalPages > 1 && (
					<div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
						<div className="text-sm text-gray-600">
							{t('stats.page')} {page} {t('stats.of')} {totalPages}
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(page - 1)}
								disabled={page === 1}
							>
								← {t('common.previous')}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(page + 1)}
								disabled={page === totalPages}
							>
								{t('common.next')} →
							</Button>
						</div>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
};

export default MatchesPage;

