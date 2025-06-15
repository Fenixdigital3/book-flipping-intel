
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import Features from '@/components/sections/Features';
import CallToAction from '@/components/sections/CallToAction';
import Footer from '@/components/layout/Footer';
import AuthModal from '@/components/AuthModal';

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-deep-charcoal relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-deep-charcoal via-glass-purple/10 to-deep-charcoal" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-orange/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-lime/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10">
        <Header />
        <Hero onAuthModalOpen={() => setAuthModalOpen(true)} />
        <Stats />
        <Features />
        <CallToAction onAuthModalOpen={() => setAuthModalOpen(true)} />
        <Footer />
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Index;
