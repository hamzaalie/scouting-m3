import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import EmptyState from '../../components/common/EmptyState';

/**
 * Reports Page (Scout)
 * 
 * Page for scouts to manage their scouting reports and evaluations.
 */
const ReportsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <PageHeader
        title={t('scout.myReports')}
        subtitle={t('scout.reportsSubtitle')}
        action={{
          label: t('scout.createReport'),
          onClick: () => console.log('Create report'),
          variant: "primary",
        }}
      />

      <EmptyState
        icon={
          <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        title={t('scout.noReportsYet')}
        message={t('scout.reportsEmptyMessage')}
        action={{
          label: t('scout.createFirstReport'),
          onClick: () => console.log('Create report'),
        }}
      />
    </DashboardLayout>
  );
};

export default ReportsPage;

