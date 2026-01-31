import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Gift, Calendar, PlayCircle, Users, Wallet, ArrowRight, CheckCircle } from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Calendar,
      title: 'Daily Check-In',
      description: 'Earn 50 VINE tokens just for logging in every day. Build your streak for bonus rewards!',
    },
    {
      icon: PlayCircle,
      title: 'Watch & Earn',
      description: 'Watch short ads and earn 25 VINE per view. Simple, easy, and rewarding.',
    },
    {
      icon: Gift,
      title: 'Referral Program',
      description: 'Invite friends and earn 100 VINE when they complete 10 tasks. Unlimited referrals!',
    },
    {
      icon: Users,
      title: 'Community Tasks',
      description: 'Complete social tasks like following on X or joining Telegram to earn more.',
    },
  ];

  const stats = [
    { value: '50+', label: 'Daily Tasks' },
    { value: '10K+', label: 'Active Users' },
    { value: '1M+', label: 'VINE Distributed' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-vine rounded-xl flex items-center justify-center shadow-lg">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">The Vine</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="gradient-vine">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-vine-100/50 via-background to-vine-50/30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-medium">Solana-Based Rewards Ecosystem</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Grow Your <span className="text-gradient-vine">VINE</span> Tokens Through Engagement
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join The Vine community and start earning rewards through daily check-ins, 
              watching ads, completing tasks, and referring friends. It's simple, fun, and rewarding!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="gradient-vine shadow-vine w-full sm:w-auto">
                  Start Earning Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Already a Member? Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-display font-bold text-primary">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Multiple Ways to Earn
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The Vine offers various earning opportunities. Choose what works best for you!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="relative overflow-hidden group hover:shadow-vine transition-all">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl gradient-vine flex items-center justify-center mb-4 shadow-lg">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting started is easy. Follow these simple steps to begin earning VINE tokens.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Sign Up', description: 'Create your free account with email or social login' },
              { step: '2', title: 'Complete Tasks', description: 'Check in daily, watch ads, and complete social tasks' },
              { step: '3', title: 'Withdraw', description: 'Request withdrawal when you reach 3,000 VINE minimum' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full gradient-vine flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground shadow-vine">
                  {item.step}
                </div>
                <h3 className="text-xl font-display font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="gradient-vine text-primary-foreground overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdi0ySDEwVjBIOHYyOEgtMTB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30" />
            <CardContent className="relative py-12 text-center">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join thousands of users already earning VINE tokens. Sign up now and get started with your first daily check-in!
              </p>
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="shadow-lg">
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-vine rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">The Vine</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://x.com/TheVine_Sol" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                X / Twitter
              </a>
              <a href="https://t.me/thevine_sol" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                Telegram
              </a>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2024 The Vine. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
