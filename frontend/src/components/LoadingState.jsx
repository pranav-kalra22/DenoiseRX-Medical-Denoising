import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ status, model }) {
  const [elapsed, setElapsed] = useState(0);

  // Simple timer to show the user the app hasn't crashed
  useEffect(() => {
    const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusText = () => {
    if (status === 'queued') return "Waiting in queue...";
    if (status === 'processing') return `Running ${model === 'nafnet' ? 'NAFNet' : 'Noise2Noise'} inference...`;
    return "Connecting to server...";
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-12 bg-zinc-900 border border-zinc-800 rounded-xl">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">{getStatusText()}</h3>
      <p className="text-sm text-zinc-400 font-mono">Time elapsed: {elapsed}s</p>
      {elapsed > 10 && (
        <p className="text-xs text-yellow-500 mt-4 max-w-xs text-center">
          First request may take ~30s if the server is waking up from a cold start.
        </p>
      )}
    </div>
  );
}