/**
 * Player-related TypeScript types and interfaces
 * 
 * These types match the backend API structure for Player management.
 */

/**
 * Position types for players
 */
export type Position = 'GK' | 'DF' | 'MF' | 'FW';

/**
 * Preferred foot options
 */
export type PreferredFoot = 'Left' | 'Right' | 'Both';

/**
 * User information (nested in Player)
 */
export interface PlayerUser {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	profile_picture?: string | null;
}

/**
 * Team information (nested in Player)
 */
export interface PlayerTeam {
	id: number;
	name: string;
}

/**
 * Full Player object (from GET /api/players/{id}/)
 * Contains complete player information including nested user and team data
 */
export interface Player {
	id: number;
	user: PlayerUser;
	team: PlayerTeam | null;
	full_name: string;
	position: Position;
	jersey_number: number | null;
	date_of_birth: string | null; // ISO date string (YYYY-MM-DD)
	age: number | null; // Computed by backend, can be null if date_of_birth is missing
	nationality: string | null;
	height: number | null; // in cm, can be null if not set
	weight: number | null; // in kg, can be null if not set
	preferred_foot: PreferredFoot | null;
	bio: string | null;
	created_at: string; // ISO datetime string
	updated_at: string; // ISO datetime string
}

/**
 * Lightweight player object for list views (from GET /api/players/)
 * Optimized for table display with essential information only
 */
export interface PlayerListItem {
	id: number;
	full_name: string;
	team_name: string | null;
	position: Position;
	jersey_number: number | null;
	age: number | null;
	nationality: string | null;
	profile_picture?: string | null; // Optional profile picture URL
	team_logo?: string | null; // Optional team logo URL
}

/**
 * Player data for create/update operations
 * Used in POST /api/players/ and PUT/PATCH /api/players/{id}/
 */
export interface PlayerCreateUpdate {
	user: number; // User ID (must have 'player' role)
	team?: number | null; // Team ID (optional, can be null)
	position: Position;
	jersey_number: number; // 1-99
	date_of_birth: string; // ISO date string (YYYY-MM-DD)
	nationality: string;
	height: number; // Positive number (cm)
	weight: number; // Positive number (kg)
	preferred_foot: PreferredFoot;
	bio?: string; // Optional player biography
}

/**
 * Query parameters for filtering/searching players
 * Used in GET /api/players/ endpoint
 */
export interface PlayerQueryParams {
	search?: string; // Search by name or nationality
	team?: number; // Filter by team ID
	position?: Position; // Filter by position
	nationality?: string; // Filter by nationality
	age_min?: number; // Minimum age
	age_max?: number; // Maximum age
	ordering?: string; // Sort field (prefix with - for desc)
	page?: number; // Page number for pagination
	page_size?: number; // Number of items per page
}

/**
 * Player career statistics
 * From GET /api/players/{id}/stats/
 */
export interface PlayerStats {
	player_id: number;
	player_name: string;
	career_stats: {
		total_matches: number;
		total_goals: number;
		total_assists: number;
		total_minutes: number;
	};
	message?: string; // Placeholder message until stats fully implemented
}

/**
 * User option for dropdown selection
 * Used when selecting a user to create a player profile
 */
export interface UserOption {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	full_name: string; // Computed: "first_name last_name" or email
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
 * Position display labels
 */
export const POSITION_LABELS: Record<Position, string> = {
	GK: 'Goalkeeper',
	DF: 'Defender',
	MF: 'Midfielder',
	FW: 'Forward',
};

/**
 * Position options for select dropdown
 */
export const POSITION_OPTIONS: { value: Position; label: string }[] = [
	{ value: 'GK', label: 'Goalkeeper' },
	{ value: 'DF', label: 'Defender' },
	{ value: 'MF', label: 'Midfielder' },
	{ value: 'FW', label: 'Forward' },
];

/**
 * Preferred foot options for select dropdown
 */
export const PREFERRED_FOOT_OPTIONS: { value: PreferredFoot; label: string }[] = [
	{ value: 'Left', label: 'Left' },
	{ value: 'Right', label: 'Right' },
	{ value: 'Both', label: 'Both' },
];

