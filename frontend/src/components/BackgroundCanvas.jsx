import React, { useEffect, useRef } from "react";

/**
 * ParticleBackground
 * High-performance, self-contained animated background.
 * Static to the cursor, featuring a steady "breathing" data aesthetic.
 */

const CONFIG = {
  count: 450,              
  innerRadiusRatio: 0.1,   
  outerRadiusRatio: 0.8,  
  minLength: 2,            
  maxLength: 12,           
  minWidth: 1,
  maxWidth: 2.5,
  breatheSpeed: 0.8,       // Smoothed out for a steady, rhythmic pulse
  breatheAmount: 0.85,     // High variance so they visibly grow/shrink
  cursorPull: 0,           // ZEROED: Particles no longer react to the mouse
  cursorInfluence: 0,      
  followLag: 0.08,         

  // THE CLINICAL COLOR PALETTE:
  colors: [
    { stop: 0, rgb: [255, 255, 255] },     // Pure White
    { stop: 0.4, rgb: [59, 130, 246] },    // Clinical Blue
    { stop: 1, rgb: [63, 63, 70] },        // Zinc Gray
  ],
};

function lerpColor(t) {
  const stops = CONFIG.colors;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t >= a.stop && t <= b.stop) {
      const localT = (t - a.stop) / (b.stop - a.stop);
      return a.rgb.map((v, idx) => Math.round(v + (b.rgb[idx] - v) * localT));
    }
  }
  return stops[stops.length - 1].rgb;
}

export default function ParticleBackground({ style }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width, height, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function initParticles() {
      const cx = width / 2;
      const cy = height / 2;
      const minDim = Math.min(width, height);
      const innerR = minDim * CONFIG.innerRadiusRatio;
      const outerR = Math.max(width, height) * CONFIG.outerRadiusRatio;

      particlesRef.current = Array.from({ length: CONFIG.count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const t = Math.pow(Math.random(), 0.6);
        const radius = innerR + t * (outerR - innerR);
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        const colorT = Math.min(1, radius / outerR);

        return {
          baseX: x,
          baseY: y,
          angle,
          radius,
          colorT,
          length: CONFIG.minLength + Math.random() * (CONFIG.maxLength - CONFIG.minLength),
          width: CONFIG.minWidth + Math.random() * (CONFIG.maxWidth - CONFIG.minWidth),
          phase: Math.random() * Math.PI * 2,
          speed: CONFIG.breatheSpeed * (0.7 + Math.random() * 0.6),
          offsetX: 0,
          offsetY: 0,
        };
      });
    }

    // We can leave the mouse handler in case you ever want to turn cursorPull back on
    function handleMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left - width / 2;
      mouseRef.current.targetY = e.clientY - rect.top - height / 2;
    }

    function animate(t) {
      frameRef.current = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, width, height);

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * CONFIG.followLag;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * CONFIG.followLag;

      const time = t * 0.001;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // breathing pulse
        const breathe = 1 + Math.sin(time * p.speed + p.phase) * CONFIG.breatheAmount;
        const alpha = 0.25 + 0.55 * Math.max(0, breathe - 0.3);
        const len = p.length * Math.max(0.3, breathe);

        // cursor pull physics (currently multiplied by 0 via CONFIG)
        const pull = CONFIG.cursorPull * Math.min(1, CONFIG.cursorInfluence / (p.radius + 1));
        p.offsetX += (mouseRef.current.x * pull - p.offsetX) * 0.08;
        p.offsetY += (mouseRef.current.y * pull - p.offsetY) * 0.08;

        const x = p.baseX + p.offsetX;
        const y = p.baseY + p.offsetY;

        const [r, g, b] = lerpColor(p.colorT);

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = p.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(
          x - Math.cos(p.angle) * len / 2,
          y - Math.sin(p.angle) * len / 2
        );
        ctx.lineTo(
          x + Math.cos(p.angle) * len / 2,
          y + Math.sin(p.angle) * len / 2
        );
        ctx.stroke();
      }
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMove);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: -1,
        ...style,
      }}
    />
  );
}