import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await resetPassword(email);
      setSent(true);
      toast({
        title: 'Reset link sent',
        description: 'Check your email for the password reset link.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not send reset email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-vine-50/30 to-background">
        <Card className="w-full max-w-md shadow-vine">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a password reset link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>Didn't receive the email? Check your spam folder or try again.</p>
          </CardContent>

          <CardFooter className="flex-col space-y-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setSent(false)}
            >
              Try again
            </Button>
            <Link to="/login" className="text-sm text-primary hover:underline">
              ← Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-vine-50/30 to-background">
      <Card className="w-full max-w-md shadow-vine">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 gradient-vine rounded-2xl flex items-center justify-center shadow-lg">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-display">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full gradient-vine" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
