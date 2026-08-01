import test from 'node:test';
import assert from 'node:assert';
import { NetworkManager, StateInterpolator } from '../packages/network/src/Network.ts';

test('NetworkManager RPC registration and state replication', () => {
  const net = new NetworkManager();
  let rpcCalled = false;
  let receivedArgs = [];

  net.registerRPC('spawnParticle', (x, y, z) => {
    rpcCalled = true;
    receivedArgs = [x, y, z];
  });

  net.sendRPC('spawnParticle', [10, 20, 30]);

  assert.strictEqual(rpcCalled, true);
  assert.deepStrictEqual(receivedArgs, [10, 20, 30]);
});

test('StateInterpolator smooth interpolation between snapshots', () => {
  const interpolator = new StateInterpolator();

  interpolator.pushSnapshot({
    entityId: 'player1',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    timestamp: 1000
  });

  interpolator.pushSnapshot({
    entityId: 'player1',
    position: { x: 10, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    timestamp: 1200
  });

  // Render time target = 1100 + 100 (delay) = 1200 => mid-point = 1100 ms target
  const state = interpolator.getInterpolatedState(1200);

  assert.notStrictEqual(state, null);
  assert.strictEqual(state.position.x, 5); // Halfway between 0 and 10
});
