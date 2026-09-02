import * as THREE from 'three';
import { KairoApp } from '@kairo/core';
export declare const ARENA_HALF = 14;
export declare const PLAYER_SPAWN: THREE.Vector3;
export declare function getRandomArenaPosition(clearance: number, height: number): THREE.Vector3;
/**
 * Builds the neon arena, glowing orb player model, collectible orbs,
 * rotating spike hazards, floating crystals and the sparkle particle field.
 * Returns references the game loop needs to update each frame.
 */
export declare function buildWorld(app: KairoApp, shadows: boolean): {
    scene: THREE.Scene<THREE.Object3DEventMap>;
    orbGroup: THREE.Group<THREE.Object3DEventMap>;
    glowMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;
    player: {
        mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>;
        rb: import("@kairo/core").RigidBody;
        col: import("@kairo/core").Collider;
        dispose: () => void;
    } | {
        mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>;
        rb?: undefined;
        col?: undefined;
        dispose?: undefined;
    };
    collectibles: {
        mesh: THREE.Mesh;
        active: boolean;
        respawnAt: number;
    }[];
    hazards: {
        mesh: THREE.Group;
        centerX: number;
        centerZ: number;
        radius: number;
        speed: number;
        phase: number;
    }[];
    crystals: THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap>, THREE.Material<THREE.MaterialEventMap> | THREE.Material<THREE.MaterialEventMap>[], THREE.Object3DEventMap>[];
};
export type GameWorld = ReturnType<typeof buildWorld>;
