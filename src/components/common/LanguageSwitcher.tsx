import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Language Switcher Component
 * 
 * Dropdown component for switching between available languages.
 * 
 * Features:
 * - Shows current language (EN | FR)
 * - Click to switch languages
 * - Updates i18n language
 * - Saves preference to localStorage
 * - Flag icons for visual identification
 */
const LanguageSwitcher: React.FC = () => {
	const { i18n } = useTranslation();

	const languages = [
		{ code: 'en', name: 'English', flag: '🇬🇧' },
		{ code: 'fr', name: 'Français', flag: '🇫🇷' },
	];

	const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

	const handleLanguageChange = (langCode: string) => {
		i18n.changeLanguage(langCode);
		// Language preference is automatically saved to localStorage by i18next-browser-languagedetector
	};

	return (
		<div className="relative group">
			<button
				type="button"
				className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-white/95 backdrop-blur-sm rounded-lg transition-colors shadow-lg border border-gray-200"
				aria-label="Change language"
			>
				<span className="text-lg">{currentLanguage.flag}</span>
				<span className="hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
				<svg
					className="w-4 h-4 text-gray-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{/* Dropdown Menu */}
			<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
				{/* Invisible bridge to prevent closing when moving cursor over the gap */}
				<div className="absolute -top-2 left-0 w-full h-2 bg-transparent" />
				<div className="py-1">
					{languages.map((lang) => (
						<button
							key={lang.code}
							type="button"
							onClick={() => handleLanguageChange(lang.code)}
							className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${i18n.language === lang.code ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
								}`}
						>
							<span className="text-lg">{lang.flag}</span>
							<span>{lang.name}</span>
							{i18n.language === lang.code && (
								<svg
									className="w-4 h-4 ml-auto text-indigo-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							)}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default LanguageSwitcher;

