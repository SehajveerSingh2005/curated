import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Wardrobe from './pages/Wardrobe';
import OutfitPage from './pages/Outfit';
import Inspiration from './pages/Inspiration';
import Marketplace from './pages/Marketplace';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground selection:bg-primary/10 selection:text-primary">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wardrobe" element={<RouteGuard><Wardrobe /></RouteGuard>} />
            <Route path="/outfit" element={<OutfitPage />} />
            <Route path="/inspiration" element={<Inspiration />} />
            <Route path="/marketplace" element={<Marketplace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Simple wrapper for consistency, can be expanded later
function RouteGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default App;
