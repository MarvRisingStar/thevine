import React, { useState } from 'react';
import { useAdminDevotionals, createDevotional, updateDevotional, deleteDevotional } from '@/hooks/useAdmin';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Pencil, Trash2, Loader2, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminDevotionals() {
  const { devotionals, loading, refetch } = useAdminDevotionals();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [scripture, setScripture] = useState('');
  const [content, setContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setTitle('');
    setScripture('');
    setContent('');
    setScheduledDate('');
    setIsActive(true);
    setEditItem(null);
  };

  const handleCreate = async () => {
    if (!title || !scripture || !content || !scheduledDate) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await createDevotional({ title, scripture, content, scheduled_date: scheduledDate, is_active: isActive });
      toast({ title: 'Devotional created!' });
      setCreateOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateDevotional(editItem.id, { title, scripture, content, scheduled_date: scheduledDate, is_active: isActive });
      toast({ title: 'Devotional updated!' });
      setEditItem(null);
      resetForm();
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this devotional?')) return;
    try {
      await deleteDevotional(id);
      toast({ title: 'Devotional deleted' });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setTitle(item.title);
    setScripture(item.scripture);
    setContent(item.content);
    setScheduledDate(item.scheduled_date);
    setIsActive(item.is_active);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Devotionals
          </h1>
          <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-vine"><Plus className="w-4 h-4 mr-2" /> Add Devotional</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Devotional</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Devotional title" /></div>
                <div><Label>Scripture Reference</Label><Input value={scripture} onChange={(e) => setScripture(e.target.value)} placeholder="John 3:16" /></div>
                <div><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Devotional message..." rows={4} /></div>
                <div><Label>Scheduled Date</Label><Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} /></div>
                <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Active</Label></div>
                <Button onClick={handleCreate} className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editItem} onOpenChange={(o) => { if (!o) { setEditItem(null); resetForm(); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit Devotional</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div><Label>Scripture Reference</Label><Input value={scripture} onChange={(e) => setScripture(e.target.value)} /></div>
              <div><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} /></div>
              <div><Label>Scheduled Date</Label><Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} /></div>
              <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Active</Label></div>
              <Button onClick={handleUpdate} className="w-full" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Update
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>All Devotionals</CardTitle>
            <CardDescription>Schedule daily devotionals for users</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : devotionals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No devotionals created yet</p>
            ) : (
              <div className="space-y-3">
                {devotionals.map((d) => (
                  <div key={d.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{d.title}</p>
                        <Badge variant={d.is_active ? 'default' : 'secondary'}>{d.is_active ? 'Active' : 'Inactive'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground italic">"{d.scripture}"</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{d.content}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {d.scheduled_date}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(d)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(d.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
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