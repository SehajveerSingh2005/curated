import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const navLinks = [
  { to: '/wardrobe', label: 'Wardrobe' },
  { to: '/outfit', label: 'Outfit' },
  { to: '/inspiration', label: 'Discover' },
  { to: '/marketplace', label: 'Market' },
];

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // Hero is 110vh, but we want to switch slightly before it ends
      const threshold = window.innerHeight * 0.9;
      setIsDark(window.scrollY > threshold);
    };

    if (pathname === '/') {
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
    } else {
      setIsDark(true); // Other pages have white backgrounds by default
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const textColor = isDark ? 'text-black' : 'text-white';
  const subTextColor = isDark ? 'text-black/60' : 'text-white/70';
  const activeBorder = isDark ? 'border-black' : 'border-white';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-700 ${isDark ? 'bg-background/90 backdrop-blur-md border-b border-foreground/5' : 'bg-transparent border-b border-transparent'}`}>
      <div className="max-w-[1800px] mx-auto px-8 h-full flex items-center justify-between">
        <NavLink to="/" className={`font-heading font-extrabold text-2xl tracking-tighter uppercase transition-colors duration-500 ${textColor}`}>
          Curated
        </NavLink>
        
        <div className="hidden md:flex items-center gap-12 flex-1 justify-center translate-x-[-1.5rem]">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => 
                `text-[11px] font-extrabold uppercase tracking-[0.2em] transition-all duration-500 ${isActive ? textColor + ' border-b ' + activeBorder : subTextColor + ' hover:' + textColor}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Button variant="ghost" className={`text-[11px] font-extrabold uppercase tracking-widest px-4 h-8 rounded-none transition-all duration-500 ${textColor} hover:bg-foreground/5`}>
            Search
          </Button>
          <Button 
            className={`text-[11px] font-extrabold uppercase tracking-widest px-8 h-9 rounded-none transition-all duration-500 ${isDark ? 'bg-black text-white' : 'bg-white text-black'} hover:opacity-80`}
          >
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
}
