import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Button from '../common/Button';
import type { VideoPlatform } from '../../types/match';
import { getEmbedUrl, isValidYouTubeUrl, isValidVimeoUrl, isValidVeoUrl } from '../../utils/videoHelpers';

/**
 * VideoPreviewModal Component Props
 */
export interface VideoPreviewModalProps {
	/**
	 * Whether the modal is open
	 */
	isOpen: boolean;
	/**
	 * Callback when modal should close
	 */
	onClose: () => void;
	/**
	 * Video platform type
	 */
	platform: VideoPlatform;
	/**
	 * Original video URL
	 */
	videoUrl: string;
	/**
	 * Match information for display
	 */
	matchInfo: {
		homeTeam: string;
		awayTeam: string;
		matchDate: string;
	};
}

/**
 * VideoPreviewModal Component
 *
 * Modal for previewing embedded match videos.
 * Supports YouTube, Vimeo, VEO, and Other platforms.
 * 
 * Features:
 * - Embedded video player with 16:9 aspect ratio
 * - Platform-specific iframe configuration
 * - Match information display
 * - Error handling for invalid URLs
 * - Responsive design
 */
const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
	isOpen,
	onClose,
	platform,
	videoUrl,
	matchInfo,
}) => {
	const { t } = useTranslation();

	// Auto-detect platform from URL if platform is "Other"
	const detectedPlatform = useMemo((): VideoPlatform => {
		if (!videoUrl || videoUrl.trim() === '') {
			return platform;
		}

		// If platform is already set correctly, use it
		if (platform !== 'Other') {
			return platform;
		}

		// Auto-detect platform from URL
		if (isValidYouTubeUrl(videoUrl)) {
			return 'YouTube';
		}
		if (isValidVimeoUrl(videoUrl)) {
			return 'Vimeo';
		}
		if (isValidVeoUrl(videoUrl)) {
			return 'VEO';
		}

		// Keep as "Other" if we can't detect
		return 'Other';
	}, [videoUrl, platform]);

	// Generate embed URL using detected platform
	const embedUrl = useMemo(() => {
		if (!videoUrl || videoUrl.trim() === '') {
			return null;
		}
		return getEmbedUrl(videoUrl, detectedPlatform);
	}, [videoUrl, detectedPlatform]);

	// Check if embed is available
	const canEmbed = useMemo(() => {
		// Only show "Other" message if we truly can't embed (not a known platform)
		if (detectedPlatform === 'Other') {
			return false; // Show link instead of embed
		}
		return embedUrl !== null;
	}, [detectedPlatform, embedUrl]);

	// Format match date
	const formattedDate = useMemo(() => {
		try {
			const date = new Date(matchInfo.matchDate);
			return date.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		} catch {
			return matchInfo.matchDate;
		}
	}, [matchInfo.matchDate]);

	// Handle opening video in new tab
	const handleOpenInNewTab = () => {
		if (videoUrl) {
			window.open(videoUrl, '_blank', 'noopener,noreferrer');
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={t('matches.matchVideo')}
			size="lg"
			footer={{
				secondary: {
					label: t('common.close'),
					onClick: onClose,
					variant: 'outline',
				},
			}}
		>
			<div className="space-y-4">
				{/* Video Embed Section */}
				<div>
					{canEmbed && embedUrl ? (
						<div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-200">
							<iframe
								src={embedUrl}
								className="absolute inset-0 w-full h-full"
								allow={
									detectedPlatform === 'YouTube'
										? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
										: detectedPlatform === 'Vimeo'
										? 'autoplay; fullscreen; picture-in-picture'
										: 'autoplay; fullscreen'
								}
								allowFullScreen
								title={`${matchInfo.homeTeam} vs ${matchInfo.awayTeam} - Match Video`}
								loading="lazy"
							/>
						</div>
					) : detectedPlatform === 'Other' ? (
						<div className="w-full aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
							<div className="text-center space-y-4 p-6">
								<svg
									className="w-16 h-16 mx-auto text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<div>
									<p className="text-gray-600 font-medium mb-2">{t('matches.videoPreviewNotAvailable')}</p>
									<p className="text-sm text-gray-500 mb-4">
										{t('matches.platformNoEmbed')}
									</p>
									<Button variant="primary" onClick={handleOpenInNewTab}>
										{t('matches.openVideo')}
									</Button>
								</div>
							</div>
						</div>
					) : (
						<div className="w-full aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
							<div className="text-center space-y-4 p-6">
								<svg
									className="w-16 h-16 mx-auto text-red-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<div>
									<p className="text-gray-600 font-medium mb-2">{t('matches.unableToLoadVideo')}</p>
									<p className="text-sm text-gray-500 mb-4">
										{t('matches.videoUrlProcessingError')}
									</p>
									<Button variant="primary" onClick={handleOpenInNewTab}>
										{t('matches.openVideoNewTab')}
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Match Info Section */}
				<div className="pt-4 border-t border-gray-200">
					<div className="space-y-1 text-sm text-gray-600">
						<p className="font-medium text-gray-900">
							{t('matches.match')}: <span className="font-normal">{matchInfo.homeTeam}</span> vs{' '}
							<span className="font-normal">{matchInfo.awayTeam}</span>
						</p>
						<p>
							{t('matches.date')}: <span className="text-gray-500">{formattedDate}</span>
						</p>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default VideoPreviewModal;

