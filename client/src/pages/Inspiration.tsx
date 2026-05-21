import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InspirationPost } from '../types';
import InspirationCard from '../components/ui/InspirationCard';
import { inspirationService } from '../services/api';

export default function Inspiration() {
  const [posts, setPosts] = useState<InspirationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.pageYOffset || document.documentElement.scrollTop;
      const progress = Math.min(1, offset / 100);
      if (headerRef.current) {
        headerRef.current.style.setProperty('--scroll-progress', progress.toString());
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const startTime = Date.now();
        const { data } = await inspirationService.getAll();
        
        // Ensure skeleton UI is visible for at least 800ms for premium UX
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 800 - elapsed);
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        setPosts(data);
      } catch (error) {
        console.error('Error fetching feed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  // Dynamically generate tags that have at least 10 items
  const dynamicTags = ['All'];
  const tagCounts: Record<string, number> = {};
  
  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        const lowerTag = tag.toLowerCase();
        tagCounts[lowerTag] = (tagCounts[lowerTag] || 0) + 1;
      });
    }
  });

  Object.entries(tagCounts).forEach(([lowerTag, count]) => {
    if (count >= 10) {
      const formattedTag = lowerTag.charAt(0).toUpperCase() + lowerTag.slice(1);
      if (!dynamicTags.map(t => t.toLowerCase()).includes(lowerTag) && formattedTag.trim() !== '') {
        dynamicTags.push(formattedTag);
      }
    }
  });

  const filtered = posts.filter((p) => {
    const matchesTag = activeTag === 'All' || (p.tags && p.tags.some(t => t.toLowerCase() === activeTag.toLowerCase()));
    const searchString = `${p.title || ''} ${p.author || ''} ${p.source || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="min-h-[120vh] pt-24 bg-background text-foreground font-sans">
      
      {/* ─── STICKY HEADER WRAPPER ──────────────── */}
      <div 
        ref={headerRef}
        className="sticky top-24 z-[45] bg-background/90 backdrop-blur-3xl border-b border-foreground/5 py-8"
        style={{ '--scroll-progress': '0' } as React.CSSProperties}
      >
        <div className="max-w-[1800px] mx-auto px-8 lg:px-12 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5" style={{ opacity: 'calc(1 - var(--scroll-progress) * 0.4)' }}>
                  <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/50 font-black">
                    Unit_{filtered.length}
                  </span>
                  <div className="h-[1px] w-6 bg-foreground/20"></div>
                </div>
                <h1 
                  className="font-black uppercase tracking-tighter leading-none transition-[font-size] duration-75" 
                  style={{ 
                    fontSize: 'calc(72px - var(--scroll-progress) * 40px)',
                    minHeight: '72px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  Discover<span className="font-serif italic lowercase font-normal tracking-normal ml-0.5">.</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative group w-full md:w-64">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 group-focus-within:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="SEARCH"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border border-foreground/10 px-10 py-3 text-[10px] uppercase tracking-widest font-black focus:outline-none focus:border-foreground/30 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Integrated Filter Row — Always visible */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-foreground/5 pt-4 transition-all duration-300">
            <div className="flex items-center gap-3 mr-4">
              <svg className="w-3.5 h-3.5 text-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/50 font-black">Section</span>
            </div>
            {dynamicTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`text-[10px] uppercase tracking-[0.4em] font-black transition-all duration-300 relative py-1
                  ${activeTag.toLowerCase() === tag.toLowerCase() 
                    ? 'text-foreground' 
                    : 'text-foreground/40 hover:text-foreground/70'}`}
              >
                {tag}
                {activeTag.toLowerCase() === tag.toLowerCase() && (
                  <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-foreground"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 lg:px-12 pt-12 pb-24">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="mb-12 block">
                  <div className="relative overflow-hidden mb-5 border border-foreground/5 bg-foreground/5 h-[360px] w-full animate-pulse" />
                  <div className="flex flex-col px-1 pt-2 space-y-4 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-2 bg-foreground/10 rounded w-16" />
                      <div className="h-2 bg-foreground/10 rounded w-20" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-foreground/10 rounded w-full" />
                      <div className="h-3 bg-foreground/10 rounded w-5/6" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-2 bg-foreground/5 rounded w-12" />
                      <div className="h-2 bg-foreground/5 rounded w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filtered.length > 0 ? (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6"
            >
              {filtered.map((post) => <InspirationCard key={post._id} post={post} />)}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-40 flex flex-col items-center justify-center text-center border border-dashed border-foreground/10"
            >
              <h2 className="font-serif italic text-6xl text-foreground/20 mb-8 select-none">Empty Space</h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/50 font-black max-w-xs leading-loose">
                No references match your current selection.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
