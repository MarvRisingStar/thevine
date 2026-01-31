import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  ListTodo, 
  Wallet, 
  Gift, 
  Settings,
  LogOut,
  BookOpen,
  Bell,
  PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: Wallet },
  { href: '/admin/referrals', label: 'Referrals', icon: Gift },
  { href: '/admin/devotionals', label: 'Devotionals', icon: BookOpen },
  { href: '/admin/announcements', label: 'Announcements', icon: Bell },
  { href: '/admin/ads', label: 'Ads', icon: PlayCircle },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { logout } = useAuth();
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
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl">Admin Panel</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                View as User
              </Button>
            </Link>
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
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {adminNavItems.map((item) => {
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
