import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Leaf, 
  LayoutDashboard, 
  ListTodo, 
  Wallet, 
  Gift, 
  LogOut,
  Trophy,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const userNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/dashboard/referrals', label: 'Referrals', icon: Gift },
  { href: '/dashboard/withdrawals', label: 'Withdraw', icon: Wallet },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-vine rounded-xl flex items-center justify-center shadow-lg">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl hidden sm:block">The Vine</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">
                {profile?.balance?.toLocaleString() || 0} VINE
              </span>
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {userNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-vine" 
                        : "hover:bg-muted"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile balance */}
            <div className="md:hidden mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg text-primary">
                {profile?.balance?.toLocaleString() || 0} VINE
              </span>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
