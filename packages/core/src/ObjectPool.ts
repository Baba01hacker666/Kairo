/**
 * High Performance Object Pooler
 */

export class ObjectPool<T> {
  private freeList: T[] = [];
  private factory: () => T;
  private resetFn?: (item: T) => void;

  constructor(
    factory: () => T,
    resetFn?: (item: T) => void,
    initialSize: number = 32
  ) {
    this.factory = factory;
    this.resetFn = resetFn;

    for (let i = 0; i < initialSize; i++) {
      this.freeList.push(this.factory());
    }
  }

  get(): T {
    if (this.freeList.length > 0) {
      return this.freeList.pop()!;
    }
    return this.factory();
  }

  release(item: T): void {
    if (this.resetFn) {
      this.resetFn(item);
    }
    this.freeList.push(item);
  }

  get poolSize(): number {
    return this.freeList.length;
  }
}
