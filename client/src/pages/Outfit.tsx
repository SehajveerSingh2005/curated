import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { mockOutfits } from '../data/mockData';
import type { Outfit } from '../types';
import OutfitCard from '../components/ui/OutfitCard';

export default function OutfitPage() {
  const [outfits, setOutfits] = useState<Outfit[]>(mockOutfits);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setOutfits([...mockOutfits].reverse());
      setGenerating(false);
    }, 1200);
  };

  return (
    <div className="pt-24 pb-24 max-w-[1600px] mx-auto px-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-14 border-b border-border pb-10">
        <div>
          <span className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground font-semibold block mb-4">AI Engine</span>
          <h1 className="font-sans font-bold leading-[0.9] tracking-tight"
            style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
            The Studio
          </h1>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] font-medium
            px-7 py-3 bg-foreground text-background hover:opacity-80 disabled:opacity-40
            transition-all duration-300"
        >
          {generating
            ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating</>
            : <><Sparkles className="w-3.5 h-3.5" /> Generate Outfit</>
          }
        </button>
      </div>

      <p className="text-[13px] text-muted-foreground tracking-wide leading-relaxed max-w-md mb-16">
        The engine reads your archive and composes looks based on visual compatibility and personal aesthetic — no curation required.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {generating
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="aspect-video bg-muted animate-pulse border border-border" />
            ))
          : outfits.map((outfit) => <OutfitCard key={outfit._id} outfit={outfit} />)
        }
      </div>
    </div>
  );
}
