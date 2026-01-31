import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Admin hooks for backend management

interface AdminStats {
  totalUsers: number;
  totalRewardsIssued: number;
  pendingWithdrawals: number;
  eligibleReferrals: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRewardsIssued: 0,
    pendingWithdrawals: 0,
    eligibleReferrals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get total rewards from profiles
        const { data: rewardsData } = await supabase
          .from('profiles')
          .select('total_earned');
        
        const totalRewards = rewardsData?.reduce((sum, p) => sum + (p.total_earned || 0), 0) || 0;

        // Get pending withdrawals
        const { count: pendingCount } = await supabase
          .from('withdrawals')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Get eligible referrals
        const { count: eligibleCount } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'eligible');

        setStats({
          totalUsers: userCount || 0,
          totalRewardsIssued: totalRewards,
          pendingWithdrawals: pendingCount || 0,
          eligibleReferrals: eligibleCount || 0,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}

// Admin: Get all users
export function useAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, refetch: fetchUsers };
}

// Admin: Get all withdrawals
export function useAdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return { withdrawals, loading, refetch: fetchWithdrawals };
}

// Admin: Get all referrals
export function useAdminReferrals() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  return { referrals, loading, refetch: fetchReferrals };
}

// Admin: Get all tasks
export function useAdminTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return { tasks, loading, refetch: fetchTasks };
}

// Admin: Get all devotionals
export function useAdminDevotionals() {
  const [devotionals, setDevotionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevotionals = async () => {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      setDevotionals(data || []);
    } catch (error) {
      console.error('Error fetching devotionals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevotionals();
  }, []);

  return { devotionals, loading, refetch: fetchDevotionals };
}

// Admin action: Approve/Reject withdrawal
export async function processWithdrawal(withdrawalId: string, status: 'approved' | 'rejected', adminNotes?: string) {
  const { error } = await supabase
    .from('withdrawals')
    .update({
      status,
      admin_notes: adminNotes,
      processed_at: new Date().toISOString(),
    })
    .eq('id', withdrawalId);

  if (error) throw error;
}

// Admin action: Approve/Reject referral
export async function processReferral(referralId: string, status: 'approved' | 'rejected', referrerId: string, bonusAmount: number) {
  // Update referral status
  const { error: referralError } = await supabase
    .from('referrals')
    .update({
      status,
      bonus_paid: status === 'approved',
    })
    .eq('id', referralId);

  if (referralError) throw referralError;

  // If approved, add bonus to referrer
  if (status === 'approved') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance, total_earned')
      .eq('user_id', referrerId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          balance: profile.balance + bonusAmount,
          total_earned: profile.total_earned + bonusAmount,
        })
        .eq('user_id', referrerId);

      await supabase
        .from('transactions')
        .insert({
          user_id: referrerId,
          type: 'referral',
          amount: bonusAmount,
          description: 'Referral bonus approved',
          reference_id: referralId,
        });
    }
  }
}

// Admin action: Create task
export async function createTask(task: {
  title: string;
  description: string;
  type: 'social' | 'custom';
  platform?: string;
  action_url?: string;
  reward: number;
  is_active?: boolean;
  requires_verification?: boolean;
}) {
  const { error } = await supabase.from('tasks').insert(task);
  if (error) throw error;
}

// Admin action: Update task
export async function updateTask(taskId: string, updates: any) {
  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId);
  if (error) throw error;
}

// Admin action: Delete task
export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  if (error) throw error;
}

// Admin action: Update settings
export async function updateSetting(key: string, value: string) {
  const { error } = await supabase
    .from('settings')
    .update({ value })
    .eq('key', key);
  if (error) throw error;
}

// Admin action: Suspend/Unsuspend user
export async function updateUserStatus(userId: string, isSuspended: boolean) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_suspended: isSuspended })
    .eq('user_id', userId);
  if (error) throw error;
}

// Admin action: Adjust user balance
export async function adjustUserBalance(userId: string, amount: number, reason: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('balance, total_earned')
    .eq('user_id', userId)
    .single();

  if (!profile) throw new Error('User not found');

  const newBalance = profile.balance + amount;
  const newTotalEarned = amount > 0 ? profile.total_earned + amount : profile.total_earned;

  const { error } = await supabase
    .from('profiles')
    .update({
      balance: newBalance,
      total_earned: newTotalEarned,
    })
    .eq('user_id', userId);

  if (error) throw error;

  await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'admin_adjustment',
      amount,
      description: reason,
    });
}

// Admin action: Create devotional
export async function createDevotional(devotional: {
  title: string;
  scripture: string;
  content: string;
  scheduled_date: string;
  is_active?: boolean;
}) {
  const { error } = await supabase.from('devotionals').insert(devotional);
  if (error) throw error;
}

// Admin action: Update devotional
export async function updateDevotional(devotionalId: string, updates: any) {
  const { error } = await supabase
    .from('devotionals')
    .update(updates)
    .eq('id', devotionalId);
  if (error) throw error;
}

// Admin action: Delete devotional
export async function deleteDevotional(devotionalId: string) {
  const { error } = await supabase
    .from('devotionals')
    .delete()
    .eq('id', devotionalId);
  if (error) throw error;
}

// Admin action: Create announcement
export async function createAnnouncement(announcement: {
  title: string;
  content: string;
  is_active?: boolean;
}) {
  const { error } = await supabase.from('announcements').insert(announcement);
  if (error) throw error;
}

// Admin action: Update announcement
export async function updateAnnouncement(announcementId: string, updates: any) {
  const { error } = await supabase
    .from('announcements')
    .update(updates)
    .eq('id', announcementId);
  if (error) throw error;
}

// Admin action: Delete announcement
export async function deleteAnnouncement(announcementId: string) {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', announcementId);
  if (error) throw error;
}
