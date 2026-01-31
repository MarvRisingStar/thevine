import React from 'react';
import { useLeaderboard } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';
import { formatVineBalance } from '@/lib/utils';

export default function Leaderboard() {
  const { leaderboard, loading } = useLeaderboard(50);
  const { user, profile } = useAuth();

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  const userRank = leaderboard.findIndex(p => p.id === profile?.id) + 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" /> Leaderboard
          </h1>
          <p className="text-muted-foreground">Top VINE earners in The Vine community</p>
        </div>

        {userRank > 0 && (
          <Card className="gradient-vine text-primary-foreground">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Your Rank</p>
                  <p className="text-3xl font-bold font-display">#{userRank}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-80">Your Earnings</p>
                  <p className="text-2xl font-bold font-display">{formatVineBalance(profile?.total_earned || 0)} VINE</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Top Earners</CardTitle>
            <CardDescription>Users ranked by total VINE earned</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No data yet. Be the first to earn!</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => {
                  const isCurrentUser = entry.id === profile?.id;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between py-3 px-4 rounded-lg ${
                        isCurrentUser ? 'bg-primary/10 border border-primary/30' : index < 3 ? 'bg-muted/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {getRankIcon(index)}
                        <div>
                          <p className={`font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                            {entry.username || 'Anonymous'}
                            {isCurrentUser && <span className="text-xs ml-2 text-primary">(You)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.tasks_completed} tasks completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${index < 3 ? 'text-lg' : ''}`}>
                          {formatVineBalance(entry.total_earned)}
                        </p>
                        <p className="text-xs text-muted-foreground">VINE</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
