import * as THREE from 'three';
import { KairoApp } from '@kairo/core';
export declare function makeRadialTexture(inner: string, outer: string, size?: number): THREE.CanvasTexture;
export declare function makeSkyTexture(): THREE.CanvasTexture;
export declare function makeGroundTexture(): THREE.CanvasTexture;
export declare function setupEnvironment(app: KairoApp): void;
