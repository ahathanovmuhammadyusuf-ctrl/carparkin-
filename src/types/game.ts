export type GameScreen = 'menu' | 'level_select' | 'playing';

export type CameraViewMode = 'chase' | 'top_down' | 'hood';

export interface CarControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  handbrake: boolean;
}

export interface Vector2D {
  x: number;
  z: number;
}

export interface BoxCollider {
  x: number;
  z: number;
  width: number; // along local X
  length: number; // along local Z
  rotation: number; // radians
  type: 'wall' | 'barrier' | 'cone' | 'car' | 'building' | 'tree' | 'curb';
  penalty?: number;
}

export interface ParkingZone {
  x: number;
  z: number;
  width: number; // bay width (e.g. 2.8m)
  length: number; // bay length (e.g. 5.5m)
  rotation: number; // target angle in radians
  allowReverse?: boolean; // if true, 180 deg reverse is also valid
  posTolerance?: number; // max distance from center in meters (default 0.75m)
  angleTolerance?: number; // max angle deviation in radians (default ~15 deg)
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Tight' | 'Expert';
  description: string;
  playerSpawn: {
    x: number;
    z: number;
    rotation: number;
  };
  parkingZone: ParkingZone;
  obstacles: BoxCollider[];
  scenery?: {
    trees?: Vector2D[];
    lamps?: Vector2D[];
    buildings?: { x: number; z: number; width: number; length: number; height: number; color?: number }[];
    parkedCars?: { x: number; z: number; rotation: number; color: string; model?: 'sedan' | 'suv' | 'sports' }[];
  };
  parTime: number; // seconds
  baseScore: number;
}

export interface GameScoreResult {
  posAccuracy: number; // 0 - 100%
  angleAccuracy: number; // 0 - 100%
  timeTaken: number; // seconds
  livesRemaining: number;
  totalScore: number;
  stars: number; // 1, 2, or 3
}

export interface LevelProgress {
  unlocked: boolean;
  highScore: number;
  stars: number;
}
