import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/lib/supabaseActions';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Wallet, Mail, Calendar, Loader2, Save, Copy } from 'lucide-react';
import { formatVineBalance, formatDate, copyToClipboard } from '@/lib/utils';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [walletAddress, setWalletAddress] = useState(profile?.wallet_address || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateProfile(user.id, {
        username: username || undefined,
        wallet_address: walletAddress || undefined,
      });
      await refreshProfile();
      toast({ title: 'Profile updated!', description: 'Your changes have been saved.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReferralCode = async () => {
    if (profile?.referral_code) {
      await copyToClipboard(`${window.location.origin}/signup?ref=${profile.referral_code}`);
      toast({ title: 'Copied!', description: 'Referral link copied to clipboard' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-primary" /> Profile
          </h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your basic account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{profile?.email || user?.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Member Since</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{profile?.created_at ? formatDate(profile.created_at) : 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Referral Code</Label>
                <div className="flex items-center gap-2">
                  <Input value={profile?.referral_code || ''} readOnly className="flex-1" />
                  <Button variant="outline" size="icon" onClick={handleCopyReferralCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
              <CardDescription>Your earnings and activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Current Balance</span>
                <span className="font-bold text-lg">{formatVineBalance(profile?.balance || 0)} VINE</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Total Earned</span>
                <span className="font-bold">{formatVineBalance(profile?.total_earned || 0)} VINE</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Tasks Completed</span>
                <span className="font-bold">{profile?.tasks_completed || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Current Streak</span>
                <span className="font-bold">{profile?.current_streak || 0} days</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your username and wallet address</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      placeholder="Your username"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wallet">Solana Wallet Address</Label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="wallet"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="pl-10"
                      placeholder="Your Solana wallet address"
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="gradient-vine" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
