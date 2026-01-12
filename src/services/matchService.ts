import axios, { AxiosError } from 'axios';
import type {
	Match,
	MatchListItem,
	MatchCreateUpdate,
	MatchQueryParams,
	PaginatedResponse,
} from '../types/match';

/**
 * API base URL
 * Prefer VITE_API_BASE_URL, fallback to VITE_API_URL, then local default.
 * IMPORTANT: Base URL should NOT include /api - it's added in each endpoint path.
 */
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

// Normalize base URL (remove trailing /api if present to avoid double /api/api/)
const normalizedBaseURL = API_BASE_URL.replace(/\/api\/?$/, '');
console.log('[matchService] API Base URL:', normalizedBaseURL, '(original:', API_BASE_URL, ')');

/**
 * Axios instance configured for the backend API.
 * Injects JWT access token into Authorization header when available.
 */
const api = axios.create({ baseURL: normalizedBaseURL });

api.interceptors.request.use((config) => {
	// Use the same storage key as authService for consistency
	// Priority: access_token (from STORAGE_KEYS) > accessToken > token > authToken
	const token =
		localStorage.getItem('access_token') ||  // Primary key (matches authService)
		localStorage.getItem('accessToken') ||
		localStorage.getItem('token') ||
		localStorage.getItem('authToken') ||
		'';
	if (token) {
		config.headers = config.headers ?? {};
		(config.headers as any).Authorization = `Bearer ${token}`;
		console.log('[matchService] Request with token:', config.url, 'Token:', token.substring(0, 20) + '...');
	} else {
		console.warn('[matchService] ⚠️ No authentication token found in localStorage. Keys checked: access_token, accessToken, token, authToken');
		console.warn('[matchService] All localStorage keys:', Object.keys(localStorage));
	}
	return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
	(response) => {
		console.log('[matchService] ✅ Response received:', response.status, response.config.url);
		return response;
	},
	(error) => {
		console.error('[matchService] ❌ Response error:', error.response?.status, error.config?.url);
		console.error('[matchService] Error details:', {
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			message: error.message,
		});
		return Promise.reject(error);
	}
);

/**
 * Convert arbitrary error from Axios into a user-friendly message.
 */
export function handleApiError(error: unknown): string {
	const err = error as AxiosError<any>;
	if (err.response) {
		const status = err.response.status;
		const data = err.response.data as any;
		// Validation errors (DRF) often come as an object of arrays
		if (data && typeof data === 'object') {
			if (typeof data.detail === 'string') return data.detail;
			// Concatenate first messages
			const msgs: string[] = [];
			for (const key of Object.keys(data)) {
				const val = (data as any)[key];
				if (Array.isArray(val) && val.length > 0) msgs.push(`${key}: ${val[0]}`);
				else if (typeof val === 'string') msgs.push(`${key}: ${val}`);
			}
			if (msgs.length) return msgs.join(' \n ');
		}
		if (status === 404) return 'Match not found.';
		if (status === 403) return 'You do not have permission to perform this action.';
		if (status === 409) return 'Conflict: The match cannot be modified due to related data.';
		return `Request failed with status ${status}.`;
	}
	if (err.request) {
		return 'Network error: Unable to reach the server.';
	}
	return 'Unexpected error occurred.';
}

/**
 * Build query string from optional params.
 */
function toQuery(params?: Record<string, any>): string {
	if (!params) return '';
	const q = new URLSearchParams();
	Object.entries(params).forEach(([k, v]) => {
		if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
	});
	const s = q.toString();
	return s ? `?${s}` : '';
}

/**
 * GET /api/matches/
 * Paginated list with optional filters and search.
 * 
 * @param params - Optional query parameters for filtering, sorting, and pagination
 * @returns Paginated list of matches
 */
export async function getAllMatches(
	params?: MatchQueryParams,
): Promise<PaginatedResponse<MatchListItem>> {
	try {
		const url = `/api/matches${toQuery(params as any)}`;
		console.log('[matchService] Fetching matches from:', url);
		const { data } = await api.get<PaginatedResponse<MatchListItem>>(url);
		console.log('[matchService] Matches fetched successfully:', data);
		return data;
	} catch (error) {
		console.error('[matchService] Error fetching matches:', error);
		const errorMessage = handleApiError(error);
		console.error('[matchService] Error message:', errorMessage);
		throw new Error(errorMessage);
	}
}

/**
 * GET /api/matches/{id}
 * Get full match details including nested team and creator information.
 * 
 * @param id - Match ID
 * @returns Full match object
 */
export async function getMatchById(id: number): Promise<Match> {
	try {
		console.log('[matchService] Fetching match by ID:', id);
		const { data } = await api.get<Match>(`/api/matches/${id}`);
		console.log('[matchService] Match fetched successfully:', data);
		return data;
	} catch (error) {
		console.error('[matchService] Error fetching match:', error);
		throw new Error(handleApiError(error));
	}
}

/**
 * POST /api/matches
 * Create a new match.
 * 
 * Note: created_by is automatically set by the backend based on the authenticated user.
 * 
 * @param data - Match data (uses JSON body, NOT FormData)
 * @returns Created match object
 */
export async function createMatch(data: MatchCreateUpdate): Promise<Match> {
	try {
		console.log('[matchService] Creating match:', data);
		const resp = await api.post<Match>(`/api/matches`, data, {
			headers: { 'Content-Type': 'application/json' },
		});
		console.log('[matchService] Match created successfully:', resp.data);
		return resp.data;
	} catch (error) {
		console.error('[matchService] Error creating match:', error);
		throw new Error(handleApiError(error));
	}
}

/**
 * PUT /api/matches/{id}
 * Update an existing match (full update).
 * 
 * @param id - Match ID
 * @param data - Complete match data (uses JSON body, NOT FormData)
 * @returns Updated match object
 */
export async function updateMatch(id: number, data: MatchCreateUpdate): Promise<Match> {
	try {
		console.log('[matchService] Updating match:', id, data);
		const resp = await api.put<Match>(`/api/matches/${id}`, data, {
			headers: { 'Content-Type': 'application/json' },
		});
		console.log('[matchService] Match updated successfully:', resp.data);
		return resp.data;
	} catch (error) {
		console.error('[matchService] Error updating match:', error);
		throw new Error(handleApiError(error));
	}
}

/**
 * DELETE /api/matches/{id}
 * Delete a match (Admin only).
 * 
 * @param id - Match ID
 */
export async function deleteMatch(id: number): Promise<void> {
	try {
		console.log('[matchService] Deleting match:', id);
		await api.delete(`/api/matches/${id}`);
		console.log('[matchService] Match deleted successfully');
	} catch (error) {
		console.error('[matchService] Error deleting match:', error);
		const message = handleApiError(error);
		throw new Error(message);
	}
}

/**
 * Default export with all service functions
 */
export default {
	getAllMatches,
	getMatchById,
	createMatch,
	updateMatch,
	deleteMatch,
};

