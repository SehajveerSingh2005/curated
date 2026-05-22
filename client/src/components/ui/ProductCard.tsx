import type { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const { user } = useAuth();
  const isOwnListing = user && (typeof product.seller === 'object' ? product.seller?._id === user.id : product.seller === user.id);
  const sellerName = isOwnListing 
    ? `${typeof product.seller === 'object' ? product.seller?.username : product.seller} (You)` 
    : (typeof product.seller === 'object' ? product.seller?.username : product.seller);

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-3">
        <img
          src={product.imageUrl?.startsWith('/') 
            ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${product.imageUrl}` 
            : product.imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.04] ${
            product.status === 'sold' ? 'opacity-40 grayscale' : ''
          }`}
          loading="lazy"
        />
        {/* Condition badge on hover */}
        {product.status !== 'sold' && (
          <div className="absolute top-3 left-3 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
            <span className="text-[9px] uppercase tracking-[0.18em] px-2.5 py-1.5
              bg-background/90 backdrop-blur-sm border border-border text-foreground font-medium">
              {product.condition}
            </span>
          </div>
        )}
        {/* Sold Badge */}
        {product.status === 'sold' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <span className="text-[9px] uppercase tracking-[0.3em] px-4 py-2 border border-foreground/30 bg-background text-foreground font-bold">
              Sold
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-start gap-2">
        <p className="text-[11px] font-medium leading-tight flex-1 truncate text-foreground">{product.name}</p>
        <span className="text-[11px] font-medium tabular-nums text-foreground shrink-0">${product.price}</span>
      </div>
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-0.5">{sellerName}</p>
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 items-center">
          <span className="text-[7.5px] uppercase tracking-[0.15em] bg-foreground text-background px-1.5 py-0.5 font-mono font-black flex items-center gap-0.5 shadow-sm">
            <span>✨</span> AI
          </span>
          {product.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[7.5px] uppercase tracking-[0.15em] bg-foreground/5 px-2 py-0.5 font-mono text-foreground/50 border border-foreground/5 font-black">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
