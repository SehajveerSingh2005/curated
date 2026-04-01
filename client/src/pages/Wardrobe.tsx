import { useState } from 'react';
import { Plus } from 'lucide-react';
import { mockWardrobeItems } from '../data/mockData';
import type { WardrobeItem } from '../types';
import WardrobeItemCard from '../components/ui/WardrobeItemCard';
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
    <div className="pt-24 pb-24 max-w-[1600px] mx-auto px-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-14 border-b border-border pb-10">
        <div>
          <span className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground font-semibold block mb-4">
            Inventory &mdash; {items.length} pieces
          </span>
          <h1 className="font-sans font-bold leading-[0.9] tracking-tight"
            style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
            Wardrobe
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] font-medium
            px-7 py-3 border border-foreground/20 text-foreground
            hover:bg-foreground hover:text-background transition-all duration-300"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Piece
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-x-7 gap-y-3 mb-14">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-[11px] uppercase tracking-[0.18em] pb-0.5 transition-all duration-200 font-medium
              ${filter === cat
                ? 'text-foreground border-b border-foreground'
                : 'text-muted-foreground hover:text-foreground border-b border-transparent'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
        {filtered.map((item) => (
          <WardrobeItemCard key={item._id} item={item} onSell={() => {}} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-40 text-center border border-dashed border-border">
          <p className="font-heading text-3xl italic text-muted-foreground">Nothing here yet.</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50 mt-3">Add your first piece</p>
        </div>
      )}

      {/* Add Item Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm p-10 gap-8 border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-heading text-3xl italic font-normal">Add Piece</DialogTitle>
          </DialogHeader>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
            {[
              { label: 'Name', placeholder: 'Oxford Shirt' },
              { label: 'Tags', placeholder: 'minimal, basic' },
              { label: 'Image URL', placeholder: 'https://...' },
            ].map(({ label, placeholder }) => (
              <div key={label} className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</label>
                <Input placeholder={placeholder} className="h-10 bg-muted border-border text-[13px]" />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Category</label>
              <Select>
                <SelectTrigger className="h-10 bg-muted border-border text-[13px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <SelectItem key={c} value={c} className="text-[12px] uppercase tracking-wide">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <button
                type="submit"
                className="w-full h-10 text-[11px] uppercase tracking-[0.2em] font-medium
                  bg-foreground text-background hover:opacity-80 transition-opacity"
              >
                Add to Archive
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
