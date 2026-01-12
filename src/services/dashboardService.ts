import api from './api';

/**
 * Dashboard Statistics Service
 * 
 * Provides API functions for fetching dashboard statistics and overview data.
 */

export interface ChartDataPoint {
  month: string;
  month_key?: string;
  goals?: number;
  users?: number;
  matches?: number;
}

export interface TopTeam {
  team: string;
  goals: number;
}

export interface RecentActivity {
  id: string;
  type: 'player' | 'match' | 'stats' | 'user';
  action: string;
  name: string;
  time: string;
  timestamp?: string;
}

export interface PerformanceMetrics {
  average_goals_per_match: number;
  average_players_per_team: number;
  most_active_team: string | null;
  top_scorer: string | null;
  top_scorer_goals: number;
}

export interface DashboardStats {
  // Basic counts
  total_players: number;
  total_teams: number;
  total_matches: number;
  active_scouts: number;
  players_this_month: number;
  teams_this_month: number;
  matches_this_week: number;
  scouts_this_month: number;
  
  // Chart data (optional - may not be available if backend fails)
  goals_over_time?: ChartDataPoint[];
  user_growth?: ChartDataPoint[];
  match_activity?: ChartDataPoint[];
  top_teams_by_goals?: TopTeam[];
  
  // Recent activities (optional)
  recent_activities?: RecentActivity[];
  
  // Performance metrics (optional)
  performance_metrics?: PerformanceMetrics;
}

/**
 * Get dashboard statistics from the backend API.
 * Returns real-time counts from the database.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Note: api baseURL already includes '/api', so we don't add it here
    const response = await api.get<DashboardStats>('/dashboard/stats/');
    console.log('[dashboardService] API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[dashboardService] Failed to fetch dashboard stats:', error);
    console.error('[dashboardService] Error details:', error?.response?.data);
    throw new Error(error?.response?.data?.message || 'Failed to load dashboard statistics');
  }
}

