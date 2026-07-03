/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MeetingState } from './types';
import { DynamicBackground } from './components/DynamicBackground';
import { MeetingScreen } from './components/MeetingScreen';
import { SecretAudioPlayer } from './components/SecretAudioPlayer';
import { ControlPanelModal } from './components/ControlPanelModal';

const DEFAULT_STATE: MeetingState = {
  title: 'Unity Earning E-learning Platform Official Counselling Meeting',
  subtitle: 'অফিসিয়াল কাউন্সেলিং ও দিকনির্দেশনা সেশন',
  bengaliHeadline: 'অফিসিয়াল কাউন্সেলিং মিটিং এর দ্বিতীয় পর্ব শুরু হয়েছে!',
  bengaliBody: 'সবাই মনোযোগ সহকারে কাউন্সেলিং মিটিংটি কন্টিনিউ করুন। মিটিং শেষ হলে সম্পূর্ণ কাজ বিস্তারিত বুঝিয়ে দেওয়া হবে।',
  statusBadge: 'LIVE COUNSELLING MEETING • চলছে',
  countdownSeconds: 180, // 3 minutes default
  isCountdownActive: false,
  theme: 'cyber-cyan',
  showParticles: true,
  showAudioVisualizer: true,
  showAmbientMusicWidget: true,
};

export default function App() {
  const [state, setState] = useState<MeetingState>(() => {
    const saved = localStorage.getItem('unity_meeting_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.showAmbientMusicWidget === undefined) {
          parsed.showAmbientMusicWidget = true;
        }
        // Automatically upgrade to the direct 2nd part message requested by host
        if (parsed.bengaliHeadline?.includes('প্রথম পর্বের মিটিং সমাপ্ত হয়েছে') || parsed.bengaliHeadline?.includes('শুরু হয়েছে!')) {
          parsed.bengaliHeadline = 'অফিসিয়াল কাউন্সেলিং মিটিং এর দ্বিতীয় পর্ব শুরু হয়েছে!';
          parsed.bengaliBody = 'সবাই মনোযোগ সহকারে কাউন্সেলিং মিটিংটি কন্টিনিউ করুন। মিটিং শেষ হলে সম্পূর্ণ কাজ বিস্তারিত বুঝিয়ে দেওয়া হবে।';
          parsed.statusBadge = 'LIVE COUNSELLING MEETING • চলছে';
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    return DEFAULT_STATE;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('unity_meeting_state', JSON.stringify(state));
  }, [state]);

  const handleReset = () => {
    setState(DEFAULT_STATE);
    localStorage.removeItem('unity_meeting_state');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050811] font-sans text-white overflow-hidden select-none">
      {/* Interactive Canvas Background with Floating Light Orbs */}
      <DynamicBackground theme={state.theme} isPlayingAudio={isPlayingAudio} />

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

