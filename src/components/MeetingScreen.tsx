import React, { useState, useEffect } from 'react';
import { MeetingState } from '../types';
import { Settings, Maximize2, Minimize2, Radio, Clock, ShieldCheck, PlayCircle, PauseCircle, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AmbientSoundPlayer } from './AmbientSoundPlayer';

interface Props {
  state: MeetingState;
  onChange?: (newState: MeetingState) => void;
  onOpenSettings: () => void;
  isPlayingAudio: boolean;
}

export const MeetingScreen: React.FC<Props> = ({
  state,
  onChange,
  onOpenSettings,
  isPlayingAudio,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [remainingSeconds, setRemainingSeconds] = useState(state.countdownSeconds);
  const [isLaptopFrame, setIsLaptopFrame] = useState(false);

  // Sync remaining seconds if prop changes
  useEffect(() => {
    setRemainingSeconds(state.countdownSeconds);
  }, [state.countdownSeconds]);

  // Live clock interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer interval
  useEffect(() => {
    if (!state.isCountdownActive || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Trigger confetti when second part starts!
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#06b6d4', '#10b981', '#f59e0b']
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isCountdownActive, remainingSeconds]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const applyPreset = (type: 'started' | 'break' | 'ended') => {
    if (!onChange) return;
    if (type === 'started') {
      onChange({
        ...state,
        statusBadge: 'LIVE COUNSELLING MEETING • চলছে',
        bengaliHeadline: 'অফিসিয়াল কাউন্সেলিং মিটিং এর দ্বিতীয় পর্ব শুরু হয়েছে!',
        bengaliBody: 'সবাই মনোযোগ সহকারে কাউন্সেলিং মিটিংটি কন্টিনিউ করুন। মিটিং শেষ হলে সম্পূর্ণ কাজ বিস্তারিত বুঝিয়ে দেওয়া হবে।'
      });
    } else if (type === 'break') {
      onChange({
        ...state,
        statusBadge: 'LIVE COUNSELLING MEETING',
        bengaliHeadline: 'প্রথম পর্বের মিটিং সমাপ্ত হয়েছে। দ্বিতীয় পর্ব এখনই শুরু হবে!',
        bengaliBody: 'সবাই মিটিংয়ে মনোযোগ সহকারে উপস্থিত থাকুন এবং সম্পূর্ণ মিটিংটি শেষ করুন। স্ক্রিন শেয়ারে চোখ রাখুন—শীঘ্রই আলোচনা পুনরায় শুরু হচ্ছে।'
      });
    } else if (type === 'ended') {
      onChange({
        ...state,
        statusBadge: 'MEETING CONCLUDED • সমাপ্ত',
        bengaliHeadline: 'আজকের অফিসিয়াল সেশনটি সফলভাবে সমাপ্ত হয়েছে',
        bengaliBody: 'উপস্থিত থাকার জন্য সকল অংশগ্রহণকারীকে আন্তরিক ধন্যবাদ। পরবর্তী সেশনের আপডেট ও নির্দেশনা অফিসিয়াল গ্রুপে জানিয়ে দেওয়া হবে।'
      });
    }
  };

  const triggerConfettiParty = () => {
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']
    });
  };

  const getThemeAccent = () => {
    switch (state.theme) {
      case 'cyber-cyan':
        return {
          gradient: 'from-cyan-400 via-sky-300 to-blue-500',
          border: 'border-cyan-500/30',
          glow: 'shadow-[0_0_80px_rgba(6,182,212,0.18)]',
          badgeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
          ringColor: 'border-cyan-500/40',
        };
      case 'royal-emerald':
        return {
          gradient: 'from-emerald-400 via-teal-300 to-green-500',
          border: 'border-emerald-500/30',
          glow: 'shadow-[0_0_80px_rgba(16,185,129,0.18)]',
          badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
          ringColor: 'border-emerald-500/40',
        };
      case 'deep-violet':
        return {
          gradient: 'from-purple-400 via-fuchsia-300 to-indigo-500',
          border: 'border-purple-500/30',
          glow: 'shadow-[0_0_80px_rgba(168,85,247,0.18)]',
          badgeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-300',
          ringColor: 'border-purple-500/40',
        };
      case 'gold-amber':
        return {
          gradient: 'from-amber-400 via-yellow-300 to-orange-500',
          border: 'border-amber-500/30',
          glow: 'shadow-[0_0_80px_rgba(245,158,11,0.18)]',
          badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          ringColor: 'border-amber-500/40',
        };
    }
  };

  const themeStyle = getThemeAccent();

  const content = (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex flex-col items-center justify-center min-h-[75vh] max-h-[92vh] text-center select-none">
      
      {/* Top Live Status Badge */}
      <div className={`inline-flex items-center gap-2.5 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border mb-4 animate-pulse ${themeStyle.badgeBg}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <Radio className="w-3.5 h-3.5" />
        <span>{state.statusBadge}</span>
      </div>

      {/* 1. First: The Official Company & Meeting Title exactly as requested */}
      <h1 className={`text-3xl sm:text-5xl md:text-[3rem] font-extrabold tracking-tight bg-gradient-to-r ${themeStyle.gradient} bg-clip-text text-transparent leading-tight md:leading-snug max-w-5xl font-sans drop-shadow-sm`}>
        {state.title}
      </h1>

      {/* Subtle decorative horizontal separator with glowing center */}
      <div className="relative w-56 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent my-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-cyan-400 blur-sm" />
      </div>

      {/* 2. Below: The Bengali Announcement Block with dynamic side & border animation */}
      <div className="relative w-full max-w-5xl my-2 group">
        {/* Ambient animated backlight aura around the card */}
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/35 via-indigo-500/35 to-blue-500/35 rounded-[2.3rem] blur-2xl opacity-75 animate-pulse duration-1000" />

        {/* Shimmering outer frame */}
        <div className={`relative w-full bg-slate-900/85 backdrop-blur-2xl border-2 ${themeStyle.border} rounded-3xl p-8 sm:p-12 shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden transition-all duration-500`}>
          
          {/* Animated vertical laser lines along the left and right edges */}
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
          <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]" style={{ animationDelay: '600ms' }} />

          {/* Shimmering top and bottom highlight bars */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-80" />
          <div className="absolute bottom-0 left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80" />

          {/* Floating background glowing orbs inside the card */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-bounce" style={{ animationDuration: '7s' }} />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-bounce" style={{ animationDuration: '9s' }} />

          {/* Main Bengali Headline */}
          <h2 className="relative z-10 text-3xl sm:text-4xl md:text-[2.7rem] font-extrabold text-white leading-snug tracking-normal mb-5 drop-shadow-lg">
            {state.bengaliHeadline}
          </h2>

          {/* Main Bengali Body */}
          <p className="relative z-10 text-xl sm:text-[1.65rem] text-blue-100/95 leading-relaxed font-normal max-w-4xl mx-auto tracking-wide">
            {state.bengaliBody}
          </p>
        </div>
      </div>

      {/* Live Stream Assurance Bar at bottom */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>বর্তমান সময়: <strong className="text-slate-200">{formatTime(currentTime)}</strong></span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>অফিসিয়াল লাইভ সেশন • সব অংশগ্রহণকারীর উপস্থিতি বাধ্যতামূলক</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-x-hidden">
      {/* Top Right Ambient Sound Player Widget */}
      <AmbientSoundPlayer isVisible={state.showAmbientMusicWidget !== false} />

      {/* Top Left Host Preset Switches & Party Trigger */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-1 opacity-30 hover:opacity-100 transition-opacity duration-300 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-2xl">
        <button
          onClick={() => applyPreset('started')}
          title="মিটিং শুরু হয়েছে (LIVE) সেট করুন"
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-all"
        >
          <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">শুরু হয়েছে</span>
        </button>

        <button
          onClick={() => applyPreset('break')}
          title="বিরতি / ২য় পর্ব শীঘ্রই শুরু হবে সেট করুন"
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-all"
        >
          <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">বিরতি/২য় পর্ব</span>
        </button>

        <button
          onClick={() => applyPreset('ended')}
          title="মিটিং সমাপ্ত হয়েছে সেট করুন"
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[11px] font-medium transition-all"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">সমাপ্ত হয়েছে</span>
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        <button
          onClick={triggerConfettiParty}
          title="পার্টি কনফেটি অ্যানিমেশন বাজান"
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 hover:from-rose-500/40 hover:to-amber-500/40 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="hidden sm:inline">পার্টি</span>
        </button>
      </div>

      {isLaptopFrame ? (
        /* Laptop Device Frame Preview Mode */
        <div className="relative w-full max-w-6xl mx-auto p-4 sm:p-8">
          <div className="relative bg-slate-950 border-[10px] sm:border-[16px] border-slate-800 rounded-t-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden min-h-[72vh] flex items-center justify-center">
            {/* Laptop camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-b-xl flex items-center justify-center z-40">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-500/60" />
              </div>
            </div>
            {content}
          </div>
          {/* Laptop Base */}
          <div className="relative h-6 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-2xl mx-auto w-[104%] -ml-[2%] shadow-2xl flex items-center justify-center">
            <div className="w-16 h-1.5 bg-slate-600 rounded-full" />
          </div>
        </div>
      ) : (
        /* Full Screen Pure Display Mode */
        content
      )}

      {/* 
        DISCREET HOST CONTROLS AT BOTTOM LEFT
        Allows toggling between Full-Screen and Laptop Frame view or opening settings panel without any clutter.
      */}
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => setIsLaptopFrame(!isLaptopFrame)}
          title="ল্যাপটপ ফ্রেম / ফুল-স্ক্রিন মোড টগল করুন"
          className="p-2 rounded-xl bg-slate-900/80 border border-white/15 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg"
        >
          {isLaptopFrame ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenSettings}
          title="কন্ট্রোল প্যানেল খুলুন (Settings)"
          className="p-2 rounded-xl bg-slate-900/80 border border-white/15 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg flex items-center gap-1.5 text-xs font-medium"
        >
          <Settings className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '15s' }} />
          <span className="hidden sm:inline">সেটিংস</span>
        </button>
      </div>
    </div>
  );
};
