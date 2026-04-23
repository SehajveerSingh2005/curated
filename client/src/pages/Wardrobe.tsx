import { useState, useEffect } from 'react';
import { Plus, X, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WardrobeItem } from '../types';
import WardrobeItemCard from '../components/ui/WardrobeItemCard';
import { wardrobeService } from '../services/api';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const CATEGORIES: WardrobeItem['category'][] = ['shirt', 't-shirt', 'polo', 'knitwear', 'pants', 'outerwear', 'shoes', 'accessory', 'other'];
const ALL_CATEGORIES = ['All', ...CATEGORIES];

export default function Wardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

  // Form State
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'shirt' as WardrobeItem['category'],
    tags: [] as string[],
    imageUrl: '',
    brand: '',
    fabric: '',
    color: '',
    file: null as File | null,
  });
  const [tagInput, setTagInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [cropBox, setCropBox] = useState({ top: 10, left: 20, width: 60, height: 75 }); // 4:5 init
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0, top: 0, left: 0, width: 0, height: 0 });
  const [imgAspect, setImgAspect] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.pageYOffset || document.documentElement.scrollTop;
      // Progress over 100px for a "quicker" snap
      const progress = Math.min(1, offset / 100);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await wardrobeService.getAll();
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((i) => {
    const matchesFilter = filter === 'All' || i.category === filter;
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setNewItem({ ...newItem, file });
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onload = () => {
          setImgAspect(img.naturalWidth / img.naturalHeight);
          setNewItem(prev => ({ ...prev, imageUrl: dataUrl, file }));
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!newItem.tags.includes(tagInput.trim())) {
        setNewItem({ ...newItem, tags: [...newItem.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setNewItem({ ...newItem, tags: newItem.tags.filter(t => t !== tag) });
  };

  // ── CROP INTERACTIVITY ──────────────────
  const handleMouseDown = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    setIsDragging(type);
    setStartPos({
      x: e.clientX,
      y: e.clientY,
      top: cropBox.top,
      left: cropBox.left,
      width: cropBox.width,
      height: cropBox.height
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const pxScale = 0.15;
      const dx = (e.clientX - startPos.x) * pxScale;
      const dy = (e.clientY - startPos.y) * pxScale;

      setCropBox(prev => {
        let { top, left, width, height } = { ...startPos };

        if (isDragging === 'move') {
          top = Math.max(0, Math.min(100 - startPos.height, startPos.top + dy));
          left = Math.max(0, Math.min(100 - startPos.width, startPos.left + dx));
          return { top, left, width: startPos.width, height: startPos.height };
        } else if (isDragging === 'br') {
          width = Math.max(10, Math.min(100 - startPos.left, startPos.width + dx));
          height = (width * imgAspect) / 0.8;
          
          if (startPos.top + height > 100) {
            height = 100 - startPos.top;
            width = (height * 0.8) / imgAspect;
          }
          return { top: startPos.top, left: startPos.left, width, height };
        } else if (isDragging === 'tl') {
          const maxWidth = startPos.left + startPos.width;
          const maxHeight = startPos.top + startPos.height;
          
          height = Math.max(10, Math.min(maxHeight, startPos.height - dy));
          width = (height * 0.8) / imgAspect;
          
          if (width > maxWidth) {
            width = maxWidth;
            height = (width * imgAspect) / 0.8;
          }
          
          top = maxHeight - height;
          left = maxWidth - width;
          return { top: Math.max(0, top), left: Math.max(0, left), width, height };
        }

        return prev;
      });
    };

    const handleMouseUp = () => setIsDragging(null);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos, imgAspect]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.imageUrl) {
      alert("Please add an image first.");
      return;
    }

    setIsSaving(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      const loadPromise = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load image for cropping"));
      });

      img.src = newItem.imageUrl;
      await loadPromise;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not initialize canvas context");

      // Calculate selection in pixels
      // Since the preview container now matches the image aspect ratio, 
      // cropBox percentages are direct maps to the natural pixels.
      const sw = (cropBox.width / 100) * img.naturalWidth;
      const sh = (cropBox.height / 100) * img.naturalHeight;
      const sx = (cropBox.left / 100) * img.naturalWidth;
      const sy = (cropBox.top / 100) * img.naturalHeight;

      canvas.width = 1200;
      canvas.height = 1500;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (!blob) throw new Error("Failed to create image blob");

      const formData = new FormData();
      formData.append('image', blob, 'cropped.jpg');
      formData.append('name', newItem.name);
      formData.append('category', newItem.category);
      formData.append('brand', newItem.brand || '');
      formData.append('fabric', newItem.fabric || '');
      formData.append('color', newItem.color || '');
      formData.append('tags', JSON.stringify(newItem.tags));

      await wardrobeService.addItem(formData);

      setShowModal(false);
      setNewItem({
        name: '',
        category: 'shirt',
        tags: [],
        imageUrl: '',
        brand: '',
        fabric: '',
        color: '',
        file: null,
      });
      fetchItems();
    } catch (err) {
      console.error('Failed to add item:', err);
      alert(err instanceof Error ? err.message : "Failed to save piece. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-[120vh] bg-background text-foreground selection:bg-foreground selection:text-background font-sans"
    >
      
      {/* ─── STICKY HEADER WRAPPER ──────────────── */}
      <div className="sticky top-24 z-[45] bg-background/90 backdrop-blur-3xl border-b border-foreground/5 py-8">
        <div className="max-w-[1800px] mx-auto px-8 lg:px-12 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5" style={{ opacity: 1 - scrollProgress * 0.4 }}>
                  <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/50 font-black">
                    Unit_{items.length}
                  </span>
                  <div className="h-[1px] w-6 bg-foreground/20"></div>
                </div>
                <h1 
                  className="font-black uppercase tracking-tighter leading-none"
                  style={{ 
                    fontSize: `${Math.max(32, 72 - scrollProgress * 40)}px`,
                  }}
                >
                  Wardrobe<span className="font-serif italic lowercase font-normal tracking-normal ml-0.5">.</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative group w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 group-focus-within:text-foreground transition-colors" />
                <input 
                  type="text" 
                  placeholder="SEARCH"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border border-foreground/10 px-10 py-3 text-[10px] uppercase tracking-widest font-black focus:outline-none focus:border-foreground/30 transition-all font-mono"
                />
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-3 bg-foreground text-background px-8 py-3.5 font-black hover:opacity-90 transition-all shadow-xl uppercase tracking-[0.3em] text-[10px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Piece</span>
              </button>
            </div>
          </div>

          {/* Integrated Filter Row — Always visible */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-foreground/5 pt-4 transition-all duration-300">
             <div className="flex items-center gap-3 mr-4">
               <Filter className="w-3.5 h-3.5 text-foreground/50" />
               <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/50 font-black">Section</span>
             </div>
             {ALL_CATEGORIES.map((cat) => (
               <button
                 key={cat}
                 onClick={() => setFilter(cat)}
                 className={`text-[10px] uppercase tracking-[0.4em] font-black transition-all duration-300 relative py-1
                   ${filter === cat 
                     ? 'text-foreground' 
                     : 'text-foreground/40 hover:text-foreground/70'}`}
               >
                 {cat}
                 {filter === cat && (
                   <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-foreground"></div>
                 )}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 lg:px-12 pt-28 pb-24">
        
        {/* ─── GRID ─────────────────────────── */}
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-8">
            <div className="w-12 h-[1px] bg-foreground/20 animate-pulse"></div>
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/50 font-black animate-pulse">Scanning Archive...</p>
          </div>
        ) : filtered.length > 0 ? (
          <motion.div 
            layout
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-px gap-y-20 border-l border-foreground/5"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <motion.div
                  layout
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="border-r border-foreground/5 px-6 cursor-pointer" 
                  onClick={() => setSelectedItem(item)}
                >
                  <WardrobeItemCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-40 flex flex-col items-center justify-center text-center border border-dashed border-foreground/10"
          >
            <h2 className="font-serif italic text-6xl text-foreground/20 mb-8 select-none">Empty Space</h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/50 font-black max-w-xs leading-loose">
              No items match your current selection in the archive.
            </p>
          </motion.div>
        )}
      </div>

      {/* ─── ADD ITEM MODAL ───────────────── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-[95vw] lg:max-w-6xl p-0 gap-0 border-none bg-background rounded-none overflow-hidden shadow-2xl">
          <div className="flex flex-col md:grid md:grid-cols-[1.1fr_1fr] h-[90vh] md:h-[85vh] min-h-[500px]">
            <div
              className={`relative border-r border-foreground/5 flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden
                ${newItem.imageUrl ? 'bg-zinc-950' : 'bg-alt'}
                ${dragActive ? 'bg-foreground/5' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {newItem.imageUrl ? (
                <div className="relative w-full h-full flex items-center justify-center p-8 lg:p-12">
                   <div className="relative max-w-full max-h-full shadow-2xl" 
                        style={{ aspectRatio: imgAspect, height: 'auto', width: imgAspect > 1.2 ? '100%' : 'auto', maxHeight: '100%' }}>
                    <img src={newItem.imageUrl} className="w-full h-full block" alt="Preview" />
                    <div className="absolute inset-0 pointer-events-none">
                       <div className="absolute bg-black/70 inset-x-0 top-0" style={{ height: `${cropBox.top}%` }}></div>
                       <div className="absolute bg-black/70 inset-x-0 bottom-0" style={{ height: `${100 - (cropBox.top + cropBox.height)}%` }}></div>
                       <div className="absolute bg-black/70 left-0" style={{ top: `${cropBox.top}%`, height: `${cropBox.height}%`, width: `${cropBox.left}%` }}></div>
                       <div className="absolute bg-black/70 right-0" style={{ top: `${cropBox.top}%`, height: `${cropBox.height}%`, width: `${100 - (cropBox.left + cropBox.width)}%` }}></div>
                    </div>
                    <div 
                      className="absolute border-2 border-white/80"
                      onMouseDown={(e) => handleMouseDown(e, 'move')}
                      style={{
                        top: `${cropBox.top}%`,
                        left: `${cropBox.left}%`,
                        width: `${cropBox.width}%`,
                        height: `${cropBox.height}%`,
                        cursor: isDragging === 'move' ? 'grabbing' : 'grab'
                      }}
                    >
                      <div onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'tl'); }} className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-black cursor-nw-resize z-50"></div>
                      <div onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'br'); }} className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-black cursor-se-resize z-50"></div>
                      <div className="absolute top-2 left-2 flex items-center gap-2 pointer-events-none">
                        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white font-black opacity-60">Unit_4:5</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setNewItem({ ...newItem, imageUrl: '' })} className="absolute top-6 right-6 bg-black/50 backdrop-blur-xl p-2.5 hover:bg-white hover:text-black transition-all z-[60] border border-white/20">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-8 p-12">
                  <div className="w-16 h-16 border border-foreground/10 mx-auto flex items-center justify-center">
                    <Plus className="w-6 h-6 text-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.4em] font-black">Drop Visual</p>
                    <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-foreground/60">PNG, JPG up to 10MB</p>
                  </div>
                  <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const img = new Image();
                        img.onload = () => {
                          setImgAspect(img.naturalWidth / img.naturalHeight);
                          setNewItem({ ...newItem, imageUrl: reader.result as string, file: e.target.files![0] });
                        };
                        img.src = reader.result as string;
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }} />
                  <label htmlFor="file-upload" className="inline-block border border-foreground/20 px-8 py-3 text-[9px] uppercase tracking-[0.3em] font-black cursor-pointer hover:bg-foreground hover:text-background transition-all">SELECT FILE</label>
                </div>
              )}
            </div>

            <div className="p-8 lg:p-14 flex flex-col overflow-y-auto bg-background">
              <div className="space-y-10 max-w-sm mx-auto w-full py-8">
                <div className="space-y-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.5em] text-foreground/60 font-black">Step 01 // ENTRY</span>
                  <h2 className="font-sans font-black text-4xl uppercase tracking-tighter">New Piece</h2>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="space-y-1.5 focus-within:text-foreground text-foreground/60 transition-colors">
                    <label className="font-mono text-[11px] uppercase tracking-[0.5em] font-black">Designation</label>
                    <input required placeholder="ITEM NAME" className="w-full bg-transparent border-b border-foreground/10 py-3 text-[12px] uppercase tracking-[0.2em] font-black focus:outline-none focus:border-foreground transition-all placeholder:text-foreground/10" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1.5 focus-within:text-foreground text-foreground/60 transition-colors">
                      <label className="font-mono text-[11px] uppercase tracking-[0.5em] font-black">Brand</label>
                      <input placeholder="SOURCE" className="w-full bg-transparent border-b border-foreground/10 py-3 text-[12px] uppercase tracking-[0.2em] font-black focus:outline-none focus:border-foreground transition-all placeholder:text-foreground/10" value={newItem.brand} onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })} />
                    </div>
                    <div className="space-y-1.5 focus-within:text-foreground text-foreground/60 transition-colors">
                      <label className="font-mono text-[11px] uppercase tracking-[0.5em] font-black">Fabric</label>
                      <input placeholder="MATERIAL" className="w-full bg-transparent border-b border-foreground/10 py-3 text-[12px] uppercase tracking-[0.2em] font-black focus:outline-none focus:border-foreground transition-all placeholder:text-foreground/10" value={newItem.fabric} onChange={(e) => setNewItem({ ...newItem, fabric: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="font-mono text-[11px] uppercase tracking-[0.5em] text-foreground/60 font-black">Category</label>
                    <div className="grid grid-cols-3 gap-2">
                      {CATEGORIES.map(c => (
                        <button key={c} type="button" onClick={() => setNewItem({ ...newItem, category: c })} className={`py-3 text-[10px] uppercase tracking-[0.2em] font-black border transition-all ${newItem.category === c ? 'bg-foreground text-background border-foreground' : 'border-foreground/10 text-foreground/60 hover:border-foreground/30'}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5 focus-within:text-foreground text-foreground/60 transition-colors">
                    <label className="font-mono text-[11px] uppercase tracking-[0.5em] font-black">Color</label>
                    <input placeholder="PALETTE" className="w-full bg-transparent border-b border-foreground/10 py-3 text-[12px] uppercase tracking-[0.2em] font-black focus:outline-none focus:border-foreground transition-all placeholder:text-foreground/10" value={newItem.color} onChange={(e) => setNewItem({ ...newItem, color: e.target.value })} />
                  </div>
                  <div className="space-y-4">
                    <label className="font-mono text-[11px] uppercase tracking-[0.5em] text-foreground/60 font-black">Context Tags</label>
                    <input placeholder="PRESS ENTER TO ADD" className="w-full bg-transparent border-b border-foreground/10 py-3 text-[12px] uppercase tracking-[0.2em] font-black focus:outline-none focus:border-foreground transition-all placeholder:text-foreground/10" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} />
                    <div className="flex flex-wrap gap-2 pt-2">
                      {newItem.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-2 bg-foreground/5 p-2.5 text-[10px] uppercase tracking-widest font-black">{tag}<button type="button" onClick={() => removeTag(tag)}><X className="w-3.5 h-3.5 hover:text-red-500 transition-colors" /></button></span>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={!newItem.name || !newItem.imageUrl || isSaving} className="w-full bg-foreground text-background py-4 text-[10px] uppercase tracking-[0.5em] font-black hover:opacity-90 transition-all disabled:opacity-20 disabled:cursor-not-allowed mt-6 shadow-xl">
                    {isSaving ? 'Archiving...' : 'Archive Piece'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── VIEW ITEM MODAL ───────────────── */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="w-[80vw] sm:max-w-[90vw] lg:max-w-6xl p-0 gap-0 border-none bg-background rounded-none overflow-hidden shadow-2xl scale-100">
          {selectedItem && (
            <div className="flex flex-col md:grid md:grid-cols-[0.85fr_1fr] h-[95vh] md:h-[80vh] min-h-[550px] w-full">
              {/* Left Side: Image Container (Narrower) */}
              <div className="bg-zinc-950 flex flex-col items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-foreground/5 h-[40vh] md:h-full">
                <img 
                  src={selectedItem.imageUrl?.startsWith('/') 
                    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${selectedItem.imageUrl}` 
                    : selectedItem.imageUrl} 
                  className="w-full h-full object-cover opacity-95 transition-opacity duration-700 hover:opacity-100"
                  alt={selectedItem.name} 
                />
              </div>

              {/* Right Side: Metadata Detail */}
              <div className="p-8 lg:p-14 xl:p-20 flex flex-col justify-between overflow-y-auto bg-background">
                <div className="space-y-10 lg:space-y-12">
                   <div className="space-y-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.6em] text-foreground/50 font-black">Archive Unit // {selectedItem._id.slice(-6).toUpperCase()}</span>
                      <h2 className="font-sans font-black text-4xl lg:text-5xl xl:text-6xl uppercase tracking-[-0.03em] leading-[0.8]">{selectedItem.name}</h2>
                   </div>

                   <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/50 font-black block">Category</label>
                        <p className="text-[13px] lg:text-[15px] uppercase tracking-[0.2em] font-black break-words">{selectedItem.category}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/50 font-black block">Brand</label>
                        <p className="text-[13px] lg:text-[15px] uppercase tracking-[0.2em] font-black break-words">{selectedItem.brand || '—'}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/50 font-black block">Fabric</label>
                        <p className="text-[13px] lg:text-[15px] uppercase tracking-[0.2em] font-black break-words">{selectedItem.fabric || '—'}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/50 font-black block">Color</label>
                        <p className="text-[13px] lg:text-[15px] uppercase tracking-[0.2em] font-black break-words">{selectedItem.color || '—'}</p>
                      </div>
                   </div>

                   <div className="space-y-5">
                      <label className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/50 font-black block">Markers</label>
                      <div className="flex flex-wrap gap-2.5">
                         {selectedItem.tags?.map(tag => (
                           <span key={tag} className="bg-foreground/5 px-5 py-2.5 text-[10px] lg:text-[11px] uppercase tracking-widest font-black text-foreground/70 border border-foreground/5">#{tag}</span>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-12 mt-auto">
                   <button 
                     onClick={() => {
                       if (confirm('Permanently remove this piece from your archive?')) {
                         wardrobeService.deleteItem(selectedItem._id).then(() => {
                           setSelectedItem(null);
                           fetchItems();
                         });
                       }
                     }}
                     className="flex-1 border border-foreground/10 py-5 px-8 text-[10px] lg:text-[11px] uppercase tracking-[0.5em] font-black hover:bg-red-500 hover:text-white hover:border-red-500 transition-all whitespace-nowrap">
                     Remove
                   </button>
                   <button className="flex-1 bg-foreground text-background py-5 px-8 text-[10px] lg:text-[11px] uppercase tracking-[0.2em] font-black hover:opacity-90 transition-all shadow-2xl whitespace-nowrap">
                     Edit Details
                   </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
