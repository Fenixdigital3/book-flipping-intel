
const Footer = () => {
  return (
    <footer className="container mx-auto px-4 py-8 text-center text-white/60">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="w-8 h-8 rounded-lg overflow-hidden">
          <img 
            src="/lovable-uploads/c34e6b00-78e5-4fe4-91c3-22322031c42f.png" 
            alt="BookFlipFinder Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-xl font-header text-white">BookFlipFinder</span>
      </div>
      <p className="font-body">&copy; 2024 BookFlipFinder Intelligence. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
