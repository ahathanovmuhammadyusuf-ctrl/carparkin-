import React from 'react';
import { Camera, Volume2, VolumeX, RotateCcw, Pause, Heart, ShieldAlert, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Disc } from 'lucide-react';
import { CameraViewMode, CarControls, LevelConfig } from '../types/game';

interface HUDProps {
  level: LevelConfig;
  speedKmh: number;
  gear: 'P' | 'D' | 'R';
  posAccuracy: number;
  angleAccuracy: number;
  isInsideZone: boolean;
  parkProgress: number;
  lives: number;
  maxLives: number;
  cameraMode: CameraViewMode;
  isMuted: boolean;
  isCrashAlert: boolean;
  onToggleCamera: () => void;
  onToggleMute: () => void;
  onRestart: () => void;
  onPause: () => void;
  // Touch controls
  externalControls: CarControls;
  setExternalControls: React.Dispatch<React.SetStateAction<CarControls>>;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  speedKmh,
  gear,
  posAccuracy,
  angleAccuracy,
  isInsideZone,
  parkProgress,
  lives,
  maxLives,
  cameraMode,
  isMuted,
  isCrashAlert,
  onToggleCamera,
  onToggleMute,
  onRestart,
  onPause,
  externalControls,
  setExternalControls,
}) => {
  const getCameraLabel = () => {
    switch (cameraMode) {
      case 'chase':
        return 'Chase';
      case 'top_down':
        return 'Top-Down';
      case 'hood':
        return 'Hood';
    }
  };

  const getDifficultyColor = (diff: LevelConfig['difficulty']) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30';
      case 'Normal':
        return 'text-sky-400 bg-sky-950/80 border-sky-500/30';
      case 'Hard':
        return 'text-amber-400 bg-amber-950/80 border-amber-500/30';
      case 'Tight':
        return 'text-purple-400 bg-purple-950/80 border-purple-500/30';
      case 'Expert':
        return 'text-rose-400 bg-rose-950/80 border-rose-500/30';
    }
  };

  // Touch control helper handlers
  const handleTouchStart = (key: keyof CarControls) => {
    setExternalControls((prev) => ({ ...prev, [key]: true }));
  };

  const handleTouchEnd = (key: keyof CarControls) => {
    setExternalControls((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex flex-col justify-between p-4 sm:p-6">
      {/* Red flash & CRASH banner when collision happens */}
      {isCrashAlert && (
        <div className="absolute inset-0 crash-vignette pointer-events-none flex items-center justify-center animate-pulse z-40">
          <div className="bg-rose-950/90 border-2 border-rose-500 px-6 py-3 rounded-lg shadow-2xl backdrop-blur-md flex items-center gap-3 text-rose-100 scale-110 transform transition-transform">
            <ShieldAlert className="w-8 h-8 text-rose-400 animate-bounce" />
            <div>
              <div className="text-2xl font-black tracking-widest font-hud text-rose-300">CRASH DETECTED!</div>
              <div className="text-xs text-rose-200">Vehicle impact recorded · Life lost</div>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR: Level Title, Lives, and Action Controls */}
      <div className="flex items-start justify-between w-full z-20">
        {/* Left: Level Info */}
        <div className="flex flex-col gap-1 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 shadow-lg max-w-[280px] sm:max-w-xs">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded font-hud font-bold border ${getDifficultyColor(level.difficulty)}`}>
              {level.difficulty}
            </span>
            <span className="text-xs text-slate-400 font-medium truncate">{level.name}</span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate">{level.subtitle}</h2>
          
          {/* Lives Counter */}
          <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Lives:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: maxLives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 transition-all duration-300 ${
                    i < lives
                      ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                      : 'fill-slate-800 text-slate-700 opacity-40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center: Parking Guidance Radar / Status */}
        <div className="hidden md:flex flex-col items-center bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl px-4 py-2.5 shadow-lg min-w-[260px]">
          {isInsideZone ? (
            <div className="w-full flex flex-col items-center gap-1">
              <div className="flex items-center justify-between w-full text-xs">
                <span className="text-emerald-400 font-bold font-hud flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  INSIDE PARKING ZONE
                </span>
                <span className="text-slate-300 font-mono text-xs">
                  {Math.round(parkProgress * 100)}%
                </span>
              </div>
              {/* Progress bar to complete parking hold */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-emerald-900/50">
                <div
                  className="h-full bg-emerald-500 transition-all duration-150 ease-out"
                  style={{ width: `${parkProgress * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between w-full text-[11px] text-slate-400 mt-0.5">
                <span>Hold car stopped to complete</span>
                <span className="font-mono text-emerald-300">Pos: {posAccuracy}% · Angle: {angleAccuracy}%</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-1">
              <div className="text-xs font-semibold text-amber-400 font-hud tracking-wide">TARGET PARKING BAY AHEAD</div>
              <div className="text-[11px] text-slate-400">Drive vehicle into marked glowing green bay</div>
            </div>
          )}
        </div>

        {/* Right: Quick Action Buttons (Pause, Camera, Mute, Restart) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Camera View Switcher */}
          <button
            onClick={onToggleCamera}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-medium shadow-lg backdrop-blur-md transition-all active:scale-95"
            title="Switch Camera (Chase / Top-Down / Hood)"
          >
            <Camera className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline font-hud">{getCameraLabel()}</span>
          </button>

          {/* Sound Mute */}
          <button
            onClick={onToggleMute}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs shadow-lg backdrop-blur-md transition-all active:scale-95"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs shadow-lg backdrop-blur-md transition-all active:scale-95"
            title="Restart Level"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </button>

          {/* Pause */}
          <button
            onClick={onPause}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs shadow-lg backdrop-blur-md transition-all active:scale-95"
            title="Pause Game"
          >
            <Pause className="w-4 h-4 text-slate-200" />
          </button>
        </div>
      </div>

      {/* MOBILE PARKING PROXIMITY BAR (Shown only on small screens) */}
      <div className="md:hidden flex flex-col items-center bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 shadow-lg my-auto self-center max-w-[280px] w-full text-center">
        {isInsideZone ? (
          <div className="w-full flex flex-col gap-1">
            <span className="text-emerald-400 font-bold font-hud text-xs flex items-center justify-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              IN ZONE · HOLD STILL
            </span>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-emerald-900/50">
              <div
                className="h-full bg-emerald-500 transition-all duration-150 ease-out"
                style={{ width: `${parkProgress * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-slate-300 font-medium">Drive into green parking zone</div>
        )}
      </div>

      {/* BOTTOM HUD: Speedometer & Controls */}
      <div className="flex items-end justify-between w-full z-20 pointer-events-none">
        {/* Left: Speedometer & Gear Display */}
        <div className="flex items-end gap-3 bg-slate-900/85 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3.5 shadow-2xl pointer-events-auto">
          {/* Digital km/h */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-3xl sm:text-4xl font-black font-hud text-slate-100 tabular-nums leading-none tracking-tight">
              {speedKmh}
            </div>
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 font-hud mt-0.5">KM / H</div>
          </div>

          <div className="h-9 w-[1px] bg-slate-800" />

          {/* Automatic Transmission Gear */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 font-hud font-bold text-xs sm:text-sm">
              <span className={`px-1.5 py-0.5 rounded ${gear === 'P' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-600'}`}>P</span>
              <span className={`px-1.5 py-0.5 rounded ${gear === 'D' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-600'}`}>D</span>
              <span className={`px-1.5 py-0.5 rounded ${gear === 'R' ? 'bg-rose-500 text-slate-950 font-black' : 'text-slate-600'}`}>R</span>
            </div>
            <div className="text-[9px] text-slate-400 font-semibold tracking-wider font-hud mt-1">GEAR</div>
          </div>
        </div>

        {/* Keyboard Controls Reminder for Desktop */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-900/75 backdrop-blur-md border border-slate-800/80 rounded-xl px-4 py-2 text-xs text-slate-300 shadow-lg">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-slate-200">W</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-slate-200">S</kbd>
            <span>Drive / Reverse</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-slate-200">A</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-slate-200">D</kbd>
            <span>Steer</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-slate-200">SPACE</kbd>
            <span>Handbrake</span>
          </div>
        </div>

        {/* On-Screen Touch Controls (Active on Touch / Mobile) */}
        <div className="flex lg:hidden items-end gap-3 pointer-events-auto">
          {/* Steering Left / Right */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            <button
              onPointerDown={() => handleTouchStart('left')}
              onPointerUp={() => handleTouchEnd('left')}
              onPointerLeave={() => handleTouchEnd('left')}
              className={`p-3.5 rounded-xl border border-slate-700/60 transition-all ${
                externalControls.left ? 'bg-sky-600 text-white scale-95' : 'bg-slate-800/90 text-slate-200'
              }`}
              aria-label="Steer Left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onPointerDown={() => handleTouchStart('right')}
              onPointerUp={() => handleTouchEnd('right')}
              onPointerLeave={() => handleTouchEnd('right')}
              className={`p-3.5 rounded-xl border border-slate-700/60 transition-all ${
                externalControls.right ? 'bg-sky-600 text-white scale-95' : 'bg-slate-800/90 text-slate-200'
              }`}
              aria-label="Steer Right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Drive Pedals & Handbrake */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            {/* Handbrake */}
            <button
              onPointerDown={() => handleTouchStart('handbrake')}
              onPointerUp={() => handleTouchEnd('handbrake')}
              onPointerLeave={() => handleTouchEnd('handbrake')}
              className={`p-3 rounded-xl border border-slate-700/60 font-hud text-[11px] font-bold transition-all ${
                externalControls.handbrake ? 'bg-amber-600 text-white scale-95' : 'bg-slate-800/90 text-amber-400'
              }`}
              title="Handbrake"
            >
              <Disc className="w-5 h-5" />
            </button>

            {/* Reverse / Brake Pedal */}
            <button
              onPointerDown={() => handleTouchStart('backward')}
              onPointerUp={() => handleTouchEnd('backward')}
              onPointerLeave={() => handleTouchEnd('backward')}
              className={`p-3.5 rounded-xl border border-slate-700/60 transition-all ${
                externalControls.backward ? 'bg-rose-600 text-white scale-95' : 'bg-slate-800/90 text-rose-300'
              }`}
              aria-label="Brake / Reverse"
            >
              <ArrowDown className="w-5 h-5" />
            </button>

            {/* Gas / Throttle Pedal */}
            <button
              onPointerDown={() => handleTouchStart('forward')}
              onPointerUp={() => handleTouchEnd('forward')}
              onPointerLeave={() => handleTouchEnd('forward')}
              className={`p-4 rounded-xl border border-emerald-600/50 transition-all ${
                externalControls.forward ? 'bg-emerald-500 text-slate-950 scale-95' : 'bg-emerald-600/90 text-white'
              }`}
              aria-label="Accelerate"
            >
              <ArrowUp className="w-6 h-6 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
