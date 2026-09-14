import React from 'react';

export default function NoiseSlider({ addNoise, setAddNoise, sigma, setSigma }) {
  return (
    <div className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-medium text-zinc-300 cursor-pointer flex items-center">
          <input 
            type="checkbox" 
            checked={addNoise}
            onChange={(e) => setAddNoise(e.target.checked)}
            className="mr-3 w-4 h-4 accent-blue-500 bg-zinc-800 border-zinc-700 rounded"
          />
          Add Synthetic Gaussian Noise
        </label>
        {addNoise && (
          <span className="text-xs font-mono bg-zinc-800 text-blue-400 px-2 py-1 rounded">
            σ = {sigma}
          </span>
        )}
      </div>

      <input
        type="range"
        min="10"
        max="50"
        step="1"
        value={sigma}
        onChange={(e) => setSigma(parseInt(e.target.value))}
        disabled={!addNoise}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
          addNoise ? 'bg-zinc-700 accent-blue-500' : 'bg-zinc-800 accent-zinc-600 cursor-not-allowed'
        }`}
      />
      <div className="flex justify-between text-xs text-zinc-500 mt-2">
        <span>Low (10)</span>
        <span>High (50)</span>
      </div>
    </div>
  );
}