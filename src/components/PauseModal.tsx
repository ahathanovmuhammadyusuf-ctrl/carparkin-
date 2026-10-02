import React from 'react';
import { Play, RotateCcw, Grid, Home, Volume2, VolumeX } from 'lucide-react';
import { LevelConfig } from '../types/game';

interface PauseModalProps {
  level: LevelConfig;
  onResume: () => void;
  onRestart: () => void;
  onOpenLevelSelect: () => void;
  onBackToMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  level,
  onResume,
  onRestart,
  onOpenLevelSelect,
  onBackToMenu,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center text-slate-100">
        <h2 className="text-2xl font-black font-hud text-white tracking-wider mb-1">
          GAME PAUSED
        </h2>
        <p className="text-xs text-slate-400 mb-6">{level.name}: {level.subtitle}</p>

        {/* Buttons List */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-hud font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>RESUME</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-hud text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart Level</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-hud text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
          </button>

          <button
            onClick={onOpenLevelSelect}
            className="w-full py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-hud text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Grid className="w-4 h-4 text-sky-400" />
            <span>Select Level</span>
          </button>

          <button
            onClick={onBackToMenu}
            className="w-full py-2.5 px-5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-hud text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
