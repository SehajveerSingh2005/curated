import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Sparkles, Layers, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sections = [
  {
    id: 'wardrobe',
    title: 'THE ARCHIVE',
    label: 'Inventory',
    desc: 'Distill your entire physical wardrobe into a unified digital infrastructure. Metadata for every thread.',
    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=95',
    icon: Eye,
    href: '/wardrobe'
  },
  {
    id: 'outfit',
    title: 'THE ENGINE',
    label: 'Curation',
    desc: 'Autonomous assembly of garments based on visual compatibility and harmonic reasoning.',
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=95',
    icon: Sparkles,
    href: '/outfit'
  },
  {
    id: 'inspiration',
    title: 'THE FEED',
    label: 'Discovery',
    desc: 'A constant stream of global style nodes. Browse, collect, and iterate on your personal aesthetic.',
    img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=95',
    icon: Layers,
    href: '/inspiration'
  },
  {
    id: 'marketplace',
    title: 'THE MARKET',
    label: 'Liquidity',
    desc: 'Liquidate assets from your wardrobe or acquire secondary-market fashion from the community.',
    img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&q=95',
    icon: ShoppingBag,
    href: '/marketplace'
  }
];

export default function Home() {
  return (
    <div className="bg-background text-foreground selection:bg-white selection:text-black">
      {/* Hero: High-Fidelity Archive Branding */}
      <section className="relative h-[110vh] flex flex-col justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero.png"
            alt="hero"
            className="w-full h-full object-cover grayscale brightness-[0.75] contrast-[1.1] transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
          {/* Subtle Film Grain Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
        </div>
        
        <div className="relative z-10 px-8 w-full">
          <div className="max-w-[1800px] mx-auto">
            <div className="flex items-center gap-4 mb-10 overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40 block animate-in slide-in-from-left-full duration-1000">
                System 01 / Archive
              </span>
              <div className="h-[1px] w-12 bg-white/20 animate-in zoom-in duration-1000" />
            </div>
            
            <h1 className="font-heading font-black text-[12vw] leading-[0.7] tracking-[-0.06em] text-white uppercase animate-in fade-in slide-in-from-bottom-12 duration-[1200ms]">
              IDENTITY <br />
              <span className="text-white/20 stroke-white stroke-1" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>/ ARCHIVE</span>
            </h1>

            <div className="mt-16 flex flex-col md:flex-row items-start md:items-end gap-16">
              <div className="space-y-6 max-w-sm">
                <p className="text-white/60 text-[10px] md:text-[11px] font-bold tracking-[0.05em] uppercase leading-relaxed animate-in fade-in duration-1000 delay-500">
                  A high-fidelity digital infrastructure for the modern wardrobe. Designed for precision, archive, and economy. Build your legacy thread by thread.
                </p>
                <div className="flex gap-4">
                  <Link to="/wardrobe" className="group flex items-center gap-4 text-white text-[11px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-8 py-3 border border-white/20 transition-all">
                    Access Archive <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block h-[1px] flex-1 bg-white/[0.05]" />
              <div className="text-right hidden md:block">
                <span className="text-[8px] font-black uppercase tracking-[1em] text-white/20 block mb-2">Curated Systems Inc.</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Global Distribution v1.0.4</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 text-white/20 hover:text-white/40 transition-colors cursor-pointer group">
          <span className="text-[9px] font-black uppercase tracking-[0.5em] rotate-180 [writing-mode:vertical-lr] group-hover:translate-y-2 transition-transform">Explore</span>
          <div className="w-[1px] h-12 bg-white/10 group-hover:h-20 transition-all duration-700" />
        </div>
      </section>

      {/* Feature Showcase: Cinematic Alternating Sections */}
      {sections.map((section, idx) => (
        <section key={section.id} className="relative min-h-screen py-40 flex items-center overflow-hidden border-b border-foreground/5">
          <div className="max-w-[1800px] mx-auto px-8 w-full grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24 items-center">
            
            {/* Visual Block */}
            <div className={`md:col-span-7 relative aspect-[4/5] md:aspect-[16/9] overflow-hidden ${idx % 2 === 1 ? 'md:order-2' : ''}`}>
              <img 
                src={section.img} 
                className="w-full h-full object-cover grayscale brightness-[1.05] contrast-[1.1] hover:scale-105 transition-transform duration-[2000ms]" 
                alt={section.title} 
              />
              <div className="absolute inset-0 bg-black/5 mix-blend-overlay" />
            </div>

            {/* Content Block */}
            <div className="md:col-span-5 space-y-12 z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-muted-foreground/30">
                  <span className="text-[12px] font-black tracking-tighter">0{idx + 1}</span>
                  <div className="w-8 h-[2px] bg-current" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{section.label}</span>
                </div>
                <h2 className="font-heading font-black text-5xl md:text-7xl tracking-tighter uppercase leading-[0.9]">
                  {section.title}
                </h2>
              </div>
              
              <div className="space-y-8">
                <p className="text-[11px] font-bold uppercase tracking-wide leading-relaxed text-muted-foreground max-w-[300px]">
                  {section.desc}
                </p>
                <Button asChild variant="outline" className="h-10 px-10 text-[10px] font-black uppercase tracking-[0.2em] rounded-none border-foreground hover:bg-foreground hover:text-background transition-all">
                  <Link to={section.href}>Initialize {section.label}</Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Subtle Vertical Text Background - Fixed position to avoid overflow */}
          <div className={`absolute top-0 bottom-0 text-[20vh] font-black text-foreground/[0.015] uppercase leading-none [writing-mode:vertical-rl] select-none pointer-events-none ${idx % 2 === 0 ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'}`}>
            {section.title}
          </div>
        </section>
      ))}

      {/* Final CTA Strip */}
      <section className="py-48 text-center bg-foreground text-background">
        <div className="max-w-4xl mx-auto px-8 space-y-12">
          <h2 className="font-heading font-black text-5xl md:text-[7rem] leading-[0.85] tracking-tighter uppercase">
            DESIGN THE <br /> ARCHIVE.
          </h2>
          <Button asChild className="h-16 px-16 text-[12px] font-black uppercase tracking-[0.3em] bg-white text-black hover:bg-white/80 rounded-none">
            <Link to="/wardrobe">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-24 border-t border-foreground/5">
        <div className="max-w-[1800px] mx-auto px-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="space-y-6">
            <span className="font-heading font-black text-4xl tracking-tighter uppercase">Curated</span>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest max-w-[200px]">
              Digital Infrastructure for the modern garment.
            </p>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">
            © 2026 — Curated Systems Inc. Distributed globally.
          </p>
        </div>
      </footer>
    </div>
  );
}
