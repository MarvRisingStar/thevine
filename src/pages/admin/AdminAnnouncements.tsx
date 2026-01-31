import React, { useState, useEffect } from 'react';
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/hooks/useAdmin';
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
import { Bell, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setIsActive(true);
    setEditItem(null);
  };

  const handleCreate = async () => {
    if (!title || !content) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await createAnnouncement({ title, content, is_active: isActive });
      toast({ title: 'Announcement created!' });
      setCreateOpen(false);
      resetForm();
      fetchAnnouncements();
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
      await updateAnnouncement(editItem.id, { title, content, is_active: isActive });
      toast({ title: 'Announcement updated!' });
      setEditItem(null);
      resetForm();
      fetchAnnouncements();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      toast({ title: 'Announcement deleted' });
      fetchAnnouncements();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setTitle(item.title);
    setContent(item.content);
    setIsActive(item.is_active);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Announcements
          </h1>
          <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-vine"><Plus className="w-4 h-4 mr-2" /> New Announcement</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" /></div>
                <div><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Announcement message..." rows={4} /></div>
                <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Active (visible to users)</Label></div>
                <Button onClick={handleCreate} className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editItem} onOpenChange={(o) => { if (!o) { setEditItem(null); resetForm(); } }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Announcement</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} /></div>
              <div className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Active</Label></div>
              <Button onClick={handleUpdate} className="w-full" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Update
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>All Announcements</CardTitle>
            <CardDescription>Active announcements appear on the user dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : announcements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No announcements created yet</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{a.title}</p>
                        <Badge variant={a.is_active ? 'default' : 'secondary'}>{a.is_active ? 'Active' : 'Inactive'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{a.content}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4" /></Button>
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