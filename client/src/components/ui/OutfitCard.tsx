import type { Outfit } from '../../types';

interface Props { outfit: Outfit; }

export default function OutfitCard({ outfit }: Props) {
  return (
    <div className="group border border-border hover:border-foreground/20 transition-colors duration-300
      grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-card">

      {/* Left — layered garment thumbnails */}
      <div className="relative bg-muted aspect-square md:aspect-auto overflow-hidden min-h-[300px]">
        <div className="absolute inset-0 p-10 flex items-center justify-center">
          <div className="relative w-full h-full max-w-[280px] mx-auto">
            <div className="absolute top-[14%] right-[4%] w-[44%] aspect-[3/4] overflow-hidden border border-foreground/10 shadow-xl">
              <img src={outfit.items[1]?.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-[4%] left-[4%] w-[50%] aspect-[3/4] overflow-hidden border border-foreground/10 shadow-2xl z-10">
              <img src={outfit.items[0]?.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-[2%] left-[28%] w-[38%] aspect-[3/4] overflow-hidden border border-foreground/20 shadow-2xl z-20">
              <img src={outfit.items[2]?.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Right — details */}
      <div className="flex flex-col justify-between p-10 border-t md:border-t-0 md:border-l border-border">
        <div className="space-y-5">
          <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground font-semibold">
            {outfit.occasion}
          </span>
          <p className="font-sans font-bold text-2xl md:text-3xl leading-[1.1] tracking-tight">
            {outfit.explanation}
          </p>
        </div>

        <div className="space-y-6 mt-8">
          <div className="flex flex-wrap gap-2">
            {outfit.items.map((item) => (
              <span key={item._id}
                className="text-[9px] uppercase tracking-[0.18em] border border-border px-3 py-1.5 text-muted-foreground">
                {item.name}
              </span>
            ))}
          </div>
          <button className="group/cta text-[10px] uppercase tracking-[0.22em] font-medium
            pb-px border-b border-foreground/30 hover:border-foreground transition-all duration-200 w-fit text-foreground">
            View Collection
          </button>
        </div>
      </div>
    </div>
  );
}
