'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
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

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ episode, drama, allEpisodes, currentIndex }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('1080P');
  const [speed, setSpeed] = useState('1.0X');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

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

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      videoRef.current.play().catch(() => {});
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
          src={episode.videoUrl}
          className="w-full h-full object-contain"
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
          onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
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

              {/* Quality selector */}
              <div className="relative">
                <button
                  onClick={() => { setShowQualityMenu(p => !p); setShowSpeedMenu(false); }}
                  className="px-2 py-0.5 text-[10px] sm:text-xs font-bold text-white border border-white/30 rounded hover:border-[#00E676] hover:text-[#00E676] transition-colors"
                >
                  {quality}
                </button>
                {showQualityMenu && (
                  <div className="absolute bottom-8 right-0 bg-[#181B26] border border-slate-700 rounded-lg overflow-hidden text-xs z-50 shadow-xl">
                    {['1080P', '720P', '480P', '360P'].map(q => (
                      <button key={q} onClick={() => { setQuality(q); setShowQualityMenu(false); }}
                        className={`block w-full px-4 py-2 text-left hover:bg-[#00E676]/10 hover:text-[#00E676] transition-colors ${quality === q ? 'text-[#00E676] font-bold' : 'text-slate-300'}`}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
              <button className="p-1.5 text-white hover:text-[#00E676] transition-colors hidden lg:flex" title="Screen mode">
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
