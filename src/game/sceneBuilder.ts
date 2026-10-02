import * as THREE from 'three';
import { BoxCollider, LevelConfig, ParkingZone } from '../types/game';

export interface CarMeshReferences {
  root: THREE.Group;
  frontLeftWheel: THREE.Group;
  frontRightWheel: THREE.Group;
  rearLeftWheel: THREE.Group;
  rearRightWheel: THREE.Group;
  taillightMaterials: THREE.MeshStandardMaterial[];
  reverseLightMaterials: THREE.MeshStandardMaterial[];
  headlights: THREE.SpotLight[];
}

export interface ParkingZoneMeshReferences {
  group: THREE.Group;
  markerMaterial: THREE.MeshBasicMaterial;
  beaconGroup: THREE.Group;
}

export class SceneBuilder {
  // Shared textures & materials cache
  private static asphaltTexture: THREE.CanvasTexture | null = null;
  private static hazardTexture: THREE.CanvasTexture | null = null;

  public static getAsphaltTexture(): THREE.CanvasTexture {
    if (!this.asphaltTexture) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Dark asphalt base
      ctx.fillStyle = '#22262d';
      ctx.fillRect(0, 0, 512, 512);

      // Fine asphalt noise grain
      for (let i = 0; i < 45000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const brightness = Math.floor(Math.random() * 35 + 28);
        ctx.fillStyle = `rgb(${brightness}, ${brightness + 2}, ${brightness + 4})`;
        ctx.fillRect(x, y, 2, 2);
      }

      this.asphaltTexture = new THREE.CanvasTexture(canvas);
      this.asphaltTexture.wrapS = THREE.RepeatWrapping;
      this.asphaltTexture.wrapT = THREE.RepeatWrapping;
      this.asphaltTexture.repeat.set(16, 16);
    }
    return this.asphaltTexture;
  }

  public static getHazardTexture(): THREE.CanvasTexture {
    if (!this.hazardTexture) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;

      // Yellow & black diagonal caution stripes
      ctx.fillStyle = '#eab308'; // Safety yellow
      ctx.fillRect(0, 0, 256, 64);

      ctx.fillStyle = '#18181b'; // Dark black
      const stripeW = 32;
      for (let x = -64; x < 320; x += stripeW * 2) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + stripeW, 0);
        ctx.lineTo(x + stripeW + 32, 64);
        ctx.lineTo(x + 32, 64);
        ctx.closePath();
        ctx.fill();
      }

      this.hazardTexture = new THREE.CanvasTexture(canvas);
      this.hazardTexture.wrapS = THREE.RepeatWrapping;
      this.hazardTexture.wrapT = THREE.ClampToEdgeWrapping;
      this.hazardTexture.repeat.set(3, 1);
    }
    return this.hazardTexture;
  }

  /**
   * Builds the daytime lighting and atmospheric environment.
   */
  public static setupEnvironment(scene: THREE.Scene) {
    // Daytime atmospheric fog
    scene.background = new THREE.Color(0xbddcf5);
    scene.fog = new THREE.FogExp2(0xbddcf5, 0.012);

    // Warm natural sun light (Directional)
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    sunLight.position.set(40, 65, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 160;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Sky & ground ambient fill light (Hemisphere)
    const hemiLight = new THREE.HemisphereLight(0xecf8ff, 0x334155, 0.9);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    // Subtle sky dome
    const skyGeo = new THREE.SphereGeometry(220, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      side: THREE.BackSide,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);
  }

  /**
   * Builds the player's high quality sports sedan car mesh with steering wheels and lights.
   */
  public static createPlayerCar(): CarMeshReferences {
    const car = new THREE.Group();

    // Car Body Material: Sleek metallic sports blue
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant electric sports blue
      metalness: 0.65,
      roughness: 0.25,
    });

    const bodyDarkMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep slate trim
      roughness: 0.5,
      metalness: 0.3,
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.1,
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    });

    // 1. Lower chassis / body base
    const lowerBodyGeo = new THREE.BoxGeometry(1.92, 0.46, 4.3);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyMaterial);
    lowerBody.position.y = 0.44;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    car.add(lowerBody);

    // 2. Front Hood Slope
    const hoodGeo = new THREE.BoxGeometry(1.86, 0.22, 1.4);
    const hood = new THREE.Mesh(hoodGeo, bodyMaterial);
    hood.position.set(0, 0.66, -1.25);
    hood.castShadow = true;
    car.add(hood);

    // 3. Cabin / Greenhouse (Upper roof and windows)
    const cabinGeo = new THREE.BoxGeometry(1.68, 0.52, 2.05);
    const cabin = new THREE.Mesh(cabinGeo, glassMaterial);
    cabin.position.set(0, 0.92, 0.2);
    cabin.castShadow = true;
    car.add(cabin);

    // Cabin roof top sheet
    const roofGeo = new THREE.BoxGeometry(1.6, 0.06, 1.8);
    const roof = new THREE.Mesh(roofGeo, bodyMaterial);
    roof.position.set(0, 1.19, 0.2);
    roof.castShadow = true;
    car.add(roof);

    // 4. Front Grille & Bumper
    const grilleGeo = new THREE.BoxGeometry(1.5, 0.22, 0.15);
    const grille = new THREE.Mesh(grilleGeo, bodyDarkMaterial);
    grille.position.set(0, 0.42, -2.16);
    car.add(grille);

    // 5. Headlights (Front -Z)
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.1), headlightMat);
    hlLeft.position.set(-0.68, 0.52, -2.16);
    const hlRight = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.1), headlightMat);
    hlRight.position.set(0.68, 0.52, -2.16);
    car.add(hlLeft, hlRight);

    // Headlight Spotlights on the road ahead
    const spotLeft = new THREE.SpotLight(0xfffbeb, 2.5, 24, Math.PI / 6, 0.5, 1.2);
    spotLeft.position.set(-0.68, 0.52, -2.16);
    spotLeft.target.position.set(-0.68, 0, -18);
    car.add(spotLeft);
    car.add(spotLeft.target);

    const spotRight = new THREE.SpotLight(0xfffbeb, 2.5, 24, Math.PI / 6, 0.5, 1.2);
    spotRight.position.set(0.68, 0.52, -2.16);
    spotRight.target.position.set(0.68, 0, -18);
    car.add(spotRight);
    car.add(spotRight.target);

    // 6. Taillights (Rear +Z)
    const taillightMatLeft = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const taillightMatRight = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });

    const tlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.1), taillightMatLeft);
    tlLeft.position.set(-0.68, 0.55, 2.16);
    const tlRight = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.1), taillightMatRight);
    tlRight.position.set(0.68, 0.55, 2.16);
    car.add(tlLeft, tlRight);

    // Reverse lights
    const revMatLeft = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.3,
    });
    const revMatRight = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.3,
    });
    const revLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.1), revMatLeft);
    revLeft.position.set(-0.35, 0.55, 2.16);
    const revRight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.1), revMatRight);
    revRight.position.set(0.35, 0.55, 2.16);
    car.add(revLeft, revRight);

    // 7. Side Mirrors
    const mirrorL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.16), bodyDarkMaterial);
    mirrorL.position.set(-0.95, 0.76, -0.6);
    const mirrorR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.16), bodyDarkMaterial);
    mirrorR.position.set(0.95, 0.76, -0.6);
    car.add(mirrorL, mirrorR);

    // 8. Rear Spoiler
    const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.05, 0.28), bodyDarkMaterial);
    spoilerWing.position.set(0, 0.88, 1.95);
    const spoilerPostL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.08), bodyDarkMaterial);
    spoilerPostL.position.set(-0.55, 0.76, 1.95);
    const spoilerPostR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.08), bodyDarkMaterial);
    spoilerPostR.position.set(0.55, 0.76, 1.95);
    car.add(spoilerWing, spoilerPostL, spoilerPostR);

    // 9. Wheels & Rims
    const wheelRadius = 0.35;
    const wheelThickness = 0.26;

    const createWheel = () => {
      const wheelGroup = new THREE.Group();

      // Tire (black rubber)
      const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 24);
      tireGeo.rotateZ(Math.PI / 2);
      const tireMat = new THREE.MeshStandardMaterial({
        color: 0x171717,
        roughness: 0.85,
        metalness: 0.1,
      });
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Alloy Rim
      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, wheelThickness + 0.02, 16);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, chromeMaterial);
      wheelGroup.add(rim);

      // Center cap
      const capGeo = new THREE.CylinderGeometry(0.08, 0.08, wheelThickness + 0.04, 12);
      capGeo.rotateZ(Math.PI / 2);
      const cap = new THREE.Mesh(capGeo, bodyDarkMaterial);
      wheelGroup.add(cap);

      return wheelGroup;
    };

    // Front Wheels are in steer pivots
    const frontLeftPivot = new THREE.Group();
    frontLeftPivot.position.set(-0.95, wheelRadius, -1.35);
    const flWheel = createWheel();
    frontLeftPivot.add(flWheel);
    car.add(frontLeftPivot);

    const frontRightPivot = new THREE.Group();
    frontRightPivot.position.set(0.95, wheelRadius, -1.35);
    const frWheel = createWheel();
    frontRightPivot.add(frWheel);
    car.add(frontRightPivot);

    // Rear Wheels
    const rearLeftPivot = new THREE.Group();
    rearLeftPivot.position.set(-0.95, wheelRadius, 1.35);
    const rlWheel = createWheel();
    rearLeftPivot.add(rlWheel);
    car.add(rearLeftPivot);

    const rearRightPivot = new THREE.Group();
    rearRightPivot.position.set(0.95, wheelRadius, 1.35);
    const rrWheel = createWheel();
    rearRightPivot.add(rrWheel);
    car.add(rearRightPivot);

    // 10. Ambient Contact Shadow under car
    const shadowGeo = new THREE.PlaneGeometry(2.3, 4.6);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.position.y = 0.02;
    car.add(shadowPlane);

    return {
      root: car,
      frontLeftWheel: frontLeftPivot,
      frontRightWheel: frontRightPivot,
      rearLeftWheel: rearLeftPivot,
      rearRightWheel: rearRightPivot,
      taillightMaterials: [taillightMatLeft, taillightMatRight],
      reverseLightMaterials: [revMatLeft, revMatRight],
      headlights: [spotLeft, spotRight],
    };
  }

  /**
   * Builds the target parking zone with animated glowing boundary and floating beacon.
   */
  public static createParkingZone(zone: ParkingZone): ParkingZoneMeshReferences {
    const group = new THREE.Group();
    group.position.set(zone.x, 0.03, zone.z);
    group.rotation.y = zone.rotation;

    // Glowing green parking floor rect
    const floorGeo = new THREE.PlaneGeometry(zone.width, zone.length);
    floorGeo.rotateX(-Math.PI / 2);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e, // Emerald Green
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const floorMesh = new THREE.Mesh(floorGeo, markerMat);
    group.add(floorMesh);

    // Bright yellow/white border lines
    const borderMat = new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 3 });
    const hw = zone.width / 2;
    const hl = zone.length / 2;
    const borderPoints = [
      new THREE.Vector3(-hw, 0.01, -hl),
      new THREE.Vector3(hw, 0.01, -hl),
      new THREE.Vector3(hw, 0.01, hl),
      new THREE.Vector3(-hw, 0.01, hl),
      new THREE.Vector3(-hw, 0.01, -hl),
    ];
    const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints);
    const borderLine = new THREE.Line(borderGeo, borderMat);
    group.add(borderLine);

    // Parking slot 4 Corner markers (L-shaped yellow brackets)
    const bracketMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const cornerSize = 0.6;
    const cornerThick = 0.1;

    const corners = [
      { x: -hw, z: -hl, sx: 1, sz: 1 },
      { x: hw, z: -hl, sx: -1, sz: 1 },
      { x: hw, z: hl, sx: -1, sz: -1 },
      { x: -hw, z: hl, sx: 1, sz: -1 },
    ];

    corners.forEach((c) => {
      const b1 = new THREE.Mesh(new THREE.PlaneGeometry(cornerSize, cornerThick), bracketMat);
      b1.rotateX(-Math.PI / 2);
      b1.position.set(c.x + (c.sx * cornerSize) / 2, 0.02, c.z);
      const b2 = new THREE.Mesh(new THREE.PlaneGeometry(cornerThick, cornerSize), bracketMat);
      b2.rotateX(-Math.PI / 2);
      b2.position.set(c.x, 0.02, c.z + (c.sz * cornerSize) / 2);
      group.add(b1, b2);
    });

    // Floating 3D "P" Beacon & arrow floating above spot
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(0, 3.2, 0);

    // Diamond / Downward Arrow Marker
    const arrowGeo = new THREE.ConeGeometry(0.65, 1.2, 4);
    arrowGeo.rotateX(Math.PI); // point down
    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x15803d,
      emissiveIntensity: 0.8,
      metalness: 0.4,
      roughness: 0.2,
    });
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
    beaconGroup.add(arrowMesh);

    // Floating Ring
    const ringGeo = new THREE.TorusGeometry(1.1, 0.08, 16, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.7,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.8;
    beaconGroup.add(ringMesh);

    group.add(beaconGroup);

    return {
      group,
      markerMaterial: markerMat,
      beaconGroup,
    };
  }

  /**
   * Builds all level obstacles (concrete barriers, parked cars, traffic cones, walls, curbs).
   */
  public static createObstacles(obstacles: BoxCollider[]): THREE.Group {
    const group = new THREE.Group();

    // Shared materials
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569, // Slate concrete wall
      roughness: 0.9,
    });

    const curbMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Light concrete curb
      roughness: 0.8,
    });

    const barrierMat = new THREE.MeshStandardMaterial({
      map: this.getHazardTexture(),
      roughness: 0.6,
      metalness: 0.1,
    });

    const coneOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.4,
    });
    const coneWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
    });
    const coneBaseMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
    });

    for (const obs of obstacles) {
      if (obs.type === 'wall') {
        const wallGeo = new THREE.BoxGeometry(obs.width, 2.8, obs.length);
        const wallMesh = new THREE.Mesh(wallGeo, wallMaterial);
        wallMesh.position.set(obs.x, 1.4, obs.z);
        wallMesh.rotation.y = obs.rotation;
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        group.add(wallMesh);

        // Wall top trim
        const trimGeo = new THREE.BoxGeometry(obs.width + 0.1, 0.2, obs.length + 0.1);
        const trimMesh = new THREE.Mesh(trimGeo, curbMaterial);
        trimMesh.position.set(obs.x, 2.9, obs.z);
        trimMesh.rotation.y = obs.rotation;
        group.add(trimMesh);
      } else if (obs.type === 'barrier') {
        // Concrete K-Rail barrier with hazard stripes
        const bMesh = new THREE.Mesh(new THREE.BoxGeometry(obs.width, 0.9, obs.length), barrierMat);
        bMesh.position.set(obs.x, 0.45, obs.z);
        bMesh.rotation.y = obs.rotation;
        bMesh.castShadow = true;
        bMesh.receiveShadow = true;
        group.add(bMesh);
      } else if (obs.type === 'curb') {
        const curbMesh = new THREE.Mesh(new THREE.BoxGeometry(obs.width, 0.24, obs.length), curbMaterial);
        curbMesh.position.set(obs.x, 0.12, obs.z);
        curbMesh.rotation.y = obs.rotation;
        curbMesh.receiveShadow = true;
        group.add(curbMesh);
      } else if (obs.type === 'cone') {
        // High fidelity traffic cone
        const coneGroup = new THREE.Group();
        coneGroup.position.set(obs.x, 0, obs.z);

        // Square rubber base
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.05, 0.48), coneBaseMat);
        base.position.y = 0.025;
        base.castShadow = true;
        coneGroup.add(base);

        // Lower orange cone
        const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 0.42, 16), coneOrangeMat);
        c1.position.y = 0.24;
        c1.castShadow = true;
        coneGroup.add(c1);

        // Reflective white stripe
        const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.18, 16), coneWhiteMat);
        stripe.position.y = 0.54;
        stripe.castShadow = true;
        coneGroup.add(stripe);

        // Top orange tip
        const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.08, 0.18, 16), coneOrangeMat);
        c2.position.y = 0.72;
        c2.castShadow = true;
        coneGroup.add(c2);

        group.add(coneGroup);
      }
    }

    return group;
  }

  /**
   * Creates static parked cars in the lot.
   */
  public static createParkedCars(cars: NonNullable<LevelConfig['scenery']>['parkedCars']): THREE.Group {
    const group = new THREE.Group();
    if (!cars) return group;

    cars.forEach((pc) => {
      const carGroup = new THREE.Group();
      carGroup.position.set(pc.x, 0, pc.z);
      carGroup.rotation.y = pc.rotation;

      const colorHex = parseInt(pc.color.replace('#', '0x'), 16);
      const paintMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.35,
        metalness: 0.6,
      });
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85,
      });
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });

      const isSUV = pc.model === 'suv';
      const bodyH = isSUV ? 0.62 : 0.48;
      const cabinH = isSUV ? 0.6 : 0.5;

      // Lower body
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, bodyH, 4.4), paintMat);
      body.position.y = bodyH / 2 + 0.2;
      body.castShadow = true;
      carGroup.add(body);

      // Cabin
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.65, cabinH, isSUV ? 2.5 : 2.0), glassMat);
      cabin.position.set(0, bodyH + cabinH / 2 + 0.18, isSUV ? 0.1 : 0.2);
      cabin.castShadow = true;
      carGroup.add(cabin);

      // Roof
      const roof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, isSUV ? 2.4 : 1.8), paintMat);
      roof.position.set(0, bodyH + cabinH + 0.18, isSUV ? 0.1 : 0.2);
      carGroup.add(roof);

      // Wheels
      const wPositions = [
        [-0.95, 0.32, -1.3],
        [0.95, 0.32, -1.3],
        [-0.95, 0.32, 1.3],
        [0.95, 0.32, 1.3],
      ];
      wPositions.forEach(([wx, wy, wz]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 16), wheelMat);
        w.rotateZ(Math.PI / 2);
        w.position.set(wx, wy, wz);
        w.castShadow = true;
        carGroup.add(w);
      });

      // Shadow
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 4.6),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 })
      );
      shadow.rotateX(-Math.PI / 2);
      shadow.position.y = 0.02;
      carGroup.add(shadow);

      group.add(carGroup);
    });

    return group;
  }

  /**
   * Creates lush trees, street lamps, and modern city buildings around the arena.
   */
  public static createScenery(scenery: LevelConfig['scenery']): THREE.Group {
    const group = new THREE.Group();
    if (!scenery) return group;

    // 1. Trees
    if (scenery.trees) {
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
      const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
      const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });

      scenery.trees.forEach((pos, idx) => {
        const treeGroup = new THREE.Group();
        treeGroup.position.set(pos.x, 0, pos.z);

        // Trunk
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.5, 8), trunkMat);
        trunk.position.y = 1.25;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Foliage Crown (layered spheres)
        const fMat = idx % 2 === 0 ? foliageMat1 : foliageMat2;
        const crown1 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 10, 8), fMat);
        crown1.position.y = 3.2;
        crown1.castShadow = true;
        treeGroup.add(crown1);

        const crown2 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), fMat);
        crown2.position.set(0.4, 4.2, -0.2);
        crown2.castShadow = true;
        treeGroup.add(crown2);

        group.add(treeGroup);
      });
    }

    // 2. Street Lamps
    if (scenery.lamps) {
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
      const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

      scenery.lamps.forEach((pos) => {
        const lampGroup = new THREE.Group();
        lampGroup.position.set(pos.x, 0, pos.z);

        // Base & Pole
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 5.0, 10), poleMat);
        pole.position.y = 2.5;
        pole.castShadow = true;
        lampGroup.add(pole);

        // Overhang Arm
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8), poleMat);
        arm.rotateZ(Math.PI / 3);
        arm.position.set(0.45, 5.2, 0);
        lampGroup.add(arm);

        // Lamp fixture
        const fixture = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.25), lampHeadMat);
        fixture.position.set(0.9, 5.5, 0);
        lampGroup.add(fixture);

        // Warm light source
        const light = new THREE.PointLight(0xfef08a, 0.8, 18, 1.5);
        light.position.set(0.9, 5.3, 0);
        lampGroup.add(light);

        group.add(lampGroup);
      });
    }

    // 3. Buildings
    if (scenery.buildings) {
      scenery.buildings.forEach((b) => {
        const bGroup = new THREE.Group();
        bGroup.position.set(b.x, b.height / 2, b.z);

        const bColor = b.color ?? 0x1e293b;
        const bMat = new THREE.MeshStandardMaterial({
          color: bColor,
          roughness: 0.6,
          metalness: 0.2,
        });

        const bMesh = new THREE.Mesh(new THREE.BoxGeometry(b.width, b.height, b.length), bMat);
        bMesh.castShadow = true;
        bMesh.receiveShadow = true;
        bGroup.add(bMesh);

        // Window grid lines texture/strips on front facade
        const windowMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
        const numFloors = Math.floor(b.height / 3.5);
        for (let f = 1; f < numFloors; f++) {
          const winStrip = new THREE.Mesh(new THREE.PlaneGeometry(b.width * 0.8, 0.8), windowMat);
          winStrip.position.set(0, f * 3.5 - b.height / 2, b.length / 2 + 0.02);
          bGroup.add(winStrip);
        }

        // Roof trim
        const roofTrim = new THREE.Mesh(
          new THREE.BoxGeometry(b.width + 0.4, 0.4, b.length + 0.4),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
        );
        roofTrim.position.y = b.height / 2 + 0.2;
        bGroup.add(roofTrim);

        group.add(bGroup);
      });
    }

    return group;
  }

  /**
   * Builds the road markings (yellow center lines, white parking stall dashes, directional arrows).
   */
  public static createRoadMarkings(): THREE.Group {
    const group = new THREE.Group();
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    // Center double yellow line
    for (let z = -25; z < 25; z += 4) {
      const line1 = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 2.2), yellowMat);
      line1.rotateX(-Math.PI / 2);
      line1.position.set(-0.15, 0.015, z);
      const line2 = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 2.2), yellowMat);
      line2.rotateX(-Math.PI / 2);
      line2.position.set(0.15, 0.015, z);
      group.add(line1, line2);
    }

    // Directional forward arrows on lane
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const createArrow = (x: number, z: number, rot: number = 0) => {
      const aGroup = new THREE.Group();
      aGroup.position.set(x, 0.015, z);
      aGroup.rotation.y = rot;

      // Stem
      const stem = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.8), arrowMat);
      stem.rotateX(-Math.PI / 2);
      stem.position.z = 0.5;
      aGroup.add(stem);

      // Head
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.0, 3), arrowMat);
      head.rotateX(-Math.PI / 2);
      head.position.z = -0.6;
      aGroup.add(head);

      return aGroup;
    };

    group.add(createArrow(0, 14, 0));
    group.add(createArrow(0, 0, 0));

    return group;
  }
}
