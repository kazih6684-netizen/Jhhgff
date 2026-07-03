import React, { useState, useEffect, useRef } from 'react';
import { saveAudioFile, getAudioFile, deleteAudioFile } from '../lib/storage';
import { speakBengaliAnnouncement, playStandbyChime } from '../lib/soundGenerator';
import { Mic, Upload, Play, Pause, Volume2, Repeat, Trash2, X, Sparkles, Check } from 'lucide-react';

interface Props {
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export const SecretAudioPlayer: React.FC<Props> = ({ onPlayStateChange }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState<string>('কোনো ফাইল আপলোড করা হয়নি');

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load stored audio from IndexedDB on startup
  useEffect(() => {
    async function loadSavedAudio() {
      try {
        const savedBlob = await getAudioFile('meeting_standby_audio');
        if (savedBlob) {
          const url = URL.createObjectURL(savedBlob);
          setAudioUrl(url);
          setFileName('সংরক্ষিত ভয়েস ফাইল (Loaded from Memory)');
        }
      } catch (err) {
        console.error('Failed to load audio from DB:', err);
      }
    }
    loadSavedAudio();
  }, []);

  // Update audio element properties when volume or loop changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = isLooping;
    }
  }, [volume, isLooping]);

  // Notify parent component about play state for visualizer effects
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  // Handle Play/Pause toggle
  const togglePlay = () => {
    if (!audioUrl) {
      // If no file uploaded, open the secret upload modal so host can add one or use TTS
      setIsModalOpen(true);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error('Playback error:', err);
        });
      }
    }
  };

  // Handle custom audio upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMicError(null);

    try {
      await saveAudioFile('meeting_standby_audio', file);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const newUrl = URL.createObjectURL(file);
      setAudioUrl(newUrl);
      setFileName(file.name);
      setIsPlaying(false);
    } catch (err) {
      console.error('Error saving uploaded file:', err);
      setMicError('ফাইল সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  // Handle deleting saved audio
  const handleDeleteAudio = async () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      await deleteAudioFile('meeting_standby_audio');
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setFileName('কোনো ফাইল আপলোড করা হয়নি');
    } catch (err) {
      console.error('Error deleting audio:', err);
    }
  };

  // Handle voice recording
  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await saveAudioFile('meeting_standby_audio', audioBlob);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const newUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(newUrl);
        setFileName('লাইভ রেকর্ড করা ভয়েস বার্তা');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission denied or cancelled:', err);
      setMicError('মাইক্রোফোনের অনুমতি পাওয়া যায়নি বা ব্রাউজারে ব্লক করা হয়েছে। অনুগ্রহ করে উপরের বাটন দিয়ে সরাসরি অডিও/MP3 ফাইল আপলোড করুন।');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Instant built-in Bengali speech announcement
  const handleInstantTTS = () => {
    playStandbyChime();
    setTimeout(() => {
      speakBengaliAnnouncement(
        'প্রথম পর্বের মিটিং সমাপ্ত হয়েছে। দ্বিতীয় পর্ব এখনই শুরু হবে। দয়া করে সবাই মনোযোগ সহকারে মিটিংয়ে উপস্থিত থাকুন এবং সম্পূর্ণ মিটিংটি শেষ করুন। ধন্যবাদ।',
        () => setIsPlaying(false)
      );
    }, 1200);
    setIsPlaying(true);
  };

  return (
    <>
      {/* Hidden HTML Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => {
            if (!isLooping) setIsPlaying(false);
          }}
        />
      )}

      {/* 
        STEALTH SECRET BUTTON IN TOP RIGHT CORNER 
        Looks like a tiny ambient UI light dot or subtle status indicator so viewers on screen share won't notice it.
        Single click toggles play/pause. Double click or Right click opens the secret uploader!
      */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 group">
        <button
          onClick={togglePlay}
          onDoubleClick={() => setIsModalOpen(true)}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsModalOpen(true);
          }}
          title="Secret Voice Trigger (Double click or Right click for upload menu)"
          className={`relative w-3.5 h-3.5 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center ${
            isPlaying 
              ? 'bg-cyan-400 shadow-[0_0_12px_#06b6d4]' 
              : audioUrl 
                ? 'bg-white/35 hover:bg-cyan-400 hover:scale-125' 
                : 'bg-white/15 hover:bg-white/40 hover:scale-125'
          }`}
        >
          {isPlaying && (
            <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75" />
          )}
        </button>
      </div>

      {/* SECRET VOICE UPLOAD & CONTROL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.15)] text-slate-100">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">গোপন ভয়েস আপলোড ও প্লেয়ার</h3>
                <p className="text-xs text-slate-400">স্ক্রিন শেয়ারে এই বাটনটি ছোট্ট একটি বিন্দুর মতো থাকবে</p>
              </div>
            </div>

            {/* Current status */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 mb-5 flex items-center justify-between">
              <div className="truncate pr-2">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">বর্তমান অডিও ফাইল</div>
                <div className="text-sm font-medium text-cyan-300 truncate mt-0.5">{fileName}</div>
              </div>
              {audioUrl && (
                <button
                  onClick={handleDeleteAudio}
                  title="ফাইল ডিলিট করুন"
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-3 mb-6">
              {micError && (
                <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs text-left leading-relaxed flex items-start justify-between gap-2">
                  <span>{micError}</span>
                  <button onClick={() => setMicError(null)} className="text-rose-400 hover:text-white font-bold px-1">✕</button>
                </div>
              )}

              {/* Option 1: Upload MP3/Audio file */}
              <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium cursor-pointer shadow-lg shadow-cyan-500/20 transition-all">
                <Upload className="w-4 h-4" />
                <span>আপনার ভয়েস / অডিও ফাইল আপলোড করুন</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Option 2: Live Voice Recording */}
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <Mic className="w-4 h-4 text-rose-400" />
                    <span>সরাসরি ভয়েস রেকর্ড করুন</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 animate-pulse"
                  >
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>রেকর্ডিং বন্ধ করুন ({recordingTime}s)</span>
                  </button>
                )}
              </div>

              {/* Option 3: Instant AI / Built-in Announcement */}
              <button
                onClick={handleInstantTTS}
                className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700/80 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>অটোমেটিক বাংলা ভয়েস অ্যানাউন্সমেন্ট বাজান (TTS)</span>
              </button>
            </div>

            {/* Playback Controls if file exists */}
            {audioUrl && (
              <div className="border-t border-white/10 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'বাজানো বন্ধ করুন (Pause)' : 'ভয়েস চালু করুন (Play)'}</span>
                  </button>

                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      isLooping 
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' 
                        : 'bg-black/30 border-white/10 text-slate-400'
                    }`}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>লুপ {isLooping ? 'চালু' : 'বন্ধ'}</span>
                  </button>
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-400 w-8">{Math.round(volume * 100)}%</span>
                </div>
              </div>
            )}

            {/* Discreet usage guide */}
            <div className="mt-5 bg-cyan-950/40 border border-cyan-500/20 rounded-xl p-3 text-[11px] text-cyan-200/80 leading-relaxed">
              💡 <span className="font-semibold text-cyan-300">কিভাবে কাজ করবে:</span> একবার ফাইল আপলোড বা রেকর্ড করলে তা ব্রাউজার মেমোরিতে সেভ থাকবে। স্ক্রিন শেয়ারের সময় উপরে ডান কোণায় থাকা ছোট্ট বিন্দুটিতে ক্লিক করলেই ভয়েস চালু বা বন্ধ হবে—কেউ বুঝতেও পারবে না!
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>সেভ করে স্ক্রিনে ফিরে যান</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
