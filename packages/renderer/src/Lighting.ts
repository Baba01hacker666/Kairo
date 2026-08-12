import { Color, Vector3 } from '../../core/src/Math.ts';

export const LightType = {
  Directional: 'DIRECTIONAL',
  Point: 'POINT',
  Spot: 'SPOT',
  Ambient: 'AMBIENT'
} as const;

export type LightTypeValue = typeof LightType[keyof typeof LightType];

export class Light {
  public type: LightTypeValue = LightType.Directional;
  public color: Color = new Color(1, 1, 1, 1);
  public intensity: number = 1.0;
  public shadowCast: boolean = true;
  public range: number = 10;
  public spotAngle: number = Math.PI / 4;

  constructor(type: LightTypeValue = LightType.Directional) {
    this.type = type;
  }
}

export class SkyboxSettings {
  public color: Color = new Color(0.1, 0.12, 0.18, 1);
  public sunDirection: Vector3 = new Vector3(0.5, 1, 0.5).normalize();
  public fogEnabled: boolean = true;
  public fogColor: Color = new Color(0.1, 0.12, 0.18, 1);
  public fogNear: number = 10;
  public fogFar: number = 100;
}
