import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'marvrisingstar@gmail.com';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      toast({
        title: 'Access Denied',
        description: 'This email is not authorized for admin access.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await signIn(email, password);
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-vine-900 via-vine-800 to-vine-900">
      <Card className="w-full max-w-md border-vine-700 bg-card/95 backdrop-blur">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">Admin Access</CardTitle>
          <CardDescription>The Vine Platform Administration</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full gradient-vine" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Access Admin Panel
                </>
              )}
            </Button>
          </form>
          
          <p className="text-xs text-center text-muted-foreground mt-4">
            Only authorized administrators can access this area.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
