import type { NavigateFunction } from 'react-router-dom';
import { showError } from './toast';

/**
 * API Error Response Type
 */
export interface ApiError {
	response?: {
		status?: number;
		data?: any;
	};
	message?: string;
}

/**
 * Handles API errors with proper HTTP status code routing
 * 
 * @param error - The error object from the API call
 * @param t - Translation function from useTranslation
 * @param navigate - Navigate function from useNavigate (optional)
 * @param fallbackMessage - Custom fallback error message (optional)
 * @returns Field-specific errors for form validation (if any)
 */
export const handleApiError = (
	error: any,
	t: (key: string) => string,
	navigate?: NavigateFunction,
	fallbackMessage?: string
): Record<string, string> | null => {
	console.error('API Error:', error);

	const status = error?.response?.status;
	const errorData = error?.response?.data;

	// Handle specific HTTP status codes with user-friendly messages
	if (status === 401) {
		// Unauthorized - show generic message, don't expose token details
		const message = t('errors.sessionExpired');
		showError(message);
		if (navigate) {
			navigate('/login');
		}
		return null;
	}

	if (status === 403) {
		// Forbidden - show user-friendly access denied message
		const message = t('errors.accessDenied');
		showError(message);
		return null;
	}

	if (status === 404) {
		// Not found - generic message
		const message = t('errors.resourceNotFound');
		showError(message);
		return null;
	}

	if (status >= 500) {
		// Server error - don't expose technical details
		const message = t('errors.serverError');
		showError(message);
		return null;
	}

	if (status === 400 && errorData) {
		// Validation errors - return field-specific errors
		const fieldErrors: Record<string, string> = {};
		
		for (const [key, value] of Object.entries(errorData)) {
			if (Array.isArray(value) && value.length > 0) {
				fieldErrors[key] = value[0];
			} else if (typeof value === 'string') {
				fieldErrors[key] = value;
			}
		}

		// Show general validation error message
		if (Object.keys(fieldErrors).length > 0) {
			showError(t('errors.fixValidationErrors'));
			return fieldErrors;
		}
	}

	// Network error
	if (!error?.response && error?.message) {
		if (error.message.toLowerCase().includes('network')) {
			showError(t('errors.networkError'));
			return null;
		}
	}

	// Default error message
	const message = fallbackMessage || error?.message || t('errors.somethingWentWrong');
	showError(message);
	return null;
};

/**
 * Checks if user is online before making API calls
 * Shows error if offline
 * 
 * @param t - Translation function
 * @returns true if online, false if offline
 */
export const checkOnlineStatus = (t: (key: string) => string): boolean => {
	if (!navigator.onLine) {
		showError(t('errors.networkError'));
		return false;
	}
	return true;
};

