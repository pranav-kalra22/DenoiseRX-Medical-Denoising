import React, { useState } from 'react';

export default function ImageCompareSlider({ beforeImage, afterImage, beforeLabel = "Noisy Input", afterLabel = "Clean Output" }) {  const [position, setPosition] = useState(50);

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl border border-zinc-800 bg-black overflow-hidden group shadow-2xl">
      
      {/* Bottom Image (Noisy) */}
      <img 
        src={beforeImage} 
        alt="Noisy Input" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80" 
      />

      {/* Top Image (Denoised) - Clipped based on slider position */}
      <img
        src={afterImage}
        alt="Denoised Output"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)` }}
      />

      {/* The Divider Line & Handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] pointer-events-none z-10"
        style={{ left: `calc(${position}% - 1px)` }}
      >
        {/* Thumb Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
          <div className="flex space-x-1">
            <div className="w-0.5 h-3 bg-zinc-400 rounded-full"></div>
            <div className="w-0.5 h-3 bg-zinc-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Invisible Interactive Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 m-0"
      />

      {/* Dynamic Labels */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-zinc-300 text-[10px] px-2 py-1 rounded uppercase tracking-wider font-medium z-10 pointer-events-none transition-opacity">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 bg-blue-600/20 backdrop-blur-md text-blue-400 text-[10px] px-2 py-1 rounded border border-blue-500/30 uppercase tracking-wider font-medium z-10 pointer-events-none transition-opacity">
        {afterLabel}
      </div>
    </div>
  );
}