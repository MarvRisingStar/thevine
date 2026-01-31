import React from 'react';
import { useAdminStats, useAdminWithdrawals, useAdminReferrals } from '@/hooks/useAdmin';
import { useSettings } from '@/hooks/useSupabase';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Gift, TrendingUp, Clock } from 'lucide-react';
import { formatVineBalance } from '@/lib/utils';

export default function AdminDashboard() {
  const { stats } = useAdminStats();
  const { settings } = useSettings();
  const { withdrawals } = useAdminWithdrawals();
  const { referrals } = useAdminReferrals();

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const eligibleReferrals = referrals.filter(r => r.status === 'eligible');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{formatVineBalance(stats.totalRewardsIssued)}</p>
            <p className="text-sm text-muted-foreground">VINE Issued</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <Clock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{pendingWithdrawals.length}</p>
            <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <Gift className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{eligibleReferrals.length}</p>
            <p className="text-sm text-muted-foreground">Referrals to Approve</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Current Settings</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span className="text-muted-foreground">Daily Check-in:</span> <strong>{settings.dailyCheckInReward} VINE</strong></div>
            <div><span className="text-muted-foreground">Ad Reward:</span> <strong>{settings.adWatchReward} VINE</strong></div>
            <div><span className="text-muted-foreground">Referral Bonus:</span> <strong>{settings.referralBonus} VINE</strong></div>
            <div><span className="text-muted-foreground">Min Withdrawal:</span> <strong>{settings.minimumWithdrawal} VINE</strong></div>
            <div><span className="text-muted-foreground">Ad Cooldown:</span> <strong>{settings.adCooldownMinutes} min</strong></div>
            <div><span className="text-muted-foreground">Tasks for Referral:</span> <strong>{settings.tasksForReferralEligibility}</strong></div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
