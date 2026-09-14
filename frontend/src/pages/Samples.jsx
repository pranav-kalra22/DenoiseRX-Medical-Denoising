import React, { useState } from 'react';
import { ActivitySquare, FileImage, Layers, ChevronRight } from 'lucide-react';
import ImageCompareSlider from '../components/ImageCompareSlider';

// The hard data extracted directly from your Kaggle training logs
const CASES = [
  {
    id: 'samp_1',
    title: 'Case 01: Chest Radiograph',
    noiseProfile: '25DB Noise Distribution',
    sigma: 25,
    metrics: {
      psnrBefore: '20.56',
      psnrAfter: '37.28',
      ssim: '0.9210',
      time: '7.29s'
    },
    images: {
      noisy: '/samples/samp_1_noisy.png',
      clean: '/samples/samp_1_denoised.png'
    }
  },
  {
    id: 'samp_2',
    title: 'Case 02: Hand Radiograph',
    noiseProfile: '25DB Noise Distribution',
    sigma: 25,
    metrics: {
      psnrBefore: '21.51',
      psnrAfter: '30.66',
      ssim: '0.9116',
      time: '0.32s' // 0.3182s rounded
    },
    images: {
      noisy: '/samples/samp_2_noisy.png',
      clean: '/samples/samp_2_denoised.png'
    }
  },
  {
    id: 'samp_3',
    title: 'Case 03: Femur Radiograph',
    noiseProfile: '25DB Noise Distribution',
    sigma: 25,
    metrics: {
      psnrBefore: '21.62',
      psnrAfter: '38.64',
      ssim: '0.9249',
      time: '41.07s' // 41.0698s rounded
    },
    images: {
      noisy: '/samples/samp_3_noisy.png',
      clean: '/samples/samp_3_denoised.png'
    }
  }
];

export default function Samples() {
  const [activeCase, setActiveCase] = useState(CASES[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Page Header */}
      <div className="mb-10 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Validation Gallery</h1>
        <p className="text-zinc-400 max-w-2xl">
          Pre-computed inference results from the test dataset. Select a clinical case to evaluate the NAFNet L1+SSIM pipeline's spatial reconstruction accuracy.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Case Selector List */}
        <div className="w-full lg:w-1/3 space-y-3">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">
            Select Case Study
          </div>
          
          {CASES.map((c) => {
            const isActive = activeCase.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCase(c)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                  isActive 
                    ? 'bg-zinc-900 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                    : 'bg-black border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50'
                }`}
              >
                <div>
                  <h3 className={`font-semibold mb-1 ${isActive ? 'text-blue-400' : 'text-zinc-300 group-hover:text-white'}`}>
                    {c.title}
                  </h3>
                  <div className="flex items-center text-xs text-zinc-500">
                    <Layers className="w-3 h-3 mr-1.5" />
                    {c.noiseProfile}
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? 'text-blue-500 translate-x-1' : 'text-zinc-700'}`} />
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Case Viewer */}
        <div className="w-full lg:w-2/3 flex flex-col space-y-6">
          
          {/* Interactive Slider */}
          <div className="w-full relative z-10 animate-in fade-in slide-in-from-right-4 duration-500" key={activeCase.id}>
            <ImageCompareSlider 
              beforeImage={activeCase.images.noisy}
              afterImage={activeCase.images.clean}
              beforeLabel={`Input: ${activeCase.metrics.psnrBefore} dB`}
              afterLabel={`Output: ${activeCase.metrics.psnrAfter} dB`}
            />
          </div>

          {/* Dedicated Metrics Bar for Active Case */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-500" key={`${activeCase.id}-metrics`}>
            
            <div className="flex flex-col items-center justify-center border-r border-zinc-800 p-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Baseline PSNR</span>
              <span className="text-lg font-mono text-zinc-300">{activeCase.metrics.psnrBefore} dB</span>
            </div>
            
            <div className="flex flex-col items-center justify-center border-r border-zinc-800 p-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 flex items-center">
                Denoised PSNR <ActivitySquare className="w-3 h-3 ml-1 text-blue-500" />
              </span>
              <span className="text-lg font-mono text-blue-400">{activeCase.metrics.psnrAfter} dB</span>
            </div>
            
            <div className="flex flex-col items-center justify-center border-r border-zinc-800 p-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">SSIM Index</span>
              <span className="text-lg font-mono text-white">{activeCase.metrics.ssim}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 flex items-center">
                Compute Time 
              </span>
              <span className="text-sm font-mono text-zinc-400 mt-1">{activeCase.metrics.time}</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}