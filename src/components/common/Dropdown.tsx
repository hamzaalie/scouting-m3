import React, { useState, useRef, useEffect } from 'react';

/**
 * Dropdown Item Definition
 */
export interface DropdownItem {
  /**
   * Unique key for the item
   */
  key: string;
  /**
   * Item label/text (optional if divider is true)
   */
  label?: string;
  /**
   * Optional icon to display before label
   */
  icon?: React.ReactNode;
  /**
   * Whether the item is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether the item is a divider/separator
   * @default false
   */
  divider?: boolean;
  /**
   * Callback when item is clicked
   */
  onClick?: () => void;
  /**
   * Item variant/style
   */
  variant?: 'default' | 'danger';
}

/**
 * Dropdown Component Props
 */
export interface DropdownProps {
  /**
   * Trigger element (button, icon, etc.) that opens the dropdown
   */
  trigger: React.ReactNode;
  /**
   * Array of dropdown items
   */
  items: DropdownItem[];
  /**
   * Dropdown position relative to trigger
   * @default 'bottom-left'
   */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  /**
   * Additional CSS classes for dropdown menu
   */
  className?: string;
  /**
   * Close dropdown after item click
   * @default true
   */
  closeOnClick?: boolean;
}

/**
 * Dropdown Component
 * 
 * A beautiful dropdown menu component with keyboard navigation.
 * 
 * Features:
 * - Click to open/close
 * - Close on outside click
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Multiple positions (bottom-left, bottom-right, top-left, top-right)
 * - Smooth animations (fade + slide)
 * - Icons support
 * - Disabled items
 * - Dividers/separators
 * - Variants (default, danger)
 * 
 * @example
 * ```tsx
 * // Basic dropdown
 * <Dropdown
 *   trigger={<Button>Actions</Button>}
 *   items={[
 *     { key: 'edit', label: 'Edit', onClick: handleEdit },
 *     { key: 'delete', label: 'Delete', onClick: handleDelete, variant: 'danger' },
 *   ]}
 * />
 * 
 * // With icons and dividers
 * <Dropdown
 *   trigger={<button>Menu</button>}
 *   items={[
 *     { key: 'profile', label: 'Profile', icon: <UserIcon />, onClick: handleProfile },
 *     { key: 'settings', label: 'Settings', icon: <SettingsIcon />, onClick: handleSettings },
 *     { key: 'divider1', divider: true },
 *     { key: 'logout', label: 'Logout', icon: <LogoutIcon />, onClick: handleLogout, variant: 'danger' },
 *   ]}
 *   position="bottom-right"
 * />
 * 
 * // User menu dropdown
 * <Dropdown
 *   trigger={<Avatar user={user} />}
 *   items={[
 *     { key: 'profile', label: 'My Profile', onClick: handleProfile },
 *     { key: 'settings', label: 'Settings', onClick: handleSettings },
 *     { key: 'divider', divider: true },
 *     { key: 'logout', label: 'Logout', onClick: handleLogout },
 *   ]}
 * />
 * ```
 */
const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  position = 'bottom-left',
  className = '',
  closeOnClick = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Filter out dividers for keyboard navigation
  const navigableItems = items.filter((item) => !item.divider);
  const firstNavigableIndex = items.findIndex((item) => !item.divider);
  const lastNavigableIndex = items.length - 1 - [...items].reverse().findIndex((item) => !item.divider);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          triggerRef.current?.focus();
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (focusedIndex === -1) {
            setFocusedIndex(firstNavigableIndex);
          } else {
            const currentNavigableIndex = items.slice(0, focusedIndex + 1).filter((item) => !item.divider).length - 1;
            const nextNavigableItem = navigableItems[currentNavigableIndex + 1];
            if (nextNavigableItem) {
              const nextIndex = items.findIndex((item) => item.key === nextNavigableItem.key);
              setFocusedIndex(nextIndex);
            } else {
              setFocusedIndex(firstNavigableIndex);
            }
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (focusedIndex === -1) {
            setFocusedIndex(lastNavigableIndex);
          } else {
            const currentNavigableIndex = items.slice(0, focusedIndex).filter((item) => !item.divider).length - 1;
            if (currentNavigableIndex >= 0) {
              const prevNavigableItem = navigableItems[currentNavigableIndex];
              if (prevNavigableItem) {
                const prevIndex = items.findIndex((item) => item.key === prevNavigableItem.key);
                setFocusedIndex(prevIndex);
              } else {
                setFocusedIndex(lastNavigableIndex);
              }
            } else {
              setFocusedIndex(lastNavigableIndex);
            }
          }
          break;

        case 'Enter':
        case ' ':
          if (focusedIndex >= 0 && navigableItems[focusedIndex]) {
            e.preventDefault();
            const item = navigableItems[focusedIndex];
            if (!item.disabled && item.onClick) {
              item.onClick();
              if (closeOnClick) {
                setIsOpen(false);
                setFocusedIndex(-1);
              }
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, items, navigableItems, firstNavigableIndex, lastNavigableIndex, closeOnClick]);

  // Position classes
  const positionClasses = {
    'bottom-left': 'top-full left-0 mt-1',
    'bottom-right': 'top-full right-0 mt-1',
    'top-left': 'bottom-full left-0 mb-1',
    'top-right': 'bottom-full right-0 mb-1',
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(firstNavigableIndex >= 0 ? firstNavigableIndex : -1);
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled || item.divider || !item.onClick) return;

    item.onClick();
    if (closeOnClick) {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={handleToggle}
        className="cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute
            z-50
            min-w-[180px]
            bg-white
            rounded-lg
            shadow-lg
            border
            border-gray-200
            py-1
            transform
            transition-all
            duration-200
            ${positionClasses[position]}
            ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
            ${className}
          `}
          role="menu"
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={item.key}
                  className="my-1 border-t border-gray-200"
                  role="separator"
                />
              );
            }

            const isFocused = index === focusedIndex;
            const isDanger = item.variant === 'danger';

            return (
              <button
                key={item.key}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`
                  w-full
                  px-4
                  py-2
                  text-left
                  text-sm
                  flex
                  items-center
                  gap-2
                  transition-colors
                  duration-150
                  ${
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : isDanger
                      ? isFocused
                        ? 'bg-red-50 text-red-700'
                        : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                      : isFocused
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                role="menuitem"
                tabIndex={-1}
              >
                {item.icon && (
                  <span className={`flex-shrink-0 ${isDanger ? 'text-red-600' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

