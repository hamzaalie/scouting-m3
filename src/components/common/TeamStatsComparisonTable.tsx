import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TeamMatchStats } from '../../types/teamStats';

/**
 * Team Stats Comparison Table Props
 */
export interface TeamStatsComparisonTableProps {
  /**
   * Home team statistics
   */
  homeTeamStats: TeamMatchStats | null;
  /**
   * Away team statistics
   */
  awayTeamStats: TeamMatchStats | null;
  /**
   * Match information (optional)
   */
  matchInfo?: {
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
  };
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Stat row configuration
 */
interface StatConfig {
  key: keyof TeamMatchStats;
  translationKey: string;
  higherIsBetter: boolean;
  format?: (value: number) => string;
}

/**
 * Team Stats Comparison Table Component
 *
 * Displays side-by-side comparison of team statistics for a match.
 * Format: Home Team Value | Stat Name | Away Team Value
 *
 * Features:
 * - Three-column layout with centered stat names
 * - Visual indicators for better performing team (highlighted in blue/green)
 * - Responsive design for mobile/tablet/desktop
 * - Empty state handling
 * - Proper formatting for numbers and percentages
 */
const TeamStatsComparisonTable: React.FC<TeamStatsComparisonTableProps> = ({
  homeTeamStats,
  awayTeamStats,
  matchInfo,
  className = '',
}) => {
  const { t } = useTranslation();

  // Statistics configuration in display order
  const stats: StatConfig[] = [
    { key: 'goals', translationKey: 'teamStats.goals', higherIsBetter: true },
    { key: 'key_passes', translationKey: 'teamStats.keyPasses', higherIsBetter: true },
    { key: 'long_balls', translationKey: 'teamStats.longBalls', higherIsBetter: true },
    { key: 'total_shots', translationKey: 'teamStats.totalShots', higherIsBetter: true },
    { key: 'shots_on_target', translationKey: 'teamStats.shotsOnTarget', higherIsBetter: true },
    { key: 'tackles', translationKey: 'teamStats.tackles', higherIsBetter: true },
    {
      key: 'possession_percentage',
      translationKey: 'teamStats.possession',
      higherIsBetter: true,
      format: (value: number) => {
        const num = typeof value === 'number' ? value : parseFloat(String(value));
        return isNaN(num) ? '0%' : `${num.toFixed(1)}%`;
      },
    },
    { key: 'blocks', translationKey: 'teamStats.blocks', higherIsBetter: true },
    { key: 'successful_dribbles', translationKey: 'teamStats.successfulDribbles', higherIsBetter: true },
    { key: 'duels_won', translationKey: 'teamStats.duelsWon', higherIsBetter: true },
    { key: 'fouls', translationKey: 'teamStats.fouls', higherIsBetter: false },
    { key: 'yellow_cards', translationKey: 'teamStats.yellowCards', higherIsBetter: false },
    { key: 'red_cards', translationKey: 'teamStats.redCards', higherIsBetter: false },
    { key: 'fouled_when_dribble', translationKey: 'teamStats.fouledWhenDribble', higherIsBetter: true },
    { key: 'passes_in_penalty_area', translationKey: 'teamStats.passesInPenaltyArea', higherIsBetter: true },
    { key: 'miscontrols', translationKey: 'teamStats.miscontrols', higherIsBetter: false },
  ];

  /**
   * Get formatted value for display
   */
  const formatValue = (stat: StatConfig, value: number | undefined | null | string): string => {
    if (value === undefined || value === null || value === '') return '0';
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0';
    if (stat.format) {
      return stat.format(numValue);
    }
    // Add commas for large numbers
    return numValue.toLocaleString();
  };

  /**
   * Determine if value should be highlighted (better performance)
   */
  const shouldHighlight = (
    stat: StatConfig,
    homeValue: number | undefined | null,
    awayValue: number | undefined | null,
    isHome: boolean
  ): boolean => {
    const home = homeValue ?? 0;
    const away = awayValue ?? 0;

    if (home === away) return false;

    if (stat.higherIsBetter) {
      return isHome ? home > away : away > home;
    } else {
      return isHome ? home < away : away < home;
    }
  };

  /**
   * Get CSS classes for value cell
   */
  const getValueClasses = (
    stat: StatConfig,
    homeValue: number | undefined | null,
    awayValue: number | undefined | null,
    isHome: boolean
  ): string => {
    const base = 'px-4 py-3 text-center font-semibold';
    const highlight = shouldHighlight(stat, homeValue, awayValue, isHome);

    if (highlight) {
      return `${base} text-blue-700 bg-blue-50`;
    }
    return `${base} text-gray-900`;
  };

  // Empty state
  if (!homeTeamStats && !awayTeamStats) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-8 text-center ${className}`}>
        <p className="text-gray-500">{t('teamStats.noTeamStats')}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header Row with Team Names */}
      <div className="grid grid-cols-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="px-4 py-4 text-center font-bold">
          <div className="flex flex-col items-center gap-1">
            {homeTeamStats?.team_logo && (
              <img
                src={homeTeamStats.team_logo}
                alt={matchInfo?.homeTeam || t('teamStats.homeTeam')}
                className="w-8 h-8 object-contain"
              />
            )}
            <span className="text-sm sm:text-base">
              {matchInfo?.homeTeam || homeTeamStats?.team_name || t('teamStats.homeTeam')}
            </span>
          </div>
        </div>
        <div className="px-4 py-4 text-center font-bold border-l border-r border-blue-500">
          <span className="text-sm sm:text-base">{t('teamStats.title')}</span>
        </div>
        <div className="px-4 py-4 text-center font-bold">
          <div className="flex flex-col items-center gap-1">
            {awayTeamStats?.team_logo && (
              <img
                src={awayTeamStats.team_logo}
                alt={matchInfo?.awayTeam || t('teamStats.awayTeam')}
                className="w-8 h-8 object-contain"
              />
            )}
            <span className="text-sm sm:text-base">
              {matchInfo?.awayTeam || awayTeamStats?.team_name || t('teamStats.awayTeam')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Rows */}
      <div className="divide-y divide-gray-200">
        {stats.map((stat, index) => {
          const homeValue = homeTeamStats?.[stat.key] as number | undefined;
          const awayValue = awayTeamStats?.[stat.key] as number | undefined;

          return (
            <div
              key={stat.key}
              className={`grid grid-cols-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
            >
              {/* Home Team Value */}
              <div className={getValueClasses(stat, homeValue, awayValue, true)}>
                <span className="text-sm sm:text-base">{formatValue(stat, homeValue)}</span>
              </div>

              {/* Stat Name */}
              <div className="px-4 py-3 text-center border-l border-r border-gray-200">
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  {t(stat.translationKey)}
                </span>
              </div>

              {/* Away Team Value */}
              <div className={getValueClasses(stat, homeValue, awayValue, false)}>
                <span className="text-sm sm:text-base">{formatValue(stat, awayValue)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamStatsComparisonTable;
