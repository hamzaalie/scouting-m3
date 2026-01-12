import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * User Role Type
 */
export type UserRole = 'admin' | 'player' | 'scout';

/**
 * Role Selector Component Props
 */
interface RoleSelectorProps {
  /**
   * Currently selected role
   */
  value?: UserRole;
  /**
   * Callback when role changes
   */
  onChange: (role: UserRole) => void;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Label text
   */
  label?: string;
  /**
   * Disable the selector
   */
  disabled?: boolean;
}

/**
 * Role Information Configuration (Icons and Colors only)
 */
const ROLE_CONFIG: Record<
  UserRole,
  {
    icon: React.ReactNode;
    color: string;
    hoverColor: string;
    borderColor: string;
  }
> = {
  admin: {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    color: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100',
    borderColor: 'border-purple-500',
  },
  player: {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    color: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    borderColor: 'border-blue-500',
  },
  scout: {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    color: 'bg-green-50',
    hoverColor: 'hover:bg-green-100',
    borderColor: 'border-green-500',
  },
};

/**
 * Role Selector Component
 * 
 * A beautiful card-based radio button group for selecting user roles.
 * Features:
 * - Three role cards (Admin, Player, Scout)
 * - Icon and description for each role
 * - Selected state styling
 * - Hover effects
 * - Error state support
 * - Responsive design
 * - Accessible keyboard navigation
 * 
 * @example
 * ```tsx
 * <RoleSelector
 *   label="Select Role"
 *   value={selectedRole}
 *   onChange={setSelectedRole}
 *   error={errors.role}
 *   required
 * />
 * ```
 */
const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  error,
  required,
  label,
  disabled,
}) => {
  const { t } = useTranslation();
  const roles: UserRole[] = ['admin', 'player', 'scout'];

  const handleRoleChange = (role: UserRole) => {
    if (!disabled) {
      onChange(role);
    }
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Role Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        role="radiogroup"
        aria-label={label || 'Select role'}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
      >
        {roles.map((role) => {
          const roleConfig = ROLE_CONFIG[role];
          const roleTitle = t(`auth.role${role.charAt(0).toUpperCase() + role.slice(1)}`);
          const roleDescription = t(`auth.role${role.charAt(0).toUpperCase() + role.slice(1)}Description`);
          const isSelected = value === role;

          return (
            <div
              key={role}
              role="radio"
              aria-checked={isSelected}
              tabIndex={disabled ? -1 : 0}
              onClick={() => handleRoleChange(role)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRoleChange(role);
                }
              }}
              className={`
                relative
                flex
                flex-col
                items-center
                p-4
                border-2
                rounded-xl
                cursor-pointer
                transition-all
                duration-200
                ease-in-out
                ${
                  isSelected
                    ? `${roleConfig.borderColor} ${roleConfig.color} shadow-md scale-[1.02]`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
                ${roleConfig.hoverColor}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-offset-2
              `}
            >
              {/* Selection Indicator */}
              <div
                className={`
                  absolute
                  top-2
                  right-2
                  w-5
                  h-5
                  rounded-full
                  border-2
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-200
                  ${
                    isSelected
                      ? `${roleConfig.borderColor} bg-white`
                      : 'border-gray-300 bg-white'
                  }
                `}
              >
                {isSelected && (
                  <div
                    className={`w-3 h-3 rounded-full ${
                      role === 'admin'
                        ? 'bg-purple-500'
                        : role === 'player'
                        ? 'bg-blue-500'
                        : 'bg-green-500'
                    }`}
                  />
                )}
              </div>

              {/* Icon */}
              <div
                className={`
                  mb-3
                  ${
                    isSelected
                      ? role === 'admin'
                        ? 'text-purple-600'
                        : role === 'player'
                        ? 'text-blue-600'
                        : 'text-green-600'
                      : 'text-gray-400'
                  }
                  transition-colors
                  duration-200
                `}
              >
                {roleConfig.icon}
              </div>

              {/* Title */}
              <h3
                className={`
                  text-base
                  font-semibold
                  mb-1
                  ${
                    isSelected ? 'text-gray-900' : 'text-gray-700'
                  }
                  transition-colors
                  duration-200
                `}
              >
                {roleTitle}
              </h3>

              {/* Description */}
              <p
                className={`
                  text-xs
                  text-center
                  ${
                    isSelected ? 'text-gray-600' : 'text-gray-500'
                  }
                  transition-colors
                  duration-200
                `}
              >
                {roleDescription}
              </p>

              {/* Input (hidden, for form submission) */}
              <input
                type="radio"
                name="role"
                value={role}
                checked={isSelected}
                onChange={() => handleRoleChange(role)}
                className="sr-only"
                disabled={disabled}
                required={required}
              />
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <p
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
          {error}
        </p>
      )}
    </div>
  );
};

export default RoleSelector;

