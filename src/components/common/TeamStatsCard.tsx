import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TeamMatchStats } from '../../types/teamStats';

/**
 * Team Stats Card Props
 */
export interface TeamStatsCardProps {
  /**
   * Team match statistics
   */
  stats: TeamMatchStats;
  /**
   * Team name
   */
  teamName: string;
  /**
   * Team logo URL (optional)
   */
  teamLogo?: string;
  /**
   * Whether this is the home team
   */
  isHomeTeam?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Team Stats Card Component
 *
 * Displays all team statistics in a card format.
 * Useful for detailed view or mobile layout.
 *
 * Features:
 * - Card-based layout with team header
 * - Organized stat sections (offensive, defensive, disciplinary)
 * - Responsive grid layout
 * - Team logo and name display
 */
const TeamStatsCard: React.FC<TeamStatsCardProps> = ({
  stats,
  teamName,
  teamLogo,
  isHomeTeam = false,
  className = '',
}) => {
  const { t } = useTranslation();

  /**
   * Stat item component
   */
  const StatItem: React.FC<{ label: string; value: number | string; highlight?: boolean }> = ({
    label,
    value,
    highlight = false,
  }) => (
    <div
      className={`flex justify-between items-center py-2 px-3 rounded-lg ${
        highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
      }`}
    >
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-lg font-bold ${highlight ? 'text-blue-700' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );

  /**
   * Section header component
   */
  const SectionHeader: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
      <span className="text-lg">{icon}</span>
      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h4>
    </div>
  );

  return (
    <div
      className={`bg-white rounded-lg border-2 ${
        isHomeTeam ? 'border-blue-500' : 'border-gray-300'
      } shadow-md overflow-hidden ${className}`}
    >
      {/* Team Header */}
      <div
        className={`${
          isHomeTeam ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-gray-600 to-gray-700'
        } text-white p-4`}
      >
        <div className="flex items-center gap-3">
          {teamLogo && (
            <img src={teamLogo} alt={teamName} className="w-12 h-12 object-contain bg-white rounded-lg p-1" />
          )}
          <div>
            <h3 className="text-xl font-bold">{teamName}</h3>
            <p className="text-sm opacity-90">
              {isHomeTeam ? t('teamStats.homeTeam') : t('teamStats.awayTeam')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Content */}
      <div className="p-4 space-y-6">
        {/* Offensive Statistics */}
        <div>
          <SectionHeader title={t('stats.offensiveStats')} icon="⚽" />
          <div className="space-y-2">
            <StatItem label={t('teamStats.goals')} value={stats.goals} highlight={stats.goals > 0} />
            <StatItem label={t('teamStats.totalShots')} value={stats.total_shots} />
            <StatItem label={t('teamStats.shotsOnTarget')} value={stats.shots_on_target} />
            <StatItem label={t('teamStats.keyPasses')} value={stats.key_passes} />
            <StatItem label={t('teamStats.passesInPenaltyArea')} value={stats.passes_in_penalty_area} />
            <StatItem label={t('teamStats.longBalls')} value={stats.long_balls} />
          </div>
        </div>

        {/* Possession */}
        <div>
          <SectionHeader title={t('teamStats.possession')} icon="🎯" />
          <div className="space-y-2">
            <StatItem
              label={t('teamStats.possession')}
              value={`${stats.possession_percentage.toFixed(1)}%`}
              highlight
            />
          </div>
        </div>

        {/* Defensive Statistics */}
        <div>
          <SectionHeader title={t('stats.defensiveStats')} icon="🛡️" />
          <div className="space-y-2">
            <StatItem label={t('teamStats.tackles')} value={stats.tackles} />
            <StatItem label={t('teamStats.blocks')} value={stats.blocks} />
          </div>
        </div>

        {/* Physical Statistics */}
        <div>
          <SectionHeader title={t('stats.physicalStats')} icon="💪" />
          <div className="space-y-2">
            <StatItem label={t('teamStats.successfulDribbles')} value={stats.successful_dribbles} />
            <StatItem label={t('teamStats.duelsWon')} value={stats.duels_won} />
            <StatItem label={t('teamStats.miscontrols')} value={stats.miscontrols} />
            <StatItem label={t('teamStats.fouledWhenDribble')} value={stats.fouled_when_dribble} />
          </div>
        </div>

        {/* Disciplinary */}
        <div>
          <SectionHeader title={t('stats.disciplinary')} icon="📋" />
          <div className="space-y-2">
            <StatItem label={t('teamStats.fouls')} value={stats.fouls} />
            <StatItem label={t('teamStats.yellowCards')} value={stats.yellow_cards} />
            <StatItem
              label={t('teamStats.redCards')}
              value={stats.red_cards}
              highlight={stats.red_cards > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamStatsCard;
