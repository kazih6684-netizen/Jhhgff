import React, { useEffect, useRef } from 'react';

interface Props {
  theme: 'cyber-cyan' | 'royal-emerald' | 'deep-violet' | 'gold-amber';
  isPlayingAudio?: boolean;
}

export const DynamicBackground: React.FC<Props> = ({ theme, isPlayingAudio }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getColors = () => {
    switch (theme) {
      case 'cyber-cyan':
        return { primary: '#06b6d4', secondary: '#3b82f6', glow: 'rgba(6, 182, 212, 0.15)' };
      case 'royal-emerald':
        return { primary: '#10b981', secondary: '#059669', glow: 'rgba(16, 185, 129, 0.15)' };
      case 'deep-violet':
        return { primary: '#a855f7', secondary: '#6366f1', glow: 'rgba(168, 85, 247, 0.15)' };
      case 'gold-amber':
        return { primary: '#f59e0b', secondary: '#ef4444', glow: 'rgba(245, 158, 11, 0.15)' };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create particles
    const particleCount = Math.min(Math.floor((width * height) / 18000), 70);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2.5 + 1,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * 0.05,
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      const { primary } = getColors();
      
      // Clear with dark atmospheric gradient
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);

      // Subtle grid overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw floating glowing orbs (ambient light)
      const orbSpeed = isPlayingAudio ? 1.8 : 1.0;
      const orb1X = width * 0.3 + Math.sin(time * 0.5 * orbSpeed) * 200;
      const orb1Y = height * 0.3 + Math.cos(time * 0.4 * orbSpeed) * 150;
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, 450);
      grad1.addColorStop(0, primary + (isPlayingAudio ? '35' : '18'));
      grad1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(orb1X, orb1Y, 450, 0, Math.PI * 2);
      ctx.fill();

      const orb2X = width * 0.7 + Math.cos(time * 0.6 * orbSpeed) * 220;
      const orb2Y = height * 0.7 + Math.sin(time * 0.5 * orbSpeed) * 180;
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 500);
      grad2.addColorStop(0, primary + (isPlayingAudio ? '30' : '14'));
      grad2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(orb2X, orb2Y, 500, 0, Math.PI * 2);
      ctx.fill();

      // Audio visualizer wave ripple at bottom if audio is playing
      if (isPlayingAudio) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = primary + '60';
        for (let x = 0; x <= width; x += 10) {
          const y = height - 80 + Math.sin(x * 0.015 + time * 4) * 25 * Math.sin(time * 2);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Update and draw floating glowing particles
      particles.forEach((p) => {
        p.x += p.vx * (isPlayingAudio ? 1.5 : 1);
        p.y += p.vy * (isPlayingAudio ? 1.5 : 1);

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = primary;
        ctx.globalAlpha = p.alpha + Math.sin(time * 3 + p.x) * 0.2;
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, isPlayingAudio]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#050811' }}
    />
  );
};
