import React, { useState, useEffect } from 'react';
import { useAdminUsers, updateUserStatus, adjustUserBalance } from '@/hooks/useAdmin';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Ban, DollarSign, Loader2, Eye, Mail, Wallet, Calendar, Gift, TrendingUp, CheckCircle } from 'lucide-react';
import { formatVineBalance, formatDate } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface UserDetails {
  referralsCount: number;
  withdrawalsCount: number;
  withdrawals: any[];
  referrals: any[];
}

export default function AdminUsers() {
  const { users, loading, refetch } = useAdminUsers();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuspend = async (userId: string, isSuspended: boolean) => {
    try {
      await updateUserStatus(userId, !isSuspended);
      toast({ title: isSuspended ? 'User unsuspended' : 'User suspended' });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAdjust = async () => {
    if (!selectedUser || !adjustAmount) return;
    try {
      await adjustUserBalance(selectedUser.user_id, parseInt(adjustAmount), adjustReason || 'Admin adjustment');
      toast({ title: 'Balance adjusted!' });
      setAdjustOpen(false);
      setAdjustAmount('');
      setAdjustReason('');
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleViewUser = async (user: any) => {
    setSelectedUser(user);
    setViewOpen(true);
    setDetailsLoading(true);
    setUserDetails(null);

    try {
      // Fetch referrals where this user is the referrer
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.user_id)
        .order('created_at', { ascending: false });

      // Fetch withdrawals
      const { data: withdrawals, error: wdError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false });

      if (refError || wdError) throw refError || wdError;

      setUserDetails({
        referralsCount: referrals?.length || 0,
        withdrawalsCount: withdrawals?.length || 0,
        referrals: referrals || [],
        withdrawals: withdrawals || [],
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({ title: 'Error loading details', variant: 'destructive' });
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Users
          </h1>
          <Badge variant="secondary">{users.length} total</Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by email or username..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.username || 'No username'}</p>
                        {user.email_verified && <Badge variant="outline" className="text-green-600 border-green-300">Verified</Badge>}
                        {user.is_suspended && <Badge variant="destructive">Suspended</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Joined: {formatDate(user.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatVineBalance(user.balance)} VINE</p>
                      <p className="text-xs text-muted-foreground">{user.tasks_completed} tasks</p>
                      <div className="flex gap-2 mt-2">
                        {/* View More Dialog */}
                        <Button size="sm" variant="outline" onClick={() => handleViewUser(user)}>
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Adjust Balance Dialog */}
                        <Dialog open={adjustOpen && selectedUser?.id === user.id} onOpenChange={(o) => { setAdjustOpen(o); if (o) setSelectedUser(user); }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                              <DollarSign className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Adjust Balance</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm">Current: {formatVineBalance(selectedUser?.balance || 0)} VINE</p>
                              <div>
                                <Label>Amount (use negative to deduct)</Label>
                                <Input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} />
                              </div>
                              <div>
                                <Label>Reason</Label>
                                <Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Admin adjustment" />
                              </div>
                              <Button onClick={handleAdjust} className="w-full">Adjust Balance</Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          size="sm" 
                          variant={user.is_suspended ? 'default' : 'destructive'}
                          onClick={() => handleSuspend(user.user_id, user.is_suspended)}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View User Details Dialog */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4 pr-4">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{selectedUser.username || 'No username'}</span>
                      {selectedUser.email_verified && <Badge variant="outline" className="text-green-600">Verified</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {selectedUser.email}
                    </div>
                    {selectedUser.wallet_address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wallet className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{selectedUser.wallet_address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(selectedUser.created_at)}
                    </div>
                  </div>

                  <Separator />

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <TrendingUp className="w-6 h-6 mx-auto text-primary mb-1" />
                        <p className="text-xl font-bold">{formatVineBalance(selectedUser.balance)}</p>
                        <p className="text-xs text-muted-foreground">Balance</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <TrendingUp className="w-6 h-6 mx-auto text-green-500 mb-1" />
                        <p className="text-xl font-bold">{formatVineBalance(selectedUser.total_earned)}</p>
                        <p className="text-xs text-muted-foreground">Total Earned</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <CheckCircle className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                        <p className="text-xl font-bold">{selectedUser.tasks_completed}</p>
                        <p className="text-xs text-muted-foreground">Tasks</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <Gift className="w-6 h-6 mx-auto text-purple-500 mb-1" />
                        <p className="text-xl font-bold">{detailsLoading ? '...' : userDetails?.referralsCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Referrals</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  {/* Referral Info */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Gift className="w-4 h-4" /> Referral Info
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Code: <span className="font-mono font-semibold">{selectedUser.referral_code}</span>
                    </p>
                    {selectedUser.referred_by && (
                      <p className="text-sm text-muted-foreground">
                        Referred by: <span className="font-mono">{selectedUser.referred_by}</span>
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Withdrawals */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> Withdrawals ({detailsLoading ? '...' : userDetails?.withdrawalsCount || 0})
                    </h4>
                    {detailsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : userDetails?.withdrawals && userDetails.withdrawals.length > 0 ? (
                      <div className="space-y-2">
                        {userDetails.withdrawals.slice(0, 5).map((w: any) => (
                          <div key={w.id} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                            <span>{formatVineBalance(w.amount)} VINE</span>
                            <Badge variant={w.status === 'approved' ? 'default' : w.status === 'pending' ? 'secondary' : 'destructive'}>
                              {w.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No withdrawals</p>
                    )}
                  </div>

                  <Separator />

                  {/* Recent Referrals */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Recent Referrals
                    </h4>
                    {detailsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : userDetails?.referrals && userDetails.referrals.length > 0 ? (
                      <div className="space-y-2">
                        {userDetails.referrals.slice(0, 5).map((r: any) => (
                          <div key={r.id} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                            <span>Tasks: {r.tasks_completed}/10</span>
                            <Badge variant={r.status === 'approved' ? 'default' : r.status === 'eligible' ? 'outline' : 'secondary'}>
                              {r.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No referrals made</p>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}