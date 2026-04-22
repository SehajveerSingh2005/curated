import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/wardrobe', label: 'Wardrobe' },
  { to: '/outfit', label: 'Studio' },
  { to: '/inspiration', label: 'Discover' },
  { to: '/marketplace', label: 'Market' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > window.innerHeight - 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const isHome = pathname === '/';
  const isHeroMode = isHome && !scrolled;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-24 bg-transparent transition-colors duration-500">
      <div className="max-w-[1700px] mx-auto px-8 h-full flex items-center justify-between">
        
        {/* Wordmark */}
        <Link
          to="/"
          className={`font-sans font-black text-2xl tracking-tighter uppercase transition-colors duration-500
            ${isHeroMode ? 'text-white' : 'text-foreground'}`}
        >
          Curated.
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-16">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={`text-[11px] uppercase font-black tracking-[0.5em] transition-colors duration-500
                ${isHeroMode 
                  ? 'text-white hover:text-white/70' 
                  : 'text-foreground hover:text-foreground/60'}`}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Auth Action */}
        <div className="flex items-center gap-8">
          {user ? (
            <button
              onClick={logout}
              className={`text-[11px] uppercase font-black tracking-[0.5em] transition-colors duration-500 cursor-pointer
                ${isHeroMode 
                  ? 'text-white hover:text-white/70' 
                  : 'text-foreground hover:opacity-70'}`}
            >
              [ Logout ]
            </button>
          ) : (
            <Link
              to={pathname === '/login' ? '/signup' : '/login'}
              className={`text-[11px] uppercase font-black tracking-[0.5em] transition-colors duration-500
                ${isHeroMode 
                  ? 'text-white hover:text-white/70' 
                  : 'text-foreground hover:opacity-70'}`}
            >
              [ {pathname === '/login' ? 'Signup' : 'Login'} ]
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
