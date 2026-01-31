import { supabase } from '@/integrations/supabase/client';

// Daily check-in
export async function performDailyCheckIn(userId: string, reward: number) {
  // Get current profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('last_check_in, current_streak, balance, total_earned')
    .eq('user_id', userId)
    .single();

  if (profileError) throw profileError;

  // Check if already checked in today
  if (profile.last_check_in) {
    const lastCheckIn = new Date(profile.last_check_in);
    const now = new Date();
    const diffHours = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      throw new Error('You can only check in once every 24 hours');
    }
  }

  // Calculate new streak
  let newStreak = 1;
  if (profile.last_check_in) {
    const lastCheckIn = new Date(profile.last_check_in);
    const now = new Date();
    const diffHours = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
    
    // If within 48 hours, continue streak; otherwise reset
    if (diffHours < 48) {
      newStreak = profile.current_streak + 1;
    }
  }

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      balance: profile.balance + reward,
      total_earned: profile.total_earned + reward,
      current_streak: newStreak,
      last_check_in: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  // Record transaction
  const { error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'check_in',
      amount: reward,
      description: `Daily check-in reward (Day ${newStreak} streak)`,
    });

  if (txError) throw txError;

  return { newStreak, reward };
}

// Watch ad and earn
export async function rewardAdWatch(userId: string, reward: number, adType: 'interstitial' | 'rewarded', adCompleted: boolean) {
  if (!adCompleted) {
    throw new Error('Ad was not completed. Please watch the full ad to earn rewards.');
  }

  // Get current profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('last_ad_watch, balance, total_earned')
    .eq('user_id', userId)
    .single();

  if (profileError) throw profileError;

  // Check cooldown (5 minutes)
  if (profile.last_ad_watch) {
    const lastAd = new Date(profile.last_ad_watch);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastAd.getTime()) / (1000 * 60);
    
    if (diffMinutes < 5) {
      throw new Error('Please wait before watching another ad');
    }
  }

  // Record ad view
  const { error: adError } = await supabase
    .from('ad_views')
    .insert({
      user_id: userId,
      ad_type: adType,
      completed: adCompleted,
      rewarded: true,
    });

  if (adError) throw adError;

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      balance: profile.balance + reward,
      total_earned: profile.total_earned + reward,
      last_ad_watch: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  // Record transaction
  const { error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'ad_watch',
      amount: reward,
      description: `Watched ${adType} ad`,
    });

  if (txError) throw txError;

  return { reward };
}

// Submit task for manual approval (e.g., tweet link)
export async function submitTaskForApproval(userId: string, taskId: string, submissionLink: string) {
  // Check if already submitted or completed
  const { data: existingSubmission } = await supabase
    .from('task_submissions')
    .select('id, status')
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .maybeSingle();

  if (existingSubmission) {
    if (existingSubmission.status === 'approved') {
      throw new Error('Task already completed');
    }
    if (existingSubmission.status === 'pending') {
      throw new Error('Task already submitted and pending approval');
    }
    // If rejected, allow resubmission - update existing record
    const { error } = await supabase
      .from('task_submissions')
      .update({
        submission_link: submissionLink,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .eq('id', existingSubmission.id);
    
    if (error) throw error;
    return;
  }

  // Create new submission
  const { error } = await supabase
    .from('task_submissions')
    .insert({
      user_id: userId,
      task_id: taskId,
      submission_link: submissionLink,
      status: 'pending',
    });

  if (error) throw error;
}

// Complete task (called by admin when approving submission, or directly if no verification required)
export async function completeTask(userId: string, taskId: string, reward: number) {
  // Check if already completed
  const { data: existing } = await supabase
    .from('task_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .maybeSingle();

  if (existing) {
    throw new Error('Task already completed');
  }

  // Get current profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('balance, total_earned, tasks_completed')
    .eq('user_id', userId)
    .single();

  if (profileError) throw profileError;

  // Record completion
  const { error: completionError } = await supabase
    .from('task_completions')
    .insert({
      user_id: userId,
      task_id: taskId,
    });

  if (completionError) throw completionError;

  // Update profile
  const newTasksCompleted = profile.tasks_completed + 1;
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      balance: profile.balance + reward,
      total_earned: profile.total_earned + reward,
      tasks_completed: newTasksCompleted,
    })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  // Record transaction
  const { error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'task',
      amount: reward,
      description: 'Task completed',
      reference_id: taskId,
    });

  if (txError) throw txError;

  // Update referral status if applicable (auto-move to eligible at 10 tasks)
  await updateReferralStatus(userId, newTasksCompleted);

  return { reward };
}

// Update referral status - move to eligible when referred user completes 10 tasks
async function updateReferralStatus(userId: string, tasksCompleted: number) {
  try {
    // Get the referral record where this user is the referred person
    const { data: referral } = await supabase
      .from('referrals')
      .select('id, status')
      .eq('referred_id', userId)
      .maybeSingle();

    if (!referral) return;

    // Update tasks_completed count
    const updates: any = { tasks_completed: tasksCompleted };
    
    // If user has completed 10+ tasks and status is still pending, move to eligible
    if (tasksCompleted >= 10 && referral.status === 'pending') {
      updates.status = 'eligible';
    }

    await supabase
      .from('referrals')
      .update(updates)
      .eq('id', referral.id);
  } catch (error) {
    console.error('Error updating referral status:', error);
  }
}

// Request withdrawal
export async function requestWithdrawal(
  userId: string, 
  amount: number, 
  walletAddress: string, 
  minimumWithdrawal: number
) {
  if (amount < minimumWithdrawal) {
    throw new Error(`Minimum withdrawal is ${minimumWithdrawal} VINE`);
  }

  if (!walletAddress) {
    throw new Error('Please set your wallet address in your profile first');
  }

  // Get current balance
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (profileError) throw profileError;

  if (profile.balance < amount) {
    throw new Error('Insufficient balance');
  }

  // Create withdrawal request
  const { error: withdrawError } = await supabase
    .from('withdrawals')
    .insert({
      user_id: userId,
      amount,
      wallet_address: walletAddress,
      status: 'pending',
    });

  if (withdrawError) throw withdrawError;

  // Deduct from balance
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      balance: profile.balance - amount,
    })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  // Record transaction
  const { error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'withdrawal',
      amount: -amount,
      description: 'Withdrawal request submitted',
    });

  if (txError) throw txError;
}

// Update profile
export async function updateProfile(userId: string, updates: {
  username?: string;
  wallet_address?: string;
}) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId);

  if (error) throw error;
}
