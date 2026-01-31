import React, { useState, useEffect } from 'react';
import { useAdminTasks, createTask, updateTask, deleteTask } from '@/hooks/useAdmin';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ListTodo, Plus, Edit, Trash2, Loader2, Check, X, ExternalLink, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';
import { completeTask } from '@/lib/supabaseActions';

interface TaskSubmission {
  id: string;
  user_id: string;
  task_id: string;
  submission_link: string;
  status: string;
  created_at: string;
  task?: { title: string; reward: number };
  profile?: { username: string | null; email: string };
}

export default function AdminTasks() {
  const { tasks, loading, refetch } = useAdminTasks();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [processingSubmission, setProcessingSubmission] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'social' as 'social' | 'custom',
    platform: '',
    action_url: '',
    reward: 10,
    is_active: true,
    requires_verification: true,
  });

  // Fetch pending task submissions
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data: subs, error } = await supabase
        .from('task_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (subs && subs.length > 0) {
        // Get tasks and profiles
        const taskIds = [...new Set(subs.map(s => s.task_id))];
        const userIds = [...new Set(subs.map(s => s.user_id))];

        const [tasksRes, profilesRes] = await Promise.all([
          supabase.from('tasks').select('id, title, reward').in('id', taskIds),
          supabase.from('profiles').select('user_id, username, email').in('user_id', userIds),
        ]);

        const taskMap = new Map(tasksRes.data?.map(t => [t.id, t]) || []);
        const profileMap = new Map(profilesRes.data?.map(p => [p.user_id, p]) || []);

        const enriched = subs.map(s => ({
          ...s,
          task: taskMap.get(s.task_id),
          profile: profileMap.get(s.user_id),
        }));

        setSubmissions(enriched);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleProcessSubmission = async (submission: TaskSubmission, approved: boolean) => {
    setProcessingSubmission(submission.id);
    try {
      if (approved) {
        // Mark submission as approved
        await supabase
          .from('task_submissions')
          .update({ status: 'approved', reviewed_at: new Date().toISOString() })
          .eq('id', submission.id);

        // Complete the task for the user (award tokens)
        await completeTask(submission.user_id, submission.task_id, submission.task?.reward || 0);
        toast({ title: 'Approved!', description: 'User has been rewarded.' });
      } else {
        // Mark submission as rejected
        await supabase
          .from('task_submissions')
          .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
          .eq('id', submission.id);
        toast({ title: 'Rejected', description: 'Submission has been rejected.' });
      }
      fetchSubmissions();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setProcessingSubmission(null);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      type: 'social',
      platform: '',
      action_url: '',
      reward: 10,
      is_active: true,
      requires_verification: true,
    });
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateTask(editId, form);
        toast({ title: 'Task updated!' });
      } else {
        await createTask(form);
        toast({ title: 'Task created!' });
      }
      setOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (task: any) => {
    setForm({
      title: task.title,
      description: task.description || '',
      type: task.type,
      platform: task.platform || '',
      action_url: task.action_url || '',
      reward: task.reward,
      is_active: task.is_active,
      requires_verification: task.requires_verification,
    });
    setEditId(task.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      toast({ title: 'Task deleted!' });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await updateTask(id, { is_active: isActive });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const processedSubmissions = submissions.filter(s => s.status !== 'pending');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-primary" /> Tasks
          </h1>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Add Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editId ? 'Edit Task' : 'Create Task'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reward (VINE)</Label>
                    <Input type="number" value={form.reward} onChange={(e) => setForm({ ...form, reward: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div>
                  <Label>Platform (e.g. X, Twitter)</Label>
                  <Input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="e.g. X, Twitter, Telegram" />
                </div>
                <div>
                  <Label>Action URL (link to the task)</Label>
                  <Input value={form.action_url} onChange={(e) => setForm({ ...form, action_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Requires Verification (Tweet Submission)</Label>
                  <Switch checked={form.requires_verification} onCheckedChange={(c) => setForm({ ...form, requires_verification: c })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
                </div>
                <Button type="submit" className="w-full">{editId ? 'Update' : 'Create'} Task</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="submissions">
          <TabsList>
            <TabsTrigger value="submissions" className="gap-2">
              <Clock className="w-4 h-4" /> Pending Submissions
              {pendingSubmissions.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingSubmissions.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tasks">All Tasks ({tasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Submissions</CardTitle>
                <CardDescription>Review and approve user task submissions (tweets, etc.)</CardDescription>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
                ) : pendingSubmissions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending submissions</p>
                ) : (
                  <div className="space-y-4">
                    {pendingSubmissions.map((sub) => (
                      <div key={sub.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{sub.profile?.username || sub.profile?.email || 'Unknown'}</span>
                            </div>
                            <p className="text-sm text-primary font-medium mt-1">{sub.task?.title || 'Unknown Task'}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(sub.created_at)}</p>
                          </div>
                          <Badge>+{sub.task?.reward || 0} VINE</Badge>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Submitted Link:</p>
                          <a 
                            href={sub.submission_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
                          >
                            <ExternalLink className="w-4 h-4 flex-shrink-0" />
                            {sub.submission_link}
                          </a>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleProcessSubmission(sub, true)}
                            disabled={processingSubmission === sub.id}
                          >
                            {processingSubmission === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Approve</>}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleProcessSubmission(sub, false)}
                            disabled={processingSubmission === sub.id}
                          >
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href={sub.submission_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-1" /> View
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {processedSubmissions.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-3">Recently Processed</h4>
                    <div className="space-y-2">
                      {processedSubmissions.slice(0, 10).map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
                          <div className="text-sm">
                            <span className="font-medium">{sub.profile?.username || sub.profile?.email?.split('@')[0]}</span>
                            <span className="text-muted-foreground"> - {sub.task?.title}</span>
                          </div>
                          <Badge variant={sub.status === 'approved' ? 'default' : 'destructive'}>{sub.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <Card>
              <CardHeader><CardTitle>All Tasks ({tasks.length})</CardTitle></CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
                ) : tasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No tasks yet</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{task.title}</p>
                            <Badge variant={task.is_active ? 'default' : 'secondary'}>{task.is_active ? 'Active' : 'Inactive'}</Badge>
                            <Badge variant="outline">{task.type}</Badge>
                            {task.platform && <Badge variant="outline">{task.platform}</Badge>}
                            {task.requires_verification && <Badge variant="secondary">Requires Approval</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <p className="text-sm font-medium text-primary">+{task.reward} VINE</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={task.is_active} onCheckedChange={(c) => handleToggle(task.id, c)} />
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(task)}><Edit className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(task.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
