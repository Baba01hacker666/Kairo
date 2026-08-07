import * as THREE from 'three';
import { Vector3, Quaternion } from '@kairo/core';
export interface Keyframe<T> {
    time: number;
    value: T;
}
export declare class AnimationClip {
    name: string;
    duration: number;
    positionKeys: Keyframe<Vector3>[];
    rotationKeys: Keyframe<Quaternion>[];
    scaleKeys: Keyframe<Vector3>[];
    constructor(name: string, duration: number, positionKeys?: Keyframe<Vector3>[], rotationKeys?: Keyframe<Quaternion>[], scaleKeys?: Keyframe<Vector3>[]);
    samplePosition(time: number): Vector3;
    sampleRotation(time: number): Quaternion;
}
export declare class BlendTree1D {
    private clips;
    addClip(clip: AnimationClip, threshold: number): void;
    evaluate(parameter: number, time: number): {
        position: Vector3;
        rotation: Quaternion;
    };
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
export declare class AnimationStateMachine {
    mixer: THREE.AnimationMixer;
    private states;
    private parameters;
    private currentState;
    constructor(root: THREE.Object3D);
    registerState(name: string, clip: THREE.AnimationClip, options?: {
        fadeDuration?: number;
        timeScale?: number;
        loop?: THREE.AnimationActionLoopStyles;
    }): void;
    setParameter(name: string, value: any): void;
    getParameter(name: string): any;
    setState(name: string, fadeDuration?: number): void;
    getCurrentStateName(): string | null;
    update(dt: number): void;
}
export declare class InverseKinematicsSolver {
    static solveTwoBone(rootPos: Vector3, jointPos: Vector3, targetPos: Vector3, l1: number, l2: number): {
        jointPos: Vector3;
        endPos: Vector3;
    };
}
export declare class StickmanPose {
    headOffset: Vector3;
    torsoAngle: number;
    leftArmAngle: number;
    rightArmAngle: number;
    leftForearmAngle: number;
    rightForearmAngle: number;
    leftLegAngle: number;
    rightLegAngle: number;
    leftShinAngle: number;
    rightShinAngle: number;
    rootY: number;
    rootFlipAngle: number;
}
export declare class StickmanAnimator {
    static evaluate(state: 'idle' | 'walk' | 'run' | 'jump' | 'ragdoll', time: number, speed?: number): StickmanPose;
}
