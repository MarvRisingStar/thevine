import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useReferrals, useSettings } from '@/hooks/useSupabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Gift, Copy, Users, CheckCircle, Clock } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

export default function Referrals() {
  const { user, profile } = useAuth();
  const { referrals } = useReferrals(user?.id);
  const { settings } = useSettings();
  const { toast } = useToast();

  const referralLink = `${window.location.origin}/signup?ref=${profile?.referral_code || ''}`;

  const handleCopy = async () => {
    await copyToClipboard(referralLink);
    toast({ title: 'Copied!', description: 'Referral link copied to clipboard' });
  };

  const approvedReferrals = referrals.filter(r => r.status === 'approved').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'eligible').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" /> Referrals
          </h1>
          <p className="text-muted-foreground">Invite friends and earn {settings.referralBonus} VINE per referral</p>
        </div>

        <Card className="gradient-vine text-primary-foreground">
          <CardContent className="py-6">
            <p className="text-sm opacity-80 mb-2">Your Referral Code</p>
            <p className="text-3xl font-display font-bold mb-4">{profile?.referral_code || 'Loading...'}</p>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="bg-white/20 border-white/30 text-white" />
              <Button variant="secondary" onClick={handleCopy}><Copy className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card><CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{approvedReferrals}</p>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <Clock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{pendingReferrals}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>How It Works</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Share your referral link with friends</p>
            <p>2. They sign up using your link</p>
            <p>3. They complete {settings.tasksForReferralEligibility} tasks</p>
            <p>4. You receive {settings.referralBonus} VINE after admin approval</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
