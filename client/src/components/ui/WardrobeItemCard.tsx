import type { WardrobeItem } from '../../types';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  item: WardrobeItem;
  onSell?: (item: WardrobeItem) => void;
}

export default function WardrobeItemCard({ item }: Props) {
  const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const imageUrl = item.imageUrl?.startsWith('/') ? `${API_URL}${item.imageUrl}` : item.imageUrl;

  return (
    <div className="group cursor-pointer space-y-8">
      {/* Visual Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-alt border border-foreground/5">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-all duration-[1200ms] ease-out
            scale-100 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Unit Label (Mono) */}
        <div className="absolute top-4 left-4 mix-blend-difference">
          <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-white font-black opacity-40">
            INDEX // {item._id.slice(-4).toUpperCase()}
          </span>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-6 flex justify-end translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-expo">
           <div className="bg-background w-12 h-12 flex items-center justify-center border border-foreground/5 shadow-2xl">
              <ArrowUpRight className="w-4 h-4 text-foreground group-hover:rotate-45 transition-transform duration-500" />
           </div>
        </div>
      </div>

      {/* Metadata */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-[13px] uppercase tracking-[0.2em] font-black leading-tight text-foreground/80 group-hover:text-foreground transition-colors">
              {item.name}
            </h3>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/20 font-black">
              {item.category}
            </span>
          </div>
          {(item.brand || item.fabric) && (
            <div className="flex gap-4">
              {item.brand && <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/40">{item.brand}</span>}
              {item.fabric && <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/20">{item.fabric}</span>}
            </div>
          )}
        </div>
        
        {/* Tag Stream */}
        <div className="flex flex-wrap gap-x-4 gap-y-2">
           {item.tags?.map(tag => (
             <span key={tag} className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/30 font-black">
               #{tag}
             </span>
           ))}
        </div>
      </motion.div>
    </div>
  );
}
