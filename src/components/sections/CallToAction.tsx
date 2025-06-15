
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight } from 'lucide-react';

interface CallToActionProps {
  onAuthModalOpen: () => void;
}

const CallToAction = ({ onAuthModalOpen }: CallToActionProps) => {
  const { isAuthenticated } = useAuth();

  return (
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
            <Button size="lg" variant="secondary" onClick={onAuthModalOpen} className="text-lg px-8 py-3">
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
