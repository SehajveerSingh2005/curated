import type { Outfit } from '../../types';
import { Card } from "@/components/ui/card";

interface Props { outfit: Outfit; }

export default function OutfitCard({ outfit }: Props) {
  return (
    <Card className="group overflow-hidden rounded-none border border-foreground/10 hover:border-foreground/20 transition-colors grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-0 bg-background">
      <div className="relative bg-muted aspect-[21/9] md:aspect-auto overflow-hidden">
        <div className="absolute inset-0 p-12 flex items-center justify-center">
          <div className="relative w-full h-full max-w-md">
            <div className="absolute top-[5%] left-[5%] w-[50%] aspect-[3/4] z-10 shadow-2xl overflow-hidden border border-white/20">
              <img src={outfit.items[0].imageUrl} alt="" className="w-full h-full object-cover grayscale brightness-110" />
            </div>
            <div className="absolute top-[20%] right-[5%] w-[45%] aspect-[3/4] z-0 overflow-hidden opacity-60">
              <img src={outfit.items[1].imageUrl} alt="" className="w-full h-full object-cover grayscale brightness-110" />
            </div>
            <div className="absolute bottom-[5%] left-[30%] w-[40%] aspect-[3/4] z-20 shadow-2xl overflow-hidden border border-white/40">
              <img src={outfit.items[2].imageUrl} alt="" className="w-full h-full object-cover grayscale brightness-110" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-12 flex flex-col justify-center gap-8 border-t md:border-t-0 md:border-l border-foreground/10">
        <div className="space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">{outfit.occasion}</span>
          <p className="font-sans font-bold text-lg md:text-2xl tracking-tighter uppercase leading-[1.1]">
            {outfit.explanation}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {outfit.items.map((item) => (
            <span key={item._id} className="text-[10px] font-bold uppercase tracking-widest border border-foreground/20 px-3 py-1">
              {item.name}
            </span>
          ))}
        </div>
        <button className="w-fit text-[11px] font-bold uppercase tracking-widest border-b-2 border-foreground pb-1 hover:pb-2 transition-all">
          View Collection
        </button>
      </div>
    </Card>
  );
}
