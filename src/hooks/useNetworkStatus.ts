import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showError, showSuccess } from '../utils/toast';

/**
 * Network Status Detection Hook
 * 
 * Detects when user goes offline/online.
 * Shows toast notifications for connection changes.
 * Provides current online status.
 * 
 * @returns {boolean} isOnline - Current network status
 */
export const useNetworkStatus = () => {
	const { t } = useTranslation();
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [wasOffline, setWasOffline] = useState(false);

	useEffect(() => {
		const handleOnline = () => {
			setIsOnline(true);
			// Only show "connection restored" if we were previously offline
			if (wasOffline) {
				showSuccess(t('errors.connectionRestored'));
				setWasOffline(false);
			}
		};

		const handleOffline = () => {
			setIsOnline(false);
			setWasOffline(true);
			showError(t('errors.networkError'));
		};

		// Add event listeners
		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		// Cleanup
		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [t, wasOffline]);

	return isOnline;
};

