'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Hls from 'hls.js';
import { Drama, Episode } from '@/types';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Minimize, Settings, MessageSquare, Bookmark, Share2,
  ChevronLeft, ChevronRight, Subtitles, Gauge, Monitor
} from 'lucide-react';

interface VideoPlayerProps {
  episode: Episode & { drama: Drama };
  drama: Drama;
  allEpisodes: Episode[];
  currentIndex: number;
}

// Represents one selectable quality option shown in the UI
interface QualityLevel {
  label: string;   // e.g. "1080P", "720P", "Auto"
  levelIndex: number; // -1 for Auto, otherwise the HLS level index
  height?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ episode, drama, allEpisodes, currentIndex }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState('1.0X');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // --- HLS-driven quality state ---
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = Auto
  const [activeHeight, setActiveHeight] = useState<number | null>(null); // actual height currently playing (for Auto display)
  const [isHlsSource, setIsHlsSource] = useState(false);

  const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;
  const hasVideo = !!episode.videoUrl;

  // Format time as MM:SS
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Show controls temporarily on interaction
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------
  // HLS.js SETUP — attaches whenever the episode/videoUrl changes
  // ---------------------------------------------------------------------
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !episode.videoUrl) return;

    // Clean up any previous instance first
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isM3u8 = episode.videoUrl.includes('.m3u8');
    setIsHlsSource(isM3u8);

    if (isM3u8 && Hls.isSupported()) {
      const hls = new Hls({
        // Reasonable defaults for adaptive streaming
        maxBufferLength: 30,
        enableWorker: true,
      });
      hlsRef.current = hls;

      hls.loadSource(episode.videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_evt, data) => {
        const levels: QualityLevel[] = data.levels.map((lvl, idx) => ({
          label: lvl.height ? `${lvl.height}P` : `${Math.round(lvl.bitrate / 1000)}kbps`,
          levelIndex: idx,
          height: lvl.height,
        }));
        // Sort high -> low, then add "Auto" at the top
        levels.sort((a, b) => (b.height || 0) - (a.height || 0));
        setQualityLevels([{ label: 'Auto', levelIndex: -1 }, ...levels]);
        setCurrentLevel(-1); // default to Auto (ABR)
      });

      // Track which rendition is actually playing while in Auto mode
      hls.on(Hls.Events.LEVEL_SWITCHED, (_evt, data) => {
        const lvl = hls.levels[data.level];
        setActiveHeight(lvl?.height ?? null);
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (isM3u8 && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari has native HLS support — no quality menu available here,
      // the OS-level player handles ABR internally.
      video.src = episode.videoUrl;
      setQualityLevels([]);
    } else {
      // Plain mp4 / non-HLS source — fall back to the native <video src>
      video.src = episode.videoUrl;
      setQualityLevels([]);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode.videoUrl]);

  const selectQuality = (levelIndex: number) => {
    setCurrentLevel(levelIndex);
    if (hlsRef.current) {
      // -1 tells hls.js to resume automatic bitrate switching
      hlsRef.current.currentLevel = levelIndex;
    }
    setShowQualityMenu(false);
  };

  const currentQualityLabel = (() => {
    if (!isHlsSource) return '1080P'; // static fallback label for plain mp4 sources
    if (currentLevel === -1) {
      return activeHeight ? `Auto (${activeHeight}P)` : 'Auto';
    }
    const found = qualityLevels.find(l => l.levelIndex === currentLevel);
    return found?.label ?? 'Auto';
  })();

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      videoRef.current.play().catch(() => { });
      setIsPlaying(true);
      resetControlsTimer();
    }
  };

  const seek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      setIsMuted(v === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      await containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black aspect-video group select-none"
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={resetControlsTimer}
    >
      {/* VIDEO ELEMENT */}
      {hasVideo ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
          onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          crossOrigin="anonymous"
        >
          {episode.subtitleUrl && (
            <track
              kind="subtitles"
              label="Sinhala"
              srcLang="si"
              src={episode.subtitleUrl}
              default
            />
          )}
        </video>
      ) : (
        // Placeholder frame (no video URL seeded — shows poster/thumbnail)
        <div
          className="w-full h-full flex flex-col items-center justify-center bg-black cursor-pointer relative overflow-hidden"
          onClick={togglePlay}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={episode.thumbnailUrl || drama.backdropUrl}
            alt={episode.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 flex flex-col items-center gap-4 text-white">
            <div className="w-20 h-20 rounded-full bg-[#00E676]/20 border-2 border-[#00E676] flex items-center justify-center backdrop-blur-sm shadow-[0_0_30px_rgba(0,230,118,0.4)]">
              <Play className="w-8 h-8 fill-[#00E676] text-[#00E676] translate-x-1" />
            </div>
            <p className="text-sm font-bold text-slate-300">{drama.title} — Episode {episode.episodeNumber}</p>
            <p className="text-xs text-slate-500">සිංහල Subtitle | HD Quality</p>
          </div>
        </div>
      )}

      {/* OVERLAY CONTROLS — fade in/out */}
      <div className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

        {/* Top bar: episode title + settings icon */}
        <div className="px-4 pt-3 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
          <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-[70%]">
            {drama.title} · Ep {episode.episodeNumber} — {episode.title}
          </p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded text-slate-300 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center click zone */}
        <div className="flex-1 cursor-pointer" onClick={togglePlay}>
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Play className="w-7 h-7 fill-white text-white translate-x-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom controls bar */}
        <div className="px-3 pb-3 bg-gradient-to-t from-black/80 to-transparent space-y-1">
          {/* Progress bar */}
          <div className="relative group/bar">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-[#00E676]"
              style={{
                background: `linear-gradient(to right, #00E676 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`
              }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Left controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Rewind 15s */}
              <button onClick={() => seek(-15)} className="p-1.5 text-white hover:text-[#00E676] transition-colors" title="Rewind 15s">
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play/Pause */}
              <button onClick={togglePlay} className="p-1.5 text-white hover:text-[#00E676] transition-colors">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              {/* Forward 15s */}
              <button onClick={() => seek(15)} className="p-1.5 text-white hover:text-[#00E676] transition-colors" title="Forward 15s">
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Next episode */}
              {nextEpisode && (
                <Link href={`/watch/${drama.slug}/${nextEpisode.id}`} className="p-1.5 text-white hover:text-[#00E676] transition-colors hidden sm:flex" title="Next Episode">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}

              {/* Time */}
              <span className="text-white text-[10px] sm:text-xs font-mono ml-1 whitespace-nowrap">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Volume */}
              <button onClick={toggleMute} className="p-1.5 text-white hover:text-[#00E676] transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 h-1 hidden sm:block appearance-none accent-[#00E676] cursor-pointer"
              />

              {/* Subtitle button */}
              <button className="p-1.5 text-white hover:text-[#00E676] transition-colors hidden md:flex" title="Subtitles">
                <Subtitles className="w-4 h-4" />
              </button>

              {/* Quality selector — now driven by real HLS levels */}
              {isHlsSource && qualityLevels.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => { setShowQualityMenu(p => !p); setShowSpeedMenu(false); }}
                    className="px-2 py-0.5 text-[10px] sm:text-xs font-bold text-white border border-white/30 rounded hover:border-[#00E676] hover:text-[#00E676] transition-colors"
                  >
                    {currentQualityLabel}
                  </button>
                  {showQualityMenu && (
                    <div className="absolute bottom-8 right-0 bg-[#181B26] border border-slate-700 rounded-lg overflow-hidden text-xs z-50 shadow-xl min-w-[100px]">
                      {qualityLevels.map(q => (
                        <button
                          key={q.levelIndex}
                          onClick={() => selectQuality(q.levelIndex)}
                          className={`block w-full px-4 py-2 text-left hover:bg-[#00E676]/10 hover:text-[#00E676] transition-colors ${currentLevel === q.levelIndex ? 'text-[#00E676] font-bold' : 'text-slate-300'}`}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Speed selector */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => { setShowSpeedMenu(p => !p); setShowQualityMenu(false); }}
                  className="px-2 py-0.5 text-[10px] sm:text-xs font-bold text-white border border-white/30 rounded hover:border-[#00E676] hover:text-[#00E676] transition-colors"
                >
                  {speed}
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-8 right-0 bg-[#181B26] border border-slate-700 rounded-lg overflow-hidden text-xs z-50 shadow-xl">
                    {['0.5X', '0.75X', '1.0X', '1.25X', '1.5X', '2.0X'].map(s => (
                      <button key={s} onClick={() => { setSpeed(s); setShowSpeedMenu(false); if (videoRef.current) videoRef.current.playbackRate = parseFloat(s); }}
                        className={`block w-full px-4 py-2 text-left hover:bg-[#00E676]/10 hover:text-[#00E676] transition-colors ${speed === s ? 'text-[#00E676] font-bold' : 'text-slate-300'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Picture-in-picture / monitor */}
              <button
                onClick={() => videoRef.current?.requestPictureInPicture?.().catch(() => { })}
                className="p-1.5 text-white hover:text-[#00E676] transition-colors hidden lg:flex"
                title="Picture in Picture"
              >
                <Monitor className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="p-1.5 text-white hover:text-[#00E676] transition-colors">
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};