import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer Component
 * 
 * Simple, clean footer component with copyright and optional links.
 * 
 * Features:
 * - Copyright notice
 * - Optional navigation links
 * - Responsive design
 * - Clean styling
 * 
 * @example
 * ```tsx
 * // Basic footer
 * <Footer />
 * ```
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-gray-600">
            © {currentYear} iDA. All rights reserved.
          </p>

          {/* Optional Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/contact"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


