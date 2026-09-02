import * as THREE from 'three';
/**
 * Lightweight sparkle particle field backed by a THREE.Points buffer.
 * Every point shares one material; the colour is set per burst.
 */
export declare class SparkleField {
    private points;
    private positionAttribute;
    private material;
    private index;
    constructor(scene: THREE.Scene, count: number);
    emitSpark(position: THREE.Vector3, color?: number): void;
}
