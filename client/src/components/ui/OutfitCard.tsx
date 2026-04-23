import { useState } from 'react';
import type { Outfit } from '../../types';
import {
  Dialog,
  DialogContent,
} from "./dialog";

interface Props { outfit: Outfit; }

export default function OutfitCard({ outfit }: Props) {
  const [showModal, setShowModal] = useState(false);

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('/')) return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
    return url;
  };

  return (
    <div className="group border border-foreground/5 hover:border-foreground/10 transition-all duration-700
      grid grid-cols-1 md:grid-cols-[1.2fr_1fr] overflow-hidden bg-background">

      {/* Left — layered garment thumbnails */}
      <div className="relative bg-[#f8f8f8] aspect-square md:aspect-auto overflow-hidden min-h-[400px]">
        <div className="absolute inset-0 p-12 flex items-center justify-center">
          <div className="relative w-full h-full max-w-[320px] mx-auto">
            {/* Background Item (Top Right) */}
            {outfit.items[1] && (
              <div className="absolute top-[10%] right-[2%] w-[48%] aspect-[4/5] overflow-hidden border border-foreground/5 shadow-2xl transition-transform duration-1000 group-hover:translate-x-4 group-hover:-translate-y-2">
                <img src={getImageUrl(outfit.items[1].imageUrl)} alt="" className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700" />
              </div>
            )}
            {/* Middle Item (Top Left) */}
            {outfit.items[0] && (
              <div className="absolute top-[5%] left-[0%] w-[52%] aspect-[4/5] overflow-hidden border border-foreground/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] z-10 transition-transform duration-1000 group-hover:-translate-x-4 group-hover:-translate-y-4">
                <img src={getImageUrl(outfit.items[0].imageUrl)} alt="" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" />
              </div>
            )}
            {/* Front Item (Bottom) */}
            {outfit.items[2] && (
              <div className="absolute bottom-[0%] left-[24%] w-[42%] aspect-[4/5] overflow-hidden border border-foreground/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] z-20 transition-transform duration-1000 group-hover:translate-y-6">
                <img src={getImageUrl(outfit.items[2].imageUrl)} alt="" className="w-full h-full object-cover hover:scale-110 transition-all duration-1000" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right — details */}
      <div className="flex flex-col justify-between p-10 lg:p-14 border-t md:border-t-0 md:border-l border-foreground/5">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-[1px] w-8 bg-foreground/20"></div>
             <span className="text-[10px] uppercase tracking-[0.5em] text-foreground/40 font-black">
               Unit_Look_{outfit._id?.slice(-4).toUpperCase() || 'NEW'}
             </span>
          </div>
          <h3 className="font-sans font-black text-3xl lg:text-4xl leading-[0.9] tracking-tighter uppercase">
            {outfit.name || 'Untitled Look'}
          </h3>
          <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-foreground/60">
            Occasion // {outfit.occasion}
          </p>
        </div>

        <div className="space-y-8 mt-12">
          <div className="flex flex-wrap gap-2">
            {outfit.items.map((item) => (
              <span key={item._id}
                className="text-[9px] uppercase tracking-[0.2em] font-black border border-foreground/5 px-4 py-2 bg-foreground/5 text-foreground/50 hover:text-foreground transition-colors">
                {item.category}
              </span>
            ))}
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-black group/btn"
          >
            <span className="pb-1 border-b border-foreground/20 group-hover/btn:border-foreground transition-all">Details</span>
            <div className="w-12 h-[1px] bg-foreground/20 group-hover/btn:w-16 group-hover/btn:bg-foreground transition-all"></div>
          </button>
        </div>
      </div>

      {/* ─── OUTFIT DETAIL MODAL ───────────────── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-[95vw] lg:max-w-7xl p-0 gap-0 border-none bg-background rounded-none overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:grid lg:grid-cols-[1.2fr_1fr] h-[90vh] lg:h-[85vh]">
             {/* Left: Styled Flat Lay (Tilted & Overlapped) */}
             <div className="bg-[#f0f0f0] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-foreground/5">
                <div className="relative w-full h-full max-w-sm flex flex-col items-center justify-center select-none perspective-1000">
                   
                   {/* 01. HEADWEAR (Tilted Left) */}
                   <div className="h-[15%] w-full flex justify-center z-[60] transform -rotate-[6deg] -translate-x-8">
                      {outfit.items.filter(i => i.category === 'accessory' || i.category === 'other')
                        .slice(0, 1).map(item => (
                        <div key={item._id} className="h-full aspect-square shadow-2xl border border-white/40 animate-in fade-in zoom-in-95 duration-700">
                           <img src={getImageUrl(item.imageUrl)} className="w-full h-full object-contain p-1" alt="" />
                        </div>
                      ))}
                   </div>

                   {/* 02. UPPER BODY (Tilted Right) */}
                   <div className="h-[40%] w-full flex justify-center -mt-8 z-40 transform rotate-[4deg] translate-x-6">
                      {outfit.items.filter(i => ['shirt', 't-shirt', 'polo', 'knitwear', 'outerwear'].includes(i.category))
                        .slice(0, 1).map(item => (
                        <div key={item._id} className="h-full aspect-[4/5] shadow-xl border border-white/30 animate-in fade-in slide-in-from-bottom-4 duration-700">
                           <img src={getImageUrl(item.imageUrl)} className="w-full h-full object-contain" alt="" />
                        </div>
                      ))}
                   </div>

                   {/* 03. LOWER BODY (Overlapping Upper, Tilted Left) */}
                   <div className="h-[50%] w-full flex justify-center -mt-24 z-50 transform -rotate-[3deg] -translate-x-10">
                      {outfit.items.filter(i => i.category === 'pants')
                        .slice(0, 1).map(item => (
                        <div key={item._id} className="h-full aspect-[3/5] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/50 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                           <img src={getImageUrl(item.imageUrl)} className="w-full h-full object-contain" alt="" />
                        </div>
                      ))}
                   </div>

                   {/* 04. FOOTWEAR (Tilted Right) */}
                   <div className="h-[18%] w-full flex justify-center -mt-16 z-[60] transform rotate-[8deg] translate-x-12">
                      {outfit.items.filter(i => i.category === 'shoes')
                        .slice(0, 1).map(item => (
                        <div key={item._id} className="h-full aspect-[1.3/1] shadow-2xl border border-white/40 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                           <img src={getImageUrl(item.imageUrl)} className="w-full h-full object-contain p-2" alt="" />
                        </div>
                      ))}
                   </div>

                   {/* Background Textures/Aesthetics */}
                   <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
                      <span className="absolute -left-10 top-1/4 -rotate-90 font-black text-9xl uppercase tracking-tighter">Composition</span>
                      <span className="absolute -right-10 bottom-1/4 rotate-90 font-black text-9xl uppercase tracking-tighter">Archive</span>
                   </div>
                </div>
             </div>

             {/* Right: Detailed List */}
             <div className="p-10 lg:p-20 flex flex-col justify-between bg-background overflow-y-auto">
                <div className="space-y-16">
                  <div className="space-y-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.6em] text-foreground/40 font-black">Composition Breakdown</span>
                    <h2 className="font-sans font-black text-5xl uppercase tracking-tighter leading-none">{outfit.name}</h2>
                  </div>

                  <div className="space-y-12">
                    {outfit.items.map((item, idx) => (
                      <div key={item._id} className="flex gap-8 group/item">
                        <span className="font-mono text-[10px] text-foreground/20 font-black pt-1">0{idx + 1}</span>
                        <div className="space-y-3 flex-grow pb-8 border-b border-foreground/5 group-last/item:border-none">
                           <div className="flex justify-between items-end">
                              <h4 className="font-sans font-black text-2xl uppercase tracking-tight leading-none">{item.name}</h4>
                              <span className="text-[9px] uppercase tracking-[0.3em] font-black text-foreground/30">{item.category}</span>
                           </div>
                           <p className="text-[11px] uppercase tracking-widest text-foreground/50 font-bold">
                             {item.brand || 'Archived Source'} // {item.color || 'Neutral'} // {item.fabric || 'Raw Material'}
                           </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-12">
                   <button 
                    onClick={() => setShowModal(false)}
                    className="w-full bg-foreground text-background py-6 text-[11px] uppercase tracking-[0.5em] font-black hover:opacity-90 transition-all shadow-xl">
                    Close Breakdown
                   </button>
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
