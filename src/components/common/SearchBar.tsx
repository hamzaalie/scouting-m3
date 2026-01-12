import React, { useState, useEffect, useRef } from 'react';
import { debounce } from '../../utils/helpers';
import LoadingSpinner from './LoadingSpinner';

/**
 * SearchBar Component Props
 */
export interface SearchBarProps {
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Callback when search is performed
   * @param searchTerm - The search term
   */
  onSearch?: (searchTerm: string) => void;
  /**
   * Whether to show loading spinner
   * @default false
   */
  loading?: boolean;
  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceMs?: number;
  /**
   * Initial search value
   */
  defaultValue?: string;
  /**
   * Controlled search value
   */
  value?: string;
  /**
   * Callback when value changes (for controlled component)
   */
  onChange?: (value: string) => void;
  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Additional className
   */
  className?: string;
  /**
   * HTML id attribute
   */
  id?: string;
  /**
   * Whether the search bar is disabled
   */
  disabled?: boolean;
  /**
   * Custom icon on the left (defaults to search icon)
   */
  icon?: React.ReactNode;
  /**
   * Show clear button
   * @default true
   */
  showClearButton?: boolean;
}

/**
 * SearchBar Component
 * 
 * A beautiful search bar component with debounced search and loading states.
 * Features:
 * - Debounced search (300ms default)
 * - Loading spinner
 * - Clear button
 * - Search icon
 * - Multiple sizes
 * - Smooth transitions
 * - Focus states
 * 
 * @example
 * ```tsx
 * // Basic search bar
 * <SearchBar
 *   placeholder="Search players..."
 *   onSearch={(term) => handleSearch(term)}
 * />
 * 
 * // With loading state
 * <SearchBar
 *   placeholder="Search matches..."
 *   onSearch={(term) => handleSearch(term)}
 *   loading={isSearching}
 * />
 * 
 * // With custom debounce
 * <SearchBar
 *   placeholder="Search teams..."
 *   onSearch={(term) => handleSearch(term)}
 *   debounceMs={500}
 * />
 * 
 * // Controlled component
 * <SearchBar
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   onSearch={handleSearch}
 * />
 * ```
 */
const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  loading = false,
  debounceMs = 300,
  defaultValue = '',
  value: controlledValue,
  onChange,
  size = 'md',
  className = '',
  id,
  disabled,
  icon,
  showClearButton = true,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use controlled value if provided, otherwise use internal state
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  // Create debounced search function
  const debouncedSearch = useRef(
    debounce((searchTerm: string) => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, debounceMs)
  ).current;

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Update value
    if (isControlled && onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }

    // Trigger debounced search
    debouncedSearch(newValue);
  };

  // Handle clear
  const handleClear = () => {
    if (isControlled && onChange) {
      onChange('');
    } else {
      setInternalValue('');
    }

    // Clear search
    if (onSearch) {
      onSearch('');
    }

    // Focus input after clear
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      // Debounce cleanup is handled by the debounce function
    };
  }, []);

  // Size classes
  const sizeClasses = {
    sm: {
      input: 'py-1.5 px-10 text-sm',
      icon: 'w-4 h-4',
      iconLeft: 'left-3',
      iconRight: 'right-3',
    },
    md: {
      input: 'py-2.5 px-12 text-base',
      icon: 'w-5 h-5',
      iconLeft: 'left-4',
      iconRight: 'right-4',
    },
    lg: {
      input: 'py-3 px-14 text-lg',
      icon: 'w-6 h-6',
      iconLeft: 'left-5',
      iconRight: 'right-5',
    },
  };

  const currentSize = sizeClasses[size];
  const hasValue = currentValue.length > 0;
  const showClear = showClearButton && hasValue && !loading && !disabled;

  // Default search icon
  const defaultIcon = (
    <svg
      className={currentSize.icon}
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
  );

  const searchId = id || `search-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Icon */}
      <div className={`absolute inset-y-0 left-0 flex items-center pointer-events-none text-gray-400 ${currentSize.iconLeft}`}>
        {loading ? (
          <div className={currentSize.icon}>
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <div className={currentSize.icon}>
            {icon || defaultIcon}
          </div>
        )}
      </div>

      {/* Input */}
      <input
        ref={searchInputRef}
        type="text"
        id={searchId}
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full
          ${currentSize.input}
          border
          border-gray-300
          rounded-lg
          bg-white
          text-gray-900
          placeholder:text-gray-400
          transition-all
          duration-200
          ease-in-out
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:border-blue-500
          disabled:bg-gray-50
          disabled:text-gray-500
          disabled:cursor-not-allowed
          ${showClear ? 'pr-10' : ''}
        `}
      />

      {/* Clear Button */}
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          className={`
            absolute
            inset-y-0
            right-0
            flex
            items-center
            ${currentSize.iconRight}
            text-gray-400
            hover:text-gray-600
            focus:outline-none
            focus:text-gray-600
            transition-colors
            duration-150
          `}
          aria-label="Clear search"
        >
          <svg
            className={currentSize.icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;

