import type { InspirationPost } from '../../types';

interface Props { post: InspirationPost; }

export default function InspirationCard({ post }: Props) {
  return (
    <div className="relative group cursor-pointer overflow-hidden bg-muted mb-1">
      <img 
        src={post.imageUrl} 
        alt={post.title || 'Inspiration'} 
        className="w-full h-auto object-cover grayscale brightness-110 transition-all duration-700 group-hover:scale-105 group-hover:brightness-90"
        loading="lazy" 
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          {post.title && <p className="font-bold text-2xl text-white uppercase tracking-tighter mb-1">{post.title}</p>}
          {post.author && <span className="text-[10px] text-white/80 font-bold tracking-[0.2em] uppercase">Archive {post.author}</span>}
          <div className="flex flex-wrap gap-1 mt-4">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-white text-black">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
