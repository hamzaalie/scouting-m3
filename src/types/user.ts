/**
 * User-related TypeScript types for API integration.
 */

/**
 * User role types
 */
export type UserRole = 'admin' | 'player' | 'scout';

/**
 * User interface (from GET /api/users/{id}/)
 */
export interface User {
	id: number;
	email: string;
	username: string;
	first_name: string;
	last_name: string;
	full_name: string;
	role: UserRole;
	phone: string | null;
	profile_picture: string | null;
	date_joined: string; // ISO datetime string
	last_login: string | null; // ISO datetime string
	is_active: boolean;
}

/**
 * User list item (from GET /api/users/)
 * Same as User for now, but can be optimized later
 */
export interface UserListItem extends User {}

/**
 * User data for create/update operations
 */
export interface UserCreateUpdate {
	email: string;
	first_name?: string;
	last_name?: string;
	role: UserRole;
	phone?: string;
	is_active?: boolean;
	password?: string;
	password2?: string;
}

/**
 * User query parameters for filtering/searching
 */
export interface UserQueryParams {
	page?: number;
	page_size?: number;
	search?: string;
	role?: UserRole;
	is_active?: boolean;
	ordering?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

/**
 * Role options for dropdowns
 */
export const ROLE_OPTIONS = [
	{ value: 'admin', label: 'Admin' },
	{ value: 'player', label: 'Player' },
	{ value: 'scout', label: 'Scout' },
] as const;

/**
 * Role badge colors
 */
export const getRoleColor = (role: UserRole): 'primary' | 'success' | 'info' | 'warning' => {
	switch (role) {
		case 'admin':
			return 'primary';
		case 'player':
			return 'success';
		case 'scout':
			return 'info';
		default:
			return 'warning';
	}
};

