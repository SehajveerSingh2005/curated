import { useState } from 'react';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { mockProducts } from '../data/mockData';
import type { Product } from '../types';
import ProductCard from '../components/ui/ProductCard';
import { Button } from '@/components/ui/button';

export default function Marketplace() {
  const [products] = useState<Product[]>(mockProducts);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="pt-32 pb-20 max-w-[1800px] mx-auto px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground block mb-3">Commerce</span>
          <h1 className="font-heading font-black text-6xl md:text-8xl tracking-tighter uppercase leading-[0.8]">Market</h1>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            className="h-10 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all" 
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <SlidersHorizontal className="mr-3 w-3 h-3" /> Filter
          </Button>
          <Button 
            variant="outline" 
            className="h-10 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all"
          >
            <ArrowUpDown className="mr-3 w-3 h-3" /> Sort
          </Button>
        </div>
      </div>

      {filterOpen && (
        <div className="mb-20 p-12 border border-foreground/10 animate-in fade-in slide-in-from-top-4 duration-500 bg-foreground/[0.02]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
            <div className="space-y-6">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Category</span>
              <ul className="text-[11px] font-black uppercase space-y-3">
                <li className="cursor-pointer hover:tracking-widest transition-all">All</li>
                <li className="cursor-pointer text-muted-foreground hover:text-foreground transition-all">Outerwear</li>
                <li className="cursor-pointer text-muted-foreground hover:text-foreground transition-all">Footwear</li>
              </ul>
            </div>
            <div className="space-y-6">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Price</span>
              <ul className="text-[11px] font-black uppercase space-y-3">
                <li className="cursor-pointer hover:tracking-widest transition-all">$0 — $100</li>
                <li className="cursor-pointer text-muted-foreground hover:text-foreground transition-all">$100 — $500</li>
                <li className="cursor-pointer text-muted-foreground hover:text-foreground transition-all">$500+</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-1 gap-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
