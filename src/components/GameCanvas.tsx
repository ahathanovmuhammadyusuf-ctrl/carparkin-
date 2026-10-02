import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { CameraViewMode, CarControls, GameScoreResult, LevelConfig } from '../types/game';
import { CarPhysics } from '../game/physics';
import { CarMeshReferences, ParkingZoneMeshReferences, SceneBuilder } from '../game/sceneBuilder';
import { soundManager } from '../audio/soundManager';

interface GameCanvasProps {
  level: LevelConfig;
  cameraMode: CameraViewMode;
  isPaused: boolean;
  lives: number;
  externalControls: CarControls;
  onUpdateHUD: (data: {
    speedKmh: number;
    gear: 'P' | 'D' | 'R';
    posAccuracy: number;
    angleAccuracy: number;
    isInsideZone: boolean;
    parkProgress: number; // 0 to 1 (hold to park)
  }) => void;
  onCrash: (livesLeft: number) => void;
  onLevelComplete: (result: GameScoreResult) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  cameraMode,
  isPaused,
  lives,
  externalControls,
  onUpdateHUD,
  onCrash,
  onLevelComplete,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Keyboard controls ref
  const keysRef = useRef<CarControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    handbrake: false,
  });

  // State refs to avoid closure staleness in render loop
  const pausedRef = useRef(isPaused);
  pausedRef.current = isPaused;

  const livesRef = useRef(lives);
  livesRef.current = lives;

  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  const externalControlsRef = useRef(externalControls);
  externalControlsRef.current = externalControls;

  // Collision cooldown timer
  const lastCollisionTimeRef = useRef<number>(0);
  const cameraShakeRef = useRef<number>(0);

  // Parking completion detection timer
  const parkHoldTimerRef = useRef<number>(0);
  const levelStartTimeRef = useRef<number>(performance.now());
  const isCompletedRef = useRef<boolean>(false);

  // Physics engine instance
  const physicsRef = useRef<CarPhysics>(new CarPhysics());

  // Setup Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid interference if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keysRef.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keysRef.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keysRef.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keysRef.current.right = true;
          break;
        case 'Space':
          keysRef.current.handbrake = true;
          e.preventDefault();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keysRef.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keysRef.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keysRef.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keysRef.current.right = false;
          break;
        case 'Space':
          keysRef.current.handbrake = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Three.js Scene Setup & Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Reset game state for current level
    isCompletedRef.current = false;
    parkHoldTimerRef.current = 0;
    levelStartTimeRef.current = performance.now();
    physicsRef.current.reset(level.playerSpawn.x, level.playerSpawn.z, level.playerSpawn.rotation);

    // Three.js Core
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 350);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Setup Environment lighting & sky
    SceneBuilder.setupEnvironment(scene);

    // Build Ground Plane (Asphalt)
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      map: SceneBuilder.getAsphaltTexture(),
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    scene.add(ground);

    // Road Markings
    const roadMarkings = SceneBuilder.createRoadMarkings();
    scene.add(roadMarkings);

    // Build Player Car
    const carRefs: CarMeshReferences = SceneBuilder.createPlayerCar();
    scene.add(carRefs.root);

    // Build Parking Zone
    const pZoneRefs: ParkingZoneMeshReferences = SceneBuilder.createParkingZone(level.parkingZone);
    scene.add(pZoneRefs.group);

    // Build Obstacles & Scenery
    const obstaclesGroup = SceneBuilder.createObstacles(level.obstacles);
    scene.add(obstaclesGroup);

    if (level.scenery?.parkedCars) {
      const parkedCarsGroup = SceneBuilder.createParkedCars(level.scenery.parkedCars);
      scene.add(parkedCarsGroup);
    }

    if (level.scenery) {
      const sceneryGroup = SceneBuilder.createScenery(level.scenery);
      scene.add(sceneryGroup);
    }

    // Start engine audio
    soundManager.startEngine();

    // Camera follow state
    const currentCamPos = new THREE.Vector3(
      level.playerSpawn.x,
      7,
      level.playerSpawn.z + 12
    );
    const currentCamLookAt = new THREE.Vector3(level.playerSpawn.x, 1, level.playerSpawn.z);

    // Animation Loop
    let lastTime = performance.now();
    let animFrameId: number;

    const animate = (time: number) => {
      animFrameId = requestAnimationFrame(animate);

      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (pausedRef.current || isCompletedRef.current) {
        soundManager.updateEngine(0, false);
        renderer.render(scene, camera);
        return;
      }

      // Merge keyboard controls with on-screen touch controls
      const activeControls: CarControls = {
        forward: keysRef.current.forward || externalControlsRef.current.forward,
        backward: keysRef.current.backward || externalControlsRef.current.backward,
        left: keysRef.current.left || externalControlsRef.current.left,
        right: keysRef.current.right || externalControlsRef.current.right,
        handbrake: keysRef.current.handbrake || externalControlsRef.current.handbrake,
      };

      // 1. Update Physics
      const collision = physicsRef.current.update(activeControls, level.obstacles, dt);
      const state = physicsRef.current.state;

      // Handle Collision event
      if (collision.hasCollided) {
        const now = performance.now();
        if (now - lastCollisionTimeRef.current > 420) {
          lastCollisionTimeRef.current = now;
          cameraShakeRef.current = Math.min(0.65, 0.25 + collision.intensity * 0.25);
          soundManager.playCrashSound(collision.intensity);

          const newLives = Math.max(0, livesRef.current - 1);
          onCrash(newLives);
        }
      }

      // 2. Play brake / skid sound if braking hard or handbraking at speed
      const isBraking = (activeControls.backward && state.speed > 1.2) ||
        (activeControls.forward && state.speed < -1.2) ||
        (activeControls.handbrake && Math.abs(state.speed) > 1.0);
      if (isBraking && Math.random() < 0.22) {
        soundManager.playBrakeSound(Math.abs(state.speed) / 6.0);
      }

      // 3. Update Engine audio pitch & rumble
      const normalizedSpeed = Math.abs(state.speed) / physicsRef.current.maxForwardSpeed;
      soundManager.updateEngine(normalizedSpeed, activeControls.forward || activeControls.backward);

      // 4. Update Player Car 3D Meshes
      carRefs.root.position.set(state.x, 0, state.z);
      carRefs.root.rotation.y = state.rotation;

      // Wheel steering & rotation
      carRefs.frontLeftWheel.rotation.y = state.steerAngle;
      carRefs.frontRightWheel.rotation.y = state.steerAngle;
      carRefs.frontLeftWheel.children[0].rotation.x = state.wheelRotation;
      carRefs.frontRightWheel.children[0].rotation.x = state.wheelRotation;
      carRefs.rearLeftWheel.children[0].rotation.x = state.wheelRotation;
      carRefs.rearRightWheel.children[0].rotation.x = state.wheelRotation;

      // Update Taillights & Reverse lights
      const brakeActive = activeControls.handbrake || (activeControls.backward && state.speed > 0.1);
      carRefs.taillightMaterials.forEach((mat) => {
        mat.emissiveIntensity = brakeActive ? 2.2 : 0.6;
      });

      const isReverse = state.gear === 'R';
      carRefs.reverseLightMaterials.forEach((mat) => {
        mat.emissiveIntensity = isReverse ? 1.5 : 0;
      });

      // 5. Animate Parking Beacon
      pZoneRefs.beaconGroup.position.y = 3.0 + Math.sin(time * 0.0035) * 0.25;
      pZoneRefs.beaconGroup.rotation.y = time * 0.0018;

      // 6. Evaluate Parking Accuracy & Zone Completion
      const zone = level.parkingZone;
      const dx = state.x - zone.x;
      const dz = state.z - zone.z;
      const distFromCenter = Math.sqrt(dx * dx + dz * dz);

      // Calculate angle difference (considering 180-deg reverse if allowed)
      let angleDiff = Math.abs(state.rotation - zone.rotation);
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      angleDiff = Math.abs(angleDiff);

      if (zone.allowReverse) {
        let revAngleDiff = Math.abs(state.rotation - (zone.rotation + Math.PI));
        while (revAngleDiff > Math.PI) revAngleDiff -= Math.PI * 2;
        revAngleDiff = Math.abs(revAngleDiff);
        angleDiff = Math.min(angleDiff, revAngleDiff);
      }

      const maxPosTol = zone.posTolerance ?? 0.85;
      const maxAngTol = zone.angleTolerance ?? 0.26;

      const posAccuracy = Math.max(0, Math.min(100, Math.round((1 - distFromCenter / (maxPosTol * 2.2)) * 100)));
      const angleAccuracy = Math.max(0, Math.min(100, Math.round((1 - angleDiff / (maxAngTol * 2.2)) * 100)));

      const isInside = distFromCenter <= maxPosTol && angleDiff <= maxAngTol;
      const isStopped = Math.abs(state.speed) < 0.35;

      // Visual indicator color: bright pulse when aligned
      if (isInside) {
        pZoneRefs.markerMaterial.color.setHex(0x4ade80);
        pZoneRefs.markerMaterial.opacity = 0.55 + Math.sin(time * 0.008) * 0.2;
      } else {
        pZoneRefs.markerMaterial.color.setHex(0x22c55e);
        pZoneRefs.markerMaterial.opacity = 0.35;
      }

      // Parking progress hold (must remain stopped inside zone for ~0.8s)
      const REQUIRED_HOLD_TIME = 0.75;
      if (isInside && isStopped && !isCompletedRef.current) {
        parkHoldTimerRef.current += dt;
      } else {
        parkHoldTimerRef.current = Math.max(0, parkHoldTimerRef.current - dt * 2);
      }

      const parkProgress = Math.min(1, parkHoldTimerRef.current / REQUIRED_HOLD_TIME);

      // Trigger Parking Complete!
      if (parkProgress >= 1.0 && !isCompletedRef.current) {
        isCompletedRef.current = true;
        soundManager.playSuccessSound();

        const timeTaken = Math.round((performance.now() - levelStartTimeRef.current) / 1000);
        const timeBonus = Math.max(0, (level.parTime - timeTaken) * 80);
        const livesBonus = livesRef.current * 500;
        const accuracyWeighted = (posAccuracy * 0.6 + angleAccuracy * 0.4) / 100;
        const baseScoreEarned = Math.round(level.baseScore * accuracyWeighted);
        const totalScore = Math.max(100, baseScoreEarned + timeBonus + livesBonus);

        // Compute Stars (1 - 3)
        let stars = 1;
        if (totalScore >= level.baseScore * 0.85 && posAccuracy >= 75) {
          stars = 3;
        } else if (totalScore >= level.baseScore * 0.6 || posAccuracy >= 60) {
          stars = 2;
        }

        onLevelComplete({
          posAccuracy,
          angleAccuracy,
          timeTaken,
          livesRemaining: livesRef.current,
          totalScore,
          stars,
        });
      }

      // Push telemetry to HUD
      const speedKmh = Math.round(Math.abs(state.speed) * 3.6);
      onUpdateHUD({
        speedKmh,
        gear: state.gear,
        posAccuracy,
        angleAccuracy,
        isInsideZone: isInside,
        parkProgress,
      });

      // 7. Camera Tracking & Shake
      const forwardVec = new THREE.Vector3(-Math.sin(state.rotation), 0, -Math.cos(state.rotation));
      let targetCamPos = new THREE.Vector3();
      let targetLookAt = new THREE.Vector3(state.x, 1.1, state.z);

      const mode = cameraModeRef.current;
      if (mode === 'top_down') {
        targetCamPos.set(state.x, 26, state.z + 0.1);
        targetLookAt.set(state.x, 0, state.z);
      } else if (mode === 'hood') {
        // First-person hood/cockpit cam
        const hoodOffset = forwardVec.clone().multiplyScalar(0.7);
        targetCamPos.set(state.x + hoodOffset.x, 1.25, state.z + hoodOffset.z);
        const lookAhead = forwardVec.clone().multiplyScalar(15);
        targetLookAt.set(state.x + lookAhead.x, 0.8, state.z + lookAhead.z);
      } else {
        // Chase Cam (Default smooth 3rd person)
        const distBehind = 7.5;
        const heightAbove = 3.6;
        targetCamPos.set(
          state.x - forwardVec.x * distBehind,
          heightAbove,
          state.z - forwardVec.z * distBehind
        );
        const lookAhead = forwardVec.clone().multiplyScalar(4.0);
        targetLookAt.set(state.x + lookAhead.x, 1.0, state.z + lookAhead.z);
      }

      // Smooth camera interpolation
      const camLerp = mode === 'top_down' ? 0.08 : 0.09;
      currentCamPos.lerp(targetCamPos, camLerp);
      currentCamLookAt.lerp(targetLookAt, camLerp);

      // Camera Shake
      if (cameraShakeRef.current > 0.001) {
        const shakeMag = cameraShakeRef.current;
        camera.position.set(
          currentCamPos.x + (Math.random() - 0.5) * shakeMag,
          currentCamPos.y + (Math.random() - 0.5) * shakeMag,
          currentCamPos.z + (Math.random() - 0.5) * shakeMag
        );
        cameraShakeRef.current *= 0.88;
      } else {
        camera.position.copy(currentCamPos);
      }

      camera.lookAt(currentCamLookAt);

      // Dynamic FOV with speed
      if (mode === 'chase') {
        const targetFov = 60 + normalizedSpeed * 7;
        camera.fov += (targetFov - camera.fov) * 0.05;
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId);
      soundManager.stopEngine();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.innerHTML = '';
      }
    };
  }, [level, onCrash, onLevelComplete, onUpdateHUD]);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
    />
  );
};
