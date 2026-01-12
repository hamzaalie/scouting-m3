import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * useFocusTrap Hook
 * 
 * Traps keyboard focus within a container element (e.g., modal, dialog).
 * Prevents Tab and Shift+Tab from moving focus outside the container.
 * 
 * @param containerRef - Ref to the container element
 * @param isActive - Whether the focus trap is active
 * 
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(modalRef, isOpen);
 * 
 * return (
 *   <div ref={modalRef} role="dialog">
 *     {/* Modal content *\/}
 *   </div>
 * );
 * ```
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean
): void {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Get all focusable elements within the container
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      const elements = container.querySelectorAll<HTMLElement>(focusableSelectors);
      return Array.from(elements).filter(
        (el) => el.offsetParent !== null // Filter out hidden elements
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: Moving backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: Moving forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus first focusable element when trap activates
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, isActive]);
}

