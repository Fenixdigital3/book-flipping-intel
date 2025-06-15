
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, User, TestTube } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 group">
            <div className="w-16 h-16 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/lovable-uploads/b6367f44-8b6d-4b68-a2ae-ad256b38d7b8.png" 
                alt="BookFlipFinder Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-3xl font-header text-white">BookFlipFinder</span>
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
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setAuthModalOpen(true)} 
                  size="lg"
                  className="border-neon-lime/30 text-neon-lime hover:bg-neon-lime/10"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Try Demo
                </Button>
                <Button onClick={() => setAuthModalOpen(true)} size="lg">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Header;
