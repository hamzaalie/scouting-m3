/**
 * Match-related TypeScript types and interfaces
 * 
 * These types match the backend API structure for Match management.
 */

/**
 * Video platform types for match videos
 */
export type VideoPlatform = 'YouTube' | 'Vimeo' | 'VEO' | 'Other';

/**
 * Match status types
 */
export type MatchStatus = 'Scheduled' | 'Completed' | 'Cancelled';

/**
 * Team information (nested in Match)
 */
export interface MatchTeam {
	id: number;
	name: string;
	logo?: string | null;
}

/**
 * Creator information (nested in Match)
 */
export interface MatchCreator {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
}

/**
 * Full Match object (from GET /api/matches/{id}/)
 * Contains complete match information including nested team and creator data
 */
export interface Match {
	id: number;
	home_team: MatchTeam;
	away_team: MatchTeam;
	competition: string;
	match_date: string; // ISO datetime string
	venue: string;
	home_score: number;
	away_score: number;
	score_display: string; // e.g., "3 - 1"
	video_url: string | null;
	video_platform: VideoPlatform;
	status: MatchStatus;
	created_by: MatchCreator | null;
	created_at: string; // ISO datetime string
	updated_at: string; // ISO datetime string
}

/**
 * Lightweight match object for list views (from GET /api/matches/)
 * Optimized for table display with essential information only
 */
export interface MatchListItem {
	id: number;
	match_date: string; // ISO datetime string
	home_team_name: string;
	away_team_name: string;
	home_team_logo?: string | null; // Team logo URL
	away_team_logo?: string | null; // Team logo URL
	score_display: string; // e.g., "3 - 1"
	competition: string;
	status: MatchStatus;
	has_video: boolean; // Computed: video_url is not empty
}

/**
 * Match data for create/update operations
 * Used in POST /api/matches/ and PUT/PATCH /api/matches/{id}/
 */
export interface MatchCreateUpdate {
	home_team: number; // Team ID
	away_team: number; // Team ID
	competition: string;
	match_date: string; // ISO datetime string
	venue: string;
	home_score: number; // Default 0
	away_score: number; // Default 0
	video_url?: string | null; // Optional
	video_platform: VideoPlatform;
	status: MatchStatus;
}

/**
 * Query parameters for filtering/searching matches
 * Used in GET /api/matches/ endpoint
 */
export interface MatchQueryParams {
	team?: number; // Matches where team is home OR away
	status?: MatchStatus;
	competition?: string;
	date_from?: string; // ISO date string
	date_to?: string; // ISO date string
	ordering?: string; // Sort field (prefix with - for desc)
	page?: number; // Page number for pagination
	search?: string; // Optional search query
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

/**
 * Match status options for select dropdowns
 */
export const STATUS_OPTIONS: Array<{ value: MatchStatus; label: string }> = [
	{ value: 'Scheduled', label: 'Scheduled' },
	{ value: 'Completed', label: 'Completed' },
	{ value: 'Cancelled', label: 'Cancelled' },
];

/**
 * Video platform options for select dropdowns
 */
export const PLATFORM_OPTIONS: Array<{ value: VideoPlatform; label: string }> = [
	{ value: 'YouTube', label: 'YouTube' },
	{ value: 'Vimeo', label: 'Vimeo' },
	{ value: 'VEO', label: 'VEO' },
	{ value: 'Other', label: 'Other' },
];

/**
 * Match status display labels
 */
export const STATUS_LABELS: Record<MatchStatus, string> = {
	Scheduled: 'Scheduled',
	Completed: 'Completed',
	Cancelled: 'Cancelled',
};

/**
 * Video platform display labels
 */
export const PLATFORM_LABELS: Record<VideoPlatform, string> = {
	YouTube: 'YouTube',
	Vimeo: 'Vimeo',
	VEO: 'VEO',
	Other: 'Other',
};

