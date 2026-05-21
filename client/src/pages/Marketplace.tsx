import { useState, useEffect } from 'react';
import { SlidersHorizontal, Plus, X, Search, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { marketplaceService, wardrobeService } from '../services/api';
import type { Product, WardrobeItem } from '../types';
import ProductCard from '../components/ui/ProductCard';
import { removeBackground } from '@imgly/background-removal';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const SORT_OPTIONS = ['Newest', 'Price ↑', 'Price ↓'];
const CATEGORIES = ['shirt', 't-shirt', 'polo', 'knitwear', 'pants', 'outerwear', 'shoes', 'accessory', 'other'];
const FILTER_CATS = ['All', ...CATEGORIES];

export default function Marketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeSort, setActiveSort] = useState('Newest');
  const [activeCat, setActiveCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [listingOwnerFilter, setListingOwnerFilter] = useState<'others' | 'mine'>('others');
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  
  // Wizard state: 'choose' | 'wardrobe' | 'direct'
  const [sellMode, setSellMode] = useState<'choose' | 'wardrobe' | 'direct'>('choose');
  
  // Wardrobe Selection state
  const [userWardrobe, setUserWardrobe] = useState<WardrobeItem[]>([]);
  const [wardrobeLoading, setWardrobeLoading] = useState(false);
  const [selectedWardrobeItem, setSelectedWardrobeItem] = useState<WardrobeItem | null>(null);
  const [wardrobeSalePrice, setWardrobeSalePrice] = useState('');
  const [wardrobeSaleCondition, setWardrobeSaleCondition] = useState<'new' | 'like new' | 'good' | 'fair'>('good');
  
  // Direct Upload Form State
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'shirt',
    tags: [] as string[],
    imageUrl: '',
    brand: '',
    fabric: '',
    color: '',
    condition: 'good' as 'new' | 'like new' | 'good' | 'fair',
    file: null as File | null,
  });
  const [tagInput, setTagInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [cropBox, setCropBox] = useState({ top: 10, left: 10, width: 80, height: 80 }); 
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0, top: 0, left: 0, width: 0, height: 0 });
  const [imgAspect, setImgAspect] = useState(1);
  
  // Purchase success state
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  
  // Loading states for actions
  const [isSavingListing, setIsSavingListing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [activeCat, activeSort]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.pageYOffset || document.documentElement.scrollTop;
      const progress = Math.min(1, offset / 100);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await marketplaceService.getAll({
        category: activeCat,
        sort: activeSort,
      });
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserWardrobe = async () => {
    if (!user) return;
    setWardrobeLoading(true);
    try {
      const res = await wardrobeService.getAll();
      // Filter out wardrobe items that are already listed for sale
      setUserWardrobe(res.data.filter((item: WardrobeItem) => !item.forSale));
    } catch (err) {
      console.error('Failed to fetch user wardrobe:', err);
    } finally {
      setWardrobeLoading(false);
    }
  };

  // Sync crop box for direct upload
  useEffect(() => {
    if (!newItem.imageUrl) return;
    let width = 80;
    let height = (width * imgAspect) / 0.8;
    if (height > 80) {
      height = 80;
      width = (height * 0.8) / imgAspect;
    }
    setCropBox({
      top: (100 - height) / 2,
      left: (100 - width) / 2,
      width,
      height
    });
  }, [imgAspect, newItem.imageUrl]);

  // Handle drag/drop for direct upload
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

  // Cropping interactions
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

  const getCroppedImageBlob = async (): Promise<Blob | null> => {
    if (!newItem.imageUrl) return null;
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

    const sw = (cropBox.width / 100) * img.naturalWidth;
    const sh = (cropBox.height / 100) * img.naturalHeight;
    const sx = (cropBox.left / 100) * img.naturalWidth;
    const sy = (cropBox.top / 100) * img.naturalHeight;

    canvas.width = 1200;
    canvas.height = 1500;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  };

  const handleAITagging = async () => {
    setIsAnalyzing(true);
    try {
      const blob = await getCroppedImageBlob();
      if (!blob) throw new Error('No image available');
      const reader = new FileReader();
      const dataUrlPromise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
      });
      reader.readAsDataURL(blob);
      const croppedDataUrl = await dataUrlPromise;

      const res = await wardrobeService.analyze({ imageBase64: croppedDataUrl });
      const details = res.data;
      
      setNewItem(prev => ({
        ...prev,
        name: details.name || prev.name,
        category: details.category || prev.category,
        brand: details.brand || prev.brand,
        fabric: details.fabric || prev.fabric,
        color: details.color || prev.color,
        tags: details.tags && details.tags.length > 0 ? details.tags : prev.tags
      }));
    } catch (err: unknown) {
      console.error('AI tagging failed:', err);
      let errorMsg = 'Unknown error';
      if (err instanceof AxiosError) {
        errorMsg = err.response?.data?.msg || err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      alert(`Failed to auto-tag image: ${errorMsg}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualBGRemoval = async () => {
    if (!newItem.imageUrl) return;
    setIsRemovingBackground(true);
    try {
      let blob: Blob;
      if (newItem.imageUrl.startsWith('data:')) {
        const response = await fetch(newItem.imageUrl);
        blob = await response.blob();
      } else {
        const response = await fetch(newItem.imageUrl, { mode: 'cors' });
        blob = await response.blob();
      }
      const processedBlob = await removeBackground(blob, { model: 'isnet_quint8' });
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({ 
          ...prev, 
          imageUrl: reader.result as string,
          file: new File([processedBlob], 'processed.png', { type: 'image/png' })
        }));
      };
      reader.readAsDataURL(processedBlob);
    } catch (err) {
      console.error('Manual BG removal failed:', err);
      alert('Failed to remove background.');
    } finally {
      setIsRemovingBackground(false);
    }
  };

  // Submit Listing from Wardrobe
  const handleListWardrobeItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWardrobeItem) return;
    if (!wardrobeSalePrice || isNaN(Number(wardrobeSalePrice)) || Number(wardrobeSalePrice) <= 0) {
      alert("Please specify a valid price.");
      return;
    }
    setIsSavingListing(true);
    try {
      const formData = new FormData();
      formData.append('wardrobeItemId', selectedWardrobeItem._id);
      formData.append('price', wardrobeSalePrice);
      formData.append('condition', wardrobeSaleCondition);

      await marketplaceService.createListing(formData);
      alert("Wardrobe piece listed for sale!");
      setShowSellModal(false);
      resetSellState();
      fetchProducts();
    } catch (err: any) {
      console.error('Failed to create listing:', err);
      alert(err.response?.data?.msg || 'Failed to create listing');
    } finally {
      setIsSavingListing(false);
    }
  };

  // Submit Direct Listing
  const handleListDirectItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || (!newItem.imageUrl && !newItem.file) || !newItem.price) {
      alert("Please fill all required fields and upload an image.");
      return;
    }
    setIsSavingListing(true);
    try {
      const formData = new FormData();
      if (newItem.file) {
        const croppedBlob = await getCroppedImageBlob();
        if (!croppedBlob) throw new Error("Failed to crop image");
        let finalBlob = croppedBlob;

        if (newItem.file.name !== 'processed.png') {
          setIsRemovingBackground(true);
          finalBlob = await removeBackground(croppedBlob, { model: 'isnet_quint8' });
          setIsRemovingBackground(false);
        }
        formData.append('image', finalBlob, 'processed.png');
      }

      formData.append('name', newItem.name);
      formData.append('price', newItem.price);
      formData.append('category', newItem.category);
      formData.append('brand', newItem.brand || '');
      formData.append('fabric', newItem.fabric || '');
      formData.append('color', newItem.color || '');
      formData.append('condition', newItem.condition);
      formData.append('tags', JSON.stringify(newItem.tags));

      await marketplaceService.createListing(formData);
      alert("Direct product listed for sale!");
      setShowSellModal(false);
      resetSellState();
      fetchProducts();
    } catch (err: any) {
      console.error('Direct listing failed:', err);
      alert(err.response?.data?.msg || 'Failed to list product');
    } finally {
      setIsSavingListing(false);
      setIsRemovingBackground(false);
    }
  };

  // Reset wizard state
  const resetSellState = () => {
    setSellMode('choose');
    setSelectedWardrobeItem(null);
    setWardrobeSalePrice('');
    setWardrobeSaleCondition('good');
    setNewItem({
      name: '',
      price: '',
      category: 'shirt',
      tags: [],
      imageUrl: '',
      brand: '',
      fabric: '',
      color: '',
      condition: 'good',
      file: null,
    });
    setTagInput('');
  };

  // Tags management for direct listing
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

  // Buy Product Action
  const handleBuyProduct = async () => {
    if (!selectedProduct) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setIsBuying(true);
    try {
      const res = await marketplaceService.buy(selectedProduct._id);
      setSelectedProduct(res.data);
      setPurchaseSuccess(true);
      fetchProducts();
      setTimeout(() => {
        setPurchaseSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Purchase failed:', err);
      alert(err.response?.data?.msg || 'Failed to complete purchase.');
    } finally {
      setIsBuying(false);
    }
  };

  // Local Search Filter
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    const sellerId = typeof p.seller === 'object' ? p.seller?._id : p.seller;
    if (listingOwnerFilter === 'others') {
      return user ? sellerId !== user.id : true;
    }
    if (listingOwnerFilter === 'mine') {
      return user ? sellerId === user.id : false;
    }
    return true;
  });

  return (
    <div className="min-h-[120vh] pt-24 bg-background text-foreground font-sans selection:bg-foreground selection:text-background">

      {/* Sticky Header */}
      <div 
        className="sticky top-24 z-[45] bg-background/90 backdrop-blur-3xl border-b border-foreground/5 transition-all duration-300"
        style={{ 
          paddingTop: `${Math.max(1, 2 - scrollProgress) * 16}px`,
          paddingBottom: `${Math.max(1, 2 - scrollProgress) * 16}px`
        }}
      >
        <div className="max-w-[1700px] mx-auto px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5" style={{ opacity: 1 - scrollProgress * 0.4 }}>
                  <span className="font-mono text-[9px] uppercase tracking-[0.50em] text-foreground/50 font-black">
                    Community Exchange // Unit_{filteredProducts.length}
                  </span>
                  <div className="h-[1px] w-6 bg-foreground/20"></div>
                </div>
                <h1 
                  className="font-black uppercase tracking-tighter leading-none" 
                  style={{ fontSize: `${Math.max(32, 72 - scrollProgress * 40)}px` }}
                >
                  Market<span className="font-serif italic lowercase font-normal tracking-normal ml-0.5">.</span>
                </h1>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 flex-wrap w-full md:w-auto justify-end">
              {/* Search bar */}
              <div className="relative group w-full sm:w-60 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 group-focus-within:text-foreground transition-colors" />
                <input 
                  type="text" 
                  placeholder="SEARCH ITEMS"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border border-foreground/10 px-10 py-2.5 text-[10px] uppercase tracking-widest font-black focus:outline-none focus:border-foreground/30 transition-all font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSort(s)}
                    className={`text-[9px] uppercase tracking-[0.2em] px-4 py-2.5 border font-black transition-all duration-200
                      ${activeSort === s
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/30'
                      }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-black px-4 py-2.5 border transition-all duration-200
                    ${filterOpen
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/30'
                    }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
                </button>
                <button
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    resetSellState();
                    setShowSellModal(true);
                  }}
                  className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] font-black px-5 py-2.5 border border-foreground bg-foreground text-background hover:opacity-90 transition-all shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Sell Piece
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-8 lg:px-12 pt-12 pb-24">

      {/* Filter Panel */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="mb-12 pb-8 border-b border-foreground/5 overflow-hidden"
          >
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {FILTER_CATS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat === 'All' ? 'All' : cat)}
                  className={`text-[10px] uppercase tracking-[0.3em] font-black pb-1.5 transition-all duration-200 relative
                    ${activeCat === cat
                      ? 'text-foreground'
                      : 'text-foreground/40 hover:text-foreground/75'
                    }`}
                >
                  {cat}
                  {activeCat === cat && (
                    <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-foreground"></div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listing Owner Tabs */}
      {user && (
        <div className="flex items-center gap-6 mb-10 border-b border-foreground/5 pb-3">
          <button
            onClick={() => setListingOwnerFilter('others')}
            className={`text-[9px] uppercase tracking-[0.25em] font-black pb-2 transition-all duration-200 relative
              ${listingOwnerFilter === 'others'
                ? 'text-foreground'
                : 'text-foreground/45 hover:text-foreground/75'
              }`}
          >
            Browse Shop
            {listingOwnerFilter === 'others' && (
              <motion.div layoutId="ownerFilterUnderline" className="absolute bottom-0 left-0 w-full h-[1.5px] bg-foreground" />
            )}
          </button>
          <button
            onClick={() => setListingOwnerFilter('mine')}
            className={`text-[9px] uppercase tracking-[0.25em] font-black pb-2 transition-all duration-200 relative
              ${listingOwnerFilter === 'mine'
                ? 'text-foreground'
                : 'text-foreground/45 hover:text-foreground/75'
              }`}
          >
            Your Listings
            {listingOwnerFilter === 'mine' && (
              <motion.div layoutId="ownerFilterUnderline" className="absolute bottom-0 left-0 w-full h-[1.5px] bg-foreground" />
            )}
          </button>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-8">
          <div className="w-12 h-[1px] bg-foreground/20 animate-pulse"></div>
          <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/50 font-black animate-pulse">Loading Exchange...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-16">
          {filteredProducts.map((product) => (
            <div key={product._id} onClick={() => { setSelectedProduct(product); setPurchaseSuccess(false); }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-40 flex flex-col items-center justify-center text-center border border-dashed border-foreground/10">
          <h2 className="font-serif italic text-5xl text-foreground/20 mb-6 select-none">No Items found</h2>
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/50 font-black max-w-xs leading-loose">
            No listings currently match your query.
          </p>
        </div>
      )}
      </div>

      {/* ─── SELL PRODUCT MODAL (WIZARD) ─── */}
      <Dialog open={showSellModal} onOpenChange={setShowSellModal}>
        <DialogContent showCloseButton={false} className="max-w-[95vw] lg:max-w-5xl p-0 gap-0 border-none bg-background rounded-none overflow-hidden shadow-2xl">
          <div className="h-[85vh] md:h-[80vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-5 border-b border-foreground/5 bg-background">
              <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/50 font-black">
                {sellMode === 'choose' ? 'Market Listing wizard' : sellMode === 'wardrobe' ? 'List from Wardrobe Archive' : 'Create Direct Listing'}
              </span>
              <button 
                onClick={() => setShowSellModal(false)}
                className="text-foreground/50 hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto">
              {sellMode === 'choose' && (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-12">
                  <div className="space-y-4">
                    <h2 className="font-sans font-black text-3xl uppercase tracking-tighter">Choose Listing Method</h2>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/50 leading-relaxed">
                      Select whether to sell an existing item cataloged in your wardrobe, or upload a completely new product.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <button
                      onClick={() => {
                        setSellMode('wardrobe');
                        loadUserWardrobe();
                      }}
                      className="border border-foreground/15 p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-foreground hover:bg-foreground/5 transition-all text-foreground cursor-pointer"
                    >
                      <span className="font-sans font-black text-[12px] uppercase tracking-wider">Wardrobe Piece</span>
                      <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-foreground/50">Sell from your stored archive</span>
                    </button>
                    <button
                      onClick={() => setSellMode('direct')}
                      className="border border-foreground/15 p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-foreground hover:bg-foreground/5 transition-all text-foreground cursor-pointer"
                    >
                      <span className="font-sans font-black text-[12px] uppercase tracking-wider">Direct Listing</span>
                      <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-foreground/50">Upload and list a new item</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Sell from Wardrobe */}
              {sellMode === 'wardrobe' && (
                <div className="h-full flex flex-col p-8">
                  {selectedWardrobeItem ? (
                    // Price/condition prompt for wardrobe item
                    <form onSubmit={handleListWardrobeItemSubmit} className="max-w-md mx-auto w-full py-10 space-y-10">
                      <div className="flex items-center gap-6 border-b border-foreground/5 pb-8">
                        <img 
                          src={selectedWardrobeItem.imageUrl?.startsWith('/') 
                            ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${selectedWardrobeItem.imageUrl}` 
                            : selectedWardrobeItem.imageUrl}
                          alt={selectedWardrobeItem.name}
                          className="w-20 h-24 object-cover bg-muted"
                        />
                        <div className="space-y-1">
                          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/40">{selectedWardrobeItem.category}</span>
                          <h3 className="font-sans font-black text-xl uppercase tracking-tight">{selectedWardrobeItem.name}</h3>
                          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/50">{selectedWardrobeItem.brand || 'No Brand'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1.5 focus-within:text-foreground text-foreground/60 transition-colors">
                          <label className="font-mono text-[10px] uppercase tracking-[0.5em] font-black">Price ($)</label>
                          <input 
                            required 
                            type="number" 
                            placeholder="0"
                            className="w-full bg-transparent border-b border-foreground/10 py-3 text-[12px] font-black focus:outline-none focus:border-foreground transition-all" 
                            value={wardrobeSalePrice} 
                            onChange={(e) => setWardrobeSalePrice(e.target.value)} 
                          />
                        </div>
                        <div className="space-y-1.5 text-foreground/60 focus-within:text-foreground transition-colors">
                          <label className="font-mono text-[10px] uppercase tracking-[0.5em] font-black">Condition</label>
                          <select 
                            className="w-full bg-transparent border-b border-foreground/10 py-3 text-[11px] font-black uppercase tracking-wider focus:outline-none focus:border-foreground"
                            value={wardrobeSaleCondition} 
                            onChange={(e) => setWardrobeSaleCondition(e.target.value as any)}
                          >
                            <option value="new">New</option>
                            <option value="like new">Like New</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-6">
                        <button 
                          type="button" 
                          onClick={() => setSelectedWardrobeItem(null)} 
                          className="flex-1 border border-foreground/10 py-4 text-[9px] uppercase tracking-[0.3em] font-black hover:bg-foreground/5"
                        >
                          Change Piece
                        </button>
                        <button 
                          type="submit" 
                          disabled={isSavingListing}
                          className="flex-1 bg-foreground text-background py-4 text-[9px] uppercase tracking-[0.4em] font-black hover:opacity-90 transition-all disabled:opacity-30"
                        >
                          {isSavingListing ? 'Listing...' : 'Publish Listing'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Grid of user's wardrobe items
                    <div className="flex-1 flex flex-col gap-6 h-full">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setSellMode('choose')} 
                          className="text-[9px] uppercase tracking-widest font-black text-foreground/50 hover:text-foreground flex items-center gap-1.5"
                        >
                          ← Back
                        </button>
                      </div>
                      
                      {wardrobeLoading ? (
                        <div className="flex-1 flex items-center justify-center py-20">
                          <span className="font-mono text-[9px] uppercase tracking-[0.4em] animate-pulse">Scanning wardrobe database...</span>
                        </div>
                      ) : userWardrobe.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                          {userWardrobe.map((item) => (
                            <div 
                              key={item._id} 
                              onClick={() => setSelectedWardrobeItem(item)}
                              className="group border border-foreground/5 p-4 cursor-pointer hover:border-foreground/20 transition-all flex flex-col"
                            >
                              <div className="aspect-[3/4] overflow-hidden bg-muted mb-3">
                                <img 
                                  src={item.imageUrl?.startsWith('/') 
                                    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${item.imageUrl}` 
                                    : item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                              <p className="text-[10px] font-bold uppercase truncate tracking-wide text-foreground">{item.name}</p>
                              <span className="text-[8px] uppercase tracking-widest text-muted-foreground mt-0.5 font-mono">{item.category}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 border border-dashed border-foreground/10">
                          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/50 font-black mb-4">No pieces available for sale.</p>
                          <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-foreground/40 max-w-xs leading-normal">
                            All your wardrobe pieces are already listed, or your wardrobe is currently empty.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Direct Listing Form */}
              {sellMode === 'direct' && (
                <div className="flex flex-col md:grid md:grid-cols-[1.1fr_1fr] min-h-[550px] h-full">
                  {/* Left Column: Image Zone */}
                  <div
                    className={`relative border-r border-foreground/5 flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden
                      ${newItem.imageUrl ? 'bg-white' : 'bg-foreground/[0.02]'}
                      ${dragActive ? 'bg-foreground/5' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {newItem.imageUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center p-8">
                         {isAnalyzing && (
                           <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                              <div className="flex flex-col items-center gap-4">
                                 <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                 <span className="text-white font-mono text-[9px] uppercase tracking-widest font-black animate-pulse">AI Parsing Visual...</span>
                              </div>
                           </div>
                         )}
                         {isRemovingBackground && (
                           <div className="absolute inset-0 z-[110] flex items-center justify-center bg-white/95 backdrop-blur-md">
                              <div className="flex flex-col items-center gap-4 text-black">
                                 <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
                                 <div className="text-center space-y-1">
                                   <p className="font-mono text-[10px] uppercase tracking-[0.3em] font-black">Refining Silhouette</p>
                                   <p className="font-mono text-[8px] uppercase tracking-[0.2em] opacity-40">Removing Background Archive...</p>
                                 </div>
                              </div>
                           </div>
                         )}
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
                             <div onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'tl'); }} className="absolute -top-3 -left-3 w-7 h-7 flex items-center justify-center cursor-nw-resize z-50 group/h">
                               <div className="w-4 h-4 bg-white border-2 border-black group-hover/h:scale-110 transition-transform"></div>
                             </div>
                             <div onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'br'); }} className="absolute -bottom-3 -right-3 w-7 h-7 flex items-center justify-center cursor-se-resize z-50 group/h">
                               <div className="w-4 h-4 bg-white border-2 border-black group-hover/h:scale-110 transition-transform"></div>
                             </div>
                            <div className="absolute top-2 left-2 pointer-events-none">
                              <span className="font-mono text-[7px] uppercase tracking-[0.3em] text-white font-black opacity-60">Unit_4:5</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-6 right-6 flex flex-col gap-3 z-[60]">
                          <button onClick={() => setNewItem({ ...newItem, imageUrl: '', file: null })} className="bg-black/60 backdrop-blur-xl p-2.5 hover:bg-white hover:text-black transition-all border border-white/20">
                            <X className="w-4 h-4 text-white" />
                          </button>
                          {newItem.imageUrl && !isRemovingBackground && (
                            <button 
                              type="button"
                              onClick={handleManualBGRemoval}
                              className="bg-black/60 backdrop-blur-xl p-2.5 hover:bg-white hover:text-black transition-all border border-white/20"
                              title="Remove Background"
                            >
                               <span className="text-[7.5px] font-black uppercase text-white hover:text-black leading-none block">Cut</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-8 p-12">
                        <button 
                          onClick={() => setSellMode('choose')} 
                          className="absolute top-6 left-6 text-[9px] uppercase tracking-widest font-black text-foreground/50 hover:text-foreground flex items-center gap-1.5"
                        >
                          ← Back
                        </button>
                        <div className="w-16 h-16 border border-foreground/10 mx-auto flex items-center justify-center">
                          <Plus className="w-6 h-6 text-foreground/40" />
                        </div>
                        <div className="space-y-2">
                          <p className="font-mono text-[10px] uppercase tracking-[0.4em] font-black">Drop Visual</p>
                          <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-foreground/50">PNG, JPG up to 10MB</p>
                        </div>
                        <input type="file" id="marketplace-file-upload" className="hidden" accept="image/*" onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const file = e.target.files[0];
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
                        }} />
                        <label htmlFor="marketplace-file-upload" className="inline-block border border-foreground/20 px-8 py-3 text-[9px] uppercase tracking-[0.3em] font-black cursor-pointer hover:bg-foreground hover:text-background transition-all">SELECT FILE</label>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Fields */}
                  <div className="p-8 lg:p-12 flex flex-col bg-background">
                    <div className="space-y-8 max-w-sm mx-auto w-full py-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/50 font-black">Direct Entry</span>
                        {newItem.imageUrl && (
                          <button 
                            type="button" 
                            onClick={handleAITagging}
                            disabled={isAnalyzing}
                            className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-black bg-foreground text-background px-4 py-2 hover:opacity-90 transition-all shadow-md disabled:opacity-50"
                          >
                            {isAnalyzing ? (
                              <div className="w-3 h-3 border-2 border-background/20 border-t-background rounded-full animate-spin"></div>
                            ) : (
                              <span>✨ AI Tag</span>
                            )}
                          </button>
                        )}
                      </div>

                      <form className="space-y-6" onSubmit={handleListDirectItemSubmit}>
                        <div className="space-y-1 focus-within:text-foreground text-foreground/60 transition-colors">
                          <label className="font-mono text-[10px] uppercase tracking-[0.5em] font-black">Designation</label>
                          <input required placeholder="PRODUCT NAME" className="w-full bg-transparent border-b border-foreground/10 py-2.5 text-[11px] uppercase tracking-[0.2em] font-black focus:outline-none focus:border-foreground transition-all placeholder:text-foreground/10" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1 focus-within:text-foreground text-foreground/60 transition-colors">
                            <label className="font-mono text-[10px] uppercase tracking-[0.5em] font-black">Price ($)</label>
                            <input required type="number" placeholder="0" className="w-full bg-transparent border-b border-foreground/10 py-2.5 text-[11px] font-black focus:outline-none focus:border-foreground transition-all placeholder:text-foreground/10" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
                          </div>
                          <div className="space-y-1 focus-within:text-foreground text-foreground/60 transition-colors">
                            <label className="font-mono text-[10px] uppercase tracking-[0.5em] font-black">Condition</label>
                            <select className="w-full bg-transparent border-b border-foreground/10 py-2.5 text-[10px] font-black uppercase tracking-wider focus:outline-none focus:border-foreground transition-all" value={newItem.condition} onChange={(e) => setNewItem({ ...newItem, condition: e.target.value as any })}>
                              <option value="new">New</option>
                              <option value="like new">Like New</option>
                              <option value="good">Good</option>
                              <option value="fair">Fair</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1 focus-within:text-foreground text-foreground/60 transition-colors">
                            <label className="font-mono text-[10px] uppercase tracking-[0.5em] font-black">Brand</label>
                            <input placeholder="LABEL" className="w-full bg-transparent border-b border-foreground/10 py-2.5 text-[11px] uppercase tracking-[0.2em] font-black focus:outline-none focus:border-foreground transition-all placeholder:text-foreground/10" value={newItem.brand} onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })} />
                          </div>
                          <div className="space-y-1 focus-within:text-foreground text-foreground/60 transition-colors">
                            <label className="font-mono text-[10px] uppercase tracking-[0.5em] font-black">Fabric</label>
                            <input placeholder="MATERIAL" className="w-full bg-transparent border-b border-foreground/10 py-2.5 text-[11px] uppercase tracking-[0.2em] font-black focus:outline-none focus:border-foreground transition-all placeholder:text-foreground/10" value={newItem.fabric} onChange={(e) => setNewItem({ ...newItem, fabric: e.target.value })} />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/60 font-black">Category</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {CATEGORIES.map(c => (
                              <button key={c} type="button" onClick={() => setNewItem({ ...newItem, category: c })} className={`py-2 text-[9px] uppercase tracking-[0.2em] font-black border transition-all ${newItem.category === c ? 'bg-foreground text-background border-foreground' : 'border-foreground/10 text-foreground/60 hover:border-foreground/30'}`}>{c}</button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1 focus-within:text-foreground text-foreground/60 transition-colors">
                            <label className="font-mono text-[10px] uppercase tracking-[0.5em] font-black">Color</label>
                            <input placeholder="PALETTE" className="w-full bg-transparent border-b border-foreground/10 py-2.5 text-[11px] uppercase tracking-[0.2em] font-black focus:outline-none focus:border-foreground transition-all placeholder:text-foreground/10" value={newItem.color} onChange={(e) => setNewItem({ ...newItem, color: e.target.value })} />
                          </div>
                        </div>

                        <div className="space-y-1 focus-within:text-foreground text-foreground/60 transition-colors">
                          <label className="font-mono text-[10px] uppercase tracking-[0.5em] font-black">Context Tags</label>
                          <input placeholder="PRESS ENTER TO ADD" className="w-full bg-transparent border-b border-foreground/10 py-2.5 text-[11px] uppercase tracking-[0.2em] font-black focus:outline-none focus:border-foreground transition-all placeholder:text-foreground/10" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} />
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {newItem.tags.map(tag => (
                              <span key={tag} className="flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1.5 text-[9px] uppercase tracking-widest font-black">{tag}<button type="button" onClick={() => removeTag(tag)}><X className="w-3 h-3 hover:text-red-500 transition-colors" /></button></span>
                            ))}
                          </div>
                        </div>

                        <button type="submit" disabled={!newItem.name || !newItem.price || (!newItem.imageUrl && !newItem.file) || isSavingListing} className="w-full bg-foreground text-background py-4 text-[9px] uppercase tracking-[0.5em] font-black hover:opacity-90 transition-all disabled:opacity-20 mt-4 shadow-lg">
                          {isRemovingBackground ? 'Refining Silhouette...' : (isSavingListing ? 'Saving listing...' : 'Publish Listing')}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── PRODUCT DETAILS MODAL ─── */}
      <Dialog open={!!selectedProduct} onOpenChange={() => { setSelectedProduct(null); setPurchaseSuccess(false); }}>
        <DialogContent className="w-[85vw] sm:max-w-[90vw] lg:max-w-6xl p-0 gap-0 border-none bg-background rounded-none overflow-hidden shadow-2xl scale-100">
          {selectedProduct && (
            <div className="flex flex-col md:grid md:grid-cols-[0.85fr_1fr] h-[95vh] md:h-[80vh] min-h-[550px] w-full">
              
              {/* Left Side: Product Image */}
              <div className="bg-white flex flex-col items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-foreground/5 h-[40vh] md:h-full relative">
                <img 
                  src={selectedProduct.imageUrl?.startsWith('/') 
                    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${selectedProduct.imageUrl}` 
                    : selectedProduct.imageUrl} 
                  className={`w-full h-full object-cover opacity-95 transition-opacity duration-700 hover:opacity-100 ${selectedProduct.status === 'sold' ? 'opacity-40 grayscale' : ''}`}
                  alt={selectedProduct.name} 
                />
                
                {/* Visual Purchase Success Banner */}
                <AnimatePresence>
                  {purchaseSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-8 z-50 text-white"
                    >
                      <div className="w-12 h-12 rounded-full border border-white flex items-center justify-center mb-6">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-sans font-black text-2xl uppercase tracking-wider mb-2">Purchase Successful</h3>
                      <p className="font-mono text-[9px] uppercase tracking-widest opacity-60">You have acquired this piece.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Side: Details */}
              <div className="p-8 lg:p-14 xl:p-20 flex flex-col justify-between overflow-y-auto bg-background">
                <div className="space-y-10 lg:space-y-12">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[9px] uppercase tracking-[0.6em] text-foreground/50 font-black">
                        EXCHANGE UNIT // {selectedProduct._id.slice(-6).toUpperCase()}
                      </span>
                      {selectedProduct.status === 'sold' && (
                        <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 text-[8.5px] uppercase tracking-widest font-black">
                          {user && selectedProduct.buyer?._id === user.id ? '✓ Bought by You' : 'Sold'}
                        </span>
                      )}
                    </div>
                    <h2 className="font-sans font-black text-4xl lg:text-5xl xl:text-6xl uppercase tracking-[-0.03em] leading-[0.8]">{selectedProduct.name}</h2>
                    <p className="text-2xl lg:text-3xl font-black font-mono tracking-tight">${selectedProduct.price}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/50 font-black block">Seller</label>
                      <p className="text-[13px] lg:text-[14px] uppercase tracking-[0.2em] font-black break-words">{selectedProduct.seller?.username || '—'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/50 font-black block">Condition</label>
                      <p className="text-[13px] lg:text-[14px] uppercase tracking-[0.2em] font-black break-words">{selectedProduct.condition}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/50 font-black block">Category</label>
                      <p className="text-[13px] lg:text-[14px] uppercase tracking-[0.2em] font-black break-words">{selectedProduct.category}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/50 font-black block">Brand</label>
                      <p className="text-[13px] lg:text-[14px] uppercase tracking-[0.2em] font-black break-words">{selectedProduct.brand || '—'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/50 font-black block">Fabric</label>
                      <p className="text-[13px] lg:text-[14px] uppercase tracking-[0.2em] font-black break-words">{selectedProduct.fabric || '—'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/50 font-black block">Color</label>
                      <p className="text-[13px] lg:text-[14px] uppercase tracking-[0.2em] font-black break-words">{selectedProduct.color || '—'}</p>
                    </div>
                  </div>

                  {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <label className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/50 font-black block">Style Tags</label>
                        <span className="font-mono text-[8px] uppercase tracking-widest text-foreground/45 flex items-center gap-1 font-black">
                          <span>✨</span> AI Tagged
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.tags.map(tag => (
                          <span key={tag} className="bg-foreground/5 px-4 py-2 text-[9px] lg:text-[10px] uppercase tracking-widest font-black text-foreground/70 border border-foreground/5">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Purchase Controls */}
                <div className="pt-12 mt-auto">
                  {selectedProduct.status === 'sold' ? (
                    <button 
                      disabled 
                      className="w-full border border-foreground/10 py-5 text-[10px] uppercase tracking-[0.4em] font-black text-foreground/30 bg-foreground/[0.02] cursor-not-allowed"
                    >
                      Sold // Listing Inactive
                    </button>
                  ) : user && selectedProduct.seller?._id === user.id ? (
                    <button 
                      disabled 
                      className="w-full border border-foreground/10 py-5 text-[10px] uppercase tracking-[0.4em] font-black text-foreground/40 bg-foreground/5 cursor-not-allowed"
                    >
                      Your Product Listing
                    </button>
                  ) : (
                    <button 
                      onClick={handleBuyProduct}
                      disabled={isBuying}
                      className="w-full bg-foreground text-background py-5 text-[10px] lg:text-[11px] uppercase tracking-[0.4em] font-black hover:opacity-90 transition-all shadow-xl"
                    >
                      {isBuying ? 'Processing Purchase...' : 'Buy Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
