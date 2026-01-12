import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import MatchModal from '../../components/admin/MatchModal';
import VideoPreviewModal from '../../components/admin/VideoPreviewModal';
import type { MatchListItem, Match, MatchStatus } from '../../types/match';
import { STATUS_OPTIONS } from '../../types/match';
import { getAllMatches, getMatchById, deleteMatch } from '../../services/matchService';
import { getAllTeams } from '../../services/teamService';
import type { TeamListItem } from '../../types/team';
import { showSuccess, showError } from '../../utils/toast';

/**
 * Enhanced Matches Management Page
 * 
 * Modern card-based layout inspired by LiveScore and ESPN.
 * 
 * Features:
 * - Card grid layout (2 columns desktop, 1 mobile)
 * - Team logos with scores
 * - Status badges (Scheduled, Completed, Live)
 * - Video indicators and playback
 * - Action buttons (Stats, Edit, Delete)
 * - Filters (Team, Status, Date Range, Competition)
 * - Responsive design
 */
const MatchesPage: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	// Data state
	const [matches, setMatches] = useState<MatchListItem[]>([]);
	const [count, setCount] = useState<number>(0);
	const [teams, setTeams] = useState<TeamListItem[]>([]);

	// UI state
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingTeams, setLoadingTeams] = useState<boolean>(false);

	// Filters
	const [page, setPage] = useState<number>(1);
	const [teamFilter, setTeamFilter] = useState<string>('');
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [dateFrom, setDateFrom] = useState<string>('');
	const [dateTo, setDateTo] = useState<string>('');
	const [competitionFilter, setCompetitionFilter] = useState<string>('');
	const [debouncedCompetition, setDebouncedCompetition] = useState<string>('');

	// Modal state
	const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
	const [showEditModal, setShowEditModal] = useState<boolean>(false);
	const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
	const [loadingMatch, setLoadingMatch] = useState<boolean>(false);

	// Delete dialog state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [matchToDelete, setMatchToDelete] = useState<MatchListItem | null>(null);
	const [deleting, setDeleting] = useState<boolean>(false);

	// Video modal state
	const [showVideoPreview, setShowVideoPreview] = useState<boolean>(false);
	const [selectedMatchForVideo, setSelectedMatchForVideo] = useState<Match | null>(null);
	const [loadingVideoMatch, setLoadingVideoMatch] = useState<boolean>(false);

	// Refs
	const abortControllerRef = useRef<AbortController | null>(null);

	// Derived
	const pageSize = 10;
	const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count]);

	// Debounce competition search
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedCompetition(competitionFilter.trim()), 300);
		return () => clearTimeout(timer);
	}, [competitionFilter]);

	// Fetch teams
	useEffect(() => {
		const fetchTeams = async () => {
			setLoadingTeams(true);
			try {
				const res = await getAllTeams({ page: 1, ordering: 'name' });
				setTeams(res.results);
			} catch (err) {
				console.error('Failed to fetch teams:', err);
			} finally {
				setLoadingTeams(false);
			}
		};
		fetchTeams();
	}, []);

	// Fetch matches
	const fetchMatches = useCallback(async () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const controller = new AbortController();
		abortControllerRef.current = controller;

		setLoading(true);

		try {
			const params: any = { page };
			if (teamFilter) params.team = Number(teamFilter);
			if (statusFilter) params.status = statusFilter as MatchStatus;
			if (dateFrom) params.date_from = dateFrom;
			if (dateTo) params.date_to = dateTo;
			if (debouncedCompetition) params.competition = debouncedCompetition;

			const res = await getAllMatches(params);
			
			if (!controller.signal.aborted) {
				setMatches(res?.results || []);
				setCount(res?.count || 0);
			}
		} catch (err: any) {
			if (!controller.signal.aborted) {
				console.error('Failed to fetch matches:', err);
				setMatches([]);
				setCount(0);
			}
		} finally {
			if (!controller.signal.aborted) {
				setLoading(false);
			}
		}
	}, [page, teamFilter, statusFilter, dateFrom, dateTo, debouncedCompetition]);

	useEffect(() => {
		fetchMatches();
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [fetchMatches]);

	// Handlers
	const handleClearFilters = () => {
		setTeamFilter('');
		setStatusFilter('');
		setDateFrom('');
		setDateTo('');
		setCompetitionFilter('');
		setPage(1);
	};

	const hasActiveFilters = useMemo(() => {
		return teamFilter !== '' || statusFilter !== '' || dateFrom !== '' || dateTo !== '' || competitionFilter !== '';
	}, [teamFilter, statusFilter, dateFrom, dateTo, competitionFilter]);

	const openCreateModal = () => {
		setSelectedMatch(null);
		setShowCreateModal(true);
	};

	const handleEdit = async (match: MatchListItem) => {
		setLoadingMatch(true);
		try {
			const fullMatch = await getMatchById(match.id);
			setSelectedMatch(fullMatch);
			setShowEditModal(true);
		} catch (err: any) {
			showError(err.message || 'Failed to load match details');
		} finally {
			setLoadingMatch(false);
		}
	};

	const handleDelete = (match: MatchListItem) => {
		setMatchToDelete(match);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!matchToDelete) return;

		setDeleting(true);
		try {
			await deleteMatch(matchToDelete.id);
			showSuccess('Match deleted successfully!');
			setDeleteDialogOpen(false);
			setMatchToDelete(null);
			fetchMatches();
		} catch (err: any) {
			console.error('Failed to delete match:', err);
			showError(err.message || 'Failed to delete match');
		} finally {
			setDeleting(false);
		}
	};

	const handleVideoClick = async (match: MatchListItem) => {
		if (!match.has_video) return;
		
		setLoadingVideoMatch(true);
		try {
			const fullMatch = await getMatchById(match.id);
			setSelectedMatchForVideo(fullMatch);
			setShowVideoPreview(true);
		} catch (err: any) {
			showError(err.message || 'Failed to load match video');
		} finally {
			setLoadingVideoMatch(false);
		}
	};

	const handleModalSuccess = () => {
		fetchMatches();
	};

	const handleModalClose = () => {
		setShowCreateModal(false);
		setShowEditModal(false);
		setSelectedMatch(null);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Helper functions
	const getStatusColor = (status: string): string => {
		switch (status) {
			case 'Scheduled': return 'bg-blue-100 text-blue-700';
			case 'Completed': return 'bg-green-100 text-green-700';
			case 'Live': return 'bg-red-100 text-red-700';
			default: return 'bg-gray-100 text-gray-700';
		}
	};

	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-GB', { 
			day: 'numeric', 
			month: 'short', 
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const teamOptions = useMemo(() => {
		return [
			{ value: '', label: 'All Teams' },
			...teams.map((team) => ({ value: team.id.toString(), label: team.name }))
		];
	}, [teams]);

	const statusOptions = useMemo(() => {
		return [
			{ value: '', label: 'All Status' },
			...STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))
		];
	}, []);

	return (
		<DashboardLayout>
			{/* HEADER SECTION */}
			<div className="mb-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-[28px] font-bold text-gray-900">Matches</h1>
						<p className="text-sm text-gray-600 mt-1">Manage fixtures, scores and match videos</p>
					</div>
					<button
						onClick={openCreateModal}
						className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						Create Match
					</button>
				</div>
			</div>

			{/* FILTERS SECTION */}
			<div className="mb-6 space-y-4">
				{/* Filter Row */}
				<div className="flex flex-wrap gap-3">
					{/* Team Filter */}
					<select
						value={teamFilter}
						onChange={(e) => { setTeamFilter(e.target.value); setPage(1); }}
						disabled={loadingTeams}
						className="h-11 px-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white min-w-[200px] appearance-none cursor-pointer"
						style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
					>
						{teamOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>{opt.label}</option>
						))}
					</select>

					{/* Status Filter */}
					<select
						value={statusFilter}
						onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
						className="h-11 px-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white min-w-[150px] appearance-none cursor-pointer"
						style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
					>
						{statusOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>{opt.label}</option>
						))}
					</select>

					{/* From Date */}
					<input
						type="date"
						value={dateFrom}
						onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
						className="h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-[160px]"
						placeholder="From Date"
					/>

					{/* To Date */}
					<input
						type="date"
						value={dateTo}
						onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
						className="h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-[160px]"
						placeholder="To Date"
					/>

					{/* Competition Search */}
					<div className="relative min-w-[200px]">
						<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<input
							type="text"
							value={competitionFilter}
							onChange={(e) => { setCompetitionFilter(e.target.value); setPage(1); }}
							placeholder="Competition..."
							className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
						/>
					</div>
				</div>

				{/* Results Count and Clear Filters */}
				<div className="flex items-center justify-between">
					<div className="text-sm text-gray-600">
						{loading ? (
							<span>Loading matches...</span>
						) : (
							<span>
								Showing <strong>{count}</strong> {count === 1 ? 'match' : 'matches'}
								{hasActiveFilters && ' (filtered)'}
							</span>
						)}
					</div>
					{hasActiveFilters && (
						<button
							onClick={handleClearFilters}
							className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
						>
							Clear filters
						</button>
					)}
				</div>
			</div>

			{/* MATCHES DISPLAY - CARD GRID */}
			{loading && matches.length === 0 ? (
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">Loading matches...</p>
					</div>
				</div>
			) : matches.length === 0 ? (
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
						<p className="text-gray-600 mb-6">Create your first match to get started</p>
						<button
							onClick={openCreateModal}
							className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							Create Match
						</button>
					</div>
				</div>
			) : (
				<>
					{/* Card Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
						{matches.map((match, index) => (
							<div
								key={match.id}
								className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
								style={{
									animation: `fadeInUp 0.4s ease-out ${index * 100}ms forwards`,
									opacity: 0
								}}
							>
								<div className="p-6 flex gap-6">
									{/* LEFT SECTION (60%) */}
									<div className="flex-[6] flex flex-col justify-between">
										{/* Match Date */}
										<div className="text-xs text-gray-500 mb-4">
											{formatDate(match.match_date)}
										</div>

										{/* Teams Display */}
										<div className="flex items-center justify-between my-auto">
											{/* Home Team */}
											<div className="flex flex-col items-center gap-2 flex-1">
												<Avatar 
													src={match.home_team_logo || undefined} 
													alt={match.home_team_name} 
													size="lg"
												/>
												<span className="text-sm font-semibold text-gray-900 text-center">
													{match.home_team_name}
												</span>
											</div>

											{/* VS / Score */}
											<div className="flex-1 flex items-center justify-center">
												{match.status === 'Completed' ? (
													<span className="text-3xl font-bold text-blue-600">
														{match.score_display}
													</span>
												) : (
													<span className="text-xl text-gray-400 font-semibold">
														VS
													</span>
												)}
											</div>

											{/* Away Team */}
											<div className="flex flex-col items-center gap-2 flex-1">
												<Avatar 
													src={match.away_team_logo || undefined} 
													alt={match.away_team_name} 
													size="lg"
												/>
												<span className="text-sm font-semibold text-gray-900 text-center">
													{match.away_team_name}
												</span>
											</div>
										</div>

										{/* Competition Badge */}
										<div className="mt-4 flex items-center justify-center gap-2">
											<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
											</svg>
											<span className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
												{match.competition}
											</span>
										</div>
									</div>

									{/* RIGHT SECTION (40%) */}
									<div className="flex-[4] flex flex-col justify-between">
									{/* Status Badge */}
									<div className="flex justify-end">
										<span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(match.status)}`}>
											{match.status === 'Completed' ? t('matches.completed') :
											 match.status === 'Scheduled' ? t('matches.scheduled') :
											 match.status === 'Cancelled' ? t('matches.cancelled') : match.status}
										</span>
									</div>

									{/* Video Indicator */}
									{match.has_video && (
										<button
											onClick={() => handleVideoClick(match)}
											disabled={loadingVideoMatch}
											className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors justify-center py-2"
										>
											<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
											</svg>
											<span className="text-sm font-medium">{t('matches.videoAvailable')}</span>
										</button>
									)}

										{/* Action Buttons */}
										<div className="flex flex-col gap-2 mt-auto">
											{match.status === 'Completed' && (
												<button
													onClick={() => navigate(`/admin/matches/${match.id}/stats`)}
													className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
													</svg>
													View Stats
												</button>
											)}
											<button
												onClick={() => handleEdit(match)}
												disabled={loadingMatch}
												className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
												Edit
											</button>
											<button
												onClick={() => handleDelete(match)}
												className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
												Delete
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* PAGINATION */}
					{totalPages > 1 && (
						<div className="flex items-center justify-center gap-2 mt-8">
							<button
								onClick={() => handlePageChange(page - 1)}
								disabled={page === 1}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								Previous
							</button>
							{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
								let pageNum;
								if (totalPages <= 5) {
									pageNum = i + 1;
								} else if (page <= 3) {
									pageNum = i + 1;
								} else if (page >= totalPages - 2) {
									pageNum = totalPages - 4 + i;
								} else {
									pageNum = page - 2 + i;
								}
								return (
									<button
										key={pageNum}
										onClick={() => handlePageChange(pageNum)}
										className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
											page === pageNum
												? 'bg-green-600 text-white'
												: 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
										}`}
									>
										{pageNum}
									</button>
								);
							})}
							{totalPages > 5 && page < totalPages - 2 && (
								<>
									<span className="text-gray-400">...</span>
									<button
										onClick={() => handlePageChange(totalPages)}
										className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
									>
										{totalPages}
									</button>
								</>
							)}
							<button
								onClick={() => handlePageChange(page + 1)}
								disabled={page === totalPages}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								Next
							</button>
						</div>
					)}
				</>
			)}

			{/* Match Modal */}
			<MatchModal
				isOpen={showCreateModal || showEditModal}
				onClose={handleModalClose}
				match={selectedMatch}
				onSuccess={handleModalSuccess}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={deleteDialogOpen}
				title="Delete Match"
				message={`Are you sure you want to delete this match? This action cannot be undone.`}
				onConfirm={confirmDelete}
				onCancel={() => {
					setDeleteDialogOpen(false);
					setMatchToDelete(null);
				}}
				danger={true}
				confirmLabel="Delete"
				loading={deleting}
			/>

			{/* Video Preview Modal */}
			{showVideoPreview && selectedMatchForVideo && (
				<VideoPreviewModal
					isOpen={showVideoPreview}
					onClose={() => {
						setShowVideoPreview(false);
						setSelectedMatchForVideo(null);
					}}
					platform={selectedMatchForVideo.video_platform}
					videoUrl={selectedMatchForVideo.video_url || ''}
					matchInfo={{
						homeTeam: selectedMatchForVideo.home_team.name,
						awayTeam: selectedMatchForVideo.away_team.name,
						matchDate: selectedMatchForVideo.match_date,
					}}
				/>
			)}

			{/* CSS for animations */}
			<style>{`
				@keyframes fadeInUp {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>
		</DashboardLayout>
	);
};

export default MatchesPage;

