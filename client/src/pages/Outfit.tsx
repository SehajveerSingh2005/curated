import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { mockOutfits } from '../data/mockData';
import type { Outfit } from '../types';
import OutfitCard from '../components/ui/OutfitCard';
import { Button } from '@/components/ui/button';

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
    <div className="pt-32 pb-20 max-w-[1800px] mx-auto px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground block mb-3">Systems</span>
          <h1 className="font-heading font-black text-6xl md:text-8xl tracking-tighter uppercase leading-[0.8]">Outfit Studio</h1>
        </div>
        <Button 
          onClick={handleGenerate} 
          disabled={generating}
          className="h-10 px-12 text-[10px] font-black uppercase tracking-[0.2em] rounded-none shadow-2xl hover:bg-foreground/90 transition-all"
        >
          {generating ? (
            <><RefreshCw className="mr-3 w-3 h-3 animate-spin" /> Processing</>
          ) : (
            <><Sparkles className="mr-3 w-3 h-3" /> Generate</>
          )}
        </Button>
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground max-w-sm leading-relaxed mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        Neural engine analysis of wardrobe nodes. Autonomous outfit generation based on archival compatibility.
      </p>

      {/* Outfit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        {generating
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="aspect-[21/9] bg-muted/20 animate-pulse" />
            ))
          : outfits.map((outfit) => (
              <OutfitCard key={outfit._id} outfit={outfit} />
            ))
        }
      </div>
    </div>
  );
}
