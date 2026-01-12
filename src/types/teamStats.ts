/**
 * Team Statistics TypeScript types and interfaces
 *
 * These types match the backend API structure for team-level match statistics.
 */

/**
 * Team information (nested in TeamMatchStats)
 */
export interface TeamInfo {
	id: number;
	name: string;
	logo?: string | null;
	location: string;
}

/**
 * Match information (nested in TeamMatchStats)
 */
export interface TeamMatchInfo {
	id: number;
	home_team: string | null;
	away_team: string | null;
	match_date: string | null; // ISO datetime string
	competition: string;
	venue: string;
	home_score: number;
	away_score: number;
}

/**
 * Full TeamMatchStats object (from GET /api/stats/team-stats/{id}/)
 * Contains complete team match statistics including nested team and match data
 */
export interface TeamMatchStats {
	id: number;
	match: number; // Match ID
	match_info?: TeamMatchInfo;
	team: number; // Team ID
	team_name?: string; // Computed from team
	team_logo?: string | null; // Team logo URL
	team_info?: TeamInfo;

	// Offensive statistics
	goals: number;
	key_passes: number;
	long_balls: number;
	total_shots: number;
	shots_on_target: number;
	passes_in_penalty_area: number;

	// Possession
	possession_percentage: number; // 0-100

	// Defensive statistics
	tackles: number;
	blocks: number;

	// Physical and skill statistics
	successful_dribbles: number;
	duels_won: number;
	miscontrols: number;
	fouled_when_dribble: number;

	// Disciplinary
	fouls: number;
	yellow_cards: number;
	red_cards: number;

	// Timestamps
	created_at: string; // ISO datetime string
	updated_at: string; // ISO datetime string
}

/**
 * Team Match Statistics data for create/update operations
 * Used in POST /api/stats/team-stats/ and PUT/PATCH /api/stats/team-stats/{id}/
 */
export interface TeamMatchStatsCreateUpdate {
	team: number; // Team ID
	match: number; // Match ID
	goals?: number;
	key_passes?: number;
	long_balls?: number;
	total_shots?: number;
	shots_on_target?: number;
	passes_in_penalty_area?: number;
	possession_percentage?: number; // 0-100
	tackles?: number;
	blocks?: number;
	successful_dribbles?: number;
	duels_won?: number;
	miscontrols?: number;
	fouled_when_dribble?: number;
	fouls?: number;
	yellow_cards?: number;
	red_cards?: number;
}

/**
 * Side-by-side comparison of team statistics for a match
 * Used in GET /api/stats/team-stats/match/{match_id}/comparison/
 */
export interface TeamMatchStatsComparison {
	match_id: number;
	match_info: TeamMatchInfo;
	home_team_stats: TeamMatchStats | null;
	away_team_stats: TeamMatchStats | null;
}

/**
 * Query parameters for filtering/searching team stats
 * Used in GET /api/stats/team-stats/ endpoint
 */
export interface TeamStatsQueryParams {
	match?: number; // Filter by match ID
	team?: number; // Filter by team ID
	ordering?: string; // Sort field (prefix with - for desc)
	page?: number; // Page number for pagination
	page_size?: number; // Items per page
}

/**
 * Generic paginated response
 * Used for list endpoints that return paginated data
 */
export interface PaginatedResponse<T> {
	count: number; // Total number of items
	next: string | null; // URL to next page
	previous: string | null; // URL to previous page
	results: T[]; // Array of items for current page
}
