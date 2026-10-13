import React from 'react';
import { ThemeType, MeetingMode } from '../types';

interface Props {
  theme: ThemeType;
  mode?: MeetingMode;
  isPlayingAudio?: boolean;
}

export const DynamicBackground: React.FC<Props> = ({ mode = 'break' }) => {
  const isLive = mode === 'started';
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 transition-colors duration-300 ${
        isLive ? 'bg-[#0f131c]' : 'bg-[#e8ecf4]'
      }`}
    />
  );
};
