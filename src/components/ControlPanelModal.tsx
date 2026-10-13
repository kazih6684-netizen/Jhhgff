import React, { useState, useEffect } from 'react';
import { MeetingState } from '../types';
import { X, Palette, Clock, Type, Sparkles, Monitor, RotateCcw, Volume2, VolumeX, Check } from 'lucide-react';
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
  const [localState, setLocalState] = useState<MeetingState>(state);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalState(state);
      setSavedSuccess(false);
    }
  }, [isOpen, state]);

  if (!isOpen) return null;

  const handleSave = () => {
    onChange(localState);
    setSavedSuccess(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#10b981', '#ffffff']
    });
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const isSoundActive = localState.soundEnabled !== undefined ? localState.soundEnabled : isSoundGloballyEnabled();

  const handleSoundToggle = (enable: boolean) => {
    setSoundGloballyEnabled(enable);
    setLocalState({ ...localState, soundEnabled: enable });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl neu-flat-dark border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 neu-raised-dark rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-11 h-11 rounded-2xl neu-inset-dark flex items-center justify-center text-cyan-400">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">মিটিং স্ক্রিন কন্ট্রোল প্যানেল ও সেটিংস</h2>
            <p className="text-xs text-slate-400">সকল বাংলা লেখা, মোড, সাউন্ড ও ডিজাইন কাস্টমাইজ করুন এবং নিচে 'সেভ করুন' চাপুন</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Permanent Sound Mute / Unmute Setting */}
          <div className="neu-raised-dark rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl neu-inset-dark flex items-center justify-center shrink-0 ${
                isSoundActive ? 'text-blue-400' : 'text-rose-400'
              }`}>
                {isSoundActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>সাউন্ড ও নোটিফিকেশন আওয়াজ</span>
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full ${
                    isSoundActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {isSoundActive ? 'সক্রিয় (ON)' : 'বন্ধ (OFF)'}
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  অ্যাপের সকল নোটিফিকেশন ও সুইচিং সাউন্ড নিয়ন্ত্রণ করুন।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => handleSoundToggle(true)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSoundActive
                    ? 'neu-inset-dark text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'neu-raised-dark text-slate-400 hover:text-white'
                }`}
              >
                সাউন্ড চালু
              </button>
              <button
                onClick={() => handleSoundToggle(false)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  !isSoundActive
                    ? 'neu-inset-dark text-rose-300 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    : 'neu-raised-dark text-slate-400 hover:text-white'
                }`}
              >
                সম্পূর্ণ বন্ধ
              </button>
            </div>
          </div>

          {/* Meeting Mode Switcher */}
          <div className="neu-raised-dark rounded-2xl p-4">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>মিটিং মোড নির্বাচন করুন</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'started',
                  title: 'লাইভ সেশন (ব্রডকাস্ট)',
                  desc: 'অন-এয়ার লাইভ স্টুডিও ও ফ্রিকোয়েন্সি ভিজ্যুয়ালাইজার',
                  theme: 'cyber-cyan',
                  headline: 'আমাদের অফিসিয়াল কাউন্সেলিং মিটিংয়ের দ্বিতীয় পর্ব শুরু হয়েছে!',
                  body: 'সবাই মনোযোগ সহকারে কাউন্সেলিং মিটিংটি কন্টিনিউ করুন।',
                  badge: '🔴 LIVE COUNSELLING MEETING • সম্প্রচার চলছে',
                },
                {
                  id: 'break',
                  title: 'পর্ব বিরতি (হোয়াইট)',
                  desc: 'সাদা ব্যাকগ্রাউন্ড ও জরুরি নোটিশ',
                  theme: 'monochrome-clean',
                  headline: 'দ্বিতীয় পর্ব বিরতি। অনুগ্রহ করে কেউ মিটিং থেকে বের হবে না।',
                  body: 'খুব শীঘ্রই মিটিংয়ের দ্বিতীয় পর্ব শুরু হবে। দয়া করে সবাই ধৈর্য ধরে মিটিংয়ে যুক্ত থাকুন।',
                  badge: '🔴 দ্বিতীয় পর্ব শুরু হতে বাকি • বিরতি চলছে',
                },
                {
                  id: 'ended',
                  title: 'সফল সমাপ্তি পেজ',
                  desc: 'বিজয় মেডেল ও পরবর্তী করণীয়',
                  theme: 'royal-emerald',
                  headline: 'আজকের অফিসিয়াল কাউন্সেলিং মিটিং সফলভাবে সমাপ্ত হয়েছে!',
                  body: 'উপস্থিত থাকার জন্য সকল সম্মানিত সদস্য ও লিডারদের আন্তরিক ধন্যবাদ।',
                  badge: 'MEETING CONCLUDED • সফল সমাপ্তি',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() =>
                    setLocalState({
                      ...localState,
                      mode: m.id as any,
                      theme: m.theme as any,
                      statusBadge: m.badge,
                      bengaliHeadline: m.headline,
                      bengaliBody: m.body,
                    })
                  }
                  className={`p-3.5 rounded-2xl text-left transition-all ${
                    (localState.mode || 'break') === m.id
                      ? 'neu-inset-dark border border-cyan-500/40 text-cyan-200 shadow-lg'
                      : 'neu-raised-dark text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold mb-1">{m.title}</div>
                  <div className="text-[11px] text-slate-400 leading-snug">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Switcher */}
          <div className="neu-raised-dark rounded-2xl p-4">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>কালার প্যালেট</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'monochrome-clean', name: 'White & Black', color: 'from-slate-100 to-slate-300' },
                { id: 'cyber-cyan', name: 'Deep Cyber', color: 'from-blue-600 to-cyan-500' },
                { id: 'royal-emerald', name: 'Royal Emerald', color: 'from-emerald-500 to-teal-700' },
                { id: 'cobalt-sapphire', name: 'Cobalt Sapphire', color: 'from-blue-700 to-indigo-700' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setLocalState({ ...localState, theme: t.id as MeetingState['theme'] })}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                    localState.theme === t.id
                      ? 'neu-inset-dark border border-cyan-500/40 text-white'
                      : 'neu-raised-dark text-slate-300 hover:text-white'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${t.color}`} />
                  <span className="text-xs font-medium">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Countdown Settings */}
          <div className="neu-raised-dark rounded-2xl p-4 space-y-3">
            <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>কাউন্টডাউন টাইমার সময়</span>
              </div>
              <button
                onClick={() => setLocalState({ ...localState, isCountdownActive: !localState.isCountdownActive })}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                  localState.isCountdownActive ? 'neu-inset-dark text-emerald-400' : 'neu-raised-dark text-slate-400'
                }`}
              >
                {localState.isCountdownActive ? 'টাইমার চালু' : 'টাইমার বন্ধ'}
              </button>
            </label>

            <div className="flex items-center gap-3">
              {[60, 120, 300, 600].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setLocalState({ ...localState, countdownSeconds: sec, isCountdownActive: true })}
                  className={`flex-1 py-2 rounded-xl text-xs font-mono transition-all ${
                    localState.countdownSeconds === sec && localState.isCountdownActive
                      ? 'neu-inset-dark text-cyan-300 font-bold border border-cyan-500/30'
                      : 'neu-raised-dark text-slate-300 hover:text-white'
                  }`}
                >
                  {sec === 60 ? '১ মিনিট' : `${sec / 60} মিনিট`}
                </button>
              ))}
            </div>
          </div>

          {/* Bengali Text Editing Section */}
          <div className="neu-raised-dark rounded-2xl p-4 space-y-4">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>বাংলা লেখা এডিট করুন (সব স্ক্রিনে আপডেট হবে)</span>
            </label>

            <div>
              <span className="text-[11px] text-slate-400 mb-1 block">মিটিং বা কোম্পানির টাইটেল</span>
              <input
                type="text"
                value={localState.title}
                onChange={(e) => setLocalState({ ...localState, title: e.target.value })}
                className="w-full neu-inset-dark border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400 mb-1 block">স্ট্যাটাস ব্যাজ টেক্সট</span>
              <input
                type="text"
                value={localState.statusBadge}
                onChange={(e) => setLocalState({ ...localState, statusBadge: e.target.value })}
                className="w-full neu-inset-dark border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400 mb-1 block">বাংলা প্রধান বার্তা (হেডলাইন)</span>
              <input
                type="text"
                value={localState.bengaliHeadline}
                onChange={(e) => setLocalState({ ...localState, bengaliHeadline: e.target.value })}
                className="w-full neu-inset-dark border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400 mb-1 block">বাংলা বিস্তারিত বার্তা / নির্দেশিকা</span>
              <textarea
                rows={3}
                value={localState.bengaliBody}
                onChange={(e) => setLocalState({ ...localState, bengaliBody: e.target.value })}
                className="w-full neu-inset-dark border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Quick Actions & Prominent Save Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onResetToDefault}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 neu-raised-dark hover:text-white text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ডিফল্ট রিস্টোর</span>
            </button>

            <div className="w-full sm:w-auto flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-2.5 neu-raised-dark text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
              >
                বাতিল
              </button>

              <button
                onClick={handleSave}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                  savedSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-600/40'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>সংরক্ষণ সম্পন্ন!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>সংরক্ষণ করুন (Save Changes)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
