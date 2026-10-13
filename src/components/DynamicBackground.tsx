import React, { useEffect, useRef } from 'react';

import { ThemeType, MeetingMode } from '../types';

interface Props {
  theme: ThemeType;
  mode?: MeetingMode;
  isPlayingAudio?: boolean;
}

export const DynamicBackground: React.FC<Props> = ({ theme, mode = 'break', isPlayingAudio }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getColors = () => {
    if (mode === 'started') {
      return { primary: '#38bdf8', secondary: '#2563eb', glow: 'rgba(56, 189, 248, 0.28)' };
    }
    switch (theme) {
      case 'cobalt-sapphire':
        return { primary: '#2563eb', secondary: '#38bdf8', glow: 'rgba(37, 99, 235, 0.22)' };
      case 'cyber-cyan':
        return { primary: '#0ea5e9', secondary: '#2563eb', glow: 'rgba(14, 165, 233, 0.20)' };
      case 'royal-emerald':
        return { primary: '#10b981', secondary: '#059669', glow: 'rgba(16, 185, 129, 0.20)' };
      case 'monochrome-clean':
      default:
        return { primary: '#3b82f6', secondary: '#10b981', glow: 'rgba(59, 130, 246, 0.18)' };
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
      
      const isLive = mode === 'started';
      // Clear with soft neumorphic base canvas (#e8ecf4 in break/light, #0f131c in live/dark)
      ctx.fillStyle = isLive ? '#0f131c' : '#e8ecf4';
      ctx.fillRect(0, 0, width, height);

      // Subtle neumorphic ambient lighting grid
      ctx.strokeStyle = isLive ? 'rgba(56, 189, 248, 0.025)' : 'rgba(196, 206, 220, 0.4)';
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
      grad1.addColorStop(0, primary + (isPlayingAudio ? '20' : '0e'));
      grad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(orb1X, orb1Y, 500, 0, Math.PI * 2);
      ctx.fill();

      const orb2X = width * 0.75 + Math.cos(time * 0.45 * orbSpeed) * 200;
      const orb2Y = height * 0.65 + Math.sin(time * 0.4 * orbSpeed) * 140;
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 550);
      grad2.addColorStop(0, secondary + (isPlayingAudio ? '1c' : '0b'));
      grad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
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
  }, [theme, mode, isPlayingAudio]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};
