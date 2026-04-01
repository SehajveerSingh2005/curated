import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import chessVideo from '../assets/chess-1.mp4';

const posters = [
  { 
    id: '01', 
    tag: 'Archive',
    title: 'Your Wardrobe,\nOrganised.', 
    desc: 'Catalogue every item in your collection. Tag by colour, season, or brand. Never lose a piece again.', 
    href: '/wardrobe', 
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=90&fit=crop',
    align: 'right' 
  },
  { 
    id: '02', 
    tag: 'Studio',
    title: 'Visualise\nthe Look.', 
    desc: 'The engine reads your archive to compose custom fits. No mood boards required—just your style, ready to wear.', 
    href: '/outfit', 
    img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&q=90&fit=crop',
    align: 'left' 
  },
  { 
    id: '03', 
    tag: 'Inspiration',
    title: 'Discover\nReferences.', 
    desc: 'A curated stream of global style. Collect what resonates and add it to your mood board.', 
    href: '/inspiration', 
    img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=90&fit=crop',
    align: 'right' 
  },
];

export default function Home() {
  const [videoReady, setVideoReady] = useState(false);

  // Small delay ensures the first frame is painted before fading in.
  const handleCanPlay = () => {
    setTimeout(() => setVideoReady(true), 100);
  };

  return (
    <div className="bg-background text-foreground overflow-x-hidden selection:bg-foreground selection:text-background text-[15px]">

      {/* ─── HERO ─────────────────────── */}
      <section 
        className="relative h-screen flex items-center justify-center overflow-hidden bg-black"
      >
        {/* Native Video Load with Fade-in from Black */}
        <div className="absolute inset-0 overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            onCanPlay={handleCanPlay}
            className={`w-full h-full object-cover video-fade-in ${videoReady ? 'video-ready' : ''}`}
          >
            <source src={chessVideo} type="video/mp4" />
          </video>
        </div>

        {/* Hero Text — Clamped for safety, plus 1.8s reveal */}
        <div className="relative z-10 w-full px-8 text-center flex flex-col items-center">
           <h1 
             className="font-serif italic text-white leading-[0.7] tracking-tighter blend-diff cursor-default select-none reveal-up hover:text-black hover:not-italic transition-colors duration-50"
             style={{ fontSize: 'clamp(100px, 16vw, 240px)' }}
           >
             Curated
           </h1>
          
          <div className="flex gap-16 mt-16 reveal-up [animation-delay:0.8s]">
            {['Wardrobe', 'Studio', 'Exchange'].map((link) => (
               <Link 
                 key={link}
                 to="/wardrobe" 
                 className="text-white text-[11px] uppercase tracking-[0.6em] font-black blend-diff hover:opacity-50 transition-all duration-300"
               >
                 {link}
               </Link>
            ))}
          </div>
        </div>

        {/* Label reveal — Solid White */}
        <div className="absolute bottom-12 left-10 z-10 blend-diff">
          <span className="text-[10px] uppercase tracking-[0.5em] text-white font-black reveal-up [animation-delay:1.2s]">
             ESTABLISHED // 2026
          </span>
        </div>
      </section>

      {/* ─── POSTER SPLITS ───────────────────────────────── */}
      {posters.map((p, idx) => (
        <section 
          key={p.id} 
          className={`relative min-h-[90vh] grid lg:grid-cols-2 border-b border-foreground/5 
            ${idx % 2 === 1 ? 'bg-alt' : 'bg-background'}`}
        >
          <div className={`relative overflow-hidden h-[60vh] lg:h-auto ${p.align === 'left' ? 'lg:order-1 border-r border-foreground/5' : 'lg:order-2 border-l border-foreground/5'}`}>
            <img
              src={p.img}
              alt={p.tag}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2500ms] cursor-pointer"
            />
          </div>

          <div className={`flex flex-col justify-center px-8 lg:px-24 py-32 ${p.align === 'left' ? 'lg:order-2' : 'lg:order-1'}`}>
            
             <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/30 font-black mb-10 reveal-up">
                {p.id} // {p.tag}
             </span>

             <h2 className="font-sans font-black leading-[0.88] tracking-tighter uppercase mb-14 reveal-up"
               style={{ fontSize: 'clamp(48px, 6vw, 110px)' }}>
               {p.title.split('\n').map((line, li) => (
                 <span key={li} className="block">{line}</span>
               ))}
             </h2>
            
            <div className="max-w-md space-y-12">
              <p className="text-[14px] leading-relaxed text-muted-foreground uppercase tracking-widest font-black reveal-up [animation-delay:0.3s]">
                {p.desc}
              </p>
              <Link
                to={p.href}
                className="group inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.5em] font-black
                  text-foreground border-b border-foreground/15 pb-4 hover:border-foreground transition-all duration-500 reveal-up [animation-delay:0.5s]"
              >
                Enter {p.tag} <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-all" />
              </Link>
            </div>
          </div>
        </section>
      ))}

      {/* ─── FINAL CINEMATIC CTA ─────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
         <img 
           src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&q=90&fit=crop"
           alt="final"
           className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale"
         />
         
         <div className="relative z-10 text-center space-y-12">
            <h2 className="font-serif italic text-white text-[12vw] leading-none tracking-tighter reveal-up">
               The Archive.
            </h2>
            <Link
              to="/wardrobe"
              className="inline-flex items-center gap-6 text-[12px] uppercase tracking-[0.6em] font-black text-white border border-white/40 px-20 py-8 hover:bg-white hover:text-black transition-all duration-700 reveal-up [animation-delay:0.5s]"
            >
              Get Started
            </Link>
         </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────── */}
      <footer className="py-24 px-8 border-t border-foreground/5 bg-background">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-16">
          <div className="space-y-4">
             <span className="font-sans font-black text-3xl tracking-tighter uppercase">Curated.</span>
             <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-foreground/30 leading-relaxed max-w-[240px]">
                Global wardrobe indexing.<br />© 2026 Curated.
             </p>
          </div>

          <nav className="flex flex-wrap gap-12 text-[10px] uppercase tracking-[0.45em] font-black text-foreground/20">
            <Link to="/wardrobe" className="hover:text-foreground">Wardrobe</Link>
            <Link to="/outfit" className="hover:text-foreground">Studio</Link>
            <Link to="/inspiration" className="hover:text-foreground">Discover</Link>
            <Link to="/marketplace" className="hover:text-foreground">Exchange</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
