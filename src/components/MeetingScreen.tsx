import React, { useState, useEffect, useRef } from 'react';
import { MeetingState, MeetingMode, SessionPart } from '../types';
import {
  Settings,
  Maximize2,
  Clock,
  ShieldCheck,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Plus,
  Radio,
  Award,
  Trophy,
  Mic,
  Monitor,
  Users,
  Headphones,
  Moon,
  Sun,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playPleasantNotificationSound } from '../lib/soundGenerator';

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
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [remainingSeconds, setRemainingSeconds] = useState(state.countdownSeconds || 60);
  const [liveStudioTheme, setLiveStudioTheme] = useState<'deep' | 'bright'>('deep');
  const [isTopControlsVisible, setIsTopControlsVisible] = useState(false);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reveal icons on hover/click and auto-fade after 3.5s idle
  const revealTopControls = () => {
    setIsTopControlsVisible(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      setIsTopControlsVisible(false);
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, []);

  // Sync remaining seconds if parent updates countdownSeconds
  useEffect(() => {
    setRemainingSeconds(state.countdownSeconds || 60);
  }, [state.countdownSeconds]);

  // Real-time clock interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Strictly 1-minute countdown timer (60s -> 0s)
  useEffect(() => {
    if (!state.isCountdownActive || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Play celebratory sound on timeout
          playPleasantNotificationSound('victory');
          confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#2563eb', '#10b981', '#38bdf8', '#ffffff'],
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

  // Add 1-minute increments (strictly 1 min)
  const addCountdownMinutes = (mins = 1) => {
    const added = mins * 60;
    setRemainingSeconds((prev) => {
      const next = Math.max(0, prev + added);
      if (onChange) {
        onChange({ ...state, countdownSeconds: next, isCountdownActive: true });
      }
      return next;
    });
    playPleasantNotificationSound('victory');
  };

  // Reset timer to strictly 1 minute (60s)
  const resetTo1Minute = () => {
    setRemainingSeconds(60);
    if (onChange) {
      onChange({ ...state, countdownSeconds: 60, isCountdownActive: true });
    }
    playPleasantNotificationSound('victory');
  };

  // Party / Confetti animation trigger: SILENT (NO AUDIO) per user request
  const triggerConfettiParty = () => {
    confetti({
      particleCount: 180,
      spread: 95,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#10b981', '#38bdf8', '#059669', '#ffffff'],
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Switch Session Part: "২য় পর্ব শুরু হতে বাকি" vs "৩য় পর্ব শুরু হতে বাকি"
  // Whenever switched, timer strictly resets to 60 seconds (1 minute)!
  const switchSessionPart = (targetPart: SessionPart) => {
    const isPart2 = targetPart === 'part2';
    // Timer ALWAYS resets to 60 seconds and starts counting down
    setRemainingSeconds(60);

    if (onChange) {
      onChange({
        ...state,
        mode: 'break',
        currentPart: targetPart,
        countdownSeconds: 60,
        isCountdownActive: true,
        theme: 'monochrome-clean',
        statusBadge: isPart2 ? '🔴 দ্বিতীয় পর্ব শুরু হতে বাকি • বিরতি চলছে' : '🔴 তৃতীয় পর্ব শুরু হতে বাকি • বিরতি চলছে',
        bengaliHeadline: isPart2
          ? 'দ্বিতীয় পর্ব বিরতি। অনুগ্রহ করে কেউ মিটিং থেকে বের হবে না।'
          : 'তৃতীয় পর্ব বিরতি। অনুগ্রহ করে কেউ মিটিং থেকে বের হবে না।',
        bengaliBody: isPart2
          ? 'খুব শীঘ্রই মিটিংয়ের দ্বিতীয় পর্ব শুরু হবে। দয়া করে সবাই ধৈর্য ধরে মিটিংয়ে যুক্ত থাকুন।'
          : 'খুব শীঘ্রই মিটিংয়ের তৃতীয় পর্ব শুরু হবে। দয়া করে সবাই ধৈর্য ধরে মিটিংয়ে যুক্ত থাকুন।',
      });
    }

    playPleasantNotificationSound('victory');
  };

  // Switch between Live, Break (Part 2 or 3), and Concluded modes
  // Every switch plays the pleasant victory notification chime!
  const handleModeSwitch = (targetMode: MeetingMode, part: SessionPart = 'part2') => {
    if (!onChange) return;

    if (targetMode === 'started') {
      onChange({
        ...state,
        mode: 'started',
        theme: 'cyber-cyan',
        statusBadge: '🔴 LIVE COUNSELLING MEETING • সম্প্রচার চলছে',
        bengaliHeadline: 'আমাদের অফিসিয়াল কাউন্সেলিং মিটিংয়ের দ্বিতীয় পর্ব শুরু হয়েছে!',
        bengaliBody: 'সবাই মনোযোগ সহকারে কাউন্সেলিং মিটিংটি কন্টিনিউ করুন। মিটিং শেষ হলে সম্পূর্ণ কাজ বিস্তারিত বুঝিয়ে দেওয়া হবে।',
        isCountdownActive: false,
      });
      playPleasantNotificationSound('victory');
    } else if (targetMode === 'break') {
      const isPart2 = part === 'part2';
      // Timer ALWAYS resets to 60 seconds whenever switched to Break
      setRemainingSeconds(60);
      onChange({
        ...state,
        mode: 'break',
        currentPart: part,
        theme: 'monochrome-clean',
        statusBadge: isPart2 ? '🔴 দ্বিতীয় পর্ব শুরু হতে বাকি • বিরতি চলছে' : '🔴 তৃতীয় পর্ব শুরু হতে বাকি • বিরতি চলছে',
        bengaliHeadline: isPart2
          ? 'দ্বিতীয় পর্ব বিরতি। অনুগ্রহ করে কেউ মিটিং থেকে বের হবে না।'
          : 'তৃতীয় পর্ব বিরতি। অনুগ্রহ করে কেউ মিটিং থেকে বের হবে না।',
        bengaliBody: isPart2
          ? 'খুব শীঘ্রই মিটিংয়ের দ্বিতীয় পর্ব শুরু হবে। দয়া করে সবাই ধৈর্য ধরে মিটিংয়ে যুক্ত থাকুন।'
          : 'খুব শীঘ্রই মিটিংয়ের তৃতীয় পর্ব শুরু হবে। দয়া করে সবাই ধৈর্য ধরে মিটিংয়ে যুক্ত থাকুন।',
        countdownSeconds: 60, // Strictly 1 minute from start (60 -> 0)
        isCountdownActive: true,
      });
      playPleasantNotificationSound('victory');
    } else if (targetMode === 'ended') {
      onChange({
        ...state,
        mode: 'ended',
        theme: 'royal-emerald',
        statusBadge: 'MEETING CONCLUDED • সফল সমাপ্তি',
        bengaliHeadline: 'আজকের অফিসিয়াল কাউন্সেলিং মিটিং সফলভাবে সমাপ্ত হয়েছে!',
        bengaliBody: 'উপস্থিত থাকার জন্য সকল সম্মানিত সদস্য ও লিডারদের আন্তরিক ধন্যবাদ। পরবর্তী সেশনের আপডেট পেতে আপনার রেফারেন্স লিডারের সাথে যোগাযোগ করুন।',
        isCountdownActive: false,
      });
      playPleasantNotificationSound('victory');
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.55 },
        colors: ['#10b981', '#34d399', '#2563eb', '#38bdf8', '#ffffff'],
      });
    }
  };

  const currentMode = state.mode || 'break';
  const currentPart: SessionPart = state.currentPart || 'part2';

  /* -------------------------------------------------------------------------
   * 1. LIVE MEETING SLIDE (EXECUTIVE ON-AIR BROADCAST STUDIO)
   * Visibly and dramatically DIFFERENT from Break slide!
   * - By default: Deep Sapphire Navy Broadcast Studio with vibrant glows & red ON AIR marquee
   * - Includes 1-click toggle to Bright Studio if host desires
   * - Live Presenter stage card with Active Mic & Screen-sharing badges
   * - Real-time multi-color animated Audio Frequency Visualizer
   * - Live Digital LED Broadcast Clock & Verified Stream Specs
   * ------------------------------------------------------------------------- */
  const renderLiveSlide = () => {
    const isDeep = liveStudioTheme === 'deep';

    return (
      <div
        className={`relative z-10 w-[98%] max-w-[1540px] h-[92vh] max-h-[850px] mx-auto flex flex-col justify-between p-4 sm:p-5 md:p-6 lg:p-7 rounded-3xl overflow-hidden select-none animate-fadeIn transition-all duration-500 ${
          isDeep
            ? 'neu-flat-dark text-white border border-blue-900/40'
            : 'neu-flat-light text-slate-900 border border-white/60'
        }`}
      >
        {/* Pulsing Laser Accent Beams on Left and Right Edges */}
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.9)]" />
        <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-b from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(37,99,235,0.9)]" />

        {/* Architectural Corner Markers with Blinking Beacons */}
        <div className="absolute top-2.5 left-2.5 text-cyan-400 text-xs font-mono select-none flex items-center gap-1">
          <span>+</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        </div>
        <div className="absolute top-2.5 right-2.5 text-cyan-400 text-xs font-mono select-none flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>+</span>
        </div>
        <div className="absolute bottom-2.5 left-2.5 text-cyan-400 text-xs font-mono select-none">+</div>
        <div className="absolute bottom-2.5 right-2.5 text-cyan-400 text-xs font-mono select-none">+</div>

        {/* 
          TOP BROADCAST HEADER:
          1. Brand identity (Neumorphic Extruded badge)
          2. Glowing Red ON-AIR Live Beacon
          3. Live Participant Badge
          4. Quick Studio Style Switcher
        */}
        <div
          className={`relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b ${
            isDeep ? 'border-blue-500/20' : 'border-slate-200/80'
          }`}
        >
          {/* Brand Kicker */}
          <div
            className={`flex items-center gap-2 text-xs sm:text-sm font-bold tracking-[0.22em] uppercase font-mono px-3 py-1.5 rounded-xl border ${
              isDeep
                ? 'neu-raised-sm-dark border-blue-500/20 text-cyan-300'
                : 'neu-raised-sm-light border-white/80 text-blue-900 font-extrabold'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isDeep ? 'text-cyan-400 animate-pulse' : 'text-blue-600'}`} />
            <span>UNITY EARNING • E-LEARNING PLATFORM</span>
          </div>

          {/* Glowing Red ON-AIR Live Beacon Marquee */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border ${
              isDeep
                ? 'neu-convex-dark border-red-500/60 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                : 'neu-convex-light border-red-400/50 text-red-700 shadow-sm'
            } animate-pulse`}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
            <span className="font-mono tracking-widest font-black">
              🔴 ON AIR • সরাসরি সম্প্রচার চলছে • LIVE SESSION
            </span>
          </div>

          {/* Right Header Controls: Participant Count & Studio Style Switcher */}
          <div className="flex items-center gap-2">
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold border ${
                isDeep
                  ? 'neu-inset-dark border-blue-500/20 text-blue-200'
                  : 'neu-inset-light border-white/60 text-blue-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>৩৫০+ সদস্য সংযুক্ত</span>
            </div>

            {/* Quick Live Studio Theme Toggle */}
            <button
              onClick={() => setLiveStudioTheme(isDeep ? 'bright' : 'deep')}
              title={isDeep ? 'ব্রাইট স্টুডিও মোডে দেখুন' : 'ডিপ স্টুডিও মোডে দেখুন'}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${
                isDeep
                  ? 'neu-btn-dark active:neu-btn-dark-active text-cyan-300 border-cyan-400/30'
                  : 'neu-btn-light active:neu-btn-light-active text-slate-800 border-white/70'
              }`}
            >
              {isDeep ? <Sun className="w-3 h-3 text-amber-300" /> : <Moon className="w-3 h-3 text-blue-600" />}
              <span>{isDeep ? 'ডিপ স্টুডিও' : 'ব্রাইট স্টুডিও'}</span>
            </button>
          </div>
        </div>

        {/* 
          CENTER PRESENTATION STAGE:
          Unmistakably distinct from Break Slide!
          - High-Impact Bengali Headline
          - Live Stage & Presenter Card with Speaker & Screen Sharing Badges
          - Polished Instruction Card for Participants
        */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-2 sm:py-3 px-2 max-w-5xl mx-auto w-full">
          {/* Prominent Broadcast Category Pill */}
          <div
            className={`inline-flex items-center gap-2.5 px-4 sm:px-5 py-1.5 rounded-full border text-xs sm:text-sm font-mono font-bold uppercase tracking-wider mb-3 shadow-md ${
              isDeep
                ? 'bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border-cyan-400/50 text-cyan-200'
                : 'bg-gradient-to-r from-blue-100 to-sky-100 border-blue-300 text-blue-950'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>অফিসিয়াল লাইভ সেশন • ২য় পর্ব সম্প্রচার শুরু হয়েছে</span>
          </div>

          {/* Giant Bengali Headline: High-Visibility Broadcast Typography */}
          <h1
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-[3.1rem] font-black tracking-tight bengali-heading leading-[1.3] mb-3.5 transition-colors ${
              isDeep
                ? 'text-white drop-shadow-[0_4px_25px_rgba(56,189,248,0.4)]'
                : 'text-slate-950 drop-shadow-sm'
            }`}
          >
            {state.bengaliHeadline || 'আমাদের অফিসিয়াল কাউন্সেলিং মিটিংয়ের দ্বিতীয় পর্ব শুরু হয়েছে!'}
          </h1>

          {/* Electric Divider Line */}
          <div
            className={`w-56 sm:w-72 h-1 rounded-full mb-3.5 shadow-sm ${
              isDeep
                ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)]'
                : 'bg-gradient-to-r from-transparent via-blue-600 to-transparent'
            }`}
          />

          {/* 
            LIVE SPEAKER & COUNSELING STAGE CARD:
            A dedicated live broadcast presentation stage!
          */}
          <div
            className={`w-full rounded-2xl p-4 sm:p-5 shadow-xl border transition-all ${
              isDeep
                ? 'bg-[#0e1933]/90 border-blue-500/40 text-blue-100 shadow-[0_10px_35px_rgba(2,6,23,0.6)]'
                : 'bg-gradient-to-b from-blue-50/90 to-slate-50/90 border-blue-300 text-slate-900'
            }`}
          >
            {/* Stage Credentials Header */}
            <div
              className={`flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b text-xs sm:text-sm font-semibold ${
                isDeep ? 'border-blue-500/20 text-cyan-300' : 'border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 shadow-sm">
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <span>প্রধান বক্তা ও কাউন্সেলর প্যানেল: সরাসরি সংযুক্ত আছেন</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className={isDeep ? 'text-emerald-300' : 'text-emerald-700'}>
                  স্ক্রিন শেয়ার ও প্রেজেন্টেশন লাইভ
                </span>
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
              </div>
            </div>

            {/* Bengali Body Text */}
            <p
              className={`text-base sm:text-xl md:text-[1.45rem] font-semibold bengali-body leading-[1.65] mb-3.5 ${
                isDeep ? 'text-slate-100' : 'text-slate-800'
              }`}
            >
              {state.bengaliBody ||
                'সবাই মনোযোগ সহকারে কাউন্সেলিং মিটিংটি কন্টিনিউ করুন। মিটিং শেষ হলে সম্পূর্ণ কাজ বিস্তারিত বুঝিয়ে দেওয়া হবে।'}
            </p>

            {/* 3 Important Participant Tips Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  isDeep
                    ? 'bg-blue-950/60 border-blue-500/30 text-blue-200'
                    : 'bg-white border-blue-200 text-blue-900 shadow-sm'
                }`}
              >
                <Headphones className="w-3 h-3 text-cyan-400" />
                <span>হেডফোন ব্যবহারে স্পষ্ট সাউন্ড পাবেন</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  isDeep
                    ? 'bg-blue-950/60 border-blue-500/30 text-blue-200'
                    : 'bg-white border-blue-200 text-blue-900 shadow-sm'
                }`}
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>প্রয়োজনীয় তথ্য ও পয়েন্ট নোট রাখুন</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  isDeep
                    ? 'bg-blue-950/60 border-blue-500/30 text-blue-200'
                    : 'bg-white border-blue-200 text-blue-900 shadow-sm'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>ভেরিফাইড অফিসিয়াল প্ল্যাটফর্ম</span>
              </span>
            </div>
          </div>
        </div>

        {/* 
          LOWER DECK: 2-Column Broadcast Control Deck
          - Column 1: Multi-band Animated Live Audio Equalizer (Cyan, Royal Blue, Emerald)
          - Column 2: 1080p Stream Specs & Real-Time Digital Broadcast LED Clock
        */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full pt-1.5">
          {/* Deck 1: Live Audio Equalizer */}
          <div
            className={`rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-sm border ${
              isDeep
                ? 'bg-[#0c162d]/90 border-blue-500/30 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 shadow-md">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className={`text-xs font-bold ${isDeep ? 'text-white' : 'text-slate-900'}`}>
                  লাইভ অডিও স্ট্রিমিং চ্যানেল
                </div>
                <div className={`text-[11px] ${isDeep ? 'text-blue-200' : 'text-slate-600'}`}>
                  স্টুডিও সাউন্ড চ্যানেল ১ সচল • HD অডিও ক্লিয়ার
                </div>
              </div>
            </div>

            {/* Dynamic Equalizer Waveform Bars */}
            <div className="flex items-end gap-1 h-8 shrink-0 pr-2">
              {[14, 26, 12, 22, 30, 16, 24, 18, 28, 14, 25, 15, 27, 20, 32, 18].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-gradient-to-t from-blue-600 via-cyan-400 to-emerald-400 rounded-full"
                  style={{
                    height: `${h}px`,
                    animation: 'waveBar 1.3s ease-in-out infinite',
                    animationDelay: `${i * 90}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Deck 2: Live Stream Verification & Real-Time Clock */}
          <div
            className={`rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-sm border ${
              isDeep
                ? 'bg-[#0c162d]/90 border-blue-500/30 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className={`text-xs font-bold ${isDeep ? 'text-white' : 'text-slate-900'}`}>
                  ভেরিফাইড অফিসিয়াল লাইভ সেশন
                </div>
                <div className={`text-[11px] ${isDeep ? 'text-blue-200' : 'text-slate-600'}`}>
                  1080p Ultra HD সুরক্ষিত এনক্রিপ্টেড ব্রডকাস্ট
                </div>
              </div>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold shadow-sm ${
                isDeep
                  ? 'bg-blue-950/80 border-cyan-400/40 text-cyan-300'
                  : 'bg-white border-slate-300 text-blue-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------------------
   * 2. BREAK / INTERMISSION SLIDE (CRISP WHITE PRESENTATION CARD)
   * Top Notice: Placed HIGHER UP with prominent executive banner:
   * "জরুরি অফিসিয়াল নোটিশ : প্রথম পর্ব বিরতি (দ্বিতীয় পর্ব শুরু হতে বাকি)"
   * Headline: HUGE bold Black typography:
   * "অনুরোধ করে কেউ মিটিং থেকে বের হবেন না।"
   * Subtitle:
   * "খুব শীঘ্রই দ্বিতীয় পর্ব শুরু হবে।"
   * Timer: Strictly 1-minute countdown timer (60s -> 0s)
   * ------------------------------------------------------------------------- */
  const renderBreakSlide = () => {
    const isPart2 = currentPart === 'part2';

    return (
      <div className="relative z-10 w-[98%] max-w-[1540px] h-[92vh] max-h-[850px] mx-auto flex flex-col justify-between p-4 sm:p-5 md:p-6 lg:p-7 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.14),0_0_40px_rgba(37,99,235,0.1)] overflow-hidden select-none animate-fadeIn text-slate-900">
        {/* Subtle Architectural Corner Markers in Blue */}
        <div className="absolute top-2.5 left-2.5 text-blue-600 text-xs font-mono select-none flex items-center gap-1">
          <span>+</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600/80 animate-ping" />
        </div>
        <div className="absolute top-2.5 right-2.5 text-blue-600 text-xs font-mono select-none flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600/80 animate-ping" />
          <span>+</span>
        </div>
        <div className="absolute bottom-2.5 left-2.5 text-blue-600 text-xs font-mono select-none">+</div>
        <div className="absolute bottom-2.5 right-2.5 text-blue-600 text-xs font-mono select-none">+</div>

        {/* 
          TOP HEADER:
          Notice placed neatly at the top with part switcher tabs & status pill
        */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-[0.2em] text-blue-800 uppercase font-mono">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>UNITY EARNING • E-LEARNING PLATFORM</span>
          </div>

          {/* Quick Part Switcher Tabs (২য় পর্ব vs ৩য় পর্ব) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-300 shadow-inner">
            <button
              onClick={() => switchSessionPart('part2')}
              title="২য় পর্ব বিরতি ও কাউন্টডাউন শুরু করুন"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                isPart2
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPart2 ? 'bg-white animate-pulse' : 'bg-blue-500'}`} />
              <span>২য় পর্ব শুরু হতে বাকি</span>
            </button>

            <button
              onClick={() => switchSessionPart('part3')}
              title="৩য় পর্ব বিরতি ও কাউন্টডাউন শুরু করুন"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                !isPart2
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${!isPart2 ? 'bg-white animate-pulse' : 'bg-blue-500'}`} />
              <span>৩য় পর্ব শুরু হতে বাকি</span>
            </button>
          </div>

          {/* Break Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border border-blue-200 bg-blue-50 text-blue-800 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <span className="font-mono text-blue-900 font-extrabold">{state.statusBadge || '🔴 সেশন বিরতি চলছে'}</span>
          </div>
        </div>

        {/* 
          SLIDE CENTER MESSAGE:
          1. Official Notice Badge Placed HIGHER UP
          2. UNIFIED LARGE HERO HEADLINE (বড় করে লেখা থাকবে):
             Line 1: "দ্বিতীয় পর্ব বিরতি : অনুরোধ করে কেউ মিটিং থেকে বের হবেন না।"
             Line 2: "খুব শীঘ্রই মিটিংয়ের দ্বিতীয় পর্ব শুরু হবে।"
             (Both together at the top in large text, NOT separated into a bottom card!)
          3. Polite guidance reassurance note
        */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-1 sm:py-2 px-2 max-w-5xl mx-auto w-full">
          {/* Official Notice Banner: Placed Higher Up */}
          <div className="w-full flex justify-center mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-2.5 px-4 sm:px-6 py-2 rounded-full bg-gradient-to-r from-blue-50 via-sky-50 to-emerald-50 border-2 border-blue-300 text-blue-950 shadow-sm text-xs sm:text-sm md:text-base font-bold font-mono tracking-wide">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-80" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600" />
              </span>
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-extrabold text-blue-900 shrink-0">জরুরি অফিসিয়াল নোটিশ :</span>
              <span className="text-slate-950 font-black">
                {isPart2 ? 'প্রথম পর্ব বিরতি (দ্বিতীয় পর্ব শুরু হতে বাকি)' : 'দ্বিতীয় পর্ব বিরতি (তৃতীয় পর্ব শুরু হতে বাকি)'}
              </span>
            </div>
          </div>

          {/* 
            GRAND UNIFIED HERO ANNOUNCEMENT:
            User instruction:
            "দ্বিতীয় পর্ব বিরতি অনুরোধ করে কেউ মিটিং থেকে বের হবেন না। খুব শীঘ্রই মিটিংয়ের দ্বিতীয় পর্ব শুরু হবে। এই পুরো লেখাটা বড় করে লেখা থাকবে। নিচে খুব শীঘ্রই দ্বিতীয় পর্ব শুরু হবে এটা নিচে লেখা, এটা উপরের লেখার সাথেই হবে।"
          */}
          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.35rem] font-black tracking-tight text-slate-950 bengali-heading leading-[1.25] drop-shadow-sm">
              {state.bengaliHeadline && !state.bengaliHeadline.includes('অনুরোধ')
                ? state.bengaliHeadline
                : (isPart2
                  ? 'দ্বিতীয় পর্ব বিরতি। অনুগ্রহ করে কেউ মিটিং থেকে বের হবে না।'
                  : 'তৃতীয় পর্ব বিরতি। অনুগ্রহ করে কেউ মিটিং থেকে বের হবে না।')}
            </h1>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-black tracking-tight text-blue-700 bengali-heading leading-[1.25]">
              {isPart2
                ? 'খুব শীঘ্রই মিটিংয়ের দ্বিতীয় পর্ব শুরু হবে।'
                : 'খুব শীঘ্রই মিটিংয়ের তৃতীয় পর্ব শুরু হবে।'}
            </h2>
          </div>

          <div className="w-48 sm:w-64 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent rounded-full mb-3" />

          {/* Polite guidance note right with the headline */}
          <div className="max-w-3xl mx-auto px-5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl sm:rounded-2xl text-center shadow-sm">
            <p className="text-sm sm:text-base md:text-lg text-slate-700 font-semibold bengali-body leading-relaxed">
              দয়া করে সবাই ধৈর্য ধরে মিটিংয়ে যুক্ত থাকুন। অধিবেশন শুরু হলে পরবর্তী দিকনির্দেশনা ও কাজ বিস্তারিত বুঝিয়ে দেওয়া হবে।
            </p>
          </div>
        </div>

        {/* 
          SLIDE LOWER DECK:
          Col 1: Strictly 1-Minute Countdown Timer (resets to 60s each time switched)
          Col 2: Royal Blue & Emerald Green Visualizer & Broadcast Signal Status
        */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full pt-1.5">
          {/* Left Column: 1-Minute Countdown Timer Deck */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-800 font-bold">
                <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>{isPart2 ? 'দ্বিতীয়' : 'তৃতীয়'} পর্ব শুরু হতে বাকি (Time Remaining)</span>
              </div>

              {/* Host Quick Controls: strictly 1-min increments */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => addCountdownMinutes(1)}
                  className="px-2.5 py-1 rounded-md bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-900 text-[11px] font-bold font-mono transition-colors flex items-center gap-0.5 active:scale-95"
                  title="১ মিনিট যোগ করুন"
                >
                  <Plus className="w-2.5 h-2.5" /> ১ মিনিট
                </button>
                <button
                  onClick={resetTo1Minute}
                  className="px-2.5 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold font-mono transition-colors flex items-center gap-0.5 active:scale-95"
                  title="১ মিনিটে রিসেট করুন"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> রিসেট (১ মি.)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Bold Black Digital Countdown Clock */}
              <div className="text-3xl sm:text-4xl lg:text-[2.6rem] font-mono font-black text-slate-950 tracking-widest drop-shadow-sm">
                {formatCountdown(remainingSeconds)}
              </div>

              {/* Smooth 1-Minute Progress Bar */}
              <div className="flex-1">
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-300">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 transition-all duration-1000 ease-linear shadow-sm"
                    style={{ width: `${Math.max(0, Math.min(100, (remainingSeconds / 60) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-600 font-medium mt-1">
                  <span>১ মিনিট কাউন্টডাউন (৬০ সে.)</span>
                  <span className="font-bold text-blue-700">{remainingSeconds <= 0 ? 'সময় সমাপ্ত' : 'চলছে'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Royal Blue & Emerald Visualizer & Signal Specs */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-800 font-bold tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span>লাইভ ব্রডকাস্ট সংযোগ সক্রিয় • অধিবেশন অব্যাহত</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700 font-bold">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{formatTime(currentTime)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Dancing Equalizer Waveform Bars (Blue & Green) */}
              <div className="flex items-end gap-1 h-9 flex-1 py-0.5">
                {[
                  16, 24, 32, 14, 26, 36, 18, 30, 15, 22,
                  34, 20, 28, 16, 33, 26, 14, 24, 36, 18,
                  29, 15, 25, 34
                ].map((height, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-full bg-gradient-to-t from-blue-700 via-blue-500 to-emerald-400"
                    style={{
                      height: `${height}px`,
                      animation: 'waveBar 1.5s ease-in-out infinite',
                      animationDelay: `${(i * 65) % 1100}ms`,
                    }}
                  />
                ))}
              </div>

              <div className="text-right text-[11px] font-mono text-slate-700 shrink-0 font-bold">
                <div className="flex items-center gap-1 justify-end text-blue-800">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>1080p Ultra HD</span>
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">● ভেরিফাইড অফিসিয়াল বিরতি</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------------------
   * 3. CONCLUDED SLIDE (WHITE EXECUTIVE PRESENTATION CARD)
   * ------------------------------------------------------------------------- */
  const renderEndedSlide = () => (
    <div className="relative z-10 w-[98%] max-w-[1540px] h-[92vh] max-h-[850px] mx-auto flex flex-col justify-between p-4 sm:p-5 md:p-6 lg:p-7 bg-white border border-emerald-300 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.14),0_0_40px_rgba(16,185,129,0.12)] overflow-hidden select-none animate-fadeIn text-slate-900">
      {/* Laser Accent Beams in Emerald */}
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-emerald-500 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
      <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-emerald-500 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.8)]" />

      {/* Tech Corner Stars */}
      <div className="absolute top-2.5 left-2.5 text-emerald-600 text-xs font-mono select-none">✦</div>
      <div className="absolute top-2.5 right-2.5 text-emerald-600 text-xs font-mono select-none">✦</div>
      <div className="absolute bottom-2.5 left-2.5 text-emerald-600 text-xs font-mono select-none">✦</div>
      <div className="absolute bottom-2.5 right-2.5 text-emerald-600 text-xs font-mono select-none">✦</div>

      {/* SLIDE TOP HEADER */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200 pb-2.5">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-[0.24em] text-emerald-800 uppercase font-mono">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>UNITY EARNING • OFFICIAL CEREMONY & WRAP-UP</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
          <span className="font-mono text-emerald-950 font-bold">{state.statusBadge || 'MEETING CONCLUDED • সফল সমাপ্তি'}</span>
        </div>
      </div>

      {/* SLIDE CENTER MESSAGE */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-2 sm:py-3 px-2 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-mono uppercase font-bold tracking-wider mb-2.5 shadow-sm">
          <span>🏆 সফল সমাপ্তি • SESSION CONCLUDED SUCCESSFULLY</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.85rem] font-black tracking-tight text-slate-950 bengali-heading leading-[1.3] drop-shadow-sm mb-3">
          {state.bengaliHeadline || 'আজকের অফিসিয়াল কাউন্সেলিং মিটিং সফলভাবে সমাপ্ত হয়েছে!'}
        </h1>

        <div className="w-44 sm:w-60 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full mb-3.5" />

        {/* Bengali Body */}
        <div className="w-full bg-emerald-50/70 border border-emerald-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-base sm:text-xl md:text-[1.35rem] text-slate-800 font-semibold bengali-body leading-[1.65]">
            {state.bengaliBody ||
              'উপস্থিত থাকার জন্য সকল সম্মানিত সদস্য ও লিডারদের আন্তরিক ধন্যবাদ। পরবর্তী সেশনের আপডেট পেতে আপনার রেফারেন্স লিডারের সাথে যোগাযোগ করুন।'}
          </p>
        </div>
      </div>

      {/* SLIDE LOWER DECK */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full pt-1.5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">সকল আলোচ্যসূচি সম্পন্ন</div>
              <div className="text-[11px] text-slate-600">রেকর্ডিং ও অফিসিয়াল ফাইল সংরক্ষিত</div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700">100% COMPLETE</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">পরবর্তী ধাপ ও অ্যাকশন প্ল্যান</div>
              <div className="text-[11px] text-slate-600">রেফারেন্স লিডারের সাথে যোগাযোগ করুন</div>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono text-emerald-800 shadow-sm font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const isDark = currentMode === 'started';

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* 
        TOP RIGHT CORNER:
        Strictly a small settings icon in the top right corner.
        NO white background box or pill (bg-transparent, border-0, shadow-none).
        Invisible by default; reveals subtly on hover/click/focus ("আইকনগুলা ইনভিজিবল থাকবে। ক্লিক করলে একটু ভিজিবল হবে আরকি এরকম।").
      */}
      <div
        className={`fixed top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-50 transition-opacity duration-300 ${
          isTopControlsVisible ? 'opacity-70' : 'opacity-0 hover:opacity-70 focus-within:opacity-70 active:opacity-100'
        }`}
      >
        <button
          onClick={() => {
            revealTopControls();
            onOpenSettings();
          }}
          title="সেটিংস (Settings)"
          className={`p-2 bg-transparent border-0 outline-none shadow-none transition-all active:scale-95 flex items-center justify-center group ${
            isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
          }`}
        >
          <Settings className="w-4 h-4 transition-transform duration-500 group-hover:rotate-90" />
        </button>
      </div>

      {/* 
        TOP-LEFT MICRO DOCK:
        - Only bare icons (NO text, NO white container background, NO white border, NO shadow).
        - Invisible by default; slightly visible on hover or click ("আইকনগুলা ইনভিজিবল থাকবে। ক্লিক করলে একটু ভিজিবল হবে আরকি এরকম।").
        - Fully transparent background in both dark and light modes so black mode NEVER shows white behind icons.
      */}
      <div
        className={`fixed top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-50 flex items-center gap-1.5 bg-transparent border-0 outline-none p-1 transition-opacity duration-300 ${
          isTopControlsVisible ? 'opacity-70' : 'opacity-0 hover:opacity-70 focus-within:opacity-70 active:opacity-100'
        }`}
      >
        {/* Mode 1: Live */}
        <button
          onClick={() => {
            revealTopControls();
            handleModeSwitch('started');
          }}
          title="লাইভ সেশন"
          className={`p-1.5 bg-transparent border-0 outline-none transition-all ${
            currentMode === 'started'
              ? isDark
                ? 'text-cyan-400 scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                : 'text-blue-600 scale-110'
              : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
        </button>

        {/* Mode 2: Break Part 2 */}
        <button
          onClick={() => {
            revealTopControls();
            handleModeSwitch('break', 'part2');
          }}
          title="২য় পর্ব বিরতি"
          className={`p-1.5 bg-transparent border-0 outline-none transition-all ${
            currentMode === 'break' && currentPart === 'part2'
              ? isDark
                ? 'text-cyan-400 scale-110'
                : 'text-blue-600 scale-110'
              : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
        </button>

        {/* Mode 3: Break Part 3 */}
        <button
          onClick={() => {
            revealTopControls();
            handleModeSwitch('break', 'part3');
          }}
          title="৩য় পর্ব বিরতি"
          className={`p-1.5 bg-transparent border-0 outline-none transition-all ${
            currentMode === 'break' && currentPart === 'part3'
              ? isDark
                ? 'text-cyan-400 scale-110'
                : 'text-blue-600 scale-110'
              : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Mode 4: Concluded */}
        <button
          onClick={() => {
            revealTopControls();
            handleModeSwitch('ended');
          }}
          title="সমাপ্তি"
          className={`p-1.5 bg-transparent border-0 outline-none transition-all ${
            currentMode === 'ended'
              ? 'text-emerald-500 scale-110'
              : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>

        {/* Confetti party trigger: SILENT (NO AUDIO) */}
        <button
          onClick={() => {
            revealTopControls();
            triggerConfettiParty();
          }}
          title="সেলিব্রーション কনফেটি (নিঃশব্দ)"
          className={`p-1.5 bg-transparent border-0 outline-none transition-all ${
            isDark ? 'text-amber-300 hover:text-white' : 'text-amber-500 hover:text-amber-600'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Main Presentation Viewport */}
      {currentMode === 'break'
        ? renderBreakSlide()
        : currentMode === 'ended'
        ? renderEndedSlide()
        : renderLiveSlide()}

      {/* Bottom Left Host Controls: Fullscreen toggle */}
      <div
        className={`fixed bottom-2.5 left-2.5 z-40 transition-opacity duration-300 ${
          isTopControlsVisible ? 'opacity-70' : 'opacity-0 hover:opacity-70 focus-within:opacity-70 active:opacity-100'
        }`}
      >
        <button
          onClick={() => {
            revealTopControls();
            toggleFullscreen();
          }}
          title="ফুল-স্ক্রিন মোড"
          className={`p-1 bg-transparent border-0 outline-none transition-all ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
