import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import chessVideo from '../assets/hero-1.mp4';
import finalVideo from '../assets/hero-2.mp4';

const posters = [
  { 
    id: '01', 
    tag: 'Archive',
    title: 'Build your Space', 
    desc: 'Catalogue every item in your collection. Tag by colour, season, or brand. Never lose a piece again.', 
    href: '/wardrobe', 
    img: 'https://i.pinimg.com/1200x/6d/29/09/6d2909423aa81de67932f8cb2d86899e.jpg',
    align: 'right',
    cta: 'Open Wardrobe'
  },
  { 
    id: '02', 
    tag: 'Studio',
    title: 'Compose\nthe Look.', 
    desc: 'The engine reads your archive to compose custom fits. No mood boards required—just your style, ready to wear.', 
    href: '/outfit', 
    img: 'https://i.pinimg.com/1200x/4b/27/9e/4b279e45b3025c8d7fa1f89e25e00623.jpg',
    align: 'left',
    cta: 'Start Styling'
  },
  { 
    id: '03', 
    tag: 'Inspiration',
    title: 'Find Your\nDirection.', 
    desc: 'A curated stream of global style. Collect what resonates and add it to your mood board.', 
    href: '/inspiration', 
    img: 'https://i.pinimg.com/736x/30/e4/8c/30e48c5b1d50e37399fdd71ba7a8f6c3.jpg',
    align: 'left',
    cta: 'Explore'
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
            className={`w-full h-full object-cover video-fade-in grayscale brightness-[0.9] blur-[1px] ${videoReady ? 'video-ready' : ''}`}
          >
            <source src={chessVideo} type="video/mp4" />
          </video>
        </div>

        {/* Subtle Grain Overlay */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        ></div>

        {/* Hero Text — Clamped for safety, plus 1.8s reveal */}
        <div className="relative z-10 w-full px-8 text-center flex flex-col items-center">
           <h1 
             className="font-serif italic text-white leading-[0.7] tracking-tighter blend-diff cursor-default select-none reveal-up"
             style={{ fontSize: 'clamp(100px, 16vw, 240px)' }}
           >
             Curated
           </h1>
           <p className="mt-4 text-white text-[14px] tracking-[0.4em] uppercase font-black blend-diff">Your personal fashion system</p>
          
          <div className="flex items-center gap-10 mt-16 reveal-up [animation-delay:0.8s]">
            {[
              { name: 'Wardrobe', path: '/wardrobe' },
              { name: 'Studio', path: '/outfit' },
              { name: 'Exchange', path: '/marketplace' }
            ].map((link, i, arr) => (
              <div key={link.name} className="flex items-center gap-10">
                 <Link 
                   to={link.path} 
                   className="text-white text-[11px] uppercase tracking-[0.6em] font-black blend-diff hover:opacity-50 transition-all duration-300"
                 >
                   [ {link.name} ]
                 </Link>
                 {i !== arr.length - 1 && (
                   <span className="text-white/20 select-none font-sans font-light">/</span>
                 )}
              </div>
            ))}
          </div>
        </div>

        {/* Label reveal — Solid White */}
        <div className="absolute bottom-12 left-10 z-10 blend-diff">
          <span className="text-[10px] uppercase tracking-[0.5em] text-white font-black reveal-up [animation-delay:1.2s]">
             ESTABLISHED // 2026
          </span>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 blend-diff flex flex-col items-center gap-2 reveal-up [animation-delay:1.4s]">
          <span className="text-[9px] uppercase tracking-[0.6em] text-white/40 font-black select-none">
             Scroll
          </span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/40 to-transparent"></div>
        </div>
      </section>

      {/* ─── BUFFER / ARCHIVE INTRO ─────────────────────── */}
      <section className="py-40 px-8 flex flex-col items-center justify-center text-center bg-background border-b border-foreground/5">
        <div className="w-[1px] h-24 bg-foreground/10 mb-12 reveal-up"></div>
        <p className="font-mono text-[11px] uppercase tracking-[0.5em] text-foreground/40 font-black max-w-xl leading-loose reveal-up [animation-delay:0.2s]">
          An editorial infrastructure for those who treat style as an archival practice. Collect, compose, and discover.
        </p>
      </section>

      {/* ─── POSTER SPLITS ───────────────────────────────── */}
      {posters.map((p, idx) => {
        // BREAK THE RHYTHM: Section 2 (Studio) becomes a full-bleed cinematic look centered
        if (idx === 1) {
          return (
            <section key={p.id} className="relative min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden border-b border-foreground/5 bg-black">
              <img src={p.img} alt={p.tag} className="absolute inset-0 w-full h-full object-cover grayscale opacity-70 hover:grayscale-0 hover:opacity-70 transition-all duration-[2500ms] cursor-pointer" />
              <div className="relative z-10 px-8 py-32 flex flex-col items-center max-w-3xl reveal-up pointer-events-none">
                 <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/50 font-black mb-10">
                    {p.id} // {p.tag}
                 </span>
                 <h2 className="font-sans font-black leading-[0.88] tracking-tighter uppercase mb-12 text-white"
                   style={{ fontSize: 'clamp(48px, 7vw, 130px)' }}>
                   {p.title.split('\n').map((line, li) => (
                     <span key={li} className="block">{line}</span>
                   ))}
                 </h2>
                 <p className="text-[14px] leading-relaxed text-white/70 uppercase tracking-widest font-black mb-14 px-4">
                   {p.desc}
                 </p>
                 <Link
                   to={p.href}
                   className="group inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.5em] font-black text-white border-b border-white/20 pb-4 hover:border-white transition-all duration-500"
                 >
                   {p.cta} <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-all" />
                 </Link>
              </div>
            </section>
          )
        }

        // STANDARD SPLIT POSTER (Archive & Inspiration)
        return (
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
                  {p.cta} <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-all" />
                </Link>
              </div>
            </div>
          </section>
        );
      })}

      {/* ─── FINAL CINEMATIC CTA ─────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
         <video src={finalVideo} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover"></video>
         
         <div className="relative z-10 text-center space-y-12">
            <h2 className="font-serif tracking-tighter text-white text-[12vw] leading-none reveal-up">
               Be Your Own Stylist
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
