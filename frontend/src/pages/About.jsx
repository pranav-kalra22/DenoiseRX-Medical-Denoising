import React from 'react';
import { Network, SplitSquareHorizontal, Minimize2, LineChart, Cpu, ShieldCheck, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-20">
      
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Engineering DenoiseRX</h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          A deep dive into the scaled-down NAFNet architecture, the mathematics of the SimpleGate, and the empirical data behind the loss function ablation study.
        </p>
      </div>

      {/* Section 1: The Architecture */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3 border-b border-zinc-800 pb-4">
          <Network className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-white">The Topology: Scaled NAFNet</h2>
        </div>
        
        <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed space-y-6">
          <p>
            DenoiseRX is built on a custom implementation of the <strong>Nonlinear Activation Free Network (NAFNet)</strong>. Originally introduced in ECCV 2022 as a simple baseline for image restoration, standard NAFNet-32 requires upwards of 17 million parameters. 
          </p>
          <p>
            To optimize for rapid clinical inference and edge-device deployment, DenoiseRX utilizes a highly scaled-down configuration featuring a channel width of 16 and an encoder block distribution of <code>[1, 1, 2, 4]</code>. This preserves the full topological integrity of the U-Net shaped backbone while reducing the computational footprint to just <strong>2.94 Million parameters (11.2 MB)</strong>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <Minimize2 className="w-6 h-6 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Network-Level Residuals</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Instead of mapping the noisy image directly to a clean image, the network acts as a noise estimator. The final layer executes <code>output = model(input) + input</code>. By learning the residual correction rather than the vast complexity of the entire radiograph, convergence is vastly accelerated.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <SplitSquareHorizontal className="w-6 h-6 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Pixel Shuffle Upsampling</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              The decoder stages avoid standard transposed convolutions, which notoriously introduce checkerboard artefacts. Instead, spatial upsampling is achieved via <code>nn.PixelShuffle(2)</code>, rearranging channel depth into spatial dimensions for pristine artifact-free reconstruction.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: The Core Innovation */}
      <section className="space-y-8">
        <div className="flex items-center space-x-3 border-b border-zinc-800 pb-4">
          <Cpu className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-white">The Core Innovation: SimpleGate</h2>
        </div>
        
        <div className="bg-black border border-purple-900/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(168,85,247,0.05)]">
          <p className="text-zinc-400 leading-relaxed mb-6">
            The defining characteristic of NAFNet is the complete absence of traditional activation functions like ReLU, GELU, or Sigmoid. Instead, nonlinearity is achieved through a shockingly simple architectural choice known as the <strong>SimpleGate</strong>.
          </p>
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 font-mono text-sm text-zinc-300 mb-6 flex flex-col space-y-2">
            <span className="text-zinc-500">// The SimpleGate implementation in PyTorch</span>
            <span>x1, x2 = x.chunk(2, dim=1) <span className="text-zinc-500 ml-4"># Split along channel dimension</span></span>
            <span>return x1 * x2 <span className="text-zinc-500 ml-16"># Element-wise modulation</span></span>
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed">
            By splitting the feature map and multiplying the two halves, one half acts as a gate modulating the other—equivalent to a Gated Linear Unit (GLU) but without the saturation risks of a sigmoid activation. This reduction in complexity allows for a higher channel count within the same computational budget, directly translating to higher PSNR limits.
          </p>
        </div>
      </section>

      {/* Section 3: Ablation Study & Loss */}
      <section className="space-y-8 pb-12">
        <div className="flex items-center space-x-3 border-b border-zinc-800 pb-4">
          <LineChart className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold text-white">Loss Topology & Ablation Study</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6 text-zinc-400 leading-relaxed">
            <p>
              To determine the optimal objective function for medical imaging, a rigorous ablation study was conducted. The hypothesis was that a composite loss (L1 + SSIM) would preserve high-frequency structural details better than a pure L1 pixel-wise loss.
            </p>
            <p>
              <strong>The Mathematical Paradox:</strong> Counter to the hypothesis, the pure L1 optimization loop converged to a strictly superior global minimum, outperforming the composite model in both Peak Signal-to-Noise Ratio (PSNR) <em>and</em> Structural Similarity (SSIM). The addition of the explicit SSIM penalty effectively constrained the optimization landscape, acting as gradient noise rather than a helpful regularizer.
            </p>
          </div>
          
          {/* Training Hyperparameters */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 sm:p-2">
            <div className="grid grid-cols-2 h-full">
              <div className="flex flex-col justify-center p-4 sm:p-6 border-b border-r border-zinc-800 space-y-1">
                <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider">Epochs</span>
                <span className="font-mono text-white text-lg">50</span>
              </div>
              <div className="flex flex-col justify-center p-4 sm:p-6 border-b border-zinc-800 space-y-1">
                <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider">Optimizer</span>
                <span className="font-mono text-white text-lg">AdamW</span>
              </div>
              <div className="flex flex-col justify-center p-4 sm:p-6 border-r border-zinc-800 space-y-1">
                <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider">Scheduler</span>
                <span className="font-mono text-white text-sm sm:text-base">CosineAnnealing</span>
              </div>
              <div className="flex flex-col justify-center p-4 sm:p-6 space-y-1">
                <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider">Hardware</span>
                <span className="font-mono text-white text-sm sm:text-base">Tesla T4 GPU</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ablation Results Banner */}
        <div className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* L1 + SSIM Column */}
          <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-zinc-800">
            <div className="flex items-center space-x-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-zinc-500" />
              <h4 className="text-zinc-300 font-bold">Composite: L1 + SSIM</h4>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Peak PSNR</p>
                <p className="text-xl font-mono text-zinc-400">38.37 dB</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Peak SSIM</p>
                <p className="text-xl font-mono text-zinc-400">0.9246</p>
              </div>
            </div>
          </div>

          {/* Pure L1 Column (The Winner) */}
          <div className="flex-1 p-6 bg-blue-900/10 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <h4 className="text-white font-bold">Pure L1 (Production)</h4>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">Winner</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Peak PSNR</p>
                <p className="text-2xl font-mono text-white">38.47 dB</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Peak SSIM</p>
                <p className="text-2xl font-mono text-white">0.9251</p>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}