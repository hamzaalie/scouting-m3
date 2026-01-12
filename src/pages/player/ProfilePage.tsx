import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import SubscriptionStatus from '../../components/subscription/SubscriptionStatus';
import ProfileEditModal from '../../components/admin/ProfileEditModal';
import PasswordChangeModal from '../../components/common/PasswordChangeModal';
import ProfilePictureUploadModal from '../../components/common/ProfilePictureUploadModal';
import { getCurrentUser } from '../../services/authService';
import { getMyProfile, getMyStats } from '../../services/playerService';
import type { User } from '../../services/authService';
import type { AggregatedStats } from '../../services/statsService';

/**
 * Profile Page (Player)
 * 
 * Complete player profile page with account information, player profile data,
 * stats summary, and profile management options.
 */
const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [error, setError] = useState<string>('');

  // Modal states
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showPictureModal, setShowPictureModal] = useState<boolean>(false);

  // Fetch profile data on mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user data
      const userData = await getCurrentUser();
      setUser(userData);

      // Fetch player profile (includes player_profile nested object)
      try {
        const profileData = await getMyProfile();
        if (profileData.player_profile) {
          setPlayerProfile(profileData.player_profile);

          // Fetch player stats
          try {
            const statsData = await getMyStats();
            setStats(statsData);
          } catch (statsError) {
            console.error('Failed to load stats:', statsError);
            // Stats are optional, continue without them
          }
        }
      } catch (profileError) {
        console.error('Failed to load player profile:', profileError);
        // Player profile is optional, continue without it
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError(err.message || t('player.failedToLoadProfile'));
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string | null | undefined): number | null => {
    if (!dateOfBirth) return null;
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? age : null;
    } catch (error) {
      console.error('Error calculating age:', error);
      return null;
    }
  };

  // Handle profile update success
  const handleProfileUpdateSuccess = (updatedUser: User) => {
    setUser(updatedUser);
    fetchProfileData(); // Refresh all data
  };

  // Handle password change success
  const handlePasswordChangeSuccess = () => {
    // Password changed successfully, no need to refresh data
  };

  // Handle picture upload success
  const handlePictureUploadSuccess = (newPictureUrl: string) => {
    if (user) {
      setUser({
        ...user,
        profile_picture: newPictureUrl,
      });
    }
  };

  // Get position badge variant
  const getPositionBadgeVariant = (position: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
    switch (position) {
      case 'GK': return 'warning'; // Orange for goalkeeper
      case 'DF': return 'primary'; // Blue for defender
      case 'MF': return 'success'; // Green for midfielder
      case 'FW': return 'danger'; // Red for forward
      default: return 'secondary'; // Gray for unknown
    }
  };

  // Get country flag emoji from country name
  const getCountryFlag = (nationality: string): string => {
    // Map of common country names to flag emojis
    const flagMap: Record<string, string> = {
      'Argentina': '🇦🇷',
      'Brazil': '🇧🇷',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Portugal': '🇵🇹',
      'Netherlands': '🇳🇱',
      'Belgium': '🇧🇪',
      'Croatia': '🇭🇷',
      'Uruguay': '🇺🇾',
      'Colombia': '🇨🇴',
      'Mexico': '🇲🇽',
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'Japan': '🇯🇵',
      'South Korea': '🇰🇷',
      'Australia': '🇦🇺',
      'Egypt': '🇪🇬',
      'Nigeria': '🇳🇬',
      'Senegal': '🇸🇳',
      'Morocco': '🇲🇦',
      'Ghana': '🇬🇭',
      'Ivory Coast': '🇨🇮',
      'Cameroon': '🇨🇲',
      'Algeria': '🇩🇿',
      'Tunisia': '🇹🇳',
      'Poland': '🇵🇱',
      'Sweden': '🇸🇪',
      'Denmark': '🇩🇰',
      'Switzerland': '🇨🇭',
      'Austria': '🇦🇹',
      'Czech Republic': '🇨🇿',
      'Serbia': '🇷🇸',
      'Ukraine': '🇺🇦',
      'Russia': '🇷🇺',
      'Turkey': '🇹🇷',
      'Greece': '🇬🇷',
      'Chile': '🇨🇱',
      'Peru': '🇵🇪',
      'Ecuador': '🇪🇨',
      'Paraguay': '🇵🇾',
      'Venezuela': '🇻🇪',
      'Costa Rica': '🇨🇷',
      'Jamaica': '🇯🇲',
      'Iran': '🇮🇷',
      'Saudi Arabia': '🇸🇦',
      'Qatar': '🇶🇦',
      'China': '🇨🇳',
      'Thailand': '🇹🇭',
      'Vietnam': '🇻🇳',
      'India': '🇮🇳',
      'South Africa': '🇿🇦',
    };

    return flagMap[nationality] || '🌍';
  };

  // Loading state with skeleton loaders
  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader
          title={t('player.myProfile')}
          subtitle={t('player.manageAccountInfo')}
        />
        <div className="space-y-6">
          {/* Account Information Skeleton */}
          <Card>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Skeleton */}
              <div className="flex flex-col items-center md:items-start">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-24 h-8 bg-gray-200 rounded mt-3 animate-pulse"></div>
              </div>

              {/* Details Skeleton */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </Card>

          {/* Player Profile Skeleton */}
          <Card>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i}>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats Skeleton */}
          <Card>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-9 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
              ))}
            </div>
          </Card>

          {/* Security Skeleton */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Error state with detailed error message
  if (error || !user) {
    return (
      <DashboardLayout>
        <PageHeader
          title={t('player.myProfile')}
          subtitle={t('player.manageAccountInfo')}
        />
        <Card>
          <div className="text-center py-12 px-4">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-4">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t('player.failedToLoadProfile')}
            </h3>
            <p className="text-gray-600 mb-2 max-w-md mx-auto">
              {t('player.noProfileDataMessage')}
            </p>
            
            {/* Detailed Error (if available) */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-red-800 font-mono break-words">
                  {error}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button 
                variant="primary" 
                onClick={fetchProfileData}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                {t('player.tryAgain')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/player/dashboard')}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
              >
                {t('errors.goToDashboard')}
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {t('errors.contactSupport')}
              </p>
            </div>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={t('player.myProfile')}
        subtitle={t('player.manageAccountInfo')}
      />

      <div className="space-y-6">
        {/* Account Information Section */}
        <Card title={t('player.editProfile')}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar
                src={user.profile_picture}
                alt={user.full_name || user.email}
                size="xl"
                fallback={user.first_name ? `${user.first_name[0]}${user.last_name?.[0] || ''}` : user.email[0].toUpperCase()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPictureModal(true)}
                className="mt-3"
              >
                {t('player.changePicture')}
              </Button>
            </div>

            {/* Account Details */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('player.firstName')}
                </label>
                <p className="text-base text-gray-900">{user.first_name || t('player.notProvided')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('player.lastName')}
                </label>
                <p className="text-base text-gray-900">{user.last_name || t('player.notProvided')}</p>
              </div>

              {/* Email (read-only) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('player.email')}
                </label>
                <p className="text-base text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500 mt-1">{t('player.emailCannotBeChanged')}</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('player.phone')}
                </label>
                <p className="text-base text-gray-900">{user.phone || t('player.notProvided')}</p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.role')}
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {t(`common.${user.role}`)}
                </span>
              </div>

              {/* Member Since */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('player.memberSince')}
                </label>
                <p className="text-base text-gray-900">{formatDate(user.date_joined)}</p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('users.status')}
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? t('player.active') : t('users.inactive')}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="primary"
              onClick={() => setShowEditModal(true)}
            >
              {t('player.editProfile')}
            </Button>
          </div>
        </Card>

        {/* Subscription Status Section */}
        <SubscriptionStatus />

        {/* Player Profile Section (Read-only) */}
        {playerProfile ? (
          <Card title={t('players.playerDetails')}>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>{t('common.note')}:</strong> {t('players.playerProfileManagedByAdmin')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('players.position')}
                </label>
                <Badge variant={getPositionBadgeVariant(playerProfile.position)} size="lg">
                  {playerProfile.position}
                </Badge>
              </div>

              {/* Team with Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('players.team')}
                </label>
                <div className="flex items-center gap-2">
                  {playerProfile.team_logo && (
                    <img 
                      src={playerProfile.team_logo} 
                      alt={playerProfile.team_name || 'Team logo'}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        // Hide image if it fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <p className="text-base text-gray-900 font-medium">
                    {playerProfile.team_name || t('players.freeAgent')}
                  </p>
                </div>
              </div>

              {/* Jersey Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('players.jerseyNumber')}
                </label>
                <p className="text-base text-gray-900 font-semibold">
                  {playerProfile.jersey_number ? `#${playerProfile.jersey_number}` : t('common.n/a')}
                </p>
              </div>

              {/* Date of Birth & Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('players.dateOfBirth')} / {t('players.age')}
                </label>
                <div className="space-y-1">
                  {playerProfile.date_of_birth && (
                    <p className="text-sm text-gray-600">
                      {formatDate(playerProfile.date_of_birth)}
                    </p>
                  )}
                  <p className="text-base text-gray-900 font-medium">
                    {(() => {
                      // Use age from profile if available, otherwise calculate from date_of_birth
                      const age = playerProfile.age ?? calculateAge(playerProfile.date_of_birth);
                      return age !== null && age !== undefined ? `${age} ${t('scout.yearsOld')}` : t('common.n/a');
                    })()}
                  </p>
                </div>
              </div>

              {/* Nationality with Flag */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('players.nationality')}
                </label>
                <p className="text-base text-gray-900 font-medium flex items-center gap-2">
                  {playerProfile.nationality ? (
                    <>
                      <span className="text-2xl">{getCountryFlag(playerProfile.nationality)}</span>
                      <span>{playerProfile.nationality}</span>
                    </>
                  ) : (
                    t('common.n/a')
                  )}
                </p>
              </div>

              {/* Preferred Foot */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('players.preferredFoot')}
                </label>
                <p className="text-base text-gray-900 capitalize font-medium">
                  {playerProfile.preferred_foot || t('common.n/a')}
                </p>
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('players.height')}
                </label>
                <p className="text-base text-gray-900 font-medium">
                  {playerProfile.height ? `${playerProfile.height} cm` : t('common.n/a')}
                </p>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('players.weight')}
                </label>
                <p className="text-base text-gray-900 font-medium">
                  {playerProfile.weight ? `${playerProfile.weight} kg` : t('common.n/a')}
                </p>
              </div>

              {/* Bio */}
              {playerProfile.bio && (
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('players.bio')}
                  </label>
                  <p className="text-base text-gray-700 leading-relaxed">{playerProfile.bio}</p>
                </div>
              )}
            </div>
          </Card>
        ) : (
          /* No Player Profile Message */
          <Card title={t('players.playerDetails')}>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('player.noPlayerProfile')}
              </h3>
              <p className="text-gray-600">
                {t('player.noPlayerProfileMessage')}
              </p>
            </div>
          </Card>
        )}

        {/* Quick Stats Summary */}
        {stats && (
          <Card title={t('player.careerOverview')}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Total Matches */}
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.total_matches || 0}</div>
                <div className="text-sm text-gray-600 mt-1">{t('stats.totalMatches')}</div>
              </div>

              {/* Total Goals */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.total_goals || 0}</div>
                <div className="text-sm text-gray-600 mt-1">{t('stats.totalGoals')}</div>
              </div>

              {/* Total Assists */}
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.total_assists || 0}</div>
                <div className="text-sm text-gray-600 mt-1">{t('stats.totalAssists')}</div>
              </div>

              {/* Career Minutes */}
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.total_minutes || 0}</div>
                <div className="text-sm text-gray-600 mt-1">{t('stats.totalMinutes')}</div>
              </div>
            </div>

            {/* View Full Stats Button */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <Button
                variant="outline"
                onClick={() => navigate('/player/stats')}
              >
                {t('stats.myStatistics')}
              </Button>
            </div>
          </Card>
        )}

        {/* Account Security Section */}
        <Card title={t('player.accountSecurity')} subtitle={t('player.accountSecuritySubtitle')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">{t('player.passwordSecurityNote')}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
            >
              {t('settings.changePassword')}
            </Button>
          </div>
        </Card>
      </div>

      {/* Modals */}
      {user && (
        <>
          {/* Profile Edit Modal */}
          <ProfileEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            user={user}
            onSuccess={handleProfileUpdateSuccess}
          />

          {/* Password Change Modal */}
          <PasswordChangeModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            onSuccess={handlePasswordChangeSuccess}
          />

          {/* Profile Picture Upload Modal */}
          <ProfilePictureUploadModal
            isOpen={showPictureModal}
            onClose={() => setShowPictureModal(false)}
            currentPicture={user.profile_picture || null}
            userName={user.full_name || user.email}
            onSuccess={handlePictureUploadSuccess}
          />
        </>
      )}
    </DashboardLayout>
  );
};

export default ProfilePage;

