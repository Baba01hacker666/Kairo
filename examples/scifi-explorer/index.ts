import { Engine, Vector3 } from '@kairo/core';
import { World } from '@kairo/ecs';
import { PhysicsWorld, RigidBody, Collider } from '@kairo/physics';
import { GlobalAudio } from '@kairo/audio';

console.log('--- Starting Kairo Engine 3D Sci-Fi Explorer Demo ---');

const engine = new Engine();
const world = new World();
const physics = new PhysicsWorld();

const player = world.createEntity('SciFiPlayer');
world.addComponent(player, new RigidBody());
world.addComponent(player, new Collider());

engine.events.on('update', (dt: number) => {
  physics.step(dt);
  world.update(dt);
});

engine.start();
console.log('Sci-Fi Explorer Engine Running at 60 FPS.');
