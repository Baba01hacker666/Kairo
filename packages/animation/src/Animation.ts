import * as THREE from 'three';
import { Vector3, Quaternion, MathUtils } from '@kairo/core';

export interface Keyframe<T> {
  time: number;
  value: T;
}

export class AnimationClip {
  constructor(
    public name: string,
    public duration: number,
    public positionKeys: Keyframe<Vector3>[] = [],
    public rotationKeys: Keyframe<Quaternion>[] = [],
    public scaleKeys: Keyframe<Vector3>[] = []
  ) {}

  samplePosition(time: number): Vector3 {
    if (this.positionKeys.length === 0) return new Vector3(0, 0, 0);
    time = MathUtils.clamp(time % this.duration, 0, this.duration);
    
    for (let i = 0; i < this.positionKeys.length - 1; i++) {
      const k1 = this.positionKeys[i];
      const k2 = this.positionKeys[i + 1];
      if (time >= k1.time && time <= k2.time) {
        const t = (time - k1.time) / (k2.time - k1.time);
        return k1.value.clone().lerp(k2.value, t);
      }
    }
    return this.positionKeys[this.positionKeys.length - 1].value.clone();
  }

  sampleRotation(time: number): Quaternion {
    if (this.rotationKeys.length === 0) return new Quaternion(0, 0, 0, 1);
    time = MathUtils.clamp(time % this.duration, 0, this.duration);

    for (let i = 0; i < this.rotationKeys.length - 1; i++) {
      const k1 = this.rotationKeys[i];
      const k2 = this.rotationKeys[i + 1];
      if (time >= k1.time && time <= k2.time) {
        const t = (time - k1.time) / (k2.time - k1.time);
        return k1.value.clone().slerp(k2.value, t);
      }
    }
    return this.rotationKeys[this.rotationKeys.length - 1].value.clone();
  }
}

export class BlendTree1D {
  private clips: { clip: AnimationClip; threshold: number }[] = [];

  addClip(clip: AnimationClip, threshold: number): void {
    this.clips.push({ clip, threshold });
    this.clips.sort((a, b) => a.threshold - b.threshold);
  }

  evaluate(parameter: number, time: number): { position: Vector3; rotation: Quaternion } {
    if (this.clips.length === 0) {
      return { position: new Vector3(), rotation: new Quaternion() };
    }
    if (this.clips.length === 1 || parameter <= this.clips[0].threshold) {
      return {
        position: this.clips[0].clip.samplePosition(time),
        rotation: this.clips[0].clip.sampleRotation(time)
      };
    }

    for (let i = 0; i < this.clips.length - 1; i++) {
      const c1 = this.clips[i];
      const c2 = this.clips[i + 1];
      if (parameter >= c1.threshold && parameter <= c2.threshold) {
        const weight = (parameter - c1.threshold) / (c2.threshold - c1.threshold);
        const p1 = c1.clip.samplePosition(time);
        const p2 = c2.clip.samplePosition(time);
        const r1 = c1.clip.sampleRotation(time);
        const r2 = c2.clip.sampleRotation(time);

        return {
          position: p1.lerp(p2, weight),
          rotation: r1.slerp(r2, weight)
        };
      }
    }

    const last = this.clips[this.clips.length - 1];
    return {
      position: last.clip.samplePosition(time),
      rotation: last.clip.sampleRotation(time)
    };
  }
}

/**
 * High-Level Three.js Skeletal Animation State Machine
 * Handles state transitions, parameters, crossfading, and clip callbacks.
 */
export interface StateTransitionCondition {
  parameter: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: any;
}

export interface AnimationState {
  name: string;
  action: THREE.AnimationAction;
  fadeDuration?: number;
  timeScale?: number;
}

export class AnimationStateMachine {
  public mixer: THREE.AnimationMixer;
  private states: Map<string, AnimationState> = new Map();
  private parameters: Map<string, any> = new Map();
  private currentState: AnimationState | null = null;

  constructor(root: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(root);
  }

  public registerState(name: string, clip: THREE.AnimationClip, options: { fadeDuration?: number; timeScale?: number; loop?: THREE.AnimationActionLoopStyles } = {}): void {
    const action = this.mixer.clipAction(clip);
    if (options.loop !== undefined) {
      action.setLoop(options.loop, Infinity);
    }
    if (options.timeScale !== undefined) {
      action.timeScale = options.timeScale;
    }
    const state: AnimationState = {
      name,
      action,
      fadeDuration: options.fadeDuration ?? 0.25,
      timeScale: options.timeScale ?? 1.0
    };
    this.states.set(name, state);
  }

  public setParameter(name: string, value: any): void {
    this.parameters.set(name, value);
  }

  public getParameter(name: string): any {
    return this.parameters.get(name);
  }

  public setState(name: string, fadeDuration?: number): void {
    const nextState = this.states.get(name);
    if (!nextState || this.currentState === nextState) return;

    const duration = fadeDuration ?? nextState.fadeDuration ?? 0.25;

    if (this.currentState) {
      this.currentState.action.fadeOut(duration);
    }

    this.currentState = nextState;
    this.currentState.action.reset().fadeIn(duration).play();
  }

  public getCurrentStateName(): string | null {
    return this.currentState ? this.currentState.name : null;
  }

  public update(dt: number): void {
    this.mixer.update(dt);
  }
}

export class InverseKinematicsSolver {
  static solveTwoBone(
    rootPos: Vector3,
    jointPos: Vector3,
    targetPos: Vector3,
    l1: number,
    l2: number
  ): { jointPos: Vector3; endPos: Vector3 } {
    const dir = targetPos.clone().sub(rootPos);
    const dist = MathUtils.clamp(dir.length(), 0.001, l1 + l2 - 0.001);
    
    const cosAngle = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist);
    const angle = Math.acos(MathUtils.clamp(cosAngle, -1, 1));
    
    const normal = new Vector3(0, 1, 0);
    const forward = dir.clone().normalize();
    const up = forward.cross(normal).cross(forward).normalize();
    
    const newJoint = rootPos.clone()
      .add(forward.clone().scale(Math.cos(angle) * l1))
      .add(up.clone().scale(Math.sin(angle) * l1));
      
    return { jointPos: newJoint, endPos: targetPos.clone() };
  }
}

export class StickmanPose {
  public headOffset: Vector3 = new Vector3(0, 2.3, 0);
  public torsoAngle: number = 0;
  
  public leftArmAngle: number = 0;
  public rightArmAngle: number = 0;
  public leftForearmAngle: number = 0;
  public rightForearmAngle: number = 0;

  public leftLegAngle: number = 0;
  public rightLegAngle: number = 0;
  public leftShinAngle: number = 0;
  public rightShinAngle: number = 0;

  public rootY: number = 0;
  public rootFlipAngle: number = 0;
}

export class StickmanAnimator {
  static evaluate(state: 'idle' | 'walk' | 'run' | 'jump' | 'ragdoll', time: number, speed: number = 1.0): StickmanPose {
    const pose = new StickmanPose();
    const t = time * speed * 5.0;

    if (state === 'idle') {
      pose.rootY = Math.sin(time * 2) * 0.05;
      pose.headOffset.y = 2.3 + Math.sin(time * 2) * 0.02;
      pose.leftArmAngle = Math.sin(time * 2) * 0.1 + 0.1;
      pose.rightArmAngle = -Math.sin(time * 2) * 0.1 - 0.1;
      pose.leftLegAngle = 0.05;
      pose.rightLegAngle = -0.05;
    } else if (state === 'walk') {
      const stride = 0.6;
      pose.rootY = Math.abs(Math.sin(t)) * 0.1;
      pose.leftLegAngle = Math.sin(t) * stride;
      pose.rightLegAngle = -Math.sin(t) * stride;
      pose.leftShinAngle = Math.max(0, Math.sin(t + Math.PI / 2)) * 0.5;
      pose.rightShinAngle = Math.max(0, Math.sin(t - Math.PI / 2)) * 0.5;

      pose.leftArmAngle = -Math.sin(t) * stride;
      pose.rightArmAngle = Math.sin(t) * stride;
      pose.leftForearmAngle = 0.2;
      pose.rightForearmAngle = 0.2;
    } else if (state === 'run') {
      const stride = 1.1;
      pose.torsoAngle = 0.25;
      pose.rootY = Math.abs(Math.sin(t * 1.5)) * 0.2;

      pose.leftLegAngle = Math.sin(t * 1.5) * stride;
      pose.rightLegAngle = -Math.sin(t * 1.5) * stride;
      pose.leftShinAngle = Math.max(0, Math.sin(t * 1.5 + Math.PI / 2)) * 0.8;
      pose.rightShinAngle = Math.max(0, Math.sin(t * 1.5 - Math.PI / 2)) * 0.8;

      pose.leftArmAngle = -Math.sin(t * 1.5) * stride * 1.1;
      pose.rightArmAngle = Math.sin(t * 1.5) * stride * 1.1;
      pose.leftForearmAngle = 0.8;
      pose.rightForearmAngle = 0.8;
    } else if (state === 'jump') {
      const jumpTime = (time % 2.0) / 2.0;
      pose.rootY = Math.sin(jumpTime * Math.PI) * 2.5;
      pose.rootFlipAngle = jumpTime * Math.PI * 2;

      pose.leftArmAngle = -1.2;
      pose.rightArmAngle = -1.2;
      pose.leftLegAngle = 0.8;
      pose.rightLegAngle = 0.8;
      pose.leftShinAngle = 1.2;
      pose.rightShinAngle = 1.2;
    }

    return pose;
  }
}
