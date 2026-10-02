import { BoxCollider, LevelConfig } from '../types/game';

// Helper to create standard perimeter walls around a rectangular map
function createPerimeterWalls(halfWidth: number, halfLength: number, wallThickness: number = 1.2): BoxCollider[] {
  return [
    // North wall (-Z)
    { x: 0, z: -halfLength, width: halfWidth * 2, length: wallThickness, rotation: 0, type: 'wall' },
    // South wall (+Z)
    { x: 0, z: halfLength, width: halfWidth * 2, length: wallThickness, rotation: 0, type: 'wall' },
    // West wall (-X)
    { x: -halfWidth, z: 0, width: wallThickness, length: halfLength * 2, rotation: 0, type: 'wall' },
    // East wall (+X)
    { x: halfWidth, z: 0, width: wallThickness, length: halfLength * 2, rotation: 0, type: 'wall' },
  ];
}

export const GAME_LEVELS: LevelConfig[] = [
  // ==========================================
  // LEVEL 1: EASY - Forward Pull-In Bay
  // ==========================================
  {
    id: 1,
    name: 'Level 1 — Easy',
    subtitle: 'Sunny Plaza: Forward Entry',
    difficulty: 'Easy',
    description: 'Drive along the wide access lane and smoothly pull straight into the designated green parking bay.',
    playerSpawn: {
      x: 0,
      z: 22,
      rotation: 0, // facing -Z (forward)
    },
    parkingZone: {
      x: 0,
      z: -10,
      width: 3.2,
      length: 6.0,
      rotation: 0,
      posTolerance: 0.9,
      angleTolerance: 0.28, // ~16 deg
    },
    obstacles: [
      ...createPerimeterWalls(26, 34),
      // Guide cones on left and right of entry lane
      { x: -3.5, z: 6, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      { x: 3.5, z: 6, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      { x: -3.5, z: -2, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      { x: 3.5, z: -2, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      // Left and right parking bay curb barriers
      { x: -2.3, z: -10, width: 0.4, length: 5.5, rotation: 0, type: 'curb' },
      { x: 2.3, z: -10, width: 0.4, length: 5.5, rotation: 0, type: 'curb' },
      // Front parking wheel stop / barrier
      { x: 0, z: -13.2, width: 2.6, length: 0.5, rotation: 0, type: 'barrier' },
      // Adjacent parked cars far away
      { x: -7, z: -10, width: 2.0, length: 4.5, rotation: 0, type: 'car' },
      { x: 7, z: -10, width: 2.0, length: 4.5, rotation: 0, type: 'car' },
    ],
    scenery: {
      trees: [
        { x: -16, z: -18 }, { x: -16, z: 0 }, { x: -16, z: 18 },
        { x: 16, z: -18 }, { x: 16, z: 0 }, { x: 16, z: 18 },
      ],
      lamps: [
        { x: -10, z: 12 }, { x: 10, z: 12 },
        { x: -10, z: -8 }, { x: 10, z: -8 },
      ],
      buildings: [
        { x: -22, z: -24, width: 14, length: 18, height: 16, color: 0x334155 },
        { x: 22, z: -24, width: 14, length: 18, height: 22, color: 0x1e293b },
        { x: 0, z: -32, width: 38, length: 12, height: 14, color: 0x475569 },
      ],
      parkedCars: [
        { x: -7, z: -10, rotation: 0, color: '#3b82f6', model: 'suv' },
        { x: 7, z: -10, rotation: 0, color: '#ef4444', model: 'sports' },
        { x: -12, z: 10, rotation: Math.PI / 2, color: '#10b981', model: 'sedan' },
      ],
    },
    parTime: 25,
    baseScore: 5000,
  },

  // ==========================================
  // LEVEL 2: NORMAL - 90° Perpendicular Bay
  // ==========================================
  {
    id: 2,
    name: 'Level 2 — Normal',
    subtitle: 'Commercial Hub: 90° Turn Bay',
    difficulty: 'Normal',
    description: 'Drive along the avenue, execute a sharp 90-degree right turn, and fit neatly between two parked vehicles.',
    playerSpawn: {
      x: -16,
      z: 16,
      rotation: -Math.PI / 2, // facing +X (moving east along avenue)
    },
    parkingZone: {
      x: 6,
      z: -6,
      width: 2.9,
      length: 5.6,
      rotation: 0, // facing -Z
      posTolerance: 0.8,
      angleTolerance: 0.24,
    },
    obstacles: [
      ...createPerimeterWalls(28, 28),
      // Road divider curbs
      { x: -8, z: 22, width: 18, length: 0.8, rotation: 0, type: 'curb' },
      // Parked car to left of target bay
      { x: 2.8, z: -6, width: 2.0, length: 4.6, rotation: 0, type: 'car' },
      // Parked car to right of target bay
      { x: 9.2, z: -6, width: 2.0, length: 4.6, rotation: 0, type: 'car' },
      // Bay back barrier
      { x: 6, z: -9.2, width: 2.8, length: 0.6, rotation: 0, type: 'barrier' },
      // Corner safety cones to guide turning apex
      { x: 0.8, z: 6, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      { x: 1.5, z: 2, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      { x: 10.5, z: 5, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      // Pedestrian walkway barrier on south
      { x: -5, z: 9, width: 0.6, length: 8.0, rotation: Math.PI / 2, type: 'barrier' },
    ],
    scenery: {
      trees: [
        { x: -20, z: -18 }, { x: -20, z: 0 }, { x: -20, z: 18 },
        { x: 18, z: -18 }, { x: 18, z: 18 },
      ],
      lamps: [
        { x: -14, z: 10 }, { x: -2, z: 10 }, { x: 10, z: 10 },
        { x: 6, z: -14 },
      ],
      buildings: [
        { x: -16, z: -20, width: 16, length: 12, height: 18, color: 0x1e293b },
        { x: 6, z: -20, width: 22, length: 12, height: 26, color: 0x334155 },
        { x: 22, z: 0, width: 12, length: 30, height: 16, color: 0x0f172a },
      ],
      parkedCars: [
        { x: 2.8, z: -6, rotation: 0, color: '#f59e0b', model: 'suv' },
        { x: 9.2, z: -6, rotation: 0, color: '#64748b', model: 'sedan' },
        { x: 15, z: -6, rotation: 0, color: '#ef4444', model: 'sports' },
        { x: -10, z: -6, rotation: 0, color: '#06b6d4', model: 'sedan' },
      ],
    },
    parTime: 35,
    baseScore: 6000,
  },

  // ==========================================
  // LEVEL 3: DIFFICULT - Reverse Bay Parking
  // ==========================================
  {
    id: 3,
    name: 'Level 3 — Difficult',
    subtitle: 'Underground Annex: Reverse Bay',
    difficulty: 'Hard',
    description: 'Pull past the tight bay, shift into reverse [S], and back the car precisely into the protected spot.',
    playerSpawn: {
      x: -14,
      z: 8,
      rotation: -Math.PI / 2, // facing +X
    },
    parkingZone: {
      x: -2,
      z: -7,
      width: 2.8,
      length: 5.5,
      rotation: 0, // car faces -Z (or reversed Math.PI)
      allowReverse: true,
      posTolerance: 0.75,
      angleTolerance: 0.22,
    },
    obstacles: [
      ...createPerimeterWalls(26, 26),
      // Left barrier pillar
      { x: -4.0, z: -6.5, width: 0.8, length: 5.2, rotation: 0, type: 'barrier' },
      // Right barrier pillar
      { x: 0.0, z: -6.5, width: 0.8, length: 5.2, rotation: 0, type: 'barrier' },
      // Rear wall barrier
      { x: -2.0, z: -9.8, width: 2.8, length: 0.6, rotation: 0, type: 'barrier' },
      // Opposite curb narrowing the turnaround lane
      { x: -4, z: 12, width: 22, length: 1.0, rotation: 0, type: 'curb' },
      // Parked SUV across the alleyway creating blind corner
      { x: 8, z: -7, width: 2.1, length: 4.8, rotation: 0, type: 'car' },
      // Traffic cones protecting aisle
      { x: -5.0, z: -2.5, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      { x: 1.0, z: -2.5, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      { x: 5.5, z: 2.0, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
    ],
    scenery: {
      trees: [
        { x: -20, z: -18 }, { x: -20, z: 18 }, { x: 20, z: -18 }, { x: 20, z: 18 },
      ],
      lamps: [
        { x: -8, z: 5 }, { x: 4, z: 5 }, { x: -2, z: -12 },
      ],
      buildings: [
        { x: -16, z: -18, width: 14, length: 14, height: 20, color: 0x1e293b },
        { x: 16, z: -18, width: 16, length: 16, height: 24, color: 0x334155 },
        { x: 0, z: 20, width: 32, length: 10, height: 16, color: 0x0f172a },
      ],
      parkedCars: [
        { x: 8, z: -7, rotation: 0, color: '#3b82f6', model: 'suv' },
        { x: -10, z: -7, rotation: 0, color: '#e11d48', model: 'sports' },
        { x: 8, z: 6, rotation: Math.PI / 2, color: '#64748b', model: 'sedan' },
      ],
    },
    parTime: 45,
    baseScore: 7500,
  },

  // ==========================================
  // LEVEL 4: TIGHT PARKING - Parallel Parking
  // ==========================================
  {
    id: 4,
    name: 'Level 4 — Tight Parking',
    subtitle: 'Downtown Boulevard: Parallel Park',
    difficulty: 'Tight',
    description: 'Real-world parallel parking! Reverse into the curb slot tightly wedged between a luxury sedan and sports car.',
    playerSpawn: {
      x: 2.2,
      z: 16,
      rotation: 0, // facing -Z
    },
    parkingZone: {
      x: -4.5,
      z: 0,
      width: 2.6,
      length: 6.2,
      rotation: 0, // parallel along Z axis
      allowReverse: true,
      posTolerance: 0.7,
      angleTolerance: 0.18, // ~10 deg strict alignment!
    },
    obstacles: [
      ...createPerimeterWalls(24, 30),
      // Sidewalk curb along West side
      { x: -6.4, z: 0, width: 0.8, length: 28, rotation: 0, type: 'curb' },
      // Parked Car in FRONT of parking spot
      { x: -4.5, z: -6.2, width: 2.0, length: 4.6, rotation: 0, type: 'car' },
      // Parked Car BEHIND parking spot
      { x: -4.5, z: 6.2, width: 2.0, length: 4.6, rotation: 0, type: 'car' },
      // Opposite lane median divider
      { x: 6.0, z: 0, width: 1.0, length: 26, rotation: 0, type: 'barrier' },
      // Warning cones at boundary
      { x: -3.0, z: -8.8, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      { x: -3.0, z: 8.8, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
    ],
    scenery: {
      trees: [
        { x: -9, z: -10 }, { x: -9, z: 0 }, { x: -9, z: 10 },
        { x: 9, z: -10 }, { x: 9, z: 0 }, { x: 9, z: 10 },
      ],
      lamps: [
        { x: -7.5, z: -5 }, { x: -7.5, z: 5 }, { x: 7.5, z: 0 },
      ],
      buildings: [
        { x: -16, z: 0, width: 12, length: 36, height: 28, color: 0x1e293b },
        { x: 16, z: 0, width: 14, length: 36, height: 32, color: 0x334155 },
      ],
      parkedCars: [
        { x: -4.5, z: -6.2, rotation: 0, color: '#f59e0b', model: 'sports' },
        { x: -4.5, z: 6.2, rotation: 0, color: '#38bdf8', model: 'sedan' },
        { x: -4.5, z: -12.5, rotation: 0, color: '#64748b', model: 'suv' },
      ],
    },
    parTime: 50,
    baseScore: 9000,
  },

  // ==========================================
  // LEVEL 5: EXPERT PARKING - Slalom & Angled VIP
  // ==========================================
  {
    id: 5,
    name: 'Level 5 — Expert Parking',
    subtitle: 'Harbor Marina: Slalom & Angled VIP',
    difficulty: 'Expert',
    description: 'Navigate through a slalom of construction barriers and cones to position cleanly into an angled 45° executive bay.',
    playerSpawn: {
      x: -16,
      z: 22,
      rotation: 0, // facing -Z
    },
    parkingZone: {
      x: 12,
      z: -12,
      width: 2.7,
      length: 5.6,
      rotation: -Math.PI / 4, // 45 degrees angled bay (-45 deg)
      posTolerance: 0.65,
      angleTolerance: 0.18,
    },
    obstacles: [
      ...createPerimeterWalls(30, 32),
      // Chicane barrier 1 (forces turn right)
      { x: -16, z: 10, width: 8, length: 0.8, rotation: 0, type: 'barrier' },
      // Slalom cones
      { x: -10, z: 10, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      { x: -6, z: 5, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      // Chicane barrier 2 (forces turn left)
      { x: -2, z: 0, width: 8, length: 0.8, rotation: 0, type: 'barrier' },
      // Slalom cones 2
      { x: 3, z: 0, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      { x: 6, z: -4, width: 0.5, length: 0.5, rotation: 0, type: 'cone' },
      // Construction hazard barrier 3
      { x: 2, z: -12, width: 1.0, length: 10, rotation: 0, type: 'barrier' },
      // VIP angled bay left divider
      { x: 9.8, z: -14.2, width: 0.4, length: 5.4, rotation: -Math.PI / 4, type: 'curb' },
      // VIP angled bay right divider
      { x: 14.2, z: -9.8, width: 0.4, length: 5.4, rotation: -Math.PI / 4, type: 'curb' },
      // VIP bay rear stop barrier
      { x: 14.8, z: -14.8, width: 2.6, length: 0.6, rotation: -Math.PI / 4, type: 'barrier' },
      // Parked car in adjacent angled stall
      { x: 17.5, z: -6.5, width: 2.0, length: 4.6, rotation: -Math.PI / 4, type: 'car' },
    ],
    scenery: {
      trees: [
        { x: -22, z: -15 }, { x: -22, z: 0 }, { x: -22, z: 15 },
        { x: 22, z: 5 }, { x: 22, z: 20 },
      ],
      lamps: [
        { x: -12, z: 16 }, { x: -4, z: 6 }, { x: 4, z: -4 }, { x: 12, z: -18 },
      ],
      buildings: [
        { x: -22, z: -20, width: 14, length: 18, height: 22, color: 0x0f172a },
        { x: 0, z: -24, width: 22, length: 12, height: 16, color: 0x1e293b },
        { x: 22, z: -22, width: 14, length: 16, height: 28, color: 0x334155 },
      ],
      parkedCars: [
        { x: 17.5, z: -6.5, rotation: -Math.PI / 4, color: '#ef4444', model: 'sports' },
        { x: -10, z: -18, rotation: 0, color: '#3b82f6', model: 'suv' },
        { x: -14, z: -18, rotation: 0, color: '#f59e0b', model: 'sedan' },
      ],
    },
    parTime: 55,
    baseScore: 10000,
  },
];
