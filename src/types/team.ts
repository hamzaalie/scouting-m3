/**
 * Team-related TypeScript types for API integration.
 */

export interface TeamListItem {
	id: number;
	name: string;
	logo: string | null;
	location: string;
	founded_year: number | null;
	players_count: number;
}

export interface TeamPlayerItem {
	id: number;
	name: string;
	position: string;
	jersey_number: number | null;
}

export interface Team {
	id: number;
	name: string;
	logo: string | null;
	location: string;
	founded_year: number | null;
	players_count: number;
	player_list?: TeamPlayerItem[]; // present in detail serializer
	created_at: string;
	updated_at: string;
}

export interface TeamCreateUpdate {
	name: string;
	location: string;
	founded_year?: number | null;
	logo?: File | null;
}

export interface TeamQueryParams {
	search?: string;
	location?: string;
	founded_year_min?: number;
	founded_year_max?: number;
	ordering?: string; // e.g., 'name' or '-name'
	page?: number;
	page_size?: number;
}

export interface PaginatedResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}


