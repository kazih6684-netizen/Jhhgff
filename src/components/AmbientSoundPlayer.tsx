import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Users, Wind, Sparkles, Radio } from 'lucide-react';

interface AmbientSoundPlayerProps {
  isVisible: boolean;
}

type SoundType = 'none' | 'crowd' | 'nature' | 'piano' | 'cyber';

export const AmbientSoundPlayer: React.FC<AmbientSoundPlayerProps> = ({ isVisible }) => {
  const [activeSound, setActiveSound] = useState<SoundType>('none');
  const [volume, setVolume] = useState<number>(0.35); // Gentle default volume
  const [isOpen, setIsOpen] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<any[]>([]);
  const intervalRef = useRef<number | null>(null);

  // Stop any playing synthesized audio
  const stopAudio = () => {
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

  // Update volume smoothly when slider changes
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      try {
        gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.1);
      } catch (e) {}
    }
  }, [volume]);

  // Clean up on unmount or visibility hidden
  useEffect(() => {
    if (!isVisible && activeSound !== 'none') {
      stopAudio();
      setActiveSound('none');
    }
    return () => stopAudio();
  }, [isVisible]);

  // Generate soothing Web Audio sounds
  const playSound = (type: SoundType) => {
    stopAudio();
    setActiveSound(type);

    if (type === 'none') return;

    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    if (type === 'crowd') {
      // Conference Hall soft ambient buzz / gentle crowd murmur
      // Create filtered pink/brown noise with two slow oscillating filters
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02; // Brown noise approximation
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

      // Subtle slow modulation to simulate conversational cadence
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.3; // 0.3 Hz
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 120;
      lfo.connect(bandpass.frequency);
      lfo.start();

      noiseSource.connect(bandpass);
      bandpass.connect(masterGain);
      noiseSource.start();

      nodesRef.current.push(noiseSource, lfo, bandpass, lfoGain);
    } else if (type === 'nature') {
      // Gentle ocean breeze / forest wind with soft chiming pad
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.4;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 350;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12; // slow wind breeze
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 180;
      lfo.connect(lowpass.frequency);
      lfo.start();

      noise.connect(lowpass);
      lowpass.connect(masterGain);
      noise.start();
      nodesRef.current.push(noise, lowpass, lfo);
    } else if (type === 'piano') {
      // Soft ambient meditation chords (Fmaj7 -> Cmaj7 -> G -> Am drifting)
      const chords = [
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [130.81, 196.0, 246.94, 329.63], // Cmaj7
        [146.83, 196.0, 246.94, 293.66], // G
        [110.0, 164.81, 220.0, 261.63],  // Am
      ];
      let chordIdx = 0;

      const playNextChord = () => {
        if (!audioCtxRef.current || activeSound !== 'piano') return;
        const currentChord = chords[chordIdx];
        chordIdx = (chordIdx + 1) % chords.length;

        currentChord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
          noteGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 2);
          noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 7.5);

          osc.connect(noteGain);
          noteGain.connect(masterGain);
          osc.start();
          osc.stop(ctx.currentTime + 8);
          nodesRef.current.push(osc, noteGain);
        });
      };

      playNextChord();
      const id = window.setInterval(playNextChord, 6500);
      intervalRef.current = id;
    } else if (type === 'cyber') {
      // Deep focus cyber ambient pad (110 Hz + 165 Hz + warm lowpass)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const padGain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.value = 110; // A2
      osc2.type = 'triangle';
      osc2.frequency.value = 165; // E3 (5th)

      padGain.gain.value = 0.22;

      osc1.connect(padGain);
      osc2.connect(padGain);
      padGain.connect(masterGain);

      osc1.start();
      osc2.start();
      nodesRef.current.push(osc1, osc2, padGain);
    }
  };

  if (!isVisible) return null;

  const soundOptions: { id: SoundType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'crowd', label: 'কনফারেন্স হলের গুঞ্জন', icon: <Users className="w-4 h-4 text-cyan-400" />, desc: 'মিটিংয়ের আগে শান্ত ভিড়ের আবহ' },
    { id: 'nature', label: 'প্রকৃতির শান্ত বাতাস', icon: <Wind className="w-4 h-4 text-emerald-400" />, desc: 'স্নিগ্ধ বাতাস ও প্রকৃতির অনুভূতি' },
    { id: 'piano', label: 'শান্ত মেডিটেশন আবহ', icon: <Music className="w-4 h-4 text-purple-400" />, desc: 'মনোযোগ ধরে রাখার নরম ইন্সট্রুমেন্টাল' },
    { id: 'cyber', label: 'ডিপ ফোকাস হাম', icon: <Radio className="w-4 h-4 text-amber-400" />, desc: 'গভীর মনোযোগের সাইবার স্পেস সাউন্ড' },
  ];

  return (
    <div className="fixed top-4 right-4 z-50 select-none">
      {/* Top Right Trigger Button (Discreet & Elegant) */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl backdrop-blur-md border transition-all duration-300 shadow-xl ${
            activeSound !== 'none'
              ? 'bg-cyan-500/25 border-cyan-400/50 text-cyan-300 opacity-95 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse'
              : 'bg-slate-900/80 border-white/15 text-slate-300 opacity-40 hover:opacity-100 hover:bg-slate-800'
          }`}
          title="অ্যাম্বিয়েন্ট মিউজিক / সাউন্ড আবহ"
        >
          {activeSound !== 'none' ? <Volume2 className="w-4 h-4 text-cyan-300" /> : <Music className="w-4 h-4" />}
          <span className="text-xs font-semibold">
            {activeSound === 'none' ? 'সাউন্ড আবহ' : soundOptions.find(o => o.id === activeSound)?.label || 'সাউন্ড বাজছে'}
          </span>
        </button>

        {/* Dropdown Popover */}
        {isOpen && (
          <div className="absolute top-11 right-0 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-left animate-fadeIn">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>শান্ত সাউন্ড আবহ (Ambient)</span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              যে কোনো একটি সাউন্ড নির্বাচন করুন। মিটিংয়ের বিরতি বা অপেক্ষায় এটি স্নিগ্ধ আবহ তৈরি করবে:
            </p>

            <div className="space-y-1.5 mb-4">
              {soundOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => playSound(activeSound === opt.id ? 'none' : opt.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    activeSound === opt.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                      : 'bg-black/30 border-white/5 hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="p-1.5 rounded-lg bg-white/5">
                      {opt.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{opt.label}</div>
                      <div className="text-[10px] text-slate-400">{opt.desc}</div>
                    </div>
                  </div>
                  {activeSound === opt.id && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </button>
              ))}
            </div>

            {/* Volume control & Stop */}
            {activeSound !== 'none' && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>ভলিউম: {Math.round(volume * 100)}%</span>
                  <button
                    onClick={() => playSound('none')}
                    className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                  >
                    <VolumeX className="w-3 h-3" />
                    <span>বন্ধ করুন</span>
                  </button>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
