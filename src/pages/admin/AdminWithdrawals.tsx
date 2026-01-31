import React, { useState, useEffect } from 'react';
import { useAdminWithdrawals, processWithdrawal } from '@/hooks/useAdmin';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Check, X, Loader2, Copy, User } from 'lucide-react';
import { formatVineBalance, formatDate, copyToClipboard } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface WithdrawalWithProfile {
  id: string;
  user_id: string;
  amount: number;
  wallet_address: string;
  status: string;
  created_at: string;
  profile?: { username: string | null; email: string };
}

export default function AdminWithdrawals() {
  const { withdrawals: rawWithdrawals, loading, refetch } = useAdminWithdrawals();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  // Fetch profiles for withdrawals
  useEffect(() => {
    const fetchProfiles = async () => {
      if (rawWithdrawals.length === 0) {
        setWithdrawals([]);
        setProfilesLoading(false);
        return;
      }

      try {
        const userIds = [...new Set(rawWithdrawals.map(w => w.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, email')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const enriched = rawWithdrawals.map(w => ({
          ...w,
          profile: profileMap.get(w.user_id),
        }));
        setWithdrawals(enriched);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setWithdrawals(rawWithdrawals);
      } finally {
        setProfilesLoading(false);
      }
    };

    fetchProfiles();
  }, [rawWithdrawals]);

  const handleProcess = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      await processWithdrawal(id, status);
      toast({ title: 'Success', description: `Withdrawal ${status}` });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  const handleCopyAddress = async (address: string) => {
    await copyToClipboard(address);
    toast({ title: 'Copied!', description: 'Wallet address copied to clipboard' });
  };

  const pending = withdrawals.filter(w => w.status === 'pending');
  const processed = withdrawals.filter(w => w.status !== 'pending');
  const isLoading = loading || profilesLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" /> Withdrawals
          </h1>
          <Badge variant="secondary">{pending.length} pending</Badge>
        </div>

        <Card>
          <CardHeader><CardTitle>Pending Withdrawals</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : pending.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending withdrawals</p>
            ) : (
              <div className="space-y-4">
                {pending.map((w) => (
                  <div key={w.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-lg">{formatVineBalance(w.amount)} VINE</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>{w.profile?.username || w.profile?.email || 'Unknown user'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(w.created_at)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleProcess(w.id, 'approved')}
                          disabled={processing === w.id}
                        >
                          {processing === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Approve</>}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleProcess(w.id, 'rejected')}
                          disabled={processing === w.id}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Wallet Address:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm font-mono break-all">{w.wallet_address}</code>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="flex-shrink-0"
                          onClick={() => handleCopyAddress(w.wallet_address)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Processed Withdrawals</CardTitle></CardHeader>
          <CardContent>
            {processed.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No processed withdrawals</p>
            ) : (
              <div className="space-y-2">
                {processed.slice(0, 20).map((w) => (
                  <div key={w.id} className="flex items-center justify-between py-3 px-4 border-b last:border-0">
                    <div>
                      <p className="font-medium">{formatVineBalance(w.amount)} VINE</p>
                      <p className="text-sm text-muted-foreground">{w.profile?.username || w.profile?.email?.split('@')[0]}</p>
                      <p className="text-xs text-muted-foreground font-mono">{w.wallet_address}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(w.created_at)}</p>
                    </div>
                    <Badge variant={w.status === 'approved' ? 'default' : 'destructive'}>{w.status}</Badge>
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
