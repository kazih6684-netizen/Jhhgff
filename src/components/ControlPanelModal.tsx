import React from 'react';
import { MeetingState } from '../types';
import { X, Palette, Clock, Type, Sparkles, Monitor, RotateCcw, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { setSoundGloballyEnabled, isSoundGloballyEnabled } from '../lib/soundGenerator';

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

  // Silent celebration - zero audio per user request
  const triggerCelebration = () => {
    confetti({
      particleCount: 150,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#10b981', '#38bdf8', '#059669', '#ffffff']
    });
  };

  const isSoundActive = state.soundEnabled !== undefined ? state.soundEnabled : isSoundGloballyEnabled();

  const handleSoundToggle = (enable: boolean) => {
    setSoundGloballyEnabled(enable);
    onChange({ ...state, soundEnabled: enable });
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">মিটিং স্ক্রিন কন্ট্রোল প্যানেল (Host Settings)</h2>
            <p className="text-xs text-slate-400">স্ক্রিন শেয়ারের ডিজাইন, সাউন্ড ও বিরতির সময় নিয়ন্ত্রণ করুন</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Permanent Sound Mute / Unmute Setting */}
          <div className="bg-black/40 border border-blue-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                isSoundActive ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-red-500/20 text-red-400 border-red-500/40'
              }`}>
                {isSoundActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>সাউন্ড ও নোটিফিকেশন আওয়াজ</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isSoundActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}>
                    {isSoundActive ? 'সক্রিয় (ON)' : 'স্থায়ীভাবে বন্ধ (OFF)'}
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  অ্যাপ্লিকেশনের সকল নোটিফিকেশন, বিজয় ফ্যানফেয়ার ও সুইচিং সাউন্ড এক ক্লিকে পার্মানেন্ট বন্ধ বা চালু রাখুন।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => handleSoundToggle(true)}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  isSoundActive
                    ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                    : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'
                }`}
              >
                সাউন্ড চালু (ON)
              </button>
              <button
                onClick={() => handleSoundToggle(false)}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  !isSoundActive
                    ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                    : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'
                }`}
              >
                সম্পূর্ণ বন্ধ (OFF)
              </button>
            </div>
          </div>

          {/* Meeting Mode Switcher */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>মিটিং মোড ও স্ক্রিন ফরম্যাট (Meeting Mode)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'started',
                  title: '🔵 লাইভ সেশন (ডিফারেন্ট ব্রডকাস্ট স্টুডিও)',
                  desc: 'অন-এয়ার লাইভ স্টুডিও, স্পিকার স্টেজ, অডিও ফ্রিকোয়েন্সি ভিজ্যুয়ালাইজার ও ব্রডকাস্ট ক্লক',
                  theme: 'cyber-cyan',
                  headline: 'আমাদের অফিসিয়াল কাউন্সেলিং মিটিংয়ের দ্বিতীয় পর্ব শুরু হয়েছে!',
                  body: 'সবাই মনোযোগ সহকারে কাউন্সেলিং মিটিংটি কন্টিনিউ করুন। মিটিং শেষ হলে সম্পূর্ণ কাজ বিস্তারিত বুঝিয়ে দেওয়া হবে।',
                  badge: '🔴 LIVE COUNSELLING MEETING • সম্প্রচার চলছে',
                },
                {
                  id: 'break',
                  title: '⚪ পর্ব বিরতি (হোয়াইট ইন্টারমিশন)',
                  desc: 'সাদা ব্যাকগ্রাউন্ড, জরুরি নোটিশ ও ১ মিনিট অটো-রিসেট টাইমার',
                  theme: 'monochrome-clean',
                  headline: 'দ্বিতীয় পর্ব বিরতি। অনুগ্রহ করে কেউ মিটিং থেকে বের হবে না।',
                  body: 'খুব শীঘ্রই মিটিংয়ের দ্বিতীয় পর্ব শুরু হবে। দয়া করে সবাই ধৈর্য ধরে মিটিংয়ে যুক্ত থাকুন।',
                  badge: '🔴 দ্বিতীয় পর্ব শুরু হতে বাকি • বিরতি চলছে',
                },
                {
                  id: 'ended',
                  title: '🟢 সফল সমাপ্তি পেজ',
                  desc: 'ডিপ মোড, গোল্ড-এমারেল্ড বিজয় মেডেল ও ৩টি পরবর্তী করণীয় ধাপ',
                  theme: 'royal-emerald',
                  headline: 'আজকের অফিসিয়াল কাউন্সেলিং মিটিং সফলভাবে সমাপ্ত হয়েছে!',
                  body: 'উপস্থিত থাকার জন্য সকল সম্মানিত সদস্য ও লিডারদের আন্তরিক ধন্যবাদ। পরবর্তী সেশনের আপডেট পেতে আপনার রেফারেন্স লিডারের সাথে যোগাযোগ করুন।',
                  badge: 'MEETING CONCLUDED • সফল সমাপ্তি',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() =>
                    onChange({
                      ...state,
                      mode: m.id as any,
                      theme: m.theme as any,
                      statusBadge: m.badge,
                      bengaliHeadline: m.headline,
                      bengaliBody: m.body,
                    })
                  }
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    (state.mode || 'break') === m.id
                      ? 'border-blue-400 bg-blue-500/15 shadow-[0_0_20px_rgba(37,99,235,0.25)]'
                      : 'border-white/10 bg-black/30 hover:bg-white/5'
                  }`}
                >
                  <div className="text-xs font-bold text-white mb-1">{m.title}</div>
                  <div className="text-[11px] text-slate-300 leading-snug">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <Palette className="w-4 h-4 text-blue-400" />
              <span>কালার প্যালেট (কালো, সাদা, সবুজ ও নীল)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'monochrome-clean', name: 'White & Black (বিরতি)', color: 'from-slate-100 to-slate-300 border-2 border-white' },
                { id: 'cyber-cyan', name: 'Deep Cyber Blue (লাইভ)', color: 'from-blue-600 to-cyan-500' },
                { id: 'royal-emerald', name: 'Royal Emerald (সবুজ)', color: 'from-emerald-500 to-teal-700' },
                { id: 'cobalt-sapphire', name: 'Cobalt Sapphire (নীল)', color: 'from-blue-700 to-indigo-700' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChange({ ...state, theme: t.id as MeetingState['theme'] })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    state.theme === t.id
                      ? 'border-blue-400 bg-white/10 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
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

          {/* Ambient Music Widget Toggle */}
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">অ্যাম্বিয়েন্ট মিউজিক বাটন (ডানপাশে উপরে)</h4>
                <p className="text-[11px] text-slate-400">স্ক্রিনের উপরে ডানপাশে শান্ত আবহ বা ভিড়ের সাউন্ড অপশন দেখাবে কিনা</p>
              </div>
            </div>
            <button
              onClick={() => onChange({ ...state, showAmbientMusicWidget: !(state.showAmbientMusicWidget !== false) })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                state.showAmbientMusicWidget !== false
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700'
              }`}
            >
              {state.showAmbientMusicWidget !== false ? 'চালু আছে (ON)' : 'বন্ধ আছে (OFF)'}
            </button>
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
