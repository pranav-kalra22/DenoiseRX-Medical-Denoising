import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const DEMO_IMAGES = [
  { id: 'demo1', src: '/samples/chest_demo_1.png', label: 'Case 01' },
  { id: 'demo2', src: '/samples/chest_demo_2.png', label: 'Case 02' },
  { id: 'demo3', src: '/samples/chest_demo_3.png', label: 'Case 03' },
  { id: 'demo4', src: '/samples/chest_demo_4.png', label: 'Case 04' },
];

export default function ImageSelector({ onImageSelect }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleSelect = async (image) => {
    setLoadingId(image.id);
    try {
      // 1. Fetch the static asset from the /public folder
      const response = await fetch(image.src);
      
      // 2. Convert the response into raw binary data (Blob)
      const blob = await response.blob();
      
      // 3. Package the Blob into a standard File object that Axios/FastAPI understands
      const file = new File([blob], `${image.id}.png`, { type: 'image/png' });
      
      // 4. Pass the File and the preview URL back to Inference.jsx
      onImageSelect(file, image.src);
    } catch (error) {
      console.error("Failed to load demo image into memory:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {DEMO_IMAGES.map((img) => (
        <button
          key={img.id}
          onClick={() => handleSelect(img)}
          disabled={loadingId !== null}
          className="group relative flex flex-col aspect-square bg-black border border-zinc-800 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Image Thumbnail */}
          <div className="w-full h-full relative">
            <img 
              src={img.src} 
              alt={img.label} 
              className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
            />
            
            {/* Loading Spinner overlay if this specific image is being fetched */}
            {loadingId === img.id && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            )}
          </div>
          
          {/* Label Bar */}
          <div className="absolute bottom-0 w-full bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 p-2">
            <span className="text-xs font-medium text-zinc-300 group-hover:text-blue-400 transition-colors">
              {img.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}