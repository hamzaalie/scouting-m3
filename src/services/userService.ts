import axios from 'axios';
import type {
	User,
	UserListItem,
	UserCreateUpdate,
	UserQueryParams,
	PaginatedResponse,
} from '../types/user';

/**
 * API Base URL
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Normalize API base URL (remove trailing /api if present)
const normalizedBaseUrl = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Create axios instance with base configuration
 */
const api = axios.create({
	baseURL: `${normalizedBaseUrl}/api/users`,
	headers: {
		'Content-Type': 'application/json',
	},
});

/**
 * Request interceptor to add JWT token
 */
api.interceptors.request.use(
	(config) => {
		// Get token from localStorage (prioritize access_token)
		const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

/**
 * Helper function to build query string from params
 */
function toQuery(params: UserQueryParams): string {
	const query = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== '') {
			query.append(key, String(value));
		}
	});
	return query.toString();
}

/**
 * Handle API errors consistently
 */
function handleApiError(error: any): string {
	if (error.response) {
		// Server responded with error status
		const status = error.response.status;
		const data = error.response.data;

		if (status === 401) {
			return 'Authentication required. Please log in.';
		}
		if (status === 403) {
			return 'You do not have permission to perform this action.';
		}
		if (status === 404) {
			return 'User not found.';
		}
		if (status === 409) {
			return data?.error || 'Conflict: This action cannot be completed.';
		}
		if (status === 500) {
			return 'Server error. Please try again later.';
		}

		// Try to extract error message from response
		if (data?.error) {
			return data.error;
		}
		if (data?.detail) {
			return data.detail;
		}
		if (typeof data === 'string') {
			return data;
		}

		return `Request failed with status ${status}`;
	}

	if (error.request) {
		// Request was made but no response received
		return 'Network error. Please check your connection.';
	}

	// Something else happened
	return error.message || 'An unexpected error occurred.';
}

/**
 * GET /api/users/
 * Get paginated list of users
 * 
 * @param params - Query parameters for filtering, searching, and pagination
 * @returns Paginated list of users
 */
export async function getAllUsers(params: UserQueryParams = {}): Promise<PaginatedResponse<UserListItem>> {
	try {
		const queryString = toQuery(params);
		const url = queryString ? `/?${queryString}` : '/';
		const response = await api.get<PaginatedResponse<UserListItem>>(url);
		return response.data;
	} catch (error) {
		// Preserve the original error object so status codes are available upstream
		throw error;
	}
}

/**
 * GET /api/users/{id}/
 * Get user by ID
 * 
 * @param id - User ID
 * @returns User details
 */
export async function getUserById(id: number): Promise<User> {
	try {
		const response = await api.get<User>(`/${id}/`);
		return response.data;
	} catch (error) {
		const message = handleApiError(error);
		throw new Error(message);
	}
}

/**
 * POST /api/users/
 * Create a new user
 * 
 * @param userData - User data for creation
 * @returns Created user
 */
export async function createUser(userData: UserCreateUpdate): Promise<User> {
	try {
		const response = await api.post<User>('/', userData);
		return response.data;
	} catch (error) {
		const message = handleApiError(error);
		throw new Error(message);
	}
}

/**
 * PUT /api/users/{id}/
 * Update user (full update)
 * 
 * @param id - User ID
 * @param userData - Updated user data
 * @returns Updated user
 */
export async function updateUser(id: number, userData: UserCreateUpdate): Promise<User> {
	try {
		const response = await api.put<User>(`/${id}/`, userData);
		return response.data;
	} catch (error) {
		const message = handleApiError(error);
		throw new Error(message);
	}
}

/**
 * PATCH /api/users/{id}/
 * Partially update user
 * 
 * @param id - User ID
 * @param userData - Partial user data
 * @returns Updated user
 */
export async function partialUpdateUser(id: number, userData: Partial<UserCreateUpdate>): Promise<User> {
	try {
		const response = await api.patch<User>(`/${id}/`, userData);
		return response.data;
	} catch (error) {
		const message = handleApiError(error);
		throw new Error(message);
	}
}

/**
 * DELETE /api/users/{id}/
 * Delete user
 * 
 * @param id - User ID
 */
export async function deleteUser(id: number): Promise<void> {
	try {
		await api.delete(`/${id}/`);
	} catch (error) {
		const message = handleApiError(error);
		throw new Error(message);
	}
}

