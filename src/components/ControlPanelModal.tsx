import React from 'react';
import { MeetingState } from '../types';
import { X, Palette, Clock, Type, Sparkles, Monitor, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: MeetingState;
  onChange: (newState: MeetingState) => void;
  onResetToDefault: () => void;
}

export const ControlPanelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  state,
  onChange,
  onResetToDefault,
}) => {
  if (!isOpen) return null;

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b']
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700/60 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-6 border-b border-white/10 pb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">মিটিং স্ক্রিন কন্ট্রোল প্যানেল (Host Settings)</h2>
            <p className="text-xs text-slate-400">স্ক্রিন শেয়ারের ডিজাইন ও বিরতির সময় নিয়ন্ত্রণ করুন</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>কালার থিম নির্বাচন করুন</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'cyber-cyan', name: 'Cyber Cyan (ডিফল্ট)', color: 'from-cyan-500 to-blue-600' },
                { id: 'royal-emerald', name: 'Royal Emerald', color: 'from-emerald-500 to-teal-700' },
                { id: 'deep-violet', name: 'Deep Violet', color: 'from-purple-500 to-indigo-600' },
                { id: 'gold-amber', name: 'Gold Amber', color: 'from-amber-500 to-orange-600' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChange({ ...state, theme: t.id as MeetingState['theme'] })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    state.theme === t.id
                      ? 'border-cyan-400 bg-white/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'border-white/10 bg-black/30 hover:bg-white/5'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${t.color}`} />
                  <span className="text-xs font-medium text-slate-200">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Countdown & Timer Settings */}
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
            <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>কাউন্টডাউন টাইমার (মিনিট বা সেকেন্ড)</span>
              </div>
              <button
                onClick={() => onChange({ ...state, isCountdownActive: !state.isCountdownActive })}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  state.isCountdownActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {state.isCountdownActive ? 'টাইমার চালু' : 'টাইমার বন্ধ'}
              </button>
            </label>

            <div className="flex items-center gap-3">
              {[120, 300, 600, 900].map((sec) => (
                <button
                  key={sec}
                  onClick={() => onChange({ ...state, countdownSeconds: sec, isCountdownActive: true })}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono transition-all border ${
                    state.countdownSeconds === sec && state.isCountdownActive
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {sec / 60} মিনিট
                </button>
              ))}
            </div>
          </div>

          {/* Text Editing */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>স্ক্রিনের টেক্সট পরিবর্তন করুন</span>
            </label>

            <div>
              <span className="text-[11px] text-slate-400 mb-1 block">কোম্পানি / মিটিং টাইটেল</span>
              <input
                type="text"
                value={state.title}
                onChange={(e) => onChange({ ...state, title: e.target.value })}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400 mb-1 block">স্ট্যাটাস ব্যাজ (যেমন: বিরতি চলছে / LIVE)</span>
              <input
                type="text"
                value={state.statusBadge}
                onChange={(e) => onChange({ ...state, statusBadge: e.target.value })}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400 mb-1 block">বাংলা প্রধান বার্তা (হেডলাইন)</span>
              <input
                type="text"
                value={state.bengaliHeadline}
                onChange={(e) => onChange({ ...state, bengaliHeadline: e.target.value })}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400 mb-1 block">বাংলা বিস্তারিত বার্তা (নির্দেশনা)</span>
              <textarea
                rows={3}
                value={state.bengaliBody}
                onChange={(e) => onChange({ ...state, bengaliBody: e.target.value })}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={onResetToDefault}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ডিফল্ট রিস্টোর করুন</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={triggerCelebration}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>কনফেটি অ্যানিমেশন বাজান</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-cyan-500/20"
              >
                স্ক্রিনে ফিরে যান
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
