import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Activity, Cpu, Target } from 'lucide-react';
import ImageCompareSlider from '../components/ImageCompareSlider';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left Column: Copy & CTAs */}
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Activity className="w-3 h-3 mr-2" />
            Live Inference Engine v2.1
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Medical images are noisy. <br />
            <span className="text-zinc-500">Noise costs diagnoses.</span>
          </h1>
          
          <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
            A highly optimized, production-ready pipeline for radiographic noise reduction. Powered by a custom Nonlinear Activation Free Network (NAFNet) and tuned via rigorous ablation testing for maximum clinical fidelity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              to="/inference" 
              className="inline-flex justify-center items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              Try Live Inference
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link 
              to="/samples" 
              className="inline-flex justify-center items-center px-6 py-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-medium transition-colors"
            >
              View Sample Gallery
            </Link>
          </div>
        </div>

        {/* Right Column: The Interactive Visual */}
        <div className="flex-1 w-full relative z-10">
          <ImageCompareSlider 
            beforeImage="/samples/samp_2_noisy.png" 
            afterImage="/samples/samp_2_denoised.png" 
            beforeLabel="Input: 20.20 dB"
            afterLabel="Output: 38.47 dB"
          />
        </div>
      </section>

      {/* 2. PRODUCTION METRICS (The Hard Data) */}
      <section className="border-y border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-zinc-800">
            <div className="flex flex-col px-4">
              <span className="text-3xl font-bold text-blue-400 mb-1">~18 dB</span>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Avg PSNR Improvement</span>
            </div>
            <div className="flex flex-col px-4">
              <span className="text-3xl font-bold text-white mb-1">0.925</span>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Peak SSIM</span>
            </div>
            <div className="flex flex-col px-4">
              <span className="text-3xl font-bold text-white mb-1">2.9M</span>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Parameters</span>
            </div>
            <div className="flex flex-col px-4">
              <span className="text-3xl font-bold text-white mb-1">11.2 MB</span>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Edge-Ready Footprint</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE ENGINEERING PIPELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Architectural Optimization</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            DenoiseRX abandons traditional bloated neural networks in favor of a hyper-efficient, purpose-built supervised pipeline validated against the NIH Chest X-ray dataset.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Architecture Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-colors group">
            <Layers className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Nonlinear Activation Free</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Achieves state-of-the-art restoration by entirely removing computationally expensive nonlinear activation functions (ReLU, GELU). It relies on simple channel splitting and multiplication gates, keeping the parameter count strictly under 3 Million.
            </p>
          </div>

          {/* Ablation Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-colors group">
            <Target className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Ablation-Tested Loss</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Conducted rigorous ablation studies comparing pure L1 against composite L1+SSIM loss topologies. Counterintuitively, the simplified pure L1 objective yielded superior global convergence, outperforming the composite model in both PSNR and structural similarity.
            </p>
          </div>

          {/* Performance Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-colors group">
            <Cpu className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Rapid Convergence</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Trained across 50 epochs utilizing a Cosine Annealing Learning Rate scheduler. The model reliably converges to a 38.47 dB peak PSNR with sub-second inference latency, making it strictly viable for live clinical workflows.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}