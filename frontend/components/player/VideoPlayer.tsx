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

interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

function parseSubtitleContent(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    let timeLine = '';
    const textLines: string[] = [];

    for (const line of lines) {
      if (line.includes('-->')) {
        timeLine = line;
      } else if (timeLine) {
        textLines.push(line);
      }
    }

    if (timeLine && textLines.length > 0) {
      const parts = timeLine.split('-->').map((p) => p.trim().replace(',', '.'));
      if (parts.length >= 2) {
        const parseSeconds = (tStr: string) => {
          const clean = tStr.split(' ')[0]; // remove optional VTT styling tags
          const segs = clean.split(':').map(Number);
          if (segs.length === 3) {
            return segs[0] * 3600 + segs[1] * 60 + segs[2];
          } else if (segs.length === 2) {
            return segs[0] * 60 + segs[1];
          }
          return 0;
        };

        const start = parseSeconds(parts[0]);
        const end = parseSeconds(parts[1]);
        const text = textLines.join('\n').replace(/<[^>]*>/g, '').trim();

        if (end > start && text) {
          cues.push({ start, end, text });
        }
      }
    }
  }

  return cues;
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

  // --- Subtitles state (supports both .vtt and .srt directly) ---
  const [cues, setCues] = useState<SubtitleCue[]>([]);
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState('');

  // --- HLS-driven quality state ---
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = Auto
  const [activeHeight, setActiveHeight] = useState<number | null>(null);
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
  // SUBTITLE LOADER & PARSER
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!episode.subtitleUrl) {
      setCues([]);
      setCurrentSubtitle('');
      return;
    }

    fetch(episode.subtitleUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch subtitle file');
        return res.text();
      })
      .then((text) => {
        const parsed = parseSubtitleContent(text);
        setCues(parsed);
      })
      .catch((err) => {
        console.warn('Subtitle load error:', err);
        setCues([]);
      });
  }, [episode.subtitleUrl]);

  // Sync subtitle text with playback time
  useEffect(() => {
    if (!subtitleEnabled || cues.length === 0) {
      setCurrentSubtitle('');
      return;
    }
    const match = cues.find((c) => currentTime >= c.start && currentTime <= c.end);
    setCurrentSubtitle(match ? match.text : '');
  }, [currentTime, cues, subtitleEnabled]);

  // ---------------------------------------------------------------------
  // HLS.js & MP4 SETUP
  // ---------------------------------------------------------------------
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !episode.videoUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isM3u8 = episode.videoUrl.includes('.m3u8');
    setIsHlsSource(isM3u8);

    if (isM3u8 && Hls.isSupported()) {
      const hls = new Hls({
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
        levels.sort((a, b) => (b.height || 0) - (a.height || 0));
        setQualityLevels([{ label: 'Auto', levelIndex: -1 }, ...levels]);
        setCurrentLevel(-1);
      });

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
      video.src = episode.videoUrl;
      setQualityLevels([]);
    } else {
      video.src = episode.videoUrl;
      setQualityLevels([]);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [episode.videoUrl]);

  const selectQuality = (levelIndex: number) => {
    setCurrentLevel(levelIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
    setShowQualityMenu(false);
  };

  const currentQualityLabel = (() => {
    if (currentLevel === -1) {
      if (activeHeight) return `Auto (${activeHeight}P)`;
      return 'Auto';
    }
    const found = qualityLevels.find((q) => q.levelIndex === currentLevel);
    return found ? found.label : 'Auto';
  })();

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetControlsTimer();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
    resetControlsTimer();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const skipSeconds = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
    resetControlsTimer();
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black aspect-video group select-none overflow-hidden"
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
          playsInline
        />
      ) : (
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

      {/* ── CINEMATIC SUBTITLE OVERLAY ── */}
      {subtitleEnabled && currentSubtitle && (
        <div className="absolute bottom-16 sm:bottom-20 inset-x-4 flex justify-center pointer-events-none z-20">
          <div className="bg-black/80 text-white px-4 py-1.5 rounded-lg text-sm sm:text-base md:text-lg font-bold text-center leading-relaxed backdrop-blur-sm border border-white/10 shadow-2xl max-w-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-all">
            {currentSubtitle}
          </div>
        </div>
      )}

      {/* OVERLAY CONTROLS — fade in/out */}
      <div className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

        {/* Top bar: episode title + info */}
        <div className="px-4 pt-3 flex items-center justify-between bg-gradient-to-b from-black/75 to-transparent">
          <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-[70%] drop-shadow-md">
            {drama.title} · Ep {episode.episodeNumber} — {episode.title}
          </p>
          <div className="flex items-center gap-2">
            {episode.subtitleUrl && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30">
                සිංහල SUB
              </span>
            )}
          </div>
        </div>

        {/* Center click zone */}
        <div className="flex-1 cursor-pointer" onClick={togglePlay}>
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-2xl">
                <Play className="w-7 h-7 fill-white text-white translate-x-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom controls bar */}
        <div className="px-3 pb-3 bg-gradient-to-t from-black/85 to-transparent space-y-1">
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

          <div className="flex items-center justify-between pt-1">
            {/* Left controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={togglePlay} className="p-1.5 text-white hover:text-[#00E676] transition-colors">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              <button onClick={() => skipSeconds(-10)} className="p-1.5 text-slate-300 hover:text-white transition-colors" title="Rewind 10s">
                <SkipBack className="w-4 h-4" />
              </button>
              <button onClick={() => skipSeconds(10)} className="p-1.5 text-slate-300 hover:text-white transition-colors" title="Forward 10s">
                <SkipForward className="w-4 h-4" />
              </button>

              {prevEpisode && (
                <Link href={`/watch/${drama.slug}/${prevEpisode.episodeNumber}`} className="p-1.5 text-slate-400 hover:text-white transition-colors" title={`Previous: Ep ${prevEpisode.episodeNumber}`}>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              )}
              {nextEpisode && (
                <Link href={`/watch/${drama.slug}/${nextEpisode.episodeNumber}`} className="p-1.5 text-slate-400 hover:text-white transition-colors" title={`Next: Ep ${nextEpisode.episodeNumber}`}>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}

              <span className="text-[10px] sm:text-xs text-slate-400 font-mono ml-1">
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

              {/* Subtitle toggle button */}
              {episode.subtitleUrl && (
                <button
                  onClick={() => setSubtitleEnabled((p) => !p)}
                  className={`p-1.5 rounded transition-colors ${
                    subtitleEnabled
                      ? 'text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={subtitleEnabled ? 'Subtitles: ON' : 'Subtitles: OFF'}
                >
                  <Subtitles className="w-4 h-4" />
                </button>
              )}

              {/* Quality selector */}
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