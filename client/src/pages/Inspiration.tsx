import { useState } from 'react';
import { mockInspirationPosts } from '../data/mockData';
import type { InspirationPost } from '../types';
import InspirationCard from '../components/ui/InspirationCard';

const ALL_TAGS = ['All', 'minimal', 'streetwear', 'casual', 'formal', 'avant-garde', 'vintage'];

export default function Inspiration() {
  const [posts] = useState<InspirationPost[]>(mockInspirationPosts);
  const [activeTag, setActiveTag] = useState('All');

  const filtered = activeTag === 'All'
    ? posts
    : posts.filter((p) => p.tags.includes(activeTag));

  return (
    <div className="pt-32 pb-20 max-w-[1800px] mx-auto px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground block mb-3">Archive</span>
          <h1 className="font-heading font-black text-6xl md:text-8xl tracking-tighter uppercase leading-[0.8]">Discover</h1>
        </div>
        <p className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {filtered.length} nodes indexed
        </p>
      </div>

      {/* Tag Filter */}
      <div className="flex flex-wrap gap-1 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            className={`px-10 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border
              ${activeTag === tag 
                ? 'bg-foreground text-background border-foreground' 
                : 'bg-transparent text-muted-foreground border-transparent hover:border-foreground/10'}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="columns-2 md:columns-4 lg:columns-6 gap-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        {filtered.map((post) => (
          <InspirationCard key={post._id} post={post} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-40 text-center border">
          <p className="font-sans font-bold text-xl uppercase tracking-tighter text-muted-foreground">
            No results found.
          </p>
        </div>
      )}
    </div>
  );
}
