import React from 'react';
import { getMediaUrl } from '../../utils/mediaUrl';

/**
 * Avatar Component Props
 */
interface AvatarProps {
  /**
   * Image source URL (can be relative or absolute)
   */
  src?: string | null;
  /**
   * Alt text for the image
   */
  alt?: string;
  /**
   * Avatar size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Fallback text (usually initials)
   */
  fallback?: string;
  /**
   * Show border around avatar
   * @default false
   */
  border?: boolean;
  /**
   * Border color when border is enabled
   * @default 'gray-300'
   */
  borderColor?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Avatar Component
 * 
 * A circular avatar component with image support and fallback to initials.
 * 
 * Features:
 * - Circular image display
 * - Fallback to colored background with initials if no image
 * - Multiple sizes
 * - Optional border
 * - Smooth transitions
 * 
 * @example
 * ```tsx
 * // With image
 * <Avatar src="/path/to/image.jpg" alt="John Doe" />
 * 
 * // With fallback initials
 * <Avatar fallback="JD" size="lg" />
 * 
 * // With border
 * <Avatar src="/image.jpg" border borderColor="blue-500" />
 * 
 * // Small avatar
 * <Avatar fallback="A" size="sm" />
 * ```
 */
const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  fallback,
  border = false,
  borderColor = 'gray-300',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const [imageError, setImageError] = React.useState(false);
  
  // Build full media URL if src is a relative path
  const fullImageUrl = React.useMemo(() => getMediaUrl(src), [src]);
  
  // Reset image error when src changes
  React.useEffect(() => {
    setImageError(false);
  }, [src]);
  
  const showFallback = !fullImageUrl || imageError;

  // Generate initials from alt text if fallback not provided
  const getInitials = () => {
    if (fallback) return fallback;
    if (alt) {
      const words = alt.trim().split(' ');
      if (words.length >= 2) {
        return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
      }
      return alt.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  // Border classes based on borderColor prop (using full class names for Tailwind)
  const getBorderClasses = () => {
    if (!border) return '';
    const borderColorMap: Record<string, string> = {
      'gray-300': 'border-2 border-gray-300',
      'blue-500': 'border-2 border-blue-500',
      'green-500': 'border-2 border-green-500',
      'red-500': 'border-2 border-red-500',
      'purple-500': 'border-2 border-purple-500',
    };
    return borderColorMap[borderColor] || 'border-2 border-gray-300';
  };

  const avatarContent = showFallback ? (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-gradient-to-br
        from-blue-500
        to-purple-600
        flex
        items-center
        justify-center
        text-white
        font-semibold
        ${getBorderClasses()}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {getInitials()}
    </div>
  ) : (
    <img
      src={fullImageUrl}
      alt={alt}
      loading="lazy"
      onError={() => setImageError(true)}
      className={`
        ${sizeClasses[size]}
        rounded-full
        object-cover
        ${getBorderClasses()}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    />
  );

  return (
    <div className="relative inline-block">
      {avatarContent}
    </div>
  );
};

export default Avatar;

