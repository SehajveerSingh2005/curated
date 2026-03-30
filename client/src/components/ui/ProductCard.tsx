import type { Product } from '../../types';
import { Card, CardContent } from "@/components/ui/card";

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  return (
    <Card className="group border-none shadow-none rounded-none overflow-hidden cursor-pointer bg-transparent">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover grayscale brightness-110 transition-transform duration-700 group-hover:scale-105"
          loading="lazy" 
        />
        <div className="absolute top-4 right-4 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <span className="bg-background text-foreground text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 border">
            {product.condition}
          </span>
        </div>
      </div>
      <CardContent className="p-4 space-y-1">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest truncate flex-1">{product.name}</h3>
          <span className="text-[11px] font-bold tracking-tight">${product.price}</span>
        </div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{product.seller}</p>
      </CardContent>
    </Card>
  );
}
