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
        bengaliHeadline: 'আমাদের অফিসিয়াল কাউন্সেলিং মিটিং এর দ্বিতীয় পর্ব শুরু হয়েছে!',
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
          titleColor: 'text-cyan-300',
          border: 'border-cyan-500/40',
          glow: 'shadow-[0_0_60px_rgba(6,182,212,0.25)]',
          badgeBg: 'bg-cyan-950/80 border-cyan-400/50 text-cyan-300',
          ringColor: 'border-cyan-500/50',
          accentColor: '#06b6d4',
          accentBg: 'bg-cyan-500',
          cardBorder: 'border-cyan-500/30',
        };
      case 'royal-emerald':
        return {
          titleColor: 'text-emerald-300',
          border: 'border-emerald-500/40',
          glow: 'shadow-[0_0_60px_rgba(16,185,129,0.25)]',
          badgeBg: 'bg-emerald-950/80 border-emerald-400/50 text-emerald-300',
          ringColor: 'border-emerald-500/50',
          accentColor: '#10b981',
          accentBg: 'bg-emerald-500',
          cardBorder: 'border-emerald-500/30',
        };
      case 'deep-violet':
        return {
          titleColor: 'text-purple-300',
          border: 'border-purple-500/40',
          glow: 'shadow-[0_0_60px_rgba(168,85,247,0.25)]',
          badgeBg: 'bg-purple-950/80 border-purple-400/50 text-purple-300',
          ringColor: 'border-purple-500/50',
          accentColor: '#a855f7',
          accentBg: 'bg-purple-500',
          cardBorder: 'border-purple-500/30',
        };
      case 'gold-amber':
        return {
          titleColor: 'text-amber-300',
          border: 'border-amber-500/40',
          glow: 'shadow-[0_0_60px_rgba(245,158,11,0.25)]',
          badgeBg: 'bg-amber-950/80 border-amber-400/50 text-amber-300',
          ringColor: 'border-amber-500/50',
          accentColor: '#f59e0b',
          accentBg: 'bg-amber-500',
          cardBorder: 'border-amber-500/30',
        };
    }
  };

  const themeStyle = getThemeAccent();

  const totalCountdown = state.countdownSeconds > 0 ? state.countdownSeconds : 180;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalCountdown - remainingSeconds) / totalCountdown) * 100)
  );

  const content = (
    <div className="relative z-10 w-full max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 flex flex-col items-center justify-center min-h-[90vh] text-center select-none">
      
      {/* Top Status & Brand Lockup with generous spacing */}
      <div className="flex flex-col items-center gap-2.5 mb-3 sm:mb-4">
        {/* Top Live Broadcast Status Badge with Equalizer Animation */}
        <div className={`inline-flex items-center gap-2.5 px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase border backdrop-blur-md shadow-lg ${themeStyle.badgeBg}`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          
          {/* Animated sound wave bars */}
          <div className="flex items-center gap-0.5 h-3.5">
            <span className="w-0.5 bg-cyan-400 rounded-full animate-pulse h-2.5" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 bg-cyan-300 rounded-full animate-pulse h-3.5" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 bg-sky-400 rounded-full animate-pulse h-2" style={{ animationDelay: '300ms' }} />
            <span className="w-0.5 bg-blue-400 rounded-full animate-pulse h-3" style={{ animationDelay: '450ms' }} />
          </div>

          <span className="font-mono tracking-wider text-slate-100 font-bold">{state.statusBadge}</span>
        </div>

        {/* Brand Super-title */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-[0.25em] text-cyan-300 uppercase font-mono mt-0.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">UNITY EARNING • E-LEARNING PLATFORM</span>
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </div>
      </div>

      {/* 1. Official Meeting Title with Clear Breathing Room */}
      <h1 className="text-xl sm:text-3xl md:text-[2.35rem] lg:text-[2.65rem] font-black tracking-wider text-white leading-snug sm:leading-tight max-w-5xl font-[var(--font-display)] drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] mb-2.5 sm:mb-3">
        OFFICIAL COUNSELLING MEETING
      </h1>

      {/* Subtle decorative horizontal separator with glowing center */}
      <div className="relative w-56 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent mb-4 sm:mb-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]" />
      </div>

      {/* 2. Main Bengali Announcement Card: Extended Width, 25-30% More Height, Clear Word Spacing */}
      <div className="relative w-full max-w-5xl xl:max-w-6xl my-2 group animate-float-glow">
        {/* Ambient backlight aura */}
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-[2.5rem] blur-xl opacity-75" />

        {/* Outer Frame with solid dark background for max contrast and roomy padding */}
        <div className={`relative w-full bg-[#060b19]/95 border-2 ${themeStyle.border} rounded-[1.8rem] sm:rounded-[2.4rem] p-6 sm:p-9 md:p-11 lg:p-13 min-h-[350px] sm:min-h-[400px] md:min-h-[440px] flex flex-col items-center justify-center shadow-[0_0_60px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-500`}>
          
          {/* Tech Corner Crosshairs */}
          <div className="absolute top-4 left-4 text-cyan-400 text-sm font-mono font-bold select-none">+</div>
          <div className="absolute top-4 right-4 text-cyan-400 text-sm font-mono font-bold select-none">+</div>
          <div className="absolute bottom-4 left-4 text-cyan-400 text-sm font-mono font-bold select-none">+</div>
          <div className="absolute bottom-4 right-4 text-cyan-400 text-sm font-mono font-bold select-none">+</div>

          {/* Vertical laser accent lines */}
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
          <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />

          {/* Decorative badge header above text */}
          <div className="relative z-10 flex items-center justify-center gap-2 mb-4 sm:mb-5">
            <span className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400/50 text-cyan-300 text-xs sm:text-sm font-bold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              অফিসিয়াল ঘোষণা ও দিকনির্দেশনা
            </span>
          </div>

          {/* Main Bengali Headline with Proper Word Separation & Line Height */}
          <h2 className="relative z-10 text-2xl sm:text-3xl md:text-[2.5rem] lg:text-[2.85rem] font-bold sm:font-extrabold text-white bengali-heading leading-[1.4] sm:leading-[1.45] max-w-4xl xl:max-w-5xl mx-auto mb-4 sm:mb-5 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
            {state.bengaliHeadline}
          </h2>

          {/* Solid clean separator with ample vertical margin */}
          <div className="relative z-10 w-44 h-[2px] mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent mb-4 sm:mb-5" />

          {/* Main Bengali Body with Roomy Box, Generous Line-Height and Proper Word Spacing */}
          <div className="w-full relative z-10 bg-slate-950/90 border border-cyan-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 max-w-4xl xl:max-w-5xl mx-auto shadow-lg">
            <p className="text-lg sm:text-2xl md:text-[1.65rem] lg:text-[1.85rem] text-slate-100 font-semibold bengali-body leading-[1.7] sm:leading-[1.8] drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              {state.bengaliBody}
            </p>
          </div>
        </div>
      </div>

      {/* Integrated Subtle Countdown Progress Bar Component */}
      {state.isCountdownActive && (
        <div className="w-full max-w-xl mx-auto mt-4 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md shadow-lg animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              সেশন অগ্রগতি (Time Remaining)
            </span>
            <span className="font-bold text-slate-100">{formatCountdown(remainingSeconds)} বাকি ({Math.round(progressPercent)}%)</span>
          </div>
          
          {/* Progress Bar Track */}
          <div className="relative w-full h-2 rounded-full bg-slate-950/90 overflow-hidden border border-white/10 p-0.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${
                state.theme === 'royal-emerald'
                  ? 'from-emerald-500 to-teal-300'
                  : state.theme === 'deep-violet'
                  ? 'from-purple-500 to-fuchsia-300'
                  : state.theme === 'gold-amber'
                  ? 'from-amber-500 to-yellow-300'
                  : 'from-cyan-500 via-sky-400 to-blue-400'
              } transition-all duration-1000 ease-linear relative shadow-[0_0_12px_rgba(6,182,212,0.8)]`}
              style={{ width: `${progressPercent}%` }}
            >
              {/* Glowing leading edge light */}
              <div className="absolute top-0 right-0 bottom-0 w-2 bg-white rounded-full blur-[1px] shadow-[0_0_8px_#fff]" />
            </div>
          </div>
        </div>
      )}

      {/* Live Stream Assurance & Verification Bar with clean spacing */}
      <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-mono text-slate-300 mb-2">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 shadow-md">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>বর্তমান সময়: <strong className="text-white font-mono text-xs sm:text-sm">{formatTime(currentTime)}</strong></span>
        </div>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 shadow-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-100 font-medium">ভেরিফাইড অফিসিয়াল লাইভ সেশন</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen max-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Top Right Ambient Sound Player Widget */}
      <AmbientSoundPlayer isVisible={state.showAmbientMusicWidget !== false} />

      {/* Persistent Subtle Screen-Edge Progress Bar (Fills up smoothly as meeting timer progresses) */}
      {state.isCountdownActive && (
        <div className="fixed bottom-0 left-0 right-0 z-50 h-1.5 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`h-full bg-gradient-to-r ${
              state.theme === 'royal-emerald'
                ? 'from-emerald-500 via-teal-400 to-green-300'
                : state.theme === 'deep-violet'
                ? 'from-purple-500 via-fuchsia-400 to-indigo-300'
                : state.theme === 'gold-amber'
                ? 'from-amber-500 via-yellow-400 to-orange-300'
                : 'from-cyan-500 via-sky-400 to-blue-400'
            } transition-all duration-1000 ease-linear shadow-[0_0_12px_rgba(6,182,212,0.9)] relative`}
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#fff]" />
          </div>
        </div>
      )}

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
        /* Laptop Device Frame Preview Mode - Perfectly fitted inside viewport without scrolling */
        <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center max-h-[96vh]">
          <div className="relative w-full bg-slate-950 border-[8px] sm:border-[12px] border-slate-800 rounded-t-2xl sm:rounded-t-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden max-h-[82vh] flex items-center justify-center">
            {/* Laptop camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-3 bg-slate-800 rounded-b-lg flex items-center justify-center z-40">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-blue-500/60" />
              </div>
            </div>
            {content}
          </div>
          {/* Laptop Base */}
          <div className="relative h-4 sm:h-5 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-xl mx-auto w-[103%] -ml-[1.5%] shadow-2xl flex items-center justify-center">
            <div className="w-14 h-1 bg-slate-600 rounded-full" />
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
