import { Vector3, Color } from '@kairo/core';

export interface Particle {
  position: Vector3;
  velocity: Vector3;
  color: Color;
  size: number;
  life: number;
  maxLife: number;
}

export class ParticleEmitter {
  public maxParticles: number = 500;
  public spawnRate: number = 50; // particles per sec
  public speed: number = 3.0;
  public startSize: number = 0.2;
  public endSize: number = 0.0;
  public startColor: Color = new Color(1, 0.5, 0.1, 1);
  public endColor: Color = new Color(0.2, 0.0, 0.0, 0);
  public lifetime: number = 1.5;

  public particles: Particle[] = [];
  private accumulator: number = 0;

  update(dt: number, emitterPos: Vector3): void {
    // Spawn new particles
    this.accumulator += dt * this.spawnRate;
    while (this.accumulator >= 1 && this.particles.length < this.maxParticles) {
      this.accumulator -= 1;
      this.particles.push({
        position: emitterPos.clone().add(new Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        )),
        velocity: new Vector3(
          (Math.random() - 0.5) * 0.5,
          Math.random() * this.speed,
          (Math.random() - 0.5) * 0.5
        ),
        color: new Color(this.startColor.r, this.startColor.g, this.startColor.b, this.startColor.a),
        size: this.startSize,
        life: 0,
        maxLife: this.lifetime
      });
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      const t = p.life / p.maxLife;
      p.position.add(p.velocity.clone().scale(dt));
      p.size = this.startSize + (this.endSize - this.startSize) * t;
      p.color.r = this.startColor.r + (this.endColor.r - this.startColor.r) * t;
      p.color.g = this.startColor.g + (this.endColor.g - this.startColor.g) * t;
      p.color.b = this.startColor.b + (this.endColor.b - this.startColor.b) * t;
      p.color.a = this.startColor.a + (this.endColor.a - this.startColor.a) * t;
    }
  }
}
