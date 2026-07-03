/**
 * Web Audio API synthesizer & Web Speech API helper for meeting chimes
 * and instant voice announcements.
 */

export function playStandbyChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Play a relaxing 3-tone chime (E5 -> A5 -> B5)
    const notes = [659.25, 880.00, 987.77];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.25);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.25);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.25 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.25);
      osc.stop(ctx.currentTime + i * 0.25 + 1.3);
    });
  } catch (err) {
    console.error('Audio context error:', err);
  }
}

export function speakBengaliAnnouncement(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'bn-BD'; // Bengali Bangladesh
  utterance.rate = 0.95; // Slightly slower, clear formal tone
  utterance.pitch = 1.05;

  // Try to find a Bengali voice if available
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
