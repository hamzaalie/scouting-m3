import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table, { type TableColumn } from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import SearchBar from '../../components/common/SearchBar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Avatar from '../../components/common/Avatar';
import UserModal from '../../components/admin/UserModal';
import type { UserListItem, UserRole, PaginatedResponse, UserQueryParams } from '../../types/user';
import { ROLE_OPTIONS, getRoleColor } from '../../types/user';
import { getAllUsers, deleteUser } from '../../services/userService';
import { showSuccess, showError } from '../../utils/toast';
import { handleApiError } from '../../utils/errorHandler';

/**
 * UsersPage
 * 
 * Users management page for admin.
 * Displays users in a table with email, full name, role, and active status.
 * Similar to Django admin interface.
 */
const UsersPage: React.FC = () => {
	const { t } = useTranslation();
	
	// Data state
	const [users, setUsers] = useState<UserListItem[]>([]);
	const [count, setCount] = useState<number>(0);

	// UI state
	const [loading, setLoading] = useState<boolean>(false);

	// Controls
	const [page, setPage] = useState<number>(1);

	// Filters
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [debouncedQuery, setDebouncedQuery] = useState<string>('');
	const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
	const [isActiveFilter, setIsActiveFilter] = useState<string>('');

	// Delete dialog state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);
	const [deleting, setDeleting] = useState<boolean>(false);

	// User modal state
	const [userModalOpen, setUserModalOpen] = useState<boolean>(false);
	const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

	// Refs for cleanup
	const abortControllerRef = useRef<AbortController | null>(null);

	// Derived
	const pageSize = 10;
	const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count]);

	// Fetch users
	const fetchUsers = useCallback(async () => {
		// Cancel previous request if still pending
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const controller = new AbortController();
		abortControllerRef.current = controller;

		setLoading(true);

		try {
			// Build query params
			const params: UserQueryParams = { 
				page,
				page_size: pageSize  // Tell backend to use 10 items per page
			};
			if (debouncedQuery) params.search = debouncedQuery;
			if (roleFilter) params.role = roleFilter;
			if (isActiveFilter !== '') {
				params.is_active = isActiveFilter === 'true';
			}

			const res: PaginatedResponse<UserListItem> = await getAllUsers(params);
			if (controller.signal.aborted) return;

			// Safely extract results and count
			const list = Array.isArray(res?.results) ? res.results : [];
			const total = typeof res?.count === 'number' ? res.count : 0;

			setUsers(list);
			setCount(total);

			// If we're on a page beyond the data, go back to page 1
			if (list.length === 0 && total > 0 && page > 1) {
				setPage(1);
			}
		} catch (err: any) {
			if (controller.signal.aborted) return;
			
			// Check if it's a client error (page not found, validation error, etc.)
			const status = err?.response?.status;
			const isClientError = status && status >= 400 && status < 500;
			
			if (isClientError) {
				// Page doesn't exist or is out of range - silently reset to page 1
				if (page > 1) {
					setPage(1);
				} else {
					// If already on page 1 and getting error, show empty state
					setUsers([]);
					setCount(0);
				}
			} else {
				// Real error (500, network error, etc.) - show error message
				handleApiError(err, t, undefined, t('players.failedToLoadUsers'));
				setUsers([]);
				setCount(0);
			}
		} finally {
			if (!controller.signal.aborted) setLoading(false);
		}
	}, [page, debouncedQuery, roleFilter, isActiveFilter, t]);

	// Debounce search query (300ms delay)
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(searchQuery.trim());
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Fetch users when page or filters change
	useEffect(() => {
		fetchUsers();
		return () => {
			if (abortControllerRef.current) abortControllerRef.current.abort();
		};
	}, [fetchUsers]);

	// Filter handlers
	const handleSearch = (value: string) => {
		setSearchQuery(value);
		setPage(1); // Reset to first page when search changes
	};

	const handleRoleFilterChange = (value: string | number | (string | number)[]) => {
		setRoleFilter(value as UserRole | '');
		setPage(1);
	};

	const handleIsActiveFilterChange = (value: string | number | (string | number)[]) => {
		setIsActiveFilter(String(value));
		setPage(1);
	};

	const handleClearFilters = () => {
		setSearchQuery('');
		setRoleFilter('');
		setIsActiveFilter('');
		setPage(1);
	};

	// Delete handlers
	const handleDelete = (user: UserListItem) => {
		setUserToDelete(user);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!userToDelete) return;

		setDeleting(true);
		try {
			await deleteUser(userToDelete.id);
			showSuccess('User deleted successfully!');
			setDeleteDialogOpen(false);
			setUserToDelete(null);
			// Refresh users list
			fetchUsers();
		} catch (err: any) {
			console.error('Failed to delete user:', err);
			showError(err.message || 'Failed to delete user.');
		} finally {
			setDeleting(false);
		}
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Check if any filters are active
	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (debouncedQuery) count++;
		if (roleFilter) count++;
		if (isActiveFilter !== '') count++;
		return count;
	}, [debouncedQuery, roleFilter, isActiveFilter]);

	const hasActiveFilters = activeFilterCount > 0;

	// Filter options
	const roleOptions = useMemo(() => {
		return [
			{ value: '', label: t('users.role') + ' - ' + t('common.filter') },
			...ROLE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label })),
		];
	}, [t]);

	const isActiveOptions = useMemo(() => {
		return [
			{ value: '', label: t('common.filter') },
			{ value: 'true', label: t('users.active') },
			{ value: 'false', label: t('users.inactive') },
		];
	}, [t]);

	// Modal handlers
	const openCreateModal = () => {
		setSelectedUser(null);
		setUserModalOpen(true);
	};

	const handleEdit = (user: UserListItem) => {
		setSelectedUser(user);
		setUserModalOpen(true);
	};

	const closeUserModal = () => {
		setUserModalOpen(false);
		setSelectedUser(null);
	};

	const handleUserModalSuccess = () => {
		fetchUsers(); // Refresh the users list
	};

	// Columns definition
	const columns: TableColumn<UserListItem>[] = useMemo(() => [
		{
			key: 'email',
			label: t('users.email'),
			sortable: true,
			render: (u) => (
				<div className="flex items-center gap-2">
					<Avatar
						src={u.profile_picture || undefined}
						alt={u.full_name || u.email}
						size="sm"
						fallback={u.email ? u.email.charAt(0).toUpperCase() : '?'}
					/>
					<span className="text-gray-900 font-medium">{u.email || '-'}</span>
				</div>
			),
		},
		{
			key: 'full_name',
			label: t('users.fullName'),
			sortable: true,
			render: (u) => (
				<span className="text-gray-700">{u.full_name || '-'}</span>
			),
		},
		{
			key: 'role',
			label: t('users.role'),
			align: 'center',
			render: (u) => (
				<Badge variant={getRoleColor(u.role)}>
					{u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : '-'}
				</Badge>
			),
			width: '120px',
		},
		{
			key: 'is_active',
			label: t('users.status'),
			align: 'center',
			render: (u) => (
				<Badge variant={u.is_active ? 'success' : 'danger'}>
					{u.is_active ? t('users.active') : t('users.inactive')}
				</Badge>
			),
			width: '100px',
		},
		{
			key: 'actions',
			label: 'Actions',
			align: 'right',
			render: (u) => (
				<div className="flex gap-2 justify-end">
					<Button
						size="sm"
						variant="secondary"
						onClick={(e) => {
							e.stopPropagation();
							handleEdit(u);
						}}
					>
						{t('common.edit')}
					</Button>
					<Button
						size="sm"
						variant="danger"
						onClick={(e) => {
							e.stopPropagation();
							handleDelete(u);
						}}
					>
						{t('common.delete')}
					</Button>
				</div>
			),
			width: '180px',
		},
	], []);

	return (
		<DashboardLayout>
			<PageHeader
				title={t('users.title')}
				subtitle={t('users.manageUsers')}
				action={{
					label: t('users.title'),
					onClick: openCreateModal,
					variant: 'primary',
				}}
			/>

			{/* Filters Section */}
			<Card className="mt-6">
				<div className="flex flex-wrap items-end gap-4">
					{/* Search */}
					<div className="flex-1 min-w-[200px]">
						<label className="block text-sm font-medium text-gray-700 mb-1.5">
							{t('common.search')}
						</label>
						<SearchBar
							placeholder={t('common.search') + '...'}
							value={searchQuery}
							onChange={handleSearch}
						/>
					</div>

					{/* Role Filter */}
					<div className="flex-1 min-w-[200px]">
						<Select
							label={t('users.role')}
							options={roleOptions}
							value={roleFilter}
							onChange={handleRoleFilterChange}
							placeholder={t('users.role')}
						/>
					</div>

					{/* Is Active Filter */}
					<div className="flex-1 min-w-[200px]">
						<Select
							label={t('users.status')}
							options={isActiveOptions}
							value={isActiveFilter}
							onChange={handleIsActiveFilterChange}
							placeholder={t('common.all')}
						/>
					</div>

					{/* Clear Filters Button */}
					{hasActiveFilters && (
						<div className="flex-shrink-0 flex items-center gap-2">
							{activeFilterCount > 0 && (
								<Badge variant="info" className="text-xs">
									{activeFilterCount}
								</Badge>
							)}
							<Button
								variant="secondary"
								onClick={handleClearFilters}
								className="whitespace-nowrap"
							>
								{t('common.clear')} {t('common.filter')}
							</Button>
						</div>
					)}
				</div>

				{/* Active Filter Indicator */}
				<div className="mt-4 text-sm text-gray-600">
					{loading ? (
						<span>{t('common.loading')}...</span>
					) : (
						<span>
							{t('common.showing')} <strong>{count}</strong> {count === 1 ? t('users.user') : t('users.users')}
							{hasActiveFilters && ` (${t('common.filtered')})`}
						</span>
					)}
				</div>
			</Card>

			{/* Users Table */}
			<Card className="mt-6">
				<Table
					columns={columns}
					data={users}
					loading={loading}
					emptyState={{
						title: hasActiveFilters ? t('users.noUsersFound') : t('users.noUsersYet'),
						message: hasActiveFilters
							? t('users.noUsersDescription')
							: t('users.manageUsers'),
						action: hasActiveFilters
							? { label: t('common.clear') + ' ' + t('common.filter'), onClick: handleClearFilters }
							: { label: t('users.title'), onClick: openCreateModal },
					}}
					pagination={
						count > 0
							? {
									currentPage: page,
									totalPages: totalPages,
									onPageChange: handlePageChange,
								}
							: undefined
					}
				/>
			</Card>

			{/* User Create/Edit Modal */}
			<UserModal
				isOpen={userModalOpen}
				onClose={closeUserModal}
				user={selectedUser}
				onSuccess={handleUserModalSuccess}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={deleteDialogOpen}
				title={t('users.title')}
				message={t('common.confirmDelete', { name: userToDelete?.email || t('users.title') })}
				onConfirm={confirmDelete}
				onCancel={() => {
					setDeleteDialogOpen(false);
					setUserToDelete(null);
				}}
				danger={true}
				confirmLabel={t('common.delete')}
				loading={deleting}
			/>
		</DashboardLayout>
	);
};

export default UsersPage;
