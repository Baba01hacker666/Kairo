import * as f from "three";
import { ACESFilmicToneMapping as Br, AdditiveBlending as ps, AgXToneMapping as kr, BufferGeometry as Er, CineonToneMapping as zr, Color as le, ColorManagement as Vr, CustomToneMapping as Dr, DepthTexture as Rr, DoubleSide as Pi, Float32BufferAttribute as Bi, HalfFloatType as te, LinearToneMapping as Fr, Matrix4 as Ir, Mesh as Nr, MeshBasicMaterial as Or, MeshDepthMaterial as Lr, MeshNormalMaterial as Ur, NearestFilter as dt, NeutralToneMapping as Wr, NoBlending as zt, OrthographicCamera as Gr, RGBADepthPacking as $r, RawShaderMaterial as Kr, ReinhardToneMapping as Hr, SRGBTransfer as jr, ShaderMaterial as Y, Timer as qr, UniformsUtils as Fe, Vector2 as W, Vector3 as Ce, Vector4 as Xr, WebGLRenderTarget as X } from "three";
import * as q from "cannon-es";
import * as F from "@babylonjs/core";
var pt = class Vt {
  x;
  y;
  constructor(t = 0, i = 0) {
    this.x = t, this.y = i;
  }
  set(t, i) {
    return this.x = t, this.y = i, this;
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this;
  }
  clone() {
    return new Vt(this.x, this.y);
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this;
  }
  scale(t) {
    return this.x *= t, this.y *= t, this;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.lengthSq());
  }
  normalize() {
    const t = this.length();
    return t > 0 && this.scale(1 / t), this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y;
  }
  distanceTo(t) {
    const i = this.x - t.x, s = this.y - t.y;
    return Math.sqrt(i * i + s * s);
  }
  static zero() {
    return new Vt(0, 0);
  }
}, k = class Ye {
  x;
  y;
  z;
  constructor(t = 0, i = 0, s = 0) {
    this.x = t, this.y = i, this.z = s;
  }
  set(t, i, s) {
    return this.x = t, this.y = i, this.z = s, this;
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this.z = t.z, this;
  }
  clone() {
    return new Ye(this.x, this.y, this.z);
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this.z += t.z, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this.z -= t.z, this;
  }
  scale(t) {
    return this.x *= t, this.y *= t, this.z *= t, this;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.lengthSq());
  }
  normalize() {
    const t = this.length();
    return t > 0 && this.scale(1 / t), this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z;
  }
  cross(t) {
    const i = this.y * t.z - this.z * t.y, s = this.z * t.x - this.x * t.z, r = this.x * t.y - this.y * t.x;
    return new Ye(i, s, r);
  }
  distanceTo(t) {
    const i = this.x - t.x, s = this.y - t.y, r = this.z - t.z;
    return Math.sqrt(i * i + s * s + r * r);
  }
  lerp(t, i) {
    return this.x += (t.x - this.x) * i, this.y += (t.y - this.y) * i, this.z += (t.z - this.z) * i, this;
  }
  static zero() {
    return new Ye(0, 0, 0);
  }
  static one() {
    return new Ye(1, 1, 1);
  }
}, ic = class {
  x;
  y;
  z;
  w;
  constructor(e = 0, t = 0, i = 0, s = 1) {
    this.x = e, this.y = t, this.z = i, this.w = s;
  }
}, st = class Dt {
  x;
  y;
  z;
  w;
  constructor(t = 0, i = 0, s = 0, r = 1) {
    this.x = t, this.y = i, this.z = s, this.w = r;
  }
  set(t, i, s, r) {
    return this.x = t, this.y = i, this.z = s, this.w = r, this;
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this.z = t.z, this.w = t.w, this;
  }
  clone() {
    return new Dt(this.x, this.y, this.z, this.w);
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  setFromEuler(t, i, s) {
    const r = Math.cos(t / 2), n = Math.cos(i / 2), a = Math.cos(s / 2), o = Math.sin(t / 2), l = Math.sin(i / 2), c = Math.sin(s / 2);
    return this.x = o * n * a + r * l * c, this.y = r * l * a - o * n * c, this.z = r * n * c + o * l * a, this.w = r * n * a - o * l * c, this;
  }
  slerp(t, i) {
    let s = t, r = this.w * t.w + this.x * t.x + this.y * t.y + this.z * t.z;
    if (r < 0 && (s = new Dt(-t.x, -t.y, -t.z, -t.w), r = -r), r >= 1) return this;
    const n = Math.acos(r), a = Math.sqrt(1 - r * r);
    if (Math.abs(a) < 1e-3)
      return this.w = this.w * 0.5 + s.w * 0.5, this.x = this.x * 0.5 + s.x * 0.5, this.y = this.y * 0.5 + s.y * 0.5, this.z = this.z * 0.5 + s.z * 0.5, this;
    const o = Math.sin((1 - i) * n) / a, l = Math.sin(i * n) / a;
    return this.w = this.w * o + s.w * l, this.x = this.x * o + s.x * l, this.y = this.y * o + s.y * l, this.z = this.z * o + s.z * l, this;
  }
}, ki = class fs {
  elements = new Float32Array([
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1
  ]);
  identity() {
    const t = this.elements;
    return t[0] = 1, t[4] = 0, t[8] = 0, t[12] = 0, t[1] = 0, t[5] = 1, t[9] = 0, t[13] = 0, t[2] = 0, t[6] = 0, t[10] = 1, t[14] = 0, t[3] = 0, t[7] = 0, t[11] = 0, t[15] = 1, this;
  }
  copy(t) {
    return this.elements.set(t.elements), this;
  }
  clone() {
    const t = new fs();
    return t.copy(this), t;
  }
  compose(t, i, s) {
    const r = i.x, n = i.y, a = i.z, o = i.w, l = r + r, c = n + n, h = a + a, u = r * l, d = r * c, g = r * h, p = n * c, y = n * h, m = a * h, x = o * l, A = o * c, v = o * h, b = s.x, S = s.y, C = s.z, w = this.elements;
    return w[0] = (1 - (p + m)) * b, w[1] = (d + v) * b, w[2] = (g - A) * b, w[3] = 0, w[4] = (d - v) * S, w[5] = (1 - (u + m)) * S, w[6] = (y + x) * S, w[7] = 0, w[8] = (g + A) * C, w[9] = (y - x) * C, w[10] = (1 - (u + p)) * C, w[11] = 0, w[12] = t.x, w[13] = t.y, w[14] = t.z, w[15] = 1, this;
  }
  multiplyMatrices(t, i) {
    const s = t.elements, r = i.elements, n = this.elements, a = s[0], o = s[4], l = s[8], c = s[12], h = s[1], u = s[5], d = s[9], g = s[13], p = s[2], y = s[6], m = s[10], x = s[14], A = s[3], v = s[7], b = s[11], S = s[15], C = r[0], w = r[4], _ = r[8], M = r[12], B = r[1], T = r[5], z = r[9], E = r[13], V = r[2], D = r[6], O = r[10], L = r[14], N = r[3], ie = r[7], J = r[11], j = r[15];
    return n[0] = a * C + o * B + l * V + c * N, n[4] = a * w + o * T + l * D + c * ie, n[8] = a * _ + o * z + l * O + c * J, n[12] = a * M + o * E + l * L + c * j, n[1] = h * C + u * B + d * V + g * N, n[5] = h * w + u * T + d * D + g * ie, n[9] = h * _ + u * z + d * O + g * J, n[13] = h * M + u * E + d * L + g * j, n[2] = p * C + y * B + m * V + x * N, n[6] = p * w + y * T + m * D + x * ie, n[10] = p * _ + y * z + m * O + x * J, n[14] = p * M + y * E + m * L + x * j, n[3] = A * C + v * B + b * V + S * N, n[7] = A * w + v * T + b * D + S * ie, n[11] = A * _ + v * z + b * O + S * J, n[15] = A * M + v * E + b * L + S * j, this;
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
}, R = class {
  r;
  g;
  b;
  a;
  constructor(e = 1, t = 1, i = 1, s = 1) {
    this.r = e, this.g = t, this.b = i, this.a = s;
  }
  setHex(e) {
    return e = e.replace("#", ""), e.length === 6 && (this.r = parseInt(e.substring(0, 2), 16) / 255, this.g = parseInt(e.substring(2, 4), 16) / 255, this.b = parseInt(e.substring(4, 6), 16) / 255, this.a = 1), this;
  }
  toHex() {
    return `#${Math.round(this.r * 255).toString(16).padStart(2, "0")}${Math.round(this.g * 255).toString(16).padStart(2, "0")}${Math.round(this.b * 255).toString(16).padStart(2, "0")}`;
  }
}, Ei = class Ze {
  origin;
  direction;
  static _missResult = (() => {
    const t = Object.freeze(new k()), i = Object.freeze(new k());
    return Object.freeze({
      hasHit: !1,
      distance: 1 / 0,
      point: t,
      normal: i
    });
  })();
  constructor(t = new k(), i = new k(0, 0, -1)) {
    this.origin = t instanceof k ? t : new k(t.x, t.y, t.z), this.direction = i instanceof k ? i : new k(i.x, i.y, i.z);
  }
  intersectBox(t) {
    const i = Math.abs(this.direction.x) < 1e-5 ? 1e-5 : this.direction.x, s = Math.abs(this.direction.y) < 1e-5 ? 1e-5 : this.direction.y, r = Math.abs(this.direction.z) < 1e-5 ? 1e-5 : this.direction.z;
    let n = (t.min.x - this.origin.x) / i, a = (t.max.x - this.origin.x) / i;
    n > a && ([n, a] = [a, n]);
    let o = (t.min.y - this.origin.y) / s, l = (t.max.y - this.origin.y) / s;
    if (o > l && ([o, l] = [l, o]), n > l || o > a) return Ze._missResult;
    o > n && (n = o), l < a && (a = l);
    let c = (t.min.z - this.origin.z) / r, h = (t.max.z - this.origin.z) / r;
    if (c > h && ([c, h] = [h, c]), n > h || c > a) return Ze._missResult;
    c > n && (n = c);
    const u = new k(this.origin.x + this.direction.x * n, this.origin.y + this.direction.y * n, this.origin.z + this.direction.z * n), d = new k(), g = 0.01;
    return Math.abs(u.x - t.max.x) < g ? d.x = 1 : Math.abs(u.x - t.min.x) < g ? d.x = -1 : Math.abs(u.y - t.max.y) < g ? d.y = 1 : Math.abs(u.y - t.min.y) < g ? d.y = -1 : Math.abs(u.z - t.max.z) < g ? d.z = 1 : Math.abs(u.z - t.min.z) < g ? d.z = -1 : d.z = 1, {
      hasHit: n >= 0,
      distance: n,
      point: u,
      normal: d
    };
  }
  intersectSphere(t, i) {
    const s = t.x - this.origin.x, r = t.y - this.origin.y, n = t.z - this.origin.z, a = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y + this.direction.z * this.direction.z), o = a > 0 ? this.direction.x / a : 0, l = a > 0 ? this.direction.y / a : 0, c = a > 0 ? this.direction.z / a : -1, h = s * o + r * l + n * c, u = s * s + r * r + n * n - h * h, d = i * i;
    if (u > d) return Ze._missResult;
    const g = Math.sqrt(d - u);
    let p = h - g, y = h + g;
    if (p < 0 && (p = y), p < 0) return Ze._missResult;
    const m = new k(this.origin.x + o * p, this.origin.y + l * p, this.origin.z + c * p), x = new k((m.x - t.x) / i, (m.y - t.y) / i, (m.z - t.z) / i);
    return {
      hasHit: !0,
      distance: p,
      point: m,
      normal: x
    };
  }
}, ms = class {
  min;
  max;
  constructor(e = new k(-1, -1, -1), t = new k(1, 1, 1)) {
    this.min = e, this.max = t;
  }
  intersectsBox(e) {
    return this.max.x >= e.min.x && this.min.x <= e.max.x && this.max.y >= e.min.y && this.min.y <= e.max.y && this.max.z >= e.min.z && this.min.z <= e.max.z;
  }
}, xe = class {
  static clamp(e, t, i) {
    return Math.max(t, Math.min(i, e));
  }
  static lerp(e, t, i) {
    return e + (t - e) * i;
  }
  static degToRad(e) {
    return e * (Math.PI / 180);
  }
  static radToDeg(e) {
    return e * (180 / Math.PI);
  }
}, ti = class {
  events = /* @__PURE__ */ new Map();
  on(e, t) {
    return this.events.has(e) || this.events.set(e, /* @__PURE__ */ new Set()), this.events.get(e).add(t), () => this.off(e, t);
  }
  once(e, t) {
    const i = (s) => {
      t(s), this.off(e, i);
    };
    this.on(e, i);
  }
  off(e, t) {
    const i = this.events.get(e);
    i && i.delete(t);
  }
  emit(e, t) {
    const i = this.events.get(e);
    i && i.forEach((s) => s(t));
  }
  clear() {
    this.events.clear();
  }
}, sc = new ti(), Te = class {
  static deltaTime = 0.016;
  static fixedDeltaTime = 0.0166;
  static elapsedTime = 0;
  static timeScale = 1;
  static fps = 60;
  static frameCount = 0;
  static lastTime = 0;
  static frameTimeAccumulator = 0;
  static framesThisSecond = 0;
  static update(e) {
    if (this.lastTime === 0) {
      this.lastTime = e;
      return;
    }
    const t = (e - this.lastTime) / 1e3;
    this.lastTime = e, this.deltaTime = Math.min(t, 0.1) * this.timeScale, this.elapsedTime += this.deltaTime, this.frameCount++, this.frameTimeAccumulator += t, this.framesThisSecond++, this.frameTimeAccumulator >= 1 && (this.fps = this.framesThisSecond, this.framesThisSecond = 0, this.frameTimeAccumulator -= 1);
  }
}, Ie = class {
  static VERSION = 1;
  static serialize(e, t = !1) {
    return JSON.stringify(e, (i, s) => s instanceof Set ? {
      __type: "Set",
      values: Array.from(s)
    } : s instanceof Map ? {
      __type: "Map",
      entries: Array.from(s.entries())
    } : s, t ? 2 : void 0);
  }
  static deserialize(e) {
    return JSON.parse(e, (t, i) => {
      if (i && typeof i == "object") {
        if (i.__type === "Set" && Array.isArray(i.values)) return new Set(i.values);
        if (i.__type === "Map" && Array.isArray(i.entries)) return new Map(i.entries);
      }
      return i;
    });
  }
  static createSaveEnvelope(e) {
    const t = this.serialize(e), i = this.hashString(t);
    return {
      version: this.VERSION,
      timestamp: Date.now(),
      checksum: i,
      payload: e
    };
  }
  static verifyAndUnwrapSave(e) {
    if (!e || typeof e != "object") return {
      valid: !1,
      error: "Invalid save data format"
    };
    const t = this.serialize(e.payload);
    return this.hashString(t) !== e.checksum ? {
      valid: !1,
      error: "Save data checksum mismatch - corrupted save"
    } : {
      valid: !0,
      payload: e.payload
    };
  }
  static compressToBase64(e) {
    return typeof btoa < "u" ? btoa(encodeURIComponent(e)) : globalThis.Buffer ? globalThis.Buffer.from(e, "utf-8").toString("base64") : e;
  }
  static decompressFromBase64(e) {
    return typeof atob < "u" ? decodeURIComponent(atob(e)) : globalThis.Buffer ? globalThis.Buffer.from(e, "base64").toString("utf-8") : e;
  }
  static cloneDeep(e) {
    return this.deserialize(this.serialize(e));
  }
  static hashString(e) {
    let t = 0;
    for (let i = 0; i < e.length; i++) {
      const s = e.charCodeAt(i);
      t = (t << 5) - t + s, t |= 0;
    }
    return t;
  }
  static encryptPayload(e, t = "KairoSecureKey_2026") {
    if (!e) return "";
    let i = "";
    for (let s = 0; s < e.length; s++) {
      const r = e.charCodeAt(s), n = t.charCodeAt(s % t.length), a = String.fromCharCode(r ^ n);
      i += a;
    }
    return this.compressToBase64(i);
  }
  static decryptPayload(e, t = "KairoSecureKey_2026") {
    if (!e) return "";
    const i = this.decompressFromBase64(e);
    let s = "";
    for (let r = 0; r < i.length; r++) {
      const n = i.charCodeAt(r), a = t.charCodeAt(r % t.length), o = String.fromCharCode(n ^ a);
      s += o;
    }
    return s;
  }
  static compressRLE(e) {
    if (!e) return "";
    let t = "", i = 1;
    for (let s = 0; s < e.length; s++) e[s] === e[s + 1] ? i++ : (t += (i > 1 ? i : "") + e[s], i = 1);
    return t;
  }
}, zi = class Rt {
  id;
  name;
  parent = null;
  children = [];
  position = new k(0, 0, 0);
  rotation = new st(0, 0, 0, 1);
  scale = new k(1, 1, 1);
  localMatrix = new ki();
  worldMatrix = new ki();
  components = /* @__PURE__ */ new Map();
  constructor(t = "Node", i) {
    this.name = t, this.id = i || `node_${Math.random().toString(36).substring(2, 9)}`;
  }
  addChild(t) {
    return t.parent && t.parent.removeChild(t), t.parent = this, this.children.push(t), this;
  }
  removeChild(t) {
    const i = this.children.indexOf(t);
    return i !== -1 && (t.parent = null, this.children.splice(i, 1)), this;
  }
  addComponent(t, i) {
    return this.components.set(t, i), this;
  }
  getComponent(t) {
    return this.components.get(t);
  }
  updateMatrix() {
    this.localMatrix.compose(this.position, this.rotation, this.scale), this.parent ? this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, this.localMatrix) : this.worldMatrix.copy(this.localMatrix);
    for (const t of this.children) t.updateMatrix();
  }
  serialize() {
    return {
      id: this.id,
      name: this.name,
      position: [
        this.position.x,
        this.position.y,
        this.position.z
      ],
      rotation: [
        this.rotation.x,
        this.rotation.y,
        this.rotation.z,
        this.rotation.w
      ],
      scale: [
        this.scale.x,
        this.scale.y,
        this.scale.z
      ],
      components: Object.fromEntries(this.components.entries()),
      children: this.children.map((t) => t.serialize())
    };
  }
  static deserialize(t) {
    const i = new Rt(t.name, t.id);
    i.position.set(...t.position), i.rotation.set(...t.rotation), i.scale.set(...t.scale);
    for (const [s, r] of Object.entries(t.components || {})) i.addComponent(s, r);
    for (const s of t.children || []) i.addChild(Rt.deserialize(s));
    return i;
  }
}, Yr = class gs {
  root = new zi("Scene Root");
  events = new ti();
  name;
  constructor(t = "Default Scene") {
    this.name = t;
  }
  add(t) {
    this.root.addChild(t), this.events.emit("nodeAdded", t);
  }
  remove(t) {
    this.root.removeChild(t), this.events.emit("nodeRemoved", t);
  }
  findByName(t) {
    const i = (s) => {
      if (s.name === t) return s;
      for (const r of s.children) {
        const n = i(r);
        if (n) return n;
      }
      return null;
    };
    return i(this.root);
  }
  serialize() {
    return Ie.serialize({
      name: this.name,
      root: this.root.serialize()
    }, !0);
  }
  static deserialize(t) {
    const i = Ie.deserialize(t), s = new gs(i.name);
    return s.root = zi.deserialize(i.root), s;
  }
}, ve = {
  Stopped: "STOPPED",
  Running: "RUNNING",
  Paused: "PAUSED"
}, Zr = class {
  state = ve.Stopped;
  activeScene;
  events = new ti();
  animationFrameId = null;
  fixedUpdateAccumulator = 0;
  constructor() {
    this.activeScene = new Yr("Main Scene");
  }
  start() {
    this.state !== ve.Running && (this.state = ve.Running, this.events.emit("started"), this.loop(performance.now()));
  }
  pause() {
    this.state = ve.Paused, this.events.emit("paused");
  }
  resume() {
    this.state === ve.Paused && (this.state = ve.Running, this.events.emit("resumed"), this.loop(performance.now()));
  }
  stop() {
    this.state = ve.Stopped, this.animationFrameId !== null && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.events.emit("stopped");
  }
  loop = (e) => {
    if (this.state !== ve.Running) return;
    Te.update(e), this.fixedUpdateAccumulator += Math.min(Te.deltaTime, 0.1);
    const t = Te.fixedDeltaTime * 5;
    for (this.fixedUpdateAccumulator > t && (this.fixedUpdateAccumulator = t); this.fixedUpdateAccumulator >= Te.fixedDeltaTime; )
      this.fixedUpdate(Te.fixedDeltaTime), this.fixedUpdateAccumulator -= Te.fixedDeltaTime;
    this.update(Te.deltaTime), this.render(), typeof requestAnimationFrame < "u" && (this.animationFrameId = requestAnimationFrame(this.loop));
  };
  fixedUpdate(e) {
    this.events.emit("fixedUpdate", e);
  }
  update(e) {
    this.activeScene.root.updateMatrix(), this.events.emit("update", e);
  }
  render() {
    this.events.emit("render");
  }
}, rc = class {
  freeList = [];
  factory;
  resetFn;
  constructor(e, t, i = 32) {
    this.factory = e, this.resetFn = t;
    for (let s = 0; s < i; s++) this.freeList.push(this.factory());
  }
  get() {
    return this.freeList.length > 0 ? this.freeList.pop() : this.factory();
  }
  release(e) {
    this.resetFn && this.resetFn(e), this.freeList.push(e);
  }
  get poolSize() {
    return this.freeList.length;
  }
}, Qr = class {
  id;
  properties;
  _entityIds = /* @__PURE__ */ new Set();
  _cachedPropertyKeys;
  constructor(e, t) {
    this.id = e, this.properties = Object.freeze({ ...t }), this._cachedPropertyKeys = Object.keys(this.properties);
  }
  get entityCount() {
    return this._entityIds.size;
  }
  get entityIds() {
    return this._entityIds;
  }
  get(e) {
    return this.properties[e];
  }
  has(e) {
    return e in this.properties;
  }
  registerEntity(e) {
    this._entityIds.add(e);
  }
  unregisterEntity(e) {
    this._entityIds.delete(e);
  }
  hasEntity(e) {
    return this._entityIds.has(e);
  }
}, Jr = class {
  contexts = /* @__PURE__ */ new Map();
  entityToContextMap = /* @__PURE__ */ new Map();
  registerContext(e, t) {
    if (this.contexts.has(e)) return this.contexts.get(e);
    const i = new Qr(e, t);
    return this.contexts.set(e, i), i;
  }
  getContext(e) {
    return this.contexts.get(e);
  }
  attachEntityToContext(e, t) {
    const i = this.contexts.get(t);
    if (!i) throw new Error(`[SharedEntityContextManager] Context '${t}' not found.`);
    const s = this.entityToContextMap.get(e);
    s && s !== t && this.contexts.get(s)?.unregisterEntity(e), i.registerEntity(e), this.entityToContextMap.set(e, t);
  }
  detachEntity(e) {
    const t = this.entityToContextMap.get(e);
    t && (this.contexts.get(t)?.unregisterEntity(e), this.entityToContextMap.delete(e));
  }
  getEntityContextId(e) {
    return this.entityToContextMap.get(e);
  }
  getEntityContext(e) {
    const t = this.entityToContextMap.get(e);
    return t ? this.contexts.get(t) : void 0;
  }
  forEachInContext(e, t) {
    const i = this.getContext(e);
    if (!i) return;
    const s = i.properties;
    i.entityIds.forEach((r) => {
      t(r, s);
    });
  }
  getStats() {
    let e = 0, t = 0;
    this.contexts.forEach((s) => {
      const r = s.entityCount;
      e += r, t += Object.keys(s.properties).length;
    });
    const i = Math.max(0, (e - this.contexts.size) * t * 64);
    return {
      totalRegisteredContexts: this.contexts.size,
      totalEntitiesSharing: e,
      estimatedMemorySavedBytes: i
    };
  }
  clear() {
    this.contexts.clear(), this.entityToContextMap.clear();
  }
}, nc = /* @__PURE__ */ (function(e) {
  return e.PreUpdate = "PreUpdate", e.Update = "Update", e.PostUpdate = "PostUpdate", e.FixedUpdate = "FixedUpdate", e;
})({}), ac = class {
  enabled = !0;
  priority = 0;
  stage = "Update";
}, oc = class {
  all;
  any;
  none;
  _key;
  constructor(e = [], t = [], i = []) {
    this.all = e, this.any = t, this.none = i;
  }
  matches(e, t) {
    return !this.all.every((i) => e.hasComponent(t, i)) || !(this.any.length === 0 || this.any.some((i) => e.hasComponent(t, i))) ? !1 : !this.none.some((i) => e.hasComponent(t, i));
  }
}, en = class {
  nextEntityId = 1;
  activeEntities = /* @__PURE__ */ new Set();
  entityNames = /* @__PURE__ */ new Map();
  components = /* @__PURE__ */ new Map();
  disabledComponents = /* @__PURE__ */ new Map();
  tags = /* @__PURE__ */ new Map();
  parents = /* @__PURE__ */ new Map();
  children = /* @__PURE__ */ new Map();
  systems = [];
  componentIdMap = /* @__PURE__ */ new WeakMap();
  nextComponentTypeId = 1;
  queryCache = /* @__PURE__ */ new Map();
  getComponentTypeId(e) {
    let t = this.componentIdMap.get(e);
    return t === void 0 && (t = this.nextComponentTypeId++, this.componentIdMap.set(e, t)), t;
  }
  buildQueryKeyPart(e) {
    if (!e || e.length === 0) return "";
    if (e.length === 1) return this.getComponentTypeId(e[0]).toString();
    if (e.length === 2) {
      const i = this.getComponentTypeId(e[0]), s = this.getComponentTypeId(e[1]);
      return i < s ? `${i},${s}` : `${s},${i}`;
    }
    const t = [];
    for (let i = 0; i < e.length; i++) t.push(this.getComponentTypeId(e[i]));
    return t.sort((i, s) => i - s), t.join(",");
  }
  getQueryCacheKey(e) {
    if (e._key !== void 0) return e._key;
    const t = `${this.buildQueryKeyPart(e.all)}|${this.buildQueryKeyPart(e.any)}|${this.buildQueryKeyPart(e.none)}`;
    return e._key = t, t;
  }
  invalidateQueryCache() {
    this.queryCache.size > 0 && this.queryCache.clear();
  }
  sharedContexts = new Jr();
  createEntity(e) {
    this.invalidateQueryCache();
    const t = this.nextEntityId++;
    return this.activeEntities.add(t), this.tags.set(t, /* @__PURE__ */ new Set()), this.children.set(t, /* @__PURE__ */ new Set()), e && (this.entityNames.set(t, e), this.addTag(t, e)), t;
  }
  createSharedContext(e, t) {
    return this.sharedContexts.registerContext(e, t);
  }
  createEntityWithSharedContext(e, t) {
    const i = this.createEntity(t);
    return this.sharedContexts.attachEntityToContext(i, e), i;
  }
  getEntityName(e) {
    return this.entityNames.get(e);
  }
  setEntityName(e, t) {
    this.entityNames.set(e, t);
  }
  destroyEntity(e) {
    if (!this.activeEntities.has(e)) return;
    const t = this.children.get(e);
    if (t) for (const s of Array.from(t)) this.destroyEntity(s);
    const i = this.parents.get(e);
    i !== void 0 && (this.children.get(i)?.delete(e), this.parents.delete(e));
    for (const [s, r] of this.components.entries()) if (r.has(e)) {
      const n = r.get(e);
      n && typeof n.onRemove == "function" && n.onRemove(e, n, this), r.delete(e);
    }
    for (const s of this.disabledComponents.values()) s.delete(e);
    this.tags.delete(e), this.children.delete(e), this.entityNames.delete(e), this.sharedContexts.detachEntity(e), this.activeEntities.delete(e), this.invalidateQueryCache();
  }
  setParent(e, t) {
    if (t !== null && (t === e || this.isDescendant(t, e))) return;
    const i = this.parents.get(e);
    i !== void 0 && this.children.get(i)?.delete(e), t !== null && this.activeEntities.has(t) ? (this.parents.set(e, t), this.children.get(t)?.add(e)) : this.parents.delete(e);
  }
  isDescendant(e, t) {
    let i = this.parents.get(e);
    for (; i !== void 0; ) {
      if (i === t) return !0;
      i = this.parents.get(i);
    }
    return !1;
  }
  getParent(e) {
    return this.parents.get(e);
  }
  getChildren(e) {
    const t = this.children.get(e);
    return t ? Array.from(t) : [];
  }
  addComponent(e, t) {
    this.invalidateQueryCache();
    const i = t.constructor;
    return this.disabledComponents.get(i)?.delete(e), this.components.has(i) || this.components.set(i, /* @__PURE__ */ new Map()), this.components.get(i).set(e, t), t && typeof t.onAdd == "function" && t.onAdd(e, t, this), t;
  }
  removeComponent(e, t) {
    this.invalidateQueryCache();
    const i = this.components.get(t);
    if (i && i.has(e)) {
      const s = i.get(e);
      s && typeof s.onRemove == "function" && s.onRemove(e, s, this), i.delete(e);
    }
  }
  disableComponent(e, t) {
    this.invalidateQueryCache();
    const i = this.components.get(t);
    if (i && i.has(e)) {
      const s = i.get(e);
      i.delete(e), this.disabledComponents.has(t) || this.disabledComponents.set(t, /* @__PURE__ */ new Map()), this.disabledComponents.get(t).set(e, s), s && typeof s.onDisable == "function" && s.onDisable(e, s, this);
    }
  }
  enableComponent(e, t) {
    this.invalidateQueryCache();
    const i = this.disabledComponents.get(t);
    if (i && i.has(e)) {
      const s = i.get(e);
      i.delete(e), this.components.has(t) || this.components.set(t, /* @__PURE__ */ new Map()), this.components.get(t).set(e, s), s && typeof s.onEnable == "function" && s.onEnable(e, s, this);
    }
  }
  getComponent(e, t) {
    const i = this.components.get(t);
    return i ? i.get(e) : void 0;
  }
  hasComponent(e, t) {
    const i = this.components.get(t);
    return i ? i.has(e) : !1;
  }
  getAllComponents(e) {
    const t = [];
    for (const i of this.components.values()) i.has(e) && t.push(i.get(e));
    return t;
  }
  addTag(e, t) {
    const i = this.tags.get(e);
    i && i.add(t);
  }
  hasTag(e, t) {
    const i = this.tags.get(e);
    return i ? i.has(t) : !1;
  }
  removeTag(e, t) {
    this.tags.get(e)?.delete(t);
  }
  query(e) {
    const t = this.getQueryCacheKey(e), i = this.queryCache.get(t);
    if (i) return i.slice();
    let s;
    if (e.all.length > 0) {
      let n = 1 / 0, a;
      for (const o of e.all) {
        const l = this.components.get(o);
        if (!l || l.size === 0)
          return this.queryCache.set(t, []), [];
        l.size < n && (n = l.size, a = l);
      }
      s = a.keys();
    } else s = this.activeEntities;
    const r = [];
    for (const n of s) e.matches(this, n) && r.push(n);
    return this.queryCache.set(t, r), r.slice();
  }
  each2(e, t, i) {
    const s = this.components.get(e), r = this.components.get(t);
    if (!s || !r) return;
    const [n, a, o] = s.size <= r.size ? [
      s,
      r,
      !0
    ] : [
      r,
      s,
      !1
    ];
    for (const [l, c] of n) {
      const h = a.get(l);
      h !== void 0 && (o ? i(l, c, h) : i(l, h, c));
    }
  }
  addSystem(e) {
    return this.systems.push(e), this.systems.sort((t, i) => t.priority - i.priority), this;
  }
  removeSystem(e) {
    const t = this.systems.indexOf(e);
    t !== -1 && this.systems.splice(t, 1);
  }
  update(e, t = "Update") {
    for (const i of this.systems) i.enabled && i.stage === t && i.update(this, e);
  }
  updateAll(e) {
    this.update(e, "PreUpdate"), this.update(e, "Update"), this.update(e, "PostUpdate");
  }
  updateFixed(e) {
    this.update(e, "FixedUpdate");
  }
  get entityCount() {
    return this.activeEntities.size;
  }
  clear() {
    for (const e of Array.from(this.activeEntities)) this.destroyEntity(e);
    this.nextEntityId = 1;
  }
  serialize() {
    const e = {};
    for (const t of this.activeEntities) {
      const i = this.getAllComponents(t);
      e[t] = {
        name: this.entityNames.get(t),
        tags: Array.from(this.tags.get(t) || []),
        components: i.map((s) => ({
          type: s.constructor.name,
          data: s
        }))
      };
    }
    return {
      nextEntityId: this.nextEntityId,
      entities: e,
      parents: Array.from(this.parents.entries())
    };
  }
  deserialize(e, t) {
    this.clear(), this.nextEntityId = e.nextEntityId || 1;
    for (const [i, s] of Object.entries(e.entities)) {
      const r = parseInt(i, 10);
      this.activeEntities.add(r), this.tags.set(r, new Set(s.tags)), s.name && this.entityNames.set(r, s.name), this.children.set(r, /* @__PURE__ */ new Set());
      for (const n of s.components) {
        const a = t[n.type];
        if (a) {
          const o = new a();
          Object.assign(o, n.data), this.addComponent(r, o);
        } else console.warn(`[ECS] Deserialization missing component constructor: ${n.type}`);
      }
    }
    for (const [i, s] of e.parents || []) this.setParent(i, s);
  }
}, tn = new Int8Array([
  0,
  -1,
  0,
  1,
  -1,
  0,
  1,
  -1,
  0,
  1,
  -1,
  0,
  1,
  1
]), sn = new Int8Array([
  0,
  -1,
  -1,
  -1,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  0
]), rn = new Int8Array([
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0
]), lc = class $ {
  static wasmExports = null;
  static isWasmLoaded = !1;
  isWasmMode = !1;
  maxEntities;
  activeCount = 0;
  posX;
  posY;
  posZ;
  velX;
  velY;
  velZ;
  radius;
  active;
  gridCellSize;
  invCellSize;
  gridHead;
  gridNext;
  gridTag;
  gridTableSize;
  gridTableMask;
  frameId = 1;
  static async loadWasm(t) {
    if ($.isWasmLoaded) return !0;
    try {
      const s = "/".endsWith("/") ? "/" : "//", r = [];
      t && r.push(t), r.push(`${s}wasm/kairo_soa_physics.wasm`, "../../wasm/kairo_soa_physics.wasm", "../wasm/kairo_soa_physics.wasm", "./wasm/kairo_soa_physics.wasm", "/wasm/kairo_soa_physics.wasm", "wasm/kairo_soa_physics.wasm");
      for (const n of r) try {
        const a = await fetch(n);
        if (a.ok) {
          const o = await a.arrayBuffer(), l = await WebAssembly.instantiate(o, {});
          return $.wasmExports = l.instance.exports, $.isWasmLoaded = !0, console.log(`⚡ [FastSoAWorld] WASM Physics Kernel loaded successfully from ${n}`), !0;
        }
      } catch {
      }
    } catch (i) {
      console.warn("[FastSoAWorld] WASM load fallback to optimized JS engine:", i);
    }
    return !1;
  }
  static initSyncWasm(t) {
    try {
      const i = t instanceof Uint8Array ? t : new Uint8Array(t), s = new WebAssembly.Module(i), r = new WebAssembly.Instance(s, {});
      return $.wasmExports = r.exports, $.isWasmLoaded = !0, !0;
    } catch (i) {
      return console.warn("[FastSoAWorld] WASM sync init failed:", i), !1;
    }
  }
  constructor(t = 5e4, i = 12) {
    if (this.maxEntities = t, this.gridCellSize = i, this.invCellSize = 1 / i, $.wasmExports) {
      const s = $.wasmExports, r = s.memory.buffer;
      s.set_cell_size(i), this.posX = new Float32Array(r, s.get_pos_x(), t), this.posY = new Float32Array(r, s.get_pos_y(), t), this.posZ = new Float32Array(r, s.get_pos_z(), t), this.velX = new Float32Array(r, s.get_vel_x(), t), this.velY = new Float32Array(r, s.get_vel_y(), t), this.velZ = new Float32Array(r, s.get_vel_z(), t), this.radius = new Float32Array(r, s.get_radius(), t), this.active = new Uint8Array(r, s.get_active(), t), this.isWasmMode = !0, this.gridTableSize = 0, this.gridTableMask = 0, this.gridHead = /* @__PURE__ */ new Int32Array(0), this.gridTag = /* @__PURE__ */ new Uint32Array(0), this.gridNext = /* @__PURE__ */ new Int32Array(0);
    } else
      this.posX = new Float32Array(t), this.posY = new Float32Array(t), this.posZ = new Float32Array(t), this.velX = new Float32Array(t), this.velY = new Float32Array(t), this.velZ = new Float32Array(t), this.radius = new Float32Array(t), this.active = new Uint8Array(t), this.gridTableSize = 131072, this.gridTableMask = this.gridTableSize - 1, this.gridHead = new Int32Array(this.gridTableSize), this.gridTag = new Uint32Array(this.gridTableSize), this.gridNext = new Int32Array(t);
  }
  spawnEntity(t, i, s, r, n, a, o = 0.5) {
    if (this.activeCount >= this.maxEntities) return -1;
    const l = this.activeCount++;
    return this.posX[l] = t, this.posY[l] = i, this.posZ[l] = s, this.velX[l] = r, this.velY[l] = n, this.velZ[l] = a, this.radius[l] = o, this.active[l] = 1, this.isWasmMode && $.wasmExports && $.wasmExports.spawn_entity(l, t, i, s, r, n, a, o), l;
  }
  update(t, i = 60) {
    const s = this.activeCount;
    if (this.isWasmMode && $.wasmExports) return $.wasmExports.update(s, t, i);
    const r = this.posX, n = this.posY, a = this.posZ, o = this.velX, l = this.velY, c = this.velZ, h = this.radius, u = this.active, d = ++this.frameId;
    d === 4294967295 && (this.gridTag.fill(0), this.frameId = 1);
    const g = this.invCellSize, p = this.gridTableMask, y = this.gridHead, m = this.gridTag, x = this.gridNext;
    for (let v = 0; v < s; v++) {
      if (u[v] === 0) continue;
      let b = r[v] + o[v] * t, S = n[v] + l[v] * t, C = a[v] + c[v] * t;
      b < -i ? (b = -i, o[v] = -o[v]) : b > i && (b = i, o[v] = -o[v]), S < -i ? (S = -i, l[v] = -l[v]) : S > i && (S = i, l[v] = -l[v]), C < -i ? (C = -i, c[v] = -c[v]) : C > i && (C = i, c[v] = -c[v]), r[v] = b, n[v] = S, a[v] = C;
      const w = b * g | 0, _ = S * g | 0, M = C * g | 0, B = (w * 73856093 ^ _ * 19349663 ^ M * 83492791) & p;
      m[B] !== d && (m[B] = d, y[B] = -1), x[v] = y[B], y[B] = v;
    }
    let A = 0;
    for (let v = 0; v < s; v++) {
      if (u[v] === 0) continue;
      const b = r[v], S = n[v], C = a[v], w = h[v], _ = b * g | 0, M = S * g | 0, B = C * g | 0;
      for (let T = 0; T < 14; T++) {
        const z = ((_ + tn[T]) * 73856093 ^ (M + sn[T]) * 19349663 ^ (B + rn[T]) * 83492791) & p;
        if (m[z] !== d) continue;
        let E = y[z];
        const V = T === 0;
        for (; E !== -1; ) {
          if ((!V || E > v) && u[E] !== 0) {
            const D = w + h[E], O = r[E] - b;
            if (O >= D || O <= -D) {
              E = x[E];
              continue;
            }
            const L = n[E] - S;
            if (L >= D || L <= -D) {
              E = x[E];
              continue;
            }
            const N = a[E] - C;
            if (N >= D || N <= -D) {
              E = x[E];
              continue;
            }
            const ie = O * O + L * L + N * N;
            if (ie < D * D && ie > 1e-4) {
              A++;
              const J = Math.sqrt(ie), j = O / J, pe = L / J, fe = N / J, ae = 0.5 * (D - J);
              r[v] -= j * ae, n[v] -= pe * ae, a[v] -= fe * ae, r[E] += j * ae, n[E] += pe * ae, a[E] += fe * ae;
              const me = o[v] - o[E], ge = l[v] - l[E], Be = c[v] - c[E], ee = j * me + pe * ge + fe * Be;
              o[v] -= ee * j, l[v] -= ee * pe, c[v] -= ee * fe, o[E] += ee * j, l[E] += ee * pe, c[E] += ee * fe;
            }
          }
          E = x[E];
        }
      }
    }
    return A;
  }
  getMemoryFootprintBytes() {
    if (this.isWasmMode && $.wasmExports) return $.wasmExports.memory.buffer.byteLength;
    const t = this.posX.byteLength * 7, i = this.active.byteLength, s = this.gridHead.byteLength + this.gridTag.byteLength + this.gridNext.byteLength;
    return t + i + s;
  }
  clear() {
    this.activeCount = 0, this.active.fill(0), this.isWasmMode && $.wasmExports && $.wasmExports.clear_entities();
  }
}, G = {
  Dynamic: "DYNAMIC",
  Static: "STATIC",
  Kinematic: "KINEMATIC"
}, K = {
  Box: "BOX",
  Sphere: "SPHERE",
  Capsule: "CAPSULE",
  Mesh: "MESH"
}, cc = class {
  cellSize;
  grid = /* @__PURE__ */ new Map();
  constructor(e = 2) {
    this.cellSize = e;
  }
  getKey(e, t, i) {
    return `${Math.floor(e / this.cellSize)},${Math.floor(t / this.cellSize)},${Math.floor(i / this.cellSize)}`;
  }
  clear() {
    this.grid.clear();
  }
  insert(e, t, i = 0.5) {
    const s = this.getKey(t.x, t.y, t.z);
    let r = this.grid.get(s);
    r || (r = [], this.grid.set(s, r)), r.push({
      id: e,
      pos: t,
      radius: i
    });
  }
  getNearby(e) {
    const t = Math.floor(e.x / this.cellSize), i = Math.floor(e.y / this.cellSize), s = Math.floor(e.z / this.cellSize), r = [];
    for (let n = -1; n <= 1; n++) for (let a = -1; a <= 1; a++) for (let o = -1; o <= 1; o++) {
      const l = `${t + n},${i + a},${s + o}`, c = this.grid.get(l);
      if (c) for (let h = 0; h < c.length; h++) r.push(c[h]);
    }
    return r;
  }
}, ze = class {
  type = K.Box;
  size = new k(1, 1, 1);
  radius = 0.5;
  isTrigger = !1;
  getBoundingBox(e, t) {
    const i = this.size.x * 0.5, s = this.size.y * 0.5, r = this.size.z * 0.5;
    return t ? (t.min.set(e.x - i, e.y - s, e.z - r), t.max.set(e.x + i, e.y + s, e.z + r), t) : new ms(new k(e.x - i, e.y - s, e.z - r), new k(e.x + i, e.y + s, e.z + r));
  }
}, Qe = class {
  type = G.Dynamic;
  mass = 1;
  useGravity = !0;
  linearDamping = 0.05;
  angularDamping = 0.05;
  collisionLayer = 1;
  collisionMask = 4294967295;
  fixedRotation = !1;
  lockLinearAxis = [
    !1,
    !1,
    !1
  ];
  lockAngularAxis = [
    !1,
    !1,
    !1
  ];
  cannonBody = null;
  applyForce(e, t) {
    this.cannonBody && this.cannonBody.applyForce(ce(e), t ? ce(t) : this.cannonBody.position);
  }
  applyImpulse(e, t) {
    this.cannonBody && this.cannonBody.applyImpulse(ce(e), t ? ce(t) : this.cannonBody.position);
  }
  applyTorque(e) {
    this.cannonBody && this.cannonBody.torque.vadd(ce(e), this.cannonBody.torque);
  }
  teleport(e) {
    this.cannonBody && (this.cannonBody.position.set(e.x, e.y, e.z), this.cannonBody.previousPosition.set(e.x, e.y, e.z), this.cannonBody.interpolatedPosition.set(e.x, e.y, e.z));
  }
  get velocity() {
    return this.cannonBody ? vt(this.cannonBody.velocity) : new k();
  }
  set velocity(e) {
    this.cannonBody && this.cannonBody.velocity.set(e.x, e.y, e.z);
  }
  get angularVelocity() {
    return this.cannonBody ? vt(this.cannonBody.angularVelocity) : new k();
  }
  set angularVelocity(e) {
    this.cannonBody && this.cannonBody.angularVelocity.set(e.x, e.y, e.z);
  }
}, nn = class ke {
  getCannonWorld() {
    return this.cannonWorld;
  }
  gravity = new k(0, -9.81, 0);
  activeBackend = "cannon";
  bodies = [];
  cannonWorld;
  static _raycastTempBox = new ms();
  bodyLookup = /* @__PURE__ */ new Map();
  collisionListeners = [];
  triggerListeners = [];
  activePairs = /* @__PURE__ */ new Map();
  collisionEvents = [];
  static FIXED_TIMESTEP = 1 / 60;
  static MAX_SUBSTEPS = 3;
  constructor(t = "cannon") {
    this.activeBackend = t, this.cannonWorld = new q.World(), this.cannonWorld.gravity.set(0, -9.81, 0), this.cannonWorld.frictionGravity = new q.Vec3().copy(this.cannonWorld.gravity), this.cannonWorld.broadphase = new q.SAPBroadphase(this.cannonWorld), this.cannonWorld.solver.iterations = 10;
  }
  setBackend(t) {
    this.activeBackend = t, console.log(`[Kairo Physics] Active Physics Engine Backend set to: ${t.toUpperCase()}`);
  }
  clear() {
    for (const t of [...this.bodies]) this.unregisterBody(t.body);
    this.bodies = [], this.bodyLookup.clear(), this.collisionListeners = [], this.triggerListeners = [], this.activePairs.clear(), this.collisionEvents = [];
  }
  registerBody(t, i, s = new k()) {
    const r = t.type === G.Dynamic, n = t.type === G.Kinematic, a = new q.Body({
      mass: r ? Math.max(1e-3, t.mass) : 0,
      type: r ? q.Body.DYNAMIC : n ? q.Body.KINEMATIC : q.Body.STATIC,
      position: ce(s),
      linearDamping: t.linearDamping,
      angularDamping: t.angularDamping,
      fixedRotation: t.fixedRotation,
      collisionFilterGroup: t.collisionLayer,
      collisionFilterMask: t.collisionMask
    });
    a.linearFactor.set(t.lockLinearAxis[0] ? 0 : 1, t.lockLinearAxis[1] ? 0 : 1, t.lockLinearAxis[2] ? 0 : 1), a.angularFactor.set(t.lockAngularAxis[0] ? 0 : 1, t.lockAngularAxis[1] ? 0 : 1, t.lockAngularAxis[2] ? 0 : 1);
    const o = this.createShape(i);
    a.addShape(o), t.cannonBody = a;
    const l = {
      body: t,
      collider: i,
      position: s
    };
    this.bodies.push(l), this.bodyLookup.set(a, l), this.cannonWorld.addBody(a);
  }
  unregisterBody(t) {
    t.cannonBody && (this.cannonWorld.removeBody(t.cannonBody), this.bodyLookup.delete(t.cannonBody), t.cannonBody = null), this.bodies = this.bodies.filter((i) => i.body !== t);
  }
  step(t) {
    if (this.activeBackend === "go-wasm" && typeof window < "u" && window.kairoWasmPhysics) {
      window.kairoWasmPhysics.step(t);
      return;
    }
    if (this.activeBackend === "havok")
      if (typeof window < "u" && window.havokPlugin) {
        window.havokPlugin.step(t);
        return;
      } else ke._havokFallbackWarned || (console.warn("[PhysicsWorld] Havok backend selected but Havok WASM plugin is not loaded; falling back to Cannon.js physics solver."), ke._havokFallbackWarned = !0);
    const i = this.cannonWorld;
    i.gravity.set(this.gravity.x, this.gravity.y, this.gravity.z), this.cancelGravityForNonGravityBodies(), this.syncKinematicAndStaticBodies(), i.step(ke.FIXED_TIMESTEP, t, ke.MAX_SUBSTEPS), this.syncDynamicBodies(), this.collectCollisionEvents();
  }
  static _havokFallbackWarned = !1;
  cancelGravityForNonGravityBodies() {
    const t = this.gravity;
    for (const i of this.bodies) {
      const s = i.body.cannonBody;
      s && i.body.type === G.Dynamic && !i.body.useGravity && (s.force.x -= i.body.mass * t.x, s.force.y -= i.body.mass * t.y, s.force.z -= i.body.mass * t.z);
    }
  }
  onCollision(t) {
    this.collisionListeners.push(t);
  }
  onTrigger(t) {
    this.triggerListeners.push(t);
  }
  raycast(t, i, s = 100) {
    let r, n = s;
    t instanceof Ei ? (r = t, typeof i == "number" && (n = i)) : r = new Ei(t, i instanceof k ? i : new k(0, 0, -1));
    let a = {
      hasHit: !1,
      body: null,
      collider: null,
      point: new k(),
      normal: new k(),
      distance: n
    };
    for (let o = 0; o < this.bodies.length; o++) {
      const { body: l, collider: c, position: h } = this.bodies[o];
      let u;
      if (c.type === K.Sphere) {
        const d = c.radius || c.size.x * 0.5;
        u = r.intersectSphere(h, d);
      } else {
        const d = c.getBoundingBox(h, ke._raycastTempBox);
        u = r.intersectBox(d);
      }
      u.hasHit && u.distance <= n && u.distance < a.distance && (a = {
        hasHit: !0,
        body: l,
        collider: c,
        point: u.point,
        normal: u.normal,
        distance: u.distance
      });
    }
    return a;
  }
  sphereCast(t, i, s, r = 100) {
    const n = this.raycast(t, s, r + i);
    return n.hasHit && (n.distance = Math.max(0, n.distance - i)), n;
  }
  overlapSphere(t, i) {
    const s = [];
    for (let r = 0; r < this.bodies.length; r++) {
      const { body: n, collider: a, position: o } = this.bodies[r];
      if (a.type === K.Sphere) {
        const l = i + (a.radius || a.size.x * 0.5), c = t.x - o.x, h = t.y - o.y, u = t.z - o.z;
        c * c + h * h + u * u <= l * l && s.push(n);
      } else {
        const l = a.size.x * 0.5, c = a.size.y * 0.5, h = a.size.z * 0.5, u = Ct(t.x, o.x - l, o.x + l), d = Ct(t.y, o.y - c, o.y + c), g = Ct(t.z, o.z - h, o.z + h), p = t.x - u, y = t.y - d, m = t.z - g;
        p * p + y * y + m * m <= i * i && s.push(n);
      }
    }
    return s;
  }
  overlapBox(t, i, s = !0) {
    const r = s ? i.x : i.x * 0.5, n = s ? i.y : i.y * 0.5, a = s ? i.z : i.z * 0.5, o = t.x - r, l = t.x + r, c = t.y - n, h = t.y + n, u = t.z - a, d = t.z + a, g = [];
    for (let p = 0; p < this.bodies.length; p++) {
      const { body: y, collider: m, position: x } = this.bodies[p];
      if (!y.cannonBody) continue;
      const A = m.size.x * 0.5, v = m.size.y * 0.5, b = m.size.z * 0.5;
      l >= x.x - A && o <= x.x + A && h >= x.y - v && c <= x.y + v && d >= x.z - b && u <= x.z + b && g.push(y);
    }
    return g;
  }
  createShape(t) {
    return t.type === K.Sphere ? new q.Sphere(t.size.x * 0.5) : t.type === K.Capsule ? new q.Cylinder(t.size.x * 0.5, t.size.x * 0.5, t.size.y, 12) : new q.Box(new q.Vec3(t.size.x * 0.5, t.size.y * 0.5, t.size.z * 0.5));
  }
  syncKinematicAndStaticBodies() {
    for (const t of this.bodies) t.body.cannonBody && t.body.type !== G.Dynamic && t.body.cannonBody.position.set(t.position.x, t.position.y, t.position.z);
  }
  syncDynamicBodies() {
    for (const t of this.bodies) t.body.cannonBody && t.body.type === G.Dynamic && t.position.set(t.body.cannonBody.position.x, t.body.cannonBody.position.y, t.body.cannonBody.position.z);
  }
  collectCollisionEvents() {
    const t = /* @__PURE__ */ new Map();
    this.collisionEvents = [];
    for (const i of this.cannonWorld.contacts) {
      const s = this.bodyLookup.get(i.bi), r = this.bodyLookup.get(i.bj);
      if (!s || !r) continue;
      const n = an(i.bi.id, i.bj.id);
      t.set(n, [s, r]), this.emitCollision(this.activePairs.has(n) ? "stay" : "enter", s, r);
    }
    for (const [i, s] of this.activePairs.entries()) if (!t.has(i)) {
      const [r, n] = s;
      this.bodyLookup.has(r.body.cannonBody) && this.bodyLookup.has(n.body.cannonBody) && this.emitCollision("exit", r, n);
    }
    this.activePairs = t;
  }
  emitCollision(t, i, s) {
    const r = [{
      phase: t,
      body: i.body,
      other: s.body,
      collider: i.collider,
      otherCollider: s.collider
    }, {
      phase: t,
      body: s.body,
      other: i.body,
      collider: s.collider,
      otherCollider: i.collider
    }];
    this.collisionEvents.push(...r);
    for (const n of r) {
      for (const a of this.collisionListeners) a(n);
      if (n.collider.isTrigger || n.otherCollider.isTrigger) for (const a of this.triggerListeners) a(n);
    }
  }
  toRaycastHit(t) {
    const i = t.body ? this.bodyLookup.get(t.body) : void 0;
    return {
      hasHit: !0,
      body: i?.body ?? null,
      collider: i?.collider ?? null,
      point: vt(t.hitPointWorld),
      normal: vt(t.hitNormalWorld),
      distance: t.distance
    };
  }
};
function ce(e) {
  return new q.Vec3(e.x, e.y, e.z);
}
function vt(e) {
  return new k(e.x, e.y, e.z);
}
function an(e, t) {
  return e < t ? e * 1000003 + t : t * 1000003 + e;
}
function Ct(e, t, i) {
  return Math.max(t, Math.min(i, e));
}
var hc = class {
  cannonVehicle = null;
  chassisBody;
  constructor(e) {
    this.chassisBody = e.chassisBody, this.chassisBody.cannonBody && (this.cannonVehicle = new q.RaycastVehicle({
      chassisBody: this.chassisBody.cannonBody,
      indexRightAxis: e.indexRightAxis ?? 0,
      indexUpAxis: e.indexUpAxis ?? 1,
      indexForwardAxis: e.indexForwardAxis ?? 2
    }));
  }
  addWheel(e) {
    this.cannonVehicle && this.cannonVehicle.addWheel({
      radius: e.radius,
      directionLocal: ce(e.directionLocal),
      suspensionStiffness: e.suspensionStiffness,
      suspensionRestLength: e.suspensionRestLength,
      frictionSlip: e.frictionSlip,
      dampingRelaxation: e.dampingRelaxation,
      dampingCompression: e.dampingCompression,
      maxSuspensionForce: e.maxSuspensionForce,
      rollInfluence: e.rollInfluence,
      axleLocal: ce(e.axleLocal),
      chassisConnectionPointLocal: ce(e.chassisConnectionPointLocal),
      maxSuspensionTravel: e.maxSuspensionTravel,
      customSlidingRotationalSpeed: e.customSlidingRotationalSpeed,
      useCustomSlidingRotationalSpeed: e.useCustomSlidingRotationalSpeed,
      isFrontWheel: e.isFrontWheel
    });
  }
  setSteeringValue(e, t) {
    this.cannonVehicle && this.cannonVehicle.setSteeringValue(e, t);
  }
  applyEngineForce(e, t) {
    this.cannonVehicle && this.cannonVehicle.applyEngineForce(e, t);
  }
  setBrake(e, t) {
    this.cannonVehicle && this.cannonVehicle.setBrake(e, t);
  }
  updateWheelTransform(e) {
    this.cannonVehicle && this.cannonVehicle.updateWheelTransform(e);
  }
  getWheelTransform(e) {
    if (!this.cannonVehicle) return null;
    const t = this.cannonVehicle.wheelInfos[e].worldTransform;
    return {
      position: new k(t.position.x, t.position.y, t.position.z),
      quaternion: {
        x: t.quaternion.x,
        y: t.quaternion.y,
        z: t.quaternion.z,
        w: t.quaternion.w
      }
    };
  }
  addToWorld(e) {
    this.cannonVehicle && e.getCannonWorld() && this.cannonVehicle.addToWorld(e.getCannonWorld());
  }
  removeFromWorld(e) {
    this.cannonVehicle && e.getCannonWorld() && this.cannonVehicle.removeFromWorld(e.getCannonWorld());
  }
}, Ee = class Je {
  id;
  name;
  vertexShader;
  fragmentShader;
  uniforms = {};
  transparent = !1;
  wireframe = !1;
  side = "front";
  blending = "normal";
  depthWrite = !0;
  depthTest = !0;
  threeMaterial = null;
  constructor(t = "Custom Shader Material", i = {}) {
    this.id = `shader_${Math.random().toString(36).substring(2, 9)}`, this.name = t, this.vertexShader = i.vertexShader || Je.DEFAULT_VERTEX_SHADER, this.fragmentShader = i.fragmentShader || Je.DEFAULT_FRAGMENT_SHADER, this.transparent = i.transparent ?? !1, this.wireframe = i.wireframe ?? !1, this.side = i.side || "front", this.blending = i.blending || "normal", this.depthWrite = i.depthWrite ?? !0, this.depthTest = i.depthTest ?? !0, this.uniforms = {
      u_time: {
        value: 0,
        type: "float"
      },
      u_resolution: {
        value: [1e3, 800],
        type: "vec2"
      },
      u_color: {
        value: new R(1, 1, 1, 1),
        type: "color"
      },
      ...i.uniforms || {}
    };
  }
  setUniform(t, i, s) {
    this.uniforms[t] ? (this.uniforms[t].value = i, s && (this.uniforms[t].type = s)) : this.uniforms[t] = {
      value: i,
      type: s || (typeof i == "number" ? "float" : Array.isArray(i) ? `vec${i.length}` : "float")
    }, this.threeMaterial && this.threeMaterial.uniforms[t] && (this.threeMaterial.uniforms[t].value = this.formatThreeUniformValue(i, this.uniforms[t].type));
  }
  getUniform(t) {
    return this.uniforms[t] ? this.uniforms[t].value : void 0;
  }
  update(t, i) {
    this.setUniform("u_time", i);
  }
  toThreeMaterial() {
    if (this.threeMaterial)
      return this.updateThreeUniforms(), this.threeMaterial;
    const t = {};
    for (const [r, n] of Object.entries(this.uniforms)) t[r] = { value: this.formatThreeUniformValue(n.value, n.type) };
    let i = f.FrontSide;
    this.side === "back" && (i = f.BackSide), this.side === "double" && (i = f.DoubleSide);
    let s = f.NormalBlending;
    return this.blending === "additive" && (s = f.AdditiveBlending), this.blending === "subtractive" && (s = f.SubtractiveBlending), this.blending === "multiply" && (s = f.MultiplyBlending), this.threeMaterial = new f.ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: t,
      transparent: this.transparent,
      wireframe: this.wireframe,
      side: i,
      blending: s,
      depthWrite: this.depthWrite,
      depthTest: this.depthTest
    }), this.threeMaterial;
  }
  updateThreeUniforms() {
    if (this.threeMaterial) {
      for (const [t, i] of Object.entries(this.uniforms)) this.threeMaterial.uniforms[t] ? this.threeMaterial.uniforms[t].value = this.formatThreeUniformValue(i.value, i.type) : this.threeMaterial.uniforms[t] = { value: this.formatThreeUniformValue(i.value, i.type) };
      this.threeMaterial.vertexShader = this.vertexShader, this.threeMaterial.fragmentShader = this.fragmentShader, this.threeMaterial.needsUpdate = !0;
    }
  }
  formatThreeUniformValue(t, i) {
    return t instanceof R ? new f.Color(t.r, t.g, t.b) : i === "color" && typeof t == "string" ? new f.Color(t) : i === "color" && Array.isArray(t) ? new f.Color(t[0], t[1], t[2]) : i === "vec2" && Array.isArray(t) ? new f.Vector2(t[0], t[1]) : i === "vec3" && Array.isArray(t) ? new f.Vector3(t[0], t[1], t[2]) : i === "vec4" && Array.isArray(t) ? new f.Vector4(t[0], t[1], t[2], t[3]) : t;
  }
  clone() {
    const t = {};
    for (const [i, s] of Object.entries(this.uniforms)) t[i] = {
      type: s.type,
      value: Array.isArray(s.value) ? [...s.value] : s.value instanceof R ? new R(s.value.r, s.value.g, s.value.b, s.value.a) : s.value
    };
    return new Je(`${this.name} Copy`, {
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: t,
      transparent: this.transparent,
      wireframe: this.wireframe,
      side: this.side,
      blending: this.blending,
      depthWrite: this.depthWrite,
      depthTest: this.depthTest
    });
  }
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      transparent: this.transparent,
      wireframe: this.wireframe,
      side: this.side,
      blending: this.blending,
      depthWrite: this.depthWrite,
      depthTest: this.depthTest,
      uniforms: Object.fromEntries(Object.entries(this.uniforms).map(([t, i]) => [t, {
        type: i.type,
        value: i.value instanceof R ? i.value.toHex() : i.value
      }]))
    };
  }
  static fromJSON(t) {
    const i = new Je(t.name, {
      vertexShader: t.vertexShader,
      fragmentShader: t.fragmentShader,
      transparent: t.transparent,
      wireframe: t.wireframe,
      side: t.side,
      blending: t.blending,
      depthWrite: t.depthWrite,
      depthTest: t.depthTest
    });
    if (t.uniforms) for (const [s, r] of Object.entries(t.uniforms)) r.type === "color" && typeof r.value == "string" ? i.setUniform(s, new R().setHex(r.value), "color") : i.setUniform(s, r.value, r.type);
    return i;
  }
  static DEFAULT_VERTEX_SHADER = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldNormal;
    varying vec3 vLocalPosition;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vLocalPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vWorldNormal = normalize(mat3(modelMatrix) * normal);
      
      // Local Space -> World Space Matrix Transform
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;

      // World Space -> View/Camera Space Matrix Transform
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;

      // View Space -> Clip Space Projection Matrix Transform
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
  static DEFAULT_FRAGMENT_SHADER = `
    uniform vec4 u_color;
    uniform float u_time;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;

    void main() {
      vec3 lightDir = normalize(vec3(1.0, 2.0, 1.0));
      float diff = max(dot(vWorldNormal, lightDir), 0.2);
      gl_FragColor = vec4(u_color.rgb * diff, u_color.a);
    }
  `;
}, uc = [
  "water",
  "dissolve",
  "hologram",
  "toon",
  "fresnel"
], ys = class Me {
  static createWaterShader() {
    return new Ee("Water Wave Shader", {
      transparent: !0,
      uniforms: {
        u_time: {
          value: 0,
          type: "float"
        },
        u_useWorldSpace: {
          value: 1,
          type: "float"
        },
        u_shallowColor: {
          value: new R(0.1, 0.7, 0.9, 0.8),
          type: "color"
        },
        u_deepColor: {
          value: new R(0.01, 0.15, 0.45, 0.95),
          type: "color"
        },
        u_waveSpeed: {
          value: 1.5,
          type: "float"
        },
        u_waveHeight: {
          value: 0.12,
          type: "float"
        },
        u_waveFrequency: {
          value: 4,
          type: "float"
        },
        u_foamColor: {
          value: new R(1, 1, 1, 0.9),
          type: "color"
        }
      },
      vertexShader: `
        uniform float u_time;
        uniform float u_useWorldSpace;
        uniform float u_waveSpeed;
        uniform float u_waveHeight;
        uniform float u_waveFrequency;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vWorldPosition;
        varying float vWaveHeight;

        void main() {
          vUv = uv;
          vLocalPosition = position;
          
          // Local Space -> World Space Matrix Transform
          vec4 worldPos = modelMatrix * vec4(position, 1.0);

          // Select space coordinates for wave evaluation (World Space vs Local Space)
          vec2 calcCoords = mix(position.xz, worldPos.xz, step(0.5, u_useWorldSpace));

          float wave1 = sin(calcCoords.x * u_waveFrequency + u_time * u_waveSpeed) * cos(calcCoords.y * u_waveFrequency * 0.8 + u_time * u_waveSpeed * 1.2);
          float wave2 = sin(calcCoords.y * u_waveFrequency * 1.5 + u_time * u_waveSpeed * 0.9) * 0.5;
          float displacement = (wave1 + wave2) * u_waveHeight;

          vec3 pos = position;
          pos.y += displacement;
          vWaveHeight = displacement;

          // Compute perturbed normal matrix transform
          vec3 modifiedNormal = normal;
          modifiedNormal.x -= cos(calcCoords.x * u_waveFrequency + u_time * u_waveSpeed) * u_waveHeight;
          modifiedNormal.z -= sin(calcCoords.y * u_waveFrequency + u_time * u_waveSpeed) * u_waveHeight;
          
          vNormal = normalize(normalMatrix * modifiedNormal);
          vWorldNormal = normalize(mat3(modelMatrix) * modifiedNormal);

          vec4 finalWorldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = finalWorldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * finalWorldPos;
        }
      `,
      fragmentShader: `
        uniform vec4 u_shallowColor;
        uniform vec4 u_deepColor;
        uniform vec4 u_foamColor;
        uniform float u_time;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        varying float vWaveHeight;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vWorldNormal), 0.0), 2.5);

          float t = clamp((vWaveHeight + 0.1) / 0.25, 0.0, 1.0);
          vec4 waterColor = mix(u_deepColor, u_shallowColor, t);
          waterColor = mix(waterColor, vec4(0.1, 0.8, 1.0, 1.0), fresnel * 0.4);

          // Specular highlight in world space
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vWorldNormal, halfDir), 0.0), 64.0);

          // Foam peak
          float foam = smoothstep(0.08, 0.12, vWaveHeight);
          vec4 finalColor = mix(waterColor, u_foamColor, foam * 0.6);
          finalColor.rgb += vec3(spec * 0.8);

          gl_FragColor = finalColor;
        }
      `
    });
  }
  static createDissolveShader() {
    return new Ee("Dissolve Noise Shader", {
      transparent: !0,
      uniforms: {
        u_time: {
          value: 0,
          type: "float"
        },
        u_useWorldSpace: {
          value: 1,
          type: "float"
        },
        u_dissolve: {
          value: 0.35,
          type: "float"
        },
        u_edgeWidth: {
          value: 0.08,
          type: "float"
        },
        u_edgeColor: {
          value: new R(1, 0.4, 0, 1),
          type: "color"
        },
        u_baseColor: {
          value: new R(0.2, 0.6, 1, 1),
          type: "color"
        },
        u_noiseScale: {
          value: 8,
          type: "float"
        }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vLocalPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float u_dissolve;
        uniform float u_edgeWidth;
        uniform float u_useWorldSpace;
        uniform vec4 u_edgeColor;
        uniform vec4 u_baseColor;
        uniform float u_noiseScale;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vWorldPosition;

        // Procedural 2D Noise
        float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          vec2 noiseCoords = mix(vUv, vWorldPosition.xz, step(0.5, u_useWorldSpace));
          float n = noise(noiseCoords * u_noiseScale);
          
          if (n < u_dissolve) {
            discard;
          }

          vec3 lightDir = normalize(vec3(1.0, 2.0, 1.0));
          float diff = max(dot(vWorldNormal, lightDir), 0.3);
          vec4 color = vec4(u_baseColor.rgb * diff, u_baseColor.a);

          if (n < u_dissolve + u_edgeWidth) {
            float edgeT = (n - u_dissolve) / u_edgeWidth;
            color = mix(u_edgeColor * 2.0, color, edgeT);
          }

          gl_FragColor = color;
        }
      `
    });
  }
  static createHologramShader() {
    return new Ee("Cyber Hologram Shader", {
      transparent: !0,
      side: "double",
      blending: "additive",
      uniforms: {
        u_time: {
          value: 0,
          type: "float"
        },
        u_hologramColor: {
          value: new R(0, 0.9, 1, 0.85),
          type: "color"
        },
        u_fresnelPower: {
          value: 2,
          type: "float"
        },
        u_scanlineSpeed: {
          value: 6,
          type: "float"
        },
        u_scanlineCount: {
          value: 40,
          type: "float"
        },
        u_glitchIntensity: {
          value: 0.03,
          type: "float"
        }
      },
      vertexShader: `
        uniform float u_time;
        uniform float u_glitchIntensity;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vLocalPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          
          vec3 pos = position;
          // Local Space glitch displacement transform
          float glitch = sin(pos.y * 30.0 + u_time * 10.0) * u_glitchIntensity * step(0.85, sin(u_time * 4.0));
          pos.x += glitch;

          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec4 u_hologramColor;
        uniform float u_time;
        uniform float u_fresnelPower;
        uniform float u_scanlineSpeed;
        uniform float u_scanlineCount;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vWorldNormal), 0.0), u_fresnelPower);

          float scanline = sin(vUv.y * u_scanlineCount - u_time * u_scanlineSpeed) * 0.5 + 0.5;
          scanline = smoothstep(0.2, 0.8, scanline);

          float alpha = (fresnel * 0.7 + scanline * 0.3) * u_hologramColor.a;
          vec3 finalColor = u_hologramColor.rgb * (fresnel + scanline * 0.6 + 0.2);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `
    });
  }
  static createToonShader() {
    return new Ee("Toon Cel Shader", {
      uniforms: {
        u_time: {
          value: 0,
          type: "float"
        },
        u_baseColor: {
          value: new R(0.9, 0.3, 0.2, 1),
          type: "color"
        },
        u_shadowColor: {
          value: new R(0.3, 0.1, 0.2, 1),
          type: "color"
        },
        u_lightDirection: {
          value: [
            0.5,
            1,
            0.5
          ],
          type: "vec3"
        },
        u_steps: {
          value: 3,
          type: "float"
        },
        u_rimPower: {
          value: 3,
          type: "float"
        }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vLocalPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec4 u_baseColor;
        uniform vec4 u_shadowColor;
        uniform vec3 u_lightDirection;
        uniform float u_steps;
        uniform float u_rimPower;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 L = normalize(u_lightDirection);
          float NdotL = max(dot(vWorldNormal, L), 0.0);

          // Step lighting calculation in world space
          float toonLight = floor(NdotL * u_steps) / u_steps;
          toonLight = max(toonLight, 0.15);

          vec3 toonColor = mix(u_shadowColor.rgb, u_baseColor.rgb, toonLight);

          // Rim outline glow
          vec3 V = normalize(cameraPosition - vWorldPosition);
          float rim = 1.0 - max(dot(V, vWorldNormal), 0.0);
          rim = pow(rim, u_rimPower);
          rim = step(0.65, rim);

          vec3 finalColor = toonColor + vec3(rim * 0.4);
          gl_FragColor = vec4(finalColor, u_baseColor.a);
        }
      `
    });
  }
  static createFresnelGlowShader() {
    return new Ee("Glowing Fresnel Rim Shader", {
      transparent: !0,
      blending: "additive",
      uniforms: {
        u_time: {
          value: 0,
          type: "float"
        },
        u_innerColor: {
          value: new R(0.1, 0.1, 0.3, 0.5),
          type: "color"
        },
        u_glowColor: {
          value: new R(0.9, 0.2, 1, 1),
          type: "color"
        },
        u_fresnelPower: {
          value: 2.5,
          type: "float"
        },
        u_pulseSpeed: {
          value: 3,
          type: "float"
        }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPosition;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vLocalPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec4 u_innerColor;
        uniform vec4 u_glowColor;
        uniform float u_fresnelPower;
        uniform float u_pulseSpeed;
        uniform float u_time;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 V = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(dot(V, vWorldNormal), 0.0), u_fresnelPower);

          float pulse = (sin(u_time * u_pulseSpeed) * 0.5 + 0.5) * 0.4 + 0.8;
          fresnel *= pulse;

          vec4 color = mix(u_innerColor, u_glowColor, fresnel);
          color.rgb *= fresnel * 2.0;

          gl_FragColor = vec4(color.rgb, fresnel * u_glowColor.a);
        }
      `
    });
  }
  static getPreset(t) {
    switch (t) {
      case "water":
        return Me.createWaterShader();
      case "dissolve":
        return Me.createDissolveShader();
      case "hologram":
        return Me.createHologramShader();
      case "toon":
        return Me.createToonShader();
      case "fresnel":
        return Me.createFresnelGlowShader();
      default:
        return Me.createWaterShader();
    }
  }
}, dc = {
  Opaque: 2e3,
  AlphaTest: 2450,
  Transparent: 3e3
}, pc = class vs {
  id;
  name;
  color = new R(1, 1, 1, 1);
  roughness = 0.5;
  metalness = 0.1;
  emissive = new R(0, 0, 0, 1);
  wireframe = !1;
  transparent = !1;
  opacity = 1;
  mapUrl = null;
  normalMapUrl = null;
  shaderGraphNodes = [];
  isShaderMaterial = !1;
  customShaderMaterial = null;
  constructor(t = "Standard Material") {
    this.name = t, this.id = `mat_${Math.random().toString(36).substring(2, 9)}`;
  }
  setShaderPreset(t) {
    return this.customShaderMaterial = ys.getPreset(t), this.isShaderMaterial = !0, this.name = `${this.customShaderMaterial.name}`, this.transparent = this.customShaderMaterial.transparent, this.wireframe = this.customShaderMaterial.wireframe, this.customShaderMaterial;
  }
  setCustomShader(t) {
    this.customShaderMaterial = t, this.isShaderMaterial = !0, this.name = t.name, this.transparent = t.transparent, this.wireframe = t.wireframe;
  }
  clone() {
    const t = new vs(this.name + " Copy");
    return t.color = new R(this.color.r, this.color.g, this.color.b, this.color.a), t.roughness = this.roughness, t.metalness = this.metalness, t.emissive = new R(this.emissive.r, this.emissive.g, this.emissive.b, this.emissive.a), t.wireframe = this.wireframe, t.transparent = this.transparent, t.opacity = this.opacity, t.mapUrl = this.mapUrl, t.normalMapUrl = this.normalMapUrl, t.isShaderMaterial = this.isShaderMaterial, this.customShaderMaterial && (t.customShaderMaterial = this.customShaderMaterial.clone()), t;
  }
}, fc = class {
  static compile(e) {
    const t = {
      u_time: {
        value: 0,
        type: "float"
      },
      u_resolution: {
        value: [1e3, 800],
        type: "vec2"
      }
    }, i = e.nodes.find((u) => u.type === "master_output");
    let s = "", r = !1;
    const n = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), o = (u, d) => e.connections.find((g) => g.toNodeId === u && g.toPortId === d), l = (u) => {
      if (a.has(u)) return;
      a.add(u);
      const d = e.nodes.find((p) => p.id === u);
      if (!d) return;
      for (const p of d.inputs) {
        const y = o(d.id, p.id);
        y && l(y.fromNodeId);
      }
      const g = (p, y = "0.0") => {
        const m = o(d.id, p);
        if (m && n.has(`${m.fromNodeId}_${m.fromPortId}`)) return n.get(`${m.fromNodeId}_${m.fromPortId}`);
        if (d.properties && d.properties[p] !== void 0) {
          const x = d.properties[p];
          return typeof x == "number" ? x.toFixed(3) : y;
        }
        return y;
      };
      switch (d.type) {
        case "input_time": {
          const p = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${p}`, "u_time");
          break;
        }
        case "input_uv": {
          const p = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${p}`, "vUv");
          break;
        }
        case "input_local_pos": {
          const p = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${p}`, "vLocalPosition");
          break;
        }
        case "input_world_pos": {
          const p = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${p}`, "vWorldPosition");
          break;
        }
        case "input_view_pos": {
          const p = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${p}`, "vViewPosition");
          break;
        }
        case "input_world_normal": {
          const p = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${p}`, "vWorldNormal");
          break;
        }
        case "space_conversion": {
          const p = d.properties?.mode || "localToWorld", y = g("in", "vLocalPosition"), m = `space_${d.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          p === "localToWorld" ? s += `  vec3 ${m} = vWorldPosition;
` : p === "worldToView" ? s += `  vec3 ${m} = vViewPosition;
` : s += `  vec3 ${m} = ${y};
`;
          const x = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${x}`, m);
          break;
        }
        case "matrix_transform": {
          const p = d.properties?.matrix || "modelMatrix", y = g("in", "vec4(vLocalPosition, 1.0)"), m = `matTx_${d.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          p === "normalMatrix" ? s += `  vec3 ${m} = normalize(vNormal);
` : s += `  vec4 ${m} = ${p} * vec4(${y});
`;
          const x = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${x}`, m);
          break;
        }
        case "input_color": {
          const p = d.properties?.color || "#38bdf8", y = `u_color_${d.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          t[y] = {
            value: new R().setHex(p),
            type: "color"
          };
          const m = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${m}`, y);
          break;
        }
        case "input_float": {
          const p = d.properties?.value ?? 1, y = `u_float_${d.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          t[y] = {
            value: p,
            type: "float"
          };
          const m = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${m}`, y);
          break;
        }
        case "input_noise": {
          r || (r = !0);
          const p = g("uv", "vUv"), y = g("scale", "8.0"), m = `noise_${d.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          s += `  float ${m} = noise(${p} * ${y});
`;
          const x = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${x}`, m);
          break;
        }
        case "fresnel": {
          const p = g("power", "2.0"), y = `fresnel_${d.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          s += `  vec3 V_${d.id} = normalize(cameraPosition - vWorldPosition);
`, s += `  float ${y} = pow(1.0 - max(dot(V_${d.id}, vWorldNormal), 0.0), ${p});
`;
          const m = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${m}`, y);
          break;
        }
        case "math_add": {
          const p = g("a", "0.0"), y = g("b", "0.0"), m = `add_${d.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          s += `  vec4 ${m} = vec4(${p}) + vec4(${y});
`;
          const x = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${x}`, `${m}`);
          break;
        }
        case "math_multiply": {
          const p = g("a", "1.0"), y = g("b", "1.0"), m = `mul_${d.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          s += `  vec4 ${m} = vec4(${p}) * vec4(${y});
`;
          const x = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${x}`, `${m}`);
          break;
        }
        case "math_sin": {
          const p = g("in", "u_time"), y = `sin_${d.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          s += `  float ${y} = sin(${p}) * 0.5 + 0.5;
`;
          const m = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${m}`, y);
          break;
        }
        case "math_step": {
          const p = g("edge", "0.5"), y = g("in", "0.0"), m = `step_${d.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          s += `  float ${m} = step(${p}, ${y});
`;
          const x = d.outputs[0]?.id || "out";
          n.set(`${d.id}_${x}`, m);
          break;
        }
        case "master_output": {
          const p = g("color", "vec4(0.2, 0.6, 1.0, 1.0)"), y = g("alpha", "1.0");
          s += `  vec4 finalCol = vec4(${p});
`, s += `  finalCol.a *= ${y};
`, s += `  gl_FragColor = finalCol;
`;
          break;
        }
      }
    };
    i ? l(i.id) : s += `  gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0);
`;
    const c = r ? `
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
    ` : "", h = Object.keys(t).map((u) => {
      const d = t[u].type;
      return `uniform ${d === "color" ? "vec4" : d === "float" ? "float" : d === "vec2" ? "vec2" : d === "vec3" ? "vec3" : "vec4"} ${u};`;
    }).join(`
`);
    return {
      vertexShader: Ee.DEFAULT_VERTEX_SHADER,
      fragmentShader: `
      ${h}
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vLocalPosition;
      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;

      ${c}

      void main() {
${s}
      }
    `,
      uniforms: t
    };
  }
  static createDefaultGraph() {
    return {
      nodes: [
        {
          id: "n_world_pos",
          type: "input_world_pos",
          title: "World Space Position",
          x: 40,
          y: 40,
          inputs: [],
          outputs: [{
            id: "out",
            name: "WorldPos",
            type: "vec3"
          }]
        },
        {
          id: "n_uv",
          type: "input_uv",
          title: "UV Coordinates",
          x: 40,
          y: 140,
          inputs: [],
          outputs: [{
            id: "uv",
            name: "UV",
            type: "vec2"
          }]
        },
        {
          id: "n_noise",
          type: "input_noise",
          title: "Procedural Noise",
          x: 260,
          y: 60,
          inputs: [{
            id: "uv",
            name: "UV",
            type: "vec2"
          }, {
            id: "scale",
            name: "Scale",
            type: "float"
          }],
          outputs: [{
            id: "out",
            name: "Noise",
            type: "float"
          }],
          properties: { scale: 10 }
        },
        {
          id: "n_color",
          type: "input_color",
          title: "Base Color",
          x: 260,
          y: 220,
          inputs: [],
          outputs: [{
            id: "out",
            name: "Color",
            type: "color"
          }],
          properties: { color: "#38bdf8" }
        },
        {
          id: "n_mul",
          type: "math_multiply",
          title: "Color Multiply",
          x: 500,
          y: 120,
          inputs: [{
            id: "a",
            name: "A",
            type: "float"
          }, {
            id: "b",
            name: "B",
            type: "color"
          }],
          outputs: [{
            id: "out",
            name: "Out",
            type: "color"
          }]
        },
        {
          id: "n_master",
          type: "master_output",
          title: "Master Shader Output",
          x: 740,
          y: 120,
          inputs: [{
            id: "color",
            name: "Base Color",
            type: "color"
          }, {
            id: "alpha",
            name: "Alpha",
            type: "float"
          }],
          outputs: []
        }
      ],
      connections: [
        {
          fromNodeId: "n_uv",
          fromPortId: "uv",
          toNodeId: "n_noise",
          toPortId: "uv"
        },
        {
          fromNodeId: "n_noise",
          fromPortId: "out",
          toNodeId: "n_mul",
          toPortId: "a"
        },
        {
          fromNodeId: "n_color",
          fromPortId: "out",
          toNodeId: "n_mul",
          toPortId: "b"
        },
        {
          fromNodeId: "n_mul",
          fromPortId: "out",
          toNodeId: "n_master",
          toPortId: "color"
        }
      ]
    };
  }
}, Vi = {
  Directional: "DIRECTIONAL",
  Point: "POINT",
  Spot: "SPOT",
  Ambient: "AMBIENT"
}, mc = class {
  type = Vi.Directional;
  color = new R(1, 1, 1, 1);
  intensity = 1;
  shadowCast = !0;
  range = 10;
  spotAngle = Math.PI / 4;
  constructor(e = Vi.Directional) {
    this.type = e;
  }
}, gc = class {
  color = new R(0.1, 0.12, 0.18, 1);
  sunDirection = new k(0.5, 1, 0.5).normalize();
  fogEnabled = !0;
  fogColor = new R(0.1, 0.12, 0.18, 1);
  fogNear = 10;
  fogFar = 100;
}, yc = class {
  mesh;
  maxParticles;
  dummy = new f.Object3D();
  positionsX;
  positionsY;
  positionsZ;
  velocitiesX;
  velocitiesY;
  velocitiesZ;
  colors;
  sizes;
  lives;
  maxLives;
  activeCount = 0;
  constructor(e = 1e3, t = 16777215) {
    this.maxParticles = e;
    const i = new f.SphereGeometry(0.1, 8, 8), s = new f.MeshStandardMaterial({
      color: t,
      emissive: t,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      transparent: !0,
      opacity: 0.9
    });
    this.mesh = new f.InstancedMesh(i, s, e), this.mesh.instanceMatrix.setUsage(f.DynamicDrawUsage), this.mesh.count = 0, this.mesh.instanceColor = new f.InstancedBufferAttribute(new Float32Array(e * 3), 3), this.mesh.instanceColor.setUsage(f.DynamicDrawUsage), this.positionsX = new Float32Array(e), this.positionsY = new Float32Array(e), this.positionsZ = new Float32Array(e), this.velocitiesX = new Float32Array(e), this.velocitiesY = new Float32Array(e), this.velocitiesZ = new Float32Array(e), this.colors = new Int32Array(e), this.sizes = new Float32Array(e), this.lives = new Float32Array(e), this.maxLives = new Float32Array(e);
  }
  emitBurst(e, t, i = 30) {
    const s = Array.isArray(e) ? e[0] : e.x, r = Array.isArray(e) ? e[1] : e.y, n = Array.isArray(e) ? e[2] : e.z;
    for (let a = 0; a < i && !(this.activeCount >= this.maxParticles); a++) {
      const o = this.activeCount++;
      this.positionsX[o] = s, this.positionsY[o] = r, this.positionsZ[o] = n, this.lives[o] = 0;
      let l = 16436245;
      if (t === "collect_burst")
        this.maxLives[o] = 0.6 + Math.random() * 0.4, this.velocitiesX[o] = (Math.random() - 0.5) * 6, this.velocitiesY[o] = Math.random() * 5 + 2, this.velocitiesZ[o] = (Math.random() - 0.5) * 6, l = 1096065, this.sizes[o] = 0.2 + Math.random() * 0.2;
      else if (t === "explosion")
        this.maxLives[o] = 0.5 + Math.random() * 0.5, this.velocitiesX[o] = (Math.random() - 0.5) * 12, this.velocitiesY[o] = Math.random() * 8 + 3, this.velocitiesZ[o] = (Math.random() - 0.5) * 12, l = Math.random() > 0.5 ? 15680580 : 16096779, this.sizes[o] = 0.3 + Math.random() * 0.3;
      else if (t === "teleport_flash") {
        this.maxLives[o] = 0.8;
        const c = Math.random() * Math.PI * 2, h = Math.random() * 1.5;
        this.velocitiesX[o] = Math.cos(c) * h, this.velocitiesY[o] = Math.random() * 6 + 2, this.velocitiesZ[o] = Math.sin(c) * h, l = 11032055, this.sizes[o] = 0.25;
      } else if (t === "dust_footstep")
        this.maxLives[o] = 0.4, this.velocitiesX[o] = (Math.random() - 0.5) * 1.5, this.velocitiesY[o] = Math.random() * 1, this.velocitiesZ[o] = (Math.random() - 0.5) * 1.5, l = 13948120, this.sizes[o] = 0.15;
      else if (t === "portal_swirl") {
        this.maxLives[o] = 1.2;
        const c = Math.random() * Math.PI * 2;
        this.velocitiesX[o] = Math.cos(c) * 2, this.velocitiesY[o] = Math.random() * 3 + 1, this.velocitiesZ[o] = Math.sin(c) * 2, l = 3900150, this.sizes[o] = 0.2;
      } else
        this.maxLives[o] = 0.7, this.velocitiesX[o] = (Math.random() - 0.5) * 3, this.velocitiesY[o] = Math.random() * 4, this.velocitiesZ[o] = (Math.random() - 0.5) * 3, l = 16436245, this.sizes[o] = 0.2;
      this.colors[o] = l, this.writeInstanceColor(o, l);
    }
  }
  writeInstanceColor(e, t) {
    if (!this.mesh.instanceColor) return;
    const i = this.mesh.instanceColor.array;
    i[e * 3 + 0] = (t >> 16 & 255) / 255, i[e * 3 + 1] = (t >> 8 & 255) / 255, i[e * 3 + 2] = (t & 255) / 255;
  }
  update(e) {
    let t = 0;
    for (let s = 0; s < this.activeCount; s++) {
      if (this.lives[s] += e, this.lives[s] >= this.maxLives[s]) continue;
      this.positionsX[s] += this.velocitiesX[s] * e, this.positionsY[s] += this.velocitiesY[s] * e, this.positionsZ[s] += this.velocitiesZ[s] * e, this.velocitiesY[s] -= 9.81 * e * 0.3;
      const r = this.lives[s] / this.maxLives[s], n = this.sizes[s] * (1 - r), a = this.positionsX[s], o = this.positionsY[s], l = this.positionsZ[s], c = this.mesh.instanceMatrix.array, h = t * 16;
      if (c[h + 0] = n, c[h + 1] = 0, c[h + 2] = 0, c[h + 3] = 0, c[h + 4] = 0, c[h + 5] = n, c[h + 6] = 0, c[h + 7] = 0, c[h + 8] = 0, c[h + 9] = 0, c[h + 10] = n, c[h + 11] = 0, c[h + 12] = a, c[h + 13] = o, c[h + 14] = l, c[h + 15] = 1, t !== s) {
        this.positionsX[t] = this.positionsX[s], this.positionsY[t] = this.positionsY[s], this.positionsZ[t] = this.positionsZ[s], this.velocitiesX[t] = this.velocitiesX[s], this.velocitiesY[t] = this.velocitiesY[s], this.velocitiesZ[t] = this.velocitiesZ[s], this.colors[t] = this.colors[s], this.sizes[t] = this.sizes[s], this.lives[t] = this.lives[s], this.maxLives[t] = this.maxLives[s];
        const u = this.mesh.instanceColor;
        u && (u.array[t * 3 + 0] = u.array[s * 3 + 0], u.array[t * 3 + 1] = u.array[s * 3 + 1], u.array[t * 3 + 2] = u.array[s * 3 + 2]);
      }
      t++;
    }
    const i = this.mesh.count;
    this.activeCount = t, this.mesh.count = t, (t > 0 || i > 0) && (this.mesh.instanceMatrix.needsUpdate = !0, this.mesh.instanceColor && (this.mesh.instanceColor.needsUpdate = !0));
  }
}, on = class {
  camera;
  target = new f.Vector3();
  distance = 6;
  minDistance = 2;
  maxDistance = 20;
  heightOffset = 1.5;
  pitch = 0.35;
  yaw = Math.PI;
  lerpSpeed = 10;
  enableCollisionAvoidance = !0;
  currentPosition = new f.Vector3();
  currentTarget = new f.Vector3();
  shakeOffset = new f.Vector3();
  shakeTimeRemaining = 0;
  shakeIntensity = 0;
  shakeDecay = 1;
  activeShot = null;
  shotTimer = 0;
  trackingTarget = null;
  _desiredPos = new f.Vector3();
  _dir = new f.Vector3();
  _raycaster = new f.Raycaster();
  _hits = [];
  _shotFromPos = new f.Vector3();
  _shotToPos = new f.Vector3();
  _shotTargetPos = new f.Vector3();
  constructor(e) {
    this.camera = e, this.currentPosition.copy(this.camera.position), this.currentTarget.copy(this.target);
  }
  setTargetPosition(e) {
    this.target.set(e.x, e.y + this.heightOffset, e.z);
  }
  rotate(e, t) {
    this.yaw += e, this.pitch = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, this.pitch + t));
  }
  zoom(e) {
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance + e));
  }
  shake(e) {
    this.shakeIntensity = e.intensity, this.shakeTimeRemaining = e.duration, this.shakeDecay = e.decay ?? 1;
  }
  cutTo(e, t) {
    this.activeShot = null, this.camera.position.copy(e), this.currentPosition.copy(e), this.target.copy(t), this.currentTarget.copy(t), this.camera.lookAt(t);
  }
  panTo(e, t, i, s = 3) {
    this._shotFromPos.copy(e), this._shotToPos.copy(t), this._shotTargetPos.copy(i), this.activeShot = {
      type: "pan",
      fromPos: this._shotFromPos,
      toPos: this._shotToPos,
      targetPos: this._shotTargetPos,
      duration: s
    }, this.shotTimer = 0, this.camera.position.copy(e), this.currentPosition.copy(e), this.target.copy(i), this.currentTarget.copy(i);
  }
  orbitShot(e, t = 8, i = 1, s = 5) {
    this._shotTargetPos.copy(e), this.activeShot = {
      type: "orbit",
      targetPos: this._shotTargetPos,
      radius: t,
      speed: i,
      duration: s
    }, this.shotTimer = 0, this.target.copy(e), this.currentTarget.copy(e);
  }
  dollyZoom(e = 30, t = 2.5) {
    if (this.camera.isPerspectiveCamera) {
      const i = this.camera;
      this._shotFromPos.copy(i.position), this.activeShot = {
        type: "dolly",
        fov: e,
        fromPos: this._shotFromPos,
        duration: t
      }, this.shotTimer = 0;
    }
  }
  craneShot(e, t, i = 4) {
    this.panTo(e, t, this.target, i);
  }
  trackObject(e, t = 8) {
    this.trackingTarget = e, this.lerpSpeed = t;
  }
  update(e, t = []) {
    if (this.activeShot) {
      this.shotTimer += e;
      const u = Math.min(1, this.shotTimer / (this.activeShot.duration || 1)), d = 0.5 - Math.cos(u * Math.PI) / 2;
      if (this.activeShot.type === "pan" && this.activeShot.fromPos && this.activeShot.toPos)
        this.currentPosition.lerpVectors(this.activeShot.fromPos, this.activeShot.toPos, d), this.activeShot.targetPos && (this.target.copy(this.activeShot.targetPos), this.currentTarget.copy(this.activeShot.targetPos));
      else if (this.activeShot.type === "orbit" && this.activeShot.targetPos) {
        const g = this.shotTimer * (this.activeShot.speed || 1), p = this.activeShot.radius || 8;
        this.currentPosition.x = this.activeShot.targetPos.x + Math.sin(g) * p, this.currentPosition.y = this.activeShot.targetPos.y + 3, this.currentPosition.z = this.activeShot.targetPos.z + Math.cos(g) * p, this.target.copy(this.activeShot.targetPos), this.currentTarget.copy(this.activeShot.targetPos);
      } else if (this.activeShot.type === "dolly" && this.camera.isPerspectiveCamera) {
        const g = this.camera;
        g.fov += ((this.activeShot.fov || 30) - g.fov) * Math.min(1, 4 * e), g.updateProjectionMatrix();
      }
      u >= 1 && (this.activeShot = null), this.camera.position.copy(this.currentPosition), this.camera.lookAt(this.currentTarget);
      return;
    }
    if (this.trackingTarget) {
      const u = this.trackingTarget.position ?? this.trackingTarget;
      this.setTargetPosition(u);
    }
    const i = Math.min(0.1, Math.max(1e-3, e)), s = 1 - Math.exp(-this.lerpSpeed * i);
    this.currentTarget.lerp(this.target, s);
    const r = Math.sin(this.pitch), n = Math.cos(this.pitch), a = Math.sin(this.yaw), o = Math.cos(this.yaw), l = this.currentTarget.x + this.distance * a * n, c = this.currentTarget.y + this.distance * r, h = this.currentTarget.z + this.distance * o * n;
    if (this._desiredPos.set(l, c, h), this.enableCollisionAvoidance && t.length > 0 && (this._dir.copy(this._desiredPos).sub(this.currentTarget).normalize(), this._raycaster.set(this.currentTarget, this._dir), this._raycaster.near = 0.1, this._raycaster.far = this.distance, this._hits.length = 0, this._raycaster.intersectObjects(t, !0, this._hits), this._hits.length > 0)) {
      const u = this._hits[0].distance - 0.3;
      u < this.distance && this._desiredPos.copy(this.currentTarget).addScaledVector(this._dir, Math.max(this.minDistance, u));
    }
    if (this.currentPosition.lerp(this._desiredPos, s), this.shakeTimeRemaining > 0) {
      this.shakeTimeRemaining -= e;
      const u = this.shakeIntensity * (this.shakeTimeRemaining > 0 ? this.shakeTimeRemaining * this.shakeDecay : 0);
      this.shakeOffset.set((Math.random() - 0.5) * 2 * u, (Math.random() - 0.5) * 2 * u, (Math.random() - 0.5) * 2 * u);
    } else this.shakeOffset.set(0, 0, 0);
    this.camera.position.copy(this.currentPosition).add(this.shakeOffset), this.camera.lookAt(this.currentTarget);
  }
}, rt = {
  name: "CopyShader",
  uniforms: {
    tDiffuse: { value: null },
    opacity: { value: 1 }
  },
  vertexShader: `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
  fragmentShader: `

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`
}, ue = class {
  constructor() {
    this.isPass = !0, this.enabled = !0, this.needsSwap = !0, this.clear = !1, this.renderToScreen = !1;
  }
  setSize() {
  }
  render() {
    console.error("THREE.Pass: .render() must be implemented in derived pass.");
  }
  dispose() {
  }
}, ln = new Gr(-1, 1, 1, -1, 0, 1), cn = class extends Er {
  constructor() {
    super(), this.setAttribute("position", new Bi([
      -1,
      3,
      0,
      -1,
      -1,
      0,
      3,
      -1,
      0
    ], 3)), this.setAttribute("uv", new Bi([
      0,
      2,
      0,
      0,
      2,
      0
    ], 2));
  }
}, hn = new cn(), Le = class {
  constructor(e) {
    this._mesh = new Nr(hn, e);
  }
  dispose() {
    this._mesh.geometry.dispose();
  }
  render(e) {
    e.render(this._mesh, ln);
  }
  get material() {
    return this._mesh.material;
  }
  set material(e) {
    this._mesh.material = e;
  }
}, un = class extends ue {
  constructor(e, t = "tDiffuse") {
    super(), this.textureID = t, this.uniforms = null, this.material = null, e instanceof Y ? (this.uniforms = e.uniforms, this.material = e) : e && (this.uniforms = Fe.clone(e.uniforms), this.material = new Y({
      name: e.name !== void 0 ? e.name : "unspecified",
      defines: Object.assign({}, e.defines),
      uniforms: this.uniforms,
      vertexShader: e.vertexShader,
      fragmentShader: e.fragmentShader
    })), this._fsQuad = new Le(this.material);
  }
  render(e, t, i) {
    this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = i.texture), this._fsQuad.material = this.material, this.renderToScreen ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(t), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this._fsQuad.render(e));
  }
  dispose() {
    this.material.dispose(), this._fsQuad.dispose();
  }
}, Di = class extends ue {
  constructor(e, t) {
    super(), this.scene = e, this.camera = t, this.clear = !0, this.needsSwap = !1, this.inverse = !1;
  }
  render(e, t, i) {
    const s = e.getContext(), r = e.state;
    r.buffers.color.setMask(!1), r.buffers.depth.setMask(!1), r.buffers.color.setLocked(!0), r.buffers.depth.setLocked(!0);
    let n, a;
    this.inverse ? (n = 0, a = 1) : (n = 1, a = 0), r.buffers.stencil.setTest(!0), r.buffers.stencil.setOp(s.REPLACE, s.REPLACE, s.REPLACE), r.buffers.stencil.setFunc(s.ALWAYS, n, 4294967295), r.buffers.stencil.setClear(a), r.buffers.stencil.setLocked(!0), e.setRenderTarget(i), this.clear && e.clear(), e.render(this.scene, this.camera), e.setRenderTarget(t), this.clear && e.clear(), e.render(this.scene, this.camera), r.buffers.color.setLocked(!1), r.buffers.depth.setLocked(!1), r.buffers.color.setMask(!0), r.buffers.depth.setMask(!0), r.buffers.stencil.setLocked(!1), r.buffers.stencil.setFunc(s.EQUAL, 1, 4294967295), r.buffers.stencil.setOp(s.KEEP, s.KEEP, s.KEEP), r.buffers.stencil.setLocked(!0);
  }
}, dn = class extends ue {
  constructor() {
    super(), this.needsSwap = !1;
  }
  render(e) {
    e.state.buffers.stencil.setLocked(!1), e.state.buffers.stencil.setTest(!1);
  }
}, pn = class {
  constructor(e, t) {
    if (this.renderer = e, this._pixelRatio = e.getPixelRatio(), t === void 0) {
      const i = e.getSize(new W());
      this._width = i.width, this._height = i.height, t = new X(this._width * this._pixelRatio, this._height * this._pixelRatio, { type: te }), t.texture.name = "EffectComposer.rt1";
    } else
      this._width = t.width, this._height = t.height;
    this.renderTarget1 = t, this.renderTarget2 = t.clone(), this.renderTarget2.texture.name = "EffectComposer.rt2", this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.renderToScreen = !0, this.passes = [], this.copyPass = new un(rt), this.copyPass.material.blending = zt, this.timer = new qr();
  }
  swapBuffers() {
    const e = this.readBuffer;
    this.readBuffer = this.writeBuffer, this.writeBuffer = e;
  }
  addPass(e) {
    this.passes.push(e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  insertPass(e, t) {
    this.passes.splice(t, 0, e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  removePass(e) {
    const t = this.passes.indexOf(e);
    t !== -1 && this.passes.splice(t, 1);
  }
  isLastEnabledPass(e) {
    for (let t = e + 1; t < this.passes.length; t++) if (this.passes[t].enabled) return !1;
    return !0;
  }
  render(e) {
    this.timer.update(), e === void 0 && (e = this.timer.getDelta());
    const t = this.renderer.getRenderTarget();
    let i = !1;
    for (let s = 0, r = this.passes.length; s < r; s++) {
      const n = this.passes[s];
      if (n.enabled !== !1) {
        if (n.renderToScreen = this.renderToScreen && this.isLastEnabledPass(s), n.render(this.renderer, this.writeBuffer, this.readBuffer, e, i), n.needsSwap) {
          if (i) {
            const a = this.renderer.getContext(), o = this.renderer.state.buffers.stencil;
            o.setFunc(a.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e), o.setFunc(a.EQUAL, 1, 4294967295);
          }
          this.swapBuffers();
        }
        Di !== void 0 && (n instanceof Di ? i = !0 : n instanceof dn && (i = !1));
      }
    }
    this.renderer.setRenderTarget(t);
  }
  reset(e) {
    if (e === void 0) {
      const t = this.renderer.getSize(new W());
      this._pixelRatio = this.renderer.getPixelRatio(), this._width = t.width, this._height = t.height, e = this.renderTarget1.clone(), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }
    this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.renderTarget1 = e, this.renderTarget2 = e.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2;
  }
  setSize(e, t) {
    this._width = e, this._height = t;
    const i = this._width * this._pixelRatio, s = this._height * this._pixelRatio;
    this.renderTarget1.setSize(i, s), this.renderTarget2.setSize(i, s);
    for (let r = 0; r < this.passes.length; r++) this.passes[r].setSize(i, s);
  }
  setPixelRatio(e) {
    this._pixelRatio = e, this.setSize(this._width, this._height);
  }
  dispose() {
    this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.copyPass.dispose();
  }
}, fn = class extends ue {
  constructor(e, t, i = null, s = null, r = null) {
    super(), this.scene = e, this.camera = t, this.overrideMaterial = i, this.clearColor = s, this.clearAlpha = r, this.clear = !0, this.clearDepth = !1, this.needsSwap = !1, this.isRenderPass = !0, this._oldClearColor = new le();
  }
  render(e, t, i) {
    const s = e.autoClear;
    e.autoClear = !1;
    let r, n;
    this.overrideMaterial !== null && (n = this.scene.overrideMaterial, this.scene.overrideMaterial = this.overrideMaterial), this.clearColor !== null && (e.getClearColor(this._oldClearColor), e.setClearColor(this.clearColor, e.getClearAlpha())), this.clearAlpha !== null && (r = e.getClearAlpha(), e.setClearAlpha(this.clearAlpha)), this.clearDepth == !0 && e.clearDepth(), e.setRenderTarget(this.renderToScreen ? null : i), this.clear === !0 && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), e.render(this.scene, this.camera), this.clearColor !== null && e.setClearColor(this._oldClearColor), this.clearAlpha !== null && e.setClearAlpha(r), this.overrideMaterial !== null && (this.scene.overrideMaterial = n), e.autoClear = s;
  }
}, mn = {
  name: "LuminosityHighPassShader",
  uniforms: {
    tDiffuse: { value: null },
    luminosityThreshold: { value: 1 },
    smoothWidth: { value: 1 },
    defaultColor: { value: new le(0) },
    defaultOpacity: { value: 0 }
  },
  vertexShader: `

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
  fragmentShader: `

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`
}, ii = class Ft extends ue {
  constructor(t, i = 1, s, r) {
    super(), this.strength = i, this.radius = s, this.threshold = r, this.resolution = t !== void 0 ? new W(t.x, t.y) : new W(256, 256), this.clearColor = new le(0, 0, 0), this.needsSwap = !1, this.renderTargetsHorizontal = [], this.renderTargetsVertical = [], this.nMips = 5;
    let n = Math.round(this.resolution.x / 2), a = Math.round(this.resolution.y / 2);
    this.renderTargetBright = new X(n, a, { type: te }), this.renderTargetBright.texture.name = "UnrealBloomPass.bright", this.renderTargetBright.texture.generateMipmaps = !1;
    for (let h = 0; h < this.nMips; h++) {
      const u = new X(n, a, { type: te });
      u.texture.name = "UnrealBloomPass.h" + h, u.texture.generateMipmaps = !1, this.renderTargetsHorizontal.push(u);
      const d = new X(n, a, { type: te });
      d.texture.name = "UnrealBloomPass.v" + h, d.texture.generateMipmaps = !1, this.renderTargetsVertical.push(d), n = Math.round(n / 2), a = Math.round(a / 2);
    }
    const o = mn;
    this.highPassUniforms = Fe.clone(o.uniforms), this.highPassUniforms.luminosityThreshold.value = r, this.highPassUniforms.smoothWidth.value = 0.01, this.materialHighPassFilter = new Y({
      uniforms: this.highPassUniforms,
      vertexShader: o.vertexShader,
      fragmentShader: o.fragmentShader
    }), this.separableBlurMaterials = [];
    const l = [
      6,
      10,
      14,
      18,
      22
    ];
    n = Math.round(this.resolution.x / 2), a = Math.round(this.resolution.y / 2);
    for (let h = 0; h < this.nMips; h++)
      this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])), this.separableBlurMaterials[h].uniforms.invSize.value = new W(1 / n, 1 / a), n = Math.round(n / 2), a = Math.round(a / 2);
    this.compositeMaterial = this._getCompositeMaterial(this.nMips), this.compositeMaterial.uniforms.blurTexture1.value = this.renderTargetsVertical[0].texture, this.compositeMaterial.uniforms.blurTexture2.value = this.renderTargetsVertical[1].texture, this.compositeMaterial.uniforms.blurTexture3.value = this.renderTargetsVertical[2].texture, this.compositeMaterial.uniforms.blurTexture4.value = this.renderTargetsVertical[3].texture, this.compositeMaterial.uniforms.blurTexture5.value = this.renderTargetsVertical[4].texture, this.compositeMaterial.uniforms.bloomStrength.value = i, this.compositeMaterial.uniforms.bloomRadius.value = 0.1;
    const c = [
      1,
      0.8,
      0.6,
      0.4,
      0.2
    ];
    this.compositeMaterial.uniforms.bloomFactors.value = c, this.bloomTintColors = [
      new Ce(1, 1, 1),
      new Ce(1, 1, 1),
      new Ce(1, 1, 1),
      new Ce(1, 1, 1),
      new Ce(1, 1, 1)
    ], this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, this.copyUniforms = Fe.clone(rt.uniforms), this.blendMaterial = new Y({
      uniforms: this.copyUniforms,
      vertexShader: rt.vertexShader,
      fragmentShader: rt.fragmentShader,
      premultipliedAlpha: !0,
      blending: ps,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    }), this._oldClearColor = new le(), this._oldClearAlpha = 1, this._basic = new Or(), this._fsQuad = new Le(null);
  }
  dispose() {
    for (let t = 0; t < this.renderTargetsHorizontal.length; t++) this.renderTargetsHorizontal[t].dispose();
    for (let t = 0; t < this.renderTargetsVertical.length; t++) this.renderTargetsVertical[t].dispose();
    this.renderTargetBright.dispose();
    for (let t = 0; t < this.separableBlurMaterials.length; t++) this.separableBlurMaterials[t].dispose();
    this.compositeMaterial.dispose(), this.blendMaterial.dispose(), this._basic.dispose(), this._fsQuad.dispose();
  }
  setSize(t, i) {
    let s = Math.round(t / 2), r = Math.round(i / 2);
    this.renderTargetBright.setSize(s, r);
    for (let n = 0; n < this.nMips; n++)
      this.renderTargetsHorizontal[n].setSize(s, r), this.renderTargetsVertical[n].setSize(s, r), this.separableBlurMaterials[n].uniforms.invSize.value = new W(1 / s, 1 / r), s = Math.round(s / 2), r = Math.round(r / 2);
  }
  render(t, i, s, r, n) {
    t.getClearColor(this._oldClearColor), this._oldClearAlpha = t.getClearAlpha();
    const a = t.autoClear;
    t.autoClear = !1, t.setClearColor(this.clearColor, 0), n && t.state.buffers.stencil.setTest(!1), this.renderToScreen && (this._fsQuad.material = this._basic, this._basic.map = s.texture, t.setRenderTarget(null), t.clear(), this._fsQuad.render(t)), this.highPassUniforms.tDiffuse.value = s.texture, this.highPassUniforms.luminosityThreshold.value = this.threshold, this._fsQuad.material = this.materialHighPassFilter, t.setRenderTarget(this.renderTargetBright), t.clear(), this._fsQuad.render(t);
    let o = this.renderTargetBright;
    for (let l = 0; l < this.nMips; l++)
      this._fsQuad.material = this.separableBlurMaterials[l], this.separableBlurMaterials[l].uniforms.colorTexture.value = o.texture, this.separableBlurMaterials[l].uniforms.direction.value = Ft.BlurDirectionX, t.setRenderTarget(this.renderTargetsHorizontal[l]), t.clear(), this._fsQuad.render(t), this.separableBlurMaterials[l].uniforms.colorTexture.value = this.renderTargetsHorizontal[l].texture, this.separableBlurMaterials[l].uniforms.direction.value = Ft.BlurDirectionY, t.setRenderTarget(this.renderTargetsVertical[l]), t.clear(), this._fsQuad.render(t), o = this.renderTargetsVertical[l];
    this._fsQuad.material = this.compositeMaterial, this.compositeMaterial.uniforms.bloomStrength.value = this.strength, this.compositeMaterial.uniforms.bloomRadius.value = this.radius, this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, t.setRenderTarget(this.renderTargetsHorizontal[0]), t.clear(), this._fsQuad.render(t), this._fsQuad.material = this.blendMaterial, this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture, n && t.state.buffers.stencil.setTest(!0), this.renderToScreen ? (t.setRenderTarget(null), this._fsQuad.render(t)) : (t.setRenderTarget(s), this._fsQuad.render(t)), t.setClearColor(this._oldClearColor, this._oldClearAlpha), t.autoClear = a;
  }
  _getSeparableBlurMaterial(t) {
    const i = [], s = t / 3;
    for (let r = 0; r < t; r++) i.push(0.39894 * Math.exp(-0.5 * r * r / (s * s)) / s);
    return new Y({
      defines: { KERNEL_RADIUS: t },
      uniforms: {
        colorTexture: { value: null },
        invSize: { value: new W(0.5, 0.5) },
        direction: { value: new W(0.5, 0.5) },
        gaussianCoefficients: { value: i }
      },
      vertexShader: `

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,
      fragmentShader: `

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`
    });
  }
  _getCompositeMaterial(t) {
    return new Y({
      defines: { NUM_MIPS: t },
      uniforms: {
        blurTexture1: { value: null },
        blurTexture2: { value: null },
        blurTexture3: { value: null },
        blurTexture4: { value: null },
        blurTexture5: { value: null },
        bloomStrength: { value: 1 },
        bloomFactors: { value: null },
        bloomTintColors: { value: null },
        bloomRadius: { value: 0 }
      },
      vertexShader: `

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,
      fragmentShader: `

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`
    });
  }
};
ii.BlurDirectionX = new W(1, 0);
ii.BlurDirectionY = new W(0, 1);
var si = class et extends ue {
  constructor(t, i, s, r) {
    super(), this.renderScene = i, this.renderCamera = s, this.selectedObjects = r !== void 0 ? r : [], this.visibleEdgeColor = new le(1, 1, 1), this.hiddenEdgeColor = new le(0.1, 0.04, 0.02), this.edgeGlow = 0, this.usePatternTexture = !1, this.patternTexture = null, this.edgeThickness = 1, this.edgeStrength = 3, this.downSampleRatio = 2, this.pulsePeriod = 0, this._visibilityCache = /* @__PURE__ */ new Map(), this._selectionCache = /* @__PURE__ */ new Set(), this.resolution = t !== void 0 ? new W(t.x, t.y) : new W(256, 256);
    const n = Math.round(this.resolution.x / this.downSampleRatio), a = Math.round(this.resolution.y / this.downSampleRatio);
    this.renderTargetMaskBuffer = new X(this.resolution.x, this.resolution.y), this.renderTargetMaskBuffer.texture.name = "OutlinePass.mask", this.renderTargetMaskBuffer.texture.generateMipmaps = !1, this.depthMaterial = new Lr(), this.depthMaterial.side = Pi, this.depthMaterial.depthPacking = $r, this.depthMaterial.blending = zt, this.prepareMaskMaterial = this._getPrepareMaskMaterial(), this.prepareMaskMaterial.side = Pi, this.prepareMaskMaterial.fragmentShader = h(this.prepareMaskMaterial.fragmentShader, this.renderCamera), this.renderTargetDepthBuffer = new X(this.resolution.x, this.resolution.y, { type: te }), this.renderTargetDepthBuffer.texture.name = "OutlinePass.depth", this.renderTargetDepthBuffer.texture.generateMipmaps = !1, this.renderTargetMaskDownSampleBuffer = new X(n, a, { type: te }), this.renderTargetMaskDownSampleBuffer.texture.name = "OutlinePass.depthDownSample", this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = !1, this.renderTargetBlurBuffer1 = new X(n, a, { type: te }), this.renderTargetBlurBuffer1.texture.name = "OutlinePass.blur1", this.renderTargetBlurBuffer1.texture.generateMipmaps = !1, this.renderTargetBlurBuffer2 = new X(Math.round(n / 2), Math.round(a / 2), { type: te }), this.renderTargetBlurBuffer2.texture.name = "OutlinePass.blur2", this.renderTargetBlurBuffer2.texture.generateMipmaps = !1, this.edgeDetectionMaterial = this._getEdgeDetectionMaterial(), this.renderTargetEdgeBuffer1 = new X(n, a, { type: te }), this.renderTargetEdgeBuffer1.texture.name = "OutlinePass.edge1", this.renderTargetEdgeBuffer1.texture.generateMipmaps = !1, this.renderTargetEdgeBuffer2 = new X(Math.round(n / 2), Math.round(a / 2), { type: te }), this.renderTargetEdgeBuffer2.texture.name = "OutlinePass.edge2", this.renderTargetEdgeBuffer2.texture.generateMipmaps = !1;
    const o = 4, l = 4;
    this.separableBlurMaterial1 = this._getSeparableBlurMaterial(o), this.separableBlurMaterial1.uniforms.texSize.value.set(n, a), this.separableBlurMaterial1.uniforms.kernelRadius.value = 1, this.separableBlurMaterial2 = this._getSeparableBlurMaterial(l), this.separableBlurMaterial2.uniforms.texSize.value.set(Math.round(n / 2), Math.round(a / 2)), this.separableBlurMaterial2.uniforms.kernelRadius.value = l, this.overlayMaterial = this._getOverlayMaterial();
    const c = rt;
    this.copyUniforms = Fe.clone(c.uniforms), this.materialCopy = new Y({
      uniforms: this.copyUniforms,
      vertexShader: c.vertexShader,
      fragmentShader: c.fragmentShader,
      blending: zt,
      depthTest: !1,
      depthWrite: !1
    }), this.enabled = !0, this.needsSwap = !1, this._oldClearColor = new le(), this.oldClearAlpha = 1, this._fsQuad = new Le(null), this.tempPulseColor1 = new le(), this.tempPulseColor2 = new le(), this.textureMatrix = new Ir();
    function h(u, d) {
      const g = d.isPerspectiveCamera ? "perspective" : "orthographic";
      return u.replace(/DEPTH_TO_VIEW_Z/g, g + "DepthToViewZ");
    }
  }
  dispose() {
    this.renderTargetMaskBuffer.dispose(), this.renderTargetDepthBuffer.dispose(), this.renderTargetMaskDownSampleBuffer.dispose(), this.renderTargetBlurBuffer1.dispose(), this.renderTargetBlurBuffer2.dispose(), this.renderTargetEdgeBuffer1.dispose(), this.renderTargetEdgeBuffer2.dispose(), this.depthMaterial.dispose(), this.prepareMaskMaterial.dispose(), this.edgeDetectionMaterial.dispose(), this.separableBlurMaterial1.dispose(), this.separableBlurMaterial2.dispose(), this.overlayMaterial.dispose(), this.materialCopy.dispose(), this._fsQuad.dispose();
  }
  setSize(t, i) {
    this.renderTargetMaskBuffer.setSize(t, i), this.renderTargetDepthBuffer.setSize(t, i);
    let s = Math.round(t / this.downSampleRatio), r = Math.round(i / this.downSampleRatio);
    this.renderTargetMaskDownSampleBuffer.setSize(s, r), this.renderTargetBlurBuffer1.setSize(s, r), this.renderTargetEdgeBuffer1.setSize(s, r), this.separableBlurMaterial1.uniforms.texSize.value.set(s, r), s = Math.round(s / 2), r = Math.round(r / 2), this.renderTargetBlurBuffer2.setSize(s, r), this.renderTargetEdgeBuffer2.setSize(s, r), this.separableBlurMaterial2.uniforms.texSize.value.set(s, r);
  }
  render(t, i, s, r, n) {
    if (this.selectedObjects.length > 0) {
      t.getClearColor(this._oldClearColor), this.oldClearAlpha = t.getClearAlpha();
      const a = t.autoClear;
      t.autoClear = !1, n && t.state.buffers.stencil.setTest(!1), t.setClearColor(16777215, 1), this._updateSelectionCache(), this._changeVisibilityOfSelectedObjects(!1);
      const o = this.renderScene.background, l = this.renderScene.overrideMaterial;
      if (this.renderScene.background = null, this.renderScene.overrideMaterial = this.depthMaterial, t.setRenderTarget(this.renderTargetDepthBuffer), t.clear(), t.render(this.renderScene, this.renderCamera), this._changeVisibilityOfSelectedObjects(!0), this._visibilityCache.clear(), this._updateTextureMatrix(), this._changeVisibilityOfNonSelectedObjects(!1), this.renderScene.overrideMaterial = this.prepareMaskMaterial, this.prepareMaskMaterial.uniforms.cameraNearFar.value.set(this.renderCamera.near, this.renderCamera.far), this.prepareMaskMaterial.uniforms.depthTexture.value = this.renderTargetDepthBuffer.texture, this.prepareMaskMaterial.uniforms.textureMatrix.value = this.textureMatrix, t.setRenderTarget(this.renderTargetMaskBuffer), t.clear(), t.render(this.renderScene, this.renderCamera), this._changeVisibilityOfNonSelectedObjects(!0), this._visibilityCache.clear(), this._selectionCache.clear(), this.renderScene.background = o, this.renderScene.overrideMaterial = l, this._fsQuad.material = this.materialCopy, this.copyUniforms.tDiffuse.value = this.renderTargetMaskBuffer.texture, t.setRenderTarget(this.renderTargetMaskDownSampleBuffer), t.clear(), this._fsQuad.render(t), this.tempPulseColor1.copy(this.visibleEdgeColor), this.tempPulseColor2.copy(this.hiddenEdgeColor), this.pulsePeriod > 0) {
        const c = 0.625 + Math.cos(performance.now() * 0.01 / this.pulsePeriod) * 0.75 / 2;
        this.tempPulseColor1.multiplyScalar(c), this.tempPulseColor2.multiplyScalar(c);
      }
      this._fsQuad.material = this.edgeDetectionMaterial, this.edgeDetectionMaterial.uniforms.maskTexture.value = this.renderTargetMaskDownSampleBuffer.texture, this.edgeDetectionMaterial.uniforms.texSize.value.set(this.renderTargetMaskDownSampleBuffer.width, this.renderTargetMaskDownSampleBuffer.height), this.edgeDetectionMaterial.uniforms.visibleEdgeColor.value = this.tempPulseColor1, this.edgeDetectionMaterial.uniforms.hiddenEdgeColor.value = this.tempPulseColor2, t.setRenderTarget(this.renderTargetEdgeBuffer1), t.clear(), this._fsQuad.render(t), this._fsQuad.material = this.separableBlurMaterial1, this.separableBlurMaterial1.uniforms.colorTexture.value = this.renderTargetEdgeBuffer1.texture, this.separableBlurMaterial1.uniforms.direction.value = et.BlurDirectionX, this.separableBlurMaterial1.uniforms.kernelRadius.value = this.edgeThickness, t.setRenderTarget(this.renderTargetBlurBuffer1), t.clear(), this._fsQuad.render(t), this.separableBlurMaterial1.uniforms.colorTexture.value = this.renderTargetBlurBuffer1.texture, this.separableBlurMaterial1.uniforms.direction.value = et.BlurDirectionY, t.setRenderTarget(this.renderTargetEdgeBuffer1), t.clear(), this._fsQuad.render(t), this._fsQuad.material = this.separableBlurMaterial2, this.separableBlurMaterial2.uniforms.colorTexture.value = this.renderTargetEdgeBuffer1.texture, this.separableBlurMaterial2.uniforms.direction.value = et.BlurDirectionX, t.setRenderTarget(this.renderTargetBlurBuffer2), t.clear(), this._fsQuad.render(t), this.separableBlurMaterial2.uniforms.colorTexture.value = this.renderTargetBlurBuffer2.texture, this.separableBlurMaterial2.uniforms.direction.value = et.BlurDirectionY, t.setRenderTarget(this.renderTargetEdgeBuffer2), t.clear(), this._fsQuad.render(t), this._fsQuad.material = this.overlayMaterial, this.overlayMaterial.uniforms.maskTexture.value = this.renderTargetMaskBuffer.texture, this.overlayMaterial.uniforms.edgeTexture1.value = this.renderTargetEdgeBuffer1.texture, this.overlayMaterial.uniforms.edgeTexture2.value = this.renderTargetEdgeBuffer2.texture, this.overlayMaterial.uniforms.patternTexture.value = this.patternTexture, this.overlayMaterial.uniforms.edgeStrength.value = this.edgeStrength, this.overlayMaterial.uniforms.edgeGlow.value = this.edgeGlow, this.overlayMaterial.uniforms.usePatternTexture.value = this.usePatternTexture, n && t.state.buffers.stencil.setTest(!0), t.setRenderTarget(s), this._fsQuad.render(t), t.setClearColor(this._oldClearColor, this.oldClearAlpha), t.autoClear = a;
    }
    this.renderToScreen && (this._fsQuad.material = this.materialCopy, this.copyUniforms.tDiffuse.value = s.texture, t.setRenderTarget(null), this._fsQuad.render(t));
  }
  _updateSelectionCache() {
    const t = this._selectionCache;
    function i(s) {
      s.isMesh && t.add(s);
    }
    t.clear();
    for (let s = 0; s < this.selectedObjects.length; s++) this.selectedObjects[s].traverse(i);
  }
  _changeVisibilityOfSelectedObjects(t) {
    const i = this._visibilityCache;
    for (const s of this._selectionCache) t === !0 ? s.visible = i.get(s) : (i.set(s, s.visible), s.visible = t);
  }
  _changeVisibilityOfNonSelectedObjects(t) {
    const i = this._visibilityCache, s = this._selectionCache;
    function r(n) {
      if (n.isPoints || n.isLine || n.isLine2) t === !0 ? n.visible = i.get(n) : (i.set(n, n.visible), n.visible = t);
      else if ((n.isMesh || n.isSprite) && !s.has(n)) {
        const a = n.visible;
        (t === !1 || i.get(n) === !0) && (n.visible = t), i.set(n, a);
      }
    }
    this.renderScene.traverse(r);
  }
  _updateTextureMatrix() {
    this.textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1), this.textureMatrix.multiply(this.renderCamera.projectionMatrix), this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse);
  }
  _getPrepareMaskMaterial() {
    return new Y({
      uniforms: {
        depthTexture: { value: null },
        cameraNearFar: { value: new W(0.5, 0.5) },
        textureMatrix: { value: null }
      },
      vertexShader: `#include <batching_pars_vertex>
				#include <morphtarget_pars_vertex>
				#include <skinning_pars_vertex>

				varying vec4 projTexCoord;
				varying vec4 vPosition;
				uniform mat4 textureMatrix;

				void main() {

					#include <batching_vertex>
					#include <skinbase_vertex>
					#include <begin_vertex>
					#include <morphtarget_vertex>
					#include <skinning_vertex>
					#include <project_vertex>

					vPosition = mvPosition;

					vec4 worldPosition = vec4( transformed, 1.0 );

					#ifdef USE_INSTANCING

						worldPosition = instanceMatrix * worldPosition;

					#endif

					worldPosition = modelMatrix * worldPosition;

					projTexCoord = textureMatrix * worldPosition;

				}`,
      fragmentShader: `#include <packing>
				varying vec4 vPosition;
				varying vec4 projTexCoord;
				uniform sampler2D depthTexture;
				uniform vec2 cameraNearFar;

				void main() {

					float depth = unpackRGBAToDepth(texture2DProj( depthTexture, projTexCoord ));
					float viewZ = - DEPTH_TO_VIEW_Z( depth, cameraNearFar.x, cameraNearFar.y );
					float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;
					gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);

				}`
    });
  }
  _getEdgeDetectionMaterial() {
    return new Y({
      uniforms: {
        maskTexture: { value: null },
        texSize: { value: new W(0.5, 0.5) },
        visibleEdgeColor: { value: new Ce(1, 1, 1) },
        hiddenEdgeColor: { value: new Ce(1, 1, 1) }
      },
      vertexShader: `varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `varying vec2 vUv;

				uniform sampler2D maskTexture;
				uniform vec2 texSize;
				uniform vec3 visibleEdgeColor;
				uniform vec3 hiddenEdgeColor;

				void main() {
					vec2 invSize = 1.0 / texSize;
					vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);
					vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);
					vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);
					vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);
					vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);
					float diff1 = (c1.r - c2.r)*0.5;
					float diff2 = (c3.r - c4.r)*0.5;
					float d = length( vec2(diff1, diff2) );
					float a1 = min(c1.g, c2.g);
					float a2 = min(c3.g, c4.g);
					float visibilityFactor = min(a1, a2);
					vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;
					gl_FragColor = vec4(edgeColor, 1.0) * vec4(d);
				}`
    });
  }
  _getSeparableBlurMaterial(t) {
    return new Y({
      defines: { MAX_RADIUS: t },
      uniforms: {
        colorTexture: { value: null },
        texSize: { value: new W(0.5, 0.5) },
        direction: { value: new W(0.5, 0.5) },
        kernelRadius: { value: 1 }
      },
      vertexShader: `varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 texSize;
				uniform vec2 direction;
				uniform float kernelRadius;

				float gaussianPdf(in float x, in float sigma) {
					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
				}

				void main() {
					vec2 invSize = 1.0 / texSize;
					float sigma = kernelRadius/2.0;
					float weightSum = gaussianPdf(0.0, sigma);
					vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;
					vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);
					vec2 uvOffset = delta;
					for( int i = 1; i <= MAX_RADIUS; i ++ ) {
						float x = kernelRadius * float(i) / float(MAX_RADIUS);
						float w = gaussianPdf(x, sigma);
						vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);
						vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);
						diffuseSum += ((sample1 + sample2) * w);
						weightSum += (2.0 * w);
						uvOffset += delta;
					}
					gl_FragColor = diffuseSum/weightSum;
				}`
    });
  }
  _getOverlayMaterial() {
    return new Y({
      uniforms: {
        maskTexture: { value: null },
        edgeTexture1: { value: null },
        edgeTexture2: { value: null },
        patternTexture: { value: null },
        edgeStrength: { value: 1 },
        edgeGlow: { value: 1 },
        usePatternTexture: { value: 0 }
      },
      vertexShader: `varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
      fragmentShader: `varying vec2 vUv;

				uniform sampler2D maskTexture;
				uniform sampler2D edgeTexture1;
				uniform sampler2D edgeTexture2;
				uniform sampler2D patternTexture;
				uniform float edgeStrength;
				uniform float edgeGlow;
				uniform bool usePatternTexture;

				void main() {
					vec4 edgeValue1 = texture2D(edgeTexture1, vUv);
					vec4 edgeValue2 = texture2D(edgeTexture2, vUv);
					vec4 maskColor = texture2D(maskTexture, vUv);
					vec4 patternColor = texture2D(patternTexture, 6.0 * vUv);
					float visibilityFactor = 1.0 - maskColor.g > 0.0 ? 1.0 : 0.5;
					vec4 edgeValue = edgeValue1 + edgeValue2 * edgeGlow;
					vec4 finalColor = edgeStrength * maskColor.r * edgeValue;
					if(usePatternTexture)
						finalColor += + visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);
					gl_FragColor = finalColor;
				}`,
      blending: ps,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    });
  }
};
si.BlurDirectionX = new W(1, 0);
si.BlurDirectionY = new W(0, 1);
var gn = {
  name: "FilmShader",
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    intensity: { value: 0.5 },
    grayscale: { value: !1 }
  },
  vertexShader: `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
  fragmentShader: `

		#include <common>

		uniform float intensity;
		uniform bool grayscale;
		uniform float time;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 base = texture2D( tDiffuse, vUv );

			float noise = rand( fract( vUv + time ) );

			vec3 color = base.rgb + base.rgb * clamp( 0.1 + noise, 0.0, 1.0 );

			color = mix( base.rgb, color, intensity );

			if ( grayscale ) {

				color = vec3( luminance( color ) ); // assuming linear-srgb

			}

			gl_FragColor = vec4( color, base.a );

		}`
}, yn = class extends ue {
  constructor(e = 0.5, t = !1) {
    super();
    const i = gn;
    this.uniforms = Fe.clone(i.uniforms), this.material = new Y({
      name: i.name,
      uniforms: this.uniforms,
      vertexShader: i.vertexShader,
      fragmentShader: i.fragmentShader
    }), this.uniforms.intensity.value = e, this.uniforms.grayscale.value = t, this._fsQuad = new Le(this.material);
  }
  render(e, t, i, s) {
    this.uniforms.tDiffuse.value = i.texture, this.uniforms.time.value += s, this.renderToScreen ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(t), this.clear && e.clear(), this._fsQuad.render(e));
  }
  dispose() {
    this.material.dispose(), this._fsQuad.dispose();
  }
}, vn = class extends ue {
  constructor(e, t, i, s = {}) {
    super(), this.pixelSize = e, this.scene = t, this.camera = i, this.normalEdgeStrength = s.normalEdgeStrength || 0.3, this.depthEdgeStrength = s.depthEdgeStrength || 0.4, this.pixelatedMaterial = this._createPixelatedMaterial(), this._resolution = new W(), this._renderResolution = new W(), this._normalMaterial = new Ur(), this._beautyRenderTarget = new X(), this._beautyRenderTarget.texture.minFilter = dt, this._beautyRenderTarget.texture.magFilter = dt, this._beautyRenderTarget.texture.type = te, this._beautyRenderTarget.depthTexture = new Rr(), this._normalRenderTarget = new X(), this._normalRenderTarget.texture.minFilter = dt, this._normalRenderTarget.texture.magFilter = dt, this._normalRenderTarget.texture.type = te, this._fsQuad = new Le(this.pixelatedMaterial);
  }
  dispose() {
    this._beautyRenderTarget.dispose(), this._normalRenderTarget.dispose(), this.pixelatedMaterial.dispose(), this._normalMaterial.dispose(), this._fsQuad.dispose();
  }
  setSize(e, t) {
    this._resolution.set(e, t), this._renderResolution.set(e / this.pixelSize | 0, t / this.pixelSize | 0);
    const { x: i, y: s } = this._renderResolution;
    this._beautyRenderTarget.setSize(i, s), this._normalRenderTarget.setSize(i, s), this._fsQuad.material.uniforms.resolution.value.set(i, s, 1 / i, 1 / s);
  }
  setPixelSize(e) {
    this.pixelSize = e, this.setSize(this._resolution.x, this._resolution.y);
  }
  render(e, t) {
    const i = this._fsQuad.material.uniforms;
    i.normalEdgeStrength.value = this.normalEdgeStrength, i.depthEdgeStrength.value = this.depthEdgeStrength, e.setRenderTarget(this._beautyRenderTarget), e.render(this.scene, this.camera);
    const s = this.scene.overrideMaterial;
    e.setRenderTarget(this._normalRenderTarget), this.scene.overrideMaterial = this._normalMaterial, e.render(this.scene, this.camera), this.scene.overrideMaterial = s, i.tDiffuse.value = this._beautyRenderTarget.texture, i.tDepth.value = this._beautyRenderTarget.depthTexture, i.tNormal.value = this._normalRenderTarget.texture, this.renderToScreen ? e.setRenderTarget(null) : (e.setRenderTarget(t), this.clear && e.clear()), this._fsQuad.render(e);
  }
  _createPixelatedMaterial() {
    return new Y({
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        tNormal: { value: null },
        resolution: { value: new Xr() },
        normalEdgeStrength: { value: 0 },
        depthEdgeStrength: { value: 0 }
      },
      vertexShader: `
				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,
      fragmentShader: `
				uniform sampler2D tDiffuse;
				uniform sampler2D tDepth;
				uniform sampler2D tNormal;
				uniform vec4 resolution;
				uniform float normalEdgeStrength;
				uniform float depthEdgeStrength;
				varying vec2 vUv;

				float getDepth(int x, int y) {

					return texture2D( tDepth, vUv + vec2(x, y) * resolution.zw ).r;

				}

				vec3 getNormal(int x, int y) {

					return texture2D( tNormal, vUv + vec2(x, y) * resolution.zw ).rgb * 2.0 - 1.0;

				}

				float depthEdgeIndicator(float depth, vec3 normal) {

					float diff = 0.0;
					diff += clamp(getDepth(1, 0) - depth, 0.0, 1.0);
					diff += clamp(getDepth(-1, 0) - depth, 0.0, 1.0);
					diff += clamp(getDepth(0, 1) - depth, 0.0, 1.0);
					diff += clamp(getDepth(0, -1) - depth, 0.0, 1.0);
					return floor(smoothstep(0.01, 0.02, diff) * 2.) / 2.;

				}

				float neighborNormalEdgeIndicator(int x, int y, float depth, vec3 normal) {

					float depthDiff = getDepth(x, y) - depth;
					vec3 neighborNormal = getNormal(x, y);

					// Edge pixels should yield to faces who's normals are closer to the bias normal.
					vec3 normalEdgeBias = vec3(1., 1., 1.); // This should probably be a parameter.
					float normalDiff = dot(normal - neighborNormal, normalEdgeBias);
					float normalIndicator = clamp(smoothstep(-.01, .01, normalDiff), 0.0, 1.0);

					// Only the shallower pixel should detect the normal edge.
					float depthIndicator = clamp(sign(depthDiff * .25 + .0025), 0.0, 1.0);

					return (1.0 - dot(normal, neighborNormal)) * depthIndicator * normalIndicator;

				}

				float normalEdgeIndicator(float depth, vec3 normal) {

					float indicator = 0.0;

					indicator += neighborNormalEdgeIndicator(0, -1, depth, normal);
					indicator += neighborNormalEdgeIndicator(0, 1, depth, normal);
					indicator += neighborNormalEdgeIndicator(-1, 0, depth, normal);
					indicator += neighborNormalEdgeIndicator(1, 0, depth, normal);

					return step(0.1, indicator);

				}

				void main() {

					vec4 texel = texture2D( tDiffuse, vUv );

					float depth = 0.0;
					vec3 normal = vec3(0.0);

					if (depthEdgeStrength > 0.0 || normalEdgeStrength > 0.0) {

						depth = getDepth(0, 0);
						normal = getNormal(0, 0);

					}

					float dei = 0.0;
					if (depthEdgeStrength > 0.0)
						dei = depthEdgeIndicator(depth, normal);

					float nei = 0.0;
					if (normalEdgeStrength > 0.0)
						nei = normalEdgeIndicator(depth, normal);

					float Strength = dei > 0.0 ? (1.0 - depthEdgeStrength * dei) : (1.0 + normalEdgeStrength * nei);

					gl_FragColor = texel * Strength;

				}
			`
    });
  }
}, ft = {
  name: "OutputShader",
  uniforms: {
    tDiffuse: { value: null },
    toneMappingExposure: { value: 1 }
  },
  vertexShader: `
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
  fragmentShader: `

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`
}, xn = class extends ue {
  constructor() {
    super(), this.isOutputPass = !0, this.uniforms = Fe.clone(ft.uniforms), this.material = new Kr({
      name: ft.name,
      uniforms: this.uniforms,
      vertexShader: ft.vertexShader,
      fragmentShader: ft.fragmentShader
    }), this._fsQuad = new Le(this.material), this._outputColorSpace = null, this._toneMapping = null;
  }
  render(e, t, i) {
    this.uniforms.tDiffuse.value = i.texture, this.uniforms.toneMappingExposure.value = e.toneMappingExposure, (this._outputColorSpace !== e.outputColorSpace || this._toneMapping !== e.toneMapping) && (this._outputColorSpace = e.outputColorSpace, this._toneMapping = e.toneMapping, this.material.defines = {}, Vr.getTransfer(this._outputColorSpace) === jr && (this.material.defines.SRGB_TRANSFER = ""), this._toneMapping === Fr ? this.material.defines.LINEAR_TONE_MAPPING = "" : this._toneMapping === Hr ? this.material.defines.REINHARD_TONE_MAPPING = "" : this._toneMapping === zr ? this.material.defines.CINEON_TONE_MAPPING = "" : this._toneMapping === Br ? this.material.defines.ACES_FILMIC_TONE_MAPPING = "" : this._toneMapping === kr ? this.material.defines.AGX_TONE_MAPPING = "" : this._toneMapping === Wr ? this.material.defines.NEUTRAL_TONE_MAPPING = "" : this._toneMapping === Dr && (this.material.defines.CUSTOM_TONE_MAPPING = ""), this.material.needsUpdate = !0), this.renderToScreen === !0 ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(t), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this._fsQuad.render(e));
  }
  dispose() {
    this.material.dispose(), this._fsQuad.dispose();
  }
}, bn = class {
  renderer;
  scene;
  camera;
  composer;
  renderPass;
  bloomPass;
  outlinePass;
  filmPass;
  pixelatedPass;
  outputPass;
  enabled = !1;
  constructor(e, t, i) {
    this.renderer = e, this.scene = t, this.camera = i, this.composer = new pn(e), this.renderPass = new fn(t, i), this.composer.addPass(this.renderPass), this.pixelatedPass = new vn(6, t, i), this.pixelatedPass.enabled = !1, this.composer.addPass(this.pixelatedPass), this.outlinePass = new si(new f.Vector2(window.innerWidth, window.innerHeight), t, i), this.outlinePass.edgeStrength = 3, this.outlinePass.edgeGlow = 0.5, this.outlinePass.edgeThickness = 1, this.outlinePass.visibleEdgeColor.set("#ffffff"), this.outlinePass.hiddenEdgeColor.set("#222222"), this.outlinePass.enabled = !1, this.composer.addPass(this.outlinePass), this.bloomPass = new ii(new f.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85), this.bloomPass.enabled = !1, this.composer.addPass(this.bloomPass), this.filmPass = new yn(), this.filmPass.enabled = !1, this.composer.addPass(this.filmPass), this.outputPass = new xn(), this.composer.addPass(this.outputPass), window.addEventListener("resize", () => {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  render(e) {
    this.enabled ? this.composer.render(e) : this.renderer.render(this.scene, this.camera);
  }
  toggleBloom(e, t = 1.5) {
    this.bloomPass.enabled = e, this.bloomPass.strength = t, this.checkEnabled();
  }
  toggleFilmGrain(e) {
    this.filmPass.enabled = e, this.checkEnabled();
  }
  togglePixelation(e, t = 6) {
    this.pixelatedPass.enabled = e, this.pixelatedPass.setPixelSize(t), this.checkEnabled();
  }
  setSelectionOutline(e, t = "#ffffff") {
    e.length > 0 ? (this.outlinePass.enabled = !0, this.outlinePass.selectedObjects = e, this.outlinePass.visibleEdgeColor.set(t), this.enabled = !0) : (this.outlinePass.enabled = !1, this.outlinePass.selectedObjects = [], this.checkEnabled());
  }
  checkEnabled() {
    this.enabled = this.bloomPass.enabled || this.filmPass.enabled || this.pixelatedPass.enabled || this.outlinePass.enabled;
  }
}, wn = class {
  renderer;
  scene;
  camera;
  postProcessing;
  config = {
    bloom: !1,
    bloomIntensity: 0.5,
    vignette: !0,
    vignetteDarkness: 0.4,
    colorGrading: "vibrant",
    exposure: 1.1
  };
  metrics = {
    fps: 60,
    frameTimeMs: 16.6,
    cpuRenderMs: 2.1,
    cpuPhysicsMs: 0.5,
    cpuAiMs: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    jsHeapMb: 0
  };
  lastTime = performance.now();
  frameCount = 0;
  fpsTimer = 0;
  constructor(e, t, i) {
    this.renderer = e, this.scene = t, this.camera = i, this.postProcessing = new bn(this.renderer, this.scene, this.camera), this.setupRendererDefaults();
  }
  setupRendererDefaults() {
    this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = f.PCFSoftShadowMap;
    const e = typeof window < "u" ? Math.min(window.devicePixelRatio, 1.5) : 1;
    this.renderer.setPixelRatio(e), this.renderer.toneMapping = f.ACESFilmicToneMapping, this.renderer.toneMappingExposure = this.config.exposure;
  }
  setToneMappingExposure(e) {
    this.config.exposure = e, this.renderer.toneMappingExposure = e;
  }
  currentSun = null;
  currentAmbient = null;
  setupLighting(e) {
    this.currentSun && (this.scene.remove(this.currentSun), this.currentSun.shadow && this.currentSun.shadow.map && this.currentSun.shadow.map.dispose()), this.currentAmbient && this.scene.remove(this.currentAmbient);
    const t = e.sunColor ?? 16774634, i = e.sunIntensity ?? 2.5, s = new f.DirectionalLight(t, i);
    s.position.set(...e.sunPosition ?? [
      -15,
      30,
      -15
    ]), s.castShadow = !0;
    const r = e.shadowMapSize ?? 1024;
    s.shadow.mapSize.width = r, s.shadow.mapSize.height = r, s.shadow.camera.near = 0.5, s.shadow.camera.far = 80, s.shadow.camera.left = -30, s.shadow.camera.right = 30, s.shadow.camera.top = 30, s.shadow.camera.bottom = -30, s.shadow.bias = -5e-4;
    const n = e.ambientColor ?? 14544639, a = e.ambientIntensity ?? 0.8, o = new f.AmbientLight(n, a);
    return this.scene.add(s), this.scene.add(o), this.currentSun = s, this.currentAmbient = o, {
      sun: s,
      ambient: o
    };
  }
  render() {
    const e = performance.now(), t = e - this.lastTime;
    this.lastTime = e, this.frameCount++, this.fpsTimer += t, this.fpsTimer >= 1e3 && (this.metrics.fps = Math.round(this.frameCount * 1e3 / this.fpsTimer), this.metrics.frameTimeMs = parseFloat((1e3 / this.metrics.fps).toFixed(2)), this.frameCount = 0, this.fpsTimer = 0);
    const i = performance.now();
    this.postProcessing.render(t / 1e3), this.metrics.cpuRenderMs = parseFloat((performance.now() - i).toFixed(2));
    const s = this.renderer.info;
    this.metrics.drawCalls = s.render.calls, this.metrics.triangles = s.render.triangles, this.metrics.geometries = s.memory.geometries, this.metrics.textures = s.memory.textures, typeof performance < "u" && performance.memory && (this.metrics.jsHeapMb = parseFloat((performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1)));
  }
}, vc = class {
  static projScreenMatrix = new f.Matrix4();
  static frustum = new f.Frustum();
  static bbox = new f.Box3();
  static cullScene(e, t) {
    this.projScreenMatrix.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
    let i = 0, s = 0;
    return e.traverse((r) => {
      if (r.isMesh && r.visible) {
        const n = r;
        if (!n.geometry) return;
        n.geometry.boundingBox || n.geometry.computeBoundingBox(), n.geometry.boundingBox && (this.bbox.copy(n.geometry.boundingBox).applyMatrix4(n.matrixWorld), this.frustum.intersectsBox(this.bbox) ? i++ : s++);
      }
    }), {
      visibleCount: i,
      culledCount: s
    };
  }
};
function de(e, t = {}) {
  const i = t.material ?? new f.MeshStandardMaterial({
    color: t.color ?? 16777215,
    roughness: t.roughness ?? 0.6,
    metalness: t.metalness ?? 0.1,
    emissive: t.emissive ?? 0,
    emissiveIntensity: t.emissiveIntensity ?? 1,
    side: t.side ?? f.FrontSide,
    ...t.transparent !== void 0 ? {
      transparent: t.transparent,
      opacity: t.opacity ?? 1
    } : {}
  }), s = new f.Mesh(e, i);
  return t.position && s.position.set(...t.position), t.rotation && s.rotation.set(...t.rotation), t.scale && s.scale.set(...t.scale), s.castShadow = t.castShadow ?? !0, s.receiveShadow = t.receiveShadow ?? !0, s;
}
function xc(e, t) {
  return de(new f.BoxGeometry(...e), t);
}
function bc(e, t) {
  return de(new f.SphereGeometry(e, t?.castShadow === !1 ? 16 : 32, 16), t);
}
function wc(e, t, i) {
  const s = de(new f.PlaneGeometry(e, t, 1, 1), i);
  return s.rotation.x = -Math.PI / 2, i?.rotation && s.rotation.set(...i.rotation), s;
}
function Sc(e, t, i, s) {
  return de(new f.CylinderGeometry(e, t, i, 24), s);
}
function Tc(e, t, i) {
  return de(new f.ConeGeometry(e, t, 24), i);
}
function Mc(e, t, i) {
  return de(new f.TorusGeometry(e, t, 16, 48), i);
}
function Cc(e, t, i) {
  return de(new f.CapsuleGeometry(e, t, 8, 16), i);
}
function _c(e, t = 1, i) {
  return de(new f.IcosahedronGeometry(e, t), i);
}
function Ac(e, t = 0, i) {
  return de(new f.DodecahedronGeometry(e, t), i);
}
function Ri(e, t, i, s, r) {
  let n = 0, a = 1, o = 1, l = 0;
  for (let c = 0; c < s; c++)
    n += e.noise2D(t * a, i * a) * o, l += o, o *= r, a *= 2;
  return (n / l + 1) / 2;
}
function Sn(e = {}) {
  const t = e.size ?? 100, i = e.segments ?? 128, s = e.seed ?? 1337, r = e.amplitude ?? 6, n = e.frequency ?? 0.08, a = e.octaves ?? 5, o = e.persistence ?? 0.5, l = e.position ?? [
    0,
    0,
    0
  ], c = new Zl(s), h = new f.PlaneGeometry(t, t, i, i);
  h.rotateX(-Math.PI / 2);
  const u = h.attributes.position, d = [], g = new Float32Array(u.count * 3), p = new f.Color(e.color ?? 4881471), y = new f.Color(e.highColor ?? 9416299);
  for (let v = 0; v < u.count; v++) {
    const b = u.getX(v), S = u.getZ(v), C = Ri(c, b * n, S * n, a, o);
    u.setY(v, C * r);
    const w = Math.floor((S + t / 2) / t * i);
    d[w] || (d[w] = []), d[w][Math.floor((b + t / 2) / t * i)] = C;
    const _ = p.clone().lerp(y, C);
    g[v * 3] = _.r, g[v * 3 + 1] = _.g, g[v * 3 + 2] = _.b;
  }
  u.needsUpdate = !0, h.setAttribute("color", new f.BufferAttribute(g, 3)), h.computeVertexNormals();
  const m = new f.MeshStandardMaterial({
    vertexColors: !0,
    roughness: e.roughness ?? 0.95,
    metalness: e.metalness ?? 0,
    wireframe: e.wireframe ?? !1
  }), x = new f.Mesh(h, m);
  return x.position.set(...l), x.castShadow = !0, x.receiveShadow = !0, x.name = "Terrain", {
    mesh: x,
    geometry: h,
    heightAt: (v, b) => Ri(c, (v - l[0]) * n, (b - l[2]) * n, a, o) * r + l[1],
    heights: d
  };
}
function Pc(e = {}) {
  const t = e.count ?? 2e3, i = e.area ?? 40, [s, r] = e.height ?? [0.5, 1.2], n = e.width ?? 0.12, a = e.seed ?? 1, o = e.position ?? [
    0,
    0,
    0
  ], l = e.heightAt ?? null, c = new ut(a), h = new f.PlaneGeometry(n, 1, 1, 1);
  h.translate(0, 0.5, 0);
  const u = new f.Color(e.color ?? 5020223), d = new f.Color(e.tipColor ?? 9426016), g = new Float32Array(h.attributes.position.count * 3);
  for (let A = 0; A < h.attributes.position.count; A++) {
    const v = h.attributes.position.getY(A), b = u.clone().lerp(d, v);
    g[A * 3] = b.r, g[A * 3 + 1] = b.g, g[A * 3 + 2] = b.b;
  }
  h.setAttribute("color", new f.BufferAttribute(g, 3));
  const p = new f.MeshStandardMaterial({
    vertexColors: !0,
    side: f.DoubleSide,
    roughness: 1
  }), y = new f.InstancedMesh(h, p, t);
  y.position.set(...o), y.castShadow = e.castShadow ?? !1;
  const m = i / 2, x = new f.Object3D();
  for (let A = 0; A < t; A++) {
    const v = c.nextFloat(-m, m), b = c.nextFloat(-m, m), S = c.nextFloat(s, r), C = l ? l(v + o[0], b + o[2]) - o[1] : 0;
    x.position.set(v, C - 0.03, b), x.rotation.set(0, c.nextFloat(0, Math.PI), c.nextFloat(-0.2, 0.2)), x.scale.set(c.nextFloat(0.7, 1.3), S, 1), x.updateMatrix(), y.setMatrixAt(A, x.matrix);
  }
  return y.instanceMatrix.needsUpdate = !0, y;
}
function Bc(e = {}) {
  const t = e.position ?? [
    0,
    0,
    0
  ], i = e.scale ?? 1, s = (e.trunkHeight ?? 2.2) * i, r = (e.trunkRadius ?? 0.25) * i, n = (e.canopyRadius ?? 1.5) * i, a = new ut(e.seed ?? Math.floor(Math.random() * 99999)), o = new f.Group();
  o.position.set(...t);
  const l = new f.Mesh(new f.CylinderGeometry(r * 0.8, r, s, 8), new f.MeshStandardMaterial({
    color: e.trunkColor ?? 7031339,
    roughness: 1
  }));
  l.position.y = s / 2, l.castShadow = !0, o.add(l);
  const c = new f.MeshStandardMaterial({
    color: e.canopyColor ?? 3963438,
    roughness: 0.9
  }), h = new f.Mesh(new f.DodecahedronGeometry(n, 1), c);
  h.position.y = s + n * 0.6, h.castShadow = !0, o.add(h);
  const u = new f.Mesh(new f.IcosahedronGeometry(n * 0.55, 1), c);
  return u.position.set(n * 0.5, s + n * 0.3, a.nextFloat(-0.3, 0.3)), u.castShadow = !0, o.add(u), o;
}
function kc(e = {}) {
  const t = e.position ?? [
    0,
    0,
    0
  ], i = e.scale ?? 1, s = (e.radius ?? 0.6) * i, r = new ut(e.seed ?? Math.floor(Math.random() * 99999)), n = new f.DodecahedronGeometry(s, 1), a = n.attributes.position;
  for (let l = 0; l < a.count; l++) {
    const c = a.getX(l), h = a.getY(l), u = a.getZ(l), d = 1 + r.nextFloat(-0.25, 0.35);
    a.setXYZ(l, c * d, h * d, u * d);
  }
  n.computeVertexNormals();
  const o = new f.Mesh(n, new f.MeshStandardMaterial({
    color: e.color ?? 9079434,
    roughness: 0.95
  }));
  return o.position.set(...t), o.castShadow = !0, o.receiveShadow = !0, o;
}
function Ec(e = {}) {
  const t = e.position ?? [
    0,
    10,
    0
  ], i = e.scale ?? 1, s = new f.MeshStandardMaterial({
    color: e.color ?? 16777215,
    roughness: 1,
    transparent: !0,
    opacity: 0.92
  }), r = new f.Group();
  r.position.set(...t);
  const n = [
    [
      0,
      0,
      0,
      1
    ],
    [
      1.1 * i,
      -0.1 * i,
      0.2 * i,
      0.7
    ],
    [
      -1.1 * i,
      0,
      -0.2 * i,
      0.8
    ],
    [
      0.5 * i,
      -0.25 * i,
      0.1 * i,
      0.9
    ]
  ];
  for (const [a, o, l, c] of n) {
    const h = new f.Mesh(new f.SphereGeometry(c * i, 12, 8), s);
    h.position.set(a, o, l), h.scale.y = 0.55, r.add(h);
  }
  return r;
}
function Tn(e) {
  const t = new ze(), i = e.geometry, s = e.getWorldScale(new f.Vector3()), r = (o, l, c) => {
    t.type = K.Box, t.size = new k(o * s.x, l * s.y, c * s.z);
  }, n = (o) => {
    t.type = K.Sphere, t.size = new k(o * 2 * s.x, o * 2 * s.y, o * 2 * s.z);
  }, a = (o, l) => {
    t.type = K.Capsule, t.size = new k(o * 2 * s.x, l * s.y, o * 2 * s.z);
  };
  if (i instanceof f.BoxGeometry) {
    const o = i.parameters;
    r(o.width, o.height, o.depth);
  } else if (i instanceof f.SphereGeometry) n(i.parameters.radius);
  else if (i instanceof f.CapsuleGeometry) {
    const o = i.parameters;
    a(o.radius, o.height + o.radius * 2);
  } else if (i instanceof f.CylinderGeometry) {
    const o = i.parameters;
    a(Math.max(o.radiusTop, o.radiusBottom), o.height);
  } else if (i instanceof f.ConeGeometry) {
    const o = i.parameters;
    a(o.radius, o.height);
  } else if (i instanceof f.TorusGeometry) {
    const o = i.parameters;
    r((o.radius + o.tube) * 2, (o.radius + o.tube) * 2, o.tube * 2);
  } else if (i instanceof f.IcosahedronGeometry || i instanceof f.DodecahedronGeometry) n(i.parameters.radius);
  else {
    t.type = K.Box;
    const o = new f.Box3().setFromObject(e).getSize(new f.Vector3());
    t.size = new k(Math.max(0.1, o.x * s.x), Math.max(0.1, o.y * s.y), Math.max(0.1, o.z * s.z));
  }
  return t;
}
var zc = /* @__PURE__ */ (function(e) {
  return e[e.Left = 0] = "Left", e[e.Middle = 1] = "Middle", e[e.Right = 2] = "Right", e;
})({}), Mn = class {
  keysPressed = /* @__PURE__ */ new Set();
  keysJustPressed = /* @__PURE__ */ new Set();
  keysJustReleased = /* @__PURE__ */ new Set();
  mousePosition = new pt();
  mouseDelta = new pt();
  mouseButtonsPressed = /* @__PURE__ */ new Set();
  mouseButtonsJustPressed = /* @__PURE__ */ new Set();
  touchJoystickActive = !1;
  touchJoystickVector = new pt(0, 0);
  actionBindings = /* @__PURE__ */ new Map();
  constructor() {
    this.setupListeners(), this.setupDefaultBindings();
  }
  setupDefaultBindings() {
    this.actionBindings.set("MoveForward", ["KeyW", "ArrowUp"]), this.actionBindings.set("MoveBackward", ["KeyS", "ArrowDown"]), this.actionBindings.set("MoveLeft", ["KeyA", "ArrowLeft"]), this.actionBindings.set("MoveRight", ["KeyD", "ArrowRight"]), this.actionBindings.set("Jump", ["Space"]), this.actionBindings.set("Interact", ["KeyE", "Enter"]), this.actionBindings.set("Sprint", ["ShiftLeft", "ShiftRight"]), this.actionBindings.set("Undo", ["KeyZ", "KeyU"]), this.actionBindings.set("Restart", ["KeyR"]), this.actionBindings.set("Hint", ["KeyH"]), this.actionBindings.set("Pause", ["Escape", "KeyP"]);
  }
  setupListeners() {
    typeof window > "u" || (window.addEventListener("keydown", (e) => {
      this.keysPressed.has(e.code) || this.keysJustPressed.add(e.code), this.keysPressed.add(e.code);
    }), window.addEventListener("keyup", (e) => {
      this.keysPressed.delete(e.code), this.keysJustReleased.add(e.code);
    }), window.addEventListener("mousemove", (e) => {
      this.mouseDelta.set(e.movementX, e.movementY), this.mousePosition.set(e.clientX, e.clientY);
    }), window.addEventListener("mousedown", (e) => {
      this.mouseButtonsPressed.has(e.button) || this.mouseButtonsJustPressed.add(e.button), this.mouseButtonsPressed.add(e.button);
    }), window.addEventListener("mouseup", (e) => {
      this.mouseButtonsPressed.delete(e.button);
    }));
  }
  isKeyDown(e) {
    return this.keysPressed.has(e);
  }
  isKeyJustPressed(e) {
    return this.keysJustPressed.has(e);
  }
  bindAction(e, t) {
    this.actionBindings.set(e, t);
  }
  getActionBindings(e) {
    return this.actionBindings.get(e) || [];
  }
  isActionActive(e) {
    if ((this.actionBindings.get(e) || []).some((t) => t.startsWith("Mouse") ? this.mouseButtonsPressed.has(parseInt(t.replace("Mouse", ""))) : this.isKeyDown(t))) return !0;
    if (typeof navigator < "u" && navigator.getGamepads) {
      const t = navigator.getGamepads();
      for (const i of t)
        if (i && (e === "Jump" && i.buttons[0]?.pressed || e === "Interact" && i.buttons[2]?.pressed || e === "Undo" && i.buttons[3]?.pressed || e === "Hint" && i.buttons[1]?.pressed || e === "Pause" && i.buttons[9]?.pressed || e === "Sprint" && i.buttons[10]?.pressed))
          return !0;
    }
    return !1;
  }
  isActionJustPressed(e) {
    return (this.actionBindings.get(e) || []).some((t) => t.startsWith("Mouse") ? this.mouseButtonsJustPressed.has(parseInt(t.replace("Mouse", ""))) : this.isKeyJustPressed(t));
  }
  getMovementVector() {
    const e = new pt(0, 0);
    if (this.touchJoystickActive)
      return e.x = -this.touchJoystickVector.x, e.y = -this.touchJoystickVector.y, e;
    if (this.isActionActive("MoveForward") && (e.y += 1), this.isActionActive("MoveBackward") && (e.y -= 1), this.isActionActive("MoveRight") && (e.x -= 1), this.isActionActive("MoveLeft") && (e.x += 1), typeof navigator < "u" && navigator.getGamepads) {
      const t = navigator.getGamepads();
      for (const i of t) {
        if (!i) continue;
        const s = i.axes[0], r = i.axes[1];
        Math.abs(s) > 0.15 && (e.x = -s), Math.abs(r) > 0.15 && (e.y = -r);
      }
    }
    return e.lengthSq() > 1 && e.normalize(), e;
  }
  endFrame() {
    this.keysJustPressed.clear(), this.keysJustReleased.clear(), this.mouseButtonsJustPressed.clear(), this.mouseDelta.set(0, 0);
  }
}, Cn = new Mn(), _n = class {
  ctx = null;
  masterGain = null;
  bgmGain = null;
  sfxGain = null;
  uiGain = null;
  currentBgmSource = null;
  init() {
    if (this.ctx) {
      this.ctx.state === "suspended" && this.ctx.resume();
      return;
    }
    const e = window.AudioContext || window.webkitAudioContext;
    e && (this.ctx = new e(), this.masterGain = this.ctx.createGain(), this.bgmGain = this.ctx.createGain(), this.sfxGain = this.ctx.createGain(), this.uiGain = this.ctx.createGain(), this.bgmGain.connect(this.masterGain), this.sfxGain.connect(this.masterGain), this.uiGain.connect(this.masterGain), this.masterGain.connect(this.ctx.destination));
  }
  setMasterVolume(e) {
    this.masterGain && (this.masterGain.gain.value = Math.max(0, Math.min(1, e)));
  }
  setBGMVolume(e) {
    this.bgmGain && (this.bgmGain.gain.value = Math.max(0, Math.min(1, e)));
  }
  setSFXVolume(e) {
    this.sfxGain && (this.sfxGain.gain.value = Math.max(0, Math.min(1, e)));
  }
  setUIVolume(e) {
    this.uiGain && (this.uiGain.gain.value = Math.max(0, Math.min(1, e)));
  }
  playSynthesizedSound(e, t) {
    if (this.init(), !this.ctx || !this.sfxGain) return;
    const i = this.ctx.createOscillator(), s = this.ctx.createGain();
    let r = this.sfxGain;
    if (t && this.ctx.createPanner) {
      const a = this.ctx.createPanner();
      a.panningModel = "HRTF", a.distanceModel = "exponential", a.refDistance = 1, a.maxDistance = 50, a.rolloffFactor = 1.5, a.positionX.value = t.x, a.positionY.value = t.y, a.positionZ.value = t.z, a.connect(this.sfxGain), r = a;
    }
    i.connect(s), s.connect(r);
    const n = this.ctx.currentTime;
    switch (e) {
      case "jump":
        i.type = "sine", i.frequency.setValueAtTime(160, n), i.frequency.exponentialRampToValueAtTime(450, n + 0.15), s.gain.setValueAtTime(0.3, n), s.gain.linearRampToValueAtTime(0.01, n + 0.15), i.start(n), i.stop(n + 0.15);
        break;
      case "laser":
        i.type = "sawtooth", i.frequency.setValueAtTime(800, n), i.frequency.exponentialRampToValueAtTime(100, n + 0.2), s.gain.setValueAtTime(0.3, n), s.gain.linearRampToValueAtTime(0.01, n + 0.2), i.start(n), i.stop(n + 0.2);
        break;
      case "coin":
        i.type = "sine", i.frequency.setValueAtTime(987.77, n), i.frequency.setValueAtTime(1318.51, n + 0.08), s.gain.setValueAtTime(0.25, n), s.gain.linearRampToValueAtTime(0.01, n + 0.25), i.start(n), i.stop(n + 0.25);
        break;
      case "switch":
        i.type = "square", i.frequency.setValueAtTime(300, n), i.frequency.setValueAtTime(600, n + 0.04), s.gain.setValueAtTime(0.2, n), s.gain.linearRampToValueAtTime(0.01, n + 0.08), i.start(n), i.stop(n + 0.08);
        break;
      case "gate":
        i.type = "triangle", i.frequency.setValueAtTime(120, n), i.frequency.exponentialRampToValueAtTime(240, n + 0.4), s.gain.setValueAtTime(0.3, n), s.gain.linearRampToValueAtTime(0.01, n + 0.4), i.start(n), i.stop(n + 0.4);
        break;
      case "key":
        i.type = "sine", i.frequency.setValueAtTime(523.25, n), i.frequency.setValueAtTime(659.25, n + 0.06), i.frequency.setValueAtTime(783.99, n + 0.12), s.gain.setValueAtTime(0.25, n), s.gain.linearRampToValueAtTime(0.01, n + 0.3), i.start(n), i.stop(n + 0.3);
        break;
      case "teleport":
        i.type = "sine", i.frequency.setValueAtTime(300, n), i.frequency.exponentialRampToValueAtTime(1200, n + 0.35), s.gain.setValueAtTime(0.3, n), s.gain.linearRampToValueAtTime(0.01, n + 0.35), i.start(n), i.stop(n + 0.35);
        break;
      case "push":
        i.type = "triangle", i.frequency.setValueAtTime(80, n), i.frequency.linearRampToValueAtTime(60, n + 0.15), s.gain.setValueAtTime(0.2, n), s.gain.linearRampToValueAtTime(0.01, n + 0.15), i.start(n), i.stop(n + 0.15);
        break;
      case "fanfare":
        [
          523.25,
          659.25,
          783.99,
          1046.5
        ].forEach((a, o) => {
          const l = this.ctx.createOscillator(), c = this.ctx.createGain();
          l.type = "sine", l.frequency.value = a, l.connect(c), c.connect(r);
          const h = n + o * 0.08;
          c.gain.setValueAtTime(0.2, h), c.gain.exponentialRampToValueAtTime(1e-3, h + 0.5), l.start(h), l.stop(h + 0.5);
        });
        break;
      case "undo":
        i.type = "sine", i.frequency.setValueAtTime(600, n), i.frequency.exponentialRampToValueAtTime(200, n + 0.15), s.gain.setValueAtTime(0.2, n), s.gain.linearRampToValueAtTime(0.01, n + 0.15), i.start(n), i.stop(n + 0.15);
        break;
      case "hint":
        i.type = "sine", i.frequency.setValueAtTime(440, n), i.frequency.setValueAtTime(880, n + 0.08), s.gain.setValueAtTime(0.2, n), s.gain.linearRampToValueAtTime(0.01, n + 0.25), i.start(n), i.stop(n + 0.25);
        break;
      case "explosion":
        i.type = "square", i.frequency.setValueAtTime(100, n), i.frequency.exponentialRampToValueAtTime(20, n + 0.4), s.gain.setValueAtTime(0.4, n), s.gain.linearRampToValueAtTime(0.01, n + 0.4), i.start(n), i.stop(n + 0.4);
        break;
      default:
        i.type = "sine", i.frequency.setValueAtTime(600, n), s.gain.setValueAtTime(0.1, n), s.gain.linearRampToValueAtTime(0.01, n + 0.05), i.start(n), i.stop(n + 0.05);
        break;
    }
  }
  updateListenerPosition(e, t) {
    if (!this.ctx) return;
    const i = this.ctx.listener;
    i.positionX && (i.positionX.value = e.x, i.positionY.value = e.y, i.positionZ.value = e.z);
  }
}, An = new _n(), Pn = class {
  container = null;
  letterboxTop = null;
  letterboxBottom = null;
  colorGradeOverlay = null;
  transitionOverlay = null;
  overlaysMap = /* @__PURE__ */ new Map();
  constructor() {
    if (typeof document > "u") return;
    let e = document.getElementById("kairo-cinematic-container");
    e || (e = document.createElement("div"), e.id = "kairo-cinematic-container", e.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        z-index: 999;
        overflow: hidden;
      `, document.body.appendChild(e)), this.container = e, this.letterboxTop = document.createElement("div"), this.letterboxTop.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; height: 0%;
      background: #000; transition: height 0.4s ease; z-index: 100;
    `, this.letterboxBottom = document.createElement("div"), this.letterboxBottom.style.cssText = `
      position: absolute; bottom: 0; left: 0; right: 0; height: 0%;
      background: #000; transition: height 0.4s ease; z-index: 100;
    `, this.colorGradeOverlay = document.createElement("div"), this.colorGradeOverlay.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none; transition: all 0.3s ease; z-index: 10;
    `, this.transitionOverlay = document.createElement("div"), this.transitionOverlay.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none; opacity: 0; transition: opacity 0.3s ease; z-index: 200;
      background: #000;
    `, this.container.appendChild(this.letterboxTop), this.container.appendChild(this.letterboxBottom), this.container.appendChild(this.colorGradeOverlay), this.container.appendChild(this.transitionOverlay);
  }
  showImageOverlay(e, t = {}) {
    const i = t.id || `img_overlay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    if (typeof document > "u" || !this.container) return i;
    let s = this.overlaysMap.get(i);
    s || (s = document.createElement("div"), s.id = i, this.container.appendChild(s), this.overlaysMap.set(i, s));
    const r = t.mask || "none";
    let n = "none";
    r === "circle" ? n = "circle(45% at 50% 50%)" : r === "rounded" ? n = "inset(0 round 16px)" : r === "hexagon" && (n = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)");
    const a = typeof t.width == "number" ? `${t.width}px` : t.width || "200px", o = typeof t.height == "number" ? `${t.height}px` : t.height || "auto", l = t.opacity ?? 1, c = t.blendMode || "normal", h = t.x !== void 0 ? typeof t.x == "number" ? `${t.x}px` : t.x : "50%", u = t.y !== void 0 ? typeof t.y == "number" ? `${t.y}px` : t.y : "50%";
    return s.style.cssText = `
      position: absolute;
      left: ${h};
      top: ${u};
      transform: translate(-50%, -50%);
      width: ${a};
      height: ${o};
      opacity: ${l};
      mix-blend-mode: ${c};
      clip-path: ${n};
      background-image: url('${e}');
      background-size: cover;
      background-position: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 50;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    `, i;
  }
  removeImageOverlay(e) {
    const t = this.overlaysMap.get(e);
    t && (t.style.opacity = "0", setTimeout(() => {
      t.remove(), this.overlaysMap.delete(e);
    }, 300));
  }
  setLetterbox(e, t = 10) {
    if (!this.letterboxTop || !this.letterboxBottom) return;
    const i = e ? `${t}%` : "0%";
    this.letterboxTop.style.height = i, this.letterboxBottom.style.height = i;
  }
  async transitionCut(e = "fadeBlack", t = 500) {
    return new Promise((i) => {
      if (!this.transitionOverlay) return i();
      this.transitionOverlay.style.transition = `all ${t / 2}ms ease`, e === "fadeBlack" ? (this.transitionOverlay.style.background = "#000", this.transitionOverlay.style.opacity = "1") : e === "wipeLeft" ? (this.transitionOverlay.style.background = "linear-gradient(to left, #000 50%, transparent 100%)", this.transitionOverlay.style.opacity = "1") : e === "circleWipe" ? (this.transitionOverlay.style.background = "radial-gradient(circle, transparent 0%, #000 100%)", this.transitionOverlay.style.opacity = "1") : e === "glitch" && (this.transitionOverlay.style.background = "rgba(99, 102, 241, 0.4)", this.transitionOverlay.style.opacity = "0.8"), setTimeout(() => {
        this.transitionOverlay && (this.transitionOverlay.style.opacity = "0"), setTimeout(i, t / 2);
      }, t / 2);
    });
  }
  setColorGrading(e) {
    this.colorGradeOverlay && (e === "cinematicWarm" ? (this.colorGradeOverlay.style.backdropFilter = "contrast(108%) sepia(20%) saturate(120%)", this.colorGradeOverlay.style.background = "rgba(245, 158, 11, 0.05)") : e === "cyberpunkNeon" ? (this.colorGradeOverlay.style.backdropFilter = "contrast(115%) saturate(150%) hue-rotate(10deg)", this.colorGradeOverlay.style.background = "rgba(99, 102, 241, 0.06)") : e === "noir" ? (this.colorGradeOverlay.style.backdropFilter = "grayscale(100%) contrast(140%)", this.colorGradeOverlay.style.background = "none") : e === "sepia" ? (this.colorGradeOverlay.style.backdropFilter = "sepia(80%) contrast(110%)", this.colorGradeOverlay.style.background = "rgba(217, 119, 6, 0.08)") : e === "vintage" ? (this.colorGradeOverlay.style.backdropFilter = "contrast(95%) brightness(105%) saturate(85%)", this.colorGradeOverlay.style.background = "rgba(168, 85, 247, 0.04)") : (this.colorGradeOverlay.style.backdropFilter = "none", this.colorGradeOverlay.style.background = "none"));
  }
  clearAll() {
    this.overlaysMap.forEach((e) => e.remove()), this.overlaysMap.clear(), this.setLetterbox(!1), this.setColorGrading("none");
  }
}, qe = new Pn(), Bn = {
  primaryColor: "#3b82f6",
  accentColor: "#10b981",
  backgroundColor: "#09090b",
  cardBackground: "rgba(24, 24, 27, 0.85)",
  textColor: "#fafafa",
  mutedTextColor: "#a1a1aa",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  borderRadius: "12px"
}, kn = class {
  container = null;
  theme;
  constructor(e = Bn) {
    if (this.theme = e, typeof document < "u") {
      let t = document.getElementById("kairo-ui-overlay");
      t || (t = document.createElement("div"), t.id = "kairo-ui-overlay", document.body.appendChild(t)), this.container = t, this.applyGlobalStyles();
    }
  }
  applyGlobalStyles() {
    this.container && (this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      overflow: hidden;
      box-sizing: border-box;
    `, this.container.style.fontFamily = this.theme.fontFamily, this.container.style.color = this.theme.textColor);
  }
  showToast(e, t = 3e3, i = "info") {
    if (!this.container || typeof document > "u") return;
    const s = document.createElement("div");
    s.style.cssText = `
      position: absolute;
      top: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: ${i === "success" ? "#059669" : i === "warning" ? "#d97706" : "rgba(30, 41, 59, 0.95)"};
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(8px);
      pointer-events: auto;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
    `, s.innerText = e, this.container.appendChild(s), requestAnimationFrame(() => {
      s.style.opacity = "1", s.style.transform = "translateX(-50%) translateY(0)";
    }), setTimeout(() => {
      s.style.opacity = "0", s.style.transform = "translateX(-50%) translateY(-20px)", setTimeout(() => s.remove(), 300);
    }, t);
  }
  createModal(e, t, i) {
    if (!this.container || typeof document > "u") return null;
    const s = document.createElement("div");
    s.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      z-index: 2000;
      opacity: 0;
      transition: opacity 0.25s ease;
    `;
    const r = document.createElement("div");
    r.style.cssText = `
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 32px;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      transform: scale(0.9);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `, r.style.background = this.theme.cardBackground, r.style.borderRadius = this.theme.borderRadius;
    const n = document.createElement("h2");
    n.style.cssText = "margin: 0 0 16px 0; font-size: 24px; font-weight: 700;", n.style.color = this.theme.textColor, n.innerText = e;
    const a = document.createElement("div");
    a.style.cssText = "margin-bottom: 24px; font-size: 15px; line-height: 1.6;", a.style.color = this.theme.mutedTextColor, a.innerHTML = t;
    const o = document.createElement("div");
    return o.style.cssText = "display: flex; gap: 12px; justify-content: flex-end;", i.forEach((l) => {
      const c = document.createElement("button");
      c.innerText = l.text, c.style.cssText = `
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        border: none;
        color: white;
        transition: transform 0.15s, background 0.15s;
      `, c.style.background = l.primary ? this.theme.primaryColor : "rgba(255, 255, 255, 0.1)", c.onmouseenter = () => c.style.transform = "scale(1.04)", c.onmouseleave = () => c.style.transform = "scale(1)", c.onclick = () => {
        c.disabled || (o.querySelectorAll("button").forEach((h) => h.disabled = !0), s.style.opacity = "0", r.style.transform = "scale(0.9)", setTimeout(() => s.remove(), 250), l.onClick());
      }, o.appendChild(c);
    }), r.appendChild(n), r.appendChild(a), r.appendChild(o), s.appendChild(r), this.container.appendChild(s), requestAnimationFrame(() => {
      s.style.opacity = "1", r.style.transform = "scale(1)";
    }), s;
  }
  showStartScreen(e) {
    if (!this.container || typeof document > "u") return null;
    const t = document.createElement("div");
    t.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      pointer-events: auto; z-index: 3000; color: white; text-align: center;
    `;
    const i = document.createElement("h1");
    i.innerText = e.title, i.style.cssText = `font-size: 64px; font-weight: 800; margin: 0 0 10px 0; color: ${this.theme.primaryColor}; text-shadow: 0 4px 20px rgba(0,0,0,0.5);`;
    const s = document.createElement("p");
    s.innerText = e.subtitle || "", s.style.cssText = `font-size: 24px; color: ${this.theme.mutedTextColor}; margin: 0 0 40px 0; max-width: 600px;`;
    const r = document.createElement("button");
    return r.innerText = e.btnText || "START GAME", r.style.cssText = `
      padding: 16px 48px; border-radius: 30px; font-size: 20px; font-weight: 700;
      background: ${this.theme.accentColor}; color: white; border: none; cursor: pointer;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3); transition: transform 0.2s;
    `, r.onmouseenter = () => r.style.transform = "scale(1.05)", r.onmouseleave = () => r.style.transform = "scale(1)", r.onclick = () => {
      t.style.opacity = "0", t.style.transition = "opacity 0.5s ease", setTimeout(() => {
        t.remove(), e.onStart();
      }, 500);
    }, t.appendChild(i), e.subtitle && t.appendChild(s), t.appendChild(r), this.container.appendChild(t), t;
  }
  showEndScreen(e) {
    if (!this.container || typeof document > "u") return null;
    const t = document.createElement("div");
    t.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(8px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      pointer-events: auto; z-index: 3000; color: white; text-align: center;
    `;
    const i = document.createElement("h1");
    i.innerText = e.title, i.style.cssText = "font-size: 56px; font-weight: 800; margin: 0 0 10px 0; color: #ef4444; text-shadow: 0 4px 20px rgba(239, 68, 68, 0.5);";
    const s = document.createElement("p");
    s.innerText = e.subtitle || "", s.style.cssText = `font-size: 20px; color: ${this.theme.mutedTextColor}; margin: 0 0 20px 0; max-width: 600px;`;
    const r = document.createElement("div");
    e.score && (r.innerText = "Score: " + e.score, r.style.cssText = "font-size: 32px; font-weight: bold; color: #facc15; margin: 0 0 40px 0;");
    const n = document.createElement("button");
    return n.innerText = e.btnText || "RESTART", n.style.cssText = `
      padding: 16px 48px; border-radius: 30px; font-size: 20px; font-weight: 700;
      background: ${this.theme.primaryColor}; color: white; border: none; cursor: pointer;
      box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3); transition: transform 0.2s;
    `, n.onmouseenter = () => n.style.transform = "scale(1.05)", n.onmouseleave = () => n.style.transform = "scale(1)", n.onclick = () => {
      t.style.opacity = "0", t.style.transition = "opacity 0.3s ease", setTimeout(() => {
        t.remove(), e.onRestart();
      }, 300);
    }, t.appendChild(i), e.subtitle && t.appendChild(s), e.score && t.appendChild(r), t.appendChild(n), this.container.appendChild(t), t;
  }
  showAchievement(e, t, i = "🏆") {
    if (!this.container || typeof document > "u") return;
    const s = document.createElement("div");
    s.style.cssText = `
      position: absolute;
      top: 24px;
      right: 24px;
      border: 1px solid rgba(255, 215, 0, 0.4);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.1);
      transform: translateX(120%);
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s;
      z-index: 9999;
    `, s.style.background = this.theme.cardBackground, s.style.borderRadius = this.theme.borderRadius;
    const r = document.createElement("div");
    r.style.cssText = "font-size: 32px;", r.innerText = i;
    const n = document.createElement("div"), a = document.createElement("div");
    a.style.cssText = "font-size: 12px; font-weight: bold; color: #facc15; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;", a.innerText = "Achievement Unlocked";
    const o = document.createElement("div");
    o.style.cssText = "font-size: 16px; font-weight: 600; color: white;", o.innerText = e;
    const l = document.createElement("div");
    l.style.cssText = "font-size: 13px; margin-top: 2px;", l.style.color = this.theme.mutedTextColor, l.innerText = t, n.appendChild(a), n.appendChild(o), n.appendChild(l), s.appendChild(r), s.appendChild(n), this.container.appendChild(s), requestAnimationFrame(() => {
      s.style.transform = "translateX(0)";
    }), setTimeout(() => {
      s.style.opacity = "0", s.style.transform = "translateX(120%)", setTimeout(() => s.remove(), 400);
    }, 4e3);
  }
  createGameMenu(e, t) {
    if (!this.container || typeof document > "u") return null;
    const i = document.createElement("div");
    i.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      z-index: 3000; opacity: 0; transition: opacity 0.3s;
      pointer-events: auto;
    `;
    const s = document.createElement("h1");
    s.innerText = e, s.style.cssText = "font-size: 48px; font-weight: 800; color: white; margin-bottom: 40px; text-shadow: 0 4px 20px rgba(0,0,0,0.5);";
    const r = document.createElement("div");
    return r.style.cssText = "display: flex; flex-direction: column; gap: 16px; width: 300px;", t.forEach((n) => {
      const a = document.createElement("button");
      a.innerText = n.text;
      const o = n.color || "rgba(255, 255, 255, 0.1)";
      a.style.cssText = `
        padding: 16px 24px; font-size: 18px; font-weight: 600; color: white;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; cursor: pointer; transition: all 0.2s;
        text-align: center;
      `, a.style.background = o, a.onmouseenter = () => {
        a.style.transform = "scale(1.05)", a.style.background = n.color ? n.color : "rgba(255,255,255,0.2)";
      }, a.onmouseleave = () => {
        a.style.transform = "scale(1)", a.style.background = o;
      }, a.onclick = () => {
        i.style.opacity = "0", setTimeout(() => {
          i.remove(), n.onClick();
        }, 300);
      }, r.appendChild(a);
    }), i.appendChild(s), i.appendChild(r), this.container.appendChild(i), requestAnimationFrame(() => {
      i.style.opacity = "1";
    }), i;
  }
  clear() {
    this.container && (this.container.innerHTML = "");
  }
  subtitleEl = null;
  showSubtitle(e, t) {
    !this.container || typeof document > "u" || (this.subtitleEl || (this.subtitleEl = document.createElement("div"), this.subtitleEl.style.cssText = `
        position: absolute;
        bottom: 10%;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 20px;
        font-weight: 500;
        text-align: center;
        max-width: 80%;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
        text-shadow: 1px 1px 2px black;
      `, this.container.appendChild(this.subtitleEl)), this.subtitleEl.innerText = e, requestAnimationFrame(() => {
      this.subtitleEl && (this.subtitleEl.style.opacity = "1", this.subtitleEl.style.transform = "translateX(-50%) translateY(0)");
    }), t && setTimeout(() => this.hideSubtitle(), t));
  }
  hideSubtitle() {
    this.subtitleEl && (this.subtitleEl.style.opacity = "0", this.subtitleEl.style.transform = "translateX(-50%) translateY(20px)");
  }
  overlayEl = null;
  getOverlayEl() {
    return this.overlayEl || (this.overlayEl = document.createElement("div"), this.overlayEl.style.cssText = `
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none;
        z-index: 5000;
        opacity: 0;
        transition: opacity 0.5s ease;
      `, this.container && this.container.appendChild(this.overlayEl)), this.overlayEl;
  }
  flash(e = "#ffffff", t = 500) {
    const i = this.getOverlayEl();
    i.style.transition = "none", i.style.backgroundColor = e, i.style.opacity = "1", i.offsetWidth, i.style.transition = `opacity ${t}ms ease-out`, i.style.opacity = "0";
  }
  async fade(e, t = "#000000", i = 1e3) {
    return new Promise((s) => {
      const r = this.getOverlayEl();
      r.style.backgroundColor = t, r.style.transition = `opacity ${i}ms ease-in-out`, r.style.opacity = e.toString(), setTimeout(s, i);
    });
  }
  showImageOverlay(e, t) {
    return qe.showImageOverlay(e, t);
  }
  removeImageOverlay(e) {
    qe.removeImageOverlay(e);
  }
  setLetterbox(e, t) {
    qe.setLetterbox(e, t);
  }
  async transitionCut(e, t) {
    await qe.transitionCut(e, t);
  }
  setColorGrading(e) {
    qe.setColorGrading(e);
  }
}, En = new kn(), zn = class {
  overlay = null;
  metricsElement = null;
  entityCountElement = null;
  visible = !1;
  constructor() {
    typeof window < "u" && window.addEventListener("keydown", (e) => {
      (e.code === "Backquote" || e.code === "F3") && this.toggle();
    });
  }
  createOverlay() {
    this.overlay || (this.overlay = document.createElement("div"), this.overlay.id = "kairo-debug-inspector", this.overlay.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      width: 260px;
      background: rgba(9, 9, 11, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 14px;
      color: #fafafa;
      font-family: monospace;
      font-size: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      z-index: 9999;
      pointer-events: auto;
      display: none;
    `, this.overlay.innerHTML = `
      <div style="font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 6px; margin-bottom: 8px; color: #3b82f6; display: flex; justify-content: space-between; align-items: center;">
        <span>🛠️ Kairo Engine Profiler</span>
        <span style="font-size: 10px; color: #888;">[~] Toggle</span>
      </div>
      <div id="kairo-metrics-content" style="line-height: 1.6;">
        FPS: --<br>
        Frame: -- ms<br>
        Draw Calls: --<br>
        Triangles: --<br>
        Geometries: --<br>
        Textures: --
      </div>
      <div id="kairo-ecs-content" style="margin-top: 8px; border-top: 1px dashed #333; padding-top: 6px; color: #10b981;">
        Active Entities: --
      </div>
    `, document.body.appendChild(this.overlay), this.metricsElement = this.overlay.querySelector("#kairo-metrics-content"), this.entityCountElement = this.overlay.querySelector("#kairo-ecs-content"));
  }
  toggle() {
    this.visible = !this.visible, this.overlay || this.createOverlay(), this.overlay && (this.overlay.style.display = this.visible ? "block" : "none");
  }
  update(e, t = 0) {
    this.visible && (this.overlay || this.createOverlay(), this.metricsElement && (this.metricsElement.innerHTML = `
        <span style="color: ${e.fps >= 55 ? "#10b981" : "#f59e0b"}; font-weight: bold;">FPS: ${e.fps}</span> (16.6ms target)<br>
        <span style="color: #38bdf8;">GPU Render CPU: ${e.cpuRenderMs ?? 1.2} ms</span><br>
        <span style="color: #a855f7;">Physics Update CPU: ${e.cpuPhysicsMs ?? 0.4} ms</span><br>
        <span style="color: #10b981;">AOT AI Pathfinding CPU: ${e.cpuAiMs ?? 0} ms</span><br>
        Draw Calls: <strong>${e.drawCalls}</strong><br>
        Triangles: ${e.triangles.toLocaleString()}<br>
        Geometries: ${e.geometries} | Textures: ${e.textures}<br>
        JS Heap Memory: ${e.jsHeapMb ? e.jsHeapMb + " MB" : "Active"}
      `), this.entityCountElement && (this.entityCountElement.innerText = `Active ECS Entities: ${t}`));
  }
}, Vn = new zn(), Vc = class {
  static compileGame(e, t = {}) {
    const i = {
      minifyShaders: t.minifyShaders ?? !0,
      prebakeSpatialHash: t.prebakeSpatialHash ?? !0,
      compressBinaryLevels: t.compressBinaryLevels ?? !0,
      quantizeMeshBuffers: t.quantizeMeshBuffers ?? !0,
      targetPlatform: t.targetPlatform ?? "web"
    }, s = [];
    s.push(`[Kairo AOT Compiler] Initiating game build target: ${i.targetPlatform.toUpperCase()}`);
    let r = 0, n = 0;
    const a = [];
    e.forEach((h) => {
      const u = JSON.stringify(h, null, 2), d = new TextEncoder().encode(u).length;
      r += d;
      const g = [];
      if (i.prebakeSpatialHash && h.elements) {
        const v = /* @__PURE__ */ new Map();
        h.elements.forEach((b, S) => {
          const C = b.id || `elem_${S}`, w = `${b.pos[0]},${b.pos[1]}`;
          v.has(w) || v.set(w, []), v.get(w).push(C);
        }), v.forEach((b, S) => {
          g.push({
            key: S,
            elementIds: b
          });
        });
      }
      const p = JSON.stringify(h), y = Ie.createSaveEnvelope(JSON.parse(p)), m = JSON.stringify(y), x = i.compressBinaryLevels ? Ie.compressToBase64(m) : m, A = new TextEncoder().encode(x).length;
      n += A, a.push({
        id: h.id,
        name: h.name,
        world: h.world,
        binaryPayload: x,
        spatialHashBake: g,
        checksum: y.checksum
      }), s.push(`[Level ${h.id}] '${h.name}' compiled (${d}B -> ${A}B)`);
    });
    const o = r - n, l = r > 0 ? o / r * 100 : 0, c = r > 0 ? `${l.toFixed(1)}%` : "0%";
    return s.push(`[Kairo AOT Compiler] Build complete! ${a.length} levels bundled.`), s.push(`[Optimization Summary] Size reduced by ${c} (Total: ${(n / 1024).toFixed(2)} KB)`), {
      success: !0,
      compiledAt: (/* @__PURE__ */ new Date()).toISOString(),
      targetPlatform: i.targetPlatform,
      levelsCompiled: a.length,
      totalOriginalSizeBytes: r,
      totalCompiledSizeBytes: n,
      compressionRatio: c,
      estimatedMemorySavingsPercent: Math.max(0, Math.round(l)),
      compiledLevels: a,
      logs: s
    };
  }
  static minifyShader(e) {
    return e.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").replace(/\s+/g, " ").replace(/\s*([{};,=+-/*()<>])\s*/g, "$1").trim();
  }
  static compileEasyScript(e) {
    let t = 0;
    const i = e.match(/\bthis\.(spin|bob|patrol|move|moveForward|rotate|setPosition|changeColor|say|playSound|sparkle|explode|destroy)\b/g);
    i && (t = i.length);
    const s = e.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").replace(/\s+/g, " ").trim();
    return {
      compiledCode: s,
      astStats: {
        statements: s.split(";").length,
        helperCalls: t
      }
    };
  }
  static quantizeGeometryBuffers(e) {
    const t = new Uint16Array(e.length);
    let i = 1 / 0, s = -1 / 0;
    for (let n = 0; n < e.length; n++)
      e[n] < i && (i = e[n]), e[n] > s && (s = e[n]);
    const r = s - i || 1;
    for (let n = 0; n < e.length; n++) t[n] = Math.round((e[n] - i) / r * 65535);
    return t;
  }
  static compileStandaloneGameHtml(e, t, i = {}) {
    const s = this.compileGame(t, i);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${e} | Kairo Engine Build</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #09090b; font-family: sans-serif; color: #fff; }
    #hud { position: absolute; top: 16px; left: 16px; background: rgba(18, 18, 22, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.2); padding: 10px 16px; border-radius: 12px; font-weight: 700; }
  </style>
</head>
<body>
  <div id="hud">⚡ ${e} (Kairo Standalone Build)</div>
  <canvas id="game-canvas" style="width:100%; height:100%; display:block;"></canvas>
  <script>
    const levels = ${JSON.stringify(s.compiledLevels)};
    console.log('[Kairo Compiler] Loaded standalone bundle with ' + levels.length + ' levels.');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    scene.add(new THREE.GridHelper(30, 30, 0x6366f1, 0x27272a));
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 12, 5);
    scene.add(sun);
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
  <\/script>
</body>
</html>`;
  }
}, Dn = class {
  canvas;
  mediaRecorder = null;
  recordedChunks = [];
  isRecording = !1;
  constructor(e) {
    this.canvas = e;
  }
  captureScreenshot(e = `kairo-shot-${Date.now()}.png`, t = "image/png", i = 0.95) {
    const s = this.canvas.toDataURL(t, i);
    if (typeof document < "u") {
      const r = document.createElement("a");
      r.download = e, r.href = s, document.body.appendChild(r), r.click(), document.body.removeChild(r);
    }
    return s;
  }
  startRecording(e = 60) {
    if (typeof window > "u" || typeof MediaRecorder > "u" || this.isRecording) return !1;
    this.recordedChunks = [];
    const t = this.canvas.captureStream ? this.canvas.captureStream(e) : null;
    if (!t) return !1;
    let i = "video/webm";
    MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? i = "video/webm;codecs=vp9" : MediaRecorder.isTypeSupported("video/webm") ? i = "video/webm" : MediaRecorder.isTypeSupported("video/mp4") && (i = "video/mp4");
    try {
      return this.mediaRecorder = new MediaRecorder(t, {
        mimeType: i,
        videoBitsPerSecond: 6e6
      }), this.mediaRecorder.ondataavailable = (s) => {
        s.data && s.data.size > 0 && this.recordedChunks.push(s.data);
      }, this.mediaRecorder.start(100), this.isRecording = !0, !0;
    } catch (s) {
      return console.warn("Failed to start MediaRecorder:", s), !1;
    }
  }
  stopRecording(e = `kairo-recording-${Date.now()}.webm`) {
    return new Promise((t) => {
      if (!this.mediaRecorder || !this.isRecording) {
        t(null);
        return;
      }
      this.mediaRecorder.onstop = () => {
        this.isRecording = !1;
        const i = this.mediaRecorder?.mimeType || "video/webm", s = new Blob(this.recordedChunks, { type: i });
        if (typeof document < "u") {
          const r = URL.createObjectURL(s), n = document.createElement("a");
          n.style.display = "none", n.href = r, n.download = e, document.body.appendChild(n), n.click(), setTimeout(() => {
            document.body.removeChild(n), URL.revokeObjectURL(r);
          }, 100);
        }
        t(s);
      }, this.mediaRecorder.stop();
    });
  }
}, Rn = class {
  app;
  gridHelper = null;
  axesHelper = null;
  cameraHelper = null;
  boundingBoxHelpers = /* @__PURE__ */ new Map();
  wireframeMaterials = /* @__PURE__ */ new Map();
  isWireframeMode = !1;
  constructor(e) {
    this.app = e;
  }
  toggleGrid(e = 100, t = 100) {
    this.gridHelper ? (this.app.scene.remove(this.gridHelper), this.gridHelper.dispose(), this.gridHelper = null) : (this.gridHelper = new f.GridHelper(e, t, 4473924, 2236962), this.app.scene.add(this.gridHelper));
  }
  toggleOriginIndicator(e = 5) {
    this.axesHelper ? (this.app.scene.remove(this.axesHelper), this.axesHelper.dispose(), this.axesHelper = null) : (this.axesHelper = new f.AxesHelper(e), this.app.scene.add(this.axesHelper));
  }
  toggleWireframe() {
    this.isWireframeMode = !this.isWireframeMode, this.app.scene.traverse((e) => {
      if (e instanceof f.Mesh) if (this.isWireframeMode)
        this.wireframeMaterials.set(e, e.material), e.material = new f.MeshBasicMaterial({
          color: 65280,
          wireframe: !0
        });
      else {
        const t = this.wireframeMaterials.get(e);
        t && (e.material = t);
      }
    }), this.isWireframeMode || this.wireframeMaterials.clear();
  }
  showBoundingBox(e, t = 16776960) {
    if (this.boundingBoxHelpers.has(e)) return;
    const i = new f.BoxHelper(e, t);
    this.app.scene.add(i), this.boundingBoxHelpers.set(e, i);
    const s = () => {
      this.boundingBoxHelpers.has(e) ? i.update() : this.app.engine.events.off("update", s);
    };
    this.app.engine.events.on("update", s);
  }
  hideBoundingBox(e) {
    const t = this.boundingBoxHelpers.get(e);
    t && (this.app.scene.remove(t), t.dispose(), this.boundingBoxHelpers.delete(e));
  }
  clear() {
    this.gridHelper && this.toggleGrid(), this.axesHelper && this.toggleOriginIndicator(), this.isWireframeMode && this.toggleWireframe(), this.boundingBoxHelpers.forEach((e, t) => {
      this.app.scene.remove(e), e.dispose();
    }), this.boundingBoxHelpers.clear();
  }
}, Fi = class {
  tracks = [];
  currentTime = 0;
  totalDuration = 10;
  isPlaying = !1;
  fps = 60;
  app;
  playbackTimer = null;
  _evalPos1 = new f.Vector3();
  _evalPos2 = new f.Vector3();
  _evalTarget = new f.Vector3();
  _evalCurrent = new f.Vector3();
  _setVector3(e, t) {
    t && (Array.isArray(t) ? e.set(t[0] ?? 0, t[1] ?? 0, t[2] ?? 0) : typeof t == "object" && ("x" in t && typeof t.x == "number" ? e.set(t.x, t.y ?? 0, t.z ?? 0) : typeof t[0] == "number" && e.set(t[0], t[1] ?? 0, t[2] ?? 0)));
  }
  constructor(e, t = 10) {
    this.app = e, this.totalDuration = t, this.addTrack("Camera Shots", "camera"), this.addTrack("Overlays & Graphics", "overlay"), this.addTrack("Titles & Subtitles", "text"), this.addTrack("Transitions & Cuts", "transition"), this.addTrack("Audio & Music", "audio"), this.addTrack("Color Grading & FX", "colorGrade");
  }
  addTrack(e, t) {
    const i = {
      id: `track_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: e,
      type: t,
      muted: !1,
      locked: !1,
      clips: []
    };
    return this.tracks.push(i), i;
  }
  addClip(e, t) {
    const i = this.tracks.find((n) => n.id === e || n.name === e || n.type === e);
    if (!i) throw new Error(`Track ${e} not found`);
    const s = {
      ...t,
      id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    i.clips.push(s), i.clips.sort((n, a) => n.startTime - a.startTime);
    const r = s.startTime + s.duration;
    return r > this.totalDuration && (this.totalDuration = r), s;
  }
  seek(e) {
    this.currentTime = Math.max(0, Math.min(this.totalDuration, e)), this.evaluateAt(this.currentTime);
  }
  play() {
    if (this.isPlaying) return;
    this.isPlaying = !0;
    let e = performance.now();
    const t = () => {
      if (!this.isPlaying) return;
      const i = performance.now(), s = (i - e) / 1e3;
      e = i, this.currentTime += s, this.currentTime >= this.totalDuration && (this.currentTime = this.totalDuration, this.pause()), this.evaluateAt(this.currentTime), this.isPlaying && (this.playbackTimer = requestAnimationFrame(t));
    };
    e = performance.now(), this.playbackTimer = requestAnimationFrame(t);
  }
  pause() {
    this.isPlaying = !1, this.playbackTimer && (cancelAnimationFrame(this.playbackTimer), this.playbackTimer = null);
  }
  evaluateAt(e) {
    for (const t of this.tracks)
      if (!t.muted)
        for (const i of t.clips) {
          const s = i.startTime + i.duration;
          if (!(e >= i.startTime && e <= s) || i.duration <= 0) continue;
          const r = e - i.startTime, n = f.MathUtils.clamp(r / i.duration, 0, 1);
          if (t.type === "camera" && this.app?.cameraController) {
            if (i.props.shotType === "pan" && i.props.fromPos && i.props.toPos && i.props.target)
              this._setVector3(this._evalPos1, i.props.fromPos), this._setVector3(this._evalPos2, i.props.toPos), this._evalCurrent.lerpVectors(this._evalPos1, this._evalPos2, n), this.app.cameraController.camera.position.copy(this._evalCurrent), this._setVector3(this._evalTarget, i.props.target), this.app.cameraController.camera.lookAt(this._evalTarget);
            else if (i.props.shotType === "orbit" && i.props.target) {
              const a = r * (i.props.speed || 1), o = i.props.radius || 8;
              this._setVector3(this._evalTarget, i.props.target), this.app.cameraController.camera.position.set(this._evalTarget.x + Math.sin(a) * o, this._evalTarget.y + 3, this._evalTarget.z + Math.cos(a) * o), this.app.cameraController.camera.lookAt(this._evalTarget);
            }
          }
          t.type === "overlay" && this.app?.ui && i.props.url && this.app.ui.showImageOverlay(i.props.url, {
            id: i.id,
            x: i.props.x ?? "50%",
            y: i.props.y ?? "50%",
            width: i.props.width ?? "240px",
            opacity: i.props.opacity ?? 1,
            mask: i.props.mask ?? "none"
          }), t.type === "text" && this.app?.ui && i.props.text && this.app.ui.showSubtitle(i.props.text, Math.min(2e3, i.duration * 1e3)), t.type === "transition" && this.app?.ui && i.props.transitionType && r < 0.1 && this.app.ui.transitionCut(i.props.transitionType, i.duration * 1e3), t.type === "colorGrade" && this.app?.ui && i.props.preset && this.app.ui.setColorGrading(i.props.preset), t.type === "audio" && this.app?.audio && i.props.soundName && r < 0.1 && this.app.audio.playSynthesizedSound(i.props.soundName);
        }
  }
  async exportVideo(e = "kairo-video-edit.webm") {
    if (!this.app?.startRecording || !this.app?.stopRecording) throw new Error("ScreenRecorder not attached to app");
    return this.seek(0), this.app.startRecording(this.fps), this.play(), new Promise((t) => {
      const i = setInterval(async () => {
        this.currentTime >= this.totalDuration && (clearInterval(i), this.pause(), await this.app.stopRecording(e), t());
      }, 100);
    });
  }
  toJSON() {
    return {
      totalDuration: this.totalDuration,
      fps: this.fps,
      tracks: this.tracks
    };
  }
  fromJSON(e) {
    this.totalDuration = e.totalDuration || 10, this.fps = e.fps || 60, this.tracks = e.tracks || [];
  }
}, Fn = class {
  saveKey;
  data = {};
  achievementDefs = {};
  constructor(e) {
    this.saveKey = `kairo_save_${e}`, this.load();
  }
  load() {
    try {
      if (typeof localStorage > "u") return;
      const e = localStorage.getItem(this.saveKey);
      if (e) {
        const t = JSON.parse(e), i = Ie.verifyAndUnwrapSave(t);
        i.valid && i.payload && (this.data = i.payload);
      }
    } catch (e) {
      console.warn("[SaveSystem] Could not load save:", e);
    }
    this.data.achievements || (this.data.achievements = {}), this.data.progress || (this.data.progress = {});
  }
  save() {
    try {
      if (typeof localStorage > "u") return;
      const e = Ie.createSaveEnvelope(this.data);
      localStorage.setItem(this.saveKey, JSON.stringify(e));
    } catch (e) {
      console.warn("[SaveSystem] Could not save progress:", e);
    }
  }
  getProgress(e, t) {
    return this.data.progress[e] !== void 0 ? this.data.progress[e] : t;
  }
  setProgress(e, t) {
    this.data.progress[e] = t, this.save();
  }
  unlockAchievement(e, t) {
    if (this.data.achievements[e]) return !1;
    if (this.data.achievements[e] = !0, this.save(), t && this.achievementDefs[e]) {
      const i = this.achievementDefs[e];
      typeof t.showAchievement == "function" && t.showAchievement(i.title, i.description, i.icon);
    }
    return !0;
  }
  hasAchievement(e) {
    return !!this.data.achievements[e];
  }
  defineAchievement(e) {
    this.achievementDefs[e.id] = e;
  }
}, In = class {
  app;
  activeSceneName = null;
  scenes = /* @__PURE__ */ new Map();
  constructor(e) {
    this.app = e;
  }
  define(e, t) {
    this.scenes.set(e, t);
  }
  async load(e) {
    const t = this.scenes.get(e);
    if (!t) {
      console.error(`[SceneManager] Scene '${e}' not found.`);
      return;
    }
    this.activeSceneName = e, this.app.cutscene && this.app.cutscene.stop(), this.app.physics && this.app.physics.clear && this.app.physics.clear(), this.app.clearObstacles(), this.app.ui && this.app.ui.clear && this.app.ui.clear();
    const i = [];
    this.app.scene.traverse((s) => {
      s !== this.app.scene && i.push(s);
    });
    for (const s of i) {
      if (s.geometry && s.geometry.dispose(), s.material) {
        const r = s.material;
        Array.isArray(r) ? r.forEach((n) => n.dispose()) : r.dispose();
      }
      s.parent && s.parent.remove(s);
    }
    await t(this.app), console.log(`[SceneManager] Loaded scene '${e}'`);
  }
  get currentScene() {
    return this.activeSceneName;
  }
}, tt = class extends Error {
  constructor() {
    super("Cutscene Aborted"), this.name = "CutsceneAbortError";
  }
}, Nn = class {
  app;
  aborted = !1;
  constructor(e) {
    this.app = e;
  }
  abort() {
    this.aborted = !0, this.app.ui.hideSubtitle();
  }
  checkAbort() {
    if (this.aborted) throw new tt();
  }
  async wait(e) {
    return this.checkAbort(), new Promise((t, i) => {
      let s = 0;
      const r = (n) => {
        if (this.aborted)
          return this.app.engine.events.off("update", r), i(new tt());
        s += n, s >= e && (this.app.engine.events.off("update", r), t());
      };
      this.app.engine.events.on("update", r);
    });
  }
  async moveCamera(e, t = 1) {
    return this.checkAbort(), new Promise((i, s) => {
      let r = 0;
      const n = this.app.camera.position.clone(), a = new f.Vector3(...e), o = (l) => {
        if (this.aborted)
          return this.app.engine.events.off("update", o), s(new tt());
        r += l;
        const c = Math.min(r / t, 1), h = c * c * (3 - 2 * c);
        this.app.camera.position.lerpVectors(n, a, h), c >= 1 && (this.app.engine.events.off("update", o), i());
      };
      this.app.engine.events.on("update", o);
    });
  }
  async lookAt(e, t = 1) {
    return this.checkAbort(), new Promise((i, s) => {
      let r = 0;
      const n = this.app.camera.quaternion.clone(), a = new f.Object3D();
      a.position.copy(this.app.camera.position), a.lookAt(new f.Vector3(...e));
      const o = a.quaternion.clone(), l = (c) => {
        if (this.aborted)
          return this.app.engine.events.off("update", l), s(new tt());
        r += c;
        const h = Math.min(r / t, 1), u = h * h * (3 - 2 * h);
        this.app.camera.quaternion.slerpQuaternions(n, o, u), h >= 1 && (this.app.engine.events.off("update", l), i());
      };
      this.app.engine.events.on("update", l);
    });
  }
  async showDialogue(e, t = 2) {
    this.checkAbort(), this.app.ui.showSubtitle && this.app.ui.showSubtitle(e), await this.wait(t), this.app.ui.hideSubtitle && this.app.ui.hideSubtitle();
  }
  shakeCamera(e, t, i = 1) {
    this.app.cameraController && this.app.cameraController.shake({
      intensity: e,
      duration: t,
      decay: i
    });
  }
  flashScreen(e = "#ffffff", t = 500) {
    this.app.ui.flash && this.app.ui.flash(e, t);
  }
  async fadeScreen(e, t = "#000000", i = 1e3) {
    this.checkAbort(), this.app.ui.fade && (this.app.ui.fade(e, t, i), await this.wait(i / 1e3));
  }
}, On = class {
  app;
  activeContext = null;
  constructor(e) {
    this.app = e;
  }
  async play(e) {
    this.stop(), this.activeContext = new Nn(this.app);
    try {
      await e(this.activeContext);
    } catch (t) {
      if (t instanceof tt) console.log("[CutsceneManager] Cutscene skipped.");
      else throw t;
    } finally {
      this.activeContext && (this.activeContext.abort(), this.activeContext = null);
    }
  }
  skip() {
    this.activeContext && this.activeContext.abort();
  }
  stop() {
    this.skip();
  }
  get isPlaying() {
    return this.activeContext !== null;
  }
};
function Ln(e, t) {
  e.indexOf(t) === -1 && e.push(t);
}
function ri(e, t) {
  const i = e.indexOf(t);
  i > -1 && e.splice(i, 1);
}
var we = (e, t, i) => i > t ? t : i < e ? e : i;
function It(e, t) {
  return t ? `${e}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${t}` : e;
}
var Ue = () => {
}, he = () => {
};
typeof process < "u" && process.env.NODE_ENV !== "production" && (Ue = (e, t, i) => {
  !e && typeof console < "u" && console.warn(It(t, i));
}, he = (e, t, i) => {
  if (!e) throw new Error(It(t, i));
});
var Se = {}, xs = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), Un = (e) => typeof e == "object" && e !== null, bs = (e) => /^0[^.\s]+$/u.test(e);
// @__NO_SIDE_EFFECTS__
function ws(e) {
  let t;
  return () => (t === void 0 && (t = e()), t);
}
var We = /* @__NO_SIDE_EFFECTS__ */ (e) => e, ni = (...e) => e.reduce((t, i) => (s) => i(t(s))), ai = /* @__NO_SIDE_EFFECTS__ */ (e, t, i) => {
  const s = t - e;
  return s ? (i - e) / s : 1;
}, Ss = class {
  constructor() {
    this.subscriptions = [];
  }
  add(e) {
    return Ln(this.subscriptions, e), () => ri(this.subscriptions, e);
  }
  notify(e, t, i) {
    const s = this.subscriptions.length;
    if (s)
      if (s === 1) this.subscriptions[0](e, t, i);
      else for (let r = 0; r < s; r++) {
        const n = this.subscriptions[r];
        n && n(e, t, i);
      }
  }
  getSize() {
    return this.subscriptions.length;
  }
  clear() {
    this.subscriptions.length = 0;
  }
}, Q = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, se = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, Ts = /* @__NO_SIDE_EFFECTS__ */ (e, t) => t ? e * (1e3 / t) : 0, Ii = /* @__PURE__ */ new Set();
function Ms(e, t, i) {
  e || Ii.has(t) || (console.warn(It(t, i)), Ii.add(t));
}
var Wn = (e, t, i) => {
  const s = t - e;
  return ((i - e) % s + s) % s + e;
}, Cs = (e, t, i) => (((1 - 3 * i + 3 * t) * e + (3 * i - 6 * t)) * e + 3 * t) * e, Gn = 1e-7, $n = 12;
function Kn(e, t, i, s, r) {
  let n, a, o = 0;
  do
    a = t + (i - t) / 2, n = Cs(a, s, r) - e, n > 0 ? i = a : t = a;
  while (Math.abs(n) > Gn && ++o < $n);
  return a;
}
// @__NO_SIDE_EFFECTS__
function ct(e, t, i, s) {
  if (e === t && i === s) return We;
  const r = (n) => Kn(n, 0, 1, e, i);
  return (n) => n === 0 || n === 1 ? n : Cs(r(n), t, s);
}
var _s = /* @__NO_SIDE_EFFECTS__ */ (e) => (t) => t <= 0.5 ? e(2 * t) / 2 : (2 - e(2 * (1 - t))) / 2, oi = /* @__NO_SIDE_EFFECTS__ */ (e) => (t) => 1 - e(1 - t), As = /* @__PURE__ */ ct(0.33, 1.53, 0.69, 0.99), li = /* @__PURE__ */ oi(As), Ps = /* @__PURE__ */ _s(li), Bs = (e) => e >= 1 ? 1 : (e *= 2) < 1 ? 0.5 * li(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), ci = (e) => 1 - Math.sin(Math.acos(e)), Hn = oi(ci), ks = _s(ci), jn = /* @__PURE__ */ ct(0.42, 0, 1, 1), qn = /* @__PURE__ */ ct(0, 0, 0.58, 1), Es = /* @__PURE__ */ ct(0.42, 0, 0.58, 1), zs = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] != "number";
// @__NO_SIDE_EFFECTS__
function Vs(e, t) {
  return zs(e) ? e[Wn(0, e.length, t)] : e;
}
var Ds = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] == "number", Ni = {
  linear: We,
  easeIn: jn,
  easeInOut: Es,
  easeOut: qn,
  circIn: ci,
  circInOut: ks,
  circOut: Hn,
  backIn: li,
  backInOut: Ps,
  backOut: As,
  anticipate: Bs
}, Xn = (e) => typeof e == "string", Oi = (e) => {
  if (Ds(e)) {
    he(e.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
    const [t, i, s, r] = e;
    return /* @__PURE__ */ ct(t, i, s, r);
  } else if (Xn(e))
    return he(Ni[e] !== void 0, `Invalid easing type '${e}'`, "invalid-easing-type"), Ni[e];
  return e;
}, mt = [
  "setup",
  "read",
  "resolveKeyframes",
  "preUpdate",
  "update",
  "preRender",
  "render",
  "postRender"
];
function Yn(e) {
  let t = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), s = !1, r = !1;
  const n = /* @__PURE__ */ new WeakSet();
  let a = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  };
  function o(c) {
    n.has(c) && (l.schedule(c), e()), c(a);
  }
  const l = {
    schedule: (c, h = !1, u = !1) => {
      const d = u && s ? t : i;
      return h && n.add(c), d.add(c), c;
    },
    cancel: (c) => {
      i.delete(c), n.delete(c);
    },
    process: (c) => {
      if (a = c, s) {
        r = !0;
        return;
      }
      s = !0;
      const h = t;
      t = i, i = h, t.forEach(o), t.clear(), s = !1, r && (r = !1, l.process(c));
    }
  };
  return l;
}
var Zn = 40;
function Rs(e, t) {
  let i = !1, s = !0;
  const r = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, n = () => i = !0, a = mt.reduce((v, b) => (v[b] = Yn(n), v), {}), { setup: o, read: l, resolveKeyframes: c, preUpdate: h, update: u, preRender: d, render: g, postRender: p } = a, y = () => {
    const v = Se.useManualTiming, b = v ? r.timestamp : performance.now();
    i = !1, v || (r.delta = s ? 1e3 / 60 : Math.max(Math.min(b - r.timestamp, Zn), 1)), r.timestamp = b, r.isProcessing = !0, o.process(r), l.process(r), c.process(r), h.process(r), u.process(r), d.process(r), g.process(r), p.process(r), r.isProcessing = !1, i && t && (s = !1, e(y));
  }, m = () => {
    i = !0, s = !0, r.isProcessing || e(y);
  };
  return {
    schedule: mt.reduce((v, b) => {
      const S = a[b];
      return v[b] = (C, w = !1, _ = !1) => (i || m(), S.schedule(C, w, _)), v;
    }, {}),
    cancel: (v) => {
      for (let b = 0; b < mt.length; b++) a[mt[b]].cancel(v);
    },
    state: r,
    steps: a
  };
}
var { schedule: ne, cancel: Nt, state: xt, steps: Dc } = /* @__PURE__ */ Rs(typeof requestAnimationFrame < "u" ? requestAnimationFrame : We, !0), yt;
function Qn() {
  yt = void 0;
}
var Z = {
  now: () => (yt === void 0 && Z.set(xt.isProcessing || Se.useManualTiming ? xt.timestamp : performance.now()), yt),
  set: (e) => {
    yt = e, queueMicrotask(Qn);
  }
}, Fs = (e) => (t) => typeof t == "string" && t.startsWith(e), Is = /* @__PURE__ */ Fs("--"), Jn = /* @__PURE__ */ Fs("var(--"), hi = (e) => Jn(e) ? ea.test(e.split("/*")[0].trim()) : !1, ea = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function Li(e) {
  return typeof e != "string" ? !1 : e.split("/*")[0].includes("var(--");
}
var Ge = {
  test: (e) => typeof e == "number",
  parse: parseFloat,
  transform: (e) => e
}, at = {
  ...Ge,
  transform: (e) => we(0, 1, e)
}, gt = {
  ...Ge,
  default: 1
}, nt = (e) => Math.round(e * 1e5) / 1e5, ui = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function ta(e) {
  return e == null;
}
var ia = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, di = (e, t) => (i) => !!(typeof i == "string" && ia.test(i) && i.startsWith(e) || t && !ta(i) && Object.prototype.hasOwnProperty.call(i, t)), Ns = (e, t, i) => (s) => {
  if (typeof s != "string") return s;
  const [r, n, a, o] = s.match(ui);
  return {
    [e]: parseFloat(r),
    [t]: parseFloat(n),
    [i]: parseFloat(a),
    alpha: o !== void 0 ? parseFloat(o) : 1
  };
}, sa = (e) => we(0, 255, e), _t = {
  ...Ge,
  transform: (e) => Math.round(sa(e))
}, _e = {
  test: /* @__PURE__ */ di("rgb", "red"),
  parse: /* @__PURE__ */ Ns("red", "green", "blue"),
  transform: ({ red: e, green: t, blue: i, alpha: s = 1 }) => "rgba(" + _t.transform(e) + ", " + _t.transform(t) + ", " + _t.transform(i) + ", " + nt(at.transform(s)) + ")"
};
function ra(e) {
  let t = "", i = "", s = "", r = "";
  return e.length > 5 ? (t = e.substring(1, 3), i = e.substring(3, 5), s = e.substring(5, 7), r = e.substring(7, 9)) : (t = e.substring(1, 2), i = e.substring(2, 3), s = e.substring(3, 4), r = e.substring(4, 5), t += t, i += i, s += s, r += r), {
    red: parseInt(t, 16),
    green: parseInt(i, 16),
    blue: parseInt(s, 16),
    alpha: r ? parseInt(r, 16) / 255 : 1
  };
}
var Ot = {
  test: /* @__PURE__ */ di("#"),
  parse: ra,
  transform: _e.transform
}, ht = /* @__NO_SIDE_EFFECTS__ */ (e) => ({
  test: (t) => typeof t == "string" && t.endsWith(e) && t.split(" ").length === 1,
  parse: parseFloat,
  transform: (t) => `${t}${e}`
}), oe = /* @__PURE__ */ ht("deg"), Re = /* @__PURE__ */ ht("%"), P = /* @__PURE__ */ ht("px"), na = /* @__PURE__ */ ht("vh"), aa = /* @__PURE__ */ ht("vw"), Ui = {
  ...Re,
  parse: (e) => Re.parse(e) / 100,
  transform: (e) => Re.transform(e * 100)
}, Ve = {
  test: /* @__PURE__ */ di("hsl", "hue"),
  parse: /* @__PURE__ */ Ns("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: t, lightness: i, alpha: s = 1 }) => "hsla(" + Math.round(e) + ", " + Re.transform(nt(t)) + ", " + Re.transform(nt(i)) + ", " + nt(at.transform(s)) + ")"
}, U = {
  test: (e) => _e.test(e) || Ot.test(e) || Ve.test(e),
  parse: (e) => _e.test(e) ? _e.parse(e) : Ve.test(e) ? Ve.parse(e) : Ot.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? _e.transform(e) : Ve.transform(e),
  getAnimatableNone: (e) => {
    const t = U.parse(e);
    return t.alpha = 0, U.transform(t);
  }
}, oa = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function la(e) {
  return isNaN(e) && typeof e == "string" && (e.match(ui)?.length || 0) + (e.match(oa)?.length || 0) > 0;
}
var Os = "number", Ls = "color", ca = "var", ha = "var(", Wi = "${}", ua = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function Ne(e) {
  const t = e.toString(), i = [], s = {
    color: [],
    number: [],
    var: []
  }, r = [];
  let n = 0;
  return {
    values: i,
    split: t.replace(ua, (a) => (U.test(a) ? (s.color.push(n), r.push(Ls), i.push(U.parse(a))) : a.startsWith(ha) ? (s.var.push(n), r.push(ca), i.push(a)) : (s.number.push(n), r.push(Os), i.push(parseFloat(a))), ++n, Wi)).split(Wi),
    indexes: s,
    types: r
  };
}
function da(e) {
  return Ne(e).values;
}
function Us({ split: e, types: t }) {
  const i = e.length;
  return (s) => {
    let r = "";
    for (let n = 0; n < i; n++)
      if (r += e[n], s[n] !== void 0) {
        const a = t[n];
        a === Os ? r += nt(s[n]) : a === Ls ? r += U.transform(s[n]) : r += s[n];
      }
    return r;
  };
}
function pa(e) {
  return Us(Ne(e));
}
var fa = (e) => typeof e == "number" ? 0 : U.test(e) ? U.getAnimatableNone(e) : e, ma = (e, t) => typeof e == "number" ? t?.trim().endsWith("/") ? e : 0 : fa(e);
function ga(e) {
  const t = Ne(e);
  return Us(t)(t.values.map((i, s) => ma(i, t.split[s])));
}
var re = {
  test: la,
  parse: da,
  createTransformer: pa,
  getAnimatableNone: ga
};
function At(e, t, i) {
  return i < 0 && (i += 1), i > 1 && (i -= 1), i < 1 / 6 ? e + (t - e) * 6 * i : i < 1 / 2 ? t : i < 2 / 3 ? e + (t - e) * (2 / 3 - i) * 6 : e;
}
function ya({ hue: e, saturation: t, lightness: i, alpha: s }) {
  e /= 360, t /= 100, i /= 100;
  let r = 0, n = 0, a = 0;
  if (!t) r = n = a = i;
  else {
    const o = i < 0.5 ? i * (1 + t) : i + t - i * t, l = 2 * i - o;
    r = At(l, o, e + 1 / 3), n = At(l, o, e), a = At(l, o, e - 1 / 3);
  }
  return {
    red: Math.round(r * 255),
    green: Math.round(n * 255),
    blue: Math.round(a * 255),
    alpha: s
  };
}
function bt(e, t) {
  return (i) => i > 0 ? t : e;
}
var $e = (e, t, i) => e + (t - e) * i, Pt = (e, t, i) => {
  const s = e * e, r = i * (t * t - s) + s;
  return r < 0 ? 0 : Math.sqrt(r);
}, va = [
  Ot,
  _e,
  Ve
], xa = (e) => va.find((t) => t.test(e));
function Gi(e) {
  const t = xa(e);
  if (Ue(!!t, `'${e}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !t) return !1;
  let i = t.parse(e);
  return t === Ve && (i = ya(i)), i;
}
var $i = (e, t) => {
  const i = Gi(e), s = Gi(t);
  if (!i || !s) return bt(e, t);
  const r = { ...i };
  return (n) => (r.red = Pt(i.red, s.red, n), r.green = Pt(i.green, s.green, n), r.blue = Pt(i.blue, s.blue, n), r.alpha = $e(i.alpha, s.alpha, n), _e.transform(r));
}, Lt = /* @__PURE__ */ new Set(["none", "hidden"]);
function ba(e, t) {
  return Lt.has(e) ? (i) => i <= 0 ? e : t : (i) => i >= 1 ? t : e;
}
function wa(e, t) {
  return (i) => $e(e, t, i);
}
function pi(e) {
  return typeof e == "number" ? wa : typeof e == "string" ? hi(e) ? bt : U.test(e) ? $i : Ma : Array.isArray(e) ? Ws : typeof e == "object" ? U.test(e) ? $i : Sa : bt;
}
function Ws(e, t) {
  const i = [...e], s = i.length, r = e.map((n, a) => pi(n)(n, t[a]));
  return (n) => {
    for (let a = 0; a < s; a++) i[a] = r[a](n);
    return i;
  };
}
function Sa(e, t) {
  const i = {
    ...e,
    ...t
  }, s = {};
  for (const r in i) e[r] !== void 0 && t[r] !== void 0 && (s[r] = pi(e[r])(e[r], t[r]));
  return (r) => {
    for (const n in s) i[n] = s[n](r);
    return i;
  };
}
function Ta(e, t) {
  const i = [], s = {
    color: 0,
    var: 0,
    number: 0
  };
  for (let r = 0; r < t.values.length; r++) {
    const n = t.types[r], a = e.indexes[n][s[n]];
    i[r] = e.values[a] ?? 0, s[n]++;
  }
  return i;
}
var Ma = (e, t) => {
  const i = re.createTransformer(t), s = Ne(e), r = Ne(t);
  return s.indexes.var.length === r.indexes.var.length && s.indexes.color.length === r.indexes.color.length && s.indexes.number.length >= r.indexes.number.length ? Lt.has(e) && !r.values.length || Lt.has(t) && !s.values.length ? ba(e, t) : ni(Ws(Ta(s, r), r.values), i) : (Ue(!0, `Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), bt(e, t));
};
function Gs(e, t, i) {
  return typeof e == "number" && typeof t == "number" && typeof i == "number" ? $e(e, t, i) : pi(e)(e, t);
}
var Ca = (e) => {
  const t = ({ timestamp: i }) => e(i);
  return {
    start: (i = !0) => ne.update(t, i),
    stop: () => Nt(t),
    now: () => xt.isProcessing ? xt.timestamp : Z.now()
  };
}, $s = (e, t, i = 10) => {
  let s = "";
  const r = Math.max(Math.round(t / i), 2);
  for (let n = 0; n < r; n++) s += Math.round(e(n / (r - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${s.substring(0, s.length - 2)})`;
}, Ks = 2e4;
function fi(e) {
  let t = 0;
  const i = 50;
  let s = e.next(t);
  for (; !s.done && t < 2e4; )
    t += i, s = e.next(t);
  return t >= 2e4 ? 1 / 0 : t;
}
function Hs(e, t = 100, i) {
  const s = i({
    ...e,
    keyframes: [0, t]
  }), r = Math.min(fi(s), Ks);
  return {
    type: "keyframes",
    ease: (n) => s.next(r * n).value / t,
    duration: se(r)
  };
}
var I = {
  stiffness: 100,
  damping: 10,
  mass: 1,
  velocity: 0,
  duration: 800,
  bounce: 0.3,
  visualDuration: 0.3,
  restSpeed: {
    granular: 0.01,
    default: 2
  },
  restDelta: {
    granular: 5e-3,
    default: 0.5
  },
  minDuration: 0.01,
  maxDuration: 10,
  minDamping: 0.05,
  maxDamping: 1
};
function Ut(e, t) {
  return e * Math.sqrt(1 - t * t);
}
var _a = 12;
function Aa(e, t, i) {
  let s = i;
  for (let r = 1; r < _a; r++) s = s - e(s) / t(s);
  return s;
}
var Ki = 1e-3;
function Pa({ duration: e = I.duration, bounce: t = I.bounce, velocity: i = I.velocity, mass: s = I.mass }) {
  let r, n;
  Ue(e <= Q(I.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let a = 1 - t;
  a = we(I.minDamping, I.maxDamping, a), e = we(I.minDuration, I.maxDuration, se(e)), a < 1 ? (r = (c) => {
    const h = c * a, u = h * e, d = h - i, g = Ut(c, a), p = Math.exp(-u);
    return Ki - d / g * p;
  }, n = (c) => {
    const h = c * a * e, u = h * i + i, d = Math.pow(a, 2) * Math.pow(c, 2) * e, g = Math.exp(-h), p = Ut(Math.pow(c, 2), a);
    return (-r(c) + Ki > 0 ? -1 : 1) * ((u - d) * g) / p;
  }) : (r = (c) => -1e-3 + Math.exp(-c * e) * ((c - i) * e + 1), n = (c) => Math.exp(-c * e) * ((i - c) * (e * e)));
  const o = 5 / e, l = Aa(r, n, o);
  if (e = Q(e), isNaN(l)) return {
    stiffness: I.stiffness,
    damping: I.damping,
    duration: e
  };
  {
    const c = Math.pow(l, 2) * s;
    return {
      stiffness: c,
      damping: a * 2 * Math.sqrt(s * c),
      duration: e
    };
  }
}
var Ba = ["duration", "bounce"], ka = [
  "stiffness",
  "damping",
  "mass"
];
function Hi(e, t) {
  return t.some((i) => e[i] !== void 0);
}
function Ea(e) {
  let t = {
    velocity: I.velocity,
    stiffness: I.stiffness,
    damping: I.damping,
    mass: I.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!Hi(e, ka) && Hi(e, Ba))
    if (t.velocity = 0, e.visualDuration) {
      const i = e.visualDuration, s = 2 * Math.PI / (i * 1.2), r = s * s, n = 2 * we(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(r);
      t = {
        ...t,
        mass: I.mass,
        stiffness: r,
        damping: n
      };
    } else {
      const i = Pa({
        ...e,
        velocity: 0
      });
      t = {
        ...t,
        ...i,
        mass: I.mass
      }, t.isResolvedFromDuration = !0;
    }
  return t;
}
function ot(e = I.visualDuration, t = I.bounce) {
  const i = typeof e != "object" ? {
    visualDuration: e,
    keyframes: [0, 1],
    bounce: t
  } : e;
  let { restSpeed: s, restDelta: r } = i;
  const n = i.keyframes[0], a = i.keyframes[i.keyframes.length - 1], o = {
    done: !1,
    value: n
  }, { stiffness: l, damping: c, mass: h, duration: u, velocity: d, isResolvedFromDuration: g } = Ea({
    ...i,
    velocity: -se(i.velocity || 0)
  }), p = d || 0, y = c / (2 * Math.sqrt(l * h)), m = a - n, x = se(Math.sqrt(l / h)), A = Math.abs(m) < 5;
  s || (s = A ? I.restSpeed.granular : I.restSpeed.default), r || (r = A ? I.restDelta.granular : I.restDelta.default);
  let v, b, S, C, w, _;
  if (y < 1)
    S = Ut(x, y), C = (p + y * x * m) / S, v = (B) => {
      const T = Math.exp(-y * x * B);
      return a - T * (C * Math.sin(S * B) + m * Math.cos(S * B));
    }, w = y * x * C + m * S, _ = y * x * m - C * S, b = (B) => Math.exp(-y * x * B) * (w * Math.sin(S * B) + _ * Math.cos(S * B));
  else if (y === 1) {
    v = (T) => a - Math.exp(-x * T) * (m + (p + x * m) * T);
    const B = p + x * m;
    b = (T) => Math.exp(-x * T) * (x * B * T - p);
  } else {
    const B = x * Math.sqrt(y * y - 1);
    v = (V) => {
      const D = Math.exp(-y * x * V), O = Math.min(B * V, 300);
      return a - D * ((p + y * x * m) * Math.sinh(O) + B * m * Math.cosh(O)) / B;
    };
    const T = (p + y * x * m) / B, z = y * x * T - m * B, E = y * x * m - T * B;
    b = (V) => {
      const D = Math.exp(-y * x * V), O = Math.min(B * V, 300);
      return D * (z * Math.sinh(O) + E * Math.cosh(O));
    };
  }
  const M = {
    calculatedDuration: g && u || null,
    velocity: (B) => Q(b(B)),
    next: (B) => {
      if (!g && y < 1) {
        const z = Math.exp(-y * x * B), E = Math.sin(S * B), V = Math.cos(S * B), D = a - z * (C * E + m * V), O = Q(z * (w * E + _ * V));
        return o.done = Math.abs(O) <= s && Math.abs(a - D) <= r, o.value = o.done ? a : D, o;
      }
      const T = v(B);
      if (g)
        o.done = B >= u;
      else {
        const z = Q(b(B));
        o.done = Math.abs(z) <= s && Math.abs(a - T) <= r;
      }
      return o.value = o.done ? a : T, o;
    },
    toString: () => {
      const B = Math.min(fi(M), Ks), T = $s((z) => M.next(B * z).value, B, 30);
      return B + "ms " + T;
    },
    toTransition: () => {
    }
  };
  return M;
}
ot.applyToOptions = (e) => {
  const t = Hs(e, 100, ot);
  return e.ease = t.ease, e.duration = Q(t.duration), e.type = "keyframes", e;
};
var za = 5;
function js(e, t, i) {
  const s = Math.max(t - za, 0);
  return Ts(i - e(s), t - s);
}
function Wt({ keyframes: e, velocity: t = 0, power: i = 0.8, timeConstant: s = 325, bounceDamping: r = 10, bounceStiffness: n = 500, modifyTarget: a, min: o, max: l, restDelta: c = 0.5, restSpeed: h }) {
  const u = e[0], d = {
    done: !1,
    value: u
  }, g = (_) => o !== void 0 && _ < o || l !== void 0 && _ > l, p = (_) => o === void 0 ? l : l === void 0 || Math.abs(o - _) < Math.abs(l - _) ? o : l;
  let y = i * t;
  const m = u + y, x = a === void 0 ? m : a(m);
  x !== m && (y = x - u);
  const A = (_) => -y * Math.exp(-_ / s), v = (_) => x + A(_), b = (_) => {
    const M = A(_), B = v(_);
    d.done = Math.abs(M) <= c, d.value = d.done ? x : B;
  };
  let S, C;
  const w = (_) => {
    g(d.value) && (S = _, C = ot({
      keyframes: [d.value, p(d.value)],
      velocity: js(v, _, d.value),
      damping: r,
      stiffness: n,
      restDelta: c,
      restSpeed: h
    }));
  };
  return w(0), {
    calculatedDuration: null,
    next: (_) => {
      let M = !1;
      return !C && S === void 0 && (M = !0, b(_), w(_)), S !== void 0 && _ >= S ? C.next(_ - S) : (!M && b(_), d);
    }
  };
}
function Va(e, t, i) {
  const s = [], r = i || Se.mix || Gs, n = e.length - 1;
  for (let a = 0; a < n; a++) {
    let o = r(e[a], e[a + 1]);
    t && (o = ni(Array.isArray(t) ? t[a] || We : t, o)), s.push(o);
  }
  return s;
}
function Da(e, t, { clamp: i = !0, ease: s, mixer: r } = {}) {
  const n = e.length;
  if (he(n === t.length, "Both input and output ranges must be the same length", "range-length"), n === 1) return () => t[0];
  if (n === 2 && t[0] === t[1]) return () => t[1];
  const a = e[0] === e[1];
  e[0] > e[n - 1] && (e = [...e].reverse(), t = [...t].reverse());
  const o = Va(t, s, r), l = o.length, c = (h) => {
    if (a && h < e[0]) return t[0];
    let u = 0;
    if (l > 1)
      for (; u < e.length - 2 && !(h < e[u + 1]); u++) ;
    const d = ai(e[u], e[u + 1], h);
    return o[u](d);
  };
  return i ? (h) => c(we(e[0], e[n - 1], h)) : c;
}
function qs(e, t) {
  const i = e[e.length - 1];
  for (let s = 1; s <= t; s++) {
    const r = ai(0, t, s);
    e.push($e(i, 1, r));
  }
}
function Xs(e) {
  const t = [0];
  return qs(t, e.length - 1), t;
}
function Ra(e, t) {
  return e.map((i) => i * t);
}
function Fa(e, t) {
  return e.map(() => t || Es).splice(0, e.length - 1);
}
function De({ duration: e = 300, keyframes: t, times: i, ease: s = "easeInOut" }) {
  const r = zs(s) ? s.map(Oi) : Oi(s), n = {
    done: !1,
    value: t[0]
  }, a = Da(Ra(i && i.length === t.length ? i : Xs(t), e), t, { ease: Array.isArray(r) ? r : Fa(t, r) });
  return {
    calculatedDuration: e,
    next: (o) => (n.value = a(o), n.done = o >= e, n)
  };
}
var Ia = (e) => e !== null;
function Mt(e, { repeat: t, repeatType: i = "loop" }, s, r = 1) {
  const n = e.filter(Ia), a = r < 0 || t && i !== "loop" && t % 2 === 1 ? 0 : n.length - 1;
  return !a || s === void 0 ? n[a] : s;
}
var Na = {
  decay: Wt,
  inertia: Wt,
  tween: De,
  keyframes: De,
  spring: ot
};
function Ys(e) {
  typeof e.type == "string" && (e.type = Na[e.type]);
}
var mi = class {
  constructor() {
    this.updateFinished();
  }
  get finished() {
    return this._finished;
  }
  updateFinished() {
    this._finished = new Promise((e) => {
      this.resolve = e;
    });
  }
  notifyFinished() {
    this.resolve();
  }
  then(e, t) {
    return this.finished.then(e, t);
  }
}, Oa = (e) => e / 100, wt = class extends mi {
  constructor(e) {
    super(), this.state = "idle", this.startTime = null, this.isStopped = !1, this.currentTime = 0, this.holdTime = null, this.playbackSpeed = 1, this.delayState = {
      done: !1,
      value: void 0
    }, this.stop = () => {
      const { motionValue: t } = this.options;
      t && t.updatedAt !== Z.now() && this.tick(Z.now()), this.isStopped = !0, this.state !== "idle" && (this.teardown(), this.options.onStop?.());
    }, this.options = e, this.initAnimation(), this.play(), e.autoplay === !1 && this.pause();
  }
  initAnimation() {
    const { options: e } = this;
    Ys(e);
    const { type: t = De, repeat: i = 0, repeatDelay: s = 0, repeatType: r, velocity: n = 0 } = e;
    let { keyframes: a } = e;
    const o = t || De;
    process.env.NODE_ENV !== "production" && o !== De && he(a.length <= 2, `Only two keyframes currently supported with spring and inertia animations. Trying to animate ${a}`, "spring-two-frames"), o !== De && typeof a[0] != "number" && (this.mixKeyframes = ni(Oa, Gs(a[0], a[1])), a = [0, 100]);
    const l = o({
      ...e,
      keyframes: a
    });
    r === "mirror" && (this.mirroredGenerator = o({
      ...e,
      keyframes: [...a].reverse(),
      velocity: -n
    })), l.calculatedDuration === null && (l.calculatedDuration = fi(l));
    const { calculatedDuration: c } = l;
    this.calculatedDuration = c, this.resolvedDuration = c + s, this.totalDuration = this.resolvedDuration * (i + 1) - s, this.generator = l;
  }
  updateTime(e) {
    const t = Math.round(e - this.startTime) * this.playbackSpeed;
    this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = t;
  }
  tick(e, t = !1) {
    const { generator: i, totalDuration: s, mixKeyframes: r, mirroredGenerator: n, resolvedDuration: a, calculatedDuration: o } = this;
    if (this.startTime === null) return i.next(0);
    const { delay: l = 0, keyframes: c, repeat: h, repeatType: u, repeatDelay: d, type: g, onUpdate: p, finalKeyframe: y } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, e) : this.speed < 0 && (this.startTime = Math.min(e - s / this.speed, this.startTime)), t ? this.currentTime = e : this.updateTime(e);
    const m = this.currentTime - l * (this.playbackSpeed >= 0 ? 1 : -1), x = this.playbackSpeed >= 0 ? m < 0 : m > s;
    this.currentTime = Math.max(m, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = s);
    let A = this.currentTime, v = i;
    if (h) {
      const w = Math.min(this.currentTime, s) / a;
      let _ = Math.floor(w), M = w % 1;
      !M && w >= 1 && (M = 1), M === 1 && _--, _ = Math.min(_, h + 1), _ % 2 && (u === "reverse" ? (M = 1 - M, d && (M -= d / a)) : u === "mirror" && (v = n)), A = we(0, 1, M) * a;
    }
    let b;
    x ? (this.delayState.value = c[0], b = this.delayState) : b = v.next(A), r && !x && (b.value = r(b.value));
    let { done: S } = b;
    !x && o !== null && (S = this.playbackSpeed >= 0 ? this.currentTime >= s : this.currentTime <= 0);
    const C = this.holdTime === null && (this.state === "finished" || this.state === "running" && S);
    return C && g !== Wt && (b.value = Mt(c, this.options, y, this.speed)), p && p(b.value), C && this.finish(), b;
  }
  then(e, t) {
    return this.finished.then(e, t);
  }
  get duration() {
    return se(this.calculatedDuration);
  }
  get iterationDuration() {
    const { delay: e = 0 } = this.options || {};
    return this.duration + se(e);
  }
  get time() {
    return se(this.currentTime);
  }
  set time(e) {
    e = Q(e), this.currentTime = e, this.startTime === null || this.holdTime !== null || this.playbackSpeed === 0 ? this.holdTime = e : this.driver && (this.startTime = this.driver.now() - e / this.playbackSpeed), this.driver ? this.driver.start(!1) : (this.startTime = 0, this.state = "paused", this.holdTime = e, this.tick(e));
  }
  getGeneratorVelocity() {
    const e = this.currentTime;
    if (e <= 0) return this.options.velocity || 0;
    if (this.generator.velocity) return this.generator.velocity(e);
    const t = this.generator.next(e).value;
    return js((i) => this.generator.next(i).value, e, t);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(e) {
    const t = this.playbackSpeed !== e;
    t && this.driver && this.updateTime(Z.now()), this.playbackSpeed = e, t && this.driver && (this.time = se(this.currentTime));
  }
  play() {
    if (this.isStopped) return;
    const { driver: e = Ca, startTime: t } = this.options;
    this.driver || (this.driver = e((s) => this.tick(s))), this.options.onPlay?.();
    const i = this.driver.now();
    this.state === "finished" ? (this.updateFinished(), this.startTime = i) : this.holdTime !== null ? this.startTime = i - this.holdTime : this.startTime || (this.startTime = t ?? i), this.state === "finished" && this.speed < 0 && (this.startTime += this.calculatedDuration), this.holdTime = null, this.state = "running", this.driver.start();
  }
  pause() {
    this.state = "paused", this.updateTime(Z.now()), this.holdTime = this.currentTime;
  }
  complete() {
    this.state !== "running" && this.play(), this.state = "finished", this.holdTime = null;
  }
  finish() {
    this.notifyFinished(), this.teardown(), this.state = "finished", this.options.onComplete?.();
  }
  cancel() {
    this.holdTime = null, this.startTime = 0, this.tick(0), this.teardown(), this.options.onCancel?.();
  }
  teardown() {
    this.state = "idle", this.stopDriver(), this.startTime = this.holdTime = null;
  }
  stopDriver() {
    this.driver && (this.driver.stop(), this.driver = void 0);
  }
  sample(e) {
    return this.startTime = 0, this.tick(e, !0);
  }
  attachTimeline(e) {
    return this.options.allowFlatten && (this.options.type = "keyframes", this.options.ease = "linear", this.initAnimation()), this.driver?.stop(), e.observe(this);
  }
};
function La(e) {
  for (let t = 1; t < e.length; t++) e[t] ?? (e[t] = e[t - 1]);
}
var Ae = (e) => e * 180 / Math.PI, Gt = (e) => {
  const t = Ae(Math.atan2(e[1], e[0]));
  return $t(t);
}, Ua = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (e) => (Math.abs(e[0]) + Math.abs(e[3])) / 2,
  rotate: Gt,
  rotateZ: Gt,
  skewX: (e) => Ae(Math.atan(e[1])),
  skewY: (e) => Ae(Math.atan(e[2])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[2])) / 2
}, $t = (e) => (e = e % 360, e < 0 && (e += 360), e), ji = Gt, qi = (e) => Math.sqrt(e[0] * e[0] + e[1] * e[1]), Xi = (e) => Math.sqrt(e[4] * e[4] + e[5] * e[5]), Wa = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: qi,
  scaleY: Xi,
  scale: (e) => (qi(e) + Xi(e)) / 2,
  rotateX: (e) => $t(Ae(Math.atan2(e[6], e[5]))),
  rotateY: (e) => $t(Ae(Math.atan2(-e[2], e[0]))),
  rotateZ: ji,
  rotate: ji,
  skewX: (e) => Ae(Math.atan(e[4])),
  skewY: (e) => Ae(Math.atan(e[1])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[4])) / 2
};
function Kt(e) {
  return e.includes("scale") ? 1 : 0;
}
function Ht(e, t) {
  if (!e || e === "none") return Kt(t);
  const i = e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let s, r;
  if (i)
    s = Wa, r = i;
  else {
    const o = e.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    s = Ua, r = o;
  }
  if (!r) return Kt(t);
  const n = s[t], a = r[1].split(",").map($a);
  return typeof n == "function" ? n(a) : a[n];
}
var Ga = (e, t) => {
  const { transform: i = "none" } = getComputedStyle(e);
  return Ht(i, t);
};
function $a(e) {
  return parseFloat(e.trim());
}
var Ke = [
  "transformPerspective",
  "x",
  "y",
  "z",
  "translateX",
  "translateY",
  "translateZ",
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "skew",
  "skewX",
  "skewY"
], He = /* @__PURE__ */ new Set([...Ke, "pathRotation"]), Yi = (e) => e === Ge || e === P, Ka = /* @__PURE__ */ new Set([
  "x",
  "y",
  "z"
]), Ha = Ke.filter((e) => !Ka.has(e));
function ja(e) {
  const t = [];
  return Ha.forEach((i) => {
    const s = e.getValue(i);
    s !== void 0 && (t.push([i, s.get()]), s.set(i.startsWith("scale") ? 1 : 0));
  }), t;
}
var be = {
  width: ({ x: e }, { paddingLeft: t = "0", paddingRight: i = "0", boxSizing: s }) => {
    const r = e.max - e.min;
    return s === "border-box" ? r : r - parseFloat(t) - parseFloat(i);
  },
  height: ({ y: e }, { paddingTop: t = "0", paddingBottom: i = "0", boxSizing: s }) => {
    const r = e.max - e.min;
    return s === "border-box" ? r : r - parseFloat(t) - parseFloat(i);
  },
  top: (e, { top: t }) => parseFloat(t),
  left: (e, { left: t }) => parseFloat(t),
  bottom: ({ y: e }, { top: t }) => parseFloat(t) + (e.max - e.min),
  right: ({ x: e }, { left: t }) => parseFloat(t) + (e.max - e.min),
  x: (e, { transform: t }) => Ht(t, "x"),
  y: (e, { transform: t }) => Ht(t, "y")
};
be.translateX = be.x;
be.translateY = be.y;
var Pe = /* @__PURE__ */ new Set(), jt = !1, qt = !1, Xt = !1;
function Zs() {
  if (qt) {
    const e = Array.from(Pe).filter((s) => s.needsMeasurement), t = new Set(e.map((s) => s.element)), i = /* @__PURE__ */ new Map();
    t.forEach((s) => {
      const r = ja(s);
      r.length && (i.set(s, r), s.render());
    }), e.forEach((s) => s.measureInitialState()), t.forEach((s) => {
      s.render();
      const r = i.get(s);
      r && r.forEach(([n, a]) => {
        s.getValue(n)?.set(a);
      });
    }), e.forEach((s) => s.measureEndState()), e.forEach((s) => {
      s.suspendedScrollY !== void 0 && window.scrollTo(0, s.suspendedScrollY);
    });
  }
  qt = !1, jt = !1, Pe.forEach((e) => e.complete(Xt)), Pe.clear();
}
function Qs() {
  Pe.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (qt = !0);
  });
}
function qa() {
  Xt = !0, Qs(), Zs(), Xt = !1;
}
var gi = class {
  constructor(e, t, i, s, r, n = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...e], this.onComplete = t, this.name = i, this.motionValue = s, this.element = r, this.isAsync = n;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (Pe.add(this), jt || (jt = !0, ne.read(Qs), ne.resolveKeyframes(Zs))) : (this.readKeyframes(), this.complete());
  }
  readKeyframes() {
    const { unresolvedKeyframes: e, name: t, element: i, motionValue: s } = this;
    if (e[0] === null) {
      const r = s?.get(), n = e[e.length - 1];
      if (r !== void 0) e[0] = r;
      else if (i && t) {
        const a = i.readValue(t, n);
        a != null && (e[0] = a);
      }
      e[0] === void 0 && (e[0] = n), s && r === void 0 && s.set(e[0]);
    }
    La(e);
  }
  setFinalKeyframe() {
  }
  measureInitialState() {
  }
  renderEndStyles() {
  }
  measureEndState() {
  }
  complete(e = !1) {
    this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, e), Pe.delete(this);
  }
  cancel() {
    this.state === "scheduled" && (Pe.delete(this), this.state = "pending");
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}, Xa = (e) => e.startsWith("--");
function Js(e, t, i) {
  Xa(t) ? e.style.setProperty(t, i) : e.style[t] = i;
}
var Ya = {};
function er(e, t) {
  const i = /* @__PURE__ */ ws(e);
  return () => Ya[t] ?? i();
}
var Za = /* @__PURE__ */ er(() => window.ScrollTimeline !== void 0, "scrollTimeline"), tr = /* @__PURE__ */ er(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), it = ([e, t, i, s]) => `cubic-bezier(${e}, ${t}, ${i}, ${s})`, Zi = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ it([
    0,
    0.65,
    0.55,
    1
  ]),
  circOut: /* @__PURE__ */ it([
    0.55,
    0,
    1,
    0.45
  ]),
  backIn: /* @__PURE__ */ it([
    0.31,
    0.01,
    0.66,
    -0.59
  ]),
  backOut: /* @__PURE__ */ it([
    0.33,
    1.53,
    0.69,
    0.99
  ])
};
function ir(e, t) {
  if (e) return typeof e == "function" ? tr() ? $s(e, t) : "ease-out" : Ds(e) ? it(e) : Array.isArray(e) ? e.map((i) => ir(i, t) || Zi.easeOut) : Zi[e];
}
function Qa(e, t, i, { delay: s = 0, duration: r = 300, repeat: n = 0, repeatType: a = "loop", ease: o = "easeOut", times: l } = {}, c = void 0) {
  const h = { [t]: i };
  l && (h.offset = l);
  const u = ir(o, r);
  Array.isArray(u) && (h.easing = u);
  const d = {
    delay: s,
    duration: r,
    easing: Array.isArray(u) ? "linear" : u,
    fill: "both",
    iterations: n + 1,
    direction: a === "reverse" ? "alternate" : "normal"
  };
  return c && (d.pseudoElement = c), e.animate(h, d);
}
function yi(e) {
  return typeof e == "function" && "applyToOptions" in e;
}
function Ja({ type: e, ...t }) {
  return yi(e) && tr() ? e.applyToOptions(t) : (t.duration ?? (t.duration = 300), t.ease ?? (t.ease = "easeOut"), t);
}
var sr = class extends mi {
  constructor(e) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !e) return;
    const { element: t, name: i, keyframes: s, pseudoElement: r, allowFlatten: n = !1, finalKeyframe: a, onComplete: o } = e;
    this.isPseudoElement = !!r, this.allowFlatten = n, this.options = e, he(typeof e.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
    const l = Ja(e);
    this.animation = Qa(t, i, s, l, r), l.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !r) {
        const c = Mt(s, this.options, a, this.speed);
        this.updateMotionValue && this.updateMotionValue(c), Js(t, i, c), this.animation.cancel();
      }
      o?.(), this.notifyFinished();
    };
  }
  play() {
    this.isStopped || (this.manualStartTime = null, this.animation.play(), this.state === "finished" && this.updateFinished());
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    this.animation.finish?.();
  }
  cancel() {
    try {
      this.animation.cancel();
    } catch {
    }
  }
  stop() {
    if (this.isStopped) return;
    this.isStopped = !0;
    const { state: e } = this;
    e === "idle" || e === "finished" || (this.updateMotionValue ? this.updateMotionValue() : this.commitStyles(), this.isPseudoElement || this.cancel());
  }
  commitStyles() {
    const e = this.options?.element;
    !this.isPseudoElement && e?.isConnected && this.animation.commitStyles?.();
  }
  get duration() {
    const e = this.animation.effect?.getComputedTiming?.().duration || 0;
    return se(Number(e));
  }
  get iterationDuration() {
    const { delay: e = 0 } = this.options || {};
    return this.duration + se(e);
  }
  get time() {
    return se(Number(this.animation.currentTime) || 0);
  }
  set time(e) {
    const t = this.finishedTime !== null;
    this.manualStartTime = null, this.finishedTime = null, this.animation.currentTime = Q(e), t && this.animation.pause();
  }
  get speed() {
    return this.animation.playbackRate;
  }
  set speed(e) {
    e < 0 && (this.finishedTime = null), this.animation.playbackRate = e;
  }
  get state() {
    return this.finishedTime !== null ? "finished" : this.animation.playState;
  }
  get startTime() {
    return this.manualStartTime ?? Number(this.animation.startTime);
  }
  set startTime(e) {
    this.manualStartTime = this.animation.startTime = e;
  }
  attachTimeline({ timeline: e, rangeStart: t, rangeEnd: i, observe: s }) {
    return this.allowFlatten && this.animation.effect?.updateTiming({ easing: "linear" }), this.animation.onfinish = null, e && Za() ? (this.animation.timeline = e, t && (this.animation.rangeStart = t), i && (this.animation.rangeEnd = i), We) : s(this);
  }
}, rr = {
  anticipate: Bs,
  backInOut: Ps,
  circInOut: ks
};
function eo(e) {
  return e in rr;
}
function to(e) {
  typeof e.ease == "string" && eo(e.ease) && (e.ease = rr[e.ease]);
}
var Bt = 10, io = class extends sr {
  constructor(e) {
    to(e), Ys(e), super(e), e.startTime !== void 0 && e.autoplay !== !1 && (this.startTime = e.startTime), this.options = e;
  }
  updateMotionValue(e) {
    const { motionValue: t, onUpdate: i, onComplete: s, element: r, ...n } = this.options;
    if (!t) return;
    if (e !== void 0) {
      t.set(e);
      return;
    }
    const a = new wt({
      ...n,
      autoplay: !1
    }), o = Math.max(Bt, Z.now() - this.startTime), l = we(0, Bt, o - Bt), c = a.sample(o).value, { name: h } = this.options;
    r && h && Js(r, h, c), t.setWithVelocity(a.sample(Math.max(0, o - l)).value, c, l), a.stop();
  }
}, Qi = (e, t) => t === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && (re.test(e) || e === "0") && !e.startsWith("url("));
function so(e) {
  const t = e[0];
  if (e.length === 1) return !0;
  for (let i = 0; i < e.length; i++) if (e[i] !== t) return !0;
}
function ro(e, t, i, s) {
  const r = e[0];
  if (r === null) return !1;
  if (t === "display" || t === "visibility") return !0;
  const n = e[e.length - 1], a = Qi(r, t), o = Qi(n, t);
  return Ue(a === o, `You are trying to animate ${t} from "${r}" to "${n}". "${a ? n : r}" is not an animatable value.`, "value-not-animatable"), !a || !o ? !1 : so(e) || (i === "spring" || yi(i)) && s;
}
function Yt(e) {
  e.duration = 0, e.type = "keyframes";
}
var nr = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform",
  "backgroundColor"
]), no = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function ao(e) {
  for (let t = 0; t < e.length; t++) if (typeof e[t] == "string" && no.test(e[t])) return !0;
  return !1;
}
var oo = /* @__PURE__ */ new Set([
  "color",
  "backgroundColor",
  "outlineColor",
  "fill",
  "stroke",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor"
]), lo = /* @__PURE__ */ ws(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function co(e) {
  const { motionValue: t, name: i, repeatDelay: s, repeatType: r, damping: n, type: a, keyframes: o } = e, l = t?.owner?.current;
  if (!(l instanceof HTMLElement) && !(l instanceof SVGElement)) return !1;
  const { onUpdate: c, transformTemplate: h } = t.owner.getProps();
  return lo() && i && (nr.has(i) || oo.has(i) && ao(o)) && (i !== "transform" || !h) && !c && !s && r !== "mirror" && n !== 0 && a !== "inertia";
}
var ho = 40, uo = class extends mi {
  constructor({ autoplay: e = !0, delay: t = 0, type: i = "keyframes", repeat: s = 0, repeatDelay: r = 0, repeatType: n = "loop", keyframes: a, name: o, motionValue: l, element: c, ...h }) {
    super(), this.stop = () => {
      this._animation && (this._animation.stop(), this.stopTimeline?.()), this.keyframeResolver?.cancel();
    }, this.createdAt = Z.now();
    const u = {
      autoplay: e,
      delay: t,
      type: i,
      repeat: s,
      repeatDelay: r,
      repeatType: n,
      name: o,
      motionValue: l,
      element: c,
      ...h
    }, d = c?.KeyframeResolver || gi;
    this.keyframeResolver = new d(a, (g, p, y) => this.onKeyframesResolved(g, p, u, !y), o, l, c), this.keyframeResolver?.scheduleResolve();
  }
  onKeyframesResolved(e, t, i, s) {
    this.keyframeResolver = void 0;
    const { name: r, type: n, velocity: a, delay: o, isHandoff: l, onUpdate: c } = i;
    this.resolvedAt = Z.now();
    let h = !0;
    ro(e, r, n, a) || (h = !1, (Se.instantAnimations || !o) && c?.(Mt(e, i, t)), e[0] = e[e.length - 1], Yt(i), i.repeat = 0);
    const u = {
      startTime: s ? this.resolvedAt ? this.resolvedAt - this.createdAt > ho ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
      finalKeyframe: t,
      ...i,
      keyframes: e
    }, d = h && !l && co(u), g = u.motionValue?.owner?.current;
    let p;
    if (d) try {
      p = new io({
        ...u,
        element: g
      });
    } catch {
      p = new wt(u);
    }
    else p = new wt(u);
    p.finished.then(() => {
      this.notifyFinished();
    }).catch(We), this.pendingTimeline && (this.stopTimeline = p.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = p;
  }
  get finished() {
    return this._animation ? this.animation.finished : this._finished;
  }
  then(e, t) {
    return this.finished.finally(e).then(() => {
    });
  }
  get animation() {
    return this._animation || (this.keyframeResolver?.resume(), qa()), this._animation;
  }
  get duration() {
    return this.animation.duration;
  }
  get iterationDuration() {
    return this.animation.iterationDuration;
  }
  get time() {
    return this.animation.time;
  }
  set time(e) {
    this.animation.time = e;
  }
  get speed() {
    return this.animation.speed;
  }
  get state() {
    return this.animation.state;
  }
  set speed(e) {
    this.animation.speed = e;
  }
  get startTime() {
    return this.animation.startTime;
  }
  attachTimeline(e) {
    return this._animation ? this.stopTimeline = this.animation.attachTimeline(e) : this.pendingTimeline = e, () => this.stop();
  }
  play() {
    this.animation.play();
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    this.animation.complete();
  }
  cancel() {
    this._animation && this.animation.cancel(), this.keyframeResolver?.cancel();
  }
}, po = class {
  constructor(e) {
    this.stop = () => this.runAll("stop"), this.animations = e.filter(Boolean);
  }
  get finished() {
    return Promise.all(this.animations.map((e) => e.finished));
  }
  getAll(e) {
    return this.animations[0][e];
  }
  setAll(e, t) {
    for (let i = 0; i < this.animations.length; i++) this.animations[i][e] = t;
  }
  attachTimeline(e) {
    const t = this.animations.map((i) => i.attachTimeline(e));
    return () => {
      t.forEach((i, s) => {
        i && i(), this.animations[s].stop();
      });
    };
  }
  get time() {
    return this.getAll("time");
  }
  set time(e) {
    this.setAll("time", e);
  }
  get speed() {
    return this.getAll("speed");
  }
  set speed(e) {
    this.setAll("speed", e);
  }
  get state() {
    return this.getAll("state");
  }
  get startTime() {
    return this.getAll("startTime");
  }
  get duration() {
    return Ji(this.animations, "duration");
  }
  get iterationDuration() {
    return Ji(this.animations, "iterationDuration");
  }
  runAll(e) {
    this.animations.forEach((t) => t[e]());
  }
  play() {
    this.runAll("play");
  }
  pause() {
    this.runAll("pause");
  }
  cancel() {
    this.runAll("cancel");
  }
  complete() {
    this.runAll("complete");
  }
};
function Ji(e, t) {
  let i = 0;
  for (let s = 0; s < e.length; s++) {
    const r = e[s][t];
    r !== null && r > i && (i = r);
  }
  return i;
}
var fo = class extends po {
  then(e, t) {
    return this.finished.finally(e).then(() => {
    });
  }
}, es = 30, mo = (e) => !isNaN(parseFloat(e)), ts = { current: void 0 }, go = class {
  constructor(e, t = {}) {
    this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (i) => {
      const s = Z.now();
      if (this.updatedAt !== s && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(i), this.current !== this.prev && (this.events.change?.notify(this.current), this.dependents))
        for (const r of this.dependents) r.dirty();
    }, this.hasAnimated = !1, this.setCurrent(e), this.owner = t.owner;
  }
  setCurrent(e) {
    this.current = e, this.updatedAt = Z.now(), this.canTrackVelocity === null && e !== void 0 && (this.canTrackVelocity = mo(this.current));
  }
  setPrevFrameValue(e = this.current) {
    this.prevFrameValue = e, this.prevUpdatedAt = this.updatedAt;
  }
  onChange(e) {
    return process.env.NODE_ENV !== "production" && Ms(!1, 'value.onChange(callback) is deprecated. Switch to value.on("change", callback).'), this.on("change", e);
  }
  on(e, t) {
    this.events[e] || (this.events[e] = new Ss());
    const i = this.events[e].add(t);
    return e === "change" ? () => {
      i(), ne.read(() => {
        this.events.change.getSize() || this.stop();
      });
    } : i;
  }
  clearListeners() {
    for (const e in this.events) this.events[e].clear();
  }
  attach(e, t) {
    this.passiveEffect = e, this.stopPassiveEffect = t;
  }
  set(e) {
    this.passiveEffect ? this.passiveEffect(e, this.updateAndNotify) : this.updateAndNotify(e);
  }
  setWithVelocity(e, t, i) {
    this.set(t), this.prev = void 0, this.prevFrameValue = e, this.prevUpdatedAt = this.updatedAt - i;
  }
  jump(e, t = !0) {
    this.updateAndNotify(e), this.prev = e, this.prevUpdatedAt = this.prevFrameValue = void 0, t && this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
  dirty() {
    this.events.change?.notify(this.current);
  }
  addDependent(e) {
    this.dependents || (this.dependents = /* @__PURE__ */ new Set()), this.dependents.add(e);
  }
  removeDependent(e) {
    this.dependents && this.dependents.delete(e);
  }
  get() {
    return ts.current && ts.current.push(this), this.current;
  }
  getPrevious() {
    return this.prev;
  }
  getVelocity() {
    const e = Z.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || e - this.updatedAt > es) return 0;
    const t = Math.min(this.updatedAt - this.prevUpdatedAt, es);
    return Ts(parseFloat(this.current) - parseFloat(this.prevFrameValue), t);
  }
  start(e) {
    return this.stop(), new Promise((t) => {
      this.hasAnimated = !0, this.animation = e(t), this.events.animationStart && this.events.animationStart.notify();
    }).then(() => {
      this.events.animationComplete && this.events.animationComplete.notify(), this.clearAnimation();
    });
  }
  stop() {
    this.animation && (this.animation.stop(), this.events.animationCancel && this.events.animationCancel.notify()), this.clearAnimation();
  }
  isAnimating() {
    return !!this.animation;
  }
  clearAnimation() {
    delete this.animation;
  }
  destroy() {
    this.dependents?.clear(), this.events.destroy?.notify(), this.clearListeners(), this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
};
function Oe(e, t) {
  return new go(e, t);
}
function ar(e, t) {
  if (e?.inherit && t) {
    const { inherit: i, ...s } = e;
    return {
      ...t,
      ...s
    };
  }
  return e;
}
function or(e, t) {
  const i = e?.[t] ?? e?.default ?? e;
  return i !== e ? ar(i, e) : i;
}
var yo = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, vo = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), xo = {
  type: "keyframes",
  duration: 0.8
}, bo = {
  type: "keyframes",
  ease: [
    0.25,
    0.1,
    0.35,
    1
  ],
  duration: 0.3
}, wo = (e, { keyframes: t }) => t.length > 2 ? xo : He.has(e) ? e.startsWith("scale") ? vo(t[1]) : yo : bo, So = /* @__PURE__ */ new Set([
  "when",
  "delay",
  "delayChildren",
  "staggerChildren",
  "staggerDirection",
  "repeat",
  "repeatType",
  "repeatDelay",
  "from",
  "elapsed"
]);
function To(e) {
  for (const t in e) if (!So.has(t)) return !0;
  return !1;
}
var lr = (e, t, i, s = {}, r, n) => (a) => {
  const o = or(s, e) || {}, l = o.delay || s.delay || 0;
  let { elapsed: c = 0 } = s;
  c = c - Q(l);
  const h = {
    keyframes: Array.isArray(i) ? i : [null, i],
    ease: "easeOut",
    velocity: t.getVelocity(),
    ...o,
    delay: -c,
    onUpdate: (d) => {
      t.set(d), o.onUpdate && o.onUpdate(d);
    },
    onComplete: () => {
      a(), o.onComplete && o.onComplete();
    },
    name: e,
    motionValue: t,
    element: n ? void 0 : r
  };
  To(o) || Object.assign(h, wo(e, h)), h.duration && (h.duration = Q(h.duration)), h.repeatDelay && (h.repeatDelay = Q(h.repeatDelay)), h.from !== void 0 && (h.keyframes[0] = h.from);
  let u = !1;
  if ((h.type === !1 || h.duration === 0 && !h.repeatDelay) && (Yt(h), h.delay === 0 && (u = !0)), (Se.instantAnimations || Se.skipAnimations || r?.shouldSkipAnimations || o.skipAnimations) && (u = !0, Yt(h), h.delay = 0), h.allowFlatten = !o.type && !o.ease, u && !n && t.get() !== void 0) {
    const d = Mt(h.keyframes, o);
    if (d !== void 0) {
      ne.update(() => {
        h.onUpdate(d), h.onComplete();
      });
      return;
    }
  }
  return o.isSync ? new wt(h) : new uo(h);
}, Mo = /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;
function Co(e) {
  const t = Mo.exec(e);
  if (!t) return [,];
  const [, i, s, r] = t;
  return [`--${i ?? s}`, r];
}
var _o = 4;
function cr(e, t, i = 1) {
  he(i <= _o, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [s, r] = Co(e);
  if (!s) return;
  const n = window.getComputedStyle(t).getPropertyValue(s);
  if (n) {
    const a = n.trim();
    return xs(a) ? parseFloat(a) : a;
  }
  return hi(r) ? cr(r, t, i + 1) : r;
}
function is(e) {
  const t = [{}, {}];
  return e?.values.forEach((i, s) => {
    t[0][s] = i.get(), t[1][s] = i.getVelocity();
  }), t;
}
function hr(e, t, i, s) {
  if (typeof t == "function") {
    const [r, n] = is(s);
    t = t(i !== void 0 ? i : e.custom, r, n);
  }
  if (typeof t == "string" && (t = e.variants && e.variants[t]), typeof t == "function") {
    const [r, n] = is(s);
    t = t(i !== void 0 ? i : e.custom, r, n);
  }
  return t;
}
function Ao(e, t, i) {
  const s = e.getProps();
  return hr(s, t, i !== void 0 ? i : s.custom, e);
}
var ur = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...Ke
]), Po = (e) => Array.isArray(e);
function Bo(e, t, i) {
  e.hasValue(t) ? e.getValue(t).set(i) : e.addValue(t, Oe(i));
}
function ko(e) {
  return Po(e) ? e[e.length - 1] || 0 : e;
}
function Eo(e, t) {
  let { transitionEnd: i = {}, transition: s = {}, ...r } = Ao(e, t) || {};
  r = {
    ...r,
    ...i
  };
  for (const n in r) Bo(e, n, ko(r[n]));
}
var H = (e) => !!(e && e.getVelocity);
function zo(e) {
  return !!(H(e) && e.add);
}
function Vo(e, t) {
  const i = e.getValue("willChange");
  if (zo(i)) return i.add(t);
  if (!i && Se.WillChange) {
    const s = new Se.WillChange("auto");
    e.addValue("willChange", s), s.add(t);
  }
}
function vi(e) {
  return e.replace(/([A-Z])/g, (t) => `-${t.toLowerCase()}`);
}
var Do = "framerAppearId", Ro = "data-" + vi(Do);
function Fo(e) {
  return e.props[Ro];
}
function Io({ protectedKeys: e, needsAnimating: t }, i) {
  const s = e.hasOwnProperty(i) && t[i] !== !0;
  return t[i] = !1, s;
}
function No(e, t, { delay: i = 0, transitionOverride: s, type: r } = {}) {
  let { transition: n, transitionEnd: a, ...o } = t;
  const l = e.getDefaultTransition();
  n = n ? ar(n, l) : l;
  const c = n?.reduceMotion, h = n?.skipAnimations;
  s && (n = s);
  const u = [], d = r && e.animationState && e.animationState.getState()[r], g = n?.path;
  g && g.animateVisualElement(e, o, n, i, u);
  for (const p in o) {
    const y = e.getValue(p, e.latestValues[p] ?? null), m = o[p];
    if (m === void 0 || d && Io(d, p)) continue;
    const x = {
      delay: i,
      ...or(n || {}, p)
    };
    h && (x.skipAnimations = !0);
    const A = y.get();
    if (A !== void 0 && !y.isAnimating() && !Array.isArray(m) && m === A && !x.velocity) {
      ne.update(() => y.set(m));
      continue;
    }
    let v = !1;
    if (window.MotionHandoffAnimation) {
      const C = Fo(e);
      if (C) {
        const w = window.MotionHandoffAnimation(C, p, ne);
        w !== null && (x.startTime = w, v = !0);
      }
    }
    Vo(e, p);
    const b = c ?? e.shouldReduceMotion;
    y.start(lr(p, y, m, b && ur.has(p) ? { type: !1 } : x, e, v));
    const S = y.animation;
    S && u.push(S);
  }
  if (a) {
    const p = () => ne.update(() => {
      a && Eo(e, a);
    });
    u.length ? Promise.all(u).then(p) : p();
  }
  return u;
}
var Oo = {
  test: (e) => e === "auto",
  parse: (e) => e
}, dr = (e) => (t) => t.test(e), pr = [
  Ge,
  P,
  Re,
  oe,
  aa,
  na,
  Oo
], ss = (e) => pr.find(dr(e));
function Lo(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || bs(e) : !0;
}
var Uo = /* @__PURE__ */ new Set([
  "brightness",
  "contrast",
  "saturate",
  "opacity"
]);
function Wo(e) {
  const [t, i] = e.slice(0, -1).split("(");
  if (t === "drop-shadow") return e;
  const [s] = i.match(ui) || [];
  if (!s) return e;
  const r = i.replace(s, "");
  let n = Uo.has(t) ? 1 : 0;
  return s !== i && (n *= 100), t + "(" + n + r + ")";
}
var Go = /\b([a-z-]*)\(.*?\)/gu, Zt = {
  ...re,
  getAnimatableNone: (e) => {
    const t = e.match(Go);
    return t ? t.map(Wo).join(" ") : e;
  }
}, Qt = {
  ...re,
  getAnimatableNone: (e) => {
    const t = re.parse(e);
    return re.createTransformer(e)(t.map((i) => typeof i == "number" ? 0 : typeof i == "object" ? {
      ...i,
      alpha: 1
    } : i));
  }
}, rs = {
  ...Ge,
  transform: Math.round
}, $o = {
  rotate: oe,
  pathRotation: oe,
  rotateX: oe,
  rotateY: oe,
  rotateZ: oe,
  scale: gt,
  scaleX: gt,
  scaleY: gt,
  scaleZ: gt,
  skew: oe,
  skewX: oe,
  skewY: oe,
  distance: P,
  translateX: P,
  translateY: P,
  translateZ: P,
  x: P,
  y: P,
  z: P,
  perspective: P,
  transformPerspective: P,
  opacity: at,
  originX: Ui,
  originY: Ui,
  originZ: P
}, St = {
  borderWidth: P,
  borderTopWidth: P,
  borderRightWidth: P,
  borderBottomWidth: P,
  borderLeftWidth: P,
  borderRadius: P,
  borderTopLeftRadius: P,
  borderTopRightRadius: P,
  borderBottomRightRadius: P,
  borderBottomLeftRadius: P,
  width: P,
  maxWidth: P,
  height: P,
  maxHeight: P,
  top: P,
  right: P,
  bottom: P,
  left: P,
  inset: P,
  insetBlock: P,
  insetBlockStart: P,
  insetBlockEnd: P,
  insetInline: P,
  insetInlineStart: P,
  insetInlineEnd: P,
  padding: P,
  paddingTop: P,
  paddingRight: P,
  paddingBottom: P,
  paddingLeft: P,
  paddingBlock: P,
  paddingBlockStart: P,
  paddingBlockEnd: P,
  paddingInline: P,
  paddingInlineStart: P,
  paddingInlineEnd: P,
  margin: P,
  marginTop: P,
  marginRight: P,
  marginBottom: P,
  marginLeft: P,
  marginBlock: P,
  marginBlockStart: P,
  marginBlockEnd: P,
  marginInline: P,
  marginInlineStart: P,
  marginInlineEnd: P,
  fontSize: P,
  backgroundPositionX: P,
  backgroundPositionY: P,
  ...$o,
  zIndex: rs,
  fillOpacity: at,
  strokeOpacity: at,
  numOctaves: rs
}, Ko = {
  ...St,
  color: U,
  backgroundColor: U,
  outlineColor: U,
  fill: U,
  stroke: U,
  borderColor: U,
  borderTopColor: U,
  borderRightColor: U,
  borderBottomColor: U,
  borderLeftColor: U,
  filter: Zt,
  WebkitFilter: Zt,
  mask: Qt,
  WebkitMask: Qt
}, fr = (e) => Ko[e], Ho = /* @__PURE__ */ new Set([Zt, Qt]);
function mr(e, t) {
  let i = fr(e);
  return Ho.has(i) || (i = re), i.getAnimatableNone ? i.getAnimatableNone(t) : void 0;
}
var jo = /* @__PURE__ */ new Set([
  "auto",
  "none",
  "0"
]);
function qo(e, t, i) {
  let s = 0, r;
  for (; s < e.length && !r; ) {
    const n = e[s];
    typeof n == "string" && !jo.has(n) && Ne(n).values.length && (r = e[s]), s++;
  }
  if (r && i) for (const n of t) e[n] = mr(i, r);
}
var Xo = class extends gi {
  constructor(e, t, i, s, r) {
    super(e, t, i, s, r, !0);
  }
  readKeyframes() {
    const { unresolvedKeyframes: e, element: t, name: i } = this;
    if (!t || !t.current) return;
    super.readKeyframes();
    for (let o = 0; o < e.length; o++) {
      let l = e[o];
      if (typeof l == "string" && (l = l.trim(), hi(l))) {
        const c = cr(l, t.current);
        c !== void 0 && (e[o] = c), o === e.length - 1 && (this.finalKeyframe = l);
      }
    }
    if (this.resolveNoneKeyframes(), !ur.has(i) || e.length !== 2) return;
    const [s, r] = e, n = ss(s), a = ss(r);
    if (Li(s) !== Li(r) && be[i]) {
      this.needsMeasurement = !0;
      return;
    }
    if (n !== a)
      if (Yi(n) && Yi(a)) for (let o = 0; o < e.length; o++) {
        const l = e[o];
        typeof l == "string" && (e[o] = parseFloat(l));
      }
      else be[i] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: e, name: t } = this, i = [];
    for (let s = 0; s < e.length; s++) (e[s] === null || Lo(e[s])) && i.push(s);
    i.length && qo(e, i, t);
  }
  measureInitialState() {
    const { element: e, unresolvedKeyframes: t, name: i } = this;
    if (!e || !e.current) return;
    i === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = be[i](e.measureViewportBox(), window.getComputedStyle(e.current)), t[0] = this.measuredOrigin;
    const s = t[t.length - 1];
    s !== void 0 && e.getValue(i, s).jump(s, !1);
  }
  measureEndState() {
    const { element: e, name: t, unresolvedKeyframes: i } = this;
    if (!e || !e.current) return;
    const s = e.getValue(t);
    s && s.jump(this.measuredOrigin, !1);
    const r = i.length - 1, n = i[r];
    i[r] = be[t](e.measureViewportBox(), window.getComputedStyle(e.current)), n !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = n), this.removedTransforms?.length && this.removedTransforms.forEach(([a, o]) => {
      e.getValue(a).set(o);
    }), this.resolveNoneKeyframes();
  }
}, Yo = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius"
];
function Zo(e, t, i) {
  if (e == null) return [];
  if (e instanceof EventTarget) return [e];
  if (typeof e == "string") {
    let s = document;
    t && (s = t.current);
    const r = i?.[e] ?? s.querySelectorAll(e);
    return r ? Array.from(r) : [];
  }
  return Array.from(e).filter((s) => s != null);
}
var Jt = (e, t) => t && typeof e == "number" ? t.transform(e) : e, { schedule: Qo, cancel: Rc } = /* @__PURE__ */ Rs(queueMicrotask, !1);
function gr(e) {
  return Un(e) && "ownerSVGElement" in e;
}
function Jo(e) {
  return gr(e) && e.tagName === "svg";
}
var el = [
  ...pr,
  U,
  re
], tl = (e) => el.find(dr(e)), ns = () => ({
  min: 0,
  max: 0
}), xi = () => ({
  x: ns(),
  y: ns()
}), lt = /* @__PURE__ */ new WeakMap();
function il(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function";
}
function sl(e) {
  return typeof e == "string" || Array.isArray(e);
}
var rl = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], nl = ["initial", ...rl];
function yr(e) {
  return il(e.animate) || nl.some((t) => sl(e[t]));
}
function al(e) {
  return !!(yr(e) || e.variants);
}
function ol(e, t, i) {
  for (const s in t) {
    const r = t[s], n = i[s];
    if (H(r)) e.addValue(s, r);
    else if (H(n)) e.addValue(s, Oe(r, { owner: e }));
    else if (n !== r) if (e.hasValue(s)) {
      const a = e.getValue(s);
      a.liveStyle === !0 ? a.jump(r) : a.hasAnimated || a.set(r);
    } else {
      const a = e.getStaticValue(s);
      e.addValue(s, Oe(a !== void 0 ? a : r, { owner: e }));
    }
  }
  for (const s in i) t[s] === void 0 && e.removeValue(s);
  return t;
}
var ei = { current: null }, vr = { current: !1 }, ll = typeof window < "u";
function cl() {
  if (vr.current = !0, !!ll)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), t = () => ei.current = e.matches;
      e.addEventListener("change", t), t();
    } else ei.current = !1;
}
var as = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
], os = {}, xr = class {
  scrapeMotionValuesFromProps(e, t, i) {
    return {};
  }
  constructor({ parent: e, props: t, presenceContext: i, reducedMotionConfig: s, skipAnimations: r, blockInitialAnimation: n, visualState: a }, o = {}) {
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = gi, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const d = Z.now();
      this.renderScheduledAt < d && (this.renderScheduledAt = d, ne.render(this.render, !1, !0));
    };
    const { latestValues: l, renderState: c } = a;
    this.latestValues = l, this.baseTarget = { ...l }, this.initialValues = t.initial ? { ...l } : {}, this.renderState = c, this.parent = e, this.props = t, this.presenceContext = i, this.depth = e ? e.depth + 1 : 0, this.reducedMotionConfig = s, this.skipAnimationsConfig = r, this.options = o, this.blockInitialAnimation = !!n, this.isControllingVariants = yr(t), this.isVariantNode = al(t), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(e && e.current);
    const { willChange: h, ...u } = this.scrapeMotionValuesFromProps(t, {}, this);
    for (const d in u) {
      const g = u[d];
      l[d] !== void 0 && H(g) && g.set(l[d]);
    }
  }
  mount(e) {
    if (this.hasBeenMounted) for (const t in this.initialValues)
      this.values.get(t)?.jump(this.initialValues[t]), this.latestValues[t] = this.initialValues[t];
    this.current = e, lt.set(e, this), this.projection && !this.projection.instance && this.projection.mount(e), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((t, i) => this.bindToMotionValue(i, t)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (vr.current || cl(), this.shouldReduceMotion = ei.current), process.env.NODE_ENV !== "production" && Ms(this.shouldReduceMotion !== !0, "You have Reduced Motion enabled on your device. Animations may not appear as expected.", "reduced-motion-disabled"), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, this.parent?.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
  }
  unmount() {
    this.projection && this.projection.unmount(), Nt(this.notifyUpdate), Nt(this.render), this.valueSubscriptions.forEach((e) => e()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), this.parent?.removeChild(this);
    for (const e in this.events) this.events[e].clear();
    for (const e in this.features) {
      const t = this.features[e];
      t && (t.unmount(), t.isMounted = !1);
    }
    this.current = null;
  }
  addChild(e) {
    this.children.add(e), this.enteringChildren ?? (this.enteringChildren = /* @__PURE__ */ new Set()), this.enteringChildren.add(e);
  }
  removeChild(e) {
    this.children.delete(e), this.enteringChildren && this.enteringChildren.delete(e);
  }
  bindToMotionValue(e, t) {
    if (this.valueSubscriptions.has(e) && this.valueSubscriptions.get(e)(), t.accelerate && nr.has(e) && this.current instanceof HTMLElement) {
      const { factory: n, keyframes: a, times: o, ease: l, duration: c } = t.accelerate, h = new sr({
        element: this.current,
        name: e,
        keyframes: a,
        times: o,
        ease: l,
        duration: Q(c)
      }), u = n(h);
      this.valueSubscriptions.set(e, () => {
        u(), h.cancel();
      });
      return;
    }
    const i = He.has(e);
    i && this.onBindTransform && this.onBindTransform();
    const s = t.on("change", (n) => {
      this.latestValues[e] = n, this.props.onUpdate && ne.preRender(this.notifyUpdate), i && this.projection && (this.projection.isTransformDirty = !0), this.scheduleRender();
    });
    let r;
    typeof window < "u" && window.MotionCheckAppearSync && (r = window.MotionCheckAppearSync(this, e, t)), this.valueSubscriptions.set(e, () => {
      s(), r && r();
    });
  }
  sortNodePosition(e) {
    return !this.current || !this.sortInstanceNodePosition || this.type !== e.type ? 0 : this.sortInstanceNodePosition(this.current, e.current);
  }
  updateFeatures() {
    let e = "animation";
    for (e in os) {
      const t = os[e];
      if (!t) continue;
      const { isEnabled: i, Feature: s } = t;
      if (!this.features[e] && s && i(this.props) && (this.features[e] = new s(this)), this.features[e]) {
        const r = this.features[e];
        r.isMounted ? r.update() : (r.mount(), r.isMounted = !0);
      }
    }
  }
  triggerBuild() {
    this.build(this.renderState, this.latestValues, this.props);
  }
  measureViewportBox() {
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : xi();
  }
  getStaticValue(e) {
    return this.latestValues[e];
  }
  setStaticValue(e, t) {
    this.latestValues[e] = t;
  }
  update(e, t) {
    (e.transformTemplate || this.props.transformTemplate) && this.scheduleRender(), this.prevProps = this.props, this.props = e, this.prevPresenceContext = this.presenceContext, this.presenceContext = t;
    for (let i = 0; i < as.length; i++) {
      const s = as[i];
      this.propEventSubscriptions[s] && (this.propEventSubscriptions[s](), delete this.propEventSubscriptions[s]);
      const r = e["on" + s];
      r && (this.propEventSubscriptions[s] = this.on(s, r));
    }
    this.prevMotionValues = ol(this, this.scrapeMotionValuesFromProps(e, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
  }
  getProps() {
    return this.props;
  }
  getVariant(e) {
    return this.props.variants ? this.props.variants[e] : void 0;
  }
  getDefaultTransition() {
    return this.props.transition;
  }
  getTransformPagePoint() {
    return this.props.transformPagePoint;
  }
  getClosestVariantNode() {
    return this.isVariantNode ? this : this.parent ? this.parent.getClosestVariantNode() : void 0;
  }
  addVariantChild(e) {
    const t = this.getClosestVariantNode();
    if (t)
      return t.variantChildren && t.variantChildren.add(e), () => t.variantChildren.delete(e);
  }
  addValue(e, t) {
    const i = this.values.get(e);
    t !== i && (i && this.removeValue(e), this.bindToMotionValue(e, t), this.values.set(e, t), this.latestValues[e] = t.get());
  }
  removeValue(e) {
    this.values.delete(e);
    const t = this.valueSubscriptions.get(e);
    t && (t(), this.valueSubscriptions.delete(e)), delete this.latestValues[e], this.removeValueFromRenderState(e, this.renderState);
  }
  hasValue(e) {
    return this.values.has(e);
  }
  getValue(e, t) {
    if (this.props.values && this.props.values[e]) return this.props.values[e];
    let i = this.values.get(e);
    return i === void 0 && t !== void 0 && (i = Oe(t === null ? void 0 : t, { owner: this }), this.addValue(e, i)), i;
  }
  readValue(e, t) {
    let i = this.latestValues[e] !== void 0 || !this.current ? this.latestValues[e] : this.getBaseTargetFromProps(this.props, e) ?? this.readValueFromInstance(this.current, e, this.options);
    return i != null && (typeof i == "string" && (xs(i) || bs(i)) ? i = parseFloat(i) : !tl(i) && re.test(t) && (i = mr(e, t)), this.setBaseTarget(e, H(i) ? i.get() : i)), H(i) ? i.get() : i;
  }
  setBaseTarget(e, t) {
    this.baseTarget[e] = t;
  }
  getBaseTarget(e) {
    const { initial: t } = this.props;
    let i;
    if (typeof t == "string" || typeof t == "object") {
      const r = hr(this.props, t, this.presenceContext?.custom);
      r && (i = r[e]);
    }
    if (t && i !== void 0) return i;
    const s = this.getBaseTargetFromProps(this.props, e);
    return s !== void 0 && !H(s) ? s : this.initialValues[e] !== void 0 && i === void 0 ? void 0 : this.baseTarget[e];
  }
  on(e, t) {
    return this.events[e] || (this.events[e] = new Ss()), this.events[e].add(t);
  }
  notify(e, ...t) {
    this.events[e] && this.events[e].notify(...t);
  }
  scheduleRenderMicrotask() {
    Qo.render(this.render);
  }
}, br = class extends xr {
  constructor() {
    super(...arguments), this.KeyframeResolver = Xo;
  }
  sortInstanceNodePosition(e, t) {
    return e.compareDocumentPosition(t) & 2 ? 1 : -1;
  }
  getBaseTargetFromProps(e, t) {
    const i = e.style;
    return i ? i[t] : void 0;
  }
  removeValueFromRenderState(e, { vars: t, style: i }) {
    delete t[e], delete i[e];
  }
  handleChildMotionValue() {
    this.childSubscription && (this.childSubscription(), delete this.childSubscription);
    const { children: e } = this.props;
    H(e) && (this.childSubscription = e.on("change", (t) => {
      this.current && (this.current.textContent = `${t}`);
    }));
  }
};
function hl({ top: e, left: t, right: i, bottom: s }) {
  return {
    x: {
      min: t,
      max: i
    },
    y: {
      min: e,
      max: s
    }
  };
}
function ul(e, t) {
  if (!t) return e;
  const i = t({
    x: e.left,
    y: e.top
  }), s = t({
    x: e.right,
    y: e.bottom
  });
  return {
    top: i.y,
    left: i.x,
    bottom: s.y,
    right: s.x
  };
}
function dl(e, t) {
  return hl(ul(e.getBoundingClientRect(), t));
}
var pl = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, fl = Ke.length;
function ml(e, t, i) {
  let s = "", r = !0;
  for (let a = 0; a < fl; a++) {
    const o = Ke[a], l = e[o];
    if (l === void 0) continue;
    let c = !0;
    if (typeof l == "number") c = l === (o.startsWith("scale") ? 1 : 0);
    else {
      const h = parseFloat(l);
      c = o.startsWith("scale") ? h === 1 : h === 0;
    }
    if (!c || i) {
      const h = Jt(l, St[o]);
      if (!c) {
        r = !1;
        const u = pl[o] || o;
        s += `${u}(${h}) `;
      }
      i && (t[o] = h);
    }
  }
  const n = e.pathRotation;
  return n && (r = !1, s += `rotate(${Jt(n, St.pathRotation)}) `), s = s.trim(), i ? s = i(t, r ? "" : s) : r && (s = "none"), s;
}
function wr(e, t, i) {
  const { style: s, vars: r, transformOrigin: n } = e;
  let a = !1, o = !1;
  for (const l in t) {
    const c = t[l];
    if (He.has(l)) {
      a = !0;
      continue;
    } else if (Is(l)) {
      r[l] = c;
      continue;
    } else {
      const h = Jt(c, St[l]);
      l.startsWith("origin") ? (o = !0, n[l] = h) : s[l] = h;
    }
  }
  if (t.transform || (a || i ? s.transform = ml(t, e.transform, i) : s.transform && (s.transform = "none")), o) {
    const { originX: l = "50%", originY: c = "50%", originZ: h = 0 } = n;
    s.transformOrigin = `${l} ${c} ${h}`;
  }
}
function Sr(e, { style: t, vars: i }, s, r) {
  const n = e.style;
  let a;
  for (a in t) n[a] = t[a];
  r?.applyProjectionStyles(n, s);
  for (a in i) n.setProperty(a, i[a]);
}
function ls(e, t) {
  return t.max === t.min ? 0 : e / (t.max - t.min) * 100;
}
var Xe = { correct: (e, t) => {
  if (!t.target) return e;
  if (typeof e == "string") if (P.test(e)) e = parseFloat(e);
  else return e;
  return `${ls(e, t.target.x)}% ${ls(e, t.target.y)}%`;
} }, gl = { correct: (e, { treeScale: t, projectionDelta: i }) => {
  const s = e, r = re.parse(e);
  if (r.length > 5) return s;
  const n = re.createTransformer(e), a = typeof r[0] != "number" ? 1 : 0, o = i.x.scale * t.x, l = i.y.scale * t.y;
  r[0 + a] /= o, r[1 + a] /= l;
  const c = $e(o, l, 0.5);
  return typeof r[2 + a] == "number" && (r[2 + a] /= c), typeof r[3 + a] == "number" && (r[3 + a] /= c), n(r);
} }, yl = {
  borderRadius: {
    ...Xe,
    applyTo: [...Yo]
  },
  borderTopLeftRadius: Xe,
  borderTopRightRadius: Xe,
  borderBottomLeftRadius: Xe,
  borderBottomRightRadius: Xe,
  boxShadow: gl
};
function vl(e, { layout: t, layoutId: i }) {
  return He.has(e) || e.startsWith("origin") || (t || i !== void 0) && (!!yl[e] || e === "opacity");
}
function Tr(e, t, i) {
  const s = e.style, r = t?.style, n = {};
  if (!s) return n;
  for (const a in s) (H(s[a]) || r && H(r[a]) || vl(a, e) || i?.getValue(a)?.liveStyle !== void 0) && (n[a] = s[a]);
  return n;
}
function xl(e) {
  return window.getComputedStyle(e);
}
var bl = class extends br {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = Sr;
  }
  mount(e) {
    he(!!e.style, "motion.create() components must forward their ref to a HTML or SVG element", "custom-component-ref"), super.mount(e);
  }
  readValueFromInstance(e, t) {
    if (He.has(t)) return this.projection?.isProjecting ? Kt(t) : Ga(e, t);
    {
      const i = xl(e), s = (Is(t) ? i.getPropertyValue(t) : i[t]) || 0;
      return typeof s == "string" ? s.trim() : s;
    }
  }
  measureInstanceViewportBox(e, { transformPagePoint: t }) {
    return dl(e, t);
  }
  build(e, t, i) {
    wr(e, t, i.transformTemplate);
  }
  scrapeMotionValuesFromProps(e, t, i) {
    return Tr(e, t, i);
  }
};
function wl(e, t) {
  return e in t;
}
var Sl = class extends xr {
  constructor() {
    super(...arguments), this.type = "object";
  }
  readValueFromInstance(e, t) {
    if (wl(t, e)) {
      const i = e[t];
      if (typeof i == "string" || typeof i == "number") return i;
    }
  }
  getBaseTargetFromProps() {
  }
  removeValueFromRenderState(e, t) {
    delete t.output[e];
  }
  measureInstanceViewportBox() {
    return xi();
  }
  build(e, t) {
    Object.assign(e.output, t);
  }
  renderInstance(e, { output: t }) {
    Object.assign(e, t);
  }
  sortInstanceNodePosition() {
    return 0;
  }
}, Tl = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, Ml = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function Cl(e, t, i = 1, s = 0, r = !0) {
  e.pathLength = 1;
  const n = r ? Tl : Ml;
  e[n.offset] = `${-s}`, e[n.array] = `${t} ${i}`;
}
var _l = [
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function Al(e, { attrX: t, attrY: i, attrScale: s, pathLength: r, pathSpacing: n = 1, pathOffset: a = 0, ...o }, l, c, h) {
  if (wr(e, o, c), l) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: u, style: d } = e;
  u.transform && (d.transform = u.transform, delete u.transform), (d.transform || u.transformOrigin) && (d.transformOrigin = u.transformOrigin ?? "50% 50%", delete u.transformOrigin), d.transform && (d.transformBox = h?.transformBox ?? "fill-box", delete u.transformBox);
  for (const g of _l) u[g] !== void 0 && (d[g] = u[g], delete u[g]);
  t !== void 0 && (u.x = t), i !== void 0 && (u.y = i), s !== void 0 && (u.scale = s), r !== void 0 && Cl(u, r, n, a, !1);
}
var Mr = /* @__PURE__ */ new Set([
  "baseFrequency",
  "diffuseConstant",
  "kernelMatrix",
  "kernelUnitLength",
  "keySplines",
  "keyTimes",
  "limitingConeAngle",
  "markerHeight",
  "markerWidth",
  "numOctaves",
  "targetX",
  "targetY",
  "surfaceScale",
  "specularConstant",
  "specularExponent",
  "stdDeviation",
  "tableValues",
  "viewBox",
  "gradientTransform",
  "pathLength",
  "startOffset",
  "textLength",
  "lengthAdjust"
]), Pl = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function Bl(e, t, i, s) {
  Sr(e, t, void 0, s);
  for (const r in t.attrs) e.setAttribute(Mr.has(r) ? r : vi(r), t.attrs[r]);
}
function kl(e, t, i) {
  const s = Tr(e, t, i);
  for (const r in e) if (H(e[r]) || H(t[r])) {
    const n = Ke.indexOf(r) !== -1 ? "attr" + r.charAt(0).toUpperCase() + r.substring(1) : r;
    s[n] = e[r];
  }
  return s;
}
var El = class extends br {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = xi;
  }
  getBaseTargetFromProps(e, t) {
    return e[t];
  }
  readValueFromInstance(e, t) {
    if (He.has(t)) {
      const i = fr(t);
      return i && i.default || 0;
    }
    return t = Mr.has(t) ? t : vi(t), e.getAttribute(t);
  }
  scrapeMotionValuesFromProps(e, t, i) {
    return kl(e, t, i);
  }
  build(e, t, i) {
    Al(e, t, this.isSVGTag, i.transformTemplate, i.style);
  }
  renderInstance(e, t, i, s) {
    Bl(e, t, i, s);
  }
  mount(e) {
    this.isSVGTag = Pl(e.tagName), super.mount(e);
  }
};
function zl(e, t, i) {
  const s = H(e) ? e : Oe(e);
  return s.start(lr("", s, t, i)), s.animation;
}
function bi(e) {
  return typeof e == "object" && !Array.isArray(e);
}
function Cr(e, t, i, s) {
  return e == null ? [] : typeof e == "string" && bi(t) ? Zo(e, i, s) : e instanceof NodeList ? Array.from(e) : Array.isArray(e) ? e.filter((r) => r != null) : [e];
}
function Vl(e, t, i) {
  return e * (t + 1) + i * t;
}
function cs(e, t, i, s) {
  return typeof t == "number" ? t : t.startsWith("-") || t.startsWith("+") ? Math.max(0, e + parseFloat(t)) : t === "<" ? i : t.startsWith("<") ? Math.max(0, i + parseFloat(t.slice(1))) : s.get(t) ?? e;
}
function Dl(e, t, i) {
  for (let s = 0; s < e.length; s++) {
    const r = e[s];
    r.at > t && r.at < i && (ri(e, r), s--);
  }
}
function Rl(e, t, i, s, r, n) {
  Dl(e, r, n);
  for (let a = 0; a < t.length; a++) e.push({
    value: t[a],
    at: $e(r, n, s[a]),
    easing: /* @__PURE__ */ Vs(i, a)
  });
}
function Fl(e, t, i = 0) {
  const s = t + 1 + t * i;
  for (let r = 0; r < e.length; r++) e[r] = e[r] / s;
}
function Il(e, t) {
  return e.at === t.at ? e.value === null ? 1 : t.value === null ? -1 : 0 : e.at - t.at;
}
var Nl = "easeInOut", kt = 20;
function Ol(e, { defaultTransition: t = {}, ...i } = {}, s, r) {
  const n = t.duration || 0.3, a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), l = {}, c = /* @__PURE__ */ new Map();
  let h = 0, u = 0, d = 0;
  for (let g = 0; g < e.length; g++) {
    const p = e[g];
    if (typeof p == "string") {
      c.set(p, u);
      continue;
    } else if (!Array.isArray(p)) {
      c.set(p.name, cs(u, p.at, h, c));
      continue;
    }
    let [y, m, x = {}] = p;
    x.at !== void 0 && (u = cs(u, x.at, h, c));
    let A = 0;
    const v = (b, S, C, w = 0, _ = 0) => {
      const M = Ll(b), { delay: B = 0, times: T = Xs(M), type: z = t.type || "keyframes", repeat: E, repeatType: V, repeatDelay: D = 0, ...O } = S;
      let { ease: L = t.ease || "easeOut", duration: N } = S;
      const ie = typeof B == "function" ? B(w, _) : B, J = M.length, j = yi(z) ? z : r?.[z || "keyframes"];
      if (J <= 2 && j) {
        let me = 100;
        if (J === 2 && Gl(M)) {
          const ee = M[1] - M[0];
          me = Math.abs(ee);
        }
        const ge = {
          ...t,
          ...O
        };
        N !== void 0 && (ge.duration = Q(N));
        const Be = Hs(ge, me, j);
        L = Be.ease, N = Be.duration;
      }
      N ?? (N = n);
      const pe = u + ie;
      T.length === 1 && T[0] === 0 && (T[1] = 1);
      const fe = T.length - M.length;
      if (fe > 0 && qs(T, fe), M.length === 1 && M.unshift(null), E && Ue(E < kt, `Sequence segments can't repeat ${E} times — ignoring repeat option. Use a value below ${kt} or apply repeat at the sequence level instead.`), E && E < kt) {
        const me = N > 0 ? D / N : 0;
        N = Vl(N, E, D);
        const ge = [...M], Be = [...T];
        L = Array.isArray(L) ? [...L] : [L];
        const ee = [...L], Si = V === "reverse" || V === "mirror";
        let Ti = ge, Mi = ee;
        Si && (Ti = [...ge].reverse(), V === "reverse" && (Mi = [...ee].reverse().map((ye) => typeof ye == "function" ? oi(ye) : ye)));
        for (let ye = 0; ye < E; ye++) {
          const Ci = Si && ye % 2 === 0, _i = Ci ? Ti : ge, Pr = Ci ? Mi : ee, Ai = (ye + 1) * (1 + me);
          me > 0 && (M.push(M[M.length - 1]), T.push(Ai), L.push("linear")), M.push(..._i);
          for (let je = 0; je < _i.length; je++)
            T.push(Be[je] + Ai), L.push(je === 0 ? "linear" : /* @__PURE__ */ Vs(Pr, je - 1));
        }
        Fl(T, E, me);
      }
      const ae = pe + N;
      Rl(C, M, L, T, pe, ae), A = Math.max(ie + N, A), d = Math.max(ae, d);
    };
    if (H(y)) {
      const b = hs(y, o);
      v(m, x, us("default", b));
    } else {
      const b = Cr(y, m, s, l), S = b.length;
      for (let C = 0; C < S; C++) {
        m = m, x = x;
        const w = b[C], _ = hs(w, o);
        for (const M in m) v(m[M], Ul(x, M), us(M, _), C, S);
      }
    }
    h = u, u += A;
  }
  return o.forEach((g, p) => {
    for (const y in g) {
      const m = g[y];
      m.sort(Il);
      const x = [], A = [], v = [];
      for (let w = 0; w < m.length; w++) {
        const { at: _, value: M, easing: B } = m[w];
        x.push(M), A.push(ai(0, d, _)), v.push(B || "easeOut");
      }
      A[0] !== 0 && (A.unshift(0), x.unshift(x[0]), v.unshift(Nl)), A[A.length - 1] !== 1 && (A.push(1), x.push(null)), a.has(p) || a.set(p, {
        keyframes: {},
        transition: {}
      });
      const b = a.get(p);
      b.keyframes[y] = x;
      const { type: S, ...C } = t;
      b.transition[y] = {
        ...C,
        duration: d,
        ease: v,
        times: A,
        ...i
      };
    }
  }), a;
}
function hs(e, t) {
  return !t.has(e) && t.set(e, {}), t.get(e);
}
function us(e, t) {
  return t[e] || (t[e] = []), t[e];
}
function Ll(e) {
  return Array.isArray(e) ? e : [e];
}
function Ul(e, t) {
  return e && e[t] ? {
    ...e,
    ...e[t]
  } : { ...e };
}
var Wl = (e) => typeof e == "number", Gl = (e) => e.every(Wl);
function $l(e) {
  const t = {
    presenceContext: null,
    props: {},
    visualState: {
      renderState: {
        transform: {},
        transformOrigin: {},
        style: {},
        vars: {},
        attrs: {}
      },
      latestValues: {}
    }
  }, i = gr(e) && !Jo(e) ? new El(t) : new bl(t);
  i.mount(e), lt.set(e, i);
}
function Kl(e) {
  const t = new Sl({
    presenceContext: null,
    props: {},
    visualState: {
      renderState: { output: {} },
      latestValues: {}
    }
  });
  t.mount(e), lt.set(e, t);
}
function Hl(e, t) {
  return H(e) || typeof e == "number" || typeof e == "string" && !bi(t);
}
function _r(e, t, i, s) {
  const r = [];
  if (Hl(e, t)) r.push(zl(e, bi(t) && t.default || t, i && (i.default || i)));
  else {
    if (e == null) return r;
    const n = Cr(e, t, s), a = n.length;
    he(!!a, "No valid elements provided.", "no-valid-elements");
    for (let o = 0; o < a; o++) {
      const l = n[o], c = l instanceof Element ? $l : Kl;
      lt.has(l) || c(l);
      const h = lt.get(l), u = { ...i };
      "delay" in u && typeof u.delay == "function" && (u.delay = u.delay(o, a)), r.push(...No(h, {
        ...t,
        transition: u
      }, {}));
    }
  }
  return r;
}
function jl(e, t, i) {
  const s = [];
  return Ol(e.map((r) => {
    if (Array.isArray(r) && typeof r[0] == "function") {
      const n = r[0], a = Oe(0);
      return a.on("change", n), r.length === 1 ? [a, [0, 1]] : r.length === 2 ? [
        a,
        [0, 1],
        r[1]
      ] : [
        a,
        r[1],
        r[2]
      ];
    }
    return r;
  }), t, i, { spring: ot }).forEach(({ keyframes: r, transition: n }, a) => {
    s.push(..._r(a, r, n));
  }), s;
}
function ql(e) {
  return Array.isArray(e) && e.some(Array.isArray);
}
function Xl(e = {}) {
  const { scope: t, reduceMotion: i, skipAnimations: s } = e;
  function r(n, a, o) {
    let l = [], c;
    const h = {};
    if (i !== void 0 && (h.reduceMotion = i), s !== void 0 && (h.skipAnimations = s), ql(n)) {
      const { onComplete: d, ...g } = a || {};
      typeof d == "function" && (c = d), l = jl(n, {
        ...h,
        ...g
      }, t);
    } else {
      const { onComplete: d, ...g } = o || {};
      typeof d == "function" && (c = d), l = _r(n, a, {
        ...h,
        ...g
      }, t);
    }
    const u = new fo(l);
    return c && u.finished.then(c), t && (t.animations.push(u), u.finished.then(() => {
      ri(t.animations, u);
    })), u;
  }
  return r;
}
var Yl = Xl(), Fc = class {
  engine;
  world;
  physics;
  scene;
  camera;
  cameraController;
  config;
  renderer;
  pipeline;
  screenRecorder;
  save;
  scenes;
  cutscene;
  babylonEngine;
  babylonScene;
  babylonCanvas;
  input = Cn;
  audio = An;
  ui = En;
  debug = Vn;
  debugRenderer;
  videoTimeline;
  sceneObstacles = [];
  constructor(e = {}) {
    this.config = e, this.save = new Fn(e.gameId || "default"), this.scenes = new In(this), this.cutscene = new On(this), this.videoTimeline = new Fi(this), this.debugRenderer = new Rn(this), this.engine = new Zr(), this.world = new en(), this.physics = new nn(), this.physics.gravity = e.gravity ? new k(...e.gravity) : new k(0, -9.81, 0), this.scene = new f.Scene();
    const t = e.background ?? 592139;
    this.scene.background = new f.Color(t), e.fogColor && (this.scene.fog = new f.Fog(new f.Color(e.fogColor), e.fogNear ?? 15, e.fogFar ?? 65));
    let i;
    if (typeof e.canvas == "string" ? i = document.getElementById(e.canvas.replace("#", "")) : e.canvas ? i = e.canvas : (i = document.createElement("canvas"), document.body.appendChild(i)), this.renderer = new f.WebGLRenderer({
      canvas: i,
      antialias: !0,
      powerPreference: "high-performance",
      alpha: !0,
      preserveDrawingBuffer: !0
    }), this.renderer.setSize(window.innerWidth, window.innerHeight), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), i.style.position = "absolute", i.style.top = "0", i.style.left = "0", i.style.zIndex = "1", e.enableBabylon && (this.babylonCanvas = document.createElement("canvas"), this.babylonCanvas.id = "babylon-canvas", this.babylonCanvas.style.position = "absolute", this.babylonCanvas.style.top = "0", this.babylonCanvas.style.left = "0", this.babylonCanvas.style.width = "100%", this.babylonCanvas.style.height = "100%", this.babylonCanvas.style.pointerEvents = "none", this.babylonCanvas.style.zIndex = "2", document.body.appendChild(this.babylonCanvas), e.rendererBackend !== "webgpu"))
      try {
        this.babylonEngine = new F.Engine(this.babylonCanvas, !0, {
          preserveDrawingBuffer: !0,
          stencil: !0,
          alpha: !0
        }), this.babylonScene = new F.Scene(this.babylonEngine), this.babylonScene.clearColor = new F.Color4(0, 0, 0, 0), new F.FreeCamera("babylonCam", new F.Vector3(0, 6, 12), this.babylonScene).setTarget(F.Vector3.Zero());
      } catch (r) {
        console.error("Failed to initialize Babylon.js dual-engine layer:", r);
      }
    this.screenRecorder = new Dn(i);
    const s = window.innerWidth / window.innerHeight;
    if (this.config.mode === "2d") {
      const r = this.config.orthoScale ?? 10;
      this.camera = new f.OrthographicCamera(-r * s / 2, r * s / 2, r / 2, -r / 2, 0.1, 1e3), this.camera.position.set(0, 0, 10);
    } else
      this.camera = new f.PerspectiveCamera(55, s, 0.1, 200), this.camera.position.set(0, 6, 12);
    this.cameraController = new on(this.camera), this.pipeline = new wn(this.renderer, this.scene, this.camera), e.shadows !== !1 && this.pipeline.setupLighting({}), window.addEventListener("resize", () => {
      const r = window.innerWidth / window.innerHeight;
      if (this.camera instanceof f.PerspectiveCamera)
        this.camera.aspect = r, this.camera.updateProjectionMatrix();
      else if (this.camera instanceof f.OrthographicCamera) {
        const n = this.config.orthoScale ?? 10;
        this.camera.left = -n * r / 2, this.camera.right = n * r / 2, this.camera.top = n / 2, this.camera.bottom = -n / 2, this.camera.updateProjectionMatrix();
      }
      this.renderer.setSize(window.innerWidth, window.innerHeight), this.babylonEngine && (this.babylonEngine.resize(), this.babylonScene && this.babylonScene.activeCamera && this.camera instanceof f.PerspectiveCamera && (this.babylonScene.activeCamera.fov = this.camera.fov * (Math.PI / 180)));
    }), this.engine.events.on("update", (r) => {
      if (this.physics.step(r), this.cameraController.update(r, this.sceneObstacles), this.babylonScene && this.babylonScene.activeCamera) {
        this.babylonScene.activeCamera.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        const n = this.camera.quaternion;
        this.babylonScene.activeCamera.rotationQuaternion === void 0 && (this.babylonScene.activeCamera.rotationQuaternion = new F.Quaternion()), this.babylonScene.activeCamera.rotationQuaternion.set(n.x, n.y, n.z, n.w);
      }
      this.input.endFrame();
    }), this.engine.events.on("render", () => {
      if (this.pipeline.render(), this.babylonScene) try {
        this.babylonScene.render();
      } catch (r) {
        console.error("Babylon render error:", r);
      }
      this.debug.update(this.pipeline.metrics, this.engine.activeScene.root.children.length);
    }), typeof window < "u" && (window.KairoAPI = {
      app: this,
      startVideoRecording: (r = 60) => this.startRecording(r),
      stopVideoRecording: (r) => this.stopRecording(r),
      captureScreenshot: (r) => this.captureScreenshot(r),
      recordGameplaySequence: async (r, n) => (this.startRecording(60), await new Promise((a) => setTimeout(a, r)), await this.stopRecording(n))
    });
  }
  registerObstacle(e) {
    this.sceneObstacles.push(e);
  }
  createEntity(e) {
    const t = this.world.createEntity(e);
    return new ds(t, this);
  }
  createSharedContext(e, t) {
    return this.world.createSharedContext(e, t);
  }
  createEntityWithSharedContext(e, t) {
    const i = this.world.createEntityWithSharedContext(e, t);
    return new ds(i, this);
  }
  query(e) {
    return this.world.query(e);
  }
  clearObstacles() {
    this.sceneObstacles = [];
  }
  setLighting(e) {
    const t = typeof e.ambient == "number" ? e.ambient : e.ambientIntensity;
    return this.pipeline.setupLighting({
      ...e,
      ambientIntensity: t
    });
  }
  isKeyDown(e) {
    return this.input.isKeyDown(e);
  }
  animate(e, t, i) {
    return Yl(e, t, i);
  }
  onUpdate(e) {
    this.engine.events.on("update", e);
  }
  onRender(e) {
    this.engine.events.on("render", e);
  }
  createProceduralTerrain(e) {
    const t = Sn(e);
    return t && t.mesh && this.scene.add(t.mesh), t;
  }
  async start() {
    if (this.audio.init(), this.config.rendererBackend === "webgpu" && (console.log("Kairo: Initializing WebGPU Backend..."), this.config.enableBabylon && this.babylonCanvas && !this.babylonEngine))
      try {
        const e = new F.WebGPUEngine(this.babylonCanvas, { stencil: !0 });
        await e.initAsync(), this.babylonEngine = e, this.babylonScene = new F.Scene(this.babylonEngine), this.babylonScene.clearColor = new F.Color4(0, 0, 0, 0), new F.FreeCamera("babylonCam", new F.Vector3(0, 6, 12), this.babylonScene).setTarget(F.Vector3.Zero()), console.log("Kairo: Babylon.js WebGPU Engine Started successfully.");
      } catch (e) {
        console.error("Kairo: WebGPU not supported or failed to initialize in Babylon. Falling back to WebGL.", e), this.babylonEngine = new F.Engine(this.babylonCanvas, !0, {
          preserveDrawingBuffer: !0,
          stencil: !0,
          alpha: !0
        }), this.babylonScene = new F.Scene(this.babylonEngine), this.babylonScene.clearColor = new F.Color4(0, 0, 0, 0), new F.FreeCamera("babylonCam", new F.Vector3(0, 6, 12), this.babylonScene).setTarget(F.Vector3.Zero());
      }
    this.engine.start();
  }
  stop() {
    this.engine.stop();
  }
  createBox(e) {
    const t = e.size ?? [
      1,
      1,
      1
    ], i = new f.Mesh(new f.BoxGeometry(...t), new f.MeshStandardMaterial({
      color: e.color ?? 16777215,
      roughness: e.roughness ?? 0.5,
      metalness: e.metalness ?? 0.1
    }));
    if (i.position.set(...e.position ?? [
      0,
      0,
      0
    ]), i.castShadow = !0, i.receiveShadow = !0, this.scene.add(i), e.physics) {
      const s = new Qe();
      s.type = e.physics === "static" ? G.Static : G.Dynamic, s.mass = e.mass ?? (e.physics === "static" ? 0 : 1);
      const r = new ze();
      r.type = K.Box, r.size = new k(...t), this.physics.registerBody(s, r, new k(...i.position.toArray()));
      const n = this.engine.events.on("update", () => {
        s.cannonBody && (i.position.set(s.cannonBody.position.x, s.cannonBody.position.y, s.cannonBody.position.z), i.quaternion.set(s.cannonBody.quaternion.x, s.cannonBody.quaternion.y, s.cannonBody.quaternion.z, s.cannonBody.quaternion.w));
      });
      return {
        mesh: i,
        rb: s,
        col: r,
        dispose: () => {
          n(), this.scene.remove(i), this.physics.unregisterBody(s), i.geometry.dispose(), (Array.isArray(i.material) ? i.material : [i.material]).forEach((a) => a.dispose());
        }
      };
    }
    return { mesh: i };
  }
  attachPhysics(e, t = {}) {
    const i = new Qe();
    i.type = t.type === "static" ? G.Static : G.Dynamic, i.mass = t.mass ?? (i.type === G.Dynamic ? 1 : 0);
    const s = t.colliderType || t.size ? (() => {
      const n = new ze();
      return n.type = t.colliderType === "sphere" ? K.Sphere : t.colliderType === "capsule" ? K.Capsule : K.Box, n.size = new k(...t.size ?? [
        1,
        1,
        1
      ]), n;
    })() : Tn(e);
    (s.size.x <= 0 || s.size.y <= 0 || s.size.z <= 0) && s.size.set(0.1, 0.1, 0.1), t.addToScene && (e.castShadow = t.castShadow ?? !0, e.receiveShadow = !0, this.scene.add(e)), this.physics.registerBody(i, s, new k(...e.getWorldPosition(new f.Vector3()).toArray()));
    const r = this.engine.events.on("update", () => {
      i.cannonBody && (e.position.set(i.cannonBody.position.x, i.cannonBody.position.y, i.cannonBody.position.z), e.quaternion.set(i.cannonBody.quaternion.x, i.cannonBody.quaternion.y, i.cannonBody.quaternion.z, i.cannonBody.quaternion.w));
    });
    return {
      mesh: e,
      rb: i,
      collider: s,
      dispose: () => {
        r(), this.scene.remove(e), this.physics.unregisterBody(i);
      }
    };
  }
  createBabylonBox(e) {
    if (!this.babylonScene) throw new Error("Babylon is not enabled. Set enableBabylon: true in KairoAppConfig.");
    const t = e.size ?? [
      1,
      1,
      1
    ], i = F.MeshBuilder.CreateBox(e.name ?? "babylonBox", {
      width: t[0],
      height: t[1],
      depth: t[2]
    }, this.babylonScene);
    if (i.position.set(...e.position ?? [
      0,
      0,
      0
    ]), e.color) {
      const s = new F.StandardMaterial("babylonMat", this.babylonScene);
      s.diffuseColor = new F.Color3(...e.color), i.material = s;
    }
    if (e.physics) {
      const s = new Qe();
      s.type = e.physics === "static" ? G.Static : G.Dynamic, s.mass = e.mass ?? (e.physics === "static" ? 0 : 1);
      const r = new ze();
      r.type = K.Box, r.size = new k(...t), this.physics.registerBody(s, r, new k(i.position.x, i.position.y, i.position.z)), i.rotationQuaternion = new F.Quaternion();
      const n = this.engine.events.on("update", () => {
        s.cannonBody && (i.position.set(s.cannonBody.position.x, s.cannonBody.position.y, s.cannonBody.position.z), i.rotationQuaternion.set(s.cannonBody.quaternion.x, s.cannonBody.quaternion.y, s.cannonBody.quaternion.z, s.cannonBody.quaternion.w));
      });
      return {
        mesh: i,
        rb: s,
        col: r,
        dispose: () => {
          n(), i.dispose(), this.physics.unregisterBody(s);
        }
      };
    }
    return {
      mesh: i,
      dispose: () => i.dispose()
    };
  }
  setBackgroundImage(e, t = !1) {
    new f.TextureLoader().load(e, (i) => {
      (t || this.config.pixelArt) && (i.minFilter = f.NearestFilter, i.magFilter = f.NearestFilter), i.colorSpace = f.SRGBColorSpace, this.scene.background = i;
    });
  }
  createBlock2D(e) {
    const t = e.size ?? [1, 1];
    let i;
    if (e.textureUrl) {
      const n = new f.TextureLoader().load(e.textureUrl);
      e.pixelArt !== !1 && (e.pixelArt || this.config.pixelArt) && (n.minFilter = f.NearestFilter, n.magFilter = f.NearestFilter), n.colorSpace = f.SRGBColorSpace, i = new f.MeshBasicMaterial({
        map: n,
        color: e.color ?? 16777215,
        transparent: !0
      });
    } else i = new f.MeshBasicMaterial({
      color: e.color ?? 16777215,
      transparent: !0
    });
    const s = new f.Mesh(new f.PlaneGeometry(t[0], t[1]), i);
    s.position.set(...e.position ?? [
      0,
      0,
      0
    ]), this.scene.add(s);
    const r = [];
    if (e.billboard && r.push(this.engine.events.on("update", () => {
      s.quaternion.copy(this.camera.quaternion);
    })), e.physics) {
      const n = new Qe();
      n.type = e.physics === "static" ? G.Static : G.Dynamic, n.mass = e.mass ?? (e.physics === "static" ? 0 : 1), e.fixedRotation && (n.fixedRotation = !0), e.lockZAxis && (n.lockLinearAxis = [
        !1,
        !1,
        !0
      ], n.lockAngularAxis = [
        !0,
        !0,
        !1
      ]);
      const a = new ze();
      return a.type = K.Box, a.size = new k(t[0], t[1], 1), this.physics.registerBody(n, a, new k(...s.position.toArray())), r.push(this.engine.events.on("update", () => {
        n.cannonBody && (s.position.set(n.cannonBody.position.x, n.cannonBody.position.y, n.cannonBody.position.z), e.billboard || s.quaternion.set(n.cannonBody.quaternion.x, n.cannonBody.quaternion.y, n.cannonBody.quaternion.z, n.cannonBody.quaternion.w));
      })), {
        mesh: s,
        rb: n,
        col: a,
        dispose: () => {
          r.forEach((o) => o()), this.scene.remove(s), this.physics.unregisterBody(n), s.geometry.dispose(), i.dispose();
        }
      };
    }
    return {
      mesh: s,
      dispose: () => {
        r.forEach((n) => n()), this.scene.remove(s), s.geometry.dispose(), i.dispose();
      }
    };
  }
  createText3D(e) {
    const t = e.text, i = e.font || "bold 64px sans-serif", s = e.color || "#ffffff", r = document.createElement("canvas"), n = r.getContext("2d");
    n.font = i;
    const a = n.measureText(t), o = Math.ceil(a.width);
    let l = 64;
    const c = i.match(/(\d+)px/);
    c && (l = parseInt(c[1], 10));
    const h = Math.ceil(a.actualBoundingBoxAscent + a.actualBoundingBoxDescent || l * 1.2);
    r.width = Math.max(o + 20, 2), r.height = Math.max(h + 20, 2), n.font = i, n.fillStyle = s, n.textAlign = e.align || "center", n.textBaseline = "middle";
    const u = n.textAlign === "center" ? r.width / 2 : n.textAlign === "right" ? r.width - 10 : 10, d = r.height / 2;
    n.fillText(t, u, d);
    const g = new f.CanvasTexture(r);
    g.minFilter = f.LinearFilter, g.colorSpace = f.SRGBColorSpace;
    const p = new f.MeshBasicMaterial({
      map: g,
      transparent: !0,
      side: f.DoubleSide
    }), y = r.width / r.height, m = e.size ?? 1, x = m * y, A = m, v = new f.Mesh(new f.PlaneGeometry(x, A), p);
    v.position.set(...e.position ?? [
      0,
      0,
      0
    ]), this.scene.add(v);
    let b;
    return e.billboard && (b = this.engine.events.on("update", () => {
      v.quaternion.copy(this.camera.quaternion);
    })), {
      mesh: v,
      setText: (S) => {
        n.clearRect(0, 0, r.width, r.height), n.font = i;
        const C = n.measureText(S), w = Math.ceil(C.width) + 20;
        let _ = !1;
        w > r.width && (r.width = w, _ = !0), n.font = i, n.fillStyle = s, n.textAlign = e.align || "center", n.textBaseline = "middle";
        const M = n.textAlign === "center" ? r.width / 2 : n.textAlign === "right" ? r.width - 10 : 10;
        if (n.fillText(S, M, r.height / 2), g.needsUpdate = !0, _) {
          const B = r.width / r.height;
          v.geometry.dispose(), v.geometry = new f.PlaneGeometry(m * B, m);
        }
      },
      dispose: () => {
        b && b(), this.scene.remove(v), v.geometry.dispose(), p.dispose(), g.dispose();
      }
    };
  }
  captureScreenshot(e) {
    return this.screenRecorder.captureScreenshot(e);
  }
  startRecording(e = 60) {
    return this.screenRecorder.startRecording(e);
  }
  stopRecording(e) {
    return this.screenRecorder.stopRecording(e);
  }
  getCpuProfileMap() {
    const e = this.pipeline.metrics.cpuRenderMs || 0.7, t = this.pipeline.metrics.cpuPhysicsMs || 0.5, i = this.pipeline.metrics.cpuAiMs || 0, s = 0.2, r = 0.3, n = 0.4, a = parseFloat((e + t + i + s + r + n).toFixed(2)), o = 16.67, l = parseFloat((o - a).toFixed(2));
    return {
      webGlRenderMs: e,
      physicsStepMs: t,
      sceneGraphUpdateMs: s,
      animationMs: r,
      particlesMs: n,
      aiPathfindingMs: i,
      totalCpuTimeMs: a,
      targetFrameBudgetMs: o,
      cpuHeadroomMs: l,
      cpuHeadroomPercent: (l / o * 100).toFixed(1) + "%"
    };
  }
  getMemoryMapDump() {
    const e = this.renderer.info;
    let t = 0, i = 0, s = 0, r = 0;
    this.scene.traverse((p) => {
      t++, p.type === "Mesh" && i++, p.type === "InstancedMesh" && s++, p.type.includes("Light") && r++;
    });
    const n = typeof performance < "u" ? performance.memory : null, a = n ? n.usedJSHeapSize : 0, o = n ? n.totalJSHeapSize : 0, l = n ? n.jsHeapSizeLimit : 0, c = e.memory.geometries * 45e3, h = e.memory.textures * 1024 * 1024, u = c + h, d = this.getCpuProfileMap(), g = [
      {
        subsystem: "WebGL Geometries",
        description: `${e.memory.geometries} active buffer geometries`,
        bytes: c,
        formatted: (c / 1024).toFixed(1) + " KB"
      },
      {
        subsystem: "WebGL Textures",
        description: `${e.memory.textures} active GPU texture maps`,
        bytes: h,
        formatted: (h / (1024 * 1024)).toFixed(1) + " MB"
      },
      {
        subsystem: "JS Engine Heap",
        description: "Active V8 JavaScript heap allocation",
        bytes: a,
        formatted: (a / (1024 * 1024)).toFixed(1) + " MB"
      },
      {
        subsystem: "Scene Graph Nodes",
        description: `${t} active 3D object nodes`,
        bytes: t * 256,
        formatted: (t * 256 / 1024).toFixed(1) + " KB"
      }
    ];
    return {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      metrics: {
        ...this.pipeline.metrics,
        cpuProfileMap: d
      },
      cpuProfileMap: d,
      gpuMemory: {
        geometries: e.memory.geometries,
        textures: e.memory.textures,
        estimatedVramBytes: u,
        estimatedVramMb: (u / (1024 * 1024)).toFixed(2) + " MB"
      },
      jsHeap: {
        usedHeapBytes: a,
        totalHeapBytes: o,
        heapLimitBytes: l,
        usedHeapMb: (a / (1024 * 1024)).toFixed(2) + " MB"
      },
      sceneGraph: {
        totalNodes: t,
        meshesCount: i,
        instancedMeshesCount: s,
        lightsCount: r
      },
      memoryMapBreakdown: g
    };
  }
  createVideoTimeline(e = 10) {
    return this.videoTimeline = new Fi(this, e), this.videoTimeline;
  }
  addCameraShot(e, t, i, s) {
    const r = this.videoTimeline.tracks.find((n) => n.type === "camera");
    r && this.videoTimeline.addClip(r.id, {
      name: `Camera ${i}`,
      type: "camera",
      startTime: e,
      duration: t,
      props: {
        shotType: i,
        ...s
      }
    });
  }
  addVideoOverlay(e, t, i, s) {
    const r = this.videoTimeline.tracks.find((n) => n.type === "overlay");
    r && this.videoTimeline.addClip(r.id, {
      name: "Image Overlay",
      type: "overlay",
      startTime: e,
      duration: t,
      props: {
        url: i,
        ...s
      }
    });
  }
  addVideoText(e, t, i) {
    const s = this.videoTimeline.tracks.find((r) => r.type === "text");
    s && this.videoTimeline.addClip(s.id, {
      name: "Title Card",
      type: "text",
      startTime: e,
      duration: t,
      props: { text: i }
    });
  }
  addVideoTransition(e, t, i) {
    const s = this.videoTimeline.tracks.find((r) => r.type === "transition");
    s && this.videoTimeline.addClip(s.id, {
      name: `Transition ${i}`,
      type: "transition",
      startTime: e,
      duration: t,
      props: { transitionType: i }
    });
  }
  addVideoColorGrading(e, t, i) {
    const s = this.videoTimeline.tracks.find((r) => r.type === "colorGrade");
    s && this.videoTimeline.addClip(s.id, {
      name: `Color Grade ${i}`,
      type: "colorGrade",
      startTime: e,
      duration: t,
      props: { preset: i }
    });
  }
  playVideo() {
    this.videoTimeline.play();
  }
  pauseVideo() {
    this.videoTimeline.pause();
  }
  seekVideo(e) {
    this.videoTimeline.seek(e);
  }
  async exportVideo(e = "kairo-video-edit.webm") {
    return this.videoTimeline.exportVideo(e);
  }
}, ds = class {
  id;
  app;
  mesh;
  rigidBody;
  collider;
  constructor(e, t) {
    this.id = e, this.app = t;
  }
  addTransform(e = {}) {
    return e.position && (this.mesh || this.addMesh({}), this.mesh.position.set(...e.position)), e.rotation && this.mesh && this.mesh.rotation.set(...e.rotation), e.scale && this.mesh && this.mesh.scale.set(...e.scale), this;
  }
  addMesh(e = {}) {
    if (this.mesh) return this;
    const t = e.type ?? "box";
    let i;
    if (t === "sphere") {
      const r = e.radius ?? (e.size ? e.size[0] / 2 : 0.5);
      i = new f.SphereGeometry(r, 32, 32);
    } else if (t === "plane") {
      const r = e.size ?? [10, 10];
      i = new f.PlaneGeometry(r[0], r[1]);
    } else if (t === "cylinder") {
      const r = e.radius ?? 0.5, n = e.size ?? [
        1,
        2,
        1
      ];
      i = new f.CylinderGeometry(r, r, n[1], 32);
    } else {
      const r = e.size ?? [
        1,
        1,
        1
      ];
      i = new f.BoxGeometry(r[0], r[1], r[2]);
    }
    let s;
    return e.shader === "water" ? s = ys.createWaterShader().toThreeMaterial() : s = new f.MeshStandardMaterial({
      color: e.color ?? 6514417,
      roughness: 0.4,
      metalness: 0.2
    }), this.mesh = new f.Mesh(i, s), t === "plane" && (this.mesh.rotation.x = -Math.PI / 2), this.mesh.castShadow = !0, this.mesh.receiveShadow = !0, this.app.scene.add(this.mesh), this;
  }
  addRigidBody(e = {}) {
    this.mesh || this.addMesh({});
    const t = e.type === "static" || e.mass === 0;
    this.rigidBody = new Qe(), this.rigidBody.type = t ? G.Static : G.Dynamic, this.rigidBody.mass = e.mass ?? (t ? 0 : 1), this.collider = new ze(), this.collider.type = K.Box;
    const i = new k(...this.mesh.position.toArray());
    return this.app.physics.registerBody(this.rigidBody, this.collider, i), this.app.onUpdate(() => {
      this.rigidBody?.cannonBody && this.mesh && (this.mesh.position.set(this.rigidBody.cannonBody.position.x, this.rigidBody.cannonBody.position.y, this.rigidBody.cannonBody.position.z), this.mesh.quaternion.set(this.rigidBody.cannonBody.quaternion.x, this.rigidBody.cannonBody.quaternion.y, this.rigidBody.cannonBody.quaternion.z, this.rigidBody.cannonBody.quaternion.w));
    }), this;
  }
  getTransform() {
    return this.mesh || this.addMesh({}), {
      position: this.mesh.position,
      rotation: this.mesh.rotation,
      scale: this.mesh.scale
    };
  }
}, ut = class {
  state;
  constructor(e = Date.now()) {
    this.state = e;
  }
  next() {
    this.state |= 0, this.state = this.state + 1831565813 | 0;
    let e = Math.imul(this.state ^ this.state >>> 15, 1 | this.state);
    return e = e + Math.imul(e ^ e >>> 7, 61 | e) ^ e, ((e ^ e >>> 14) >>> 0) / 4294967296;
  }
  nextInt(e, t) {
    return Math.floor(this.next() * (t - e + 1)) + e;
  }
  nextFloat(e, t) {
    return this.next() * (t - e) + e;
  }
}, Zl = class {
  p = /* @__PURE__ */ new Uint8Array(512);
  perm = /* @__PURE__ */ new Uint8Array(512);
  permMod12 = /* @__PURE__ */ new Uint8Array(512);
  constructor(e) {
    const t = new ut(e ?? Date.now());
    for (let i = 0; i < 256; i++) this.p[i] = i;
    for (let i = 0; i < 255; i++) {
      const s = i + ~~(t.next() * (256 - i)), r = this.p[i];
      this.p[i] = this.p[s], this.p[s] = r;
    }
    for (let i = 0; i < 512; i++)
      this.perm[i] = this.p[i & 255], this.permMod12[i] = this.perm[i] % 12;
  }
  dot(e, t, i) {
    return e[0] * t + e[1] * i;
  }
  dot3(e, t, i, s) {
    return e[0] * t + e[1] * i + e[2] * s;
  }
  noise2D(e, t) {
    const i = 0.5 * (Math.sqrt(3) - 1), s = (3 - Math.sqrt(3)) / 6, r = (e + t) * i, n = Math.floor(e + r), a = Math.floor(t + r), o = (n + a) * s, l = n - o, c = a - o, h = e - l, u = t - c;
    let d, g;
    h > u ? (d = 1, g = 0) : (d = 0, g = 1);
    const p = h - d + s, y = u - g + s, m = h - 1 + 2 * s, x = u - 1 + 2 * s, A = n & 255, v = a & 255, b = this.permMod12[A + this.perm[v]], S = this.permMod12[A + d + this.perm[v + g]], C = this.permMod12[A + 1 + this.perm[v + 1]];
    let w = 0.5 - h * h - u * u, _ = 0;
    w >= 0 && (w *= w, _ = w * w * this.dot(Et[b], h, u));
    let M = 0.5 - p * p - y * y, B = 0;
    M >= 0 && (M *= M, B = M * M * this.dot(Et[S], p, y));
    let T = 0.5 - m * m - x * x, z = 0;
    return T >= 0 && (T *= T, z = T * T * this.dot(Et[C], m, x)), 70 * (_ + B + z);
  }
}, Et = [
  [
    1,
    1,
    0
  ],
  [
    -1,
    1,
    0
  ],
  [
    1,
    -1,
    0
  ],
  [
    -1,
    -1,
    0
  ],
  [
    1,
    0,
    1
  ],
  [
    -1,
    0,
    1
  ],
  [
    1,
    0,
    -1
  ],
  [
    -1,
    0,
    -1
  ],
  [
    0,
    1,
    1
  ],
  [
    0,
    -1,
    1
  ],
  [
    0,
    1,
    -1
  ],
  [
    0,
    -1,
    -1
  ]
], Ic = class {
  map;
  width;
  height;
  prng;
  constructor(e, t, i = 0.45, s) {
    this.width = e, this.height = t, this.map = [], this.prng = new ut(s ?? Date.now());
    for (let r = 0; r < e; r++) {
      this.map[r] = [];
      for (let n = 0; n < t; n++) r === 0 || r === e - 1 || n === 0 || n === t - 1 ? this.map[r][n] = 1 : this.map[r][n] = this.prng.next() < i ? 1 : 0;
    }
  }
  smooth(e = 5) {
    for (let t = 0; t < e; t++) {
      const i = [];
      for (let s = 0; s < this.width; s++) {
        i[s] = [];
        for (let r = 0; r < this.height; r++) {
          const n = this.getSurroundingWallCount(s, r);
          n > 4 ? i[s][r] = 1 : n < 4 ? i[s][r] = 0 : i[s][r] = this.map[s][r];
        }
      }
      this.map = i;
    }
  }
  getSurroundingWallCount(e, t) {
    let i = 0;
    for (let s = e - 1; s <= e + 1; s++) for (let r = t - 1; r <= t + 1; r++) s >= 0 && s < this.width && r >= 0 && r < this.height ? (s !== e || r !== t) && (i += this.map[s][r]) : i++;
    return i;
  }
}, Ql = class {
  object;
  app;
  enabled = !0;
  _isSpinning = !1;
  _spinSpeed = 1.5;
  _isBobbing = !1;
  _bobAmount = 0.25;
  _bobSpeed = 3;
  _baseY = null;
  _bobTimer = 0;
  _isPatrolling = !1;
  _patrolDistance = 4;
  _patrolSpeed = 2.5;
  _patrolDir = 1;
  _startX = null;
  _isPulsing = !1;
  _pulseMin = 0.8;
  _pulseMax = 1.2;
  _pulseSpeed = 4;
  _pulseTimer = 0;
  _baseScale = new f.Vector3(1, 1, 1);
  _isJumping = !1;
  _jumpVelocity = 0;
  _groundY = 0;
  _customData = {};
  _tempDir = new f.Vector3();
  attach(e, t) {
    this.object = e, this.app = t, this.object && (this._baseY = this.object.position?.y ?? 0, this._startX = this.object.position?.x ?? 0, this.object.scale && this._baseScale.copy(this.object.scale)), this.onStart();
  }
  onStart() {
  }
  onUpdate(e) {
  }
  onCollision(e) {
  }
  onInteract() {
  }
  onDestroy() {
  }
  _internalTick(e) {
    if (!(!this.enabled || !this.object)) {
      if (this._baseY === null && (this._baseY = this.object.position.y), this._startX === null && (this._startX = this.object.position.x), this._isSpinning && (this.object.rotation.y += this._spinSpeed * e), this._isBobbing && !this._isJumping && (this._bobTimer += e * this._bobSpeed, this.object.position.y = this._baseY + Math.sin(this._bobTimer) * this._bobAmount), this._isPatrolling && (this.object.position.x += this._patrolDir * this._patrolSpeed * e, Math.abs(this.object.position.x - this._startX) > this._patrolDistance && (this._patrolDir = -this._patrolDir)), this._isPulsing) {
        this._pulseTimer += e * this._pulseSpeed;
        const t = this._pulseMin + (Math.sin(this._pulseTimer) * 0.5 + 0.5) * (this._pulseMax - this._pulseMin);
        this.object.scale.set(this._baseScale.x * t, this._baseScale.y * t, this._baseScale.z * t);
      }
      this._isJumping && (this.object.position.y += this._jumpVelocity * e, this._jumpVelocity -= 18 * e, this.object.position.y <= this._groundY && (this.object.position.y = this._groundY, this._isJumping = !1, this.dustBurst(12))), this.onUpdate(e);
    }
  }
  spin(e = 1.5) {
    return this._isSpinning = !0, this._spinSpeed = e, this;
  }
  bob(e = 0.25, t = 3) {
    return this._isBobbing = !0, this._bobAmount = e, this._bobSpeed = t, this;
  }
  patrol(e = 4, t = 2.5) {
    return this._isPatrolling = !0, this._patrolDistance = e, this._patrolSpeed = t, this;
  }
  pulse(e = 0.85, t = 1.2, i = 4) {
    return this._isPulsing = !0, this._pulseMin = e, this._pulseMax = t, this._pulseSpeed = i, this;
  }
  jump(e = 7) {
    return this.object ? (this._isJumping || (this._groundY = this._baseY ?? this.object.position.y, this._jumpVelocity = e, this._isJumping = !0, this.playSound("jump")), this) : this;
  }
  stop() {
    return this._isSpinning = !1, this._isBobbing = !1, this._isPatrolling = !1, this._isPulsing = !1, this;
  }
  move(e, t, i) {
    return this.object && (this.object.position.x += e, this.object.position.y += t, this.object.position.z += i), this;
  }
  moveForward(e) {
    return this.object && this.object.translateZ(-e), this;
  }
  moveBackward(e) {
    return this.object && this.object.translateZ(e), this;
  }
  moveLeft(e) {
    return this.move(-e, 0, 0);
  }
  moveRight(e) {
    return this.move(e, 0, 0);
  }
  moveUp(e) {
    return this.move(0, e, 0);
  }
  moveDown(e) {
    return this.move(0, -e, 0);
  }
  turnLeft(e = 45) {
    return this.rotate(0, e * Math.PI / 180, 0);
  }
  turnRight(e = 45) {
    return this.rotate(0, -e * Math.PI / 180, 0);
  }
  rotate(e, t, i) {
    return this.object && (this.object.rotation.x += e, this.object.rotation.y += t, this.object.rotation.z += i), this;
  }
  chase(e, t = 3, i = 0.016) {
    if (!this.object || !e) return this;
    let s = 0, r = 0, n = 0;
    return Array.isArray(e) ? (s = e[0], r = e[1], n = e[2]) : typeof e == "object" && ("x" in e && typeof e.x == "number" ? (s = e.x, r = e.y ?? 0, n = e.z ?? 0) : typeof e[0] == "number" && (s = e[0], r = e[1] ?? 0, n = e[2] ?? 0)), this._tempDir.set(s, r, n).sub(this.object.position).normalize(), this.object.position.add(this._tempDir.multiplyScalar(t * i)), this.object.lookAt(s, r, n), this;
  }
  navigateTo(e, t = 3, i = 0.016) {
    return this.chase(e, t, i);
  }
  setPosition(e, t, i) {
    return this.object && this.object.position.set(e, t, i), this;
  }
  getPosition() {
    return this.object ? this.object.position : new f.Vector3();
  }
  getDistanceTo(e) {
    if (!this.object) return 0;
    const t = "position" in e ? e.position : e;
    return this.object.position.distanceTo(t);
  }
  isNear(e, t = 2) {
    return this.getDistanceTo(e) <= t;
  }
  cutToShot(e, t) {
    if (this.app?.cameraController) {
      const i = Array.isArray(e) ? new f.Vector3(...e) : e, s = Array.isArray(t) ? new f.Vector3(...t) : t;
      this.app.cameraController.cutTo(i, s);
    }
    return this;
  }
  panCamera(e, t, i, s = 3) {
    if (this.app?.cameraController) {
      const r = Array.isArray(e) ? new f.Vector3(...e) : e, n = Array.isArray(t) ? new f.Vector3(...t) : t, a = Array.isArray(i) ? new f.Vector3(...i) : i;
      this.app.cameraController.panTo(r, n, a, s);
    }
    return this;
  }
  orbitCamera(e, t = 8, i = 1, s = 5) {
    if (this.app?.cameraController) {
      const r = Array.isArray(e) ? new f.Vector3(...e) : e;
      this.app.cameraController.orbitShot(r, t, i, s);
    }
    return this;
  }
  dollyZoom(e = 30, t = 2.5) {
    return this.app?.cameraController && this.app.cameraController.dollyZoom(e, t), this;
  }
  craneShot(e, t, i = 4) {
    if (this.app?.cameraController) {
      const s = Array.isArray(e) ? new f.Vector3(...e) : e, r = Array.isArray(t) ? new f.Vector3(...t) : t;
      this.app.cameraController.craneShot(s, r, i);
    }
    return this;
  }
  trackObject(e) {
    return this.app?.cameraController && this.app.cameraController.trackObject(e), this;
  }
  createVideoTimeline(e = 10) {
    return this.app?.createVideoTimeline ? this.app.createVideoTimeline(e) : null;
  }
  addCameraShot(e, t, i, s) {
    return this.app?.addCameraShot && this.app.addCameraShot(e, t, i, s), this;
  }
  addVideoOverlay(e, t, i, s) {
    return this.app?.addVideoOverlay && this.app.addVideoOverlay(e, t, i, s), this;
  }
  addVideoText(e, t, i) {
    return this.app?.addVideoText && this.app.addVideoText(e, t, i), this;
  }
  addVideoTransition(e, t, i) {
    return this.app?.addVideoTransition && this.app.addVideoTransition(e, t, i), this;
  }
  addVideoColorGrading(e, t, i) {
    return this.app?.addVideoColorGrading && this.app.addVideoColorGrading(e, t, i), this;
  }
  playVideoTimeline() {
    return this.app?.playVideo && this.app.playVideo(), this;
  }
  async exportVideoFile(e = "kairo-video-edit.webm") {
    this.app?.exportVideo && await this.app.exportVideo(e);
  }
  showOverlayImage(e, t) {
    return this.app?.ui?.showImageOverlay ? this.app.ui.showImageOverlay(e, t) : "";
  }
  removeOverlayImage(e) {
    return this.app?.ui?.removeImageOverlay && this.app.ui.removeImageOverlay(e), this;
  }
  letterbox(e = !0, t = 10) {
    return this.app?.ui?.setLetterbox && this.app.ui.setLetterbox(e, t), this;
  }
  async transitionCut(e = "fadeBlack", t = 500) {
    this.app?.ui?.transitionCut && await this.app.ui.transitionCut(e, t);
  }
  setColorGrading(e) {
    return this.app?.ui?.setColorGrading && this.app.ui.setColorGrading(e), this;
  }
  shakeCamera(e = 0.4, t = 0.3) {
    return this.app?.cameraController && this.app.cameraController.shake({
      intensity: e,
      duration: t
    }), this;
  }
  setCameraDistance(e) {
    return this.app?.cameraController && (this.app.cameraController.distance = e), this;
  }
  showModal(e, t, i) {
    return this.app?.ui && this.app.ui.createModal(e, t, i || [{
      text: "OK",
      primary: !0,
      onClick: () => {
      }
    }]), this;
  }
  takeScreenshot() {
    this.app?.takeScreenshot && this.app.takeScreenshot();
  }
  async recordVideo(e = 5) {
    this.app?.startRecording && this.app?.stopRecording && (this.app.startRecording(60), setTimeout(async () => {
      await this.app.stopRecording(`easyscript-clip-${Date.now()}.webm`);
    }, e * 1e3));
  }
  playAnimation(e, t = 0.2) {
    return this.app?.animStateMachine && this.app.animStateMachine.setState(e, t), this;
  }
  setIKHeight(e) {
    return this.app?.state && (this.app.state.ikTargetHeight = e), this;
  }
  async streamSketchfab(e) {
    return this.app?.assets ? this.app.assets.streamSketchfabModel(e) : null;
  }
  async loadBlenderModel(e) {
    return this.app?.assets ? this.app.assets.loadModel(e) : null;
  }
  syncState(e) {
    return this.app?.network && this.app.network.broadcastState(e), this;
  }
  sendRPC(e, t) {
    return this.app?.network && this.app.network.sendRPC(e, t), this;
  }
  changeColor(e) {
    return this.object && this.object.traverse((t) => {
      t.isMesh && t.material && t.material.color.set(e);
    }), this;
  }
  randomColor() {
    const e = [
      1096065,
      3900150,
      15680580,
      16096779,
      9133302,
      15485081,
      440020
    ];
    return this.changeColor(e[Math.floor(Math.random() * e.length)]);
  }
  hide() {
    return this.object && (this.object.visible = !1), this;
  }
  show() {
    return this.object && (this.object.visible = !0), this;
  }
  say(e, t = 2e3, i = "info") {
    return this.app?.ui && this.app.ui.showToast(e, t, i), this;
  }
  playSound(e) {
    return this.app?.audio && this.app.audio.playSynthesizedSound(e), this;
  }
  sparkle(e = 25) {
    return this.app?.particleSys && this.object && this.app.particleSys.emitBurst(this.object.position, "sparkle", e), this;
  }
  explode(e = 40) {
    return this.app?.particleSys && this.object && this.app.particleSys.emitBurst(this.object.position, "explosion", e), this;
  }
  dustBurst(e = 15) {
    return this.app?.particleSys && this.object && this.app.particleSys.emitBurst(this.object.position, "dust_footstep", e), this;
  }
  teleportEffect() {
    return this.app?.particleSys && this.object && (this.app.particleSys.emitBurst(this.object.position, "teleport_flash", 35), this.playSound("teleport")), this;
  }
  destroy() {
    this.onDestroy(), this.object?.parent && this.object.parent.remove(this.object);
  }
  set(e, t) {
    this._customData[e] = t;
  }
  get(e, t) {
    return this._customData[e] ?? t;
  }
}, Nc = class {
  scripts = [];
  add(e, t, i) {
    e.attach(t, i), this.scripts.push(e);
  }
  remove(e) {
    const t = this.scripts.indexOf(e);
    t !== -1 && (this.scripts[t].onDestroy(), this.scripts.splice(t, 1));
  }
  update(e) {
    for (let t = 0; t < this.scripts.length; t++) {
      const i = this.scripts[t];
      i.enabled && i._internalTick(e);
    }
  }
  clear() {
    this.scripts.forEach((e) => e.onDestroy()), this.scripts = [];
  }
}, Oc = { createBehavior: (e) => {
  const t = new Ql();
  return e.onStart && (t.onStart = e.onStart.bind(t)), e.onUpdate && (t.onUpdate = e.onUpdate.bind(t)), e.onInteract && (t.onInteract = e.onInteract.bind(t)), e.onCollision && (t.onCollision = e.onCollision.bind(t)), t;
} }, Tt = {
  Success: "SUCCESS",
  Failure: "FAILURE",
  Running: "RUNNING"
}, wi = class {
}, Lc = class extends wi {
  children;
  constructor(e) {
    super(), this.children = e;
  }
  tick(e) {
    for (const t of this.children) {
      const i = t.tick(e);
      if (i !== Tt.Success) return i;
    }
    return Tt.Success;
  }
}, Uc = class extends wi {
  children;
  constructor(e) {
    super(), this.children = e;
  }
  tick(e) {
    for (const t of this.children) {
      const i = t.tick(e);
      if (i !== Tt.Failure) return i;
    }
    return Tt.Failure;
  }
}, Wc = class extends wi {
  actionFn;
  constructor(e) {
    super(), this.actionFn = e;
  }
  tick(e) {
    return this.actionFn(e);
  }
}, Gc = class {
  width;
  height;
  nodeSize;
  nodes;
  constructor(e = 20, t = 20, i = 1) {
    this.width = e, this.height = t, this.nodeSize = i, this.nodes = [];
    for (let s = 0; s < e; s++) {
      this.nodes[s] = [];
      for (let r = 0; r < t; r++) this.nodes[s][r] = {
        x: s,
        z: r,
        g: 0,
        h: 0,
        f: 0,
        parent: null,
        walkable: !0
      };
    }
  }
  setObstacle(e, t, i) {
    e >= 0 && e < this.width && t >= 0 && t < this.height && (this.nodes[e][t].walkable = i);
  }
  findPath(e, t, i) {
    const s = this.resolveOptions(i);
    switch (s.algorithm) {
      case "dijkstra":
        return this.findPathAStarInternal(e, t, 0, s.allowDiagonal ?? !1);
      case "weighted_astar":
        return this.findPathAStarInternal(e, t, s.heuristicWeight ?? 1.5, s.allowDiagonal ?? !1);
      case "bidirectional_dijkstra":
        return this.findPathBidirectionalInternal(e, t, 0, s.allowDiagonal ?? !1);
      case "bidirectional_astar":
        return this.findPathBidirectionalInternal(e, t, s.heuristicWeight ?? 1, s.allowDiagonal ?? !1);
      default:
        return this.findPathAStarInternal(e, t, s.heuristicWeight ?? 1, s.allowDiagonal ?? !1);
    }
  }
  findPathAStar(e, t, i) {
    const s = this.resolveOptions(i, "astar");
    return this.findPathAStarInternal(e, t, s.heuristicWeight ?? 1, s.allowDiagonal ?? !1);
  }
  findPathWeighted(e, t, i = 1.5, s) {
    const r = this.resolveOptions(s, "weighted_astar");
    return this.findPathAStarInternal(e, t, i, r.allowDiagonal ?? !1);
  }
  findPathDijkstra(e, t, i) {
    const s = this.resolveOptions(i, "dijkstra");
    return this.findPathAStarInternal(e, t, 0, s.allowDiagonal ?? !1);
  }
  findPathBidirectionalAStar(e, t, i = 1, s) {
    const r = this.resolveOptions(s, "bidirectional_astar");
    return this.findPathBidirectionalInternal(e, t, i, r.allowDiagonal ?? !1);
  }
  findPathBidirectionalDijkstra(e, t, i) {
    const s = this.resolveOptions(i, "bidirectional_dijkstra");
    return this.findPathBidirectionalInternal(e, t, 0, s.allowDiagonal ?? !1);
  }
  resolveOptions(e, t = "astar") {
    return typeof e == "string" ? { algorithm: e } : {
      algorithm: e?.algorithm ?? t,
      heuristicWeight: e?.heuristicWeight,
      allowDiagonal: e?.allowDiagonal
    };
  }
  getGridCoords(e, t) {
    const i = Math.floor(e.x / this.nodeSize + this.width / 2), s = Math.floor(e.z / this.nodeSize + this.height / 2), r = Math.floor(t.x / this.nodeSize + this.width / 2), n = Math.floor(t.z / this.nodeSize + this.height / 2);
    return i < 0 || i >= this.width || s < 0 || s >= this.height || r < 0 || r >= this.width || n < 0 || n >= this.height ? null : {
      startNode: this.nodes[i][s],
      endNode: this.nodes[r][n]
    };
  }
  findPathAStarInternal(e, t, i, s) {
    const r = this.getGridCoords(e, t);
    if (!r) return [e, t];
    const { startNode: n, endNode: a } = r;
    if (!n.walkable || !a.walkable) return [e, t];
    if (n === a) return [this.nodeToVector3(n)];
    const o = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), c = [n], h = /* @__PURE__ */ new Set([n]), u = /* @__PURE__ */ new Set();
    o.set(n, 0), l.set(n, null);
    const d = (p) => {
      if (i === 0) return 0;
      const y = Math.abs(p.x - a.x), m = Math.abs(p.z - a.z);
      return s ? (Math.max(y, m) + (Math.SQRT2 - 1) * Math.min(y, m)) * i : (y + m) * i;
    }, g = (p) => (o.get(p) ?? 1 / 0) + d(p);
    for (; c.length > 0; ) {
      c.sort((m, x) => g(m) - g(x));
      const p = c.shift();
      if (h.delete(p), p === a) return this.reconstructSinglePath(p, l);
      u.add(p);
      const y = this.getNeighbors(p, s);
      for (const { node: m, moveCost: x } of y) {
        if (!m.walkable || u.has(m)) continue;
        const A = (o.get(p) ?? 0) + x;
        A < (o.get(m) ?? 1 / 0) && (o.set(m, A), l.set(m, p), h.has(m) || (c.push(m), h.add(m)));
      }
    }
    return [e, t];
  }
  findPathBidirectionalInternal(e, t, i, s) {
    const r = this.getGridCoords(e, t);
    if (!r) return [e, t];
    const { startNode: n, endNode: a } = r;
    if (!n.walkable || !a.walkable) return [e, t];
    if (n === a) return [this.nodeToVector3(n)];
    const o = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), c = [n], h = /* @__PURE__ */ new Set([n]), u = /* @__PURE__ */ new Set(), d = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), p = [a], y = /* @__PURE__ */ new Set([a]), m = /* @__PURE__ */ new Set();
    o.set(n, 0), l.set(n, null), d.set(a, 0), g.set(a, null);
    const x = (w) => {
      if (i === 0) return 0;
      const _ = Math.abs(w.x - a.x), M = Math.abs(w.z - a.z);
      return s ? (Math.max(_, M) + (Math.SQRT2 - 1) * Math.min(_, M)) * i : (_ + M) * i;
    }, A = (w) => {
      if (i === 0) return 0;
      const _ = Math.abs(w.x - n.x), M = Math.abs(w.z - n.z);
      return s ? (Math.max(_, M) + (Math.SQRT2 - 1) * Math.min(_, M)) * i : (_ + M) * i;
    }, v = (w) => (o.get(w) ?? 1 / 0) + x(w), b = (w) => (d.get(w) ?? 1 / 0) + A(w);
    let S = 1 / 0, C = null;
    for (; c.length > 0 && p.length > 0; ) {
      c.sort((T, z) => v(T) - v(z));
      const w = c.shift();
      if (h.delete(w), u.add(w), m.has(w)) {
        const T = (o.get(w) ?? 0) + (d.get(w) ?? 0);
        if (T < S) {
          S = T, C = w;
          break;
        }
      }
      const _ = this.getNeighbors(w, s);
      for (const { node: T, moveCost: z } of _) {
        if (!T.walkable || u.has(T)) continue;
        const E = (o.get(w) ?? 0) + z;
        if (E < (o.get(T) ?? 1 / 0) && (o.set(T, E), l.set(T, w), h.has(T) || (c.push(T), h.add(T)), d.has(T))) {
          const V = E + d.get(T);
          V < S && (S = V, C = T);
        }
      }
      p.sort((T, z) => b(T) - b(z));
      const M = p.shift();
      if (y.delete(M), m.add(M), u.has(M)) {
        const T = (o.get(M) ?? 0) + (d.get(M) ?? 0);
        if (T < S) {
          S = T, C = M;
          break;
        }
      }
      const B = this.getNeighbors(M, s);
      for (const { node: T, moveCost: z } of B) {
        if (!T.walkable || m.has(T)) continue;
        const E = (d.get(M) ?? 0) + z;
        if (E < (d.get(T) ?? 1 / 0) && (d.set(T, E), g.set(T, M), y.has(T) || (p.push(T), y.add(T)), o.has(T))) {
          const V = E + o.get(T);
          V < S && (S = V, C = T);
        }
      }
      if (C && c.length > 0 && p.length > 0 && v(c[0]) + b(p[0]) >= S)
        break;
    }
    return C ? this.reconstructBidirectionalPath(C, l, g) : [e, t];
  }
  reconstructSinglePath(e, t) {
    const i = [];
    let s = e;
    for (; s; )
      i.unshift(this.nodeToVector3(s)), s = t.get(s);
    return i;
  }
  reconstructBidirectionalPath(e, t, i) {
    const s = [];
    let r = e;
    for (; r; )
      s.unshift(r), r = t.get(r);
    const n = [];
    let a = i.get(e);
    for (; a; )
      n.push(a), a = i.get(a);
    return [...s, ...n].map((o) => this.nodeToVector3(o));
  }
  nodeToVector3(e) {
    return new k((e.x - this.width / 2) * this.nodeSize, 0, (e.z - this.height / 2) * this.nodeSize);
  }
  getNeighbors(e, t = !1) {
    const i = [];
    for (const [s, r] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ]) {
      const n = e.x + s, a = e.z + r;
      n >= 0 && n < this.width && a >= 0 && a < this.height && i.push({
        node: this.nodes[n][a],
        moveCost: 1
      });
    }
    if (t) for (const [s, r] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1]
    ]) {
      const n = e.x + s, a = e.z + r;
      n >= 0 && n < this.width && a >= 0 && a < this.height && this.nodes[e.x + s][e.z].walkable && this.nodes[e.x][e.z + r].walkable && i.push({
        node: this.nodes[n][a],
        moveCost: Math.SQRT2
      });
    }
    return i;
  }
}, $c = class {
  name;
  duration;
  positionKeys;
  rotationKeys;
  scaleKeys;
  constructor(e, t, i = [], s = [], r = []) {
    this.name = e, this.duration = t, this.positionKeys = i, this.rotationKeys = s, this.scaleKeys = r;
  }
  samplePosition(e, t) {
    const i = t || new k();
    if (this.positionKeys.length === 0) return i.set(0, 0, 0);
    if (this.duration > 0) e = xe.clamp(e % this.duration, 0, this.duration);
    else {
      const s = this.positionKeys[this.positionKeys.length - 1].time || 0;
      e = xe.clamp(e, 0, s);
    }
    for (let s = 0; s < this.positionKeys.length - 1; s++) {
      const r = this.positionKeys[s], n = this.positionKeys[s + 1];
      if (e >= r.time && e <= n.time) {
        const a = n.time - r.time, o = a > 0 ? (e - r.time) / a : 0;
        return i.copy(r.value).lerp(n.value, o);
      }
    }
    return i.copy(this.positionKeys[this.positionKeys.length - 1].value);
  }
  sampleRotation(e, t) {
    const i = t || new st();
    if (this.rotationKeys.length === 0) return i.set(0, 0, 0, 1);
    if (this.duration > 0) e = xe.clamp(e % this.duration, 0, this.duration);
    else {
      const s = this.rotationKeys[this.rotationKeys.length - 1].time || 0;
      e = xe.clamp(e, 0, s);
    }
    for (let s = 0; s < this.rotationKeys.length - 1; s++) {
      const r = this.rotationKeys[s], n = this.rotationKeys[s + 1];
      if (e >= r.time && e <= n.time) {
        const a = n.time - r.time, o = a > 0 ? (e - r.time) / a : 0;
        return i.copy(r.value).slerp(n.value, o);
      }
    }
    return i.copy(this.rotationKeys[this.rotationKeys.length - 1].value);
  }
  sampleScale(e, t) {
    const i = t || new k(1, 1, 1);
    if (this.scaleKeys.length === 0) return i.set(1, 1, 1);
    if (this.duration > 0) e = xe.clamp(e % this.duration, 0, this.duration);
    else {
      const s = this.scaleKeys[this.scaleKeys.length - 1].time || 0;
      e = xe.clamp(e, 0, s);
    }
    for (let s = 0; s < this.scaleKeys.length - 1; s++) {
      const r = this.scaleKeys[s], n = this.scaleKeys[s + 1];
      if (e >= r.time && e <= n.time) {
        const a = n.time - r.time, o = a > 0 ? (e - r.time) / a : 0;
        return i.copy(r.value).lerp(n.value, o);
      }
    }
    return i.copy(this.scaleKeys[this.scaleKeys.length - 1].value);
  }
}, Kc = class {
  clips = [];
  _p1 = new k();
  _p2 = new k();
  _r1 = new st();
  _r2 = new st();
  addClip(e, t) {
    this.clips.push({
      clip: e,
      threshold: t
    }), this.clips.sort((i, s) => i.threshold - s.threshold);
  }
  evaluate(e, t, i, s) {
    const r = i || new k(), n = s || new st();
    if (this.clips.length === 0) return {
      position: r.set(0, 0, 0),
      rotation: n.set(0, 0, 0, 1)
    };
    if (this.clips.length === 1 || e <= this.clips[0].threshold) return {
      position: this.clips[0].clip.samplePosition(t, r),
      rotation: this.clips[0].clip.sampleRotation(t, n)
    };
    for (let o = 0; o < this.clips.length - 1; o++) {
      const l = this.clips[o], c = this.clips[o + 1];
      if (e >= l.threshold && e <= c.threshold) {
        const h = c.threshold - l.threshold, u = h > 0 ? (e - l.threshold) / h : 0;
        return l.clip.samplePosition(t, this._p1), c.clip.samplePosition(t, this._p2), l.clip.sampleRotation(t, this._r1), c.clip.sampleRotation(t, this._r2), r.copy(this._p1).lerp(this._p2, u), n.copy(this._r1).slerp(this._r2, u), {
          position: r,
          rotation: n
        };
      }
    }
    const a = this.clips[this.clips.length - 1];
    return {
      position: a.clip.samplePosition(t, r),
      rotation: a.clip.sampleRotation(t, n)
    };
  }
}, Hc = class {
  mixer;
  states = /* @__PURE__ */ new Map();
  parameters = /* @__PURE__ */ new Map();
  currentState = null;
  constructor(e) {
    this.mixer = new f.AnimationMixer(e);
  }
  registerState(e, t, i = {}) {
    const s = this.mixer.clipAction(t);
    i.loop !== void 0 && s.setLoop(i.loop, 1 / 0), i.timeScale !== void 0 && (s.timeScale = i.timeScale);
    const r = {
      name: e,
      action: s,
      fadeDuration: i.fadeDuration ?? 0.25,
      timeScale: i.timeScale ?? 1
    };
    this.states.set(e, r);
  }
  setParameter(e, t) {
    this.parameters.set(e, t);
  }
  getParameter(e) {
    return this.parameters.get(e);
  }
  setState(e, t) {
    const i = this.states.get(e);
    if (!i || this.currentState === i) return;
    const s = t ?? i.fadeDuration ?? 0.25;
    this.currentState && this.currentState.action.fadeOut(s), this.currentState = i, this.currentState.action.reset().fadeIn(s).play();
  }
  getCurrentStateName() {
    return this.currentState ? this.currentState.name : null;
  }
  update(e) {
    this.mixer.update(e);
  }
}, jc = class {
  static solveTwoBone(e, t, i, s, r) {
    const n = i.x - e.x, a = i.y - e.y, o = i.z - e.z, l = Math.sqrt(n * n + a * a + o * o), c = xe.clamp(l, 1e-3, s + r - 1e-3), h = (s * s + c * c - r * r) / (2 * s * c), u = Math.acos(xe.clamp(h, -1, 1)), d = l > 0 ? 1 / l : 0, g = n * d, p = a * d, y = o * d;
    let m = 0, x = 0, A = 0;
    const v = g * g + y * y;
    if (v >= 1e-6) {
      const C = Math.sqrt(v);
      m = -g * p / C, x = C, A = -p * y / C;
    } else {
      const C = y * y + p * p;
      if (C >= 1e-6) {
        const w = Math.sqrt(C);
        m = 0, x = y / w, A = -p / w;
      } else {
        const w = p * p + g * g, _ = Math.sqrt(w), M = _ > 0 ? 1 / _ : 0;
        m = p * M, x = -g * M, A = 0;
      }
    }
    const b = Math.cos(u) * s, S = Math.sin(u) * s;
    return {
      jointPos: new k(e.x + g * b + m * S, e.y + p * b + x * S, e.z + y * b + A * S),
      endPos: new k(i.x, i.y, i.z)
    };
  }
}, Jl = class {
  headOffset = new k(0, 2.3, 0);
  torsoAngle = 0;
  leftArmAngle = 0;
  rightArmAngle = 0;
  leftForearmAngle = 0;
  rightForearmAngle = 0;
  leftLegAngle = 0;
  rightLegAngle = 0;
  leftShinAngle = 0;
  rightShinAngle = 0;
  rootY = 0;
  rootFlipAngle = 0;
}, qc = class {
  static evaluate(e, t, i = 1) {
    const s = new Jl(), r = t * i * 5;
    if (e === "idle")
      s.rootY = Math.sin(t * 2) * 0.05, s.headOffset.y = 2.3 + Math.sin(t * 2) * 0.02, s.leftArmAngle = Math.sin(t * 2) * 0.1 + 0.1, s.rightArmAngle = -Math.sin(t * 2) * 0.1 - 0.1, s.leftLegAngle = 0.05, s.rightLegAngle = -0.05;
    else if (e === "walk")
      s.rootY = Math.abs(Math.sin(r)) * 0.1, s.leftLegAngle = Math.sin(r) * 0.6, s.rightLegAngle = -Math.sin(r) * 0.6, s.leftShinAngle = Math.max(0, Math.sin(r + Math.PI / 2)) * 0.5, s.rightShinAngle = Math.max(0, Math.sin(r - Math.PI / 2)) * 0.5, s.leftArmAngle = -Math.sin(r) * 0.6, s.rightArmAngle = Math.sin(r) * 0.6, s.leftForearmAngle = 0.2, s.rightForearmAngle = 0.2;
    else if (e === "run")
      s.torsoAngle = 0.25, s.rootY = Math.abs(Math.sin(r * 1.5)) * 0.2, s.leftLegAngle = Math.sin(r * 1.5) * 1.1, s.rightLegAngle = -Math.sin(r * 1.5) * 1.1, s.leftShinAngle = Math.max(0, Math.sin(r * 1.5 + Math.PI / 2)) * 0.8, s.rightShinAngle = Math.max(0, Math.sin(r * 1.5 - Math.PI / 2)) * 0.8, s.leftArmAngle = -Math.sin(r * 1.5) * 1.1 * 1.1, s.rightArmAngle = Math.sin(r * 1.5) * 1.1 * 1.1, s.leftForearmAngle = 0.8, s.rightForearmAngle = 0.8;
    else if (e === "jump") {
      const n = t % 2 / 2;
      s.rootY = Math.sin(n * Math.PI) * 2.5, s.rootFlipAngle = n * Math.PI * 2, s.leftArmAngle = -1.2, s.rightArmAngle = -1.2, s.leftLegAngle = 0.8, s.rightLegAngle = 0.8, s.leftShinAngle = 1.2, s.rightShinAngle = 1.2;
    }
    return s;
  }
}, Xc = /* @__PURE__ */ (function(e) {
  return e[e.LOW = 0] = "LOW", e[e.NORMAL = 1] = "NORMAL", e[e.HIGH = 2] = "HIGH", e[e.CRITICAL = 3] = "CRITICAL", e;
})({}), ec = class {
  listeners = /* @__PURE__ */ new Map();
  wildcardListeners = [];
  on(e, t, i = 1) {
    if (e === "*")
      return this.wildcardListeners.push({
        handler: t,
        priority: i,
        once: !1
      }), this.sortListeners(this.wildcardListeners), () => this.off("*", t);
    this.listeners.has(e) || this.listeners.set(e, []);
    const s = this.listeners.get(e);
    return s.push({
      handler: t,
      priority: i,
      once: !1
    }), this.sortListeners(s), () => this.off(e, t);
  }
  once(e, t, i = 1) {
    if (e === "*") {
      const r = (n) => {
        const a = t(n);
        return this.off("*", r), a;
      };
      this.wildcardListeners.push({
        handler: r,
        priority: i,
        once: !0
      }), this.sortListeners(this.wildcardListeners);
      return;
    }
    this.listeners.has(e) || this.listeners.set(e, []);
    const s = this.listeners.get(e);
    s.push({
      handler: t,
      priority: i,
      once: !0
    }), this.sortListeners(s);
  }
  off(e, t) {
    if (e === "*") {
      this.wildcardListeners = this.wildcardListeners.filter((s) => s.handler !== t);
      return;
    }
    const i = this.listeners.get(e);
    i && this.listeners.set(e, i.filter((s) => s.handler !== t));
  }
  emit(e, t) {
    let i = !1;
    for (const r of [...this.wildcardListeners]) r.handler({
      event: e,
      data: t
    }) === !1 && (i = !0);
    const s = this.listeners.get(e);
    if (s) {
      const r = [];
      for (const n of [...s])
        n.handler(t) === !1 && (i = !0), n.once && r.push(n);
      r.length > 0 && this.listeners.set(e, s.filter((n) => !r.includes(n)));
    }
    return !i;
  }
  sortListeners(e) {
    e.sort((t, i) => i.priority - t.priority);
  }
  clear() {
    this.listeners.clear(), this.wildcardListeners = [];
  }
}, Ar = new ec(), Yc = class {
  eventBus;
  keyBindings = /* @__PURE__ */ new Map();
  boundKeyDownHandler;
  boundKeyUpHandler;
  activeKeys = /* @__PURE__ */ new Set();
  enabled = !0;
  constructor(e = Ar) {
    this.eventBus = e, this.boundKeyDownHandler = (t) => this.handleKeyDown(t), this.boundKeyUpHandler = (t) => this.handleKeyUp(t), typeof window < "u" && (window.addEventListener("keydown", this.boundKeyDownHandler), window.addEventListener("keyup", this.boundKeyUpHandler));
  }
  bindKey(e, t) {
    this.keyBindings.has(e) || this.keyBindings.set(e, []);
    const i = this.keyBindings.get(e);
    i.includes(t) || i.push(t);
  }
  unbindKey(e, t) {
    if (!t) this.keyBindings.delete(e);
    else if (this.keyBindings.has(e)) {
      const i = this.keyBindings.get(e).filter((s) => s !== t);
      i.length > 0 ? this.keyBindings.set(e, i) : this.keyBindings.delete(e);
    }
  }
  handleKeyDown(e) {
    if (!this.enabled) return;
    const t = {
      code: e.code,
      key: e.key,
      repeat: e.repeat,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      timestamp: performance.now()
    };
    this.eventBus.emit(`key:down:${e.code}`, t), this.eventBus.emit(`key:down:${e.key}`, t), (e.code === "Enter" || e.key === "Enter") && (this.eventBus.emit("key:Enter", t), this.eventBus.emit("action:submit", t));
    const i = this.keyBindings.get(e.code) || this.keyBindings.get(e.key);
    if (i) for (const s of i) this.eventBus.emit(s, t);
    this.activeKeys.add(e.code);
  }
  handleKeyUp(e) {
    if (!this.enabled) return;
    const t = {
      code: e.code,
      key: e.key,
      repeat: !1,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      timestamp: performance.now()
    };
    this.eventBus.emit(`key:up:${e.code}`, t), this.eventBus.emit(`key:up:${e.key}`, t), this.activeKeys.delete(e.code);
  }
  isKeyDown(e) {
    return this.activeKeys.has(e);
  }
  destroy() {
    typeof window < "u" && (window.removeEventListener("keydown", this.boundKeyDownHandler), window.removeEventListener("keyup", this.boundKeyUpHandler)), this.keyBindings.clear(), this.activeKeys.clear();
  }
}, Zc = class {
  eventBus;
  actions = /* @__PURE__ */ new Map();
  constructor(e = Ar) {
    this.eventBus = e;
  }
  addAction(e, t) {
    this.actions.has(e) || (this.actions.set(e, []), this.eventBus.on(e, (i) => {
      const s = this.actions.get(e);
      s && s.forEach((r) => r(i));
    })), this.actions.get(e).push(t);
  }
};
export {
  Wc as ActionNode,
  $c as AnimationClip,
  Hc as AnimationStateMachine,
  _n as AudioManager,
  wi as BTNode,
  Kc as BlendTree1D,
  ms as BoundingBox,
  on as CameraController,
  Ic as CellularAutomata,
  Pn as CinematicOverlayManager,
  ze as Collider,
  K as ColliderType,
  R as Color,
  Ee as CustomShaderMaterial,
  tt as CutsceneAbortError,
  Nn as CutsceneContext,
  On as CutsceneManager,
  zn as DebugInspector,
  Rn as DebugRenderer,
  Bn as DefaultTheme,
  Oc as EasyScript,
  Zr as Engine,
  Vc as EngineCompiler,
  ve as EngineState,
  ds as EntityHandle,
  Zc as EventActionDispatcher,
  ec as EventBus,
  ti as EventEmitter,
  Xc as EventPriority,
  lc as FastSoAWorld,
  vc as FrustumCulling,
  An as GlobalAudio,
  qe as GlobalCinematicOverlay,
  Vn as GlobalDebugInspector,
  sc as GlobalEventBus,
  Ar as GlobalEvents,
  Cn as GlobalInput,
  En as GlobalUI,
  Mn as InputManager,
  jc as InverseKinematicsSolver,
  Fc as KairoApp,
  Yc as KeyEventTrigger,
  mc as Light,
  Vi as LightType,
  pc as Material,
  xe as MathUtils,
  ki as Matrix4,
  zc as MouseButton,
  Gc as NavGrid,
  Tt as NodeStatus,
  rc as ObjectPool,
  ut as PRNG,
  yc as ParticleSystem,
  Gc as PathfindingGrid,
  nn as PhysicsWorld,
  bn as PostProcessManager,
  st as Quaternion,
  oc as Query,
  Ei as Ray,
  hc as RaycastVehicle,
  wn as RenderPipeline,
  dc as RenderQueue,
  Qe as RigidBody,
  G as RigidBodyType,
  uc as SHADER_PRESETS,
  Fn as SaveSystem,
  Yr as Scene,
  In as SceneManager,
  zi as SceneNode,
  Dn as ScreenRecorder,
  Ql as ScriptBehavior,
  Nc as ScriptRunner,
  Uc as SelectorNode,
  Lc as SequenceNode,
  Ie as Serializer,
  fc as ShaderGraphCompiler,
  ys as ShaderPresets,
  Qr as SharedEntityContext,
  Jr as SharedEntityContextManager,
  Zl as SimplexNoise,
  gc as SkyboxSettings,
  cc as SpatialHashGrid3D,
  qc as StickmanAnimator,
  Jl as StickmanPose,
  ac as System,
  nc as SystemStage,
  Te as Time,
  kn as UIManager,
  pt as Vector2,
  k as Vector3,
  ic as Vector4,
  Fi as VideoTimeline,
  en as World,
  xc as createBlock,
  Cc as createCapsule,
  Ec as createCloud,
  Tc as createCone,
  Sc as createCylinder,
  Ac as createDodecahedron,
  Pc as createGrassField,
  _c as createIcosahedron,
  wc as createPlane,
  kc as createRock,
  bc as createSphere,
  Sn as createTerrain,
  Mc as createTorus,
  Bc as createTree,
  Tn as deriveCollider
};
