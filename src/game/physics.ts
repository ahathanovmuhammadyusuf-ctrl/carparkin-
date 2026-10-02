import { BoxCollider, CarControls } from '../types/game';

export interface CarPhysicsState {
  x: number;
  z: number;
  rotation: number; // yaw in radians
  speed: number; // in m/s (positive = forward, negative = reverse)
  steerAngle: number; // radians
  wheelRotation: number; // wheel roll angle
  gear: 'P' | 'D' | 'R';
}

export interface CollisionResult {
  hasCollided: boolean;
  obstacle?: BoxCollider;
  intensity: number;
  normalX: number;
  normalZ: number;
}

export class CarPhysics {
  // Vehicle specs (meters, seconds, radians)
  public readonly width = 1.95;
  public readonly length = 4.4;
  public readonly wheelbase = 2.65;
  public readonly maxSteer = 0.58; // ~33 degrees
  public readonly maxForwardSpeed = 11.5; // ~41 km/h
  public readonly maxReverseSpeed = -5.0; // ~-18 km/h
  public readonly accelRate = 8.5; // m/s^2
  public readonly reverseAccelRate = 6.0; // m/s^2
  public readonly brakeRate = 16.0; // m/s^2
  public readonly handbrakeRate = 22.0; // m/s^2
  public readonly rollingResistance = 2.8; // natural slowdown
  public readonly steerSpeed = 3.6; // steer return/change rate rad/s

  public state: CarPhysicsState = {
    x: 0,
    z: 0,
    rotation: 0,
    speed: 0,
    steerAngle: 0,
    wheelRotation: 0,
    gear: 'P',
  };

  constructor(initialX: number = 0, initialZ: number = 0, initialRotation: number = 0) {
    this.reset(initialX, initialZ, initialRotation);
  }

  public reset(x: number, z: number, rotation: number) {
    this.state = {
      x,
      z,
      rotation,
      speed: 0,
      steerAngle: 0,
      wheelRotation: 0,
      gear: 'P',
    };
  }

  public update(controls: CarControls, obstacles: BoxCollider[], dt: number): CollisionResult {
    // Clamp delta time to avoid physics tunneling during tab switches
    const safeDt = Math.min(dt, 0.05);

    // 1. Steering computation
    let targetSteer = 0;
    if (controls.left) targetSteer += this.maxSteer;
    if (controls.right) targetSteer -= this.maxSteer;

    // High-speed steering stability compensation
    const speedRatio = Math.abs(this.state.speed) / this.maxForwardSpeed;
    const effectiveMaxSteer = this.maxSteer * (1 - speedRatio * 0.28);
    targetSteer = Math.max(-effectiveMaxSteer, Math.min(effectiveMaxSteer, targetSteer));

    // Smooth steering interpolation
    const steerDiff = targetSteer - this.state.steerAngle;
    const steerDelta = Math.sign(steerDiff) * Math.min(Math.abs(steerDiff), this.steerSpeed * safeDt);
    this.state.steerAngle += steerDelta;

    // 2. Speed / Acceleration calculation
    let currentSpeed = this.state.speed;

    if (controls.handbrake) {
      // Handbrake slows down car rapidly
      if (Math.abs(currentSpeed) > 0.05) {
        currentSpeed -= Math.sign(currentSpeed) * this.handbrakeRate * safeDt;
      } else {
        currentSpeed = 0;
      }
    } else if (controls.forward) {
      if (currentSpeed < -0.1) {
        // Active braking when moving backward
        currentSpeed += this.brakeRate * safeDt;
      } else {
        // Accelerating forward
        currentSpeed += this.accelRate * safeDt;
        if (currentSpeed > this.maxForwardSpeed) currentSpeed = this.maxForwardSpeed;
      }
    } else if (controls.backward) {
      if (currentSpeed > 0.1) {
        // Active braking when moving forward
        currentSpeed -= this.brakeRate * safeDt;
      } else {
        // Reverse acceleration
        currentSpeed -= this.reverseAccelRate * safeDt;
        if (currentSpeed < this.maxReverseSpeed) currentSpeed = this.maxReverseSpeed;
      }
    } else {
      // Natural rolling friction / coasting
      if (Math.abs(currentSpeed) > 0.05) {
        currentSpeed -= Math.sign(currentSpeed) * this.rollingResistance * safeDt;
      } else {
        currentSpeed = 0;
      }
    }

    this.state.speed = currentSpeed;

    // Gear indicator logic
    if (Math.abs(currentSpeed) < 0.1 && !controls.forward && !controls.backward) {
      this.state.gear = controls.handbrake ? 'P' : 'D';
    } else if (currentSpeed < -0.1 || controls.backward) {
      this.state.gear = 'R';
    } else {
      this.state.gear = 'D';
    }

    // 3. Kinematic position & heading update (Bicycle model)
    // Three.js forward direction: we define heading 0 along negative Z (x = sin(rot), z = -cos(rot))
    if (Math.abs(currentSpeed) > 0.001) {
      const angularVelocity = (currentSpeed / this.wheelbase) * Math.sin(this.state.steerAngle);
      this.state.rotation += angularVelocity * safeDt;

      // Keep rotation in [-PI, PI] range
      while (this.state.rotation > Math.PI) this.state.rotation -= Math.PI * 2;
      while (this.state.rotation < -Math.PI) this.state.rotation += Math.PI * 2;

      // Displacement
      // In our world, car faces -Z at rotation 0:
      // dx = -sin(rotation) * speed * dt
      // dz = -cos(rotation) * speed * dt
      const dx = -Math.sin(this.state.rotation) * currentSpeed * safeDt;
      const dz = -Math.cos(this.state.rotation) * currentSpeed * safeDt;

      this.state.x += dx;
      this.state.z += dz;

      // Update wheel roll rotation
      const wheelCircumference = 0.65 * Math.PI; // wheel diameter ~0.65m
      this.state.wheelRotation += (currentSpeed * safeDt / wheelCircumference) * Math.PI * 2;
    }

    // 4. Collision Detection & Resolution
    const collision = this.resolveCollisions(obstacles);

    return collision;
  }

  /**
   * Separating Axis Theorem (SAT) collision detection against all world obstacle colliders.
   */
  private resolveCollisions(obstacles: BoxCollider[]): CollisionResult {
    let result: CollisionResult = {
      hasCollided: false,
      intensity: 0,
      normalX: 0,
      normalZ: 0,
    };

    // Calculate car OBB vertices
    const carHalfW = this.width * 0.46; // slight bumper inset for realistic collision
    const carHalfL = this.length * 0.47;
    const cosR = Math.cos(this.state.rotation);
    const sinR = Math.sin(this.state.rotation);

    // Car local axes in world coordinates
    // Forward axis (along length)
    const carAxisL = { x: -sinR, z: -cosR };
    // Right axis (along width)
    const carAxisW = { x: cosR, z: -sinR };

    for (const obs of obstacles) {
      const obsCos = Math.cos(obs.rotation);
      const obsSin = Math.sin(obs.rotation);
      const obsHalfW = obs.width * 0.5;
      const obsHalfL = obs.length * 0.5;

      const obsAxisW = { x: obsCos, z: -obsSin };
      const obsAxisL = { x: -obsSin, z: -obsCos };

      // Vector from obstacle center to car center
      const toCar = { x: this.state.x - obs.x, z: this.state.z - obs.z };

      // Test all 4 axes
      const axes = [carAxisW, carAxisL, obsAxisW, obsAxisL];
      let minOverlap = Infinity;
      let minAxis = { x: 0, z: 0 };
      let separated = false;

      for (const axis of axes) {
        // Project car extents
        const carProj = carHalfW * Math.abs(dot(carAxisW, axis)) + carHalfL * Math.abs(dot(carAxisL, axis));
        // Project obstacle extents
        const obsProj = obsHalfW * Math.abs(dot(obsAxisW, axis)) + obsHalfL * Math.abs(dot(obsAxisL, axis));
        // Project distance between centers
        const distProj = Math.abs(dot(toCar, axis));

        const overlap = (carProj + obsProj) - distProj;
        if (overlap <= 0) {
          separated = true;
          break;
        }
        if (overlap < minOverlap) {
          minOverlap = overlap;
          // Ensure axis points from obstacle to car
          const sign = dot(toCar, axis) >= 0 ? 1 : -1;
          minAxis = { x: axis.x * sign, z: axis.z * sign };
        }
      }

      if (!separated && minOverlap > 0) {
        // Collision detected! Push car out of obstacle
        this.state.x += minAxis.x * (minOverlap + 0.02);
        this.state.z += minAxis.z * (minOverlap + 0.02);

        // Compute collision intensity based on speed
        const speedMagnitude = Math.abs(this.state.speed);
        const intensity = Math.max(0.4, Math.min(2.0, speedMagnitude * 0.35 + 0.3));

        // Invert and damp speed (restitution / bounce)
        this.state.speed = -this.state.speed * 0.3;

        result = {
          hasCollided: true,
          obstacle: obs,
          intensity,
          normalX: minAxis.x,
          normalZ: minAxis.z,
        };

        // If hitting a light cone, we can push cone slightly in gameplay
        break; // Resolve one collision per frame for stability
      }
    }

    return result;
  }
}

function dot(a: { x: number; z: number }, b: { x: number; z: number }): number {
  return a.x * b.x + a.z * b.z;
}
