import type { WardrobeItem } from '../../types';

interface Props {
  item: WardrobeItem;
  onSell?: (item: WardrobeItem) => void;
}

export default function WardrobeItemCard({ item }: Props) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-3">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-all duration-700
            group-hover:scale-[1.04]"
          loading="lazy"
        />
        {/* Hover label */}
        <div className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur-sm
          translate-y-full group-hover:translate-y-0 transition-transform duration-300 px-4 py-3">
          <p className="text-[9px] uppercase tracking-[0.25em] text-center font-medium text-foreground">
            Quick View
          </p>
        </div>
      </div>
      <p className="text-[11px] font-medium leading-tight truncate mb-0.5 text-foreground">{item.name}</p>
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{item.category}</p>
    </div>
  );
}
