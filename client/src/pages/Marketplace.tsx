import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { mockProducts } from '../data/mockData';
import type { Product } from '../types';
import ProductCard from '../components/ui/ProductCard';

const SORT_OPTIONS = ['Newest', 'Price ↑', 'Price ↓'];
const FILTER_CATS = ['All', 'Outerwear', 'Footwear', 'Tops', 'Bottoms', 'Accessories'];

export default function Marketplace() {
  const [products] = useState<Product[]>(mockProducts);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeSort, setActiveSort] = useState('Newest');
  const [activeCat, setActiveCat] = useState('All');

  return (
    <div className="pt-24 pb-24 max-w-[1600px] mx-auto px-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-14 border-b border-border pb-10">
        <div>
          <span className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground font-semibold block mb-4">
            Community Exchange
          </span>
          <h1 className="font-sans font-bold leading-[0.9] tracking-tight"
            style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
            Market
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSort(s)}
              className={`text-[10px] uppercase tracking-[0.15em] px-4 py-2 border transition-all duration-200 font-medium
                ${activeSort === s
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] font-medium px-4 py-2 border transition-all duration-200
              ${filterOpen
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              }`}
          >
            <SlidersHorizontal className="w-3 h-3" /> Filter
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="mb-12 pb-10 border-b border-border">
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            {FILTER_CATS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`text-[11px] uppercase tracking-[0.18em] pb-0.5 transition-all duration-200 font-medium
                  ${activeCat === cat
                    ? 'text-foreground border-b border-foreground'
                    : 'text-muted-foreground hover:text-foreground border-b border-transparent'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-12">
        {products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
    </div>
  );
}
