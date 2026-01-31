import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks, useTaskCompletions, useSettings } from '@/hooks/useSupabase';
import { submitTaskForApproval } from '@/lib/supabaseActions';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, CheckCircle, Loader2, ListTodo, Send, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TaskSubmission {
  id: string;
  task_id: string;
  status: string;
}

export default function Tasks() {
  const { user, refreshProfile } = useAuth();
  const { tasks, loading } = useTasks(true);
  const { hasCompletedTask } = useTaskCompletions(user?.id);
  const { settings } = useSettings();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [tweetLink, setTweetLink] = useState('');
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);

  // Fetch user's submissions
  React.useEffect(() => {
    if (!user) return;
    
    const fetchSubmissions = async () => {
      const { data } = await supabase
        .from('task_submissions')
        .select('id, task_id, status')
        .eq('user_id', user.id);
      
      if (data) setSubmissions(data);
    };
    
    fetchSubmissions();
  }, [user]);

  const getSubmissionStatus = (taskId: string) => {
    return submissions.find(s => s.task_id === taskId);
  };

  const handleOpenTask = (task: any) => {
    if (task.action_url) {
      window.open(task.action_url, '_blank');
    }
    // For tasks requiring verification (Twitter tasks), show submission dialog
    if (task.requires_verification || task.platform?.toLowerCase().includes('twitter') || task.platform?.toLowerCase().includes('x')) {
      setSelectedTask(task);
      setTweetLink('');
    }
  };

  const handleSubmitTask = async () => {
    if (!user || !selectedTask || !tweetLink.trim()) return;
    
    // Validate tweet link
    const tweetRegex = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/i;
    if (!tweetRegex.test(tweetLink.trim())) {
      toast({ title: 'Invalid link', description: 'Please enter a valid Twitter/X post URL', variant: 'destructive' });
      return;
    }
    
    setSubmitting(selectedTask.id);
    try {
      await submitTaskForApproval(user.id, selectedTask.id, tweetLink.trim());
      toast({ title: 'Submitted!', description: 'Your task is pending admin approval.' });
      setSelectedTask(null);
      setTweetLink('');
      // Refresh submissions
      const { data } = await supabase
        .from('task_submissions')
        .select('id, task_id, status')
        .eq('user_id', user.id);
      if (data) setSubmissions(data);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-primary" /> Tasks
          </h1>
          <p className="text-muted-foreground">Complete tasks to earn VINE tokens</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : tasks.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No tasks available yet. Check back soon!</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => {
              const completed = hasCompletedTask(task.id);
              const submission = getSubmissionStatus(task.id);
              const isPending = submission?.status === 'pending';
              const isRejected = submission?.status === 'rejected';
              const requiresSubmission = task.requires_verification || task.platform?.toLowerCase().includes('twitter') || task.platform?.toLowerCase().includes('x');
              
              return (
                <Card key={task.id} className={completed ? 'opacity-60' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <CardDescription>{task.description}</CardDescription>
                        {task.platform && (
                          <Badge variant="outline" className="mt-2">{task.platform}</Badge>
                        )}
                      </div>
                      <Badge variant={completed ? 'secondary' : 'default'}>+{task.reward} VINE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {completed ? (
                      <Button variant="secondary" disabled>
                        <CheckCircle className="mr-2 h-4 w-4" /> Completed
                      </Button>
                    ) : isPending ? (
                      <Button variant="secondary" disabled>
                        <Clock className="mr-2 h-4 w-4" /> Pending Approval
                      </Button>
                    ) : isRejected ? (
                      <Button 
                        className="gradient-vine"
                        onClick={() => handleOpenTask(task)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> Resubmit Task
                      </Button>
                    ) : (
                      <Button 
                        className="gradient-vine"
                        onClick={() => handleOpenTask(task)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> 
                        {requiresSubmission ? 'Start Task' : 'Complete Task'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Tweet Submission Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Task Proof</DialogTitle>
              <DialogDescription>
                Complete the task and paste your tweet/post link below for verification.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{selectedTask?.title}</p>
                <p className="text-sm text-muted-foreground">{selectedTask?.description}</p>
                {selectedTask?.action_url && (
                  <Button 
                    variant="link" 
                    className="px-0 mt-2" 
                    onClick={() => window.open(selectedTask.action_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" /> Open Task Link
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tweetLink">Tweet/Post Link</Label>
                <Input 
                  id="tweetLink"
                  value={tweetLink}
                  onChange={(e) => setTweetLink(e.target.value)}
                  placeholder="https://x.com/username/status/123456789"
                />
                <p className="text-xs text-muted-foreground">
                  Paste the URL of your tweet or X post as proof of completion
                </p>
              </div>
              <Button 
                className="w-full gradient-vine" 
                onClick={handleSubmitTask}
                disabled={!tweetLink.trim() || submitting === selectedTask?.id}
              >
                {submitting === selectedTask?.id ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Submit for Approval</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
