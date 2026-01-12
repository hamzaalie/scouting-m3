import axios, { AxiosError } from 'axios';
import type {
	Player,
	PlayerListItem,
	PlayerCreateUpdate,
	PlayerQueryParams,
	PlayerStats,
	PaginatedResponse,
	UserOption,
} from '../types/player';
import { 
	getAggregatedStats, 
	getPlayerStats as getPlayerStatsFromStatsService,
	type AggregatedStats,
	type PlayerStats as PlayerMatchStats,
} from './statsService';

/**
 * API base URL
 * Prefer VITE_API_BASE_URL, fallback to VITE_API_URL, then local default.
 * IMPORTANT: Base URL should NOT include /api - it's added in each endpoint path.
 */
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

// Normalize base URL (remove trailing /api if present to avoid double /api/api/)
const normalizedBaseURL = API_BASE_URL.replace(/\/api\/?$/, '');
console.log('[playerService] API Base URL:', normalizedBaseURL, '(original:', API_BASE_URL, ')');

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
		console.log('[playerService] Request with token:', config.url, 'Token:', token.substring(0, 20) + '...');
	} else {
		console.warn('[playerService] ⚠️ No authentication token found in localStorage. Keys checked: access_token, accessToken, token, authToken');
		console.warn('[playerService] All localStorage keys:', Object.keys(localStorage));
	}
	return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
	(response) => {
		console.log('[playerService] ✅ Response received:', response.status, response.config.url);
		return response;
	},
	(error) => {
		console.error('[playerService] ❌ Response error:', error.response?.status, error.config?.url);
		console.error('[playerService] Error details:', {
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
		if (status === 404) return 'Player not found.';
		if (status === 403) return 'You do not have permission to perform this action.';
		if (status === 409) return 'Conflict: The player cannot be modified due to related data.';
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
 * GET /api/players/
 * Paginated list with optional filters and search.
 */
export async function getAllPlayers(
	params?: PlayerQueryParams,
): Promise<PaginatedResponse<PlayerListItem>> {
	try {
		const url = `/api/players${toQuery(params as any)}`;
		console.log('[playerService] Fetching players from:', url);
		const { data } = await api.get<PaginatedResponse<PlayerListItem>>(url);
		console.log('[playerService] Players fetched successfully:', data);
		return data;
	} catch (error) {
		console.error('[playerService] Error fetching players:', error);
		const errorMessage = handleApiError(error);
		console.error('[playerService] Error message:', errorMessage);
		throw new Error(errorMessage);
	}
}

/**
 * GET /api/players/{id}
 * Get full player details including user and team information
 */
export async function getPlayerById(id: number): Promise<Player> {
	try {
		console.log('[playerService] Fetching player by ID:', id);
		const { data } = await api.get<Player>(`/api/players/${id}`);
		console.log('[playerService] Player fetched successfully:', data);
		return data;
	} catch (error) {
		console.error('[playerService] Error fetching player:', error);
		throw new Error(handleApiError(error));
	}
}

/**
 * POST /api/players
 * Create a new player profile
 * 
 * @param data - Player data (uses JSON body, NOT FormData)
 * @returns Created player object
 */
export async function createPlayer(data: PlayerCreateUpdate): Promise<Player> {
	try {
		console.log('[playerService] Creating player:', data);
		const resp = await api.post<Player>(`/api/players`, data, {
			headers: { 'Content-Type': 'application/json' },
		});
		console.log('[playerService] Player created successfully:', resp.data);
		return resp.data;
	} catch (error) {
		console.error('[playerService] Error creating player:', error);
		console.error('[playerService] Error type:', error?.constructor?.name);
		console.error('[playerService] Error response:', (error as any)?.response);
		console.error('[playerService] Error response data:', (error as any)?.response?.data);
		// Re-throw original error to preserve response.data structure
		throw error;
	}
}

/**
 * PUT /api/players/{id}
 * Update an existing player (full update)
 * 
 * @param id - Player ID
 * @param data - Complete player data (uses JSON body, NOT FormData)
 * @returns Updated player object
 */
export async function updatePlayer(id: number, data: PlayerCreateUpdate): Promise<Player> {
	try {
		console.log('[playerService] Updating player:', id, data);
		const resp = await api.put<Player>(`/api/players/${id}`, data, {
			headers: { 'Content-Type': 'application/json' },
		});
		console.log('[playerService] Player updated successfully:', resp.data);
		return resp.data;
	} catch (error) {
		console.error('[playerService] Error updating player:', error);
		throw new Error(handleApiError(error));
	}
}

/**
 * PATCH /api/players/{id}
 * Partial update of a player (only specified fields)
 * 
 * @param id - Player ID
 * @param data - Partial player data (uses JSON body)
 * @returns Updated player object
 */
export async function partialUpdatePlayer(
	id: number,
	data: Partial<PlayerCreateUpdate>
): Promise<Player> {
	try {
		console.log('[playerService] Partially updating player:', id, data);
		const resp = await api.patch<Player>(`/api/players/${id}`, data, {
			headers: { 'Content-Type': 'application/json' },
		});
		console.log('[playerService] Player partially updated successfully:', resp.data);
		return resp.data;
	} catch (error) {
		console.error('[playerService] Error partially updating player:', error);
		throw new Error(handleApiError(error));
	}
}

/**
 * DELETE /api/players/{id}
 * Delete a player profile (Admin only)
 * 
 * @param id - Player ID
 */
export async function deletePlayer(id: number): Promise<void> {
	try {
		console.log('[playerService] Deleting player:', id);
		await api.delete(`/api/players/${id}`);
		console.log('[playerService] Player deleted successfully');
	} catch (error) {
		console.error('[playerService] Error deleting player:', error);
		const message = handleApiError(error);
		throw new Error(message);
	}
}

/**
 * GET /api/players/{id}/stats
 * Get player career statistics
 * 
 * Note: This is a placeholder endpoint until statistics are fully implemented.
 * Currently returns zero values with a message.
 */
export async function getPlayerStats(id: number): Promise<PlayerStats> {
	try {
		console.log('[playerService] Fetching player stats:', id);
		const { data } = await api.get<PlayerStats>(`/api/players/${id}/stats`);
		console.log('[playerService] Player stats fetched successfully:', data);
		return data;
	} catch (error) {
		console.error('[playerService] Error fetching player stats:', error);
		throw new Error(handleApiError(error));
	}
}

/**
 * GET /api/players/{id}/matches
 * Get player match history (paginated)
 * 
 * Note: This is a placeholder endpoint until matches are fully implemented.
 * Currently returns an empty list with a message.
 */
export async function getPlayerMatches(id: number): Promise<PaginatedResponse<any>> {
	try {
		console.log('[playerService] Fetching player matches:', id);
		const { data } = await api.get<PaginatedResponse<any>>(`/api/players/${id}/matches`);
		console.log('[playerService] Player matches fetched successfully:', data);
		return data;
	} catch (error) {
		console.error('[playerService] Error fetching player matches:', error);
		throw new Error(handleApiError(error));
	}
}

/**
 * GET /api/users/
 * Get all users with optional role filter
 * 
 * Used for populating user dropdown when creating/editing players.
 * Filter by role='player' to get only users eligible for player profiles.
 * 
 * @param role - Optional role filter (e.g., 'player')
 * @returns Array of user options formatted for dropdown
 */
export async function getAllUsers(role?: string): Promise<UserOption[]> {
	try {
		const params = role ? { role } : {};
		const url = `/api/users${toQuery(params)}`;
		console.log('[playerService] Fetching users from:', url);
		const { data } = await api.get<any>(url);
		
		// Transform backend response to UserOption format
		// Backend may return paginated or non-paginated response
		const users = Array.isArray(data) ? data : (data.results || []);
		
		const userOptions: UserOption[] = users.map((user: any) => ({
			id: user.id,
			email: user.email,
			first_name: user.first_name || '',
			last_name: user.last_name || '',
			full_name: user.first_name && user.last_name 
				? `${user.first_name} ${user.last_name}` 
				: user.email,
		}));
		
		console.log('[playerService] Users fetched successfully:', userOptions.length, 'users');
		return userOptions;
	} catch (error) {
		console.error('[playerService] Error fetching users:', error);
		throw new Error(handleApiError(error));
	}
}

/**
 * GET /api/users/auth/me/
 * Get the current logged-in user's profile data.
 * 
 * For players, this includes the player_profile nested object with:
 * - Player ID
 * - Position, jersey number, nationality
 * - Team information
 * - Physical stats (height, weight)
 * - Bio
 * 
 * @returns Current user data with player_profile if role is 'player'
 */
export async function getMyProfile(): Promise<any> {
	try {
		console.log('[playerService] Fetching current user profile');
		const { data } = await api.get<any>('/api/users/auth/me/');
		console.log('[playerService] Current user profile fetched successfully:', data);
		return data;
	} catch (error) {
		console.error('[playerService] Error fetching current user profile:', error);
		throw new Error(handleApiError(error));
	}
}

/**
 * GET /api/stats/players/{playerId}/aggregated/
 * Get aggregated career statistics for the current logged-in player.
 * 
 * Fetches the current user profile first to get the player ID,
 * then retrieves aggregated statistics.
 * 
 * Returns career totals:
 * - Total matches, goals, assists, minutes
 * - Total shots, tackles, cards, saves
 * - Goals per match, assists per match
 * 
 * @returns Aggregated career statistics for current player
 */
export async function getMyStats(): Promise<AggregatedStats | null> {
	try {
		console.log('[playerService] Fetching current player stats');
		
		// First, get current user profile to get player ID
		const profile = await getMyProfile();
		
		if (!profile.player_profile || !profile.player_profile.id) {
			console.log('[playerService] No player profile found for current user');
			return null;
		}
		
		const playerId = profile.player_profile.id;
		console.log('[playerService] Player ID:', playerId);
		
		// Fetch aggregated stats for this player
		const stats = await getAggregatedStats(playerId);
		console.log('[playerService] Current player stats fetched successfully:', stats);
		
		return stats;
	} catch (error) {
		console.error('[playerService] Error fetching current player stats:', error);
		// If it's a "no player profile" error, return null instead of throwing
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (errorMessage.includes('No player profile') || errorMessage.includes('player profile')) {
			return null;
		}
		throw new Error(handleApiError(error));
	}
}

/**
 * GET /api/stats/player-stats/?player={playerId}
 * Get match-by-match statistics for the current logged-in player.
 * 
 * Fetches the current user profile first to get the player ID,
 * then retrieves all match statistics.
 * 
 * Returns paginated list of player statistics with:
 * - Per-match stats (goals, assists, minutes, etc.)
 * - Match information (opponent, date, competition)
 * - Player information
 * 
 * @returns Paginated list of match statistics for current player
 */
export async function getMyMatches(): Promise<PaginatedResponse<PlayerMatchStats> | null> {
	try {
		console.log('[playerService] Fetching current player matches');
		
		// First, get current user profile to get player ID
		const profile = await getMyProfile();
		
		if (!profile.player_profile || !profile.player_profile.id) {
			console.log('[playerService] No player profile found for current user');
			return null;
		}
		
		const playerId = profile.player_profile.id;
		console.log('[playerService] Player ID:', playerId);
		
		// Fetch match stats for this player
		const matches = await getPlayerStatsFromStatsService({ player: playerId });
		console.log('[playerService] Current player matches fetched successfully:', matches);
		
		return matches;
	} catch (error) {
		console.error('[playerService] Error fetching current player matches:', error);
		// If it's a "no player profile" error, return null instead of throwing
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (errorMessage.includes('No player profile') || errorMessage.includes('player profile')) {
			return null;
		}
		throw new Error(handleApiError(error));
	}
}

/**
 * Default export with all service functions
 */
export default {
	getAllPlayers,
	getPlayerById,
	createPlayer,
	updatePlayer,
	partialUpdatePlayer,
	deletePlayer,
	getPlayerStats,
	getPlayerMatches,
	getAllUsers,
	getMyProfile,
	getMyStats,
	getMyMatches,
};

