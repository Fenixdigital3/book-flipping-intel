
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, User } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/lovable-uploads/c34e6b00-78e5-4fe4-91c3-22322031c42f.png" 
                alt="BookFlipFinder Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-header text-white">BookFlipFinder</span>
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

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Header;
