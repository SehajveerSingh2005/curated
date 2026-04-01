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
    <div className="pt-24 pb-24 max-w-[1600px] mx-auto px-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-14 border-b border-border pb-10">
        <div>
          <span className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground font-semibold block mb-4">
            Style References &mdash; {filtered.length}
          </span>
          <h1 className="font-sans font-bold leading-[0.9] tracking-tight"
            style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
            Discover
          </h1>
        </div>
      </div>

      {/* Tag Filter */}
      <div className="flex flex-wrap gap-x-7 gap-y-3 mb-14">
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`text-[11px] uppercase tracking-[0.18em] pb-0.5 transition-all duration-200 font-medium
              ${activeTag === tag
                ? 'text-foreground border-b border-foreground'
                : 'text-muted-foreground hover:text-foreground border-b border-transparent'
              }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Masonry */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
        {filtered.map((post) => <InspirationCard key={post._id} post={post} />)}
      </div>

      {filtered.length === 0 && (
        <div className="py-40 text-center border border-dashed border-border">
          <p className="font-heading text-3xl italic text-muted-foreground">No references found.</p>
        </div>
      )}
    </div>
  );
}
