import React, { useState } from 'react';
import type { Position } from '../../types/player';
import type { TeamListItem } from '../../types/team';

/**
 * Filter state interface
 */
export interface FilterState {
	search: string;
	positions: Position[];
	teams: number[];
	ageMin: string;
	ageMax: string;
	nationality: string;
	goalsMin: string;
	assistsMin: string;
	matchesMin: string;
}

/**
 * Advanced Filters Panel Props
 */
export interface AdvancedFiltersPanelProps {
	/**
	 * Callback when filters change
	 */
	onFilterChange: (filters: FilterState) => void;
	/**
	 * Initial filter values
	 */
	initialFilters?: Partial<FilterState>;
	/**
	 * List of teams for team filter
	 */
	teams: TeamListItem[];
	/**
	 * Whether the panel is collapsible (for mobile)
	 * @default false
	 */
	collapsible?: boolean;
}

/**
 * Advanced Filters Panel Component
 * 
 * Reusable filter panel for player discovery with:
 * - Search by name
 * - Position filters (GK, DF, MF, FW)
 * - Team multi-select
 * - Age range
 * - Nationality
 * - Stats filters (goals, assists, matches)
 * - Collapsible sections for mobile
 * - Active filters badge
 */
const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
	onFilterChange,
	initialFilters = {},
	teams,
	collapsible = false,
}) => {
	// Filter state
	const [filters, setFilters] = useState<FilterState>({
		search: '',
		positions: [],
		teams: [],
		ageMin: '',
		ageMax: '',
		nationality: '',
		goalsMin: '',
		assistsMin: '',
		matchesMin: '',
		...initialFilters,
	});

	// Collapsible sections state (for mobile)
	const [expandedSections, setExpandedSections] = useState<Set<string>>(
		new Set(['search', 'position', 'team'])
	);

	// Update filters and notify parent
	const updateFilters = (newFilters: Partial<FilterState>) => {
		const updated = { ...filters, ...newFilters };
		setFilters(updated);
		onFilterChange(updated);
	};

	// Toggle position filter
	const togglePosition = (position: Position) => {
		const newPositions = filters.positions.includes(position)
			? filters.positions.filter((p) => p !== position)
			: [...filters.positions, position];
		updateFilters({ positions: newPositions });
	};

	// Toggle team filter
	const toggleTeam = (teamId: number) => {
		const newTeams = filters.teams.includes(teamId)
			? filters.teams.filter((t) => t !== teamId)
			: [...filters.teams, teamId];
		updateFilters({ teams: newTeams });
	};

	// Reset all filters
	const resetFilters = () => {
		const defaultFilters: FilterState = {
			search: '',
			positions: [],
			teams: [],
			ageMin: '',
			ageMax: '',
			nationality: '',
			goalsMin: '',
			assistsMin: '',
			matchesMin: '',
		};
		setFilters(defaultFilters);
		onFilterChange(defaultFilters);
	};

	// Toggle section expansion (for mobile)
	const toggleSection = (section: string) => {
		if (!collapsible) return;
		setExpandedSections((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(section)) {
				newSet.delete(section);
			} else {
				newSet.add(section);
			}
			return newSet;
		});
	};

	// Count active filters
	const activeFiltersCount = [
		filters.search,
		filters.positions.length,
		filters.teams.length,
		filters.ageMin,
		filters.ageMax,
		filters.nationality,
		filters.goalsMin,
		filters.assistsMin,
		filters.matchesMin,
	].filter(Boolean).length;

	// Render section header (for collapsible)
	const SectionHeader = ({ id, title }: { id: string; title: string }) => {
		if (!collapsible) {
			return <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{title}</h3>;
		}

		const isExpanded = expandedSections.has(id);
		return (
			<button
				onClick={() => toggleSection(id)}
				className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide hover:text-gray-900"
			>
				<span>{title}</span>
				<svg
					className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>
		);
	};

	// Render section content wrapper
	const SectionContent = ({ id, children }: { id: string; children: React.ReactNode }) => {
		if (!collapsible || expandedSections.has(id)) {
			return <div>{children}</div>;
		}
		return null;
	};

	return (
		<div className="space-y-6">
			{/* Active Filters Badge */}
			{activeFiltersCount > 0 && (
				<div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
					<span className="text-sm text-indigo-700">
						<strong>{activeFiltersCount}</strong> active filter{activeFiltersCount !== 1 ? 's' : ''}
					</span>
					<button
						onClick={resetFilters}
						className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
					>
						Clear All
					</button>
				</div>
			)}

			{/* Search */}
			<div className="bg-white rounded-lg shadow p-6">
				<SectionHeader id="search" title="Search" />
				<SectionContent id="search">
					<input
						type="text"
						placeholder="Search by name..."
						value={filters.search}
						onChange={(e) => updateFilters({ search: e.target.value })}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</SectionContent>
			</div>

			{/* Position Filter */}
			<div className="bg-white rounded-lg shadow p-6">
				<SectionHeader id="position" title="Position" />
				<SectionContent id="position">
					<div className="space-y-2">
						{(['GK', 'DF', 'MF', 'FW'] as Position[]).map((position) => (
							<label key={position} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
								<input
									type="checkbox"
									checked={filters.positions.includes(position)}
									onChange={() => togglePosition(position)}
									className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
								/>
								<span className="ml-3 text-gray-700">{position}</span>
							</label>
						))}
					</div>
				</SectionContent>
			</div>

			{/* Team Filter */}
			<div className="bg-white rounded-lg shadow p-6">
				<SectionHeader id="team" title="Team" />
				<SectionContent id="team">
					<div className="max-h-48 overflow-y-auto space-y-2">
						{teams.map((team) => (
							<label key={team.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
								<input
									type="checkbox"
									checked={filters.teams.includes(team.id)}
									onChange={() => toggleTeam(team.id)}
									className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
								/>
								<span className="ml-3 text-gray-700 text-sm">{team.name}</span>
							</label>
						))}
					</div>
				</SectionContent>
			</div>

			{/* Age Range */}
			<div className="bg-white rounded-lg shadow p-6">
				<SectionHeader id="age" title="Age Range" />
				<SectionContent id="age">
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="text-xs text-gray-600 mb-1 block">Min Age</label>
							<input
								type="number"
								placeholder="18"
								value={filters.ageMin}
								onChange={(e) => updateFilters({ ageMin: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						</div>
						<div>
							<label className="text-xs text-gray-600 mb-1 block">Max Age</label>
							<input
								type="number"
								placeholder="35"
								value={filters.ageMax}
								onChange={(e) => updateFilters({ ageMax: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						</div>
					</div>
				</SectionContent>
			</div>

			{/* Nationality */}
			<div className="bg-white rounded-lg shadow p-6">
				<SectionHeader id="nationality" title="Nationality" />
				<SectionContent id="nationality">
					<input
						type="text"
						placeholder="e.g., Spain, Brazil..."
						value={filters.nationality}
						onChange={(e) => updateFilters({ nationality: e.target.value })}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</SectionContent>
			</div>

			{/* Stats Filters */}
			<div className="bg-white rounded-lg shadow p-6">
				<SectionHeader id="stats" title="Performance Stats" />
				<SectionContent id="stats">
					<div className="space-y-3">
						<div>
							<label className="text-xs text-gray-600 mb-1 block">Min Goals</label>
							<input
								type="number"
								placeholder="0"
								value={filters.goalsMin}
								onChange={(e) => updateFilters({ goalsMin: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						</div>
						<div>
							<label className="text-xs text-gray-600 mb-1 block">Min Assists</label>
							<input
								type="number"
								placeholder="0"
								value={filters.assistsMin}
								onChange={(e) => updateFilters({ assistsMin: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						</div>
						<div>
							<label className="text-xs text-gray-600 mb-1 block">Min Matches</label>
							<input
								type="number"
								placeholder="0"
								value={filters.matchesMin}
								onChange={(e) => updateFilters({ matchesMin: e.target.value })}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						</div>
					</div>
				</SectionContent>
			</div>

			{/* Reset Button */}
			<button
				onClick={resetFilters}
				className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
			>
				Reset Filters
			</button>
		</div>
	);
};

export default AdvancedFiltersPanel;

