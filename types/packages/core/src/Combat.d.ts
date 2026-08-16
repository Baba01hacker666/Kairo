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
export interface ReviveEvent {
    id: string;
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
 *  - 'revived'   ({ id, current, max })
 *  - 'invulnerable_end' ({ id })
 */
export declare class HealthComponent extends EventEmitter {
    id: string;
    current: number;
    max: number;
    isDead: boolean;
    /** Active invulnerability remaining, in seconds. */
    invulnerabilityTimer: number;
    /** Default invulnerability window granted by damage(). */
    invulnerabilityDuration: number;
    /** Invulnerable while the timer is above 0. */
    isInvulnerable: boolean;
    constructor(max?: number, id?: string);
    /** Apply damage. Returns the amount actually dealt (0 if invulnerable/dead). */
    damage(amount: number, options?: DamageOptions): number;
    /** Restore health. Returns the amount actually restored. */
    heal(amount: number): number;
    /** Resize the max health pool. */
    setMax(max: number, keepCurrentRatio?: boolean): void;
    /** Revive with full (or partial) health. */
    revive(health?: number): void;
    /** Reset to full health and clear invulnerability. */
    reset(): void;
    /** Tick invulnerability timers. Safe to call every frame. */
    update(dt: number): void;
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
 *  - 'entity_revived'  ReviveEvent
 */
export declare class CombatSystem {
    private entities;
    /** Registered ids per component, so one component is forwarded exactly once. */
    private forwarderIds;
    /** Unsubscribe handles for a component's forwarding listeners. */
    private forwarderOffs;
    events: EventEmitter;
    register(id: string, health: HealthComponent): HealthComponent;
    /** Convenience: create + register a health component in one call. */
    add(id: string, max?: number): HealthComponent;
    unregister(id: string): void;
    get(id: string): HealthComponent | undefined;
    has(id: string): boolean;
    damage(id: string, amount: number, options?: DamageOptions): number;
    heal(id: string, amount: number): number;
    revive(id: string, health?: number): void;
    isDead(id: string): boolean;
    /** Tick invulnerability timers for every registered entity. */
    update(dt: number): void;
    get size(): number;
}
