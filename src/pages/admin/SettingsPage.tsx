import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';

/**
 * Settings Page (Admin)
 * 
 * Placeholder page for platform settings.
 */
const SettingsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.platformSettingsSubtitle')}
      />
      <div className="mt-6">
        <p className="text-gray-600">{t('settings.contentComingSoon')}</p>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

