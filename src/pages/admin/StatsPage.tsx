import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import { getDashboardStats } from '../../services/dashboardService';
import type { DashboardStats } from '../../services/dashboardService';
import { handleApiError } from '../../utils/errorHandler';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

/**
 * Statistics Page (Admin)
 * 
 * Comprehensive dashboard for administrators to view platform statistics and analytics.
 * 
 * Features:
 * - Platform overview statistics (players, teams, matches, users)
 * - Activity charts (goals over time, user growth, match activity)
 * - Recent activity feed
 * - Performance metrics
 */
const StatsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || t('errors.failedToSave');
      setError(errorMessage);
      handleApiError(err, t, navigate, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Use real data from API, fallback to empty arrays if not available
  const goalsOverTimeData = stats?.goals_over_time || [];
  const userGrowthData = stats?.user_growth || [];
  const matchActivityData = stats?.match_activity || [];
  const topTeamsData = stats?.top_teams_by_goals || [];
  const recentActivities = stats?.recent_activities || [];

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'player':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'match':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'stats':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'user':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Get activity color
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'player': return 'bg-blue-100 text-blue-600';
      case 'match': return 'bg-green-100 text-green-600';
      case 'stats': return 'bg-purple-100 text-purple-600';
      case 'user': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader
          title={t('stats.title')}
          subtitle={t('admin.statsSubtitle')}
        />
        <div className="space-y-8 mt-6">
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-40 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded mb-3"></div>
                <div className="h-10 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-80">
                <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !stats) {
    return (
      <DashboardLayout>
        <PageHeader
          title={t('stats.title')}
          subtitle={t('admin.statsSubtitle')}
        />
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('errors.somethingWentWrong')}</h3>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchDashboardStats}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {t('errors.tryAgain')}
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={t('stats.title')}
        subtitle={t('admin.statsSubtitle')}
      />

      <div className="space-y-8 mt-6">
        {/* Section 1: Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Players */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-3">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {stats?.total_players || 0}
                </div>
                <div className="text-sm font-medium text-gray-500 mb-2">{t('dashboard.totalPlayers')}</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span>+{stats?.players_this_month || 0} {t('dashboard.thisMonth')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Total Teams */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-3">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {stats?.total_teams || 0}
                </div>
                <div className="text-sm font-medium text-gray-500 mb-2">{t('dashboard.totalTeams')}</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span>+{stats?.teams_this_month || 0} {t('dashboard.thisMonth')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Total Matches */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-3">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {stats?.total_matches || 0}
                </div>
                <div className="text-sm font-medium text-gray-500 mb-2">{t('dashboard.totalMatches')}</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span>+{stats?.matches_this_week || 0} {t('dashboard.thisWeek')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Active Scouts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-3">
                  <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {stats?.active_scouts || 0}
                </div>
                <div className="text-sm font-medium text-gray-500 mb-2">{t('dashboard.totalScouts')}</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
                  <span>+{stats?.scouts_this_month || 0} {t('dashboard.thisMonth')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goals Over Time - Line Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.goalsOverTime')}</h3>
            {goalsOverTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={goalsOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="goals" name={t('stats.goals')} stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>{t('stats.noGoalData')}</p>
              </div>
            )}
          </div>

          {/* User Growth - Area Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.userGrowth')}</h3>
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="users" name={t('users.title')} stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>{t('common.loading')}...</p>
              </div>
            )}
          </div>

          {/* Match Activity - Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.matchActivity')}</h3>
            {matchActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={matchActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="matches" name={t('matches.title')} fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>{t('matches.noMatchesYet')}</p>
              </div>
            )}
          </div>

          {/* Top Teams by Goals - Horizontal Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.topTeamsByGoals')}</h3>
            {topTeamsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topTeamsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="team" type="category" tick={{ fontSize: 12 }} width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="goals" name={t('stats.goals')} fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>{t('stats.noGoalData')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{t('admin.recentActivity')}</h2>
          </div>
          {recentActivities.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action === 'New player added' ? t('admin.newPlayerAdded') :
                         activity.action === 'Match created' ? t('admin.matchCreated') :
                         activity.action === 'Stats entered' ? t('admin.statsEntered') :
                         activity.action === 'User registered' ? t('admin.userRegistered') :
                         activity.action}
                      </p>
                      <p className="text-sm text-gray-600">{activity.name}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>{t('common.loading')}...</p>
            </div>
          )}
        </div>

        {/* Section 4: Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('admin.performanceMetrics')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Average goals per match */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats?.performance_metrics?.average_goals_per_match?.toFixed(1) || '0.0'}
              </div>
              <p className="text-sm text-gray-600">{t('admin.average')} {t('stats.goals')} {t('admin.per')} {t('matches.match')}</p>
            </div>

            {/* Average players per team */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats?.performance_metrics?.average_players_per_team || 0}
              </div>
              <p className="text-sm text-gray-600">{t('admin.average')} {t('players.title')} {t('admin.per')} {t('teams.title')}</p>
            </div>

            {/* Most active team */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600 mb-2">
                {stats?.performance_metrics?.most_active_team || t('common.n/a')}
              </div>
              <p className="text-sm text-gray-600">{t('admin.mostActive')} {t('teams.title')}</p>
            </div>

            {/* Top scorer */}
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600 mb-2">
                {stats?.performance_metrics?.top_scorer || t('common.n/a')}
              </div>
              <p className="text-sm text-gray-600">
                {t('admin.topScorer')}
                {stats?.performance_metrics?.top_scorer_goals && stats.performance_metrics.top_scorer_goals > 0 && (
                  <span className="block text-xs text-gray-500 mt-1">
                    ({stats.performance_metrics.top_scorer_goals} {t('stats.goals')})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StatsPage;

