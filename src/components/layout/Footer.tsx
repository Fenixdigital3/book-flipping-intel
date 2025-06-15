
const Footer = () => {
  return (
    <footer className="container mx-auto px-4 py-8 text-center text-white/60">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="w-8 h-8 rounded-lg overflow-hidden">
          <img 
            src="/lovable-uploads/b6367f44-8b6d-4b68-a2ae-ad256b38d7b8.png" 
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
