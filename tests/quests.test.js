import test from 'node:test';
import assert from 'node:assert';
import { QuestSystem } from '../packages/core/src/QuestSystem.ts';

test('QuestSystem - start, advance, and auto-complete objectives and quest', () => {
  const qs = new QuestSystem();
  const events = [];
  qs.on('quest_started', id => events.push(['started', id]));
  qs.on('objective_progress', e => events.push(['progress', e.questId, e.objectiveId, e.progress]));
  qs.on('objective_completed', e => events.push(['obj_complete', e.questId, e.objectiveId]));
  qs.on('quest_completed', id => events.push(['complete', id]));

  qs.register({
    id: 'gather_acorns',
    title: 'Gather Sun Acorns',
    objectives: [
      { id: 'acorns', text: 'Gather {current}/{total} acorns', target: 5 },
      { id: 'talk', text: 'Speak to the owl' }
    ]
  });

  const quest = qs.start('gather_acorns');
  assert.notStrictEqual(quest, null);
  assert.strictEqual(qs.isActive('gather_acorns'), true);

  qs.advance('gather_acorns', 'acorns', 3);
  assert.strictEqual(qs.get('gather_acorns').objectives[0].progress, 3);
  assert.strictEqual(qs.isCompleted('gather_acorns'), false);

  qs.advance('gather_acorns', 'acorns', 2); // reaches target 5
  assert.strictEqual(qs.get('gather_acorns').objectives[0].completed, true);

  qs.advance('gather_acorns', 'talk', 1);
  assert.strictEqual(qs.isCompleted('gather_acorns'), true);

  assert.deepStrictEqual(events.filter(e => e[0] === 'complete'), [['complete', 'gather_acorns']]);
  assert.ok(events.some(e => e[0] === 'obj_complete' && e[2] === 'acorns'));
});

test('QuestSystem - setProgress clamps to target and completion is idempotent', () => {
  const qs = new QuestSystem();
  qs.register({ id: 'q1', title: 'Q1', objectives: [{ id: 'o1', target: 10 }] });
  qs.start('q1');

  let completes = 0;
  qs.on('quest_completed', () => completes++);

  qs.setProgress('q1', 'o1', 99); // clamped to 10 → completes
  assert.strictEqual(qs.get('q1').objectives[0].progress, 10);
  assert.strictEqual(qs.isCompleted('q1'), true);
  qs.complete('q1'); // already completed → no double event
  assert.strictEqual(completes, 1);
});

test('QuestSystem - prerequisites gate quest start', () => {
  const qs = new QuestSystem();
  qs.register({ id: 'intro', title: 'Intro', objectives: [{ id: 'o', text: 'Finish intro' }] });
  qs.register({ id: 'boss', title: 'Boss', objectives: [{ id: 'o', text: 'Defeat boss' }], prerequisites: ['intro'] });

  assert.strictEqual(qs.hasUnlocked('boss'), false);
  assert.strictEqual(qs.start('boss'), null); // locked

  qs.start('intro');
  qs.complete('intro');
  assert.strictEqual(qs.hasUnlocked('boss'), true);
  assert.notStrictEqual(qs.start('boss'), null);
});

test('QuestSystem - fail quest and serialize/deserialize round trip', () => {
  const qs = new QuestSystem();
  qs.register({ id: 'run', title: 'Time Trial', objectives: [{ id: 'rings', target: 3 }] });
  qs.start('run');
  qs.advance('run', 'rings', 1);

  qs.fail('run');
  assert.strictEqual(qs.get('run').status, 'failed');

  // Serialize and restore into a fresh system (with definitions registered)
  const snapshots = qs.serialize();
  const qs2 = new QuestSystem();
  qs2.register({ id: 'run', title: 'Time Trial', objectives: [{ id: 'rings', target: 3 }] });
  qs2.deserialize(snapshots);

  assert.strictEqual(qs2.get('run').status, 'failed');
  assert.strictEqual(qs2.get('run').objectives[0].progress, 1);
  assert.strictEqual(qs2.get('run').objectives[0].completed, false);
});

test('QuestSystem - getFormattedText fills {current}/{total} placeholders', () => {
  const qs = new QuestSystem();
  qs.register({ id: 'gather', title: 'Gather', objectives: [{ id: 'acorns', text: 'Gather {current}/{total} acorns', target: 5 }] });
  qs.start('gather');
  qs.advance('gather', 'acorns', 3);

  assert.strictEqual(qs.getFormattedText('gather', 'acorns'), 'Gather 3/5 acorns');
  assert.strictEqual(qs.getFormattedText('gather', 'missing'), null);
  assert.strictEqual(qs.getFormattedText('nope', 'acorns'), null);

  const formatted = qs.getFormattedObjectives('gather');
  assert.strictEqual(formatted.length, 1);
  assert.strictEqual(formatted[0].text, 'Gather 3/5 acorns');
  assert.strictEqual(formatted[0].progress, 3);
  assert.strictEqual(formatted[0].completed, false);
  assert.strictEqual(qs.getFormattedObjectives('nope'), null);
});

test('QuestSystem - unknown quest throws on progress, getActive lists started quests', () => {
  const qs = new QuestSystem();
  assert.throws(() => qs.advance('nope', 'o'));
  assert.strictEqual(qs.get('nope'), undefined);

  qs.register({ id: 'a', title: 'A', objectives: [{ id: 'o' }] });
  qs.register({ id: 'b', title: 'B', objectives: [{ id: 'o' }] });
  qs.start('a');
  const active = qs.getActive().map(q => q.id);
  assert.deepStrictEqual(active, ['a']);
});

test('QuestSystem - objectives completed before start still complete the quest (regression)', () => {
  const qs = new QuestSystem();
  qs.register({ id: 'q', title: 'Q', objectives: [{ id: 'a', target: 2 }, { id: 'b', target: 1 }] });

  // Progress accumulates while the quest is still locked (e.g. save re-derivation)
  qs.advance('q', 'a', 2);
  qs.advance('q', 'b', 1);

  const events = [];
  qs.on('quest_started', id => events.push(['started', id]));
  qs.on('quest_completed', id => events.push(['completed', id]));

  qs.start('q');
  assert.strictEqual(qs.isCompleted('q'), true);
  assert.deepStrictEqual(events, [['started', 'q'], ['completed', 'q']]);
});

test('QuestSystem - start on a completed quest is a no-op; failed quest restarts fresh', () => {
  const qs = new QuestSystem();
  qs.register({ id: 'q', title: 'Q', objectives: [{ id: 'o', target: 1 }] });
  qs.start('q');
  qs.advance('q', 'o', 1);
  assert.strictEqual(qs.isCompleted('q'), true);

  let completes = 0;
  qs.on('quest_completed', () => completes++);
  const quest = qs.start('q'); // already completed — must not reactivate
  assert.strictEqual(quest.status, 'completed');
  assert.strictEqual(qs.isActive('q'), false);
  assert.strictEqual(completes, 0);

  // Failed quests restart with clean objective progress
  qs.register({ id: 'f', title: 'F', objectives: [{ id: 'o', target: 2 }] });
  qs.start('f');
  qs.advance('f', 'o', 1);
  qs.fail('f');
  qs.start('f');
  assert.strictEqual(qs.isActive('f'), true);
  assert.strictEqual(qs.get('f').objectives[0].progress, 0);
});
