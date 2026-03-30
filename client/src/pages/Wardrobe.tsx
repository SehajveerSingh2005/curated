import { useState } from 'react';
import { Plus } from 'lucide-react';
import { mockWardrobeItems } from '../data/mockData';
import type { WardrobeItem } from '../types';
import WardrobeItemCard from '../components/ui/WardrobeItemCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const CATEGORIES = ['All', 'shirt', 'pants', 'shoes', 'jacket', 'dress', 'accessory', 'other'];

export default function Wardrobe() {
  const [items] = useState<WardrobeItem[]>(mockWardrobeItems);
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const filtered = filter === 'All' ? items : items.filter((i) => i.category === filter);

  return (
    <div className="pt-32 pb-20 max-w-[1800px] mx-auto px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground block mb-3">Inventory</span>
          <h1 className="font-heading font-black text-6xl md:text-8xl tracking-tighter uppercase leading-[0.8]">Wardrobe</h1>
        </div>
        <Button onClick={() => setShowModal(true)} className="h-10 px-12 text-[10px] font-black uppercase tracking-[0.2em] rounded-none shadow-2xl hover:bg-foreground/90 transition-all">
          <Plus className="mr-3 w-3 h-3" /> Add Item
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-1 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`px-10 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border
              ${filter === cat 
                ? 'bg-foreground text-background border-foreground' 
                : 'bg-transparent text-muted-foreground border-transparent hover:border-foreground/10'}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        {filtered.map((item) => (
          <WardrobeItemCard key={item._id} item={item} onSell={() => {}} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-40 text-center border shadow-sm">
          <p className="font-sans font-bold text-xl uppercase tracking-tighter text-muted-foreground">
            Category Empty
          </p>
        </div>
      )}

      {/* Add Item Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md p-12 gap-10 rounded-none border-foreground/10">
          <DialogHeader>
            <DialogTitle className="font-sans font-bold text-3xl uppercase tracking-tighter">Add Item</DialogTitle>
          </DialogHeader>
          
          <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Item Name</label>
              <Input placeholder="Oxford Shirt" className="h-10 bg-muted/20 border-none rounded-none focus-visible:ring-1 focus-visible:ring-foreground" />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
              <Select>
                <SelectTrigger className="h-10 bg-muted/20 border-none rounded-none focus:ring-1 focus:ring-foreground">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <SelectItem key={c} value={c} className="text-[11px] font-bold uppercase tracking-wider rounded-none">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tags</label>
              <Input placeholder="Minimal, Basic" className="h-10 bg-muted/20 border-none rounded-none focus-visible:ring-1 focus-visible:ring-foreground" />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Image URL</label>
              <Input placeholder="HTTPS://..." className="h-10 bg-muted/20 border-none rounded-none focus-visible:ring-1 focus-visible:ring-foreground" />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full h-10 text-[11px] font-bold uppercase tracking-widest rounded-none">
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
