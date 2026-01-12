import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import EmptyState from '../../components/common/EmptyState';

/**
 * Favorites Page (Scout)
 * 
 * Page for scouts to view their favorited players.
 */
const FavoritesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <PageHeader
        title={t('scout.favorites')}
        subtitle={t('scout.favoritesSubtitle')}
        action={{
          label: t('scout.browsePlayers'),
          onClick: () => console.log('Browse players'),
          variant: "primary",
        }}
      />

      <EmptyState
        icon={
          <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        }
        title={t('scout.noFavoritesYet')}
        message={t('scout.favoritesEmptyMessage')}
        action={{
          label: t('scout.discoverPlayers'),
          onClick: () => console.log('Discover players'),
        }}
      />
    </DashboardLayout>
  );
};

export default FavoritesPage;

