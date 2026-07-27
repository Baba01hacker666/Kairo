import { Color } from '@kairo/core';

export const RenderQueue = {
  Opaque: 2000,
  AlphaTest: 2450,
  Transparent: 3000
} as const;

export class Material {
  public id: string;
  public name: string;
  public color: Color = new Color(1, 1, 1, 1);
  public roughness: number = 0.5;
  public metalness: number = 0.1;
  public emissive: Color = new Color(0, 0, 0, 1);
  public wireframe: boolean = false;
  public transparent: boolean = false;
  public opacity: number = 1.0;
  public mapUrl: string | null = null;
  public normalMapUrl: string | null = null;
  public shaderGraphNodes: any[] = [];

  constructor(name: string = 'Standard Material') {
    this.name = name;
    this.id = `mat_${Math.random().toString(36).substring(2, 9)}`;
  }

  clone(): Material {
    const mat = new Material(this.name + ' Copy');
    mat.color = new Color(this.color.r, this.color.g, this.color.b, this.color.a);
    mat.roughness = this.roughness;
    mat.metalness = this.metalness;
    mat.emissive = new Color(this.emissive.r, this.emissive.g, this.emissive.b, this.emissive.a);
    mat.wireframe = this.wireframe;
    mat.transparent = this.transparent;
    mat.opacity = this.opacity;
    mat.mapUrl = this.mapUrl;
    mat.normalMapUrl = this.normalMapUrl;
    return mat;
  }
}
