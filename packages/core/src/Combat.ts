import { EventEmitter } from './EventSystem.ts';

export interface DamageOptions {
  /** Damage source label (e.g. enemy id, hazard name) for events/debugging. */
  source?: string;
  /** Seconds of invulnerability granted after the hit. Defaults to the component's value. */
  invulnerabilityDuration?: number;
  /** Bypass the invulnerability window (e.g. environmental damage). */
  ignoreInvulnerability?: boolean;
}

export interface DamageEvent {
  id: string;
  amount: number;
  current: number;
  max: number;
  source?: string;
  killed: boolean;
}

export interface HealEvent {
  id: string;
  amount: number;
  current: number;
  max: number;
}

/**
 * ❤️ HealthComponent
 * A self-contained health pool with damage/heal/death/revive semantics,
 * invulnerability windows, and event hooks. Tick `update(dt)` each frame
 * while invulnerability is active.
 *
 * Events (payload carries `id` = entity label):
 *  - 'damaged'   ({ id, amount, current, max, source, killed })
 *  - 'healed'    ({ id, amount, current, max })
 *  - 'died'      ({ id })
 *  - 'revived'   ({ id })
 *  - 'invulnerable_end' ({ id })
 */
export class HealthComponent extends EventEmitter {
  public id: string;
  public current: number;
  public max: number;
  public isDead: boolean;
  /** Active invulnerability remaining, in seconds. */
  public invulnerabilityTimer: number = 0;
  /** Default invulnerability window granted by damage(). */
  public invulnerabilityDuration: number = 0;
  /** Invulnerable while the timer is above 0. */
  public isInvulnerable: boolean = false;

  constructor(max: number = 100, id: string = 'entity') {
    super();
    this.max = Math.max(1, max);
    this.current = this.max;
    this.isDead = false;
    this.id = id;
  }

  /** Apply damage. Returns the amount actually dealt (0 if invulnerable/dead). */
  public damage(amount: number, options: DamageOptions = {}): number {
    if (this.isDead) return 0;
    if (!options.ignoreInvulnerability && this.isInvulnerable) return 0;

    const dealt = Math.min(amount, this.current);
    this.current = Math.max(0, this.current - amount);
    const killed = this.current <= 0;

    const duration = options.invulnerabilityDuration ?? this.invulnerabilityDuration;
    if (duration > 0) {
      this.invulnerabilityTimer = duration;
      this.isInvulnerable = true;
    }

    this.emit('damaged', {
      id: this.id,
      amount: dealt,
      current: this.current,
      max: this.max,
      source: options.source,
      killed
    } satisfies DamageEvent);

    if (killed && !this.isDead) {
      this.isDead = true;
      this.emit('died', { id: this.id });
    }
    return dealt;
  }

  /** Restore health. Returns the amount actually restored. */
  public heal(amount: number): number {
    if (this.isDead) return 0;
    const restored = Math.min(amount, this.max - this.current);
    this.current += restored;
    this.emit('healed', { id: this.id, amount: restored, current: this.current, max: this.max } satisfies HealEvent);
    return restored;
  }

  /** Resize the max health pool. */
  public setMax(max: number, keepCurrentRatio: boolean = true): void {
    const ratio = keepCurrentRatio ? this.current / this.max : 1;
    this.max = Math.max(1, max);
    this.current = Math.round(this.max * ratio);
  }

  /** Revive with full (or partial) health. */
  public revive(health?: number): void {
    this.isDead = false;
    this.current = health ?? this.max;
    this.emit('revived', { id: this.id });
  }

  /** Reset to full health and clear invulnerability. */
  public reset(): void {
    this.isDead = false;
    this.current = this.max;
    this.invulnerabilityTimer = 0;
    this.isInvulnerable = false;
  }

  /** Tick invulnerability timers. Safe to call every frame. */
  public update(dt: number): void {
    if (this.invulnerabilityTimer <= 0) return;
    this.invulnerabilityTimer -= dt;
    if (this.invulnerabilityTimer <= 0) {
      this.invulnerabilityTimer = 0;
      this.isInvulnerable = false;
      this.emit('invulnerable_end', { id: this.id });
    }
  }
}

/**
 * ⚔️ CombatSystem
 * Registry of named health components with entity-scoped damage/heal helpers.
 * Tick `update(dt)` to drive invulnerability timers for all entities.
 *
 * Events (all carry `id`):
 *  - 'entity_damaged'  DamageEvent
 *  - 'entity_healed'   HealEvent
 *  - 'entity_died'     { id }
 *  - 'entity_revived'  { id }
 */
export class CombatSystem {
  private entities: Map<string, HealthComponent> = new Map();
  public events: EventEmitter = new EventEmitter();

  public register(id: string, health: HealthComponent): HealthComponent {
    this.entities.set(id, health);
    // Forward component events with the entity id included.
    health.on('damaged', e => this.events.emit('entity_damaged', e));
    health.on('healed', e => this.events.emit('entity_healed', e));
    health.on('died', e => this.events.emit('entity_died', e));
    health.on('revived', e => this.events.emit('entity_revived', e));
    return health;
  }

  /** Convenience: create + register a health component in one call. */
  public add(id: string, max: number = 100): HealthComponent {
    return this.register(id, new HealthComponent(max, id));
  }

  public unregister(id: string): void {
    this.entities.delete(id);
  }

  public get(id: string): HealthComponent | undefined {
    return this.entities.get(id);
  }

  public has(id: string): boolean {
    return this.entities.has(id);
  }

  public damage(id: string, amount: number, options: DamageOptions = {}): number {
    return this.entities.get(id)?.damage(amount, options) ?? 0;
  }

  public heal(id: string, amount: number): number {
    return this.entities.get(id)?.heal(amount) ?? 0;
  }

  public revive(id: string, health?: number): void {
    this.entities.get(id)?.revive(health);
  }

  public isDead(id: string): boolean {
    return this.entities.get(id)?.isDead ?? false;
  }

  /** Tick invulnerability timers for every registered entity. */
  public update(dt: number): void {
    this.entities.forEach(health => health.update(dt));
  }

  public get size(): number {
    return this.entities.size;
  }
}
