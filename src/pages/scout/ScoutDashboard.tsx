import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import { getAllPlayers } from '../../services/playerService';
import type { PlayerListItem, Position } from '../../types/player';
import { handleApiError } from '../../utils/errorHandler';

/**
 * Scout Dashboard Page
 * 
 * Discovery-focused dashboard for scouts to find and evaluate players.
 * 
 * Features:
 * - Large search bar with debounced search
 * - Quick position filters (GK, DF, MF, FW)
 * - Age range filters
 * - Featured/top players grid (12 players)
 * - Navigate to full players list
 */
const ScoutDashboard: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	// State
	const [players, setPlayers] = useState<PlayerListItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
	const [selectedAgeRange, setSelectedAgeRange] = useState<string>('');

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchPlayers();
		}, 500);
		return () => clearTimeout(timer);
	}, [searchTerm, selectedPositions, selectedAgeRange]);

	// Fetch players
	const fetchPlayers = async () => {
		try {
			setLoading(true);

			// Build query params
			const params: any = {
				page_size: 12,
				ordering: '-id', // Most recent first
			};

			if (searchTerm) {
				params.search = searchTerm;
			}

			// Support multiple positions - send comma-separated values
			if (selectedPositions.length > 0) {
				params.position = selectedPositions.join(',');
			}

			// Age range filters
			if (selectedAgeRange) {
				switch (selectedAgeRange) {
					case 'under-18':
						params.age_max = 17;
						break;
					case '18-23':
						params.age_min = 18;
						params.age_max = 23;
						break;
					case '24-28':
						params.age_min = 24;
						params.age_max = 28;
						break;
					case '29+':
						params.age_min = 29;
						break;
				}
			}

			const response = await getAllPlayers(params);
			setPlayers(response.results || []);
		} catch (err: any) {
			// handleApiError(err, t, navigate, t('scout.failedToLoadPlayers'));
			console.error('Error loading players:', err);
		} finally {
			setLoading(false);
		}
	};

	// Toggle position filter
	const togglePosition = (position: Position) => {
		setSelectedPositions((prev) =>
			prev.includes(position)
				? prev.filter((p) => p !== position)
				: [...prev, position]
		);
	};

	// Clear all filters
	const clearFilters = () => {
		setSearchTerm('');
		setSelectedPositions([]);
		setSelectedAgeRange('');
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

	const hasActiveFilters = searchTerm || selectedPositions.length > 0 || selectedAgeRange;

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Section 1: Welcome & Search */}
				<div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
					<h1 className="text-2xl md:text-3xl font-bold mb-2">{t('scout.discoverTalent')}</h1>
					<p className="text-indigo-100 mb-6">{t('scout.findPerfectPlayers')}</p>

					{/* Large Search Bar */}
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<svg className="w-6 h-6 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							type="text"
							placeholder={t('scout.searchPlayers')}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-14 pr-4 py-4 text-lg text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-4 focus:ring-white/30 placeholder-gray-400"
						/>
					</div>
				</div>

				{/* Section 2: Quick Filters */}
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex flex-wrap items-center gap-4">
						{/* Position Filters */}
						<div className="flex items-center gap-2">
							<span className="text-sm font-semibold text-gray-700">{t('players.position')}:</span>
							{(['GK', 'DF', 'MF', 'FW'] as Position[]).map((position) => (
								<button
									key={position}
									onClick={() => togglePosition(position)}
									className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedPositions.includes(position)
											? 'bg-indigo-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
								>
									{position}
								</button>
							))}
						</div>

						{/* Age Range Filters */}
						<div className="flex items-center gap-2">
							<span className="text-sm font-semibold text-gray-700">{t('players.age')}:</span>
							{[
								{ value: 'under-18', label: 'Under 18' },
								{ value: '18-23', label: '18-23' },
								{ value: '24-28', label: '24-28' },
								{ value: '29+', label: '29+' },
							].map((range) => (
								<button
									key={range.value}
									onClick={() => setSelectedAgeRange(range.value === selectedAgeRange ? '' : range.value)}
									className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedAgeRange === range.value
											? 'bg-purple-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
								>
									{range.label}
								</button>
							))}
						</div>

						{/* Clear Filters Button */}
						{hasActiveFilters && (
							<button
								onClick={clearFilters}
								className="ml-auto px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
							>
								{t('common.clear')} {t('common.filter')}
							</button>
						)}
					</div>
				</div>

				{/* Section 3: Featured/Top Players Cards */}
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl md:text-2xl font-bold text-gray-900">
							{hasActiveFilters ? t('scout.searchResults') : t('scout.featuredPlayers')}
						</h2>
						<button
							onClick={() => navigate('/scout/players')}
							className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
						>
							{t('scout.browseAll')} →
						</button>
					</div>

					{loading ? (
						// Loading State
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
								<div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
							))}
						</div>
					) : players.length > 0 ? (
						// Player Cards Grid
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{players.map((player) => (
								<div
									key={player.id}
									className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
									onClick={() => navigate(`/scout/players/${player.id}`)}
								>
									{/* Player Image */}
									<div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
										<div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
										<Avatar
											src={undefined}
											alt={player.full_name}
											size="xl"
											className="z-10"
										/>
									</div>

									{/* Player Info */}
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

										{/* Team */}
										<div className="mb-3">
											<p className="text-sm text-gray-700 font-medium">
												{player.team_name || t('players.freeAgent')}
											</p>
											{player.jersey_number && (
												<p className="text-xs text-gray-500">#{player.jersey_number}</p>
											)}
										</div>

										{/* Nationality */}
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

										{/* View Profile Button */}
										<button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
											{t('common.view')} {t('players.playerDetails')}
										</button>
									</div>
								</div>
							))}
						</div>
					) : (
						// Empty State
						<div className="text-center py-12">
							<svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							<p className="text-gray-600 text-lg font-medium">{t('players.noPlayersFound')}</p>
							<p className="text-gray-500 text-sm mt-2">{t('scout.tryAdjustingFilters')}</p>
						</div>
					)}
				</div>

				{/* Section 4: Browse All Players Button */}
				<div className="text-center">
					<button
						onClick={() => navigate('/scout/players')}
						className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
					>
						{t('scout.browseAllPlayers')}
					</button>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default ScoutDashboard;
