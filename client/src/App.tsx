import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Wardrobe from './pages/Wardrobe';
import OutfitPage from './pages/Outfit';
import Inspiration from './pages/Inspiration';
import Marketplace from './pages/Marketplace';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased text-foreground selection:bg-foreground selection:text-background">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/wardrobe" element={<RouteGuard><Wardrobe /></RouteGuard>} />
              <Route path="/outfit" element={<RouteGuard><OutfitPage /></RouteGuard>} />
              <Route path="/inspiration" element={<Inspiration />} />
              <Route path="/marketplace" element={<Marketplace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Protected Route Wrapper
function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <span className="font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Initializing...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default App;
