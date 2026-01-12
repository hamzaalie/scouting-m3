import React, { useState, useMemo } from 'react';
import Input from './Input';
import type { InputProps } from './Input';

/**
 * Password Input Component Props
 * Extends Input component props
 */
interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightElement'> {
  /**
   * Show password strength meter
   * @default true
   */
  showStrengthMeter?: boolean;
  /**
   * Minimum password length for strength calculation
   * @default 8
   */
  minLength?: number;
}

/**
 * Password Strength Levels
 */
type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

/**
 * Calculate password strength based on various criteria
 */
const calculatePasswordStrength = (
  password: string,
  minLength: number = 8
): PasswordStrength => {
  if (!password) return 'weak';

  let strength = 0;

  // Length check
  if (password.length >= minLength) strength += 1;
  if (password.length >= 12) strength += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) strength += 1; // Lowercase
  if (/[A-Z]/.test(password)) strength += 1; // Uppercase
  if (/\d/.test(password)) strength += 1; // Numbers
  if (/[^a-zA-Z\d]/.test(password)) strength += 1; // Special characters

  // Determine strength level
  if (strength <= 2) return 'weak';
  if (strength === 3) return 'fair';
  if (strength === 4) return 'good';
  return 'strong';
};

/**
 * Get strength meter color and width
 */
const getStrengthMeterStyles = (strength: PasswordStrength) => {
  switch (strength) {
    case 'weak':
      return {
        color: 'bg-red-500',
        width: '25%',
        text: 'Weak',
        textColor: 'text-red-600',
      };
    case 'fair':
      return {
        color: 'bg-orange-500',
        width: '50%',
        text: 'Fair',
        textColor: 'text-orange-600',
      };
    case 'good':
      return {
        color: 'bg-yellow-500',
        width: '75%',
        text: 'Good',
        textColor: 'text-yellow-600',
      };
    case 'strong':
      return {
        color: 'bg-green-500',
        width: '100%',
        text: 'Strong',
        textColor: 'text-green-600',
      };
  }
};

/**
 * Password Input Component
 * 
 * A specialized input component for passwords with:
 * - Show/hide password toggle
 * - Password strength meter
 * - Eye icon for visibility toggle
 * - Inherits all Input component features
 * 
 * @example
 * ```tsx
 * <PasswordInput
 *   label="Password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 *   showStrengthMeter
 *   required
 * />
 * ```
 */
const PasswordInput: React.FC<PasswordInputProps> = ({
  showStrengthMeter = true,
  minLength = 8,
  value,
  onChange,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Calculate password strength
  const passwordValue = typeof value === 'string' ? value : '';
  const strength = useMemo(
    () => calculatePasswordStrength(passwordValue, minLength),
    [passwordValue, minLength]
  );
  const strengthStyles = useMemo(
    () => getStrengthMeterStyles(strength),
    [strength]
  );

  // Toggle password visibility
  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full">
      <Input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        rightElement={
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleVisibility();
            }}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        }
        {...props}
      />

      {/* Password Strength Meter */}
      {showStrengthMeter && passwordValue && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Password strength:</span>
            <span className={`font-medium ${strengthStyles.textColor}`}>
              {strengthStyles.text}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`${strengthStyles.color} h-full transition-all duration-300 ease-out rounded-full`}
              style={{ width: strengthStyles.width }}
              role="progressbar"
              aria-valuenow={
                strength === 'weak' ? 25 : strength === 'fair' ? 50 : strength === 'good' ? 75 : 100
              }
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Password strength: ${strength}`}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {passwordValue.length < minLength && (
              <span>At least {minLength} characters required</span>
            )}
            {passwordValue.length >= minLength && strength === 'weak' && (
              <span>Add uppercase, numbers, or special characters</span>
            )}
            {passwordValue.length >= minLength && strength === 'fair' && (
              <span>Consider adding more character variety</span>
            )}
            {passwordValue.length >= minLength && strength === 'good' && (
              <span>Good password! Make it longer for extra security</span>
            )}
            {strength === 'strong' && <span>Excellent password!</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;

