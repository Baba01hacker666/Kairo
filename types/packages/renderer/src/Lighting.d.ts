import { Color, Vector3 } from '../../core/src/Math.ts';
export declare const LightType: {
    readonly Directional: "DIRECTIONAL";
    readonly Point: "POINT";
    readonly Spot: "SPOT";
    readonly Ambient: "AMBIENT";
};
export type LightTypeValue = typeof LightType[keyof typeof LightType];
export declare class Light {
    type: LightTypeValue;
    color: Color;
    intensity: number;
    shadowCast: boolean;
    range: number;
    spotAngle: number;
    constructor(type?: LightTypeValue);
}
export declare class SkyboxSettings {
    color: Color;
    sunDirection: Vector3;
    fogEnabled: boolean;
    fogColor: Color;
    fogNear: number;
    fogFar: number;
}
