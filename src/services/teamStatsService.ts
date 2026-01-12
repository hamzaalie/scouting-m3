import axios, { AxiosError } from 'axios';
import type {
	TeamMatchStats,
	TeamMatchStatsComparison,
	TeamMatchStatsCreateUpdate,
	TeamStatsQueryParams,
	PaginatedResponse,
} from '../types/teamStats';

/**
 * API base URL
 * Prefer VITE_API_BASE_URL, fallback to VITE_API_URL, then local default.
 * IMPORTANT: Base URL should NOT include /api - it's added in each endpoint path.
 */
const API_BASE_URL =
	(import.meta as any).env?.VITE_API_BASE_URL ||
	(import.meta as any).env?.VITE_API_URL ||
	'http://localhost:8000';

// Normalize base URL (remove trailing /api if present to avoid double /api/api/)
const normalizedBaseURL = API_BASE_URL.replace(/\/api\/?$/, '');
console.log(
	'[teamStatsService] API Base URL:',
	normalizedBaseURL,
	'(original:',
	API_BASE_URL,
	')'
);

/**
 * Axios instance configured for the backend API.
 * Injects JWT access token into Authorization header when available.
 */
const api = axios.create({ baseURL: normalizedBaseURL });

api.interceptors.request.use((config) => {
	// Use the same storage key as authService for consistency
	// Priority: access_token (from STORAGE_KEYS) > accessToken > token > authToken
	const token =
		localStorage.getItem('access_token') ||
		localStorage.getItem('accessToken') ||
		localStorage.getItem('token') ||
		localStorage.getItem('authToken') ||
		'';
	if (token) {
		config.headers = config.headers ?? {};
		(config.headers as any).Authorization = `Bearer ${token}`;
		console.log(
			'[teamStatsService] Request with token:',
			config.url,
			'Token:',
			token.substring(0, 20) + '...'
		);
	} else {
		console.warn(
			'[teamStatsService] ⚠️ No authentication token found in localStorage. Keys checked: access_token, accessToken, token, authToken'
		);
		console.warn('[teamStatsService] All localStorage keys:', Object.keys(localStorage));
	}
	return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
	(response) => {
		console.log(
			'[teamStatsService] ✅ Response received:',
			response.status,
			response.config.url
		);
		return response;
	},
	(error) => {
		console.error(
			'[teamStatsService] ❌ Response error:',
			error.response?.status,
			error.config?.url
		);
		console.error('[teamStatsService] Error details:', {
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
		if (status === 404) return 'Team statistics not found.';
		if (status === 403) return 'You do not have permission to perform this action.';
		if (status === 409) return 'Conflict: Statistics already exist for this team and match.';
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
	const filtered = Object.entries(params).filter(
		([_, v]) => v !== undefined && v !== null && v !== ''
	);
	if (filtered.length === 0) return '';
	return (
		'?' +
		filtered.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
	);
}

/**
 * Get team statistics list with optional filters.
 *
 * GET /api/stats/teams?team_id={id}&match_id={id}
 *
 * @param filters - Query parameters (match ID, team ID, ordering, pagination)
 * @returns Paginated list of team match statistics
 * @throws Error if fetch fails
 */
export async function getTeamStatsList(
	filters?: TeamStatsQueryParams
): Promise<PaginatedResponse<TeamMatchStats>> {
	try {
		const query = toQuery(filters);
		const response = await api.get<PaginatedResponse<TeamMatchStats>>(
			`/api/stats/teams${query}`
		);
		return response.data;
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

/**
 * Get team statistics by ID.
 *
 * GET /api/stats/teams/{id}
 *
 * @param id - Team statistics ID
 * @returns Team match statistics
 * @throws Error if fetch fails
 */
export async function getTeamStatsById(id: number): Promise<TeamMatchStats> {
	try {
		const response = await api.get<TeamMatchStats>(`/api/stats/teams/${id}`);
		return response.data;
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

/**
 * Get side-by-side comparison of team statistics for a match.
 *
 * GET /api/stats/team-stats/match/{matchId}/comparison/
 *
 * @param matchId - Match ID
 * @returns Comparison of home and away team statistics
 * @throws Error if fetch fails
 */
export async function getTeamStatsComparison(
	matchId: number
): Promise<TeamMatchStatsComparison> {
	try {
		const response = await api.get<TeamMatchStatsComparison>(
			`/api/stats/team-stats/match/${matchId}/comparison/`
		);
		return response.data;
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

/**
 * Create team statistics for a match.
 *
 * POST /api/stats/teams
 *
 * @param data - Team statistics data
 * @returns Created team statistics
 * @throws Error if creation fails
 */
export async function createTeamStats(
	data: TeamMatchStatsCreateUpdate
): Promise<TeamMatchStats> {
	try {
		console.log('[teamStatsService] ===== CREATING TEAM STATS =====');
		console.log('[teamStatsService] Match ID:', data.match);
		console.log('[teamStatsService] Team ID:', data.team);
		console.log('[teamStatsService] Full data object:', JSON.stringify(data, null, 2));
		const response = await api.post<TeamMatchStats>('/api/stats/teams', data);
		console.log('[teamStatsService] ✅ Team stats created successfully, ID:', response.data.id);
		console.log('[teamStatsService] Created stats:', response.data);
		return response.data;
	} catch (error: any) {
		console.error('[teamStatsService] ❌ Error creating team stats');
		console.error('[teamStatsService] Error status:', error?.response?.status);
		console.error('[teamStatsService] Error response data:', error?.response?.data);
		console.error('[teamStatsService] Error response data (stringified):', JSON.stringify(error?.response?.data, null, 2));
		console.error('[teamStatsService] Error message:', error?.message);
		// Re-throw original error to preserve response.data structure
		throw error;
	}
}

/**
 * Update team statistics.
 *
 * PATCH /api/stats/teams/{id}
 *
 * @param id - Team statistics ID
 * @param data - Partial team statistics data
 * @returns Updated team statistics
 * @throws Error if update fails
 */
export async function updateTeamStats(
	id: number,
	data: Partial<TeamMatchStatsCreateUpdate>
): Promise<TeamMatchStats> {
	try {
		const response = await api.patch<TeamMatchStats>(`/api/stats/teams/${id}`, data);
		return response.data;
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

/**
 * Delete team statistics.
 *
 * DELETE /api/stats/teams/{id}
 *
 * @param id - Team statistics ID
 * @throws Error if deletion fails
 */
export async function deleteTeamStats(id: number): Promise<void> {
	try {
		await api.delete(`/api/stats/teams/${id}`);
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

/**
 * Calculate team statistics from player statistics.
 *
 * GET /api/stats/team-stats/match/{matchId}/team/{teamId}/calculate/
 *
 * @param matchId - Match ID
 * @param teamId - Team ID
 * @returns Calculated team statistics and calculation info
 * @throws Error if calculation fails
 */
export interface TeamStatsCalculationResponse {
	calculated_stats: TeamMatchStatsCreateUpdate | null;
	calculation_info: {
		team_id: number;
		team_name: string;
		is_home: boolean;
		total_players: number;
		players_with_stats: number;
		all_players_have_stats: boolean;
		warnings: string[];
		can_calculate: boolean;
	};
}

export async function calculateTeamStatsFromPlayers(
	matchId: number,
	teamId: number
): Promise<TeamStatsCalculationResponse> {
	try {
		const response = await api.get<TeamStatsCalculationResponse>(
			`/api/stats/team-stats/match/${matchId}/team/${teamId}/calculate/`
		);
		return response.data;
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}
