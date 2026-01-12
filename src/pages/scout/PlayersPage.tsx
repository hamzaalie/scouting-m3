import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import { getAllPlayers } from '../../services/playerService';
import { getAllTeams } from '../../services/teamService';
import type { PlayerListItem, Position } from '../../types/player';
import type { TeamListItem } from '../../types/team';
// ...existing code...

/**
 * Scout Players Page
 * 
 * Comprehensive player discovery interface with advanced filtering.
 * 
 * Features:
 * - Left sidebar with filter panel
 * - Search, position, team, age, nationality filters
 * - Stats filters (goals, assists, matches)
 * - Grid/List view toggle
 * - Sorting options
 * - Pagination
 */
const PlayersPage: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	// State
	const [players, setPlayers] = useState<PlayerListItem[]>([]);
	const [teams, setTeams] = useState<TeamListItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

	// Filter state
	const [filters, setFilters] = useState({
		search: '',
		positions: [] as Position[],
		teams: [] as number[],
		ageMin: '',
		ageMax: '',
		nationality: '',
		goalsMin: '',
		assistsMin: '',
		matchesMin: '',
	});

	// Sorting and pagination
	const [sortBy, setSortBy] = useState<string>('user__last_name');
	const [page, setPage] = useState<number>(1);
	const [totalCount, setTotalCount] = useState<number>(0);
	const pageSize = viewMode === 'grid' ? 12 : 20;

	// Fetch teams on mount
	useEffect(() => {
		const fetchTeams = async () => {
			try {
				const response = await getAllTeams({ page_size: 100 });
				setTeams(response.results || []);
			} catch (err) {
				console.error('Failed to fetch teams:', err);
			}
		};
		fetchTeams();
	}, []);

	// Fetch players function wrapped in useCallback
	const fetchPlayers = React.useCallback(async () => {
		try {
			setLoading(true);

			// Build query params
			const params: import('../../types/player').PlayerQueryParams = {
				page,
				page_size: pageSize,
				ordering: sortBy,
			};

			if (filters.search) params.search = filters.search;
			// Support multiple positions - send comma-separated values (only if all are valid Position)
			if (filters.positions.length > 0 && filters.positions.every((p) => ['GK', 'DF', 'MF', 'FW'].includes(p))) {
				params.position = filters.positions.join(',') as import('../../types/player').Position;
			}
			// Support multiple teams - assign as number if one, or skip if multiple (API expects number for PlayerQueryParams)
			if (filters.teams.length === 1 && typeof filters.teams[0] === 'number') {
				params.team = filters.teams[0];
			}
			if (filters.ageMin) params.age_min = parseInt(filters.ageMin);
			if (filters.ageMax) params.age_max = parseInt(filters.ageMax);
			// Nationality already supports comma-separated input from user
			if (filters.nationality) params.nationality = filters.nationality;

			const response = await getAllPlayers(params);
			setPlayers(response.results || []);
			setTotalCount(response.count || 0);
		} catch (err: unknown) {
			// handleApiError(err, t, navigate, t('scout.failedToLoadPlayers'));
			console.error('Error loading players:', err);
		} finally {
			setLoading(false);
		}
	}, [filters, page, sortBy, pageSize]);

	// Fetch players when filters/page/sort changes
	useEffect(() => {
		fetchPlayers();
	}, [fetchPlayers, viewMode]);

	// Toggle position filter
	const togglePosition = (position: Position) => {
		setFilters((prev) => ({
			...prev,
			positions: prev.positions.includes(position)
				? prev.positions.filter((p) => p !== position)
				: [...prev.positions, position],
		}));
	};

	// Toggle team filter
	const toggleTeam = (teamId: number) => {
		setFilters((prev) => ({
			...prev,
			teams: prev.teams.includes(teamId)
				? prev.teams.filter((t) => t !== teamId)
				: [...prev.teams, teamId],
		}));
	};

	// Reset filters
	const resetFilters = () => {
		setFilters({
			search: '',
			positions: [],
			teams: [],
			ageMin: '',
			ageMax: '',
			nationality: '',
			goalsMin: '',
			assistsMin: '',
			matchesMin: '',
		});
		setPage(1);
	};

	// Position colors
	const getPositionColor = (position: Position) => {
		switch (position) {
			case 'GK': return 'bg-orange-100 text-orange-800';
			case 'DF': return 'bg-blue-100 text-blue-800';
			case 'MF': return 'bg-green-100 text-green-800';
			case 'FW': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	const totalPages = Math.ceil(totalCount / pageSize);

	return (
		<DashboardLayout>
			<PageHeader
				title={t('scout.discoverPlayers')}
				subtitle={t('scout.discoverPlayersSubtitle')}
			/>

			<div className="flex gap-6">
				{/* Left Sidebar - Filters Panel */}
				<div className="w-80 flex-shrink-0 space-y-6">
					{/* Search */}
					<div className="bg-white rounded-lg shadow p-6">
						<h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{t('common.search')}</h3>
						<input
							type="text"
							placeholder={t('common.search') + '...'}
							value={filters.search}
							onChange={(e) => setFilters({ ...filters, search: e.target.value })}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					{/* Position Filter */}
					<div className="bg-white rounded-lg shadow p-6">
						<h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{t('players.position')}</h3>
						<div className="space-y-2">
							{(['GK', 'DF', 'MF', 'FW'] as Position[]).map((position) => (
								<label key={position} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
									<input
										type="checkbox"
										checked={filters.positions.includes(position)}
										onChange={() => togglePosition(position)}
										className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
									/>
									<span className="ml-3 text-gray-700">{position}</span>
								</label>
							))}
						</div>
					</div>

					{/* Team Filter */}
					<div className="bg-white rounded-lg shadow p-6">
						<h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{t('players.team')}</h3>
						<div className="max-h-48 overflow-y-auto space-y-2">
							{teams.map((team) => (
								<label key={team.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
									<input
										type="checkbox"
										checked={filters.teams.includes(team.id)}
										onChange={() => toggleTeam(team.id)}
										className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
									/>
									<span className="ml-3 text-gray-700 text-sm">{team.name}</span>
								</label>
							))}
						</div>
					</div>

					{/* Age Range */}
					<div className="bg-white rounded-lg shadow p-6">
						<h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{t('players.age')}</h3>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="text-xs text-gray-600 mb-1 block">{t('scout.minAge')}</label>
								<input
									type="number"
									placeholder="18"
									value={filters.ageMin}
									onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
								/>
							</div>
							<div>
								<label className="text-xs text-gray-600 mb-1 block">{t('scout.maxAge')}</label>
								<input
									type="number"
									placeholder="35"
									value={filters.ageMax}
									onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
								/>
							</div>
						</div>
					</div>

				{/* Nationality */}
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{t('players.nationality')}</h3>
					<input
						type="text"
						placeholder="e.g., France, Spain, Brazil"
						value={filters.nationality}
						onChange={(e) => setFilters({ ...filters, nationality: e.target.value })}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
					<p className="text-xs text-gray-500 mt-1">
						Enter single or multiple nationalities (comma-separated)
					</p>
				</div>

					{/* Action Buttons */}
					<div className="flex gap-3">
						<button
							onClick={resetFilters}
							className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
						>
							{t('common.reset')}
						</button>
					</div>
				</div>

				{/* Main Content Area */}
				<div className="flex-1 space-y-6">
					{/* Top Bar */}
					<div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
						<p className="text-sm text-gray-600">
							{t('common.showing', { start: players.length, end: totalCount, total: totalCount })} {t('players.title').toLowerCase()}
						</p>

						<div className="flex items-center gap-4">
							{/* Sort Dropdown */}
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							>
								<option value="user__last_name">{t('scout.sortNameAZ')}</option>
								<option value="-user__last_name">{t('scout.sortNameZA')}</option>
								<option value="-date_of_birth">{t('scout.sortAgeLowHigh')}</option>
								<option value="date_of_birth">{t('scout.sortAgeHighLow')}</option>
								<option value="-id">{t('scout.sortRecentlyAdded')}</option>
							</select>

							{/* View Toggle */}
							<div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
								<button
									onClick={() => setViewMode('grid')}
									className={`p-2 rounded transition-colors ${
										viewMode === 'grid' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:text-gray-900'
									}`}
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
									</svg>
								</button>
								<button
									onClick={() => setViewMode('list')}
									className={`p-2 rounded transition-colors ${
										viewMode === 'list' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:text-gray-900'
									}`}
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
									</svg>
								</button>
							</div>
						</div>
					</div>

					{/* Players Display */}
					{loading ? (
						// Loading State
						<div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
							))}
						</div>
					) : players.length > 0 ? (
						<>
							{viewMode === 'grid' ? (
								// Grid View
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{players.map((player) => (
										<div
											key={player.id}
											className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
											onClick={() => navigate(`/scout/players/${player.id}`)}
										>
									<div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
										<div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
										<Avatar src={player.profile_picture} alt={player.full_name} size="xl" className="z-10" />
									</div>

											<div className="p-4">
												<div className="flex items-start justify-between mb-2">
													<div className="flex-1">
														<h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
															{player.full_name}
														</h3>
														<p className="text-sm text-gray-600">
															{player.age ? `${player.age} ${t('scout.yearsOld')}` : t('common.n/a')}
														</p>
													</div>
													<span className={`px-2 py-1 rounded text-xs font-bold ${getPositionColor(player.position)}`}>
														{player.position}
													</span>
												</div>

												<div className="mb-3">
													<p className="text-sm text-gray-700 font-medium">{player.team_name || t('players.freeAgent')}</p>
													{player.jersey_number && <p className="text-xs text-gray-500">#{player.jersey_number}</p>}
												</div>

												<div className="mb-3 pb-3 border-b border-gray-200">
													<p className="text-sm text-gray-600">
														{player.nationality && player.nationality.trim() ? (
															<>
																<span className="mr-1">🌍</span>
																{player.nationality}
															</>
														) : (
															t('common.n/a')
														)}
													</p>
												</div>

												<button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
													{t('common.view')} {t('players.playerDetails')}
												</button>
											</div>
										</div>
									))}
								</div>
							) : (
								// List View
								<div className="bg-white rounded-lg shadow overflow-hidden">
									<table className="w-full">
										<thead className="bg-gray-50 border-b border-gray-200">
											<tr>
												<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('players.title')}</th>
												<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('players.age')}</th>
												<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('players.position')}</th>
												<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('players.team')}</th>
												<th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('players.nationality')}</th>
												<th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('common.actions')}</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200">
											{players.map((player) => (
												<tr key={player.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/scout/players/${player.id}`)}>
													<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<Avatar src={player.profile_picture} alt={player.full_name} size="md" />
												<div className="ml-3">
													<p className="text-sm font-medium text-gray-900">{player.full_name}</p>
													{player.jersey_number && <p className="text-xs text-gray-500">#{player.jersey_number}</p>}
															</div>
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
														{player.age ?? t('common.n/a')}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-center">
														<span className={`px-3 py-1 rounded text-xs font-bold ${getPositionColor(player.position)}`}>
															{player.position}
														</span>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{player.team_name || t('players.freeAgent')}</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
														{player.nationality && player.nationality.trim() ? player.nationality : t('common.n/a')}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-center">
														<button
															onClick={(e) => {
																e.stopPropagation();
																navigate(`/scout/players/${player.id}`);
															}}
															className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
														>
															{t('common.view')}
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
									<p className="text-sm text-gray-600">
										{t('common.showing', { start: page, end: totalPages, total: totalPages })}
									</p>
									<div className="flex gap-2">
										<button
											onClick={() => setPage(page - 1)}
											disabled={page === 1}
											className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
										>
											← {t('common.previous')}
										</button>
										<button
											onClick={() => setPage(page + 1)}
											disabled={page === totalPages}
											className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
										>
											{t('common.next')} →
										</button>
									</div>
								</div>
							)}
						</>
					) : (
						// Empty State
						<EmptyState
							icon={
								<svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							}
								title={t('players.noPlayersFound')}
							message={t('players.tryAdjustingFilters')}
							action={{
								label: t('common.reset') + ' ' + t('common.filter'),
								onClick: resetFilters,
							}}
						/>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
};

export default PlayersPage;
