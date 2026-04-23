import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Bookmark, Trash2, CheckCircle2 } from 'lucide-react';
import { outfitService } from '../services/api';
import type { Outfit } from '../types';
import OutfitCard from '../components/ui/OutfitCard';

export default function OutfitPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [view, setView] = useState<'saved' | 'suggestions'>('saved');
  const [error, setError] = useState<string | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.pageYOffset || document.documentElement.scrollTop;
      const progress = Math.min(1, offset / 100);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      setLoading(true);
      const res = await outfitService.getAll();
      setOutfits(res.data);
    } catch (err) {
      console.error('Failed to fetch outfits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const res = await outfitService.generate();
      setSuggestions(res.data);
      setView('suggestions');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to generate looks.');
      console.error('Generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (suggestion: any) => {
    try {
      const itemIds = suggestion.items.map((i: any) => i._id);
      await outfitService.save({
        name: suggestion.name,
        items: itemIds,
        occasion: suggestion.occasion
      });
      // Update UI state to show saved
      suggestion.saved = true;
      setSuggestions([...suggestions]);
      fetchOutfits();
    } catch (err) {
      console.error('Failed to save outfit:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this look from your archive?')) return;
    try {
      await outfitService.delete(id);
      
      // Sync suggestions state if the deleted outfit was one of the suggestions
      const deletedOutfit = outfits.find(o => o._id === id);
      if (deletedOutfit) {
        const deletedItemIds = deletedOutfit.items.map(i => i._id).sort().join(',');
        setSuggestions(prev => prev.map(s => {
          const suggestionItemIds = s.items.map((i: any) => i._id).sort().join(',');
          if (suggestionItemIds === deletedItemIds) {
            return { ...s, saved: false };
          }
          return s;
        }));
      }

      setOutfits(outfits.filter(o => o._id !== id));
    } catch (err) {
      console.error('Failed to delete outfit:', err);
    }
  };

  return (
    <div className="min-h-[120vh] bg-background text-foreground font-sans selection:bg-foreground selection:text-background pb-32">
      
      {/* ─── STICKY HEADER WRAPPER (MATCHING WARDROBE) ──────────────── */}
      <div className="sticky top-24 z-[45] bg-background/90 backdrop-blur-3xl border-b border-foreground/5 py-8">
        <div className="max-w-[1800px] mx-auto px-8 lg:px-12 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5" style={{ opacity: 1 - scrollProgress * 0.4 }}>
                  <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/50 font-black">
                    Unit_{outfits.length}
                  </span>
                  <div className="h-[1px] w-6 bg-foreground/20"></div>
                </div>
                <h1 
                  className="font-black uppercase tracking-tighter leading-none"
                  style={{ 
                    fontSize: `${Math.max(32, 72 - scrollProgress * 40)}px`,
                  }}
                >
                  Studio<span className="font-serif italic lowercase font-normal tracking-normal ml-0.5">.</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center justify-center gap-3 bg-foreground text-background px-8 py-3.5 font-black hover:opacity-90 transition-all shadow-xl uppercase tracking-[0.3em] text-[10px]"
              >
                {generating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{generating ? 'Processing...' : 'Synthesize Looks'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-10 border-t border-foreground/5 pt-4">
            <button 
              onClick={() => setView('saved')}
              className={`text-[10px] uppercase tracking-[0.4em] font-black transition-all relative py-1
                ${view === 'saved' ? 'text-foreground' : 'text-foreground/40 hover:text-foreground/70'}`}
            >
              Archived ({outfits.length})
              {view === 'saved' && <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-foreground"></div>}
            </button>
            <button 
              onClick={() => setView('suggestions')}
              disabled={suggestions.length === 0}
              className={`text-[10px] uppercase tracking-[0.4em] font-black transition-all relative py-1 disabled:opacity-0
                ${view === 'suggestions' ? 'text-foreground' : 'text-foreground/40 hover:text-foreground/70'}`}
            >
              Synthesized ({suggestions.length})
              {view === 'suggestions' && <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-foreground"></div>}
            </button>
          </div>
        </div>
      </div>

      {/* ─── CONTENT GRID ──────────────────── */}
      <div className="max-w-[1800px] mx-auto px-8 lg:px-12 pt-20">
        
        {error && (
          <div className="mb-12 p-8 border border-red-500/20 bg-red-500/5 flex flex-col items-center gap-4 text-center">
             <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-red-500 font-black">System Alert</span>
             <p className="text-red-500/80 font-bold uppercase tracking-widest text-[11px]">{error}</p>
          </div>
        )}

        {generating ? (
          <div className="py-40 flex flex-col items-center justify-center gap-12">
            <div className="relative">
              <div className="w-32 h-32 border border-foreground/5 animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-foreground/20" />
              </div>
            </div>
            <div className="space-y-4 text-center">
               <p className="font-mono text-[11px] uppercase tracking-[0.8em] font-black animate-pulse">Scanning Neural Archive</p>
               <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/40 font-black">Mapping Visual Affinities...</p>
            </div>
          </div>
        ) : (
          <>
            {view === 'saved' ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-foreground/5 border border-foreground/5">
                {outfits.length > 0 ? (
                  outfits.map((outfit) => (
                    <div key={outfit._id} className="relative group">
                       <OutfitCard outfit={outfit} />
                       <button 
                        onClick={() => handleDelete(outfit._id)}
                        className="absolute bottom-10 right-10 p-5 bg-background/80 backdrop-blur-xl border border-foreground/5 text-foreground/20 hover:text-red-500 hover:border-red-500 transition-all opacity-0 group-hover:opacity-100 z-30 rounded-full"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-40 text-center bg-background border border-dashed border-foreground/10">
                    <h2 className="font-serif italic text-6xl text-foreground/10 mb-8 select-none">No Compositions</h2>
                    <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/40 font-black max-w-xs mx-auto leading-loose">
                      Your archive of looks is empty. Use the synthesize engine to generate new identities.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-foreground/5 border border-foreground/5">
                {suggestions.map((suggestion, idx) => (
                  <div key={idx} className="relative group">
                    <OutfitCard outfit={suggestion} />
                    <button 
                      onClick={() => handleSave(suggestion)}
                      disabled={suggestion.saved}
                      className={`absolute bottom-10 right-10 p-5 rounded-full backdrop-blur-xl transition-all z-30 group/save
                        ${suggestion.saved 
                          ? 'bg-foreground text-background cursor-default opacity-100' 
                          : 'bg-background/80 border border-foreground/10 text-foreground hover:bg-foreground hover:text-background'}`}
                    >
                      {suggestion.saved ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Bookmark className="w-5 h-5 group-hover/save:scale-110 transition-transform" />
                      )}
                      
                      {!suggestion.saved && (
                        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-foreground text-background text-[9px] font-black uppercase tracking-[0.3em] opacity-0 group-hover/save:opacity-100 transition-all whitespace-nowrap pointer-events-none">
                          Archive Look
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
