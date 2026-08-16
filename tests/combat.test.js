import test from 'node:test';
import assert from 'node:assert';
import { HealthComponent, CombatSystem } from '../packages/core/src/Combat.ts';

test('HealthComponent - damage, death, and events', () => {
  const hp = new HealthComponent(10, 'hero');
  const events = [];
  hp.on('damaged', e => events.push(['damaged', e.amount, e.current]));
  hp.on('died', e => events.push(['died', e.id]));

  assert.strictEqual(hp.damage(3), 3);
  assert.strictEqual(hp.current, 7);

  assert.strictEqual(hp.damage(100), 7); // lethal overkill, actual dealt = remaining
  assert.strictEqual(hp.current, 0);
  assert.strictEqual(hp.isDead, true);

  // Dead entities cannot be damaged or healed
  assert.strictEqual(hp.damage(5), 0);
  assert.strictEqual(hp.heal(5), 0);

  assert.deepStrictEqual(events[0], ['damaged', 3, 7]);
  assert.ok(events.some(e => e[0] === 'died' && e[1] === 'hero'));
});

test('HealthComponent - invulnerability window blocks damage until timer expires', () => {
  const hp = new HealthComponent(10);
  hp.invulnerabilityDuration = 1.0; // 1 second of i-frames per hit

  hp.damage(4); // grants 1s invulnerability
  assert.strictEqual(hp.isInvulnerable, true);
  assert.strictEqual(hp.damage(8, { source: 'spike' }), 0); // blocked
  assert.strictEqual(hp.current, 6);

  let invEndFired = false;
  hp.on('invulnerable_end', () => invEndFired = true);

  hp.update(0.5);
  assert.strictEqual(hp.isInvulnerable, true); // still invulnerable
  hp.update(0.5);
  assert.strictEqual(hp.isInvulnerable, false);
  assert.strictEqual(invEndFired, true);

  assert.strictEqual(hp.damage(2), 2);
  assert.strictEqual(hp.current, 4);
});

test('HealthComponent - ignoreInvulnerability and per-hit duration override', () => {
  const hp = new HealthComponent(10);
  hp.invulnerabilityDuration = 5;

  hp.damage(2);
  assert.strictEqual(hp.damage(2, { ignoreInvulnerability: true }), 2);
  assert.strictEqual(hp.damage(2, { invulnerabilityDuration: 0 }), 0); // still blocked by 5s window

  hp.update(5);
  hp.damage(2, { invulnerabilityDuration: 0.5 });
  assert.strictEqual(hp.isInvulnerable, true);
  hp.update(0.25);
  assert.strictEqual(hp.isInvulnerable, true);
  hp.update(0.25);
  assert.strictEqual(hp.isInvulnerable, false);
});

test('HealthComponent - heal clamps to max, revive and reset', () => {
  const hp = new HealthComponent(100, 'tank');
  hp.damage(70);
  assert.strictEqual(hp.current, 30);

  assert.strictEqual(hp.heal(50), 50); // 30 + 50 = 80
  assert.strictEqual(hp.current, 80);
  assert.strictEqual(hp.heal(1000), 20); // clamps to 100
  assert.strictEqual(hp.current, 100);

  hp.damage(100);
  assert.strictEqual(hp.isDead, true);
  let revived = false;
  hp.on('revived', () => revived = true);
  hp.revive();
  assert.strictEqual(hp.isDead, false);
  assert.strictEqual(hp.current, 100);
  assert.strictEqual(revived, true);

  hp.damage(50);
  hp.reset();
  assert.strictEqual(hp.current, hp.max);
  assert.strictEqual(hp.isDead, false);
});

test('HealthComponent - setMax preserves ratio', () => {
  const hp = new HealthComponent(100);
  hp.damage(50); // 50/100
  hp.setMax(200);
  assert.strictEqual(hp.max, 200);
  assert.strictEqual(hp.current, 100); // kept 50% ratio
});

test('CombatSystem - registry with entity-scoped damage and forwarded events', () => {
  const cs = new CombatSystem();
  const events = [];
  cs.events.on('entity_damaged', e => events.push(['damaged', e.id, e.amount]));
  cs.events.on('entity_died', e => events.push(['died', e.id]));

  const hero = cs.add('hero', 10);
  cs.add('minion', 3);

  cs.damage('hero', 4, { source: 'minion' });
  assert.strictEqual(hero.current, 6);
  assert.deepStrictEqual(events[0], ['damaged', 'hero', 4]);

  cs.damage('minion', 3);
  assert.strictEqual(cs.isDead('minion'), true);
  assert.ok(events.some(e => e[0] === 'died' && e[1] === 'minion'));

  // Unknown entity is a no-op
  assert.strictEqual(cs.damage('ghost', 5), 0);
  assert.strictEqual(cs.heal('ghost', 5), 0);

  // update() drives all invulnerability timers
  cs.add('knight', 10);
  cs.get('knight').invulnerabilityDuration = 1;
  cs.damage('knight', 2);
  assert.strictEqual(cs.get('knight').isInvulnerable, true);
  cs.update(1);
  assert.strictEqual(cs.get('knight').isInvulnerable, false);

  cs.unregister('minion');
  assert.strictEqual(cs.has('minion'), false);
});

test('HealthComponent - revive payload carries current/max and clamps (regression)', () => {
  const hp = new HealthComponent(10, 'hero');
  hp.damage(10);
  assert.strictEqual(hp.isDead, true);

  let payload = null;
  hp.on('revived', e => payload = e);
  hp.revive(6);
  assert.deepStrictEqual(payload, { id: 'hero', current: 6, max: 10 });

  hp.damage(10);
  hp.revive(999); // clamps to max
  assert.strictEqual(hp.current, 10);
});

test('HealthComponent - setMax without ratio keeps clamped current instead of full-healing (regression)', () => {
  const hp = new HealthComponent(100);
  hp.damage(70); // current 30
  hp.setMax(200, false);
  assert.strictEqual(hp.max, 200);
  assert.strictEqual(hp.current, 30);

  hp.setMax(10, false); // shrink below current → clamp
  assert.strictEqual(hp.max, 10);
  assert.strictEqual(hp.current, 10);
});

test('HealthComponent - zero and negative damage are rejected (regression)', () => {
  const hp = new HealthComponent(10);
  let damagedEvents = 0;
  hp.on('damaged', () => damagedEvents++);

  assert.strictEqual(hp.damage(0), 0);
  assert.strictEqual(hp.damage(-5), 0);
  assert.strictEqual(hp.current, 10);
  assert.strictEqual(damagedEvents, 0);
  assert.strictEqual(hp.isInvulnerable, false);
});

test('CombatSystem - re-register does not duplicate events; unregister stops forwarding (regression)', () => {
  const cs = new CombatSystem();
  const events = [];
  cs.events.on('entity_damaged', e => events.push(e.id));

  const hero = cs.add('hero', 10);
  cs.register('hero_alias', hero); // same component under a second id
  cs.damage('hero', 1);
  assert.deepStrictEqual(events, ['hero']); // exactly one forwarded event

  cs.unregister('hero');
  cs.unregister('hero_alias');
  cs.damage('hero', 1); // unregistered → no-op
  assert.deepStrictEqual(events, ['hero']);

  // Component-level listeners were detached: direct damage emits nothing new.
  const before = events.length;
  hero.damage(1);
  assert.strictEqual(events.length, before);
});
