
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen,
  TrendingUp,
  DollarSign,
  Search,
  BarChart3,
  Shield,
  Zap,
  Users,
  ArrowRight,
  LogIn,
  User
} from 'lucide-react';

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const features = [
    {
      icon: Search,
      title: "Smart Book Search",
      description: "Search across multiple online bookstores to find the best deals and compare prices instantly."
    },
    {
      icon: TrendingUp,
      title: "Profit Analysis",
      description: "AI-powered analysis identifies profitable arbitrage opportunities with detailed margin calculations."
    },
    {
      icon: BarChart3,
      title: "Price Tracking",
      description: "Track price history and trends to make informed buying and selling decisions."
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Built-in risk analysis helps you avoid unprofitable investments and market volatility."
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications when profitable opportunities match your criteria."
    },
    {
      icon: Users,
      title: "Community Insights",
      description: "Learn from successful arbitrage traders and share your own strategies."
    }
  ];

  const stats = [
    { label: "Books Tracked", value: "500K+", icon: BookOpen },
    { label: "Avg Profit Margin", value: "25%", icon: TrendingUp },
    { label: "Success Rate", value: "89%", icon: DollarSign },
    { label: "Active Users", value: "10K+", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-deep-charcoal relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-deep-charcoal via-glass-purple/10 to-deep-charcoal" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-orange/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-lime/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 group">
              <div className="p-2 rounded-lg bg-neon-orange/20 group-hover:bg-neon-orange/30 transition-all duration-300">
                <BookOpen className="w-8 h-8 text-neon-orange" />
              </div>
              <span className="text-2xl font-header text-white">BookArb</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-white/80 glass-panel px-3 py-2 rounded-lg">
                    <User className="w-4 h-4 text-neon-lime" />
                    <span className="font-body">{user?.email}</span>
                  </div>
                  <Button asChild size="lg">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setAuthModalOpen(true)} size="lg">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-glass-float">
              Turn Books Into
              <span className="block mt-2 bg-gradient-to-r from-neon-orange to-neon-lime bg-clip-text text-transparent">
                Profitable Investments
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto font-body">
              Discover profitable book arbitrage opportunities with AI-powered price analysis. 
              Buy low, sell high, and maximize your returns with data-driven insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button size="lg" asChild className="text-lg px-8 py-3">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" onClick={() => setAuthModalOpen(true)} className="text-lg px-8 py-3">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
              
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto w-12 h-12 glass-panel rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-neon-orange" />
                </div>
                <div className="text-3xl font-header text-white mb-1">{stat.value}</div>
                <div className="text-white/60 font-body">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-header text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-body">
              Our comprehensive platform provides all the tools and insights you need 
              to identify and capitalize on book arbitrage opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-neon-orange/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-neon-orange/30 transition-colors">
                    <feature.icon className="w-6 h-6 text-neon-orange" />
                  </div>
                  <CardTitle className="text-xl font-header">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/70 font-body">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="glass-panel rounded-2xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-orange/10 to-neon-lime/10 rounded-2xl" />
            <div className="relative z-10">
              <h2 className="text-4xl font-header mb-4">
                Ready to Start Your Arbitrage Journey?
              </h2>
              <p className="text-xl mb-8 text-white/80 font-body">
                Join thousands of successful book arbitrage traders who use our platform daily.
              </p>
              
              {!isAuthenticated && (
                <Button size="lg" variant="secondary" onClick={() => setAuthModalOpen(true)} className="text-lg px-8 py-3">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-white/60">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 rounded-lg bg-neon-orange/20">
              <BookOpen className="w-6 h-6 text-neon-orange" />
            </div>
            <span className="text-xl font-header text-white">BookArb</span>
          </div>
          <p className="font-body">&copy; 2024 Book Arbitrage Intelligence. All rights reserved.</p>
        </footer>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Index;
