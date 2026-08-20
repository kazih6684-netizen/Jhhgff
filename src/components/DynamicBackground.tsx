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
    const particleCount = Math.min(Math.floor((width * height) / 22000), 55);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    let time = 0;

    const render = () => {
      time += 0.012;
      const { primary, secondary } = getColors();
      
      // Clear with dark deep navy atmospheric canvas
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Subtle tech grid pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 70;
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

      // Draw floating glowing orbs (ambient light auroras)
      const orbSpeed = isPlayingAudio ? 1.6 : 1.0;
      const orb1X = width * 0.25 + Math.sin(time * 0.4 * orbSpeed) * 180;
      const orb1Y = height * 0.35 + Math.cos(time * 0.35 * orbSpeed) * 120;
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, 500);
      grad1.addColorStop(0, primary + (isPlayingAudio ? '28' : '15'));
      grad1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(orb1X, orb1Y, 500, 0, Math.PI * 2);
      ctx.fill();

      const orb2X = width * 0.75 + Math.cos(time * 0.45 * orbSpeed) * 200;
      const orb2Y = height * 0.65 + Math.sin(time * 0.4 * orbSpeed) * 140;
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 550);
      grad2.addColorStop(0, secondary + (isPlayingAudio ? '25' : '12'));
      grad2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(orb2X, orb2Y, 550, 0, Math.PI * 2);
      ctx.fill();

      // Audio visualizer wave ripple at bottom if audio is playing
      if (isPlayingAudio) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = primary + '60';
        for (let x = 0; x <= width; x += 10) {
          const y = height - 70 + Math.sin(x * 0.015 + time * 4) * 20 * Math.sin(time * 2);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Constellation lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = primary;
            ctx.globalAlpha = (1 - dist / 130) * 0.12;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update and draw floating glowing particles
      particles.forEach((p) => {
        p.x += p.vx * (isPlayingAudio ? 1.4 : 1);
        p.y += p.vy * (isPlayingAudio ? 1.4 : 1);

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = primary;
        ctx.globalAlpha = p.alpha + Math.sin(time * 2.5 + p.x) * 0.15;
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
