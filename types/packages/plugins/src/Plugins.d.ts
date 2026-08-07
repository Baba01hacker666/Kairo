import { Engine } from '@kairo/core';
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
export declare class PluginManager {
    private plugins;
    private updateListeners;
    private renderListeners;
    registerPlugin(plugin: Plugin, engine: Engine): void;
    unregisterPlugin(pluginId: string, engine: Engine): void;
    getPlugins(): PluginMeta[];
    hasPlugin(pluginId: string): boolean;
}
