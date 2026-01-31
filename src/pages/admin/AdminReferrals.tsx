import React, { useState } from 'react';
import { useAdminReferrals, processReferral } from '@/hooks/useAdmin';
import { useSettings } from '@/hooks/useSupabase';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Gift, Check, X, Loader2, CheckCheck, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ReferralWithProfiles {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  tasks_completed: number;
  bonus_paid: boolean;
  created_at: string;
  referrer?: { username: string | null; email: string };
  referred?: { username: string | null; email: string; tasks_completed: number };
}

export default function AdminReferrals() {
  const { referrals: rawReferrals, loading, refetch } = useAdminReferrals();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [referralsWithProfiles, setReferralsWithProfiles] = useState<ReferralWithProfiles[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  // Fetch profiles for referrer and referred users
  React.useEffect(() => {
    const fetchProfiles = async () => {
      if (rawReferrals.length === 0) {
        setReferralsWithProfiles([]);
        setProfilesLoading(false);
        return;
      }

      try {
        const userIds = [...new Set([
          ...rawReferrals.map(r => r.referrer_id),
          ...rawReferrals.map(r => r.referred_id)
        ])];

        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('user_id, username, email, tasks_completed')
          .in('user_id', userIds);

        if (error) throw error;

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        const enriched = rawReferrals.map(r => ({
          ...r,
          referrer: profileMap.get(r.referrer_id),
          referred: profileMap.get(r.referred_id),
        }));

        setReferralsWithProfiles(enriched);
      } catch (error) {
        console.error('Error fetching profiles for referrals:', error);
        setReferralsWithProfiles(rawReferrals);
      } finally {
        setProfilesLoading(false);
      }
    };

    fetchProfiles();
  }, [rawReferrals]);

  const handleProcess = async (id: string, referrerId: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      await processReferral(id, status, referrerId, settings.referralBonus);
      toast({ title: 'Success', description: `Referral ${status}` });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  const handleVerifyAll = async () => {
    const eligibleToApprove = referralsWithProfiles.filter(r => r.status === 'eligible');
    if (eligibleToApprove.length === 0) {
      toast({ title: 'No eligible referrals', description: 'There are no referrals ready for approval.' });
      return;
    }

    setVerifyingAll(true);
    let successCount = 0;
    let errorCount = 0;

    for (const r of eligibleToApprove) {
      try {
        await processReferral(r.id, 'approved', r.referrer_id, settings.referralBonus);
        successCount++;
      } catch {
        errorCount++;
      }
    }

    toast({
      title: 'Verify All Complete',
      description: `${successCount} approved, ${errorCount} failed.`,
    });
    refetch();
    setVerifyingAll(false);
  };

  const eligible = referralsWithProfiles.filter(r => r.status === 'eligible');
  const pending = referralsWithProfiles.filter(r => r.status === 'pending');
  const processed = referralsWithProfiles.filter(r => r.status === 'approved' || r.status === 'rejected');

  const isLoading = loading || profilesLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" /> Referrals
          </h1>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{eligible.length} eligible</Badge>
            <Button 
              onClick={handleVerifyAll} 
              disabled={verifyingAll || eligible.length === 0}
              className="gradient-vine"
            >
              {verifyingAll ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
              ) : (
                <><CheckCheck className="w-4 h-4 mr-2" /> Verify All ({eligible.length})</>
              )}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Eligible for Approval ({eligible.length})</CardTitle>
            <CardDescription>These referrals have completed {settings.tasksForReferralEligibility}+ tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : eligible.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No referrals ready for approval</p>
            ) : (
              <div className="space-y-4">
                {eligible.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-900/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {r.referrer?.username || r.referrer?.email || 'Unknown'}
                        </span>
                        <span className="text-muted-foreground">referred</span>
                        <span className="font-medium">
                          {r.referred?.username || r.referred?.email || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tasks by referred: <span className="font-semibold text-green-600">{r.referred?.tasks_completed || r.tasks_completed}/{settings.tasksForReferralEligibility}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleProcess(r.id, r.referrer_id, 'approved')}
                        disabled={processing === r.id}
                      >
                        {processing === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Approve</>}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleProcess(r.id, r.referrer_id, 'rejected')}
                        disabled={processing === r.id}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending ({pending.length})</CardTitle>
            <CardDescription>Referred users still completing tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No pending referrals</p>
            ) : (
              <div className="space-y-2">
                {pending.slice(0, 20).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-3 px-4 border-b last:border-0 rounded-lg hover:bg-muted/30">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{r.referrer?.username || r.referrer?.email?.split('@')[0] || 'Unknown'}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">{r.referred?.username || r.referred?.email?.split('@')[0] || 'Unknown'}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Tasks: {r.referred?.tasks_completed || r.tasks_completed}/{settings.tasksForReferralEligibility} • {formatDate(r.created_at)}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {((r.referred?.tasks_completed || r.tasks_completed) / settings.tasksForReferralEligibility * 100).toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Processed</CardTitle></CardHeader>
          <CardContent>
            {processed.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No processed referrals</p>
            ) : (
              <div className="space-y-2">
                {processed.slice(0, 20).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm">
                        {r.referrer?.username || r.referrer?.email?.split('@')[0]} → {r.referred?.username || r.referred?.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                    </div>
                    <Badge variant={r.status === 'approved' ? 'default' : 'destructive'}>{r.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}