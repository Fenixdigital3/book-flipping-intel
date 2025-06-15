
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onAuthModalOpen: () => void;
}

const Hero = ({ onAuthModalOpen }: HeroProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-2xl overflow-hidden animate-float">
            <img 
              src="/lovable-uploads/c34e6b00-78e5-4fe4-91c3-22322031c42f.png" 
              alt="BookFlipFinder Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
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
            <Button size="lg" onClick={onAuthModalOpen} className="text-lg px-8 py-3">
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
  );
};

export default Hero;
