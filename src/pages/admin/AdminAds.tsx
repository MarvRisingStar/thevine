import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlayCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminAds() {
  // Adsterra Publisher ID
  const publisherId = '5576771';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-primary" /> Ads Management
          </h1>
          <Badge variant="outline">Adsterra</Badge>
        </div>

        <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertTitle className="text-green-700 dark:text-green-400">Adsterra API Configured</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-300">
            Your Adsterra API key has been securely stored. Ad completions can now be verified server-side.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Your Adsterra integration settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Publisher ID</p>
                  <p className="text-sm text-muted-foreground">Your Adsterra publisher account ID</p>
                </div>
                <Badge variant="secondary" className="font-mono">{publisherId}</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">API Key</p>
                  <p className="text-sm text-muted-foreground">Stored securely as environment variable</p>
                </div>
                <Badge variant="default" className="bg-green-600">Configured</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Verification Method</p>
                  <p className="text-sm text-muted-foreground">How ad completions are verified</p>
                </div>
                <Badge variant="default">Server-side + Cooldown</Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Ad verification is now enabled. The platform verifies ad completions through Adsterra's Publisher API 
                and applies a 5-minute cooldown between ad rewards to prevent abuse.
              </p>
              <Button variant="outline" asChild>
                <a href="https://help-publishers.adsterra.com/en/articles/5385760-api" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Adsterra API Documentation
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How Ad Rewards Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p><strong>1. User clicks "Watch Ad"</strong> - An Adsterra ad is displayed</p>
            <p><strong>2. Ad Completion</strong> - The ad must fully load and be viewed</p>
            <p><strong>3. Verification</strong> - Server verifies completion via Adsterra API + cooldown check</p>
            <p><strong>4. Reward</strong> - User receives VINE tokens after verification</p>
            <p className="pt-2 border-t">
              <strong>Anti-abuse measures:</strong> 5-minute cooldown between ad rewards, server-side verification 
              of ad impressions via Adsterra Publisher API.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
