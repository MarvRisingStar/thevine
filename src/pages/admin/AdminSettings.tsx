import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSupabase';
import { updateSetting } from '@/hooks/useAdmin';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Loader2 } from 'lucide-react';

export default function AdminSettings() {
  const { settings, loading: settingsLoading } = useSettings();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    daily_checkin_reward: '50',
    ad_watch_reward: '25',
    referral_bonus: '100',
    ad_cooldown_minutes: '5',
    min_withdrawal: '3000',
    referral_tasks_required: '10',
    ads_enabled: true,
    checkin_enabled: true,
  });

  useEffect(() => {
    if (!settingsLoading) {
      setForm({
        daily_checkin_reward: settings.dailyCheckInReward.toString(),
        ad_watch_reward: settings.adWatchReward.toString(),
        referral_bonus: settings.referralBonus.toString(),
        ad_cooldown_minutes: settings.adCooldownMinutes.toString(),
        min_withdrawal: settings.minimumWithdrawal.toString(),
        referral_tasks_required: settings.tasksForReferralEligibility.toString(),
        ads_enabled: settings.adsEnabled,
        checkin_enabled: settings.checkInEnabled,
      });
    }
  }, [settings, settingsLoading]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all([
        updateSetting('daily_checkin_reward', form.daily_checkin_reward),
        updateSetting('ad_watch_reward', form.ad_watch_reward),
        updateSetting('referral_bonus', form.referral_bonus),
        updateSetting('ad_cooldown_minutes', form.ad_cooldown_minutes),
        updateSetting('min_withdrawal', form.min_withdrawal),
        updateSetting('referral_tasks_required', form.referral_tasks_required),
        updateSetting('ads_enabled', form.ads_enabled.toString()),
        updateSetting('checkin_enabled', form.checkin_enabled.toString()),
      ]);
      toast({ title: 'Settings saved!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> Settings
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Reward Settings</CardTitle>
            <CardDescription>Configure VINE rewards for various actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Daily Check-in Reward (VINE)</Label>
                <Input 
                  type="number" 
                  value={form.daily_checkin_reward} 
                  onChange={(e) => setForm({ ...form, daily_checkin_reward: e.target.value })} 
                />
              </div>
              <div>
                <Label>Ad Watch Reward (VINE)</Label>
                <Input 
                  type="number" 
                  value={form.ad_watch_reward} 
                  onChange={(e) => setForm({ ...form, ad_watch_reward: e.target.value })} 
                />
              </div>
              <div>
                <Label>Referral Bonus (VINE)</Label>
                <Input 
                  type="number" 
                  value={form.referral_bonus} 
                  onChange={(e) => setForm({ ...form, referral_bonus: e.target.value })} 
                />
              </div>
              <div>
                <Label>Ad Cooldown (minutes)</Label>
                <Input 
                  type="number" 
                  value={form.ad_cooldown_minutes} 
                  onChange={(e) => setForm({ ...form, ad_cooldown_minutes: e.target.value })} 
                />
              </div>
              <div>
                <Label>Minimum Withdrawal (VINE)</Label>
                <Input 
                  type="number" 
                  value={form.min_withdrawal} 
                  onChange={(e) => setForm({ ...form, min_withdrawal: e.target.value })} 
                />
              </div>
              <div>
                <Label>Tasks for Referral Eligibility</Label>
                <Input 
                  type="number" 
                  value={form.referral_tasks_required} 
                  onChange={(e) => setForm({ ...form, referral_tasks_required: e.target.value })} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Toggles</CardTitle>
            <CardDescription>Enable or disable platform features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Ads Enabled</Label>
                <p className="text-sm text-muted-foreground">Allow users to watch ads for rewards</p>
              </div>
              <Switch 
                checked={form.ads_enabled} 
                onCheckedChange={(c) => setForm({ ...form, ads_enabled: c })} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Daily Check-in Enabled</Label>
                <p className="text-sm text-muted-foreground">Allow daily check-in rewards</p>
              </div>
              <Switch 
                checked={form.checkin_enabled} 
                onCheckedChange={(c) => setForm({ ...form, checkin_enabled: c })} 
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={loading} className="gradient-vine">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </AdminLayout>
  );
}
