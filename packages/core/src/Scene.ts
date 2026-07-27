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

export class SceneNode {
  public id: string;
  public name: string;
  public parent: SceneNode | null = null;
  public children: SceneNode[] = [];
  
  public position: Vector3 = new Vector3(0, 0, 0);
  public rotation: Quaternion = new Quaternion(0, 0, 0, 1);
  public scale: Vector3 = new Vector3(1, 1, 1);
  
  public localMatrix: Matrix4 = new Matrix4();
  public worldMatrix: Matrix4 = new Matrix4();

  public components: Map<string, any> = new Map();

  constructor(name: string = 'Node', id?: string) {
    this.name = name;
    this.id = id || `node_${Math.random().toString(36).substring(2, 9)}`;
  }

  addChild(child: SceneNode): this {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    this.children.push(child);
    return this;
  }

  removeChild(child: SceneNode): this {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      child.parent = null;
      this.children.splice(idx, 1);
    }
    return this;
  }

  addComponent(name: string, componentData: any): this {
    this.components.set(name, componentData);
    return this;
  }

  getComponent<T>(name: string): T | undefined {
    return this.components.get(name) as T;
  }

  updateMatrix(): void {
    this.localMatrix.compose(this.position, this.rotation, this.scale);
    if (this.parent) {
      this.worldMatrix.copy(this.localMatrix); 
    } else {
      this.worldMatrix.copy(this.localMatrix);
    }

    for (const child of this.children) {
      child.updateMatrix();
    }
  }

  serialize(): SceneNodeSerialized {
    return {
      id: this.id,
      name: this.name,
      position: [this.position.x, this.position.y, this.position.z],
      rotation: [this.rotation.x, this.rotation.y, this.rotation.z, this.rotation.w],
      scale: [this.scale.x, this.scale.y, this.scale.z],
      components: Object.fromEntries(this.components.entries()),
      children: this.children.map(c => c.serialize())
    };
  }

  static deserialize(data: SceneNodeSerialized): SceneNode {
    const node = new SceneNode(data.name, data.id);
    node.position.set(...data.position);
    node.rotation.set(...data.rotation);
    node.scale.set(...data.scale);
    
    for (const [k, v] of Object.entries(data.components || {})) {
      node.addComponent(k, v);
    }

    for (const childData of data.children || []) {
      node.addChild(SceneNode.deserialize(childData));
    }

    return node;
  }
}

export class Scene {
  public root: SceneNode = new SceneNode('Scene Root');
  public events: EventEmitter = new EventEmitter();
  public name: string;

  constructor(name: string = 'Default Scene') {
    this.name = name;
  }

  add(node: SceneNode): void {
    this.root.addChild(node);
    this.events.emit('nodeAdded', node);
  }

  remove(node: SceneNode): void {
    this.root.removeChild(node);
    this.events.emit('nodeRemoved', node);
  }

  findByName(name: string): SceneNode | null {
    const search = (current: SceneNode): SceneNode | null => {
      if (current.name === name) return current;
      for (const child of current.children) {
        const found = search(child);
        if (found) return found;
      }
      return null;
    };
    return search(this.root);
  }

  serialize(): string {
    return JSON.stringify({
      name: this.name,
      root: this.root.serialize()
    }, null, 2);
  }

  static deserialize(jsonStr: string): Scene {
    const data = JSON.parse(jsonStr);
    const scene = new Scene(data.name);
    scene.root = SceneNode.deserialize(data.root);
    return scene;
  }
}
