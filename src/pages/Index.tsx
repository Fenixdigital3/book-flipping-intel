
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">BookArb</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <Button asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </div>
            ) : (
              <Button onClick={() => setAuthModalOpen(true)}>
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
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Turn Books Into
            <span className="text-blue-600 block mt-2">Profitable Investments</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
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
            <div key={index} className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools and insights you need 
            to identify and capitalize on book arbitrage opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Arbitrage Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of successful book arbitrage traders who use our platform daily.
          </p>
          
          {!isAuthenticated && (
            <Button size="lg" variant="secondary" onClick={() => setAuthModalOpen(true)} className="text-lg px-8 py-3">
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">BookArb</span>
        </div>
        <p>&copy; 2024 Book Arbitrage Intelligence. All rights reserved.</p>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Index;
