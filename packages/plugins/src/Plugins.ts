import { Engine } from '@kairo/core';

export interface PluginMeta {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
}

export interface Plugin {
  meta: PluginMeta;
  onLoad(engine: Engine): void;
  onUnload?(engine: Engine): void;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  registerPlugin(plugin: Plugin, engine: Engine): void {
    if (this.plugins.has(plugin.meta.id)) {
      console.warn(`Plugin ${plugin.meta.id} is already registered.`);
      return;
    }
    this.plugins.set(plugin.meta.id, plugin);
    plugin.onLoad(engine);
    console.log(`Plugin loaded: ${plugin.meta.name} v${plugin.meta.version}`);
  }

  unregisterPlugin(pluginId: string, engine: Engine): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      if (plugin.onUnload) {
        plugin.onUnload(engine);
      }
      this.plugins.delete(pluginId);
      console.log(`Plugin unloaded: ${plugin.meta.name}`);
    }
  }

  getPlugins(): PluginMeta[] {
    return Array.from(this.plugins.values()).map(p => p.meta);
  }
}
