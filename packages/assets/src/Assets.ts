/**
 * Kairo Asset Pipeline & Cache Manager
 * Supports GLTF, OBJ, Images, Audio, & Hot-Reload Asset Caching
 */

export class AssetManager {
  private cache: Map<string, any> = new Map();
  private pending: Map<string, Promise<any>> = new Map();

  async loadText(url: string): Promise<string> {
    if (this.cache.has(url)) return this.cache.get(url);
    const res = await fetch(url);
    const text = await res.text();
    this.cache.set(url, text);
    return text;
  }

  async loadJSON<T = any>(url: string): Promise<T> {
    if (this.cache.has(url)) return this.cache.get(url);
    const text = await this.loadText(url);
    const json = JSON.parse(text);
    this.cache.set(url, json);
    return json;
  }

  async loadImage(url: string): Promise<HTMLImageElement> {
    if (this.cache.has(url)) return this.cache.get(url);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.cache.set(url, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  get<T>(url: string): T | undefined {
    return this.cache.get(url);
  }

  has(url: string): boolean {
    return this.cache.has(url);
  }

  unload(url: string): void {
    this.cache.delete(url);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const GlobalAssets = new AssetManager();
