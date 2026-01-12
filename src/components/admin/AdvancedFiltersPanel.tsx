import React from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * Advanced Filters Panel Props
 */
export interface AdvancedFiltersPanelProps {
	/**
	 * Whether the panel is visible
	 */
	isOpen: boolean;
	/**
	 * Current filter values
	 */
	filters: {
		nationality: string;
		ageMin: number | null;
		ageMax: number | null;
	};
	/**
	 * Callback when any filter changes
	 */
	onChange: (field: 'nationality' | 'ageMin' | 'ageMax', value: string | number | null) => void;
	/**
	 * Callback when clear button is clicked
	 */
	onClear: () => void;
	/**
	 * Whether the form is disabled (e.g., during loading)
	 */
	disabled?: boolean;
}

/**
 * AdvancedFiltersPanel Component
 * 
 * Reusable collapsible panel for advanced filtering.
 * Features:
 * - Smooth expand/collapse animation
 * - Responsive grid layout
 * - Nationality input with suggestions
 * - Age range inputs
 * - Clear filters button
 * - Professional styling
 * 
 * @example
 * ```tsx
 * <AdvancedFiltersPanel
 *   isOpen={showAdvancedFilters}
 *   filters={{ nationality: 'France', ageMin: 18, ageMax: 35 }}
 *   onChange={(field, value) => handleFilterChange(field, value)}
 *   onClear={handleClearAdvanced}
 *   disabled={loading}
 * />
 * ```
 */
const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
	isOpen,
	filters,
	onChange,
	onClear,
	disabled = false,
}) => {
	// Don't render if not open
	if (!isOpen) return null;

	return (
		<div 
			className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in overflow-hidden"
			style={{
				animation: 'slideDown 300ms ease-out',
			}}
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-semibold text-gray-700">
					Advanced Filters
				</h3>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onClear}
					disabled={disabled}
				>
					Clear Advanced Filters
				</Button>
			</div>

			{/* Filter Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* Nationality Filter */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Nationality
					</label>
					<Input
						type="text"
						placeholder="e.g., France, Brazil, Spain..."
						value={filters.nationality}
						onChange={(e) => onChange('nationality', e.target.value)}
						disabled={disabled}
					/>
					<p className="mt-1 text-xs text-gray-500">
						Search by player nationality
					</p>
				</div>

				{/* Age Min */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Min Age
					</label>
					<Input
						type="number"
						placeholder="e.g., 18"
						min="16"
						max="50"
						value={filters.ageMin !== null ? String(filters.ageMin) : ''}
						onChange={(e) => onChange('ageMin', e.target.value ? Number(e.target.value) : null)}
						disabled={disabled}
					/>
					<p className="mt-1 text-xs text-gray-500">
						Minimum player age
					</p>
				</div>

				{/* Age Max */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Max Age
					</label>
					<Input
						type="number"
						placeholder="e.g., 35"
						min="16"
						max="50"
						value={filters.ageMax !== null ? String(filters.ageMax) : ''}
						onChange={(e) => onChange('ageMax', e.target.value ? Number(e.target.value) : null)}
						disabled={disabled}
					/>
					<p className="mt-1 text-xs text-gray-500">
						Maximum player age
					</p>
				</div>
			</div>

			{/* Age Range Display */}
			{(filters.ageMin !== null || filters.ageMax !== null) && (
				<div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
					<div className="flex items-center gap-2">
						<svg
							className="w-4 h-4 text-blue-600 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span className="text-sm text-blue-800">
							Filtering players aged {filters.ageMin || '16'} to {filters.ageMax || '50'} years
						</span>
					</div>
				</div>
			)}

			{/* Inline CSS for animation */}
			<style>{`
				@keyframes slideDown {
					from {
						opacity: 0;
						transform: translateY(-10px);
						max-height: 0;
					}
					to {
						opacity: 1;
						transform: translateY(0);
						max-height: 500px;
					}
				}
			`}</style>
		</div>
	);
};

export default AdvancedFiltersPanel;

