import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Image as ImageIcon, Play, Info } from 'lucide-react';

// Import our actual API health check function
import { checkServerHealth } from '../api/denoise';

const HEALTH_CHECK_INTERVAL_MS = 30_000;

function useBackendStatus() {
  const [status, setStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  const checkHealth = useCallback(async () => {
    try {
      // Call the real FastAPI endpoint
      const data = await checkServerHealth();
      if (data && data.status === 'ok') {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch {
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const id = setInterval(checkHealth, HEALTH_CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [checkHealth]);

  return status;
}

// --- Status indicator ------------------------------------------------------
function StatusIndicator() {
  const status = useBackendStatus();

  const config = {
    online: { color: '#22d97c', label: 'Online', ring: 'rgba(34,217,124,0.35)' },
    offline: { color: '#f4534b', label: 'Offline', ring: 'rgba(244,83,75,0.35)' },
    checking: { color: '#eab308', label: 'Checking', ring: 'rgba(234,179,8,0.35)' },
  }[status];

  return (
    <div className="hidden sm:flex items-center gap-2 pl-3 pr-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-950/60">
      <span className="relative flex h-2 w-2">
        {status === 'online' && (
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full"
            style={{ backgroundColor: config.color }}
            animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: config.color, boxShadow: `0 0 6px ${config.ring}` }}
        />
      </span>
      <span
        className="text-[11px] font-mono uppercase tracking-wider text-zinc-400"
        aria-live="polite"
      >
        {config.label}
      </span>
    </div>
  );
}

// --- Nav data ---------------------------------------------------------------
const navItems = [
  { name: 'Home', path: '/', icon: Activity },
  { name: 'Samples', path: '/samples', icon: ImageIcon },
  { name: 'Try It', path: '/inference', icon: Play, cta: true },
  { name: 'About', path: '/about', icon: Info },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-md border-zinc-800 shadow-[0_1px_0_0_rgba(56,189,248,0.08),0_8px_24px_-12px_rgba(0,0,0,0.8)]'
          : 'bg-black/40 backdrop-blur-sm border-zinc-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group shrink-0">
            <div className="relative">
              <Activity className="h-7 w-7 text-cyan-400 transition-transform group-hover:scale-105" strokeWidth={2.2} />
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: '0 0 12px rgba(34,211,238,0.5)' }}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            
            {/* THIS IS WHERE THE FONT SIZE WAS CHANGED (text-2xl) */}
            <span className="ml-2.5 text-3xl font-bold text-white tracking-tight">
              Denoise
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                RX
              </span>
            </span>
            <span className="ml-2 hidden md:inline-flex items-center px-1.5 py-0.5 rounded border border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              v2.1
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              if (item.cta) {
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="relative flex items-center px-4 py-2 ml-1 rounded-md text-sm font-semibold text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-[0_0_16px_-4px_rgba(34,211,238,0.6)] hover:shadow-[0_0_20px_-2px_rgba(34,211,238,0.8)]"
                  >
                    <Icon className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                    {item.name}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'text-cyan-300' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-md bg-zinc-900 border border-zinc-800"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative flex items-center">
                    <Icon className="w-4 h-4 mr-2" strokeWidth={2} />
                    {item.name}
                  </span>
                </Link>
              );
            })}

            <div className="ml-2 sm:ml-3">
              <StatusIndicator />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}