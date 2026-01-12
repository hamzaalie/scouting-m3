import imageCompression from 'browser-image-compression';

/**
 * Image Compression Options
 */
export interface CompressionOptions {
	/**
	 * Maximum file size in MB
	 * @default 0.5
	 */
	maxSizeMB?: number;
	/**
	 * Maximum width or height in pixels
	 * @default 1024
	 */
	maxWidthOrHeight?: number;
	/**
	 * Use web worker for better performance
	 * @default true
	 */
	useWebWorker?: boolean;
}

/**
 * Compress Image Before Upload
 * 
 * Reduces image file size while maintaining quality for faster uploads
 * and better server storage efficiency.
 * 
 * Features:
 * - Automatic compression to target size (default 500KB)
 * - Maintains aspect ratio
 * - Resizes large images (default max 1024px)
 * - Uses web worker for non-blocking compression
 * - Fallback to original file if compression fails
 * 
 * @param file - Original image file from file input
 * @param options - Compression options (optional)
 * @returns Promise<File> - Compressed image file
 * 
 * @example
 * ```typescript
 * const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = event.target.files?.[0];
 *   if (!file) return;
 *   
 *   try {
 *     const compressed = await compressImage(file, {
 *       maxSizeMB: 0.5,
 *       maxWidthOrHeight: 1024
 *     });
 *     // Upload compressed file
 *     await uploadImage(compressed);
 *   } catch (error) {
 *     console.error('Compression failed:', error);
 *   }
 * };
 * ```
 */
export const compressImage = async (
	file: File,
	options: CompressionOptions = {}
): Promise<File> => {
	const defaultOptions = {
		maxSizeMB: 0.5, // Max 500KB
		maxWidthOrHeight: 1024, // Max dimension 1024px
		useWebWorker: true, // Use web worker for better performance
		...options,
	};

	try {
		console.log(`[Image Compression] Starting compression for: ${file.name}`);
		console.log(`[Image Compression] Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

		const compressedFile = await imageCompression(file, defaultOptions);

		console.log(`[Image Compression] Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
		console.log(`[Image Compression] Reduction: ${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`);

		return compressedFile;
	} catch (error) {
		console.error('[Image Compression] Compression failed:', error);
		console.warn('[Image Compression] Returning original file as fallback');
		// Return original file if compression fails (graceful degradation)
		return file;
	}
};

/**
 * Validate Image File
 * 
 * Checks if the file is a valid image and within size limits.
 * 
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns Object with isValid boolean and error message if invalid
 * 
 * @example
 * ```typescript
 * const { isValid, error } = validateImage(file);
 * if (!isValid) {
 *   showError(t(error));
 *   return;
 * }
 * ```
 */
export const validateImage = (
	file: File,
	maxSizeMB: number = 5
): { isValid: boolean; error?: string } => {
	// Check if file is an image
	if (!file.type.startsWith('image/')) {
		return {
			isValid: false,
			error: 'common.invalidImageType',
		};
	}

	// Check file size
	const fileSizeMB = file.size / 1024 / 1024;
	if (fileSizeMB > maxSizeMB) {
		return {
			isValid: false,
			error: 'common.imageTooLarge',
		};
	}

	return { isValid: true };
};

