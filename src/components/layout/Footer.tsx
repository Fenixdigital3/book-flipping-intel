
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="container mx-auto px-4 py-8 text-center text-white/60">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <div className="p-2 rounded-lg bg-neon-orange/20">
          <BookOpen className="w-6 h-6 text-neon-orange" />
        </div>
        <span className="text-xl font-header text-white">BookArb</span>
      </div>
      <p className="font-body">&copy; 2024 Book Arbitrage Intelligence. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
