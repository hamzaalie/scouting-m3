import axios, { AxiosError } from 'axios';
import type {
	Team,
	TeamListItem,
	TeamCreateUpdate,
	TeamQueryParams,
	PaginatedResponse,
} from '../types/team';

/**
 * API base URL
 * NOW USING CENTRAL BACKEND (port 3000) for all M3 data
 */
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

// Normalize base URL (remove trailing /api if present to avoid double /api/api/)
const normalizedBaseURL = API_BASE_URL.replace(/\/api\/?$/, '');
console.log('[teamService] API Base URL:', normalizedBaseURL, '(original:', API_BASE_URL, ')');
console.log('[teamService] NOW USING CENTRAL BACKEND (NestJS) at port 3000');

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
		console.log('[teamService] Request with token:', config.url, 'Token:', token.substring(0, 20) + '...');
	} else {
		console.warn('[teamService] ⚠️ No authentication token found in localStorage. Keys checked: access_token, accessToken, token, authToken');
		console.warn('[teamService] All localStorage keys:', Object.keys(localStorage));
	}
	
	// If sending FormData, remove Content-Type header so Axios sets it with boundary
	if (config.data instanceof FormData && config.headers) {
		delete (config.headers as any)['Content-Type'];
		console.log('[teamService] Removed Content-Type for FormData upload');
	}
	
	return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
	(response) => {
		console.log('[teamService] ✅ Response received:', response.status, response.config.url);
		return response;
	},
	(error) => {
		console.error('[teamService] ❌ Response error:', error.response?.status, error.config?.url);
		console.error('[teamService] Error details:', {
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			message: error.message,
		});
		console.error('[teamService] Full error response data:', JSON.stringify(error.response?.data, null, 2));
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
		if (status === 404) return 'Resource not found.';
		if (status === 403) return 'You do not have permission to perform this action.';
		if (status === 409) return 'Conflict: The resource cannot be modified due to related data.';
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
 * GET /api/teams/
 * Paginated list with optional filters and search.
 */
export async function getAllTeams(
	params?: TeamQueryParams,
): Promise<PaginatedResponse<TeamListItem>> {
	try {
		const url = `/api/teams${toQuery(params as any)}`;
		console.log('[teamService] Fetching teams from Central Backend:', url);
		const { data } = await api.get<PaginatedResponse<TeamListItem>>(url);
		console.log('[teamService] Teams fetched successfully:', data);
		return data;
	} catch (error) {
		console.error('[teamService] Error fetching teams:', error);
		const errorMessage = handleApiError(error);
		console.error('[teamService] Error message:', errorMessage);
		throw new Error(errorMessage);
	}
}

/**
 * GET /api/teams/{id}
 */
export async function getTeamById(id: number): Promise<Team> {
	try {
		const { data } = await api.get<Team>(`/api/teams/${id}`);
		return data;
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

/**
 * Helper to construct FormData for create/update.
 */
function buildTeamFormData(payload: TeamCreateUpdate): FormData {
	const form = new FormData();
	form.append('name', payload.name);
	form.append('location', payload.location);
	if (payload.founded_year !== undefined && payload.founded_year !== null) {
		form.append('founded_year', String(payload.founded_year));
	}
	
	// Debug logo type
	console.log('[teamService] buildTeamFormData - logo:', {
		hasLogo: !!payload.logo,
		isFile: payload.logo instanceof File,
		isBlob: payload.logo instanceof Blob,
		type: payload.logo?.constructor?.name,
		name: (payload.logo as any)?.name,
		size: (payload.logo as any)?.size
	});
	
	// Check if it's a File or Blob (browser-image-compression returns File, but check both)
	if (payload.logo instanceof Blob) {
		// Always create a clean filename with proper extension (avoid spaces, special chars)
		const fileExtension = payload.logo.type.split('/')[1] || 'jpg';
		const cleanFileName = `team_logo.${fileExtension}`;
		
		// Always create a new File with clean name (avoids issues with spaces/special chars)
		const fileWithCleanName = new File([payload.logo], cleanFileName, { 
			type: payload.logo.type,
			lastModified: Date.now()
		});
		
		form.append('logo', fileWithCleanName);
		console.log('[teamService] Including logo file in FormData:', cleanFileName, fileWithCleanName.size, 'bytes', 'type:', fileWithCleanName.type);
	} else {
		console.log('[teamService] No logo file to append (keeping existing or no logo)');
	}
	return form;
}

/**
 * POST /api/teams
 */
export async function createTeam(data: TeamCreateUpdate): Promise<Team> {
	try {
		const form = buildTeamFormData(data);
		console.log('[teamService] Sending POST request to /api/teams');
		console.log('[teamService] FormData entries:', Array.from(form.entries()));
		// Don't set Content-Type manually - let Axios handle it with boundary
		const resp = await api.post<Team>(`/api/teams`, form);
		console.log('[teamService] Team created successfully:', resp.data);
		console.log('[teamService] Created team logo URL:', resp.data.logo);
		return resp.data;
	} catch (error: any) {
		console.error('[teamService] Create team ERROR:', {
			message: error.message,
			response: error.response?.data,
			status: error.response?.status,
			headers: error.response?.headers,
			fullError: error
		});
		throw new Error(handleApiError(error));
	}
}

/**
 * PUT /api/teams/{id}
 */
export async function updateTeam(id: number, data: TeamCreateUpdate): Promise<Team> {
	try {
		const form = buildTeamFormData(data);
		// Don't set Content-Type manually - let Axios handle it with boundary
		const resp = await api.put<Team>(`/api/teams/${id}`, form);
		console.log('[teamService] Team updated successfully:', resp.data);
		console.log('[teamService] Updated team logo URL:', resp.data.logo);
		return resp.data;
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

/**
 * DELETE /api/teams/{id}
 */
export async function deleteTeam(id: number): Promise<void> {
	try {
		await api.delete(`/api/teams/${id}`);
	} catch (error) {
		const message = handleApiError(error);
		// Preserve specific message for 409 conflict if provided
		throw new Error(message);
	}
}

/**
 * GET /api/teams/{id}/players
 */
export async function getTeamPlayers(id: number): Promise<PaginatedResponse<any>> {
	try {
		const { data } = await api.get<PaginatedResponse<any>>(`/api/teams/${id}/players`);
		return data;
	} catch (error) {
		throw new Error(handleApiError(error));
	}
}

export default {
	getAllTeams,
	getTeamById,
	createTeam,
	updateTeam,
	deleteTeam,
	getTeamPlayers,
};


