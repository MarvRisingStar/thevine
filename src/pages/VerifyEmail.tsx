import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Mail, CheckCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const isVerified = profile?.email_verified || user?.email_confirmed_at;

  React.useEffect(() => {
    if (isVerified) {
      navigate('/dashboard');
    }
  }, [isVerified, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-vine-50/30 to-background">
        <Card className="w-full max-w-md shadow-vine text-center">
          <CardContent className="pt-8 pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
            <p className="text-muted-foreground mb-4">Redirecting to dashboard...</p>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          </CardContent>
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
          <CardTitle className="text-2xl font-display">Check Your Email</CardTitle>
          <CardDescription>We've sent a verification link to your email</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <div className="p-4 bg-muted rounded-lg">
            <Mail className="w-12 h-12 mx-auto text-primary mb-3" />
            <p className="font-medium">{user?.email}</p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Click the link in your email to verify your account. Once verified, you can start earning VINE tokens!
          </p>
          
          <p className="text-xs text-muted-foreground">
            With auto-confirm enabled, your account should already be verified. 
            Try refreshing or logging in again.
          </p>
        </CardContent>

        <CardFooter className="flex-col space-y-2">
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            I've verified my email
          </Button>
          <Button variant="ghost" onClick={handleLogout}>
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
