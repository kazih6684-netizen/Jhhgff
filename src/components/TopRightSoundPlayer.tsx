import React, { useState, useRef, useEffect } from 'react';
import { Volume2, BellRing, Sparkles, Music, Wind, Users, Radio, ChevronDown, Check, VolumeX } from 'lucide-react';
import { playPleasantNotificationSound, PleasantSoundType, isSoundGloballyEnabled } from '../lib/soundGenerator';

import { MeetingMode } from '../types';

interface Props {
  isVisible?: boolean;
  mode?: MeetingMode;
}

export const TopRightSoundPlayer: React.FC<Props> = ({ isVisible = true, mode = 'break' }) => {
  const [selectedChime, setSelectedChime] = useState<PleasantSoundType>('victory');
  const [isPlayingRipple, setIsPlayingRipple] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Ambient sound synthesizer state
  const [activeAmbient, setActiveAmbient] = useState<'none' | 'crowd' | 'nature' | 'piano' | 'cyber'>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.35);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<any[]>([]);
  const intervalRef = useRef<number | null>(null);

  // Stop ambient synthesizer
  const stopAmbient = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    nodesRef.current.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // ignore
      }
    });
    nodesRef.current = [];
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      try {
        gainNodeRef.current.gain.setTargetAtTime(ambientVolume, audioCtxRef.current.currentTime, 0.1);
      } catch (e) {}
    }
  }, [ambientVolume]);

  useEffect(() => {
    return () => stopAmbient();
  }, []);

  const playAmbientSound = (type: 'none' | 'crowd' | 'nature' | 'piano' | 'cyber') => {
    stopAmbient();
    setActiveAmbient(type);
    if (type === 'none') return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = audioCtxRef.current || new AudioCtx();
    audioCtxRef.current = ctx;
    if (ctx.state === 'suspended') ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(ambientVolume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    if (type === 'crowd') {
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 450;
      bandpass.Q.value = 1.2;

      noiseSource.connect(bandpass);
      bandpass.connect(masterGain);
      noiseSource.start();
      nodesRef.current.push(noiseSource, bandpass);
    } else if (type === 'nature') {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.35;
        }
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 320;

      noise.connect(lowpass);
      lowpass.connect(masterGain);
      noise.start();
      nodesRef.current.push(noise, lowpass);
    } else if (type === 'piano') {
      const chords = [
        [174.61, 220.0, 261.63, 329.63],
        [130.81, 196.0, 246.94, 329.63],
        [146.83, 196.0, 246.94, 293.66],
        [110.0, 164.81, 220.0, 261.63],
      ];
      let chordIdx = 0;
      const playNextChord = () => {
        if (!audioCtxRef.current || activeAmbient !== 'piano') return;
        const currentChord = chords[chordIdx];
        chordIdx = (chordIdx + 1) % chords.length;
        currentChord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
          noteGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.8);
          noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 7.0);

          osc.connect(noteGain);
          noteGain.connect(masterGain);
          osc.start();
          osc.stop(ctx.currentTime + 7.5);
          nodesRef.current.push(osc, noteGain);
        });
      };
      playNextChord();
      intervalRef.current = window.setInterval(playNextChord, 6500);
    } else if (type === 'cyber') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const padGain = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.value = 110;
      osc2.type = 'triangle';
      osc2.frequency.value = 165;
      padGain.gain.value = 0.2;
      osc1.connect(padGain);
      osc2.connect(padGain);
      padGain.connect(masterGain);
      osc1.start();
      osc2.start();
      nodesRef.current.push(osc1, osc2, padGain);
    }
  };

  // Immediate Click on Main Sound Button: Play Pleasant Chime!
  const handleMainButtonClick = () => {
    if (!isSoundGloballyEnabled()) {
      setToastMessage('🔇 সাউন্ড বর্তমানে বন্ধ (সেটিংস থেকে চালু করুন)');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }

    playPleasantNotificationSound(selectedChime);
    setIsPlayingRipple(true);
    setToastMessage('🎵 সুন্দর সাউন্ড বাজছে...');
    setShowToast(true);

    setTimeout(() => {
      setIsPlayingRipple(false);
    }, 1200);

    setTimeout(() => {
      setShowToast(false);
    }, 2800);
  };

  if (!isVisible) return null;

  const isSoundOn = isSoundGloballyEnabled();

  const chimeOptions: { id: PleasantSoundType; label: string; desc: string }[] = [
    { id: 'chime', label: 'ক্রিস্টাল কাইম (ডিফল্ট)', desc: 'মিষ্টি অ্যাঞ্জেলিক ৪-টোন হারমনি' },
    { id: 'crystal', label: 'গ্লাস বেল ক্যাসকেড', desc: 'ঝলমলে ক্রিস্টাল বেলের মৃদু রিদম' },
    { id: 'zen', label: 'মেডিটেশন বাটি (Zen)', desc: 'গভীর শান্ত প্রশান্তিদায়ক সুর' },
    { id: 'victory', label: 'সাকসেস ফ্যানফেয়ার', desc: 'উৎসবমুখর সমাপ্তি ও অর্জনের সুর' },
  ];

  return (
    <div className="fixed top-3.5 sm:top-4 right-3.5 sm:right-4 z-50 select-none">
      {/* Toast popup when sound plays */}
      {/* Toast popup when sound plays */}
      {showToast && (
        <div className="absolute right-0 -bottom-10 whitespace-nowrap bg-white/95 border border-blue-400 text-blue-950 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md animate-fadeIn flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Sound Controls Pill */}
      <div
        className={`flex items-center gap-1 bg-white/95 backdrop-blur-xl rounded-full p-1 border border-slate-300 shadow-lg transition-all duration-300 ${
          mode === 'break'
            ? 'hover:border-blue-500'
            : mode === 'ended'
            ? 'hover:border-emerald-500'
            : 'hover:border-blue-500'
        }`}
      >
        {/* Main Instant Sound Play Button */}
        <button
          onClick={handleMainButtonClick}
          title={isSoundOn ? "ক্লিক করলেই মিষ্টি সাউন্ড বাজবে" : "সাউন্ড মিউট করা আছে"}
          className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-200 group active:scale-95 ${
            !isSoundOn
              ? 'bg-slate-100 text-slate-500 border border-slate-200'
              : mode === 'break'
              ? 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200'
              : mode === 'ended'
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200'
          }`}
        >
          {isPlayingRipple && (
            <span
              className={`absolute inset-0 rounded-full animate-ping pointer-events-none ${
                mode === 'break' ? 'bg-blue-400/30' : mode === 'ended' ? 'bg-emerald-400/30' : 'bg-blue-400/30'
              }`}
            />
          )}

          <div className="relative">
            {isSoundOn ? (
              <BellRing
                className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                  mode === 'break' ? 'text-blue-600' : mode === 'ended' ? 'text-emerald-600' : 'text-blue-600'
                } ${isPlayingRipple ? 'animate-bounce' : ''}`}
              />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            {isSoundOn && (
              <span
                className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse ${
                  mode === 'break' ? 'bg-blue-500' : mode === 'ended' ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
              />
            )}
          </div>

          <span className="text-xs font-bold tracking-wide flex items-center gap-1">
            <span>{isSoundOn ? 'সাউন্ড বাজান' : 'নিঃশব্দ (Mute)'}</span>
            {isSoundOn && (
              <Sparkles
                className={`w-3 h-3 ${
                  mode === 'break' ? 'text-blue-600' : mode === 'ended' ? 'text-emerald-600' : 'text-blue-600'
                }`}
              />
            )}
          </span>
        </button>

        {/* Dropdown Toggle for sound tones and ambient music */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          title="সাউন্ড অপশন ও ব্যাকগ্রাউন্ড অ্যাম্বিয়েন্ট"
          className={`p-1.5 rounded-full transition-colors ${
            isDropdownOpen || activeAmbient !== 'none'
              ? 'bg-blue-100 text-blue-700'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu Modal / Popover */}
      {isDropdownOpen && (
        <div className="absolute top-12 right-0 w-72 bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl p-4 shadow-2xl text-left animate-fadeIn z-50 text-slate-100">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>সাউন্ড ও ব্যাকগ্রাউন্ড মিউজিক</span>
            </span>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          {/* Section 1: Choose notification tone */}
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider mb-2">
              মিষ্টি নোটিফিকেশন টোন নির্বাচন করুন
            </div>
            <div className="space-y-1.5">
              {chimeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedChime(opt.id);
                    playPleasantNotificationSound(opt.id);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all border ${
                    selectedChime === opt.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                      : 'bg-black/30 border-white/5 hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold text-slate-100">{opt.label}</div>
                    <div className="text-[10px] text-slate-400">{opt.desc}</div>
                  </div>
                  {selectedChime === opt.id ? (
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Background Ambient (Optional) */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                ব্যাকগ্রাউন্ড অ্যাম্বিয়েন্ট আবহ
              </span>
              {activeAmbient !== 'none' && (
                <button
                  onClick={() => playAmbientSound('none')}
                  className="text-[10px] text-rose-400 hover:underline flex items-center gap-0.5"
                >
                  <VolumeX className="w-3 h-3" />
                  <span>বন্ধ করুন</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {[
                { id: 'piano', label: 'মেডিটেশন পিয়ানো', icon: <Music className="w-3 h-3 text-purple-400" /> },
                { id: 'nature', label: 'শান্ত বাতাস', icon: <Wind className="w-3 h-3 text-emerald-400" /> },
                { id: 'crowd', label: 'কনফারেন্স হল', icon: <Users className="w-3 h-3 text-cyan-400" /> },
                { id: 'cyber', label: 'ডিপ ফোকাস', icon: <Radio className="w-3 h-3 text-amber-400" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => playAmbientSound(activeAmbient === item.id ? 'none' : (item.id as any))}
                  className={`flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-medium border transition-all ${
                    activeAmbient === item.id
                      ? 'bg-cyan-500/25 border-cyan-400 text-white'
                      : 'bg-black/25 border-white/5 hover:bg-white/5 text-slate-300'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            {activeAmbient !== 'none' && (
              <div className="space-y-1 bg-black/40 p-2 rounded-lg border border-white/5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>ভলিউম</span>
                  <span>{Math.round(ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg cursor-pointer accent-cyan-400"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
