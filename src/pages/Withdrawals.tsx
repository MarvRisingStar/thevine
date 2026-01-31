import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWithdrawals, useSettings } from '@/hooks/useSupabase';
import { requestWithdrawal } from '@/lib/supabaseActions';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { formatVineBalance, formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function Withdrawals() {
  const { user, profile, refreshProfile } = useAuth();
  const { withdrawals } = useWithdrawals(user?.id);
  const { settings } = useSettings();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const hasWalletAddress = !!profile?.wallet_address;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!hasWalletAddress) {
      toast({ title: 'Wallet Required', description: 'Please set your Solana wallet address in your profile first', variant: 'destructive' });
      return;
    }

    const withdrawAmount = parseInt(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < settings.minimumWithdrawal) {
      toast({ title: 'Error', description: `Minimum withdrawal is ${settings.minimumWithdrawal} VINE`, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await requestWithdrawal(user.id, withdrawAmount, profile.wallet_address!, settings.minimumWithdrawal);
      await refreshProfile();
      toast({ title: 'Withdrawal requested!', description: 'Your request is pending admin approval.' });
      setAmount('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const canWithdraw = (profile?.balance || 0) >= settings.minimumWithdrawal && hasWalletAddress;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" /> Withdraw
          </h1>
          <p className="text-muted-foreground">Request withdrawal of your VINE tokens</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
            <CardDescription>Minimum: {formatVineBalance(settings.minimumWithdrawal)} VINE | Your balance: {formatVineBalance(profile?.balance || 0)} VINE</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasWalletAddress && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive mb-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Wallet address required</p>
                  <p className="text-xs">Please set your Solana wallet address in your profile before requesting a withdrawal.</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/profile"><ExternalLink className="w-4 h-4 mr-1" /> Profile</Link>
                </Button>
              </div>
            )}

            {hasWalletAddress && (profile?.balance || 0) < settings.minimumWithdrawal && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-700 mb-4">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">You need at least {formatVineBalance(settings.minimumWithdrawal)} VINE to withdraw</p>
              </div>
            )}

            {hasWalletAddress && (
              <div className="p-3 rounded-lg bg-muted/50 mb-4">
                <p className="text-sm text-muted-foreground">Withdrawal will be sent to:</p>
                <p className="font-mono text-sm break-all">{profile?.wallet_address}</p>
                <Button variant="link" size="sm" className="px-0 mt-1" asChild>
                  <Link to="/profile">Change wallet address</Link>
                </Button>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label>Amount (VINE)</Label>
                <Input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  placeholder={`Min: ${settings.minimumWithdrawal}`} 
                  disabled={!canWithdraw} 
                />
              </div>
              <Button type="submit" className="w-full gradient-vine" disabled={!canWithdraw || loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Request Withdrawal'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Withdrawal History</CardTitle></CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No withdrawals yet</p>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{formatVineBalance(w.amount)} VINE</p>
                      <p className="text-xs text-muted-foreground">{formatDate(w.created_at)}</p>
                    </div>
                    <Badge variant={w.status === 'approved' ? 'default' : w.status === 'rejected' ? 'destructive' : 'secondary'}>{w.status}</Badge>
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
