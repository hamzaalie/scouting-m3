import React, { useEffect, useRef } from 'react';
import Button from './Button';
import { useFocusTrap } from '../../hooks/useFocusTrap';

/**
 * Modal Component Props
 */
export interface ModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Modal title (displayed in header)
   */
  title?: string;
  /**
   * Modal content
   */
  children: React.ReactNode;
  /**
   * Modal size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Footer actions (buttons)
   */
  footer?: {
    primary?: {
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'danger';
      loading?: boolean;
    };
    secondary?: {
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'outline';
    };
  };
  /**
   * Close modal when clicking backdrop
   * @default true
   */
  closeOnBackdropClick?: boolean;
  /**
   * Close modal on ESC key press
   * @default true
   */
  closeOnEsc?: boolean;
  /**
   * Show close button in header
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Additional CSS classes for modal content
   */
  className?: string;
}

/**
 * Modal Component
 * 
 * A beautiful, accessible modal dialog component with animations.
 * 
 * Features:
 * - Backdrop overlay with blur effect
 * - Smooth animations (fade in + scale)
 * - Multiple sizes (sm, md, lg, xl)
 * - Header with title and close button
 * - Footer section for actions
 * - Close on backdrop click
 * - Close on ESC key
 * - Focus management
 * - Body scroll lock when open
 * 
 * @example
 * ```tsx
 * // Basic modal
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Edit Player"
 * >
 *   <p>Modal content goes here</p>
 * </Modal>
 * 
 * // Modal with footer actions
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Confirm Action"
 *   footer={{
 *     primary: {
 *       label: "Save",
 *       onClick: handleSave,
 *       variant: "primary",
 *     },
 *     secondary: {
 *       label: "Cancel",
 *       onClick: handleClose,
 *     },
 *   }}
 * >
 *   <p>Are you sure you want to save?</p>
 * </Modal>
 * 
 * // Large modal
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Player Details"
 *   size="xl"
 * >
 *   <div>Large content here</div>
 * </Modal>
 * ```
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Trap focus within modal when open
  useFocusTrap(modalRef, isOpen);

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      // Save previous active element for focus restoration
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else {
      // Restore scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }

      // Restore focus
      previousActiveElement.current?.focus();
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop - Semi-transparent dark overlay with blur */}
      <div
        className="fixed inset-0 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleBackdropClick}
        aria-hidden="true"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-end md:items-center justify-center p-0 md:p-4">
        {/* Modal Content */}
        <div
          ref={modalRef}
          className={`
            relative
            w-full
            h-full
            md:h-auto
            ${sizeClasses[size]}
            bg-white
            rounded-t-2xl
            md:rounded-xl
            shadow-2xl
            transform
            transition-all
            duration-300
            flex
            flex-col
            ${isOpen ? 'translate-y-0 md:scale-100 opacity-100' : 'translate-y-full md:translate-y-0 md:scale-95 opacity-0'}
            ${className}
          `}
          tabIndex={-1}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 flex-shrink-0">
              {title && (
                <h3
                  id="modal-title"
                  className="text-lg md:text-xl font-semibold text-gray-900"
                >
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    ml-auto
                    text-gray-400
                    hover:text-gray-600
                    transition-colors
                    duration-150
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    rounded-lg
                    p-1
                    min-h-[44px]
                    min-w-[44px]
                    flex
                    items-center
                    justify-center
                  "
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex-shrink-0 flex items-center justify-end gap-3 px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl md:rounded-b-xl sticky bottom-0">
              {footer.secondary && (
                <Button
                  variant={footer.secondary.variant || 'outline'}
                  onClick={footer.secondary.onClick}
                  className="min-h-[44px] touch-manipulation"
                >
                  {footer.secondary.label}
                </Button>
              )}
              {footer.primary && (
                <Button
                  variant={footer.primary.variant || 'primary'}
                  onClick={footer.primary.onClick}
                  loading={footer.primary.loading}
                  className="min-h-[44px] touch-manipulation"
                >
                  {footer.primary.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;

