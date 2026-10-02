import React from 'react';
import { Star, CheckCircle, RotateCcw, ArrowRight, Grid, Home, Award } from 'lucide-react';
import { GameScoreResult, LevelConfig } from '../types/game';
import { GAME_LEVELS } from '../game/levels';

interface LevelCompleteModalProps {
  level: LevelConfig;
  result: GameScoreResult;
  onNextLevel: () => void;
  onRetry: () => void;
  onOpenLevelSelect: () => void;
  onBackToMenu: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  result,
  onNextLevel,
  onRetry,
  onOpenLevelSelect,
  onBackToMenu,
}) => {
  const hasNextLevel = level.id < GAME_LEVELS.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center text-slate-100">
        {/* Celebration Trophy Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <CheckCircle className="w-9 h-9" />
        </div>

        {/* Victory Header */}
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-hud font-bold tracking-wider mb-1">
          MISSION SUCCESS
        </span>
        <h2 className="text-2xl sm:text-3xl font-black font-hud text-white tracking-wide mb-1">
          PARKING COMPLETE!
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-5">
          {level.name}: {level.subtitle}
        </p>

        {/* Stars Rating Display */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {Array.from({ length: 3 }).map((_, idx) => {
            const isEarned = idx < result.stars;
            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all duration-500 transform ${
                  isEarned
                    ? 'bg-amber-500/10 border-amber-500/50 scale-110 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-slate-800/50 border-slate-800 text-slate-700'
                }`}
              >
                <Star className={`w-8 h-8 ${isEarned ? 'fill-amber-400' : ''}`} />
              </div>
            );
          })}
        </div>

        {/* Performance Breakdown Card */}
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-6 text-xs sm:text-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Position Accuracy</span>
            <span className="font-hud font-bold text-emerald-400 tabular-nums">{result.posAccuracy}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Angle Alignment</span>
            <span className="font-hud font-bold text-emerald-400 tabular-nums">{result.angleAccuracy}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Time Taken</span>
            <span className="font-mono text-slate-200 tabular-nums">{result.timeTaken}s (Par: {level.parTime}s)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Lives Left</span>
            <span className="font-hud text-rose-400 tabular-nums">+{result.livesRemaining * 500} pts</span>
          </div>
          <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
            <span className="font-hud font-bold text-slate-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              TOTAL SCORE
            </span>
            <span className="text-xl sm:text-2xl font-black font-hud text-sky-400 tabular-nums">
              {result.totalScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-hud font-bold text-sm sm:text-base shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-full py-3 px-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-hud text-xs font-bold">
              CONGRATULATIONS! ALL 5 LEVELS MASTERED!
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onRetry}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-hud text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Retry</span>
            </button>
            <button
              onClick={onOpenLevelSelect}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-hud text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Grid className="w-4 h-4 text-sky-400" />
              <span>Levels</span>
            </button>
            <button
              onClick={onBackToMenu}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-hud text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
