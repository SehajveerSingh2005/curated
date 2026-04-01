import type { InspirationPost } from '../../types';

interface Props { post: InspirationPost; }

export default function InspirationCard({ post }: Props) {
  return (
    <div className="group relative cursor-pointer overflow-hidden mb-3 bg-muted">
      <img
        src={post.imageUrl}
        alt={post.title || 'Inspiration'}
        className="w-full h-auto object-cover block transition-transform duration-700 group-hover:scale-[1.03]"
        loading="lazy"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50
        transition-all duration-400 flex flex-col justify-end p-5">
        <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
          transition-all duration-300">
          {post.title && (
            <p className="font-heading text-white text-xl italic leading-tight mb-1.5">
              {post.title}
            </p>
          )}
          {post.author && (
            <span className="text-[9px] text-white/60 uppercase tracking-[0.22em] block mb-3 font-medium">
              {post.author}
            </span>
          )}
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t}
                className="text-[8px] uppercase tracking-[0.15em] px-2 py-0.5 bg-white text-black font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
