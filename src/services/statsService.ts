import axios, { AxiosError } from 'axios';

/**
 * API base URL
 * Prefer VITE_API_BASE_URL, fallback to VITE_API_URL, then local default.
 * IMPORTANT: Base URL should NOT include /api - it's added in each endpoint path.
 */
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

// Normalize base URL (remove trailing /api if present to avoid double /api/api/)
const normalizedBaseURL = API_BASE_URL.replace(/\/api\/?$/, '');
console.log('[statsService] API Base URL:', normalizedBaseURL, '(original:', API_BASE_URL, ')');

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
		console.log('[statsService] Request with token:', config.url, 'Token:', token.substring(0, 20) + '...');
	} else {
		console.warn('[statsService] ⚠️ No authentication token found in localStorage. Keys checked: access_token, accessToken, token, authToken');
		console.warn('[statsService] All localStorage keys:', Object.keys(localStorage));
	}
	return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
	(response) => {
		console.log('[statsService] ✅ Response received:', response.status, response.config.url);
		return response;
	},
	(error) => {
		console.error('[statsService] ❌ Response error:', error.response?.status, error.config?.url);
		console.error('[statsService] Error details:', {
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
		if (status === 404) return 'Statistics not found.';
		if (status === 403) return 'You do not have permission to perform this action.';
		if (status === 409) return 'Conflict: Statistics already exist for this player and match.';
		return `Request failed with status ${status}.`;
	}
	if (err.request) {
		return 'Network error: Unable to reach the server.';
	}
	return 'Unexpected error occurred.';
}

/**
 * Player Statistics data structure
 */
export interface PlayerStats {
	id?: number;
	player: number;
	match: number;
	minutes_played: number;
	goals: number;
	assists: number;
	shots: number;
	shots_on_target: number;
	passes_completed: number;
	pass_accuracy: number | string;
	key_passes: number;  // NEW
	long_balls: number;  // NEW
	crosses: number;  // NEW
	tackles: number;
	interceptions: number;
	blocks: number;  // NEW
	clearances: number;
	duels_won: number | null;  // NEW (optional)
	dribbles_successful: number | null;  // NEW (optional)
	fouls_committed: number;
	fouls_suffered: number;  // NEW
	yellow_cards: number;
	red_cards: number;
	highlights_video_url?: string | null;  // Match-specific highlight video URL
	has_highlights?: boolean;  // Computed: true if highlights_video_url exists
	saves: number;
	gk_runs_out: number;  // NEW - Goalkeeper runs out of penalty area
	successful_punches: number;  // NEW - Successful punches/catches from crosses
	starting_xi: boolean;
	created_at?: string;
	updated_at?: string;
	// Nested info (from serializer)
	player_info?: {
		id: number;
		full_name: string;
		position: string;
		team_name: string | null;
		jersey_number: number | null;
	};
	match_info?: {
		id: number;
		home_team: string | null;
		away_team: string | null;
		match_date: string | null;
		competition: string;
	};
}

/**
 * Player Statistics Create/Update payload (without nested info)
 */
export interface PlayerStatsCreateUpdate {
	player: number;
	match: number;
	minutes_played?: number;
	goals?: number;
	assists?: number;
	shots?: number;
	shots_on_target?: number;
	passes_completed?: number;
	pass_accuracy?: number | string;
	key_passes?: number;  // NEW
	long_balls?: number;  // NEW
	crosses?: number;  // NEW
	tackles?: number;
	interceptions?: number;
	blocks?: number;  // NEW
	clearances?: number;
	duels_won?: number | null;  // NEW
	dribbles_successful?: number | null;  // NEW
	fouls_committed?: number;
	fouls_suffered?: number;  // NEW
	yellow_cards?: number;
	red_cards?: number;
	highlights_video_url?: string | null;  // Match-specific highlight video URL
	saves?: number;
	gk_runs_out?: number;  // NEW - Goalkeeper runs out of penalty area
	successful_punches?: number;  // NEW - Successful punches/catches from crosses
	starting_xi?: boolean;
}

/**
 * Aggregated Statistics response
 */
export interface AggregatedStats {
	total_matches: number;
	total_goals: number;
	total_assists: number;
	total_minutes: number;
	total_shots: number;
	total_tackles: number;
	total_yellow_cards: number;
	total_red_cards: number;
	total_saves: number;
	total_gk_runs_out?: number;  // NEW - Total goalkeeper runs out
	total_successful_punches?: number;  // NEW - Total successful punches
	// NEW FIELDS
	total_key_passes?: number;
	total_blocks?: number;
	total_fouls_suffered?: number;
	total_long_balls?: number;
	total_crosses?: number;
	total_dribbles_successful?: number;
	total_duels_won?: number;
	// Computed fields
	average_rating: number | null;
	goals_per_match: number;
	assists_per_match: number;
	key_passes_per_match?: number;  // NEW
	// Optional fields that may not be returned by backend yet
	total_shots_on_target?: number;
	total_passes_completed?: number;
	average_pass_accuracy?: number;
	total_interceptions?: number;
	total_clearances?: number;
	total_fouls_committed?: number;
}

/**
 * Season Statistics response
 */
export interface SeasonStats {
	season_year: number | null;
	competition: string | null;
	matches_played: number;
	goals: number;
	assists: number;
	yellow_cards: number;
	red_cards: number;
}

/**
 * Match Statistics response (list of player stats for a match)
 */
export interface MatchStatsItem {
	id: number;
	player: number;
	player_info: {
		id: number;
		full_name: string;
		position: string;
		team_name: string | null;
		jersey_number: number | null;
	};
	minutes_played: number;
	goals: number;
	assists: number;
	shots: number;
	shots_on_target: number;
	passes_completed: number;
	pass_accuracy: number | string;
	key_passes: number;  // NEW
	long_balls: number;  // NEW
	crosses: number;  // NEW
	tackles: number;
	interceptions: number;
	blocks: number;  // NEW
	clearances: number;
	duels_won: number | null;  // NEW
	dribbles_successful: number | null;  // NEW
	fouls_committed: number;
	fouls_suffered: number;  // NEW
	yellow_cards: number;
	red_cards: number;
	highlights_video_url?: string | null;  // Match-specific highlight video URL
	has_highlights?: boolean;  // Computed: true if highlights_video_url exists
	saves: number;
	gk_runs_out: number;  // NEW - Goalkeeper runs out of penalty area
	successful_punches: number;  // NEW - Successful punches/catches from crosses
	starting_xi: boolean;
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
 * Query parameters for listing player stats
 */
export interface PlayerStatsQueryParams {
	player?: number;
	match?: number;
	match__match_date__gte?: string;
	match__match_date__lte?: string;
	ordering?: string;
	page?: number;
	page_size?: number;
}

/**
 * Query parameters for season stats
 */
export interface SeasonStatsQueryParams {
	year?: number;
	competition?: string;
}

/**
 * Build query string from optional params.
 */
function toQuery(params?: Record<string, any>): string {
	if (!params) return '';
	const filtered = Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '');
	if (filtered.length === 0) return '';
	return '?' + filtered.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

/**
 * Create player statistics for a match.
 * 
 * POST /api/stats/players
 * 
 * @param data - Player statistics data
 * @returns Created player statistics
 * @throws Error if creation fails
 */
export async function createPlayerStats(data: PlayerStatsCreateUpdate): Promise<PlayerStats> {
	try {
		const response = await api.post<PlayerStats>('/api/stats/players', data);
		return response.data;
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

/**
 * Update player statistics.
 * 
 * PATCH /api/stats/players/{id}
 * 
 * @param id - Statistics ID
 * @param data - Partial player statistics data
 * @returns Updated player statistics
 * @throws Error if update fails
 */
export async function updatePlayerStats(id: number, data: Partial<PlayerStatsCreateUpdate>): Promise<PlayerStats> {
	try {
		const response = await api.patch<PlayerStats>(`/api/stats/players/${id}`, data);
		return response.data;
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

/**
 * Get player statistics with optional filters.
 * 
 * GET /api/stats/players?player_id={id}&match_id={id}
 * 
 * @param params - Query parameters (player ID, match ID, date range, etc.)
 * @returns Paginated list of player statistics
 * @throws Error if fetch fails
 */
export async function getPlayerStats(params?: PlayerStatsQueryParams): Promise<PaginatedResponse<PlayerStats>> {
	try {
		const query = toQuery(params);
		const response = await api.get<PaginatedResponse<PlayerStats>>(`/api/stats/players${query}`);
		return response.data;
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

/**
 * Match Stats Response from API
 */
export interface MatchStatsResponse {
	match_id: number;
	match_info: {
		id: number;
		home_team: string | null;
		away_team: string | null;
		match_date: string | null;
		competition: string;
		venue: string;
		home_score: number;
		away_score: number;
		status: string;
	};
	stats: MatchStatsItem[];
	total_players: number;
}

/**
 * Get all player statistics for a specific match.
 * 
 * GET /api/stats/matches/{matchId}/
 * 
 * @param matchId - Match ID
 * @returns Array of player statistics for the match
 * @throws Error if fetch fails
 */
export async function getMatchStats(matchId: number): Promise<MatchStatsItem[]> {
	try {
		const response = await api.get<MatchStatsResponse>(`/api/stats/matches/${matchId}/`);
		// Backend returns object with 'stats' property, extract the array
		return response.data?.stats || [];
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

/**
 * Get aggregated (career) statistics for a player.
 * 
 * GET /api/stats/players/aggregate/{playerId}
 * 
 * @param playerId - Player ID
 * @returns Aggregated statistics (career totals and averages)
 * @throws Error if fetch fails
 */
export async function getAggregatedStats(playerId: number): Promise<AggregatedStats> {
	try {
		const response = await api.get<AggregatedStats>(`/api/stats/players/aggregate/${playerId}`);
		return response.data;
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

/**
 * Get season-specific statistics for a player.
 * 
 * GET /api/stats/players/{playerId}/season/?year=X&competition=Y
 * 
 * @param playerId - Player ID
 * @param filters - Optional filters (year, competition)
 * @returns Season statistics
 * @throws Error if fetch fails
 */
export async function getSeasonStats(
	playerId: number,
	filters?: SeasonStatsQueryParams
): Promise<SeasonStats> {
	try {
		const query = toQuery(filters);
		const response = await api.get<SeasonStats>(`/api/stats/players/${playerId}/season${query}`);
		return response.data;
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

/**
 * Delete player statistics.
 * 
 * DELETE /api/stats/players/{id}
 * 
 * @param id - Statistics ID
 * @throws Error if deletion fails
 */
export async function deletePlayerStats(id: number): Promise<void> {
	try {
		await api.delete(`/api/stats/players/${id}`);
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

