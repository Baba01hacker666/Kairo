import { Vector3, Quaternion, Matrix4 } from './Math.ts';
import { EventEmitter } from './EventSystem.ts';
export interface SceneNodeSerialized {
    id: string;
    name: string;
    position: [number, number, number];
    rotation: [number, number, number, number];
    scale: [number, number, number];
    components: Record<string, any>;
    children: SceneNodeSerialized[];
}
export declare class SceneNode {
    id: string;
    name: string;
    parent: SceneNode | null;
    children: SceneNode[];
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    localMatrix: Matrix4;
    worldMatrix: Matrix4;
    components: Map<string, any>;
    constructor(name?: string, id?: string);
    addChild(child: SceneNode): this;
    removeChild(child: SceneNode): this;
    addComponent(name: string, componentData: any): this;
    getComponent<T>(name: string): T | undefined;
    updateMatrix(): void;
    serialize(): SceneNodeSerialized;
    static deserialize(data: SceneNodeSerialized): SceneNode;
}
export declare class Scene {
    root: SceneNode;
    events: EventEmitter;
    name: string;
    constructor(name?: string);
    add(node: SceneNode): void;
    remove(node: SceneNode): void;
    findByName(name: string): SceneNode | null;
    serialize(): string;
    static deserialize(jsonStr: string): Scene;
}
