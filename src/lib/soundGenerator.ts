/**
 * Web Audio API synthesizer & Web Speech API helper for meeting chimes,
 * sweet notification sounds, and instant voice announcements.
 */

export type PleasantSoundType = 'chime' | 'crystal' | 'zen' | 'victory';

// Global permanent sound mute/unmute state stored in localStorage
let isSoundEnabledCache: boolean = (() => {
  try {
    const saved = localStorage.getItem('unity_sound_enabled');
    return saved !== 'false';
  } catch (e) {
    return true;
  }
})();

export function isSoundGloballyEnabled(): boolean {
  return isSoundEnabledCache;
}

export function setSoundGloballyEnabled(enabled: boolean): void {
  isSoundEnabledCache = enabled;
  try {
    localStorage.setItem('unity_sound_enabled', enabled ? 'true' : 'false');
  } catch (e) {
    // ignore
  }
}

export function playPleasantNotificationSound(type: PleasantSoundType = 'chime') {
  // If sound is permanently disabled in settings, return immediately with zero sound!
  if (!isSoundGloballyEnabled()) {
    return;
  }

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'chime') {
      // Signature Angelic Crystalline 4-Tone Chime: F#5 (739.99), A#5 (932.33), C#6 (1108.73), F6 (1396.91)
      const freqs = [739.99, 932.33, 1108.73, 1396.91];
      freqs.forEach((freq, idx) => {
        const startTime = now + idx * 0.14;
        
        // Fundamental tone (warm sine)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        // Harmonic overtone (soft crystal shimmer)
        const harmOsc = ctx.createOscillator();
        const harmGain = ctx.createGain();
        harmOsc.type = 'triangle';
        harmOsc.frequency.setValueAtTime(freq * 2, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.24, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

        harmGain.gain.setValueAtTime(0, startTime);
        harmGain.gain.linearRampToValueAtTime(0.06, startTime + 0.02);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        harmOsc.connect(harmGain);
        harmGain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.9);
        harmOsc.start(startTime);
        harmOsc.stop(startTime + 1.0);
      });
    } else if (type === 'crystal') {
      // Sparkling Crystal Glass Bell (E6 + B6 + G#6 cascade)
      const notes = [1318.51, 1975.53, 2637.02];
      notes.forEach((freq, i) => {
        const start = now + i * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.28, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 2.3);
      });
    } else if (type === 'zen') {
      // Deep Calming Tibetan Singing Bowl (G3 196Hz + D4 293Hz + G4 392Hz)
      const bowlFreqs = [196.0, 293.66, 392.0];
      bowlFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.22 / (i + 1), now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 3.6);
      });
    } else if (type === 'victory') {
      // Celebratory / Concluded Victory Ascending Harp Arpeggio
      const harpNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      harpNotes.forEach((freq, i) => {
        const start = now + i * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 1.7);
      });
    }
  } catch (err) {
    console.error('Audio synthesis error:', err);
  }
}

// Backward-compatible alias
export function playStandbyChime() {
  playPleasantNotificationSound('chime');
}

export function speakBengaliAnnouncement(text: string, onEnd?: () => void) {
  if (!isSoundGloballyEnabled()) {
    if (onEnd) onEnd();
    return;
  }

  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'bn-BD';
  utterance.rate = 0.95;
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();
  const bnVoice = voices.find(v => v.lang.includes('bn') || v.lang.includes('IN') || v.name.toLowerCase().includes('bengali'));
  if (bnVoice) {
    utterance.voice = bnVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

