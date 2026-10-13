/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MeetingState, MeetingMode } from './types';
import { DynamicBackground } from './components/DynamicBackground';
import { MeetingScreen } from './components/MeetingScreen';
import { SecretAudioPlayer } from './components/SecretAudioPlayer';
import { ControlPanelModal } from './components/ControlPanelModal';

const DEFAULT_STATE: MeetingState = {
  mode: 'break',
  currentPart: 'part2',
  title: 'Unity Earning E-learning Platform Official Counselling Meeting',
  subtitle: 'আমাদের অফিসিয়াল কাউন্সেলিং ও দিকনির্দেশনা সেশন',
  bengaliHeadline: 'অনুগ্রহ করে কেউ মিটিং থেকে বের হবেন না।',
  bengaliBody: 'খুব শীঘ্রই মিটিংয়ের দ্বিতীয় পর্ব শুরু হবে। দয়া করে সবাই ধৈর্য ধরে মিটিংয়ে যুক্ত থাকুন।',
  statusBadge: '🔴 দ্বিতীয় পর্ব শুরু হতে বাকি • বিরতি চলছে',
  countdownSeconds: 60, // Strictly 1 minute (60s -> 0s)
  isCountdownActive: true,
  theme: 'monochrome-clean', // Pure crisp White background, bold Black text, Royal Blue & Emerald Green accents
  showParticles: true,
  showAudioVisualizer: true,
  showAmbientMusicWidget: true,
  soundEnabled: true,
};

export default function App() {
  const [state, setState] = useState<MeetingState>(() => {
    const sessionActiveMode = (sessionStorage.getItem('unity_active_mode') as MeetingMode | null) || 'break';
    const saved = localStorage.getItem('unity_meeting_state');
    let loaded: MeetingState = { ...DEFAULT_STATE };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        loaded = { ...loaded, ...parsed };
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    } else {
      loaded.mode = sessionActiveMode;
      if (sessionActiveMode === 'break') {
        loaded.theme = 'monochrome-clean';
        loaded.countdownSeconds = 60;
        loaded.isCountdownActive = true;
        loaded.currentPart = loaded.currentPart || 'part2';
        loaded.bengaliHeadline = loaded.currentPart === 'part3'
          ? 'তৃতীয় পর্ব বিরতি। অনুগ্রহ করে কেউ মিটিং থেকে বের হবে না।'
          : 'অনুগ্রহ করে কেউ মিটিং থেকে বের হবেন না।';
        loaded.bengaliBody = loaded.currentPart === 'part3'
          ? 'খুব শীঘ্রই মিটিংয়ের তৃতীয় পর্ব শুরু হবে।'
          : 'খুব শীঘ্রই মিটিংয়ের দ্বিতীয় পর্ব শুরু হবে।';
        loaded.statusBadge = loaded.currentPart === 'part3'
          ? '🔴 তৃতীয় পর্ব শুরু হতে বাকি • বিরতি চলছে'
          : '🔴 দ্বিতীয় পর্ব শুরু হতে বাকি • বিরতি চলছে';
      } else if (sessionActiveMode === 'started') {
        loaded.theme = 'cyber-cyan';
        loaded.statusBadge = '🔴 LIVE COUNSELLING MEETING • সম্প্রচার চলছে';
        loaded.bengaliHeadline = 'আমাদের কাউন্সেলিং সেমিনার মিটিংয়ের দ্বিতীয় পর্ব শুরু হয়েছে।';
        loaded.bengaliBody = 'সবাই মনোযোগ সহকারে কাউন্সেলিং মিটিংটি কন্টিনিউ করুন।';
      } else if (sessionActiveMode === 'ended') {
        loaded.theme = 'royal-emerald';
        loaded.statusBadge = 'MEETING CONCLUDED • সফল সমাপ্তি';
        loaded.bengaliHeadline = 'আজকের অফিসিয়াল কাউন্সেলিং মিটিং সফলভাবে সমাপ্ত হয়েছে!';
        loaded.bengaliBody = 'উপস্থিত থাকার জন্য সকল সম্মানিত সদস্য ও লিডারদের আন্তরিক ধন্যবাদ।';
      }
    }

    return loaded;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Save changes to localStorage & sessionStorage
  useEffect(() => {
    localStorage.setItem('unity_meeting_state', JSON.stringify(state));
    if (state.mode) {
      sessionStorage.setItem('unity_active_mode', state.mode);
    }
  }, [state]);

  const handleReset = () => {
    setState(DEFAULT_STATE);
    localStorage.removeItem('unity_meeting_state');
  };

  const isLive = state.mode === 'started';

  return (
    <div className={`relative min-h-screen w-full font-sans overflow-hidden select-none transition-colors duration-500 ${isLive ? 'bg-[#0f131c] text-white' : 'bg-[#e8ecf4] text-slate-900'}`}>
      {/* Interactive Canvas Background with Floating Light Orbs */}
      <DynamicBackground theme={state.theme} mode={state.mode} isPlayingAudio={isPlayingAudio} />

      {/* Secret Stealth Audio Player in Top Right Corner */}
      <SecretAudioPlayer onPlayStateChange={setIsPlayingAudio} />

      {/* Main UI Screen (Only displays title and Bengali message as requested) */}
      <MeetingScreen
        state={state}
        onChange={setState}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isPlayingAudio={isPlayingAudio}
      />

      {/* Host Settings & Customization Modal */}
      <ControlPanelModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onChange={setState}
        onResetToDefault={handleReset}
      />
    </div>
  );
}

