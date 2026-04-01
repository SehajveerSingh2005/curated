import type { Product } from '../../types';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-3">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
        {/* Condition badge on hover */}
        <div className="absolute top-3 left-3 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
          <span className="text-[9px] uppercase tracking-[0.18em] px-2.5 py-1.5
            bg-background/90 backdrop-blur-sm border border-border text-foreground font-medium">
            {product.condition}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-start gap-2">
        <p className="text-[11px] font-medium leading-tight flex-1 truncate text-foreground">{product.name}</p>
        <span className="text-[11px] font-medium tabular-nums text-foreground shrink-0">${product.price}</span>
      </div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-0.5">{product.seller}</p>
    </div>
  );
}
