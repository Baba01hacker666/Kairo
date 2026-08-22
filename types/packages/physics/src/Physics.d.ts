import { Vector3, BoundingBox, Ray } from '../../core/src/Math.ts';
import * as CANNON from 'cannon-es';
export declare const RigidBodyType: {
    readonly Dynamic: "DYNAMIC";
    readonly Static: "STATIC";
    readonly Kinematic: "KINEMATIC";
};
export type RigidBodyTypeValue = typeof RigidBodyType[keyof typeof RigidBodyType];
export declare const ColliderType: {
    readonly Box: "BOX";
    readonly Sphere: "SPHERE";
    readonly Capsule: "CAPSULE";
    readonly Mesh: "MESH";
};
export type ColliderTypeValue = typeof ColliderType[keyof typeof ColliderType];
export type CollisionPhase = 'enter' | 'stay' | 'exit';
export interface CollisionEvent {
    phase: CollisionPhase;
    body: RigidBody;
    other: RigidBody;
    collider: Collider;
    otherCollider: Collider;
}
export interface RaycastHit {
    hasHit: boolean;
    body: RigidBody | null;
    collider: Collider | null;
    point: Vector3;
    normal: Vector3;
    distance: number;
}
export declare class SpatialHashGrid3D {
    private cellSize;
    private invCellSize;
    private grid;
    constructor(cellSize?: number);
    private getHash;
    clear(): void;
    insert(id: number, pos: Vector3, radius?: number): void;
    getNearby(pos: Vector3, outBuffer?: Array<{
        id: number;
        pos: Vector3;
        radius: number;
    }>): Array<{
        id: number;
        pos: Vector3;
        radius: number;
    }>;
}
export declare class Collider {
    type: ColliderTypeValue;
    size: Vector3;
    radius: number;
    isTrigger: boolean;
    getBoundingBox(position: Vector3, target?: BoundingBox): BoundingBox;
}
export declare class RigidBody {
    type: RigidBodyTypeValue;
    mass: number;
    useGravity: boolean;
    linearDamping: number;
    angularDamping: number;
    collisionLayer: number;
    collisionMask: number;
    fixedRotation: boolean;
    lockLinearAxis: [boolean, boolean, boolean];
    lockAngularAxis: [boolean, boolean, boolean];
    cannonBody: CANNON.Body | null;
    private static _forceTemp;
    private static _pointTemp;
    applyForce(force: Vector3, point?: Vector3): void;
    applyImpulse(impulse: Vector3, point?: Vector3): void;
    applyTorque(torque: Vector3): void;
    teleport(position: Vector3): void;
    get velocity(): Vector3;
    set velocity(v: Vector3);
    get angularVelocity(): Vector3;
    set angularVelocity(v: Vector3);
    /** Zero-allocation velocity read into an optional target vector. */
    getVelocity(target?: Vector3): Vector3;
    /** Zero-allocation angular velocity read into an optional target vector. */
    getAngularVelocity(target?: Vector3): Vector3;
}
export type PhysicsBackendType = 'cannon' | 'havok' | 'go-wasm';
export declare class PhysicsWorld {
    getCannonWorld(): CANNON.World;
    gravity: Vector3;
    activeBackend: PhysicsBackendType;
    private bodies;
    private cannonWorld;
    private static _raycastTempBox;
    private static _raycastTempResult;
    private bodyLookup;
    private collisionListeners;
    private triggerListeners;
    private activePairs;
    private _nextPairs;
    private static readonly FIXED_TIMESTEP;
    private static readonly MAX_SUBSTEPS;
    constructor(backend?: PhysicsBackendType);
    setBackend(backend: PhysicsBackendType): void;
    clear(): void;
    registerBody(body: RigidBody, collider: Collider, position?: Vector3): void;
    unregisterBody(body: RigidBody): void;
    step(dt: number): void;
    private static _havokFallbackWarned;
    private cancelGravityForNonGravityBodies;
    onCollision(listener: (event: CollisionEvent) => void): void;
    onTrigger(listener: (event: CollisionEvent) => void): void;
    private static _defaultRayDir;
    private static _tempRay;
    raycast(originOrRay: Vector3 | Ray, directionOrMaxDist?: Vector3 | number, maxDistance?: number, target?: RaycastHit): RaycastHit;
    sphereCast(originOrRay: Vector3 | Ray, radius: number, direction?: Vector3, maxDistance?: number, target?: RaycastHit): RaycastHit;
    overlapSphere(center: Vector3, radius: number, target?: RigidBody[]): RigidBody[];
    overlapBox(center: Vector3, halfExtentsOrSize: Vector3, isHalfExtents?: boolean, target?: RigidBody[]): RigidBody[];
    private createShape;
    private syncKinematicAndStaticBodies;
    private syncDynamicBodies;
    private collectCollisionEvents;
    private emitCollision;
    private toRaycastHit;
}
export interface VehicleConfig {
    chassisBody: RigidBody;
    indexRightAxis?: number;
    indexUpAxis?: number;
    indexForwardAxis?: number;
}
export interface WheelInfo {
    radius: number;
    directionLocal: Vector3;
    suspensionStiffness: number;
    suspensionRestLength: number;
    frictionSlip: number;
    dampingRelaxation: number;
    dampingCompression: number;
    maxSuspensionForce: number;
    rollInfluence: number;
    axleLocal: Vector3;
    chassisConnectionPointLocal: Vector3;
    maxSuspensionTravel: number;
    customSlidingRotationalSpeed: number;
    useCustomSlidingRotationalSpeed: boolean;
    isFrontWheel?: boolean;
}
export declare class RaycastVehicle {
    cannonVehicle: CANNON.RaycastVehicle | null;
    chassisBody: RigidBody;
    constructor(config: VehicleConfig);
    addWheel(options: WheelInfo): void;
    setSteeringValue(value: number, wheelIndex: number): void;
    applyEngineForce(value: number, wheelIndex: number): void;
    setBrake(brake: number, wheelIndex: number): void;
    updateWheelTransform(wheelIndex: number): void;
    getWheelTransform(wheelIndex: number): {
        position: Vector3;
        quaternion: {
            x: number;
            y: number;
            z: number;
            w: number;
        };
    } | null;
    addToWorld(world: PhysicsWorld): void;
    removeFromWorld(world: PhysicsWorld): void;
}
