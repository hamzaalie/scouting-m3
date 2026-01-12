import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import SubscriptionStatus from '../../components/subscription/SubscriptionStatus';
import ProfileEditModal from '../../components/admin/ProfileEditModal';
import PasswordChangeModal from '../../components/common/PasswordChangeModal';
import ProfilePictureUploadModal from '../../components/common/ProfilePictureUploadModal';
import { getCurrentUser, type User } from '../../services/authService';

/**
 * Profile Page (Scout)
 * 
 * Complete profile management interface for scout users.
 * 
 * Features:
 * - View and edit profile information
 * - Change profile picture
 * - Change password
 * - Display account information (role, join date)
 * - Optional activity summary (players viewed, reports created)
 */
const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();

  // State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [pictureModalOpen, setPictureModalOpen] = useState<boolean>(false);

  // Fetch current user data
  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user data';
      setError(errorMessage);
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleDateString(locale, { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string): 'primary' | 'success' | 'info' => {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'scout':
        return 'success';
      case 'player':
        return 'info';
      default:
        return 'info';
    }
  };

  // Loading state with skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader
          title={t('player.myProfile')}
          subtitle={t('player.manageAccountInfo')}
        />
        <div className="mt-6 space-y-6">
          {/* Profile Information Skeleton */}
          <Card>
            <div className="space-y-6">
              {/* Header with Avatar and Basic Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-200">
                <Skeleton circle width="w-16" height="h-16" />
                <div className="flex-1 space-y-3">
                  <Skeleton width="w-48" height="h-8" />
                  <Skeleton width="w-32" height="h-6" />
                </div>
                <Skeleton width="w-32" height="h-10" />
              </div>

              {/* Profile Details Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton width="w-24" height="h-4" />
                    <Skeleton width="w-full" height="h-6" />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Two Column Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="space-y-4">
                <Skeleton width="w-40" height="h-6" />
                <Skeleton count={3} height="h-4" />
              </div>
            </Card>
            <Card>
              <div className="space-y-4">
                <Skeleton width="w-40" height="h-6" />
                <div className="flex flex-col items-center justify-center p-6">
                  <Skeleton circle width="w-16" height="h-16" className="mb-4" />
                  <Skeleton width="w-32" height="h-4" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <DashboardLayout>
        <PageHeader
          title={t('player.myProfile')}
          subtitle={t('player.manageAccountInfo')}
        />
        <div className="mt-6">
          <Card>
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              {/* Error Message */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('player.failedToLoadProfile')}
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md">
                {error}
              </p>

              {/* Retry Button */}
              <Button
                variant="primary"
                onClick={fetchUserData}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                {t('player.tryAgain')}
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Empty state (no user data)
  if (!user) {
    return (
      <DashboardLayout>
        <PageHeader
          title={t('player.myProfile')}
          subtitle={t('player.manageAccountInfo')}
        />
        <div className="mt-6">
          <Card>
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              {/* Empty State Icon */}
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* Empty State Message */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('player.noProfileData')}
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md">
                {t('player.noProfileDataMessage')}
              </p>

              {/* Retry Button */}
              <Button
                variant="primary"
                onClick={fetchUserData}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                {t('player.reloadProfile')}
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={t('player.myProfile')}
        subtitle={t('player.manageAccountInfo')}
      />

      <div className="mt-6 space-y-6">
        {/* Profile Information Section */}
        <Card>
          <div className="space-y-6">
            {/* Header with Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-200">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar
                  src={user.profile_picture}
                  alt={user.full_name || `${user.first_name} ${user.last_name}`}
                  fallback={`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
                  size="xl"
                  border
                  borderColor="blue-500"
                />
              </div>

              {/* Name and Role */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.full_name || `${user.first_name} ${user.last_name}`}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={getRoleBadgeVariant(user.role)} size="lg">
                    {t(`common.${user.role}`)}
                  </Badge>
                  {user.is_active && (
                    <Badge variant="success" size="sm">
                      {t('player.active')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Button
                  variant="primary"
                  onClick={() => setEditModalOpen(true)}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  }
                  fullWidth
                  className="sm:w-auto"
                >
                  {t('player.editProfile')}
                </Button>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {t('player.email')}
                </label>
                <p className="text-base text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500 italic">{t('player.emailCannotBeChanged')}</p>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {t('player.phone')}
                </label>
                <p className="text-base text-gray-900">
                  {user.phone || <span className="text-gray-400">{t('player.notProvided')}</span>}
                </p>
              </div>

              {/* Date Joined */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('player.memberSince')}
                </label>
                <p className="text-base text-gray-900">{formatDate(user.date_joined)}</p>
              </div>

              {/* User ID */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  {t('player.userId')}
                </label>
                <p className="text-base text-gray-900 font-mono">#{user.id}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription Status Section */}
        <SubscriptionStatus />

        {/* Two Column Layout for Security and Picture */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Security Section */}
          <Card title={t('player.accountSecurity')} subtitle={t('player.accountSecuritySubtitle')}>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{t('settings.changePassword')}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {t('player.passwordSecurityNote')}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPasswordModalOpen(true)}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    }
                  >
                    {t('settings.changePassword')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Picture Section */}
          <Card title={t('player.profilePicture')} subtitle={t('player.profilePictureSubtitle')}>
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                {/* Current Picture Preview */}
                <Avatar
                  src={user.profile_picture}
                  alt={user.full_name || `${user.first_name} ${user.last_name}`}
                  fallback={`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
                  size="xl"
                  border
                  className="mb-4"
                />
                <p className="text-sm text-gray-600 mb-4 text-center">
                  {user.profile_picture ? t('player.updateProfilePicture') : t('player.addProfilePicture')}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setPictureModalOpen(true)}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  {t('player.changePicture')}
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                {t('player.recommendedSize')}
              </p>
            </div>
          </Card>
        </div>

        {/* Activity Summary Section (Optional - Placeholder for future) */}
        <Card title={t('scout.myReports')} subtitle={t('scout.reportsSubtitle')}>
          <div className="flex items-center justify-center py-8 px-4">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('scout.comingSoon')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('scout.reportsEmptyMessage')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Profile Edit Modal */}
      {user && (
        <ProfileEditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={user}
          onSuccess={(updatedUser) => {
            setUser(updatedUser);
            setEditModalOpen(false);
          }}
        />
      )}

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSuccess={() => {
          setPasswordModalOpen(false);
        }}
      />

      {/* Profile Picture Upload Modal */}
      {user && (
        <ProfilePictureUploadModal
          isOpen={pictureModalOpen}
          onClose={() => setPictureModalOpen(false)}
          currentPicture={user.profile_picture || null}
          userName={user.full_name || `${user.first_name} ${user.last_name}`}
          onSuccess={(newPictureUrl) => {
            setUser({ ...user, profile_picture: newPictureUrl });
            setPictureModalOpen(false);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default ProfilePage;

