import { Engine } from '../../core/src/Engine.ts';

export interface PluginMeta {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  dependencies?: string[];
}

export interface Plugin {
  meta: PluginMeta;
  onLoad(engine: Engine): void;
  onUpdate?(engine: Engine, dt: number): void;
  onRender?(engine: Engine): void;
  onUnload?(engine: Engine): void;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private updateListeners: Map<string, (dt: number) => void> = new Map();
  private renderListeners: Map<string, () => void> = new Map();

  registerPlugin(plugin: Plugin, engine: Engine): void {
    if (this.plugins.has(plugin.meta.id)) {
      console.warn(`Plugin ${plugin.meta.id} is already registered.`);
      return;
    }

    // Verify dependencies
    if (plugin.meta.dependencies) {
      for (const dep of plugin.meta.dependencies) {
        if (!this.plugins.has(dep)) {
          console.error(`Cannot load plugin ${plugin.meta.id}: Missing dependency ${dep}`);
          return;
        }
      }
    }

    this.plugins.set(plugin.meta.id, plugin);

    try {
      plugin.onLoad(engine);

      if (plugin.onUpdate) {
        const updateFn = (dt: number) => plugin.onUpdate!(engine, dt);
        this.updateListeners.set(plugin.meta.id, updateFn);
        engine.events.on('update', updateFn);
      }

      if (plugin.onRender) {
        const renderFn = () => plugin.onRender!(engine);
        this.renderListeners.set(plugin.meta.id, renderFn);
        engine.events.on('render', renderFn);
      }

      console.log(`[Kairo Engine] Plugin Loaded: ${plugin.meta.name} v${plugin.meta.version}`);
    } catch (e) {
      console.error(`Error loading plugin ${plugin.meta.id}:`, e);
    }
  }

  unregisterPlugin(pluginId: string, engine: Engine): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      const updateFn = this.updateListeners.get(pluginId);
      if (updateFn) {
        engine.events.off('update', updateFn);
        this.updateListeners.delete(pluginId);
      }

      const renderFn = this.renderListeners.get(pluginId);
      if (renderFn) {
        engine.events.off('render', renderFn);
        this.renderListeners.delete(pluginId);
      }

      if (plugin.onUnload) {
        try {
          plugin.onUnload(engine);
        } catch (e) {
          console.error(`Error unloading plugin ${pluginId}:`, e);
        }
      }

      this.plugins.delete(pluginId);
      console.log(`[Kairo Engine] Plugin Unloaded: ${plugin.meta.name}`);
    }
  }

  getPlugins(): PluginMeta[] {
    return Array.from(this.plugins.values()).map(p => p.meta);
  }

  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }
}
