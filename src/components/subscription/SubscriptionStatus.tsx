import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { getAccountDetails, type AccountDetails } from '../../services/authService';

/**
 * SubscriptionStatus Component
 * 
 * Displays user's subscription status, expiration date, and quick stats.
 * Used in profile pages to show access level and account information.
 */
const SubscriptionStatus: React.FC = () => {
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const details = await getAccountDetails();
      setAccountDetails(details);
    } catch (err: unknown) {
      console.error('Failed to load account details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription information';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card title="Subscription Status">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </Card>
    );
  }

  if (error || !accountDetails) {
    return (
      <Card title="Subscription Status">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm">
            {error || 'Unable to load subscription information'}
          </p>
        </div>
      </Card>
    );
  }

  const { subscription, stats } = accountDetails;

  // Determine badge variant based on status
  const getBadgeVariant = (): 'success' | 'warning' | 'danger' | 'info' => {
    if (subscription.isActive) return 'success';
    if (subscription.status === 'expired') return 'danger';
    if (subscription.status === 'cancelled') return 'warning';
    return 'info';
  };

  // Get status display text
  const getStatusText = (): string => {
    return subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1);
  };

  return (
    <Card 
      title="Subscription Status" 
      subtitle="Your current access level and subscription details"
    >
      <div className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Status</span>
          <Badge variant={getBadgeVariant()}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Expiration Info */}
        {subscription.expiresAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Expires On</span>
            <span className="text-sm text-gray-900">
              {new Date(subscription.expiresAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Days Remaining */}
        {subscription.daysRemaining !== null && subscription.isActive && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Days Remaining</span>
            <span className={`text-sm font-semibold ${
              subscription.daysRemaining < 7 ? 'text-red-600' :
              subscription.daysRemaining < 30 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {subscription.daysRemaining} days
            </span>
          </div>
        )}

        {/* Auto-Renew */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Auto-Renew</span>
          <span className="text-sm text-gray-900">
            {subscription.autoRenew ? '✓ Enabled' : '✗ Disabled'}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalPayments}
            </div>
            <div className="text-xs text-gray-600 mt-1">Total Payments</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalSpent.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Total Spent</div>
          </div>
        </div>

        {/* Warning for Expired Subscription */}
        {!subscription.isActive && subscription.status === 'expired' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ Your subscription has expired
            </p>
            <p className="text-xs text-red-600 mt-1">
              Renew your subscription to continue accessing the platform
            </p>
          </div>
        )}

        {/* Warning for Expiring Soon */}
        {subscription.isActive && subscription.daysRemaining !== null && subscription.daysRemaining < 7 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-yellow-700 font-medium">
              ⏰ Subscription expiring soon
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Your subscription expires in {subscription.daysRemaining} days
            </p>
          </div>
        )}

        {/* Manage Subscription Button */}
        <div className="mt-4">
          <Button
            onClick={() => {
              const v1Url = import.meta.env.VITE_V1_URL || 'http://localhost:3001';
              window.open(`${v1Url}/user/user-subscription`, '_blank');
            }}
            variant="outline"
            fullWidth
          >
            Manage Subscription
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SubscriptionStatus;
