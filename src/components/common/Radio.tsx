import React from 'react';

/**
 * Radio Component Props
 */
export interface RadioProps {
  /**
   * Label text displayed next to the radio button
   */
  label?: string;
  /**
   * Description text displayed below the label
   */
  description?: string;
  /**
   * Whether the radio button is selected
   */
  checked?: boolean;
  /**
   * Callback when radio button is selected
   */
  onChange?: () => void;
  /**
   * Error message
   */
  error?: string;
  /**
   * Whether the radio button is disabled
   */
  disabled?: boolean;
  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * HTML name attribute (must be the same for radio group)
   */
  name: string;
  /**
   * HTML value attribute
   */
  value: string | number;
  /**
   * Additional className
   */
  className?: string;
  /**
   * HTML id attribute
   */
  id?: string;
}

/**
 * Radio Component
 * 
 * A beautiful, accessible radio button component with custom styling.
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Label with optional description
 * - Error state
 * - Smooth animations
 * - Focus states
 * - Keyboard accessible
 * - Radio group support
 * 
 * @example
 * ```tsx
 * // Basic radio button
 * <Radio
 *   name="position"
 *   value="GK"
 *   label="Goalkeeper"
 *   checked={position === "GK"}
 *   onChange={() => setPosition("GK")}
 * />
 * 
 * // Radio with description
 * <Radio
 *   name="role"
 *   value="player"
 *   label="Player"
 *   description="I am a player looking to showcase my skills"
 *   checked={role === "player"}
 *   onChange={() => setRole("player")}
 * />
 * 
 * // Radio group example
 * <div>
 *   <Radio name="team" value="home" label="Home Team" checked={team === "home"} onChange={() => setTeam("home")} />
 *   <Radio name="team" value="away" label="Away Team" checked={team === "away"} onChange={() => setTeam("away")} />
 * </div>
 * ```
 */
const Radio: React.FC<RadioProps> = ({
  label,
  description,
  checked = false,
  onChange,
  error,
  disabled,
  size = 'md',
  name,
  value,
  className = '',
  id,
}) => {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  // Size classes
  const sizeClasses = {
    sm: {
      radio: 'w-4 h-4',
      dot: 'w-1.5 h-1.5',
      label: 'text-sm',
    },
    md: {
      radio: 'w-5 h-5',
      dot: 'w-2 h-2',
      label: 'text-base',
    },
    lg: {
      radio: 'w-6 h-6',
      dot: 'w-3 h-3',
      label: 'text-lg',
    },
  };

  const currentSize = sizeClasses[size];

  // Handle change
  const handleChange = (_e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && !disabled) {
      onChange();
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-start gap-3">
        {/* Radio Input */}
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="radio"
            id={radioId}
            name={name}
            value={value}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${radioId}-error` : description ? `${radioId}-description` : undefined}
          />
          
          {/* Custom Radio */}
          <label
            htmlFor={radioId}
            className={`
              ${currentSize.radio}
              flex
              items-center
              justify-center
              border-2
              rounded-full
              transition-all
              duration-200
              ease-in-out
              cursor-pointer
              ${
                error
                  ? 'border-red-500'
                  : checked
                  ? 'border-blue-600'
                  : 'border-gray-300'
              }
              ${
                disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'
              }
            `}
          >
            {/* Radio Dot */}
            {checked && (
              <span
                className={`
                  ${currentSize.dot}
                  rounded-full
                  bg-blue-600
                  animate-scale-up
                `}
              />
            )}
          </label>
        </div>

        {/* Label and Description */}
        {label && (
          <div className="flex-1">
            <label
              htmlFor={radioId}
              className={`
                ${currentSize.label}
                font-medium
                cursor-pointer
                select-none
                ${
                  disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : error
                    ? 'text-red-600'
                    : 'text-gray-700'
                }
              `}
            >
              {label}
            </label>
            {description && (
              <p
                id={`${radioId}-description`}
                className="mt-1 text-sm text-gray-500"
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p
          id={`${radioId}-error`}
          className="mt-2 text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </p>
      )}

      <style>{`
        @keyframes scale-up {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Radio;

