import React from 'react';

export default function ModelToggle({ selectedModel, onChange }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-zinc-400 mb-2">Select Architecture</label>
      <div className="flex p-1 space-x-1 bg-zinc-900 border border-zinc-800 rounded-xl">
        <button
          onClick={() => onChange('nafnet')}
          className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all ${
            selectedModel === 'nafnet'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          NAFNet (Supervised)
        </button>
        <button
          onClick={() => onChange('noise2noise')}
          className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all ${
            selectedModel === 'noise2noise'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          Noise2Noise (Self-Supervised)
        </button>
      </div>
    </div>
  );
}