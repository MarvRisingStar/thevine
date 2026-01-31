import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Type definitions matching database schema
export interface Task {
  id: string;
  title: string;
  description: string | null;
  type: string;
  platform: string | null;
  action_url: string | null;
  reward: number;
  is_active: boolean;
  requires_verification: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCompletion {
  id: string;
  user_id: string;
  task_id: string;
  completed_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  tasks_completed: number;
  bonus_paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  wallet_address: string;
  status: string;
  admin_notes: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface Devotional {
  id: string;
  title: string;
  scripture: string;
  content: string;
  scheduled_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

export interface PlatformSettings {
  dailyCheckInReward: number;
  adWatchReward: number;
  referralBonus: number;
  adCooldownMinutes: number;
  minimumWithdrawal: number;
  tasksForReferralEligibility: number;
  adsEnabled: boolean;
  checkInEnabled: boolean;
}

export const DEFAULT_SETTINGS: PlatformSettings = {
  dailyCheckInReward: 50,
  adWatchReward: 25,
  referralBonus: 100,
  adCooldownMinutes: 5,
  minimumWithdrawal: 3000,
  tasksForReferralEligibility: 10,
  adsEnabled: true,
  checkInEnabled: true,
};

// Hook to fetch platform settings
export function useSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value');

        if (error) throw error;

        if (data) {
          const settingsMap: Record<string, string> = {};
          data.forEach((s) => {
            settingsMap[s.key] = s.value;
          });

          setSettings({
            dailyCheckInReward: parseInt(settingsMap.daily_checkin_reward) || DEFAULT_SETTINGS.dailyCheckInReward,
            adWatchReward: parseInt(settingsMap.ad_watch_reward) || DEFAULT_SETTINGS.adWatchReward,
            referralBonus: parseInt(settingsMap.referral_bonus) || DEFAULT_SETTINGS.referralBonus,
            adCooldownMinutes: parseInt(settingsMap.ad_cooldown_minutes) || DEFAULT_SETTINGS.adCooldownMinutes,
            minimumWithdrawal: parseInt(settingsMap.min_withdrawal) || DEFAULT_SETTINGS.minimumWithdrawal,
            tasksForReferralEligibility: parseInt(settingsMap.referral_tasks_required) || DEFAULT_SETTINGS.tasksForReferralEligibility,
            adsEnabled: settingsMap.ads_enabled === 'true',
            checkInEnabled: settingsMap.checkin_enabled !== 'false',
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading };
}

// Hook to fetch tasks
export function useTasks(activeOnly = true) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let query = supabase.from('tasks').select('*');
        
        if (activeOnly) {
          query = query.eq('is_active', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setTasks(data || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [activeOnly]);

  return { tasks, loading };
}

// Hook to fetch user's task completions
export function useTaskCompletions(userId?: string) {
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchCompletions = async () => {
      try {
        const { data, error } = await supabase
          .from('task_completions')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        setCompletions(data || []);
      } catch (error) {
        console.error('Error fetching completions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletions();
  }, [userId]);

  const hasCompletedTask = useCallback(
    (taskId: string) => completions.some((c) => c.task_id === taskId),
    [completions]
  );

  return { completions, loading, hasCompletedTask };
}

// Hook to fetch user's referrals
export function useReferrals(userId?: string) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchReferrals = async () => {
      try {
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReferrals(data || []);
      } catch (error) {
        console.error('Error fetching referrals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [userId]);

  return { referrals, loading };
}

// Hook to fetch user's withdrawals
export function useWithdrawals(userId?: string) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchWithdrawals = async () => {
      try {
        const { data, error } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWithdrawals(data || []);
      } catch (error) {
        console.error('Error fetching withdrawals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, [userId]);

  return { withdrawals, loading };
}

// Hook to fetch user's transactions
export function useTransactions(userId?: string, limit = 10) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId, limit]);

  return { transactions, loading };
}

// Hook to fetch today's devotional
export function useTodaysDevotional() {
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevotional = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('devotionals')
          .select('*')
          .eq('scheduled_date', today)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        setDevotional(data);
      } catch (error) {
        console.error('Error fetching devotional:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevotional();
  }, []);

  return { devotional, loading };
}

// Hook to fetch announcements
export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAnnouncements(data || []);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return { announcements, loading };
}

// Hook to fetch leaderboard using the public view
export function useLeaderboard(limit = 10) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Use the leaderboard_public view which exposes only safe columns
        const { data, error } = await supabase
          .from('leaderboard_public')
          .select('id, username, total_earned, tasks_completed')
          .limit(limit);

        if (error) throw error;
        setLeaderboard(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  return { leaderboard, loading };
}
