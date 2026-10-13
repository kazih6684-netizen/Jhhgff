export interface AudioConfig {
  id: string;
  name: string;
  blobUrl?: string;
  base64?: string;
  isLooping: boolean;
  volume: number;
}

export type MeetingMode = 'started' | 'break' | 'ended';
export type SessionPart = 'part2' | 'part3';
export type ThemeType = 'cobalt-sapphire' | 'cyber-cyan' | 'royal-emerald' | 'monochrome-clean';

export interface MeetingState {
  mode: MeetingMode;
  currentPart?: SessionPart;
  title: string;
  subtitle: string;
  bengaliHeadline: string;
  bengaliBody: string;
  statusBadge: string;
  targetTime?: string; // ISO or relative minutes
  countdownSeconds: number;
  isCountdownActive: boolean;
  theme: ThemeType;
  showParticles: boolean;
  showAudioVisualizer: boolean;
  showAmbientMusicWidget?: boolean;
  soundEnabled?: boolean;
}
