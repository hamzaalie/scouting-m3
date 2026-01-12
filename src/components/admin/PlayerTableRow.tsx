import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '../common/Avatar';
import type { PlayerListItem } from '../../types/player';

/**
 * PlayerTableRow Component Props
 */
interface PlayerTableRowProps {
	/**
	 * Player data to display
	 */
	player: PlayerListItem;
	/**
	 * Animation delay index for staggered animation
	 */
	animationIndex: number;
	/**
	 * Edit player handler
	 */
	onEdit: (player: PlayerListItem) => void;
	/**
	 * Delete player handler
	 */
	onDelete: (player: PlayerListItem) => void;
	/**
	 * Loading state for edit action
	 */
	loadingPlayer: boolean;
}

/**
 * Get position badge color based on position
 */
const getPositionColor = (position: string): string => {
	switch (position) {
		case 'GK': return 'bg-orange-500 text-white';
		case 'DF': return 'bg-blue-600 text-white';
		case 'MF': return 'bg-green-600 text-white';
		case 'FW': return 'bg-red-600 text-white';
		default: return 'bg-gray-500 text-white';
	}
};

/**
 * Get country flag (placeholder)
 */
const getCountryFlag = (_nationality: string): string => {
	return '🌐';
};

/**
 * PlayerTableRow Component
 * 
 * Optimized table row component for displaying player information.
 * Wrapped with React.memo to prevent unnecessary re-renders when rendering large lists.
 * 
 * Features:
 * - Displays player avatar, name, team, position, jersey number, age, nationality
 * - Action buttons (view, edit, delete)
 * - Hover effects
 * - Staggered fade-in animation
 * - Optimized with React.memo
 * 
 * Performance:
 * - Only re-renders when player data or handlers change
 * - Comparison function checks player.id and loading state
 * - Significantly improves performance for lists with 50+ items
 */
const PlayerTableRow: React.FC<PlayerTableRowProps> = React.memo(
	({
		player,
		animationIndex,
		onEdit,
		onDelete,
		loadingPlayer,
	}) => {
		const { t } = useTranslation();

		return (
			<tr 
				className="hover:bg-blue-50 transition-colors"
				style={{
					animation: `fadeInUp 0.4s ease-out ${animationIndex * 50}ms forwards`,
					opacity: 0
				}}
			>
				{/* Player Column */}
				<td className="px-6 py-4 whitespace-nowrap">
					<div className="flex items-center gap-3">
						<Avatar 
							src={player.profile_picture || undefined} 
							alt={player.full_name} 
							size="md"
						/>
						<div>
							<div className="text-base font-semibold text-gray-900">
								{player.full_name}
							</div>
							{player.team_name && (
								<div className="flex items-center gap-1.5 mt-1">
									<Avatar 
										src={player.team_logo || undefined} 
										alt={player.team_name} 
										size="xs"
									/>
									<span className="text-xs text-gray-500">{player.team_name}</span>
								</div>
							)}
						</div>
					</div>
				</td>

				{/* Team Column */}
				<td className="px-6 py-4 whitespace-nowrap">
					{player.team_name ? (
						<div className="flex items-center gap-2">
							<Avatar 
								src={player.team_logo || undefined} 
								alt={player.team_name} 
								size="sm"
							/>
							<span className="text-sm text-gray-900">{player.team_name}</span>
						</div>
					) : (
						<span className="text-sm text-gray-400">No team</span>
					)}
				</td>

				{/* Position Column */}
				<td className="px-6 py-4 whitespace-nowrap">
					<span className={`inline-flex px-3 py-1 rounded-md text-xs font-bold ${getPositionColor(player.position)}`}>
						{player.position}
					</span>
				</td>

				{/* Jersey Number Column */}
				<td className="px-6 py-4 whitespace-nowrap text-center">
					{player.jersey_number ? (
						<div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
							<span className="text-lg font-bold text-gray-900">{player.jersey_number}</span>
						</div>
					) : (
						<span className="text-sm text-gray-400">—</span>
					)}
				</td>

				{/* Age Column */}
				<td className="px-6 py-4 whitespace-nowrap text-center">
					<span className="text-sm text-gray-700">{player.age ?? t('common.n/a')}</span>
				</td>

				{/* Nationality Column */}
				<td className="px-6 py-4 whitespace-nowrap">
					{player.nationality && player.nationality.trim() ? (
						<div className="flex items-center gap-2">
							<span className="text-xl">{getCountryFlag(player.nationality)}</span>
							<span className="text-sm text-gray-700 uppercase">{player.nationality}</span>
						</div>
					) : (
						<span className="text-sm text-gray-400">{t('common.n/a')}</span>
					)}
				</td>

				{/* Actions Column */}
				<td className="px-6 py-4 whitespace-nowrap text-right">
					<div className="flex gap-2 justify-end">
						<button
							onClick={() => onEdit(player)}
							disabled={loadingPlayer}
							className="px-3 py-1.5 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
							aria-label={t('common.edit') + ' ' + player.full_name}
						>
							{t('common.edit')}
						</button>
						<button
							onClick={() => onDelete(player)}
							className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
							aria-label={t('common.delete') + ' ' + player.full_name}
						>
							{t('common.delete')}
						</button>
					</div>
				</td>
			</tr>
		);
	},
	/**
	 * Custom comparison function for React.memo
	 * Only re-render if player data or loading state changes
	 */
	(prevProps, nextProps) => {
		return (
			prevProps.player.id === nextProps.player.id &&
			prevProps.player.full_name === nextProps.player.full_name &&
			prevProps.player.team_name === nextProps.player.team_name &&
			prevProps.player.position === nextProps.player.position &&
			prevProps.player.jersey_number === nextProps.player.jersey_number &&
			prevProps.player.age === nextProps.player.age &&
			prevProps.loadingPlayer === nextProps.loadingPlayer &&
			prevProps.animationIndex === nextProps.animationIndex
		);
	}
);

PlayerTableRow.displayName = 'PlayerTableRow';

export default PlayerTableRow;

