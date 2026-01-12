import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Skeleton from '../../components/common/Skeleton';
import { getDashboardStats, type DashboardStats } from '../../services/dashboardService';
import { getAllMatches } from '../../services/matchService';
import { handleApiError } from '../../utils/errorHandler';
import type { MatchListItem, PaginatedResponse } from '../../types/match';

/**
 * Admin Dashboard Page
 * 
 * Modern overview dashboard for administrators.
 * 
 * Features:
 * - Statistics cards (Players, Teams, Matches, Scouts)
 * - Quick action buttons
 * - Recent matches table
 * - Professional design inspired by Vercel/Linear
 */
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMatches, setRecentMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch stats
        console.log('[AdminDashboard] Fetching dashboard stats...');
        const statsData = await getDashboardStats();
        console.log('[AdminDashboard] Stats received:', statsData);
        setStats(statsData);

        // Fetch recent matches (first 5)
        console.log('[AdminDashboard] Fetching recent matches...');
        const matchesData: PaginatedResponse<MatchListItem> = await getAllMatches({ page: 1 });
        console.log('[AdminDashboard] Matches received:', matchesData);
        setRecentMatches(matchesData.results.slice(0, 5));
      } catch (error) {
        handleApiError(error, t, navigate);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get status badge variant
  const getStatusVariant = (status: string): 'success' | 'info' | 'secondary' => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Scheduled':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={t('navigation.dashboard')}
        subtitle={t('dashboard.welcome')}
      />

      <div className="space-y-5">
        {/* TOP SECTION - STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Players */}
          <StatCard
            icon={
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            number={stats?.total_players !== undefined ? stats.total_players.toString() : '0'}
            label={t('dashboard.totalPlayers')}
            trend={`+${stats?.players_this_month || 0} ${t('dashboard.thisMonth')}`}
            accentColor="bg-blue-500"
            trendUp={true}
            loading={loading}
          />

          {/* Card 2: Total Teams */}
          <StatCard
            icon={
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            number={stats?.total_teams !== undefined ? stats.total_teams.toString() : '0'}
            label={t('dashboard.totalTeams')}
            trend={`+${stats?.teams_this_month || 0} ${t('dashboard.thisMonth')}`}
            accentColor="bg-green-500"
            trendUp={true}
            loading={loading}
          />

          {/* Card 3: Total Matches */}
          <StatCard
            icon={
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            number={stats?.total_matches !== undefined ? stats.total_matches.toString() : '0'}
            label={t('dashboard.totalMatches')}
            trend={`+${stats?.matches_this_week || 0} ${t('dashboard.thisWeek')}`}
            accentColor="bg-purple-500"
            trendUp={true}
            loading={loading}
          />

          {/* Card 4: Active Scouts */}
          <StatCard
            icon={
              <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            number={stats?.active_scouts !== undefined ? stats.active_scouts.toString() : '0'}
            label={t('dashboard.totalScouts')}
            trend={`+${stats?.scouts_this_month || 0} ${t('dashboard.thisMonth')}`}
            accentColor="bg-orange-500"
            trendUp={true}
            loading={loading}
          />
        </div>

        {/* MIDDLE SECTION - QUICK ACTIONS */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('dashboard.quickActions')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Add New Player */}
            <QuickActionButton
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
              label={t('dashboard.addNewPlayer')}
              onClick={() => navigate('/admin/players')}
              gradient="from-blue-600 to-blue-700"
            />

            {/* Create Match */}
            <QuickActionButton
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              label={t('dashboard.createMatch')}
              onClick={() => navigate('/admin/matches')}
              gradient="from-green-600 to-green-700"
            />

            {/* Add Team */}
            <QuickActionButton
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              label={t('dashboard.addTeam')}
              onClick={() => navigate('/admin/teams')}
              gradient="from-purple-600 to-purple-700"
            />

            {/* Manage Users */}
            <QuickActionButton
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              label={t('dashboard.manageUsers')}
              onClick={() => navigate('/admin/users')}
              gradient="from-gray-600 to-gray-700"
            />
          </div>
        </div>

        {/* BOTTOM SECTION - RECENT MATCHES */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('dashboard.recentMatches')}</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4">{t('dashboard.loadingMatches')}</p>
              </div>
            ) : recentMatches.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="font-medium">{t('dashboard.noMatchesYet')}</p>
                <p className="text-sm mt-1">{t('dashboard.createFirstMatch')}</p>
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.date')}</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.match')}</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.score')}</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.competition')}</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.status')}</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentMatches.map((match) => (
                      <tr key={match.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(match.match_date)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* Home Team */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Avatar src={match.home_team_logo || undefined} alt={match.home_team_name} size="sm" />
                              <span className="text-sm font-medium text-gray-900 truncate">{match.home_team_name}</span>
                            </div>
                            {/* VS */}
                            <span className="text-xs text-gray-400 font-semibold px-2">{t('matches.vs')}</span>
                            {/* Away Team */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Avatar src={match.away_team_logo || undefined} alt={match.away_team_name} size="sm" />
                              <span className="text-sm font-medium text-gray-900 truncate">{match.away_team_name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-sm ${match.status === 'Completed' ? 'font-bold text-gray-900' : 'text-gray-400'}`}>
                            {match.score_display || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant="secondary">{match.competition}</Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant={getStatusVariant(match.status)}>
                            {match.status === 'Completed' ? t('matches.completed') : match.status === 'Scheduled' ? t('matches.scheduled') : match.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => navigate(`/admin/matches?id=${match.id}`)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => navigate(`/admin/matches?edit=${match.id}`)}
                              className="text-gray-600 hover:text-gray-800 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/admin/matches')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {t('dashboard.viewAllMatches')} →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

/**
 * StatCard Component
 * 
 * Displays a single statistic card with icon, number, label, and trend.
 */
interface StatCardProps {
  icon: React.ReactNode;
  number: string;
  label: string;
  trend: string;
  accentColor: string;
  trendUp: boolean;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, number, label, trend, accentColor, trendUp, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden">
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`}></div>

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2">{icon}</div>
          {loading ? (
            <>
              <Skeleton width="w-20" height="h-8" className="mb-2" />
              <Skeleton width="w-28" height="h-4" className="mb-1" />
              <Skeleton width="w-24" height="h-3" />
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {number}
              </div>
              <div className="text-sm font-medium text-gray-500 mb-1.5">{label}</div>
              {trend && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  {trendUp && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                  <span>{trend}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * QuickActionButton Component
 * 
 * Displays a quick action button with icon and label.
 */
interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  gradient: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, onClick, gradient }) => {
  return (
    <button
      onClick={onClick}
      className={`
        bg-gradient-to-r ${gradient}
        text-white font-medium text-sm
        px-4 py-3 rounded-lg
        flex items-center justify-center gap-2
        hover:opacity-90 hover:scale-[1.02]
        active:scale-[0.98]
        transition-all duration-200
        shadow-sm hover:shadow-md
      `}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
};

export default AdminDashboard;

