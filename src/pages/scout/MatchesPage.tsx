import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import MatchDetailsModal from '../../components/scout/MatchDetailsModal';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { getAllMatches } from '../../services/matchService';
import { getAllTeams } from '../../services/teamService';
import type { MatchListItem, MatchQueryParams, MatchStatus } from '../../types/match';
import type { TeamListItem } from '../../types/team';
import { handleApiError } from '../../utils/errorHandler';
import { STATUS_OPTIONS } from '../../types/match';

/**
 * Matches Page (Scout)
 * 
 * Comprehensive page for scouts to view and browse matches to analyze player performances.
 * 
 * Features:
 * - Search and filter matches (competition, date range, team)
 * - Browse matches in a sortable table
 * - View match details with player statistics
 * - Navigate to player profiles from match stats
 */
const MatchesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // State
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [competitionFilter, setCompetitionFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<MatchStatus | ''>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<number | ''>('');

  // Teams for filter
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [competitions, setCompetitions] = useState<string[]>([]);

  // Match details modal
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  // Refs for abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch teams for filter
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await getAllTeams();
        setTeams(response.results || []);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };
    fetchTeams();
  }, []);

  // Fetch matches
  const fetchMatches = useCallback(async () => {
    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const params: MatchQueryParams = {
        page,
        ordering: '-match_date', // Most recent first
      };

      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }

      if (competitionFilter) {
        params.competition = competitionFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (dateFrom) {
        params.date_from = dateFrom;
      }

      if (dateTo) {
        params.date_to = dateTo;
      }

      if (teamFilter) {
        params.team = teamFilter;
      }

      const response = await getAllMatches(params);
      
      // Only update state if request wasn't aborted
      if (!controller.signal.aborted) {
        setMatches(response.results || []);
        setTotalCount(response.count || 0);

        // Extract unique competitions
        const uniqueCompetitions = Array.from(
          new Set(response.results?.map(m => m.competition).filter(Boolean) || [])
        ).sort() as string[];
        setCompetitions(uniqueCompetitions);
      }
    } catch (err: any) {
      // Don't update state if request was aborted
      if (controller.signal.aborted) return;
      
      const errorMessage = err?.response?.data?.message || err?.message || t('errors.failedToLoad');
      setError(errorMessage);
      handleApiError(err, t, navigate, errorMessage);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, debouncedSearchQuery, competitionFilter, statusFilter, dateFrom, dateTo, teamFilter, t, navigate]);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch matches when filters or page change
  useEffect(() => {
    fetchMatches();
    return () => {
      // Cleanup: abort ongoing request if component unmounts or filters change
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchMatches]);

  // Handle view details
  const handleViewDetails = (matchId: number) => {
    setSelectedMatchId(matchId);
    setShowDetailsModal(true);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setCompetitionFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setTeamFilter('');
    setPage(1);
  };

  // Format date only (no time)
  const formatDateOnly = (dateString: string): string => {
    const date = new Date(dateString);
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge variant
  const getStatusVariant = (status: MatchStatus): 'primary' | 'success' | 'danger' | 'secondary' => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Scheduled':
        return 'primary';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Team options for filter
  const teamOptions = useMemo(() => {
    return [
      { value: '', label: t('scout.allTeams') },
      ...teams.map(team => ({ value: team.id, label: team.name }))
    ];
  }, [teams, t]);

  // Competition options for filter
  const competitionOptions = useMemo(() => {
    return [
      { value: '', label: t('scout.allCompetitions') },
      ...competitions.map(comp => ({ value: comp, label: comp }))
    ];
  }, [competitions, t]);

  // Status options for filter
  const statusOptions = useMemo(() => {
    return [
      { value: '', label: t('scout.allStatuses') },
      ...STATUS_OPTIONS.map(opt => ({
        value: opt.value,
        label: opt.value === 'Completed' ? t('matches.completed') :
               opt.value === 'Scheduled' ? t('matches.scheduled') :
               opt.value === 'Cancelled' ? t('matches.cancelled') : opt.label
      }))
    ];
  }, [t]);

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasFilters = searchQuery || competitionFilter || statusFilter || dateFrom || dateTo || teamFilter;

  return (
    <DashboardLayout>
      <PageHeader
        title={t('scout.watchMatches')}
        subtitle={t('scout.matchesSubtitle')}
      />

      <div className="space-y-6 mt-6">
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                label={t('scout.searchMatches')}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={t('scout.searchMatchesPlaceholder')}
              />
            </div>

            {/* Competition Filter */}
            <div>
              <Select
                label={t('matches.competition')}
                options={competitionOptions}
                value={competitionFilter}
                onChange={(value) => {
                  setCompetitionFilter(value as string);
                  setPage(1);
                }}
                placeholder={t('scout.selectCompetition')}
              />
            </div>

            {/* Status Filter */}
            <div>
              <Select
                label={t('matches.status')}
                options={statusOptions}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value as MatchStatus | '');
                  setPage(1);
                }}
                placeholder={t('scout.selectStatus')}
              />
            </div>

            {/* Date From */}
            <div>
              <Input
                label={t('scout.dateFrom')}
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Date To */}
            <div>
              <Input
                label={t('scout.dateTo')}
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Team Filter */}
            <div>
              <Select
                label={t('teams.title')}
                options={teamOptions}
                value={teamFilter}
                onChange={(value) => {
                  setTeamFilter(value as number | '');
                  setPage(1);
                }}
                placeholder={t('scout.selectTeam')}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasFilters && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
              >
                {t('scout.clearFilters')}
              </Button>
            </div>
          )}
        </div>

        {/* Matches Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-6">
              {/* Skeleton Loaders */}
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        <div className="h-4 w-8 bg-gray-200 rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                      <div className="h-8 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p>{error}</p>
              <Button
                variant="outline"
                onClick={fetchMatches}
                className="mt-4"
              >
                {t('errors.tryAgain')}
              </Button>
            </div>
          ) : matches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
              <p className="font-medium">{t('scout.noMatchesFound')}</p>
              <p className="text-sm mt-1">{t('scout.tryAdjustingFilters')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('matches.date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('matches.match')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('matches.score')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('matches.competition')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('matches.status')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {matches.map((match) => (
                      <tr key={match.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateOnly(match.match_date)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-between gap-4 min-w-[500px]">
                            {/* Home Team - Left Aligned */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Avatar
                                src={match.home_team_logo || undefined}
                                alt={match.home_team_name}
                                size="sm"
                                className="flex-shrink-0"
                              />
                              <span className="text-sm font-medium text-gray-900 truncate">{match.home_team_name}</span>
                            </div>
                            
                            {/* VS Separator - Centered */}
                            <span className="text-xs text-gray-400 font-medium flex-shrink-0 px-2">{t('matches.vs')}</span>
                            
                            {/* Away Team - Left Aligned in Right Section */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Avatar
                                src={match.away_team_logo || undefined}
                                alt={match.away_team_name}
                                size="sm"
                                className="flex-shrink-0"
                              />
                              <span className="text-sm font-medium text-gray-900 truncate">{match.away_team_name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${match.status === 'Completed' ? 'text-gray-900' : 'text-gray-400'}`}>
                            {match.score_display || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary">{match.competition}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusVariant(match.status)}>
                            {match.status === 'Completed' ? t('matches.completed') :
                             match.status === 'Scheduled' ? t('matches.scheduled') :
                             match.status === 'Cancelled' ? t('matches.cancelled') : match.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(match.id)}
                          >
                            {t('scout.viewDetails')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {t('common.showing')} {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} {t('common.of')} {totalCount} {t('matches.matches')}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      {t('common.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Match Details Modal */}
      {selectedMatchId && (
        <MatchDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMatchId(null);
          }}
          matchId={selectedMatchId}
          match={matches.find(m => m.id === selectedMatchId) || null}
        />
      )}
    </DashboardLayout>
  );
};

export default MatchesPage;
