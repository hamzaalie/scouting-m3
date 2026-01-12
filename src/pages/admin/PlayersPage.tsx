import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import PlayerModal from '../../components/admin/PlayerModal';
import PlayerTableRow from '../../components/admin/PlayerTableRow';
import { getAllPlayers, deletePlayer, getPlayerById } from '../../services/playerService';
import { getAllTeams } from '../../services/teamService';
import type { 
	PlayerListItem, 
	PlayerQueryParams, 
	Player,
	Position 
} from '../../types/player';
import type { TeamListItem } from '../../types/team';
import { showSuccess, showError } from '../../utils/toast';
import { POSITION_OPTIONS } from '../../types/player';

/**
 * Enhanced Players Management Page
 * 
 * Modern, professional design inspired by Stripe Dashboard and GitHub tables.
 * 
 * Features:
 * - Enhanced header with title and subtitle
 * - Advanced search and filtering
 * - Professional table with color-coded position badges
 * - Jersey numbers with circle backgrounds
 * - View, Edit, and Delete actions
 * - Responsive design with mobile support
 * - Empty states and loading skeletons
 * - Sticky table header
 * - Toast notifications
 */
const PlayersPage: React.FC = () => {
	const { t } = useTranslation();
	
	// Data state
	const [players, setPlayers] = useState<PlayerListItem[]>([]);
	const [teams, setTeams] = useState<TeamListItem[]>([]);
	const [count, setCount] = useState<number>(0);

	// UI state
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingTeams, setLoadingTeams] = useState<boolean>(false);

	// Search and filters
	const [page, setPage] = useState<number>(1);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [debouncedQuery, setDebouncedQuery] = useState<string>('');
	const [teamFilter, setTeamFilter] = useState<string>('');
	const [positionFilter, setPositionFilter] = useState<string>('');

	// Modal state
	const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
	const [showEditModal, setShowEditModal] = useState<boolean>(false);
	const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
	const [loadingPlayer, setLoadingPlayer] = useState<boolean>(false);

	// Delete dialog state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [playerToDelete, setPlayerToDelete] = useState<PlayerListItem | null>(null);
	const [deleting, setDeleting] = useState<boolean>(false);

	// Refs
	const abortControllerRef = useRef<AbortController | null>(null);

	// Derived
	const pageSize = 10;
	const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count]);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

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

	// Fetch players
	const fetchPlayers = useCallback(async () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const controller = new AbortController();
		abortControllerRef.current = controller;

		setLoading(true);

		try {
			const params: PlayerQueryParams = {
				search: debouncedQuery || undefined,
				team: teamFilter ? Number(teamFilter) : undefined,
				position: positionFilter ? (positionFilter as Position) : undefined,
				page,
			};

			const res = await getAllPlayers(params);
			
			if (!controller.signal.aborted) {
				setPlayers(res.results || []);
				setCount(res.count || 0);
			}
		} catch (err: any) {
			if (!controller.signal.aborted) {
				console.error('Failed to fetch players:', err);
				setPlayers([]);
				setCount(0);
			}
		} finally {
			if (!controller.signal.aborted) {
				setLoading(false);
			}
		}
	}, [page, debouncedQuery, teamFilter, positionFilter]);

	useEffect(() => {
		fetchPlayers();
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [fetchPlayers]);

	// Handlers
	const handleSearch = (query: string) => {
		setSearchQuery(query);
		setPage(1);
	};

	const handleTeamFilterChange = (value: string) => {
		setTeamFilter(value);
		setPage(1);
	};

	const handlePositionFilterChange = (value: string) => {
		setPositionFilter(value);
		setPage(1);
	};

	const openCreateModal = () => {
		setSelectedPlayer(null);
		setShowCreateModal(true);
	};

	const handleEdit = async (player: PlayerListItem) => {
		setLoadingPlayer(true);
		try {
			const fullPlayer = await getPlayerById(player.id);
			setSelectedPlayer(fullPlayer);
			setShowEditModal(true);
		} catch (err: any) {
			showError(err.message || 'Failed to load player details');
		} finally {
			setLoadingPlayer(false);
		}
	};

	const handleDelete = (player: PlayerListItem) => {
		setPlayerToDelete(player);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!playerToDelete) return;

		setDeleting(true);
		try {
			await deletePlayer(playerToDelete.id);
			showSuccess(t('players.deletePlayer') + ' ' + t('common.success'));
			setDeleteDialogOpen(false);
			setPlayerToDelete(null);
			fetchPlayers();
		} catch (err: any) {
			console.error('Failed to delete player:', err);
			showError(err.message || 'Failed to delete player');
		} finally {
			setDeleting(false);
		}
	};

	const handleModalSuccess = () => {
		fetchPlayers();
	};

	const handleModalClose = () => {
		setShowCreateModal(false);
		setShowEditModal(false);
		setSelectedPlayer(null);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Team options
	const teamOptions = useMemo(() => {
		return [
			{ value: '', label: t('players.allTeams') },
			...teams.map((team) => ({ value: team.id.toString(), label: team.name }))
		];
	}, [teams, t]);

	// Position options
	const positionOptions = useMemo(() => {
		return [
			{ value: '', label: t('players.allPositions') },
			...POSITION_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))
		];
	}, [t]);

	return (
		<DashboardLayout>
			{/* HEADER SECTION */}
			<div className="mb-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-[28px] font-bold text-gray-900">{t('players.title')}</h1>
						<p className="text-sm text-gray-600 mt-1">{t('players.managePlayers')}</p>
					</div>
					<button
						onClick={openCreateModal}
						className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
						</svg>
						{t('players.addPlayer')}
					</button>
				</div>
			</div>

			{/* FILTERS SECTION */}
			<div className="mb-6 flex flex-col sm:flex-row gap-4">
				{/* Search Bar */}
				<div className="flex-1 sm:max-w-[50%]">
					<div className="relative">
						<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => handleSearch(e.target.value)}
							placeholder={t('players.searchPlayers')}
							className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
						/>
					</div>
				</div>

				{/* Filter Dropdowns */}
				<div className="flex gap-3">
					<select
						value={teamFilter}
						onChange={(e) => handleTeamFilterChange(e.target.value)}
						disabled={loadingTeams}
						className="h-11 px-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white min-w-[200px] appearance-none cursor-pointer"
						style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
					>
						{teamOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>{opt.label}</option>
						))}
					</select>

					<select
						value={positionFilter}
						onChange={(e) => handlePositionFilterChange(e.target.value)}
						className="h-11 px-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white min-w-[180px] appearance-none cursor-pointer"
						style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
					>
						{positionOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>{opt.label}</option>
						))}
				</select>
			</div>
			</div>

			{/* PLAYERS TABLE */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				{loading && players.length === 0 ? (
					<div className="p-12 text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">{t('common.loading')}</p>
					</div>
				) : players.length === 0 ? (
					<EmptyState
						icon={<UserGroupIcon className="w-16 h-16 text-gray-400" />}
						title={t('players.noPlayersYet')}
						message={t('players.noPlayersDescription')}
						action={{
							label: t('players.addPlayer'),
							onClick: openCreateModal,
							variant: 'primary'
						}}
					/>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50 sticky top-0 z-10">
									<tr>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
											{t('players.title')}
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
											{t('players.team')}
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
											{t('players.position')}
										</th>
										<th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
											{t('players.jerseyNumber')}
										</th>
										<th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
											{t('players.age')}
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
											{t('players.nationality')}
										</th>
										<th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
											{t('common.actions')}
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{players.map((player, index) => (
										<PlayerTableRow
											key={player.id}
											player={player}
											animationIndex={index}
											onEdit={handleEdit}
											onDelete={handleDelete}
											loadingPlayer={loadingPlayer}
										/>
									))}
								</tbody>
							</table>
						</div>

						{/* PAGINATION */}
						<div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
							<div className="text-sm text-gray-600">
								{t('common.showing', { start: Math.min((page - 1) * pageSize + 1, count), end: Math.min(page * pageSize, count), total: count })} {t('players.title').toLowerCase()}
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
													? 'bg-blue-600 text-white'
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
					</>
				)}
			</div>

			{/* Player Modal */}
			<PlayerModal
				isOpen={showCreateModal || showEditModal}
				onClose={handleModalClose}
				player={selectedPlayer}
				onSuccess={handleModalSuccess}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={deleteDialogOpen}
				title={t('players.deletePlayer')}
				message={t('common.confirmDelete', { name: playerToDelete?.full_name })}
				onConfirm={confirmDelete}
				onCancel={() => {
					setDeleteDialogOpen(false);
					setPlayerToDelete(null);
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

export default PlayersPage;

