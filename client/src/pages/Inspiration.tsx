import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InspirationPost } from '../types';
import InspirationCard from '../components/ui/InspirationCard';
import { Skeleton } from '../components/ui/skeleton';
import { inspirationService } from '../services/api';

export default function Inspiration() {
  const [posts, setPosts] = useState<InspirationPost[]>([]);
  const [tags, setTags] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeTag, setActiveTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const observerTarget = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.pageYOffset || document.documentElement.scrollTop;
      const progress = Math.min(1, offset / 100);
      if (containerRef.current) {
        containerRef.current.style.setProperty('--scroll-progress', progress.toString());
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchFeed = useCallback(async (pageNum: number, tag: string, isInitial: boolean = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        pageRef.current = 1;
      } else {
        setLoadingMore(true);
      }

      const { data } = await inspirationService.getAll({ 
        page: pageNum, 
        limit: 12, 
        tag: tag.toLowerCase() === 'all' ? undefined : tag 
      });
      
      const newPosts = data.data;
      const pagination = data.pagination;
      
      if (data.tags) setTags(['All', ...data.tags]);

      if (isInitial) {
        setPosts(newPosts);
      } else {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          const uniqueNewPosts = newPosts.filter((p: InspirationPost) => !existingIds.has(p._id));
          return [...prev, ...uniqueNewPosts];
        });
      }

      setHasMore(pagination.hasMore);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Effect for tag change
  useEffect(() => {
    fetchFeed(1, activeTag, true);
  }, [activeTag, fetchFeed]);

  // Auto-fetch more if results are sparse
  useEffect(() => {
    if (!loading && !loadingMore && hasMore && posts.length > 0 && posts.length < 12) {
      pageRef.current += 1;
      fetchFeed(pageRef.current, activeTag);
    }
  }, [posts.length, loading, loadingMore, hasMore, activeTag, fetchFeed]);

  // Infinite Scroll Sentinel
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          pageRef.current += 1;
          fetchFeed(pageRef.current, activeTag);
        }
      },
      { threshold: 0.1, rootMargin: '800px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, activeTag, fetchFeed]);

  const filtered = posts.filter((p) => {
    const searchString = `${p.title || ''} ${p.author || ''} ${p.source || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div ref={containerRef} className="min-h-[120vh] pt-24 bg-background text-foreground font-sans">
      
      <div 
        className="sticky top-24 z-[45] bg-background/90 backdrop-blur-3xl border-b border-foreground/5 transition-all duration-300"
        style={{ 
          paddingTop: 'calc((2 - var(--scroll-progress, 0)) * 16px)',
          paddingBottom: 'calc((2 - var(--scroll-progress, 0)) * 16px)'
        } as React.CSSProperties}
      >
        <div className="max-w-[1800px] mx-auto px-8 lg:px-12 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5" style={{ opacity: 'calc(1 - var(--scroll-progress, 0) * 0.4)' } as React.CSSProperties}>
                  <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/50 font-black">
                    Unit_{filtered.length}
                  </span>
                  <div className="h-[1px] w-6 bg-foreground/20"></div>
                </div>
                <h1 
                  className="font-black uppercase tracking-tighter leading-none" 
                  style={{ fontSize: 'calc(72px - var(--scroll-progress, 0) * 40px)' } as React.CSSProperties}
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

          <div 
            className="flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-foreground/5 pt-4 transition-all duration-300"
            style={{ 
              opacity: 'calc(1 - var(--scroll-progress, 0) * 0.2)',
              transform: 'translateY(calc(var(--scroll-progress, 0) * -4px))'
            } as React.CSSProperties}
          >
            <div className="flex items-center gap-3 mr-4">
              <svg className="w-3.5 h-3.5 text-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/50 font-black">Section</span>
            </div>
            {tags.map((tag) => (
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
                  <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-foreground" />
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
              className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="mb-12 block break-inside-avoid">
                  <Skeleton 
                    className="relative overflow-hidden mb-5 border border-foreground/5 w-full"
                    style={{ height: `${[320, 480, 360, 420, 300, 460, 380, 440][i % 8]}px` }}
                  />
                  <div className="flex flex-col px-1 pt-2">
                    <div className="flex justify-between items-center gap-4 mb-4">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-5 w-11/12 mb-2" />
                    <Skeleton className="h-5 w-3/4 mb-5" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-3.5 w-10" />
                      <Skeleton className="h-3.5 w-12" />
                      <Skeleton className="h-3.5 w-8" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filtered.length > 0 ? (
            <motion.div 
              key={`${activeTag}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6"
            >
              {filtered.map((post) => (
                <div key={post._id} className="break-inside-avoid">
                  <InspirationCard post={post} />
                </div>
              ))}
            </motion.div>
          ) : !loadingMore && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-40 flex flex-col items-center justify-center text-center border border-dashed border-foreground/10"
            >
              <h2 className="font-serif italic text-6xl text-foreground/20 mb-8">Empty Space</h2>
              <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/50 font-black max-w-xs leading-loose">
                No references match your current selection.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={observerTarget} className="h-40 w-full flex items-center justify-center mt-12">
          {loadingMore && (
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></div>
            </div>
          )}
          {!hasMore && posts.length > 0 && !loading && (
            <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/20 font-black">
              End of Transmission
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
