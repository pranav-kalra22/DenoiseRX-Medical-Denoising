import React from 'react';
import { Download, ActivitySquare } from 'lucide-react';

export default function InferenceResult({ originalImgUrl, result }) {
  if (!result) return null;

  // Now we use the noisy image sent by the backend, falling back to the original URL if needed
  const noisySrc = result.noisy_image ? `data:image/png;base64,${result.noisy_image}` : originalImgUrl;
  const resultSrc = `data:image/png;base64,${result.denoised_image}`;

  return (
    <div className="w-full space-y-6">
      {/* 2-Column Image Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Input (Now correctly displays the Noisy Image) */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Noisy Input</span>
          <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden aspect-square">
            <img src={noisySrc} alt="Noisy Input" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* NAFNet Output */}
        <div className="flex flex-col">
          <span className="text-xs font-medium pl-1 text-blue-400 uppercase tracking-wider mb-2">
            Denoised Output (NAFNet L1)
          </span>
          <div className="bg-black border border-blue-900/50 rounded-xl overflow-hidden aspect-square relative group">
            <img src={resultSrc} alt="NAFNet Denoised" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a href={resultSrc} download="denoised_nafnet.png" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
                <Download className="w-4 h-4 mr-2" /> Download
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Unified Metrics Bar */}
      <div className="grid grid-cols-3 gap-4 bg-zinc-900 border border-blue-900/30 rounded-xl p-4">
        <div className="flex flex-col items-center justify-center border-r border-zinc-800">
          <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">PSNR Improvement</span>
          <span className="text-xl font-mono text-white">{result.psnr ? `${result.psnr.toFixed(2)} dB` : 'N/A'}</span>
        </div>
        <div className="flex flex-col items-center justify-center border-r border-zinc-800">
          <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Structural Similarity</span>
          <span className="text-xl font-mono text-white">{result.ssim ? result.ssim.toFixed(4) : 'N/A'}</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Inference Latency</span>
          <span className="text-xl font-mono text-white flex items-center">
            <ActivitySquare className="w-4 h-4 mr-2 text-zinc-600" />
            {result.inference_time_ms} ms
          </span>
        </div>
      </div>
    </div>
  );
}