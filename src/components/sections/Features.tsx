
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  TrendingUp,
  BarChart3,
  Shield,
  Zap,
  Users
} from 'lucide-react';

const Features = () => {
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

  return (
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
  );
};

export default Features;
