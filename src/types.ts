export interface AudioConfig {
  id: string;
  name: string;
  blobUrl?: string;
  base64?: string;
  isLooping: boolean;
  volume: number;
}

export interface MeetingState {
  title: string;
  subtitle: string;
  bengaliHeadline: string;
  bengaliBody: string;
  statusBadge: string;
  targetTime?: string; // ISO or relative minutes
  countdownSeconds: number;
  isCountdownActive: boolean;
  theme: 'cyber-cyan' | 'royal-emerald' | 'deep-violet' | 'gold-amber';
  showParticles: boolean;
  showAudioVisualizer: boolean;
  showAmbientMusicWidget?: boolean;
}
