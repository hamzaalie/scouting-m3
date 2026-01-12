import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';

/**
 * ConfirmDialog Component Props
 */
export interface ConfirmDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;
  /**
   * Dialog title
   */
  title: string;
  /**
   * Confirmation message
   */
  message: string;
  /**
   * Callback when user confirms
   */
  onConfirm: () => void;
  /**
   * Callback when user cancels
   */
  onCancel: () => void;
  /**
   * Whether this is a danger action (delete, etc.)
   * @default false
   */
  danger?: boolean;
  /**
   * Confirm button label
   * @default 'Confirm'
   */
  confirmLabel?: string;
  /**
   * Cancel button label
   * @default 'Cancel'
   */
  cancelLabel?: string;
  /**
   * Whether confirm button is in loading state
   * @default false
   */
  loading?: boolean;
}

/**
 * ConfirmDialog Component
 * 
 * A modal-based confirmation dialog for destructive actions and confirmations.
 * 
 * Features:
 * - Modal-based (uses Modal component)
 * - Danger variant (red styling for destructive actions)
 * - Loading state for confirm button
 * - Customizable labels
 * - Close on ESC key
 * - Close on backdrop click (optional)
 * 
 * @example
 * ```tsx
 * // Basic confirmation
 * <ConfirmDialog
 *   isOpen={isOpen}
 *   title="Confirm Action"
 *   message="Are you sure you want to proceed with this action?"
 *   onConfirm={handleConfirm}
 *   onCancel={() => setIsOpen(false)}
 * />
 * 
 * // Delete confirmation (danger variant)
 * <ConfirmDialog
 *   isOpen={isOpen}
 *   title="Delete Player"
 *   message="Are you sure you want to delete this player? This action cannot be undone."
 *   onConfirm={handleDelete}
 *   onCancel={() => setIsOpen(false)}
 *   danger
 *   confirmLabel="Delete"
 *   loading={isDeleting}
 * />
 * 
 * // Custom labels
 * <ConfirmDialog
 *   isOpen={isOpen}
 *   title="Save Changes"
 *   message="You have unsaved changes. Do you want to save them before leaving?"
 *   onConfirm={handleSave}
 *   onCancel={handleCancel}
 *   confirmLabel="Save"
 *   cancelLabel="Discard"
 * />
 * ```
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  danger = false,
  confirmLabel,
  cancelLabel,
  loading = false,
}) => {
  const { t } = useTranslation();
  
  // Use translation keys as defaults if not provided
  const defaultConfirmLabel = confirmLabel || t('common.confirm');
  const defaultCancelLabel = cancelLabel || t('common.cancel');
  
  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="md"
      closeOnBackdropClick={!loading}
      closeOnEsc={!loading}
      footer={{
        secondary: {
          label: defaultCancelLabel,
          onClick: onCancel,
          variant: 'outline',
        },
        primary: {
          label: defaultConfirmLabel,
          onClick: handleConfirm,
          variant: danger ? 'danger' : 'primary',
          loading: loading,
        },
      }}
    >
      <div className="py-4">
        {/* Danger Icon */}
        {danger && (
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Message */}
        <p className={`text-center ${danger ? 'text-gray-700' : 'text-gray-600'}`}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

