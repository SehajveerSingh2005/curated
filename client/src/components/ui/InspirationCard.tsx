import { memo, useState } from 'react';
import type { InspirationPost } from '../../types';

interface Props { post: InspirationPost; }

function InspirationCard({ post }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleClick = () => {
    if (post.link) {
      window.open(post.link, '_blank');
    }
  };

  return (
    <div 
      className="group cursor-pointer mb-12 block break-inside-avoid"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden mb-5 border border-border/40 bg-muted">
        {!error ? (
          <img
            src={post.imageUrl}
            alt={post.title || 'Inspiration'}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full h-auto object-cover block transition-all duration-[1.2s] ease-out group-hover:scale-[1.03] group-hover:opacity-90
              ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          />
        ) : (
          <div className="w-full h-[300px] bg-foreground/[0.02] flex items-center justify-center">
            <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-foreground/20 font-black">
              [Image Unavailable]
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/10 backdrop-blur-[2px]">
          <span className="px-6 py-2 bg-background/90 text-foreground text-[10px] uppercase tracking-[0.2em] border border-border">
            Read Article
          </span>
        </div>
      </div>
      
      <div className="flex flex-col px-1 pt-2">
        <div className="flex justify-between items-center gap-4 mb-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/50 font-black">
            {post.source || post.author}
          </span>
          {post.pubDate && (
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/30 font-black whitespace-nowrap">
              {new Date(post.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
        
        {post.title && (
          <h3 className="font-sans font-black text-[18px] lg:text-[22px] uppercase leading-[0.95] tracking-tight mb-5 text-foreground group-hover:text-foreground/50 transition-colors duration-300">
            {post.title}
          </h3>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {post.tags.slice(0, 3).map((t) => (
            <span key={t}
              className="font-mono text-[8px] uppercase tracking-[0.3em] text-foreground/40 font-black">
              [{t}]
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(InspirationCard);
