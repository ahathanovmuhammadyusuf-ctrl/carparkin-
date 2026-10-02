import React from 'react';
import { ShieldAlert, RotateCcw, Grid, Home } from 'lucide-react';
import { LevelConfig } from '../types/game';

interface GameOverModalProps {
  level: LevelConfig;
  onRetry: () => void;
  onOpenLevelSelect: () => void;
  onBackToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  onRetry,
  onOpenLevelSelect,
  onBackToMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-rose-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center text-slate-100">
        {/* Crash Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-500/40 text-rose-400 font-hud font-bold tracking-wider mb-1">
          VEHICLE TOTALED
        </span>
        <h2 className="text-2xl sm:text-3xl font-black font-hud text-white tracking-wide mb-2">
          CRASH OUT!
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Your car sustained critical collision damage in <span className="text-slate-200 font-semibold">{level.name}</span>. Precision parking requires careful speed and awareness.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRetry}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-hud font-bold text-sm sm:text-base shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>RETRY LEVEL</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenLevelSelect}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-hud text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Grid className="w-4 h-4 text-sky-400" />
              <span>Select Level</span>
            </button>
            <button
              onClick={onBackToMenu}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-hud text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
