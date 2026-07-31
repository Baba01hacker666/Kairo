import { Serializer } from './Serializer.ts';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon?: string;
  secret?: boolean;
}

export class SaveSystem {
  private saveKey: string;
  public data: Record<string, any> = {};
  public achievementDefs: Record<string, AchievementDef> = {};
  
  constructor(gameId: string) {
    this.saveKey = `kairo_save_${gameId}`;
    this.load();
  }
  
  public load(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(this.saveKey);
      if (raw) {
        const envelope = JSON.parse(raw);
        const verified = Serializer.verifyAndUnwrapSave<Record<string, any>>(envelope);
        if (verified.valid && verified.payload) {
          this.data = verified.payload;
        }
      }
    } catch (e) {
      console.warn('[SaveSystem] Could not load save:', e);
    }
    
    if (!this.data.achievements) this.data.achievements = {};
    if (!this.data.progress) this.data.progress = {};
  }
  
  public save(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const envelope = Serializer.createSaveEnvelope(this.data);
      localStorage.setItem(this.saveKey, JSON.stringify(envelope));
    } catch (e) {
      console.warn('[SaveSystem] Could not save progress:', e);
    }
  }
  
  public getProgress<T>(key: string, defaultValue: T): T {
    return this.data.progress[key] !== undefined ? this.data.progress[key] : defaultValue;
  }
  
  public setProgress(key: string, value: any): void {
    this.data.progress[key] = value;
    this.save();
  }
  
  public unlockAchievement(id: string, uiManager?: any): boolean {
    if (this.data.achievements[id]) return false; // Already unlocked
    
    this.data.achievements[id] = true;
    this.save();
    
    if (uiManager && this.achievementDefs[id]) {
      const def = this.achievementDefs[id];
      if (typeof uiManager.showAchievement === 'function') {
        uiManager.showAchievement(def.title, def.description, def.icon);
      }
    }
    return true;
  }
  
  public hasAchievement(id: string): boolean {
    return !!this.data.achievements[id];
  }
  
  public defineAchievement(def: AchievementDef): void {
    this.achievementDefs[def.id] = def;
  }
}
