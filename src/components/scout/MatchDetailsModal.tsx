import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import VideoPreviewModal from '../admin/VideoPreviewModal';
import TeamStatsComparisonTable from '../common/TeamStatsComparisonTable';
import { getMatchById } from '../../services/matchService';
import { getMatchStats } from '../../services/statsService';
import { getTeamStatsComparison } from '../../services/teamStatsService';
import type { Match, MatchListItem } from '../../types/match';
import type { MatchStatsItem } from '../../services/statsService';
import type { TeamMatchStatsComparison } from '../../types/teamStats';
import { handleApiError } from '../../utils/errorHandler';

/**
 * Match Details Modal Props
 */
export interface MatchDetailsModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Match ID to fetch details for
   */
  matchId: number;
  /**
   * Basic match info (optional, for initial display)
   */
  match?: MatchListItem | null;
}

/**
 * Match Details Modal Component
 * 
 * Displays comprehensive match information including:
 * - Match header (teams, date, score, competition, venue)
 * - Player statistics table (sortable, clickable player names)
 * - Video embed section (YouTube, Vimeo, VEO, Other)
 * 
 * Features:
 * - Fetches full match details and statistics
 * - Supports video embedding for multiple platforms
 * - Navigate to player profiles from stats table
 * - Loading and error states
 * - Responsive design
 */
const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  isOpen,
  onClose,
  matchId,
  match: initialMatch,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // State
  const [match, setMatch] = useState<Match | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStatsItem[]>([]);
  const [teamStatsComparison, setTeamStatsComparison] = useState<TeamMatchStatsComparison | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTeamStats, setLoadingTeamStats] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('starting_xi');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  // Fetch match details and statistics
  useEffect(() => {
    if (isOpen && matchId) {
      fetchMatchDetails();
      fetchTeamStats();
    } else {
      // Reset state when modal closes
      setMatch(null);
      setMatchStats([]);
      setTeamStatsComparison(null);
      setError(null);
      setShowVideoModal(false);
    }
  }, [isOpen, matchId]);

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch match details and stats in parallel
      const [matchData, statsData] = await Promise.all([
        getMatchById(matchId),
        getMatchStats(matchId),
      ]);

      setMatch(matchData);
      // Ensure statsData is an array
      setMatchStats(Array.isArray(statsData) ? statsData : []);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || t('errors.failedToLoad');
      setError(errorMessage);
      handleApiError(err, t, navigate, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamStats = async () => {
    try {
      setLoadingTeamStats(true);
      const teamStatsData = await getTeamStatsComparison(matchId);
      setTeamStatsComparison(teamStatsData);
    } catch (err: any) {
      // Team stats are optional, so we don't show error if they're not available
      console.log('Team stats not available for this match:', err);
      setTeamStatsComparison(null);
    } finally {
      setLoadingTeamStats(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  // Sort statistics
  const sortedStats = useMemo(() => {
    // Ensure matchStats is an array
    if (!Array.isArray(matchStats) || matchStats.length === 0) {
      return [];
    }
    const sorted = [...matchStats];
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'player':
          aValue = a.player_info.full_name.toLowerCase();
          bValue = b.player_info.full_name.toLowerCase();
          break;
        case 'position':
          aValue = a.player_info.position;
          bValue = b.player_info.position;
          break;
        case 'minutes_played':
          aValue = a.minutes_played;
          bValue = b.minutes_played;
          break;
        case 'goals':
          aValue = a.goals || 0;
          bValue = b.goals || 0;
          break;
        case 'assists':
          aValue = a.assists || 0;
          bValue = b.assists || 0;
          break;
        case 'shots':
          aValue = a.shots || 0;
          bValue = b.shots || 0;
          break;
        case 'tackles':
          aValue = a.tackles || 0;
          bValue = b.tackles || 0;
          break;
        case 'starting_xi':
          aValue = a.starting_xi ? 1 : 0;
          bValue = b.starting_xi ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [matchStats, sortField, sortDirection]);

  // Handle column sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Modal title
  const modalTitle = match
    ? `${match.home_team.name} vs ${match.away_team.name}`
    : initialMatch
    ? `${initialMatch.home_team_name} vs ${initialMatch.away_team_name}`
    : t('scout.matchDetails');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="xl"
      showCloseButton={true}
    >
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">{t('common.loading')}...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchMatchDetails}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('errors.tryAgain')}
          </button>
        </div>
      ) : match ? (
        <div className="space-y-6">
          {/* Match Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('matches.date')}</p>
                <p className="text-base text-gray-900">{formatDate(match.match_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('matches.competition')}</p>
                <p className="text-base text-gray-900">{match.competition}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('matches.venue')}</p>
                <p className="text-base text-gray-900">{match.venue}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('matches.score')}</p>
                <p className="text-2xl font-bold text-gray-900">{match.score_display}</p>
              </div>
            </div>
          </div>

          {/* Video Section */}
          {match.video_url && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-3">{t('scout.matchVideo')}</p>
              <button
                onClick={() => setShowVideoModal(true)}
                className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {t('scout.watchVideo')}
              </button>
            </div>
          )}

          {/* Player Statistics Table */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('scout.playerStatistics')}</h3>
            {sortedStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('scout.noPlayerStats')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('starting_xi')}
                      >
                        <div className="flex items-center gap-1">
                          {t('players.player')} {getSortIcon('starting_xi')}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('position')}
                      >
                        <div className="flex items-center gap-1">
                          {t('players.position')} {getSortIcon('position')}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('minutes_played')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {t('stats.minutes')} {getSortIcon('minutes_played')}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('goals')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {t('stats.goals')} {getSortIcon('goals')}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('assists')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {t('stats.assists')} {getSortIcon('assists')}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('shots')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {t('stats.shots')} {getSortIcon('shots')}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('tackles')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {t('stats.tackles')} {getSortIcon('tackles')}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('stats.cards')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedStats.map((stat) => (
                      <tr
                        key={stat.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/scout/players/${stat.player}`)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {stat.starting_xi && (
                              <span className="text-xs font-semibold text-green-600">★</span>
                            )}
                            <span className="text-sm font-medium text-gray-900 hover:text-blue-600">
                              {stat.player_info.full_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {stat.player_info.position}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                          {stat.minutes_played}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                          {stat.goals || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                          {stat.assists || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                          {stat.shots || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                          {stat.tackles || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                          {stat.yellow_cards || 0} / {stat.red_cards || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Team Statistics Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('teamStats.title')}</h3>
            {loadingTeamStats ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">{t('common.loading')}...</p>
              </div>
            ) : teamStatsComparison &&
              (teamStatsComparison.home_team_stats || teamStatsComparison.away_team_stats) ? (
              <TeamStatsComparisonTable
                homeTeamStats={teamStatsComparison.home_team_stats}
                awayTeamStats={teamStatsComparison.away_team_stats}
                matchInfo={{
                  homeTeam: match.home_team.name,
                  awayTeam: match.away_team.name,
                  matchDate: match.match_date,
                }}
              />
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                <p className="text-gray-500">{t('teamStats.noTeamStats')}</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Video Preview Modal */}
      {match && match.video_url && (
        <VideoPreviewModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          platform={match.video_platform}
          videoUrl={match.video_url}
          matchInfo={{
            homeTeam: match.home_team.name,
            awayTeam: match.away_team.name,
            matchDate: match.match_date,
          }}
        />
      )}
    </Modal>
  );
};

export default MatchDetailsModal;

