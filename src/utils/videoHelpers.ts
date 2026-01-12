import type { VideoPlatform } from '../types/match';

/**
 * Regex patterns for video URL validation
 */
const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
const VIMEO_REGEX = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i;
const VEO_REGEX = /(?:veo\.co|veo\.io|veo\.com)/i; // VEO pattern (adjust based on actual domain)

/**
 * Check if a URL is a valid YouTube URL
 * 
 * @param url - Video URL to validate
 * @returns true if valid YouTube URL format
 */
export function isValidYouTubeUrl(url: string): boolean {
	if (!url || typeof url !== 'string') return false;
	return YOUTUBE_REGEX.test(url);
}

/**
 * Check if a URL is a valid Vimeo URL
 * 
 * @param url - Video URL to validate
 * @returns true if valid Vimeo URL format
 */
export function isValidVimeoUrl(url: string): boolean {
	if (!url || typeof url !== 'string') return false;
	return VIMEO_REGEX.test(url);
}

/**
 * Check if a URL is a valid VEO URL
 * 
 * @param url - Video URL to validate
 * @returns true if valid VEO URL format
 */
export function isValidVeoUrl(url: string): boolean {
	if (!url || typeof url !== 'string') return false;
	return VEO_REGEX.test(url);
}

/**
 * Extract video ID from YouTube URL
 * 
 * @param url - YouTube URL
 * @returns Video ID string or null if invalid
 * @example
 * extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ") // "dQw4w9WgXcQ"
 */
export function extractYouTubeId(url: string): string | null {
	if (!url || typeof url !== 'string') return null;
	const match = url.match(YOUTUBE_REGEX);
	return match ? match[1] : null;
}

/**
 * Extract video ID from Vimeo URL
 * 
 * @param url - Vimeo URL
 * @returns Video ID string or null if invalid
 * @example
 * extractVimeoId("https://vimeo.com/123456789") // "123456789"
 */
export function extractVimeoId(url: string): string | null {
	if (!url || typeof url !== 'string') return null;
	const match = url.match(VIMEO_REGEX);
	return match ? match[1] : null;
}

/**
 * Generate embed URL for video based on platform
 * 
 * @param url - Original video URL
 * @param platform - Video platform type
 * @returns Embeddable iframe URL or null if invalid
 */
export function getEmbedUrl(url: string, platform: VideoPlatform): string | null {
	if (!url || typeof url !== 'string') return null;

	switch (platform) {
		case 'YouTube': {
			const videoId = extractYouTubeId(url);
			return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
		}
		case 'Vimeo': {
			const videoId = extractVimeoId(url);
			return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
		}
		case 'VEO':
			// VEO URLs are typically direct embed links
			return url;
		case 'Other':
			// For other platforms, return original URL
			return url;
		default:
			return null;
	}
}

/**
 * Validate video URL against selected platform
 * 
 * @param url - Video URL to validate
 * @param platform - Video platform type
 * @returns Validation result with valid flag and optional reason
 * @example
 * validateVideoUrl("https://youtube.com/watch?v=123", "YouTube") // { valid: true }
 * validateVideoUrl("https://youtube.com/watch?v=123", "Vimeo") // { valid: false, reason: "URL doesn't match Vimeo format" }
 */
export function validateVideoUrl(
	url: string,
	platform: VideoPlatform
): { valid: boolean; reason?: string } {
	// Empty URL is valid (video is optional)
	if (!url || url.trim() === '') {
		return { valid: true };
	}

	switch (platform) {
		case 'YouTube':
			if (!isValidYouTubeUrl(url)) {
				return { valid: false, reason: "URL doesn't match YouTube format" };
			}
			return { valid: true };

		case 'Vimeo':
			if (!isValidVimeoUrl(url)) {
				return { valid: false, reason: "URL doesn't match Vimeo format" };
			}
			return { valid: true };

		case 'VEO':
			if (!isValidVeoUrl(url)) {
				return { valid: false, reason: "URL doesn't match VEO format" };
			}
			return { valid: true };

		case 'Other':
			// For "Other" platform, just check if it's a valid URL format
			try {
				new URL(url);
				return { valid: true };
			} catch {
				return { valid: false, reason: 'Invalid URL format' };
			}

		default:
			return { valid: false, reason: 'Unknown platform' };
	}
}

