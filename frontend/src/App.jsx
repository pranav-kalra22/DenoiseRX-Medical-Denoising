import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Samples from './pages/Samples';
import Inference from './pages/Inference';
import About from './pages/About';
import BackgroundCanvas from './components/BackgroundCanvas';
import PageTransition from './components/PageTransition';

// This sub-component allows us to safely use the `useLocation` hook for animations
function AnimatedRoutes() {
  const location = useLocation();

  return (
    // mode="wait" ensures the exit animation finishes before the enter animation starts
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/samples" element={<PageTransition><Samples /></PageTransition>} />
        <Route path="/inference" element={<PageTransition><Inference /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      {/* Note: I added 'relative' to this outer div so the z-indexes stack correctly 
        with your BackgroundCanvas 
      */}
      <div className="min-h-screen bg-transparent text-white flex flex-col font-sans relative">
        {/* The interactive denoising background (Untouched) */}
        <BackgroundCanvas />
        
        {/* Everything else gets wrapped in a relative z-10 so it sits above the canvas */}
        <div className="relative z-10 flex flex-col min-h-screen w-full">
          <Navbar />
          
          <main className="flex-grow">
            <AnimatedRoutes />
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;