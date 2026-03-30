import type { WardrobeItem } from '../../types';
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  item: WardrobeItem;
  onSell?: (item: WardrobeItem) => void;
}

export default function WardrobeItemCard({ item }: Props) {
  return (
    <Card className="group h-full bg-transparent border-none shadow-none rounded-none overflow-hidden cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="w-full h-full object-cover grayscale brightness-110 transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-background/90 backdrop-blur-sm border-t">
          <p className="text-[10px] font-bold uppercase tracking-widest text-center">Quick View</p>
        </div>
      </div>
      <CardContent className="p-4 space-y-1">
        <h3 className="text-[11px] font-bold uppercase tracking-widest truncate">{item.name}</h3>
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{item.category}</p>
      </CardContent>
    </Card>
  );
}
