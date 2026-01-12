import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import Card from '../../components/common/Card';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

/**
 * Register Page Component
 * 
 * Beautiful full-screen registration page with:
 * - Gradient background (blue to purple)
 * - Centered white card with shadow
 * - Logo/title at top
 * - Smooth fade-in animation on load
 * - Responsive design
 */
const RegisterPage: React.FC = () => {
  const { t } = useTranslation();

  // Fade-in animation on mount
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-purple-700/90">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Logo/Title Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg p-2">
                <img src="/LOGO.png" alt="iDA - Football Scouting Platform" className="h-full w-full object-contain" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('auth.joinPlatform')}</h1>
            <p className="text-white/80 text-lg">{t('auth.createAccountToStart')}</p>
          </div>

          {/* Register Card */}
          <div className="animate-fade-in-up">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <RegisterForm />
            </Card>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center animate-fade-in">
            <p className="text-white/80 text-sm">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link
                to="/login"
                className="font-semibold text-white hover:text-white/90 underline underline-offset-2 transition-colors"
              >
                {t('auth.signInHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
