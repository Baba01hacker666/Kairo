import * as THREE from 'three';
/** A deterministic, instanced understory: two draw calls and no per-frame work. */
export declare function createMeadowDetails(heightAt: (x: number, z: number) => number, mobile?: boolean): THREE.Group;
