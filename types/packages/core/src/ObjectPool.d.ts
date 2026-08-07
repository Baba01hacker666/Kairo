/**
 * High Performance Object Pooler
 */
export declare class ObjectPool<T> {
    private freeList;
    private factory;
    private resetFn?;
    constructor(factory: () => T, resetFn?: (item: T) => void, initialSize?: number);
    get(): T;
    release(item: T): void;
    get poolSize(): number;
}
