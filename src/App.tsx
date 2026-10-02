import React, { useState, useEffect, useCallback } from 'react';
import { CameraViewMode, CarControls, GameScoreResult, GameScreen, LevelProgress } from './types/game';
import { GAME_LEVELS } from './game/levels';
import { soundManager } from './audio/soundManager';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { LevelSelectModal } from './components/LevelSelectModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';

const MAX_LIVES = 3;
const STORAGE_KEY = 'upc_progress_v1';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('chase');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [levelCompleteResult, setLevelCompleteResult] = useState<GameScoreResult | null>(null);
  const [isCrashAlert, setIsCrashAlert] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());

  // HUD Realtime telemetry state
  const [hudData, setHudData] = useState({
    speedKmh: 0,
    gear: 'P' as 'P' | 'D' | 'R',
    posAccuracy: 0,
    angleAccuracy: 0,
    isInsideZone: false,
    parkProgress: 0,
  });

  // Touch controls state
  const [externalControls, setExternalControls] = useState<CarControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    handbrake: false,
  });

  // Level progression state
  const [progress, setProgress] = useState<Record<number, LevelProgress>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Default initial state
    }
    const initial: Record<number, LevelProgress> = {};
    GAME_LEVELS.forEach((lvl, idx) => {
      initial[lvl.id] = {
        unlocked: idx === 0, // Level 1 is unlocked initially
        highScore: 0,
        stars: 0,
      };
    });
    return initial;
  });

  // Save progress helper
  const saveProgress = useCallback((newProgress: Record<number, LevelProgress>) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch {
      // Storage safe ignore
    }
  }, []);

  const currentLevel = GAME_LEVELS.find((l) => l.id === currentLevelId) || GAME_LEVELS[0];

  // Start or switch to a level
  const handleStartGame = (levelId: number = 1) => {
    soundManager.playClickSound();
    setCurrentLevelId(levelId);
    setLives(MAX_LIVES);
    setIsPaused(false);
    setIsGameOver(false);
    setLevelCompleteResult(null);
    setIsCrashAlert(false);
    setExternalControls({
      forward: false,
      backward: false,
      left: false,
      right: false,
      handbrake: false,
    });
    setScreen('playing');
  };

  // Restart current level
  const handleRestart = () => {
    soundManager.playClickSound();
    handleStartGame(currentLevelId);
  };

  // Next level
  const handleNextLevel = () => {
    soundManager.playClickSound();
    const nextId = currentLevelId + 1;
    if (nextId <= GAME_LEVELS.length) {
      handleStartGame(nextId);
    } else {
      setScreen('level_select');
    }
  };

  // Handle Crash event
  const handleCrash = useCallback((livesLeft: number) => {
    setLives(livesLeft);
    setIsCrashAlert(true);
    setTimeout(() => {
      setIsCrashAlert(false);
    }, 900);

    if (livesLeft <= 0) {
      setIsGameOver(true);
    }
  }, []);

  // Handle Level Complete
  const handleLevelComplete = useCallback((result: GameScoreResult) => {
    setLevelCompleteResult(result);

    // Update level progress & unlock next level
    setProgress((prev) => {
      const currentProg = prev[currentLevelId] || { unlocked: true, highScore: 0, stars: 0 };
      const newHighScore = Math.max(currentProg.highScore, result.totalScore);
      const newStars = Math.max(currentProg.stars, result.stars);

      const updated = {
        ...prev,
        [currentLevelId]: {
          unlocked: true,
          highScore: newHighScore,
          stars: newStars,
        },
      };

      // Unlock next level if available
      const nextId = currentLevelId + 1;
      if (nextId <= GAME_LEVELS.length) {
        updated[nextId] = {
          ...(updated[nextId] || { highScore: 0, stars: 0 }),
          unlocked: true,
        };
      }

      saveProgress(updated);
      return updated;
    });
  }, [currentLevelId, saveProgress]);

  // Toggle Camera View Mode
  const handleToggleCamera = () => {
    soundManager.playClickSound();
    setCameraMode((prev) => {
      if (prev === 'chase') return 'top_down';
      if (prev === 'top_down') return 'hood';
      return 'chase';
    });
  };

  // Toggle Sound Mute
  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Keyboard shortcut for camera switch ('KeyC')
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (screen === 'playing' && e.code === 'KeyC') {
        handleToggleCamera();
      }
      if (screen === 'playing' && (e.code === 'KeyP' || e.code === 'Escape')) {
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [screen]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Main Menu Screen */}
      {screen === 'menu' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenLevelSelect={() => {
            soundManager.playClickSound();
            setScreen('level_select');
          }}
          onOpenGuide={() => {
            soundManager.playClickSound();
            setIsGuideOpen(true);
          }}
          progress={progress}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 2. Level Select Modal */}
      {screen === 'level_select' && (
        <LevelSelectModal
          progress={progress}
          onSelectLevel={(lvlId) => handleStartGame(lvlId)}
          onBackToMenu={() => {
            soundManager.playClickSound();
            setScreen('menu');
          }}
        />
      )}

      {/* 3. Active 3D Gameplay Screen */}
      {screen === 'playing' && (
        <div className="relative w-full h-full">
          {/* Three.js 3D WebGL Canvas */}
          <GameCanvas
            key={`canvas-level-${currentLevelId}`}
            level={currentLevel}
            cameraMode={cameraMode}
            isPaused={isPaused || isGameOver || !!levelCompleteResult}
            lives={lives}
            externalControls={externalControls}
            onUpdateHUD={setHudData}
            onCrash={handleCrash}
            onLevelComplete={handleLevelComplete}
          />

          {/* Floating In-Game HUD Layer */}
          <HUD
            level={currentLevel}
            speedKmh={hudData.speedKmh}
            gear={hudData.gear}
            posAccuracy={hudData.posAccuracy}
            angleAccuracy={hudData.angleAccuracy}
            isInsideZone={hudData.isInsideZone}
            parkProgress={hudData.parkProgress}
            lives={lives}
            maxLives={MAX_LIVES}
            cameraMode={cameraMode}
            isMuted={isMuted}
            isCrashAlert={isCrashAlert}
            onToggleCamera={handleToggleCamera}
            onToggleMute={handleToggleMute}
            onRestart={handleRestart}
            onPause={() => {
              soundManager.playClickSound();
              setIsPaused(true);
            }}
            externalControls={externalControls}
            setExternalControls={setExternalControls}
          />

          {/* Pause Modal */}
          {isPaused && (
            <PauseModal
              level={currentLevel}
              onResume={() => {
                soundManager.playClickSound();
                setIsPaused(false);
              }}
              onRestart={handleRestart}
              onOpenLevelSelect={() => {
                soundManager.playClickSound();
                setIsPaused(false);
                setScreen('level_select');
              }}
              onBackToMenu={() => {
                soundManager.playClickSound();
                setIsPaused(false);
                setScreen('menu');
              }}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />
          )}

          {/* Game Over Modal */}
          {isGameOver && (
            <GameOverModal
              level={currentLevel}
              onRetry={handleRestart}
              onOpenLevelSelect={() => {
                soundManager.playClickSound();
                setScreen('level_select');
              }}
              onBackToMenu={() => {
                soundManager.playClickSound();
                setScreen('menu');
              }}
            />
          )}

          {/* Level Complete Modal */}
          {levelCompleteResult && (
            <LevelCompleteModal
              level={currentLevel}
              result={levelCompleteResult}
              onNextLevel={handleNextLevel}
              onRetry={handleRestart}
              onOpenLevelSelect={() => {
                soundManager.playClickSound();
                setScreen('level_select');
              }}
              onBackToMenu={() => {
                soundManager.playClickSound();
                setScreen('menu');
              }}
            />
          )}
        </div>
      )}

      {/* Controls & How to Play Modal (Can be opened from anywhere) */}
      {isGuideOpen && (
        <ControlsGuideModal
          onClose={() => {
            soundManager.playClickSound();
            setIsGuideOpen(false);
          }}
        />
      )}
    </div>
  );
}
