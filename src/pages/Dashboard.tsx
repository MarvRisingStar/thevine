import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings, useTransactions, useTodaysDevotional, useAnnouncements } from '@/hooks/useSupabase';
import { performDailyCheckIn, rewardAdWatch } from '@/lib/supabaseActions';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Leaf, 
  Calendar, 
  PlayCircle, 
  Gift, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BookOpen,
  Bell,
  Loader2,
  Flame
} from 'lucide-react';
import { formatVineBalance, getTimeUntilNextCheckIn, getTimeUntilNextAd } from '@/lib/utils';

export default function Dashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const { settings } = useSettings();
  const { transactions } = useTransactions(user?.id, 5);
  const { devotional } = useTodaysDevotional();
  const { announcements } = useAnnouncements();
  const { toast } = useToast();
  
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [adCooldown, setAdCooldown] = useState({ canWatch: true, minutesRemaining: 0, secondsRemaining: 0 });
  const [checkInCooldown, setCheckInCooldown] = useState({ canCheckIn: true, hoursRemaining: 0, minutesRemaining: 0 });

  // Update cooldowns every second
  useEffect(() => {
    const updateCooldowns = () => {
      if (profile?.last_check_in) {
        setCheckInCooldown(getTimeUntilNextCheckIn(profile.last_check_in));
      }
      if (profile?.last_ad_watch) {
        setAdCooldown(getTimeUntilNextAd(profile.last_ad_watch, settings.adCooldownMinutes));
      }
    };

    updateCooldowns();
    const interval = setInterval(updateCooldowns, 1000);
    return () => clearInterval(interval);
  }, [profile?.last_check_in, profile?.last_ad_watch, settings.adCooldownMinutes]);

  const handleDailyCheckIn = async () => {
    if (!user || !checkInCooldown.canCheckIn) return;
    
    setCheckInLoading(true);
    try {
      await performDailyCheckIn(user.id, settings.dailyCheckInReward);
      await refreshProfile();
      toast({
        title: 'Daily Check-In Complete! 🎉',
        description: `You earned ${settings.dailyCheckInReward} VINE!`,
      });
    } catch (error: any) {
      toast({
        title: 'Check-in failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleWatchAd = async () => {
    if (!user || !adCooldown.canWatch || !settings.adsEnabled) return;
    
    setAdLoading(true);
    
    try {
      // Simulate ad watching - in production, integrate with Adsterra
      // The ad must complete before rewarding
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Only reward if ad completed
      await rewardAdWatch(user.id, settings.adWatchReward, 'rewarded', true);
      await refreshProfile();
      toast({
        title: 'Ad Watched! 🎬',
        description: `You earned ${settings.adWatchReward} VINE!`,
      });
    } catch (error: any) {
      toast({
        title: 'Ad reward failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAdLoading(false);
    }
  };

  const isEmailVerified = profile?.email_verified || user?.email_confirmed_at;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Email Verification Warning */}
        {user && !isEmailVerified && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-700">Verify your email to start earning</p>
                <p className="text-sm text-yellow-600">Check your inbox for the verification link.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-start gap-3 py-4">
              <Bell className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-primary">{announcements[0].title}</p>
                <p className="text-sm text-muted-foreground">{announcements[0].content}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome & Balance */}
        <Card className="gradient-vine text-primary-foreground overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdi0ySDEwVjBIOHYyOEgtMTB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30" />
          <CardContent className="relative py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-primary-foreground/80 mb-1">Welcome back,</p>
                <h1 className="text-3xl font-display font-bold mb-2">
                  {profile?.username || 'Vine Member'}
                </h1>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  <span>{profile?.current_streak || 0} day streak</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-primary-foreground/80 text-sm mb-1">Your Balance</p>
                <div className="flex items-center gap-2 justify-end">
                  <Leaf className="w-8 h-8" />
                  <span className="text-4xl font-display font-bold">
                    {formatVineBalance(profile?.balance || 0)}
                  </span>
                </div>
                <p className="text-primary-foreground/60 text-sm">VINE tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Daily Check-In */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Daily Check-In
                </CardTitle>
                <Badge variant="secondary">+{settings.dailyCheckInReward} VINE</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {checkInCooldown.canCheckIn ? (
                <Button 
                  className="w-full gradient-vine" 
                  onClick={handleDailyCheckIn}
                  disabled={checkInLoading || !isEmailVerified}
                >
                  {checkInLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Claim Daily Reward
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center py-2">
                  <p className="text-muted-foreground text-sm mb-2">Next check-in available in:</p>
                  <p className="text-2xl font-bold font-display text-primary">
                    {checkInCooldown.hoursRemaining}h {checkInCooldown.minutesRemaining}m
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Watch Ads */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-primary" />
                  Watch & Earn
                </CardTitle>
                <Badge variant="secondary">+{settings.adWatchReward} VINE</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!settings.adsEnabled ? (
                <p className="text-center text-muted-foreground py-2">Ads are currently disabled</p>
              ) : adCooldown.canWatch ? (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={handleWatchAd}
                  disabled={adLoading || !isEmailVerified}
                >
                  {adLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Watching Ad...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Watch Ad to Earn
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center py-2">
                  <p className="text-muted-foreground text-sm mb-2">Cooldown:</p>
                  <p className="text-2xl font-bold font-display text-primary">
                    {adCooldown.minutesRemaining}:{adCooldown.secondsRemaining.toString().padStart(2, '0')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold font-display">{formatVineBalance(profile?.total_earned || 0)}</p>
                <p className="text-sm text-muted-foreground">Total Earned</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold font-display">{profile?.tasks_completed || 0}</p>
                <p className="text-sm text-muted-foreground">Tasks Done</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Gift className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold font-display">{settings.referralBonus}</p>
                <p className="text-sm text-muted-foreground">Referral Bonus</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Flame className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <p className="text-2xl font-bold font-display">{profile?.current_streak || 0}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Devotional */}
        {devotional && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Daily Devotional
              </CardTitle>
              <CardDescription>{devotional.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                "{devotional.scripture}"
              </blockquote>
              <p className="text-sm">{devotional.content}</p>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No activity yet. Start earning!</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {tx.amount > 0 ? '+' : '-'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tx.description || tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatVineBalance(tx.amount)} VINE
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
