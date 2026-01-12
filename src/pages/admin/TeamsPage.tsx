import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import TeamModal from '../../components/admin/TeamModal';
import { getAllTeams, deleteTeam, getTeamById } from '../../services/teamService';
import type { TeamListItem, TeamQueryParams, Team } from '../../types/team';
import { showSuccess } from '../../utils/toast';
import { handleApiError } from '../../utils/errorHandler';

/**
 * Enhanced Teams Management Page
 * 
 * Clean, professional table design inspired by Notion and Airtable.
 * 
 * Features:
 * - Clean table with logo, name, location, founded year, player count
 * - Search and location filtering
 * - Sortable columns
 * - Purple theme
 * - Row hover effects
 * - CRUD operations
 */
const TeamsPage: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	
	// Data state
	const [teams, setTeams] = useState<TeamListItem[]>([]);
	const [count, setCount] = useState<number>(0);

	// UI state
	const [loading, setLoading] = useState<boolean>(false);

	// Filters and sorting
	const [page, setPage] = useState<number>(1);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [debouncedQuery, setDebouncedQuery] = useState<string>('');
	const [locationFilter, setLocationFilter] = useState<string>('');
	const [sortField, setSortField] = useState<string>('name');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

	// Modal state
	const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
	const [showEditModal, setShowEditModal] = useState<boolean>(false);
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
	const [loadingTeam, setLoadingTeam] = useState<boolean>(false);

	// Delete dialog state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [teamToDelete, setTeamToDelete] = useState<TeamListItem | null>(null);
	const [deleting, setDeleting] = useState<boolean>(false);

	// Refs
	const abortControllerRef = useRef<AbortController | null>(null);

	// Derived
	const pageSize = 10;
	const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count]);
	const ordering = useMemo(() => (sortOrder === 'asc' ? sortField : `-${sortField}`), [sortField, sortOrder]);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Extract unique locations
	const locationOptions = useMemo(() => {
		const locations = teams.map(team => team.location).filter(Boolean);
		const unique = Array.from(new Set(locations)).sort();
		return [
			{ value: '', label: 'All Locations' },
			...unique.map(loc => ({ value: loc, label: loc }))
		];
	}, [teams]);

	// Fetch teams
	const fetchTeams = useCallback(async () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const controller = new AbortController();
		abortControllerRef.current = controller;

		setLoading(true);

		try {
			const params: TeamQueryParams = {
				search: debouncedQuery || undefined,
				location: locationFilter || undefined,
				ordering,
				page,
			};

			const res = await getAllTeams(params);
			
			if (!controller.signal.aborted) {
				setTeams(res.results || []);
				setCount(res.count || 0);
			}
		} catch (err: any) {
			if (!controller.signal.aborted) {
				handleApiError(err, t, navigate, t('teams.failedToLoadTeams'));
				setTeams([]);
				setCount(0);
			}
		} finally {
			if (!controller.signal.aborted) {
				setLoading(false);
			}
		}
	}, [page, debouncedQuery, locationFilter, ordering, t, navigate]);

	useEffect(() => {
		fetchTeams();
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [fetchTeams]);

	// Handlers
	const handleSearch = (query: string) => {
		setSearchQuery(query);
		setPage(1);
	};

	const handleLocationFilterChange = (value: string) => {
		setLocationFilter(value);
		setPage(1);
	};

	const handleSort = (field: string) => {
		if (sortField === field) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortOrder('asc');
		}
		setPage(1);
	};

	const openCreateModal = () => {
		setSelectedTeam(null);
		setShowCreateModal(true);
	};

	const handleEdit = async (team: TeamListItem) => {
		setLoadingTeam(true);
		try {
			const fullTeam = await getTeamById(team.id);
			setSelectedTeam(fullTeam);
			setShowEditModal(true);
		} catch (err: any) {
			handleApiError(err, t, navigate, t('teams.failedToLoadTeam'));
		} finally {
			setLoadingTeam(false);
		}
	};

	const handleDelete = (team: TeamListItem) => {
		setTeamToDelete(team);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!teamToDelete) return;

		setDeleting(true);
		try {
			await deleteTeam(teamToDelete.id);
			showSuccess(t('teams.deleteSuccess'));
			setDeleteDialogOpen(false);
			setTeamToDelete(null);
			fetchTeams();
		} catch (err: any) {
			handleApiError(err, t, navigate, t('teams.failedToDelete'));
		} finally {
			setDeleting(false);
		}
	};

	const handleModalSuccess = () => {
		fetchTeams();
	};

	const handleModalClose = () => {
		setShowCreateModal(false);
		setShowEditModal(false);
		setSelectedTeam(null);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Helper functions
	const getTeamInitials = (name: string): string => {
		return name
			.split(' ')
			.map(word => word[0])
			.join('')
			.substring(0, 2)
			.toUpperCase();
	};

	const getCountryFlag = (): string => {
		// Placeholder - you can use a flag library or emoji flags
		return '🌐';
	};

	return (
		<DashboardLayout>
			{/* HEADER SECTION */}
			<div className="mb-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-[28px] font-bold text-gray-900">{t('teams.title')}</h1>
						<p className="text-sm text-gray-600 mt-1">{t('teams.manageTeams')}</p>
					</div>
					<button
						onClick={openCreateModal}
						className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						{t('teams.addTeam')}
					</button>
				</div>
			</div>

			{/* FILTERS SECTION */}
			<div className="mb-6 flex flex-col sm:flex-row gap-4">
				{/* Search Bar */}
				<div className="flex-1">
					<div className="relative">
						<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => handleSearch(e.target.value)}
							placeholder={t('teams.searchTeams')}
							className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
						/>
					</div>
				</div>

				{/* Location Filter */}
				<select
					value={locationFilter}
					onChange={(e) => handleLocationFilterChange(e.target.value)}
					className="h-11 px-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white min-w-[200px] appearance-none cursor-pointer"
					style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
				>
					{locationOptions.map((opt) => (
						<option key={opt.value} value={opt.value}>{opt.label}</option>
					))}
				</select>
			</div>

			{/* TEAMS TABLE */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				{loading && teams.length === 0 ? (
					<div className="p-12 text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">{t('common.loading')}</p>
					</div>
				) : teams.length === 0 ? (
					<EmptyState
						icon={<BuildingOfficeIcon className="w-16 h-16 text-gray-400" />}
						title={t('teams.noTeamsYet')}
						message={t('teams.noTeamsDescription')}
						action={{
							label: t('teams.addTeam'),
							onClick: openCreateModal,
							variant: 'primary'
						}}
					/>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="min-w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-5 py-4 text-left">
											<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('teams.title')}</span>
										</th>
										<th 
											className="px-5 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors group"
											onClick={() => handleSort('name')}
										>
											<div className="flex items-center gap-2">
												<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('teams.teamName')}</span>
												{sortField === 'name' && (
													<svg className={`w-4 h-4 text-purple-600 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
													</svg>
												)}
											</div>
										</th>
										<th 
											className="px-5 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors group"
											onClick={() => handleSort('location')}
										>
											<div className="flex items-center gap-2">
												<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('teams.location')}</span>
												{sortField === 'location' && (
													<svg className={`w-4 h-4 text-purple-600 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
													</svg>
												)}
											</div>
										</th>
										<th 
											className="px-5 py-4 text-center cursor-pointer hover:bg-gray-100 transition-colors group"
											onClick={() => handleSort('founded_year')}
										>
											<div className="flex items-center justify-center gap-2">
												<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Founded</span>
												{sortField === 'founded_year' && (
													<svg className={`w-4 h-4 text-purple-600 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
													</svg>
												)}
											</div>
										</th>
										<th className="px-5 py-4 text-center">
											<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('teams.players')}</span>
										</th>
										<th className="px-5 py-4 text-right">
											<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.actions')}</span>
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 bg-white">
									{teams.map((team, index) => (
										<tr 
											key={team.id} 
											className="hover:bg-purple-50 transition-colors"
											style={{
												animation: `fadeInUp 0.4s ease-out ${index * 50}ms forwards`,
												opacity: 0
											}}
										>
											{/* Logo */}
											<td className="px-5 py-5 whitespace-nowrap">
												{team.logo ? (
													<Avatar 
														src={team.logo} 
														alt={team.name} 
														size="lg"
													/>
												) : (
													<div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
														{getTeamInitials(team.name)}
													</div>
												)}
											</td>

											{/* Team Name */}
											<td className="px-5 py-5">
												<div>
													<div className="text-base font-semibold text-gray-900">
														{team.name}
													</div>
													{team.founded_year && (
														<div className="text-xs text-gray-500 mt-1">
															{t('teams.founded')}: {team.founded_year}
														</div>
													)}
												</div>
											</td>

											{/* Location */}
											<td className="px-5 py-5">
												<div className="flex items-center gap-2">
													<span className="text-lg">{getCountryFlag()}</span>
													<span className="text-sm text-gray-700">{team.location}</span>
												</div>
											</td>

											{/* Founded */}
											<td className="px-5 py-5 text-center">
												<span className="text-sm text-gray-600">
													{team.founded_year || '—'}
												</span>
											</td>

											{/* Players Count */}
											<td className="px-5 py-5 text-center">
												<div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
													<span className="text-sm font-bold text-blue-700">{team.players_count || 0}</span>
												</div>
											</td>

											{/* Actions */}
											<td className="px-5 py-5 text-right">
												<div className="flex gap-2 justify-end">
													<button
														onClick={() => handleEdit(team)}
														disabled={loadingTeam}
														className="px-3 py-1.5 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
													>
														{t('common.edit')}
													</button>
													<button
														onClick={() => handleDelete(team)}
														className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
													>
														{t('common.delete')}
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* PAGINATION */}
						{totalPages > 1 && (
							<div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
								<div className="text-sm text-gray-600">
									Showing {Math.min((page - 1) * pageSize + 1, count)}-{Math.min(page * pageSize, count)} of {count} teams
								</div>
								<div className="flex items-center gap-2">
									<button
										onClick={() => handlePageChange(page - 1)}
										disabled={page === 1}
										className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										{t('common.previous')}
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
												className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
													page === pageNum
														? 'bg-purple-600 text-white'
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
												className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
											>
												{totalPages}
											</button>
										</>
									)}
									<button
										onClick={() => handlePageChange(page + 1)}
										disabled={page === totalPages}
										className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										{t('common.next')}
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			{/* Team Modal */}
			<TeamModal
				isOpen={showCreateModal || showEditModal}
				onClose={handleModalClose}
				team={selectedTeam}
				onSuccess={handleModalSuccess}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={deleteDialogOpen}
				title={t('teams.deleteTeam')}
				message={t('common.confirmDelete', { name: teamToDelete?.name })}
				onConfirm={confirmDelete}
				onCancel={() => {
					setDeleteDialogOpen(false);
					setTeamToDelete(null);
				}}
				danger={true}
				confirmLabel={t('common.delete')}
				loading={deleting}
			/>

			{/* CSS for animations */}
			<style>{`
				@keyframes fadeInUp {
					from {
						opacity: 0;
						transform: translateY(10px);
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

export default TeamsPage;

