import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Select Option Interface
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

/**
 * Select Component Props
 */
export interface SelectProps {
  /**
   * Label text displayed above the select
   */
  label?: string;
  /**
   * Options to display in the dropdown
   */
  options: SelectOption[];
  /**
   * Current selected value(s)
   */
  value?: string | number | (string | number)[];
  /**
   * Callback when selection changes
   */
  onChange: (value: string | number | (string | number)[]) => void;
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;
  /**
   * Error message displayed below the select
   */
  error?: string;
  /**
   * Helper text displayed below the select
   */
  helperText?: string;
  /**
   * Whether multiple selections are allowed
   * @default false
   */
  multiSelect?: boolean;
  /**
   * Whether to show search functionality
   * @default false
   */
  searchable?: boolean;
  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * Custom render function for options
   */
  renderOption?: (option: SelectOption) => React.ReactNode;
  /**
   * Custom render function for selected value
   */
  renderValue?: (selected: SelectOption | SelectOption[]) => React.ReactNode;
  /**
   * Additional className
   */
  className?: string;
}

/**
 * Select Component
 * 
 * A beautiful, accessible select component with advanced features.
 * Features:
 * - Single and multi-select support
 * - Searchable dropdown
 * - Custom option rendering
 * - Error states
 * - Helper text
 * - Keyboard navigation
 * - Smooth animations
 * 
 * @example
 * ```tsx
 * // Basic select
 * <Select
 *   label="Team"
 *   options={teams}
 *   value={selectedTeam}
 *   onChange={(value) => setSelectedTeam(value)}
 *   placeholder="Select a team"
 * />
 * 
 * // Multi-select with search
 * <Select
 *   label="Positions"
 *   options={positions}
 *   value={selectedPositions}
 *   onChange={(value) => setSelectedPositions(value)}
 *   multiSelect
 *   searchable
 *   placeholder="Select positions"
 * />
 * 
 * // With custom rendering
 * <Select
 *   label="Player"
 *   options={players}
 *   value={selectedPlayer}
 *   onChange={(value) => setSelectedPlayer(value)}
 *   renderOption={(option) => (
 *     <div className="flex items-center gap-2">
 *       <Avatar src={option.avatar} />
 *       <span>{option.label}</span>
 *     </div>
 *   )}
 * />
 * ```
 */
const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  error,
  helperText,
  multiSelect = false,
  searchable = false,
  size = 'md',
  required,
  disabled,
  renderOption,
  renderValue,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current && isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [isOpen]);

  // Update position when dropdown opens or window scrolls/resizes
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
    }
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen, updateDropdownPosition]);

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get selected option(s)
  const getSelectedOptions = (): SelectOption | SelectOption[] | null => {
    if (multiSelect) {
      const selectedValues = Array.isArray(value) ? value : [];
      return options.filter((opt) => selectedValues.includes(opt.value));
    } else {
      return options.find((opt) => opt.value === value) || null;
    }
  };

  const selectedOptions = getSelectedOptions();
  const hasSelection = multiSelect
    ? Array.isArray(selectedOptions) && selectedOptions.length > 0
    : selectedOptions !== null;

  // Size classes
  const sizeClasses = {
    sm: 'py-1.5 text-sm',
    md: 'py-2.5 text-base',
    lg: 'py-3 text-lg',
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideSelect = selectRef.current && selectRef.current.contains(target);
      const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);
      
      if (!clickedInsideSelect && !clickedInsideDropdown) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      // Use 'click' instead of 'mousedown' to ensure option buttons can handle clicks first
      document.addEventListener('click', handleClickOutside);
      // Focus search input when dropdown opens
      if (searchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, searchable]);

  // Handle option selection
  const handleSelect = (option: SelectOption, e?: React.MouseEvent) => {
    // Stop propagation to prevent click-outside handler from interfering
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (option.disabled || disabled) return;

    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.includes(option.value);

      if (isSelected) {
        onChange(currentValues.filter((v) => v !== option.value));
      } else {
        onChange([...currentValues, option.value]);
      }
    } else {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Check if option is selected
  const isSelected = (option: SelectOption): boolean => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      return currentValues.includes(option.value);
    }
    return option.value === value;
  };

  // Render selected value
  const renderSelectedValue = () => {
    if (renderValue && selectedOptions) {
      return renderValue(selectedOptions);
    }

    if (!hasSelection) {
      return <span className="text-gray-400">{placeholder}</span>;
    }

    if (multiSelect && Array.isArray(selectedOptions)) {
      if (selectedOptions.length === 0) {
        return <span className="text-gray-400">{placeholder}</span>;
      }
      if (selectedOptions.length === 1) {
        return <span>{selectedOptions[0].label}</span>;
      }
      return <span>{selectedOptions.length} items selected</span>;
    }

    if (!multiSelect && selectedOptions && !Array.isArray(selectedOptions)) {
      return <span>{selectedOptions.label}</span>;
    }

    return <span className="text-gray-400">{placeholder}</span>;
  };

  // Render option
  const renderOptionItem = (option: SelectOption) => {
    if (renderOption) {
      return renderOption(option);
    }

    return (
      <div className="flex items-center gap-2">
        {option.icon && <div className="flex-shrink-0">{option.icon}</div>}
        <div className="flex-1">
          <div className="font-medium">{option.label}</div>
          {option.description && (
            <div className="text-xs text-gray-500">{option.description}</div>
          )}
        </div>
        {multiSelect && (
          <div className="flex-shrink-0">
            {isSelected(option) && (
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )}
      </div>
    );
  };

  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
  const helperId = error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined;

  return (
    <div className={`w-full ${className}`} ref={selectRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Select Button */}
        <button
          ref={buttonRef}
          type="button"
          id={selectId}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full
            ${sizeClasses[size]}
            px-4
            text-left
            border
            rounded-lg
            bg-white
            transition-all
            duration-200
            ease-in-out
            focus:outline-none
            focus:ring-2
            focus:ring-offset-0
            flex
            items-center
            justify-between
            ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500'
            }
            disabled:bg-gray-50
            disabled:text-gray-500
            disabled:cursor-not-allowed
          `}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-describedby={helperId}
        >
          <span className="flex-1 truncate">{renderSelectedValue()}</span>
          <svg
            className={`w-5 h-5 ml-2 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown - rendered via portal to avoid overflow clipping */}
        {isOpen && createPortal(
          <div 
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden"
          >
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={(e) => handleSelect(option, e)}
                    disabled={option.disabled}
                    className={`
                      w-full
                      px-4
                      py-2.5
                      text-left
                      transition-colors
                      duration-150
                      ${
                        isSelected(option)
                          ? 'bg-blue-50 text-blue-900'
                          : 'hover:bg-gray-50 text-gray-900'
                      }
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${!multiSelect && isSelected(option) ? 'font-medium' : ''}
                    `}
                  >
                    {renderOptionItem(option)}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Helper Text / Error Message */}
      <div className="mt-1.5">
        {error && (
          <p
            id={`${selectId}-error`}
            className="text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5"
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
        {!error && helperText && (
          <p id={`${selectId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>

      {/* Multi-select badges */}
      {multiSelect && hasSelection && Array.isArray(selectedOptions) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md"
            >
              {option.label}
              <button
                type="button"
                onClick={(e) => handleSelect(option, e)}
                className="hover:text-blue-900 focus:outline-none"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;

