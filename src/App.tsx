import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Referrals from "./pages/Referrals";
import Withdrawals from "./pages/Withdrawals";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminReferrals from "./pages/admin/AdminReferrals";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDevotionals from "./pages/admin/AdminDevotionals";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminAds from "./pages/admin/AdminAds";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/admin" element={<AdminLogin />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/tasks" element={<Tasks />} />
              <Route path="/dashboard/referrals" element={<Referrals />} />
              <Route path="/dashboard/withdrawals" element={<Withdrawals />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/leaderboard" element={<Leaderboard />} />
            </Route>

            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/tasks" element={<AdminTasks />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/admin/referrals" element={<AdminReferrals />} />
              <Route path="/admin/devotionals" element={<AdminDevotionals />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/ads" element={<AdminAds />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
