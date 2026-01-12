/**
 * Media URL Utilities
 * 
 * Helper functions to construct full URLs for media files (images, videos)
 * served by the Django backend.
 */

/**
 * Get the API base URL
 */
export const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
  // Remove trailing /api if present
  return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * Build full media URL from relative path
 * 
 * @param relativePath - Relative path from backend (e.g., "/media/profile_pictures/image.jpg")
 * @returns Full URL (e.g., "http://localhost:8000/media/profile_pictures/image.jpg")
 * 
 * @example
 * ```ts
 * const fullUrl = getMediaUrl('/media/profile_pictures/user.jpg');
 * // Returns: 'http://localhost:8000/media/profile_pictures/user.jpg'
 * ```
 */
export const getMediaUrl = (relativePath?: string | null): string | undefined => {
  if (!relativePath) return undefined;
  
  // If already a full URL (http://, https://, or blob:), return as-is
  if (relativePath.startsWith('http://') || 
      relativePath.startsWith('https://') || 
      relativePath.startsWith('blob:') ||
      relativePath.startsWith('data:')) {
    return relativePath;
  }
  
  // Build full URL for relative paths
  const baseUrl = getApiBaseUrl();
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  return `${baseUrl}${cleanPath}`;
};

/**
 * Get profile picture URL
 * Convenience wrapper for profile pictures specifically
 */
export const getProfilePictureUrl = (profilePicture?: string | null): string | undefined => {
  return getMediaUrl(profilePicture);
};

