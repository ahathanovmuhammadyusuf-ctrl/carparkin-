import React from 'react';
import { ArrowLeft, Star, Lock, Play, Award } from 'lucide-react';
import { LevelProgress } from '../types/game';
import { GAME_LEVELS } from '../game/levels';

interface LevelSelectModalProps {
  progress: Record<number, LevelProgress>;
  onSelectLevel: (levelId: number) => void;
  onBackToMenu: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  progress,
  onSelectLevel,
  onBackToMenu,
}) => {
  const getDifficultyBadge = (diff: string) => {
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
      default:
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-slate-100 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMenu}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all active:scale-95 cursor-pointer"
              title="Back to Menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-hud text-white tracking-wide">
                SELECT PARKING LEVEL
              </h2>
              <p className="text-xs text-slate-400">Choose a challenge to test your driving precision</p>
            </div>
          </div>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAME_LEVELS.map((lvl) => {
            const lvlProgress = progress[lvl.id] || { unlocked: lvl.id === 1, highScore: 0, stars: 0 };
            const isUnlocked = lvlProgress.unlocked;
            const stars = lvlProgress.stars || 0;

            return (
              <div
                key={lvl.id}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-800/60 hover:bg-slate-800/90 border-slate-700/70 hover:border-sky-500/60 hover:shadow-xl hover:shadow-sky-500/10 cursor-pointer'
                    : 'bg-slate-900/40 border-slate-800/50 opacity-60'
                }`}
                onClick={() => {
                  if (isUnlocked) onSelectLevel(lvl.id);
                }}
              >
                {/* Level Card Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded font-hud font-bold border ${getDifficultyBadge(lvl.difficulty)}`}>
                      {lvl.difficulty}
                    </span>
                    
                    {/* Stars Indicator */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-4 h-4 ${
                            idx < stars
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="font-hud font-bold text-base text-slate-100">{lvl.name}</h3>
                  <div className="text-xs text-sky-400 font-medium mb-2">{lvl.subtitle}</div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">{lvl.description}</p>
                </div>

                {/* Level Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                  {isUnlocked ? (
                    <>
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span className="font-mono tabular-nums font-semibold">
                          {lvlProgress.highScore > 0 ? `${lvlProgress.highScore.toLocaleString()} pts` : 'No Record'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLevel(lvl.id);
                        }}
                        className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-md transition-all active:scale-95"
                        title="Play Level"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                      <Lock className="w-4 h-4" />
                      <span>Complete previous level to unlock</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
