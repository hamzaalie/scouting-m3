import React, { useMemo } from 'react';

/**
 * VideoEmbed Component Props
 */
export interface VideoEmbedProps {
	/**
	 * Video URL (YouTube, Vimeo, VEO, or direct link)
	 */
	url: string;
	/**
	 * Optional title for the video
	 */
	title?: string;
	/**
	 * Whether to autoplay the video (default: false)
	 */
	autoplay?: boolean;
	/**
	 * Custom className for styling
	 */
	className?: string;
}

/**
 * Video platform types
 */
type VideoPlatform = 'youtube' | 'vimeo' | 'veo' | 'direct' | 'unknown';

/**
 * Video embedding result
 */
interface VideoEmbedData {
	platform: VideoPlatform;
	embedUrl?: string;
	videoId?: string;
	error?: string;
}

/**
 * Extract YouTube video ID from URL
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
const extractYouTubeId = (url: string): string | null => {
	const patterns = [
		/(?:youtube\.com\/watch\?v=)([^&]+)/,
		/(?:youtu\.be\/)([^?]+)/,
		/(?:youtube\.com\/embed\/)([^?]+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match && match[1]) {
			return match[1];
		}
	}

	return null;
};

/**
 * Extract Vimeo video ID from URL
 * Supports:
 * - https://vimeo.com/VIDEO_ID
 * - https://player.vimeo.com/video/VIDEO_ID
 */
const extractVimeoId = (url: string): string | null => {
	const patterns = [
		/(?:vimeo\.com\/)(\d+)/,
		/(?:player\.vimeo\.com\/video\/)(\d+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match && match[1]) {
			return match[1];
		}
	}

	return null;
};

/**
 * Detect video platform and extract embed data
 */
const parseVideoUrl = (url: string): VideoEmbedData => {
	if (!url || url.trim() === '') {
		return { platform: 'unknown', error: 'No URL provided' };
	}

	const lowerUrl = url.toLowerCase();

	// YouTube
	if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
		const videoId = extractYouTubeId(url);
		if (videoId) {
			return {
				platform: 'youtube',
				videoId,
				embedUrl: `https://www.youtube.com/embed/${videoId}`,
			};
		}
		return { platform: 'unknown', error: 'Invalid YouTube URL' };
	}

	// Vimeo
	if (lowerUrl.includes('vimeo.com')) {
		const videoId = extractVimeoId(url);
		if (videoId) {
			return {
				platform: 'vimeo',
				videoId,
				embedUrl: `https://player.vimeo.com/video/${videoId}`,
			};
		}
		return { platform: 'unknown', error: 'Invalid Vimeo URL' };
	}

	// VEO
	if (lowerUrl.includes('veo.co') || lowerUrl.includes('app.veo.co')) {
		return {
			platform: 'veo',
			embedUrl: url,
		};
	}

	// Direct video link (mp4, webm, ogg)
	if (
		lowerUrl.endsWith('.mp4') ||
		lowerUrl.endsWith('.webm') ||
		lowerUrl.endsWith('.ogg') ||
		lowerUrl.includes('.mp4?') ||
		lowerUrl.includes('.webm?') ||
		lowerUrl.includes('.ogg?')
	) {
		return {
			platform: 'direct',
			embedUrl: url,
		};
	}

	// Unknown platform - try as iframe anyway
	return {
		platform: 'unknown',
		embedUrl: url,
	};
};

/**
 * VideoEmbed Component
 *
 * Embeds video from various platforms:
 * - YouTube: Converts watch URLs to embed URLs
 * - Vimeo: Converts regular URLs to player URLs
 * - VEO: Embeds directly
 * - Direct links: Uses HTML5 video player
 *
 * Features:
 * - Responsive 16:9 aspect ratio
 * - Autoplay support
 * - Error handling
 * - Platform detection
 */
const VideoEmbed: React.FC<VideoEmbedProps> = ({
	url,
	title,
	autoplay = false,
	className = '',
}) => {
	// Parse video URL
	const videoData = useMemo(() => parseVideoUrl(url), [url]);

	// Build iframe src with autoplay parameter if needed
	const iframeSrc = useMemo(() => {
		if (!videoData.embedUrl) return '';

		const autoplayParam = autoplay ? '1' : '0';

		switch (videoData.platform) {
			case 'youtube':
				return `${videoData.embedUrl}?autoplay=${autoplayParam}&rel=0`;
			case 'vimeo':
				return `${videoData.embedUrl}?autoplay=${autoplayParam}`;
			case 'veo':
			case 'unknown':
				return videoData.embedUrl;
			default:
				return videoData.embedUrl;
		}
	}, [videoData, autoplay]);

	// Error state
	if (videoData.error) {
		return (
			<div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
				<svg
					className="w-12 h-12 mx-auto text-red-400 mb-3"
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
				<p className="text-red-800 font-medium">Invalid Video URL</p>
				<p className="text-red-600 text-sm mt-1">{videoData.error}</p>
			</div>
		);
	}

	// Direct video (HTML5 player)
	if (videoData.platform === 'direct') {
		return (
			<div className={`relative w-full ${className}`} style={{ paddingBottom: '56.25%' }}>
				<video
					className="absolute top-0 left-0 w-full h-full rounded-lg"
					controls
					autoPlay={autoplay}
					src={videoData.embedUrl}
					title={title || 'Video'}
				>
					<p className="text-red-600">Your browser does not support the video tag.</p>
				</video>
			</div>
		);
	}

	// Iframe embed (YouTube, Vimeo, VEO)
	return (
		<div className={`relative w-full ${className}`} style={{ paddingBottom: '56.25%' }}>
			<iframe
				className="absolute top-0 left-0 w-full h-full rounded-lg"
				src={iframeSrc}
				title={title || 'Video'}
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			/>
		</div>
	);
};

export default VideoEmbed;

