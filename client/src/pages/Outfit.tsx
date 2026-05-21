import { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, X, Plus, CheckCircle2, Trash2, Download, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { outfitService, wardrobeService } from '../services/api';
import type { WardrobeItem, Outfit } from '../types';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { AxiosError } from 'axios';

// ─── UNIFIED POSITIONING LOGIC ───────────────────────
const getPieceLayout = (item: WardrobeItem, allItems: WardrobeItem[]) => {
  const cat = item.category as string;
  const isAcc = cat === 'accessory' || cat === 'other';
  const isTop = ['shirt', 't-shirt', 'polo', 'knitwear', 'outerwear', 'jacket', 'dress'].includes(cat);
  const isBottom = cat === 'pants' || cat === 'shorts' || cat === 'skirt';
  const isShoe = cat === 'shoes' || cat === 'sneakers' || cat === 'boots';

  let posClass = "absolute w-[40%] z-40";
  let tagPos = "top-0 left-0";

  if (isAcc) {
    const accItems = allItems.filter(i => (i.category as string) === 'accessory' || (i.category as string) === 'other');
    const accIndex = accItems.findIndex(i => i._id === item._id);
    if (accIndex % 2 === 0) {
      posClass = "absolute top-[5%] -left-[10%] w-[25%] -rotate-6 z-[60]";
      tagPos = "top-0 -left-12";
    } else {
      posClass = "absolute top-[15%] -right-[10%] w-[25%] rotate-12 z-[60]";
      tagPos = "top-0 -right-12 text-right";
    }
  } else if (isTop) {
    posClass = "absolute top-[-15%] left-[12.5%] w-[75%] rotate-0 z-40";
    tagPos = "top-12 left-12";
  } else if (isBottom) {
    posClass = "absolute top-[32%] left-[17.5%] w-[65%] rotate-0 z-30";
    tagPos = "top-1/2 -right-8 text-right";
  } else if (isShoe) {
    posClass = "absolute top-[68%] left-[27.5%] w-[45%] rotate-0 z-50";
    tagPos = "bottom-4 -left-4";
  }

  return { posClass, tagPos };
};

export default function OutfitPage() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [draftOutfit, setDraftOutfit] = useState<{ _id?: string; name: string; occasion: string; items: WardrobeItem[] }>({
    name: '',
    occasion: '',
    items: []
  });
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [selectedArchiveOutfit, setSelectedArchiveOutfit] = useState<Outfit | null>(null);
  const [view, setView] = useState<'lab' | 'archive'>('lab');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportWithTags, setExportWithTags] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showSelector, setShowSelector] = useState<{ open: boolean; categoryFilter: string | null; replaceIndex?: number }>({
    open: false,
    categoryFilter: null
  });

  useEffect(() => {
    wardrobeService.getAll().then(res => setWardrobeItems(res.data)).catch(err => console.error(err));
    fetchOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      const res = await outfitService.getAll();
      setOutfits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const res = await outfitService.generate();
      if (res.data && res.data.length > 0) {
        const suggestion = res.data[0];
        setDraftOutfit({
          name: suggestion.name || 'Generated Look',
          occasion: suggestion.occasion || 'casual',
          items: suggestion.items
        });
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.msg || 'Failed to synthesize looks.');
      } else {
        setError('Failed to synthesize looks.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (isUpdate: boolean = false) => {
    if (draftOutfit.items.length < 2) {
      setError('A composition requires at least 2 pieces.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: draftOutfit.name || 'Untitled Look',
        occasion: draftOutfit.occasion || 'casual',
        items: draftOutfit.items.map(i => i._id)
      };

      if (isUpdate && draftOutfit._id) {
        await outfitService.update(draftOutfit._id, payload);
      } else {
        await outfitService.save(payload);
      }
      
      fetchOutfits();
      setView('archive');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.msg || 'Failed to save look.');
      } else {
        setError('Failed to save look.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently remove this composition from your archive?')) return;
    try {
      await outfitService.delete(id);
      setOutfits(outfits.filter(o => o._id !== id));
      if (selectedArchiveOutfit?._id === id) {
        setSelectedArchiveOutfit(null);
      }
    } catch (err) {
      console.error('Failed to delete outfit:', err);
    }
  };

  const handleLoadToLab = (outfit: Outfit) => {
    setDraftOutfit({
      _id: outfit._id,
      name: outfit.name || '',
      occasion: outfit.occasion || '',
      items: outfit.items
    });
    setSelectedArchiveOutfit(null);
    setView('lab');
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    
    try {
      setExporting(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        backgroundColor: '#f3f3f3',
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `${selectedArchiveOutfit?.name || 'outfit'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export image.');
    } finally {
      setExporting(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...draftOutfit.items];
    newItems.splice(index, 1);
    setDraftOutfit({ ...draftOutfit, items: newItems });
  };

  const getCategoryGroup = (cat: string) => {
    if (['shirt', 't-shirt', 'polo', 'knitwear', 'outerwear'].includes(cat)) return 'top';
    if (['pants', 'shorts', 'skirt'].includes(cat)) return 'bottom';
    if (['shoes', 'sneakers', 'boots', 'sandals'].includes(cat)) return 'footwear';
    if (['accessory', 'other'].includes(cat)) return 'accessory';
    return cat;
  };

  const handleReplaceItem = (index: number, category: string) => {
    setShowSelector({ open: true, categoryFilter: getCategoryGroup(category), replaceIndex: index });
  };

  const handleSelectItem = (item: WardrobeItem) => {
    const newItems = [...draftOutfit.items];
    if (showSelector.replaceIndex !== undefined) {
      newItems[showSelector.replaceIndex] = item;
    } else {
      newItems.push(item);
    }
    setDraftOutfit({ ...draftOutfit, items: newItems });
    setShowSelector({ open: false, categoryFilter: null, replaceIndex: undefined });
  };

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('/')) return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
    return url;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 bg-background text-foreground font-sans selection:bg-foreground selection:text-background flex flex-col overflow-hidden"
    >
      
      {/* ─── HEADER ──────────────────────────────────────── */}
      <div className="shrink-0 z-[45] bg-background border-b border-foreground/5 py-5 px-8 lg:px-12 flex justify-between items-center">
        <div className="flex items-center gap-6">
           <h1 className="font-black uppercase tracking-tighter text-2xl leading-none">Studio<span className="font-serif italic lowercase font-normal tracking-normal ml-0.5">.</span></h1>
           <div className="h-4 w-px bg-foreground/20"></div>
           <div className="flex items-center gap-6">
             <button onClick={() => setView('lab')} className={`font-mono text-[9px] uppercase tracking-[0.4em] font-black transition-all pb-1 border-b-2 ${view === 'lab' ? 'text-foreground border-foreground' : 'text-foreground/40 border-transparent hover:text-foreground/70'}`}>Composition Lab</button>
             <button onClick={() => setView('archive')} className={`font-mono text-[9px] uppercase tracking-[0.4em] font-black transition-all pb-1 border-b-2 ${view === 'archive' ? 'text-foreground border-foreground' : 'text-foreground/40 border-transparent hover:text-foreground/70'}`}>Archive ({outfits.length})</button>
           </div>
        </div>
        {view === 'lab' && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDraftOutfit({ name: '', occasion: '', items: [] })}
              className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2.5 text-[10px] uppercase tracking-widest font-black hover:bg-red-500 hover:text-white transition-colors"
              title="Clear Canvas"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-3 bg-foreground/5 text-foreground px-6 py-2.5 text-[10px] uppercase tracking-widest font-black hover:bg-foreground/10 transition-colors"
            >
              {generating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {generating ? 'Synthesizing...' : 'Generate Look'}
            </button>
            
            {draftOutfit._id && (
              <button
                onClick={() => handleSave(true)}
                disabled={draftOutfit.items.length < 2 || saving}
                className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 text-[10px] uppercase tracking-widest font-black hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                {saving ? 'Saving...' : 'Update Look'}
              </button>
            )}
            
            <button
              onClick={() => handleSave(false)}
              disabled={draftOutfit.items.length < 2 || saving}
              className={`flex items-center gap-2 px-6 py-2.5 text-[10px] uppercase tracking-widest font-black transition-colors disabled:opacity-50 ${draftOutfit._id ? 'bg-foreground/5 text-foreground hover:bg-foreground/10' : 'bg-foreground text-background hover:opacity-90'}`}
            >
              {saving && !draftOutfit._id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              {saving && !draftOutfit._id ? 'Saving...' : 'Save as New'}
            </button>
          </div>
        )}
      </div>

      {/* ─── MAIN CONTENT ────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden h-[calc(100vh-160px)]">
        <div 
          className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: view === 'lab' ? 'translateX(0)' : 'translateX(-50%)', width: '200%' }}
        >
          {/* LAB VIEW */}
          <div className="w-1/2 h-full flex flex-col lg:flex-row overflow-hidden relative">
            <div className="flex-1 bg-[#f7f7f7] relative flex items-center justify-center p-12 overflow-hidden border-r border-foreground/5">
              {error && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-3 font-mono text-[10px] uppercase tracking-widest font-black backdrop-blur-md">
                  {error}
                  <button onClick={() => setError(null)} className="ml-4 hover:text-red-700"><X className="w-3 h-3 inline" /></button>
                </div>
              )}

              {generating ? (
                <div className="flex flex-col items-center gap-8 animate-pulse">
                   <div className="w-24 h-24 border border-foreground/10 animate-[spin_4s_linear_infinite] flex items-center justify-center rounded-full">
                      <Sparkles className="w-6 h-6 text-foreground/30 animate-pulse" />
                   </div>
                   <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/50 font-black">AI Mapping Silhouettes...</p>
                </div>
              ) : draftOutfit.items.length === 0 ? (
                <div className="text-center space-y-8">
                   <button 
                     onClick={() => setShowSelector({ open: true, categoryFilter: null })}
                     className="w-20 h-20 border border-foreground/20 hover:border-foreground hover:bg-foreground/5 transition-all mx-auto flex items-center justify-center rounded-full cursor-pointer group"
                   >
                     <Plus className="w-6 h-6 text-foreground/40 group-hover:text-foreground transition-colors group-hover:scale-110" />
                   </button>
                   <div className="space-y-3">
                     <p className="font-mono text-[11px] uppercase tracking-[0.5em] text-foreground/80 font-black">Canvas Empty</p>
                     <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/40 max-w-[200px] mx-auto leading-loose">Hit Generate or add pieces manually to start composing.</p>
                   </div>
                </div>
              ) : (
                <div className="relative aspect-[3/4] h-full max-w-full flex items-center justify-center select-none mx-auto">
                  {draftOutfit.items.map((item, idx) => {

                     const { posClass } = getPieceLayout(item, draftOutfit.items);
                     const interactivePos = posClass + " transition-all duration-700 hover:z-[60] cursor-pointer group origin-center hover:-translate-y-2";

                     return (
                       <div key={`${item._id}-${idx}`} 
                            className={interactivePos} 
                            onClick={() => handleReplaceItem(idx, item.category)}>
                         <img src={getImageUrl(item.imageUrl)} className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]" alt={item.name} />
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 pointer-events-none">
                           <div className="bg-white text-black px-4 py-2 font-mono text-[9px] uppercase tracking-widest font-black flex items-center gap-2 shadow-xl border border-black/10">
                             <RefreshCw className="w-3 h-3" /> Replace
                           </div>
                         </div>
                       </div>
                     );
                  })}
                </div>
              )}
            </div>

            <div className="w-full lg:w-[450px] xl:w-[500px] bg-background border-l border-foreground/5 flex flex-col shrink-0 overflow-y-auto">
               <div className="p-8 lg:p-12 border-b border-foreground/5 space-y-6">
                  <input 
                    value={draftOutfit.name}
                    onChange={(e) => setDraftOutfit({ ...draftOutfit, name: e.target.value })}
                    placeholder="Untitled Look"
                    className="w-full bg-transparent font-sans font-black text-4xl lg:text-5xl uppercase tracking-tighter leading-none focus:outline-none placeholder:text-foreground/40 text-foreground"
                  />
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-foreground"></div>
                    <input 
                      value={draftOutfit.occasion}
                      onChange={(e) => setDraftOutfit({ ...draftOutfit, occasion: e.target.value })}
                      placeholder="Occasion (e.g. Minimalist, Evening)"
                      className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/80 w-full bg-transparent focus:outline-none placeholder:text-foreground/40"
                    />
                  </div>
               </div>

               <div className="flex-1 p-8 lg:p-12 space-y-4 bg-foreground/[0.02]">
                  {draftOutfit.items.map((item, idx) => (
                    <div key={`${item._id}-${idx}`} className="flex items-center gap-6 p-4 bg-background border border-foreground/5 group relative shadow-sm">
                      <div className="w-16 h-20 bg-[#f0f0f0] shrink-0 p-2">
                        <img src={getImageUrl(item.imageUrl)} className="w-full h-full object-contain mix-blend-multiply" alt={item.name} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-sans font-black text-lg uppercase truncate leading-none">{item.name}</p>
                        <p className="text-[9px] uppercase tracking-[0.3em] font-black text-foreground/40">{item.category} // {item.brand || 'Unknown'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleReplaceItem(idx, item.category)} className="p-2.5 bg-foreground/5 hover:bg-foreground hover:text-background text-foreground transition-colors" title="Swap">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleRemoveItem(idx)} className="p-2.5 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-500 transition-colors" title="Remove">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setShowSelector({ open: true, categoryFilter: null })} className="w-full py-5 bg-foreground text-background text-[10px] uppercase tracking-[0.4em] font-black hover:opacity-90 transition-all flex items-center justify-center gap-3 mt-8 shadow-xl">
                    <Plus className="w-4 h-4" /> Add Piece to Canvas
                  </button>
               </div>
            </div>
          </div>

          {/* ARCHIVE VIEW */}
          <div className="w-1/2 h-full overflow-y-auto bg-background p-8 lg:p-12">
            <div className="max-w-[1800px] mx-auto pb-40">
               <div className="mb-12">
                 <h2 className="font-sans font-black text-4xl uppercase tracking-tighter">Archived Compositions</h2>
                 <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/50 font-black mt-2">Ready to Wear</p>
               </div>
               
               {outfits.length === 0 ? (
                 <div className="py-40 text-center border border-dashed border-foreground/10">
                   <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 font-black">No looks archived yet. Head to the Lab to start composing.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                   {outfits.map(outfit => (
                     <div key={outfit._id} className="group relative flex flex-col bg-background border border-foreground/5 hover:border-foreground/20 transition-colors">
                       <div className="relative aspect-[3/4] bg-[#f7f7f7] overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => setSelectedArchiveOutfit(outfit)}>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                             <span className="font-mono text-[9px] uppercase tracking-widest bg-white text-black px-5 py-3 font-black shadow-xl">View Details</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(outfit._id); }} className="absolute top-4 right-4 z-[60] p-2.5 bg-white shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                             <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="relative w-full h-full scale-[0.75] flex items-center justify-center select-none pointer-events-none origin-center">
                            {outfit.items.map((item, idx) => {
                               const { posClass } = getPieceLayout(item, outfit.items);
                               return (
                                 <div key={`${item._id}-${idx}`} className={posClass}>
                                   <img src={getImageUrl(item.imageUrl)} className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]" alt="" />
                                 </div>
                               );
                            })}
                          </div>
                       </div>
                       <div className="p-6 border-t border-foreground/5 space-y-2">
                         <h3 className="font-sans font-black text-xl uppercase tracking-tighter leading-none truncate">{outfit.name}</h3>
                         <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/40 font-black truncate">{outfit.occasion} // {outfit.items.length} Pieces</p>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* SELECTOR MODAL */}
      <Dialog open={showSelector.open} onOpenChange={(open) => setShowSelector({ ...showSelector, open })}>
        <DialogContent className="max-w-[90vw] lg:max-w-5xl p-0 bg-background border-foreground/10 shadow-2xl rounded-none overflow-hidden">
          <div className="p-8 border-b border-foreground/5 flex justify-between items-center">
            <h3 className="font-sans font-black text-2xl uppercase tracking-tighter">Archive Selection</h3>
          </div>
          <div className="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto bg-foreground/[0.02]">
            {wardrobeItems
              .filter(item => !showSelector.categoryFilter || getCategoryGroup(item.category) === showSelector.categoryFilter)
              .map(item => (
              <div key={item._id} onClick={() => handleSelectItem(item)} className="cursor-pointer group relative bg-background border border-foreground/5 hover:border-foreground transition-all">
                <div className="aspect-[4/5] bg-[#f0f0f0] p-4">
                  <img src={getImageUrl(item.imageUrl)} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                </div>
                <div className="p-3 border-t border-foreground/5"><p className="font-sans font-black text-[11px] uppercase truncate">{item.name}</p></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-[2px]">
                  <span className="bg-foreground text-background text-[9px] uppercase tracking-widest font-black px-5 py-2.5 shadow-xl">Select Piece</span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* OUTFIT DETAIL MODAL */}
      <Dialog open={!!selectedArchiveOutfit} onOpenChange={() => setSelectedArchiveOutfit(null)}>
        <DialogContent className="max-w-[95vw] lg:max-w-7xl p-0 border-none bg-background rounded-none overflow-hidden shadow-2xl">
          {selectedArchiveOutfit && (
            <div className="flex flex-col lg:grid lg:grid-cols-[1.2fr_1fr] h-[90vh] md:h-[85vh]">
              <div 
                ref={canvasRef}
                className="relative bg-[#f3f3f3] flex items-center justify-center p-12 lg:p-24 overflow-hidden border-r border-foreground/5"
              >
                <div className="relative aspect-[3/4] h-full max-w-full flex items-center justify-center select-none bg-[#f3f3f3] mx-auto">
                  <AnimatePresence mode="popLayout">
                    {selectedArchiveOutfit.items.map((item, idx) => {
                      const { posClass, tagPos } = getPieceLayout(item, selectedArchiveOutfit.items);

                      return (
                        <motion.div 
                          key={item._id} 
                          initial={{ scale: 0, opacity: 0 }} 
                          animate={{ scale: 1, opacity: 1 }} 
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ 
                            type: "spring", 
                            damping: 12, 
                            stiffness: 100,
                            delay: idx * 0.12 
                          }}
                          className={posClass}
                        >
                          <img src={getImageUrl(item.imageUrl)} className="w-full h-auto object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.12)]" alt="" />
                          
                          {exportWithTags && (
                            <div className={`absolute ${tagPos} whitespace-nowrap z-[70]`}>
                              <div className="bg-white/80 backdrop-blur-md border border-black/5 px-3 py-1.5 shadow-sm flex flex-col">
                                 <span className="font-mono text-[8px] uppercase tracking-widest font-black leading-none">{item.name}</span>
                                 <span className="font-mono text-[6px] uppercase tracking-[0.2em] text-foreground/40 font-bold mt-1">{item.brand || 'No Brand'}</span>
                              </div>
                              <div className="w-[1px] h-4 bg-black/10 mx-auto mt-0.5"></div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              <div className="p-8 lg:p-16 flex flex-col justify-between bg-background overflow-y-auto">
                <div className="space-y-12">
                   <div className="flex justify-between items-start gap-6">
                      <div className="space-y-4">
                        <h2 className="font-sans font-black text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.85]">{selectedArchiveOutfit.name}</h2>
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/40 font-black">{selectedArchiveOutfit.occasion}</span>
                      </div>
                      <button 
                        onClick={() => setExportWithTags(!exportWithTags)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 border border-foreground/5 hover:bg-foreground/5 transition-all rounded-full"
                      >
                        {exportWithTags ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="font-mono text-[8px] uppercase tracking-widest font-black">{exportWithTags ? 'Tags On' : 'Tags Off'}</span>
                      </button>
                   </div>

                   <div className="space-y-4">
                      <h4 className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/30 font-black">Composition Breakdown</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedArchiveOutfit.items.map((item) => (
                          <div key={item._id} className="flex items-center justify-between py-2 border-b border-foreground/5 group hover:border-foreground/20 transition-colors">
                             <span className="font-sans font-black text-xs uppercase tracking-tight">{item.name}</span>
                             <span className="font-mono text-[8px] uppercase tracking-widest text-foreground/40">{item.category}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="pt-12 space-y-4 mt-auto">
                   <button 
                     onClick={() => handleLoadToLab(selectedArchiveOutfit)} 
                     className="w-full bg-foreground text-background py-5 font-black uppercase tracking-[0.3em] text-[10px] hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl"
                   >
                      <RefreshCw className="w-4 h-4" /> Load into Lab
                   </button>
                   <div className="flex gap-3">
                      <button 
                        onClick={handleExport} 
                        disabled={exporting}
                        className="flex-1 border border-foreground/10 py-4 text-[9px] uppercase font-black tracking-widest flex items-center justify-center gap-2 hover:bg-foreground/5 disabled:opacity-50"
                      >
                        {exporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        {exporting ? 'Processing...' : 'Export PNG'}
                      </button>
                      <button 
                        onClick={() => handleDelete(selectedArchiveOutfit._id)} 
                        className="flex-1 border border-red-500/20 text-red-500 py-4 text-[9px] uppercase font-black tracking-widest hover:bg-red-500 hover:text-white transition-all"
                      >
                        Delete permanent
                      </button>
                   </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
