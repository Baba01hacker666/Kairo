# Kairo Engine - Plugin Developer Guide

Kairo Engine provides a plugin architecture via `@kairo/plugins`. All subsystems, components, systems, asset importers, and editor tools can be extended via custom plugins.

---

## 🔌 Creating a Custom Plugin

To build a custom plugin, implement the `Plugin` interface:

```typescript
import { Plugin, PluginMeta } from '@kairo/plugins';
import { Engine } from '@kairo/core';

export class CustomWaterRendererPlugin implements Plugin {
  public meta: PluginMeta = {
    id: 'kairo-water-renderer',
    name: 'Custom Realistic Water Renderer',
    version: '1.0.0',
    author: 'Community Contributor',
    description: 'Adds interactive ocean water shaders & wave physics simulation.'
  };

  onLoad(engine: Engine): void {
    console.log('Water Renderer Plugin Loaded!');
    // Attach custom ECS systems or render passes to engine
  }

  onUnload(engine: Engine): void {
    console.log('Water Renderer Plugin Unloaded.');
  }
}
```

---

## 🛠️ Registering Plugins

```typescript
import { PluginManager } from '@kairo/plugins';

const pluginManager = new PluginManager();
pluginManager.registerPlugin(new CustomWaterRendererPlugin(), engine);
```
