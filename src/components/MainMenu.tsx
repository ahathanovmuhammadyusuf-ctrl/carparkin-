import React from 'react';
import { Play, Grid, HelpCircle, Trophy, Star, Volume2, VolumeX } from 'lucide-react';
import { LevelProgress } from '../types/game';
import { GAME_LEVELS } from '../game/levels';
import heroBg from '../assets/images/menu_parking_hero_1790958613707.jpg';

interface MainMenuProps {
  onStartGame: (levelId?: number) => void;
  onOpenLevelSelect: () => void;
  onOpenGuide: () => void;
  progress: Record<number, LevelProgress>;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenLevelSelect,
  onOpenGuide,
  progress,
  isMuted,
  onToggleMute,
}) => {
  // Calculate total stars collected
  const totalStars = Object.values(progress).reduce((acc, curr) => acc + (curr.stars || 0), 0);
  const maxPossibleStars = GAME_LEVELS.length * 3;

  // Find first uncompleted or highest unlocked level
  const firstIncompleteLevel = GAME_LEVELS.find((lvl) => (progress[lvl.id]?.stars || 0) === 0)?.id || 1;

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Background Hero Image with Dark Gradient Scrim */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={heroBg}
          alt="Ultimate Parking Challenge Hero"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-50 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-hud font-black text-lg shadow-md">
            P
          </div>
          <div>
            <span className="font-hud font-bold tracking-tight text-slate-200 text-sm sm:text-base">
              ULTIMATE PARKING CHALLENGE
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60 shadow-md backdrop-blur-md transition-all active:scale-95"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Center Hero Content */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto w-full py-6">
        {/* Title Lockup */}
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-950/60 border border-sky-500/30 text-sky-300 text-xs font-semibold tracking-wider font-hud">
          PRECISION 3D DRIVING SIMULATOR
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-hud tracking-tight text-white drop-shadow-xl text-balance leading-none mb-4">
          ULTIMATE PARKING
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-300">
            CHALLENGE
          </span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed font-normal">
          Master real vehicle physics, tight parallel maneuvers, and intricate slalom bays in realistic daytime 3D environments.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          {/* Start Game CTA */}
          <button
            onClick={() => onStartGame(firstIncompleteLevel)}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-hud font-bold text-base rounded-xl shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>START GAME</span>
          </button>

          {/* Select Level */}
          <button
            onClick={onOpenLevelSelect}
            className="w-full sm:w-auto px-6 py-4 bg-slate-900/80 hover:bg-slate-800 text-slate-100 border border-slate-700/80 font-hud font-semibold text-base rounded-xl shadow-lg backdrop-blur-md transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Grid className="w-5 h-5 text-sky-400" />
            <span>SELECT LEVEL</span>
          </button>

          {/* Guide / How to play */}
          <button
            onClick={onOpenGuide}
            className="w-full sm:w-auto px-5 py-4 bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 font-hud text-sm rounded-xl shadow-md backdrop-blur-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>CONTROLS</span>
          </button>
        </div>

        {/* Player Career Stats */}
        <div className="mt-10 flex items-center gap-6 sm:gap-10 py-3 px-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md shadow-xl text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-medium">TOTAL STARS</div>
              <div className="font-hud font-bold text-slate-100 flex items-center gap-1">
                <span>{totalStars}</span>
                <span className="text-slate-500 font-normal">/ {maxPossibleStars}</span>
              </div>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2.5">
            <Star className="w-4 h-4 text-sky-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-medium">COMPLETED</div>
              <div className="font-hud font-bold text-slate-100">
                {Object.values(progress).filter((p) => (p.stars || 0) > 0).length} / {GAME_LEVELS.length} Levels
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-slate-500">
        <div>Daytime 3D Parking Simulator · Smooth Kinematic Physics</div>
        <div className="hidden sm:block">PC Keyboard (WASD/Arrows) & Mobile Touch Ready</div>
      </footer>
    </div>
  );
};
