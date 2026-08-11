import * as f from "three";
import { ACESFilmicToneMapping as Br, AdditiveBlending as ps, AgXToneMapping as kr, BufferGeometry as Er, CineonToneMapping as zr, Color as he, ColorManagement as Vr, CustomToneMapping as Dr, DepthTexture as Rr, DoubleSide as Pi, Float32BufferAttribute as Bi, HalfFloatType as se, LinearToneMapping as Fr, Matrix4 as Ir, Mesh as Nr, MeshBasicMaterial as Or, MeshDepthMaterial as Lr, MeshNormalMaterial as Ur, NearestFilter as mt, NeutralToneMapping as Wr, NoBlending as Rt, OrthographicCamera as Gr, RGBADepthPacking as $r, RawShaderMaterial as Kr, ReinhardToneMapping as Hr, SRGBTransfer as jr, ShaderMaterial as Q, Timer as qr, UniformsUtils as Ie, Vector2 as L, Vector3 as Ce, Vector4 as Xr, WebGLRenderTarget as Z } from "three";
import * as Y from "cannon-es";
import * as I from "@babylonjs/core";
var gt = class Ft {
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
    return new Ft(this.x, this.y);
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
    return new Ft(0, 0);
  }
}, k = class Ze {
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
    return new Ze(this.x, this.y, this.z);
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
    return new Ze(i, s, r);
  }
  distanceTo(t) {
    const i = this.x - t.x, s = this.y - t.y, r = this.z - t.z;
    return Math.sqrt(i * i + s * s + r * r);
  }
  lerp(t, i) {
    return this.x += (t.x - this.x) * i, this.y += (t.y - this.y) * i, this.z += (t.z - this.z) * i, this;
  }
  static zero() {
    return new Ze(0, 0, 0);
  }
  static one() {
    return new Ze(1, 1, 1);
  }
}, Jl = class {
  x;
  y;
  z;
  w;
  constructor(e = 0, t = 0, i = 0, s = 1) {
    this.x = e, this.y = t, this.z = i, this.w = s;
  }
}, rt = class It {
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
    return new It(this.x, this.y, this.z, this.w);
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
    if (r < 0 && (s = new It(-t.x, -t.y, -t.z, -t.w), r = -r), r >= 1) return this;
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
    const r = i.x, n = i.y, a = i.z, o = i.w, l = r + r, c = n + n, h = a + a, d = r * l, u = r * c, g = r * h, p = n * c, y = n * h, m = a * h, v = o * l, A = o * c, S = o * h, w = s.x, _ = s.y, b = s.z, x = this.elements;
    return x[0] = (1 - (p + m)) * w, x[1] = (u + S) * w, x[2] = (g - A) * w, x[3] = 0, x[4] = (u - S) * _, x[5] = (1 - (d + m)) * _, x[6] = (y + v) * _, x[7] = 0, x[8] = (g + A) * b, x[9] = (y - v) * b, x[10] = (1 - (d + p)) * b, x[11] = 0, x[12] = t.x, x[13] = t.y, x[14] = t.z, x[15] = 1, this;
  }
  multiplyMatrices(t, i) {
    const s = t.elements, r = i.elements, n = this.elements, a = s[0], o = s[4], l = s[8], c = s[12], h = s[1], d = s[5], u = s[9], g = s[13], p = s[2], y = s[6], m = s[10], v = s[14], A = s[3], S = s[7], w = s[11], _ = s[15], b = r[0], x = r[4], T = r[8], M = r[12], B = r[1], C = r[5], V = r[9], z = r[13], D = r[2], U = r[6], E = r[10], G = r[14], R = r[3], j = r[7], q = r[11], X = r[15];
    return n[0] = a * b + o * B + l * D + c * R, n[4] = a * x + o * C + l * U + c * j, n[8] = a * T + o * V + l * E + c * q, n[12] = a * M + o * z + l * G + c * X, n[1] = h * b + d * B + u * D + g * R, n[5] = h * x + d * C + u * U + g * j, n[9] = h * T + d * V + u * E + g * q, n[13] = h * M + d * z + u * G + g * X, n[2] = p * b + y * B + m * D + v * R, n[6] = p * x + y * C + m * U + v * j, n[10] = p * T + y * V + m * E + v * q, n[14] = p * M + y * z + m * G + v * X, n[3] = A * b + S * B + w * D + _ * R, n[7] = A * x + S * C + w * U + _ * j, n[11] = A * T + S * V + w * E + _ * q, n[15] = A * M + S * z + w * G + _ * X, this;
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
}, F = class {
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
}, Ei = class Qe {
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
    if (o > l && ([o, l] = [l, o]), n > l || o > a) return Qe._missResult;
    o > n && (n = o), l < a && (a = l);
    let c = (t.min.z - this.origin.z) / r, h = (t.max.z - this.origin.z) / r;
    if (c > h && ([c, h] = [h, c]), n > h || c > a) return Qe._missResult;
    c > n && (n = c);
    const d = new k(this.origin.x + this.direction.x * n, this.origin.y + this.direction.y * n, this.origin.z + this.direction.z * n), u = new k(), g = 0.01;
    return Math.abs(d.x - t.max.x) < g ? u.x = 1 : Math.abs(d.x - t.min.x) < g ? u.x = -1 : Math.abs(d.y - t.max.y) < g ? u.y = 1 : Math.abs(d.y - t.min.y) < g ? u.y = -1 : Math.abs(d.z - t.max.z) < g ? u.z = 1 : Math.abs(d.z - t.min.z) < g ? u.z = -1 : u.z = 1, {
      hasHit: n >= 0,
      distance: n,
      point: d,
      normal: u
    };
  }
  intersectSphere(t, i) {
    const s = t.x - this.origin.x, r = t.y - this.origin.y, n = t.z - this.origin.z, a = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y + this.direction.z * this.direction.z), o = a > 0 ? this.direction.x / a : 0, l = a > 0 ? this.direction.y / a : 0, c = a > 0 ? this.direction.z / a : -1, h = s * o + r * l + n * c, d = s * s + r * r + n * n - h * h, u = i * i;
    if (d > u) return Qe._missResult;
    const g = Math.sqrt(u - d);
    let p = h - g, y = h + g;
    if (p < 0 && (p = y), p < 0) return Qe._missResult;
    const m = new k(this.origin.x + o * p, this.origin.y + l * p, this.origin.z + c * p), v = new k((m.x - t.x) / i, (m.y - t.y) / i, (m.z - t.z) / i);
    return {
      hasHit: !0,
      distance: p,
      point: m,
      normal: v
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
}, ve = class {
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
}, ri = class {
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
}, ec = new ri(), ke = class {
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
}, Ne = class {
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
}, zi = class Nt {
  id;
  name;
  parent = null;
  children = [];
  position = new k(0, 0, 0);
  rotation = new rt(0, 0, 0, 1);
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
    const i = new Nt(t.name, t.id);
    i.position.set(...t.position), i.rotation.set(...t.rotation), i.scale.set(...t.scale);
    for (const [s, r] of Object.entries(t.components || {})) i.addComponent(s, r);
    for (const s of t.children || []) i.addChild(Nt.deserialize(s));
    return i;
  }
}, Yr = class gs {
  root = new zi("Scene Root");
  events = new ri();
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
    return Ne.serialize({
      name: this.name,
      root: this.root.serialize()
    }, !0);
  }
  static deserialize(t) {
    const i = Ne.deserialize(t), s = new gs(i.name);
    return s.root = zi.deserialize(i.root), s;
  }
}, ye = {
  Stopped: "STOPPED",
  Running: "RUNNING",
  Paused: "PAUSED"
}, Zr = class {
  state = ye.Stopped;
  activeScene;
  events = new ri();
  animationFrameId = null;
  fixedUpdateAccumulator = 0;
  constructor() {
    this.activeScene = new Yr("Main Scene");
  }
  start() {
    this.state !== ye.Running && (this.state = ye.Running, this.events.emit("started"), this.loop(performance.now()));
  }
  pause() {
    this.state = ye.Paused, this.events.emit("paused");
  }
  resume() {
    this.state === ye.Paused && (this.state = ye.Running, this.events.emit("resumed"), this.loop(performance.now()));
  }
  stop() {
    this.state = ye.Stopped, this.animationFrameId !== null && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.events.emit("stopped");
  }
  loop = (e) => {
    if (this.state === ye.Running) {
      for (ke.update(e), this.fixedUpdateAccumulator += ke.deltaTime; this.fixedUpdateAccumulator >= ke.fixedDeltaTime; )
        this.fixedUpdate(ke.fixedDeltaTime), this.fixedUpdateAccumulator -= ke.fixedDeltaTime;
      this.update(ke.deltaTime), this.render(), typeof requestAnimationFrame < "u" && (this.animationFrameId = requestAnimationFrame(this.loop));
    }
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
}, tc = class {
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
}, ic = /* @__PURE__ */ (function(e) {
  return e.PreUpdate = "PreUpdate", e.Update = "Update", e.PostUpdate = "PostUpdate", e.FixedUpdate = "FixedUpdate", e;
})({}), sc = class {
  enabled = !0;
  priority = 0;
  stage = "Update";
}, rc = class {
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
}, nc = class $ {
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
    const r = this.posX, n = this.posY, a = this.posZ, o = this.velX, l = this.velY, c = this.velZ, h = this.radius, d = this.active, u = ++this.frameId;
    u === 4294967295 && (this.gridTag.fill(0), this.frameId = 1);
    const g = this.invCellSize, p = this.gridTableMask, y = this.gridHead, m = this.gridTag, v = this.gridNext;
    for (let b = 0; b < s; b++) {
      if (d[b] === 0) continue;
      let x = r[b] + o[b] * t, T = n[b] + l[b] * t, M = a[b] + c[b] * t;
      x < -i ? (x = -i, o[b] = -o[b]) : x > i && (x = i, o[b] = -o[b]), T < -i ? (T = -i, l[b] = -l[b]) : T > i && (T = i, l[b] = -l[b]), M < -i ? (M = -i, c[b] = -c[b]) : M > i && (M = i, c[b] = -c[b]), r[b] = x, n[b] = T, a[b] = M;
      const B = x * g | 0, C = T * g | 0, V = M * g | 0, z = (B * 73856093 ^ C * 19349663 ^ V * 83492791) & p;
      m[z] !== u && (m[z] = u, y[z] = -1), v[b] = y[z], y[z] = b;
    }
    let A = 0;
    const S = [
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
    ], w = [
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
    ], _ = [
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
    ];
    for (let b = 0; b < s; b++) {
      if (d[b] === 0) continue;
      const x = r[b], T = n[b], M = a[b], B = h[b], C = x * g | 0, V = T * g | 0, z = M * g | 0;
      for (let D = 0; D < 14; D++) {
        const U = ((C + S[D]) * 73856093 ^ (V + w[D]) * 19349663 ^ (z + _[D]) * 83492791) & p;
        if (m[U] !== u) continue;
        let E = y[U];
        const G = D === 0;
        for (; E !== -1; ) {
          if ((!G || E > b) && d[E] !== 0) {
            const R = B + h[E], j = r[E] - x;
            if (j >= R || j <= -R) {
              E = v[E];
              continue;
            }
            const q = n[E] - T;
            if (q >= R || q <= -R) {
              E = v[E];
              continue;
            }
            const X = a[E] - M;
            if (X >= R || X <= -R) {
              E = v[E];
              continue;
            }
            const Be = j * j + q * q + X * X;
            if (Be < R * R && Be > 1e-4) {
              A++;
              const Se = Math.sqrt(Be), me = j / Se, te = q / Se, ie = X / Se, re = 0.5 * (R - Se);
              r[b] -= me * re, n[b] -= te * re, a[b] -= ie * re, r[E] += me * re, n[E] += te * re, a[E] += ie * re;
              const Me = o[b] - o[E], pt = l[b] - l[E], ft = c[b] - c[E], le = me * Me + te * pt + ie * ft;
              o[b] -= le * me, l[b] -= le * te, c[b] -= le * ie, o[E] += le * me, l[E] += le * te, c[E] += le * ie;
            }
          }
          E = v[E];
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
}, W = {
  Dynamic: "DYNAMIC",
  Static: "STATIC",
  Kinematic: "KINEMATIC"
}, K = {
  Box: "BOX",
  Sphere: "SPHERE",
  Capsule: "CAPSULE",
  Mesh: "MESH"
}, ac = class {
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
}, Ve = class {
  type = K.Box;
  size = new k(1, 1, 1);
  radius = 0.5;
  isTrigger = !1;
  getBoundingBox(e, t) {
    const i = this.size.x * 0.5, s = this.size.y * 0.5, r = this.size.z * 0.5;
    return t ? (t.min.set(e.x - i, e.y - s, e.z - r), t.max.set(e.x + i, e.y + s, e.z + r), t) : new ms(new k(e.x - i, e.y - s, e.z - r), new k(e.x + i, e.y + s, e.z + r));
  }
}, Je = class {
  type = W.Dynamic;
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
    this.cannonBody && this.cannonBody.applyForce(ue(e), t ? ue(t) : this.cannonBody.position);
  }
  applyImpulse(e, t) {
    this.cannonBody && this.cannonBody.applyImpulse(ue(e), t ? ue(t) : this.cannonBody.position);
  }
  applyTorque(e) {
    this.cannonBody && this.cannonBody.torque.vadd(ue(e), this.cannonBody.torque);
  }
  teleport(e) {
    this.cannonBody && (this.cannonBody.position.set(e.x, e.y, e.z), this.cannonBody.previousPosition.set(e.x, e.y, e.z), this.cannonBody.interpolatedPosition.set(e.x, e.y, e.z));
  }
  get velocity() {
    return this.cannonBody ? wt(this.cannonBody.velocity) : new k();
  }
  set velocity(e) {
    this.cannonBody && this.cannonBody.velocity.set(e.x, e.y, e.z);
  }
  get angularVelocity() {
    return this.cannonBody ? wt(this.cannonBody.angularVelocity) : new k();
  }
  set angularVelocity(e) {
    this.cannonBody && this.cannonBody.angularVelocity.set(e.x, e.y, e.z);
  }
}, tn = class Ee {
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
    this.activeBackend = t, this.cannonWorld = new Y.World(), this.cannonWorld.gravity.set(0, -9.81, 0), this.cannonWorld.frictionGravity = new Y.Vec3().copy(this.cannonWorld.gravity), this.cannonWorld.broadphase = new Y.SAPBroadphase(this.cannonWorld), this.cannonWorld.solver.iterations = 10;
  }
  setBackend(t) {
    this.activeBackend = t, console.log(`[Kairo Physics] Active Physics Engine Backend set to: ${t.toUpperCase()}`);
  }
  clear() {
    for (const t of [...this.bodies]) this.unregisterBody(t.body);
    this.bodies = [], this.bodyLookup.clear(), this.collisionListeners = [], this.triggerListeners = [], this.activePairs.clear(), this.collisionEvents = [];
  }
  registerBody(t, i, s = new k()) {
    const r = t.type === W.Dynamic, n = t.type === W.Kinematic, a = new Y.Body({
      mass: r ? Math.max(1e-3, t.mass) : 0,
      type: r ? Y.Body.DYNAMIC : n ? Y.Body.KINEMATIC : Y.Body.STATIC,
      position: ue(s),
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
      } else Ee._havokFallbackWarned || (console.warn("[PhysicsWorld] Havok backend selected but Havok WASM plugin is not loaded; falling back to Cannon.js physics solver."), Ee._havokFallbackWarned = !0);
    const i = this.cannonWorld;
    i.gravity.set(this.gravity.x, this.gravity.y, this.gravity.z), this.cancelGravityForNonGravityBodies(), this.syncKinematicAndStaticBodies(), i.step(Ee.FIXED_TIMESTEP, t, Ee.MAX_SUBSTEPS), this.syncDynamicBodies(), this.collectCollisionEvents();
  }
  static _havokFallbackWarned = !1;
  cancelGravityForNonGravityBodies() {
    const t = this.gravity;
    for (const i of this.bodies) {
      const s = i.body.cannonBody;
      s && i.body.type === W.Dynamic && !i.body.useGravity && (s.force.x -= i.body.mass * t.x, s.force.y -= i.body.mass * t.y, s.force.z -= i.body.mass * t.z);
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
      let d;
      if (c.type === K.Sphere) {
        const u = c.radius || c.size.x * 0.5;
        d = r.intersectSphere(h, u);
      } else {
        const u = c.getBoundingBox(h, Ee._raycastTempBox);
        d = r.intersectBox(u);
      }
      d.hasHit && d.distance <= n && d.distance < a.distance && (a = {
        hasHit: !0,
        body: l,
        collider: c,
        point: d.point,
        normal: d.normal,
        distance: d.distance
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
        const l = i + (a.radius || a.size.x * 0.5), c = t.x - o.x, h = t.y - o.y, d = t.z - o.z;
        c * c + h * h + d * d <= l * l && s.push(n);
      } else {
        const l = a.size.x * 0.5, c = a.size.y * 0.5, h = a.size.z * 0.5, d = Pt(t.x, o.x - l, o.x + l), u = Pt(t.y, o.y - c, o.y + c), g = Pt(t.z, o.z - h, o.z + h), p = t.x - d, y = t.y - u, m = t.z - g;
        p * p + y * y + m * m <= i * i && s.push(n);
      }
    }
    return s;
  }
  overlapBox(t, i, s = !0) {
    const r = s ? i.x : i.x * 0.5, n = s ? i.y : i.y * 0.5, a = s ? i.z : i.z * 0.5, o = t.x - r, l = t.x + r, c = t.y - n, h = t.y + n, d = t.z - a, u = t.z + a, g = [];
    for (let p = 0; p < this.bodies.length; p++) {
      const { body: y, collider: m, position: v } = this.bodies[p];
      if (!y.cannonBody) continue;
      const A = m.size.x * 0.5, S = m.size.y * 0.5, w = m.size.z * 0.5;
      l >= v.x - A && o <= v.x + A && h >= v.y - S && c <= v.y + S && u >= v.z - w && d <= v.z + w && g.push(y);
    }
    return g;
  }
  createShape(t) {
    return t.type === K.Sphere ? new Y.Sphere(t.size.x * 0.5) : t.type === K.Capsule ? new Y.Cylinder(t.size.x * 0.5, t.size.x * 0.5, t.size.y, 12) : new Y.Box(new Y.Vec3(t.size.x * 0.5, t.size.y * 0.5, t.size.z * 0.5));
  }
  syncKinematicAndStaticBodies() {
    for (const t of this.bodies) t.body.cannonBody && t.body.type !== W.Dynamic && t.body.cannonBody.position.set(t.position.x, t.position.y, t.position.z);
  }
  syncDynamicBodies() {
    for (const t of this.bodies) t.body.cannonBody && t.body.type === W.Dynamic && t.position.set(t.body.cannonBody.position.x, t.body.cannonBody.position.y, t.body.cannonBody.position.z);
  }
  collectCollisionEvents() {
    const t = /* @__PURE__ */ new Map();
    this.collisionEvents = [];
    for (const i of this.cannonWorld.contacts) {
      const s = this.bodyLookup.get(i.bi), r = this.bodyLookup.get(i.bj);
      if (!s || !r) continue;
      const n = sn(i.bi.id, i.bj.id);
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
      point: wt(t.hitPointWorld),
      normal: wt(t.hitNormalWorld),
      distance: t.distance
    };
  }
};
function ue(e) {
  return new Y.Vec3(e.x, e.y, e.z);
}
function wt(e) {
  return new k(e.x, e.y, e.z);
}
function sn(e, t) {
  return e < t ? `${e}:${t}` : `${t}:${e}`;
}
function Pt(e, t, i) {
  return Math.max(t, Math.min(i, e));
}
var oc = class {
  cannonVehicle = null;
  chassisBody;
  constructor(e) {
    this.chassisBody = e.chassisBody, this.chassisBody.cannonBody && (this.cannonVehicle = new Y.RaycastVehicle({
      chassisBody: this.chassisBody.cannonBody,
      indexRightAxis: e.indexRightAxis ?? 0,
      indexUpAxis: e.indexUpAxis ?? 1,
      indexForwardAxis: e.indexForwardAxis ?? 2
    }));
  }
  addWheel(e) {
    this.cannonVehicle && this.cannonVehicle.addWheel({
      radius: e.radius,
      directionLocal: ue(e.directionLocal),
      suspensionStiffness: e.suspensionStiffness,
      suspensionRestLength: e.suspensionRestLength,
      frictionSlip: e.frictionSlip,
      dampingRelaxation: e.dampingRelaxation,
      dampingCompression: e.dampingCompression,
      maxSuspensionForce: e.maxSuspensionForce,
      rollInfluence: e.rollInfluence,
      axleLocal: ue(e.axleLocal),
      chassisConnectionPointLocal: ue(e.chassisConnectionPointLocal),
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
}, ze = class et {
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
    this.id = `shader_${Math.random().toString(36).substring(2, 9)}`, this.name = t, this.vertexShader = i.vertexShader || et.DEFAULT_VERTEX_SHADER, this.fragmentShader = i.fragmentShader || et.DEFAULT_FRAGMENT_SHADER, this.transparent = i.transparent ?? !1, this.wireframe = i.wireframe ?? !1, this.side = i.side || "front", this.blending = i.blending || "normal", this.depthWrite = i.depthWrite ?? !0, this.depthTest = i.depthTest ?? !0, this.uniforms = {
      u_time: {
        value: 0,
        type: "float"
      },
      u_resolution: {
        value: [1e3, 800],
        type: "vec2"
      },
      u_color: {
        value: new F(1, 1, 1, 1),
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
    return t instanceof F ? new f.Color(t.r, t.g, t.b) : i === "color" && typeof t == "string" ? new f.Color(t) : i === "color" && Array.isArray(t) ? new f.Color(t[0], t[1], t[2]) : i === "vec2" && Array.isArray(t) ? new f.Vector2(t[0], t[1]) : i === "vec3" && Array.isArray(t) ? new f.Vector3(t[0], t[1], t[2]) : i === "vec4" && Array.isArray(t) ? new f.Vector4(t[0], t[1], t[2], t[3]) : t;
  }
  clone() {
    const t = {};
    for (const [i, s] of Object.entries(this.uniforms)) t[i] = {
      type: s.type,
      value: Array.isArray(s.value) ? [...s.value] : s.value instanceof F ? new F(s.value.r, s.value.g, s.value.b, s.value.a) : s.value
    };
    return new et(`${this.name} Copy`, {
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
        value: i.value instanceof F ? i.value.toHex() : i.value
      }]))
    };
  }
  static fromJSON(t) {
    const i = new et(t.name, {
      vertexShader: t.vertexShader,
      fragmentShader: t.fragmentShader,
      transparent: t.transparent,
      wireframe: t.wireframe,
      side: t.side,
      blending: t.blending,
      depthWrite: t.depthWrite,
      depthTest: t.depthTest
    });
    if (t.uniforms) for (const [s, r] of Object.entries(t.uniforms)) r.type === "color" && typeof r.value == "string" ? i.setUniform(s, new F().setHex(r.value), "color") : i.setUniform(s, r.value, r.type);
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
}, lc = [
  "water",
  "dissolve",
  "hologram",
  "toon",
  "fresnel"
], ys = class Te {
  static createWaterShader() {
    return new ze("Water Wave Shader", {
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
          value: new F(0.1, 0.7, 0.9, 0.8),
          type: "color"
        },
        u_deepColor: {
          value: new F(0.01, 0.15, 0.45, 0.95),
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
          value: new F(1, 1, 1, 0.9),
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
    return new ze("Dissolve Noise Shader", {
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
          value: new F(1, 0.4, 0, 1),
          type: "color"
        },
        u_baseColor: {
          value: new F(0.2, 0.6, 1, 1),
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
    return new ze("Cyber Hologram Shader", {
      transparent: !0,
      side: "double",
      blending: "additive",
      uniforms: {
        u_time: {
          value: 0,
          type: "float"
        },
        u_hologramColor: {
          value: new F(0, 0.9, 1, 0.85),
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
    return new ze("Toon Cel Shader", {
      uniforms: {
        u_time: {
          value: 0,
          type: "float"
        },
        u_baseColor: {
          value: new F(0.9, 0.3, 0.2, 1),
          type: "color"
        },
        u_shadowColor: {
          value: new F(0.3, 0.1, 0.2, 1),
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
    return new ze("Glowing Fresnel Rim Shader", {
      transparent: !0,
      blending: "additive",
      uniforms: {
        u_time: {
          value: 0,
          type: "float"
        },
        u_innerColor: {
          value: new F(0.1, 0.1, 0.3, 0.5),
          type: "color"
        },
        u_glowColor: {
          value: new F(0.9, 0.2, 1, 1),
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
        return Te.createWaterShader();
      case "dissolve":
        return Te.createDissolveShader();
      case "hologram":
        return Te.createHologramShader();
      case "toon":
        return Te.createToonShader();
      case "fresnel":
        return Te.createFresnelGlowShader();
      default:
        return Te.createWaterShader();
    }
  }
}, cc = {
  Opaque: 2e3,
  AlphaTest: 2450,
  Transparent: 3e3
}, hc = class vs {
  id;
  name;
  color = new F(1, 1, 1, 1);
  roughness = 0.5;
  metalness = 0.1;
  emissive = new F(0, 0, 0, 1);
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
    return t.color = new F(this.color.r, this.color.g, this.color.b, this.color.a), t.roughness = this.roughness, t.metalness = this.metalness, t.emissive = new F(this.emissive.r, this.emissive.g, this.emissive.b, this.emissive.a), t.wireframe = this.wireframe, t.transparent = this.transparent, t.opacity = this.opacity, t.mapUrl = this.mapUrl, t.normalMapUrl = this.normalMapUrl, t.isShaderMaterial = this.isShaderMaterial, this.customShaderMaterial && (t.customShaderMaterial = this.customShaderMaterial.clone()), t;
  }
}, uc = class {
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
    }, i = e.nodes.find((d) => d.type === "master_output");
    let s = "", r = !1;
    const n = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), o = (d, u) => e.connections.find((g) => g.toNodeId === d && g.toPortId === u), l = (d) => {
      if (a.has(d)) return;
      a.add(d);
      const u = e.nodes.find((p) => p.id === d);
      if (!u) return;
      for (const p of u.inputs) {
        const y = o(u.id, p.id);
        y && l(y.fromNodeId);
      }
      const g = (p, y = "0.0") => {
        const m = o(u.id, p);
        if (m && n.has(`${m.fromNodeId}_${m.fromPortId}`)) return n.get(`${m.fromNodeId}_${m.fromPortId}`);
        if (u.properties && u.properties[p] !== void 0) {
          const v = u.properties[p];
          return typeof v == "number" ? v.toFixed(3) : y;
        }
        return y;
      };
      switch (u.type) {
        case "input_time": {
          const p = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${p}`, "u_time");
          break;
        }
        case "input_uv": {
          const p = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${p}`, "vUv");
          break;
        }
        case "input_local_pos": {
          const p = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${p}`, "vLocalPosition");
          break;
        }
        case "input_world_pos": {
          const p = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${p}`, "vWorldPosition");
          break;
        }
        case "input_view_pos": {
          const p = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${p}`, "vViewPosition");
          break;
        }
        case "input_world_normal": {
          const p = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${p}`, "vWorldNormal");
          break;
        }
        case "space_conversion": {
          const p = u.properties?.mode || "localToWorld", y = g("in", "vLocalPosition"), m = `space_${u.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          p === "localToWorld" ? s += `  vec3 ${m} = vWorldPosition;
` : p === "worldToView" ? s += `  vec3 ${m} = vViewPosition;
` : s += `  vec3 ${m} = ${y};
`;
          const v = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${v}`, m);
          break;
        }
        case "matrix_transform": {
          const p = u.properties?.matrix || "modelMatrix", y = g("in", "vec4(vLocalPosition, 1.0)"), m = `matTx_${u.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          p === "normalMatrix" ? s += `  vec3 ${m} = normalize(vNormal);
` : s += `  vec4 ${m} = ${p} * vec4(${y});
`;
          const v = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${v}`, m);
          break;
        }
        case "input_color": {
          const p = u.properties?.color || "#38bdf8", y = `u_color_${u.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          t[y] = {
            value: new F().setHex(p),
            type: "color"
          };
          const m = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${m}`, y);
          break;
        }
        case "input_float": {
          const p = u.properties?.value ?? 1, y = `u_float_${u.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          t[y] = {
            value: p,
            type: "float"
          };
          const m = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${m}`, y);
          break;
        }
        case "input_noise": {
          r || (r = !0);
          const p = g("uv", "vUv"), y = g("scale", "8.0"), m = `noise_${u.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          s += `  float ${m} = noise(${p} * ${y});
`;
          const v = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${v}`, m);
          break;
        }
        case "fresnel": {
          const p = g("power", "2.0"), y = `fresnel_${u.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          s += `  vec3 V_${u.id} = normalize(cameraPosition - vWorldPosition);
`, s += `  float ${y} = pow(1.0 - max(dot(V_${u.id}, vWorldNormal), 0.0), ${p});
`;
          const m = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${m}`, y);
          break;
        }
        case "math_add": {
          const p = g("a", "0.0"), y = g("b", "0.0"), m = `add_${u.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          s += `  vec4 ${m} = vec4(${p}) + vec4(${y});
`;
          const v = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${v}`, `${m}`);
          break;
        }
        case "math_multiply": {
          const p = g("a", "1.0"), y = g("b", "1.0"), m = `mul_${u.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          s += `  vec4 ${m} = vec4(${p}) * vec4(${y});
`;
          const v = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${v}`, `${m}`);
          break;
        }
        case "math_sin": {
          const p = g("in", "u_time"), y = `sin_${u.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          s += `  float ${y} = sin(${p}) * 0.5 + 0.5;
`;
          const m = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${m}`, y);
          break;
        }
        case "math_step": {
          const p = g("edge", "0.5"), y = g("in", "0.0"), m = `step_${u.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
          s += `  float ${m} = step(${p}, ${y});
`;
          const v = u.outputs[0]?.id || "out";
          n.set(`${u.id}_${v}`, m);
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
    ` : "", h = Object.keys(t).map((d) => {
      const u = t[d].type;
      return `uniform ${u === "color" ? "vec4" : u === "float" ? "float" : u === "vec2" ? "vec2" : u === "vec3" ? "vec3" : "vec4"} ${d};`;
    }).join(`
`);
    return {
      vertexShader: ze.DEFAULT_VERTEX_SHADER,
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
}, dc = class {
  type = Vi.Directional;
  color = new F(1, 1, 1, 1);
  intensity = 1;
  shadowCast = !0;
  range = 10;
  spotAngle = Math.PI / 4;
  constructor(e = Vi.Directional) {
    this.type = e;
  }
}, pc = class {
  color = new F(0.1, 0.12, 0.18, 1);
  sunDirection = new k(0.5, 1, 0.5).normalize();
  fogEnabled = !0;
  fogColor = new F(0.1, 0.12, 0.18, 1);
  fogNear = 10;
  fogFar = 100;
}, fc = class {
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
    for (let i = 0; i < this.activeCount; i++) {
      if (this.lives[i] += e, this.lives[i] >= this.maxLives[i]) continue;
      this.positionsX[i] += this.velocitiesX[i] * e, this.positionsY[i] += this.velocitiesY[i] * e, this.positionsZ[i] += this.velocitiesZ[i] * e, this.velocitiesY[i] -= 9.81 * e * 0.3;
      const s = this.lives[i] / this.maxLives[i], r = this.sizes[i] * (1 - s), n = this.positionsX[i], a = this.positionsY[i], o = this.positionsZ[i], l = this.mesh.instanceMatrix.array, c = t * 16;
      if (l[c + 0] = r, l[c + 1] = 0, l[c + 2] = 0, l[c + 3] = 0, l[c + 4] = 0, l[c + 5] = r, l[c + 6] = 0, l[c + 7] = 0, l[c + 8] = 0, l[c + 9] = 0, l[c + 10] = r, l[c + 11] = 0, l[c + 12] = n, l[c + 13] = a, l[c + 14] = o, l[c + 15] = 1, t !== i) {
        this.positionsX[t] = this.positionsX[i], this.positionsY[t] = this.positionsY[i], this.positionsZ[t] = this.positionsZ[i], this.velocitiesX[t] = this.velocitiesX[i], this.velocitiesY[t] = this.velocitiesY[i], this.velocitiesZ[t] = this.velocitiesZ[i], this.colors[t] = this.colors[i], this.sizes[t] = this.sizes[i], this.lives[t] = this.lives[i], this.maxLives[t] = this.maxLives[i];
        const h = this.mesh.instanceColor;
        h && (h.array[t * 3 + 0] = h.array[i * 3 + 0], h.array[t * 3 + 1] = h.array[i * 3 + 1], h.array[t * 3 + 2] = h.array[i * 3 + 2]);
      }
      t++;
    }
    this.activeCount = t, this.mesh.count = t, this.mesh.instanceMatrix.needsUpdate = !0, this.mesh.instanceColor && (this.mesh.instanceColor.needsUpdate = !0);
  }
}, rn = class {
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
      const d = Math.min(1, this.shotTimer / (this.activeShot.duration || 1)), u = 0.5 - Math.cos(d * Math.PI) / 2;
      if (this.activeShot.type === "pan" && this.activeShot.fromPos && this.activeShot.toPos)
        this.currentPosition.lerpVectors(this.activeShot.fromPos, this.activeShot.toPos, u), this.activeShot.targetPos && (this.target.copy(this.activeShot.targetPos), this.currentTarget.copy(this.activeShot.targetPos));
      else if (this.activeShot.type === "orbit" && this.activeShot.targetPos) {
        const g = this.shotTimer * (this.activeShot.speed || 1), p = this.activeShot.radius || 8;
        this.currentPosition.x = this.activeShot.targetPos.x + Math.sin(g) * p, this.currentPosition.y = this.activeShot.targetPos.y + 3, this.currentPosition.z = this.activeShot.targetPos.z + Math.cos(g) * p, this.target.copy(this.activeShot.targetPos), this.currentTarget.copy(this.activeShot.targetPos);
      } else if (this.activeShot.type === "dolly" && this.camera.isPerspectiveCamera) {
        const g = this.camera;
        g.fov += ((this.activeShot.fov || 30) - g.fov) * Math.min(1, 4 * e), g.updateProjectionMatrix();
      }
      d >= 1 && (this.activeShot = null), this.camera.position.copy(this.currentPosition), this.camera.lookAt(this.currentTarget);
      return;
    }
    if (this.trackingTarget) {
      const d = this.trackingTarget.position ?? this.trackingTarget;
      this.setTargetPosition(d);
    }
    const i = Math.min(0.1, Math.max(1e-3, e)), s = 1 - Math.exp(-this.lerpSpeed * i);
    this.currentTarget.lerp(this.target, s);
    const r = Math.sin(this.pitch), n = Math.cos(this.pitch), a = Math.sin(this.yaw), o = Math.cos(this.yaw), l = this.currentTarget.x + this.distance * a * n, c = this.currentTarget.y + this.distance * r, h = this.currentTarget.z + this.distance * o * n;
    if (this._desiredPos.set(l, c, h), this.enableCollisionAvoidance && t.length > 0 && (this._dir.copy(this._desiredPos).sub(this.currentTarget).normalize(), this._raycaster.set(this.currentTarget, this._dir), this._raycaster.near = 0.1, this._raycaster.far = this.distance, this._hits.length = 0, this._raycaster.intersectObjects(t, !0, this._hits), this._hits.length > 0)) {
      const d = this._hits[0].distance - 0.3;
      d < this.distance && this._desiredPos.copy(this.currentTarget).addScaledVector(this._dir, Math.max(this.minDistance, d));
    }
    if (this.currentPosition.lerp(this._desiredPos, s), this.shakeTimeRemaining > 0) {
      this.shakeTimeRemaining -= e;
      const d = this.shakeIntensity * (this.shakeTimeRemaining > 0 ? this.shakeTimeRemaining * this.shakeDecay : 0);
      this.shakeOffset.set((Math.random() - 0.5) * 2 * d, (Math.random() - 0.5) * 2 * d, (Math.random() - 0.5) * 2 * d);
    } else this.shakeOffset.set(0, 0, 0);
    this.camera.position.copy(this.currentPosition).add(this.shakeOffset), this.camera.lookAt(this.currentTarget);
  }
}, nt = {
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
}, pe = class {
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
}, nn = new Gr(-1, 1, 1, -1, 0, 1), an = class extends Er {
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
}, on = new an(), Ue = class {
  constructor(e) {
    this._mesh = new Nr(on, e);
  }
  dispose() {
    this._mesh.geometry.dispose();
  }
  render(e) {
    e.render(this._mesh, nn);
  }
  get material() {
    return this._mesh.material;
  }
  set material(e) {
    this._mesh.material = e;
  }
}, ln = class extends pe {
  constructor(e, t = "tDiffuse") {
    super(), this.textureID = t, this.uniforms = null, this.material = null, e instanceof Q ? (this.uniforms = e.uniforms, this.material = e) : e && (this.uniforms = Ie.clone(e.uniforms), this.material = new Q({
      name: e.name !== void 0 ? e.name : "unspecified",
      defines: Object.assign({}, e.defines),
      uniforms: this.uniforms,
      vertexShader: e.vertexShader,
      fragmentShader: e.fragmentShader
    })), this._fsQuad = new Ue(this.material);
  }
  render(e, t, i) {
    this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = i.texture), this._fsQuad.material = this.material, this.renderToScreen ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(t), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this._fsQuad.render(e));
  }
  dispose() {
    this.material.dispose(), this._fsQuad.dispose();
  }
}, Di = class extends pe {
  constructor(e, t) {
    super(), this.scene = e, this.camera = t, this.clear = !0, this.needsSwap = !1, this.inverse = !1;
  }
  render(e, t, i) {
    const s = e.getContext(), r = e.state;
    r.buffers.color.setMask(!1), r.buffers.depth.setMask(!1), r.buffers.color.setLocked(!0), r.buffers.depth.setLocked(!0);
    let n, a;
    this.inverse ? (n = 0, a = 1) : (n = 1, a = 0), r.buffers.stencil.setTest(!0), r.buffers.stencil.setOp(s.REPLACE, s.REPLACE, s.REPLACE), r.buffers.stencil.setFunc(s.ALWAYS, n, 4294967295), r.buffers.stencil.setClear(a), r.buffers.stencil.setLocked(!0), e.setRenderTarget(i), this.clear && e.clear(), e.render(this.scene, this.camera), e.setRenderTarget(t), this.clear && e.clear(), e.render(this.scene, this.camera), r.buffers.color.setLocked(!1), r.buffers.depth.setLocked(!1), r.buffers.color.setMask(!0), r.buffers.depth.setMask(!0), r.buffers.stencil.setLocked(!1), r.buffers.stencil.setFunc(s.EQUAL, 1, 4294967295), r.buffers.stencil.setOp(s.KEEP, s.KEEP, s.KEEP), r.buffers.stencil.setLocked(!0);
  }
}, cn = class extends pe {
  constructor() {
    super(), this.needsSwap = !1;
  }
  render(e) {
    e.state.buffers.stencil.setLocked(!1), e.state.buffers.stencil.setTest(!1);
  }
}, hn = class {
  constructor(e, t) {
    if (this.renderer = e, this._pixelRatio = e.getPixelRatio(), t === void 0) {
      const i = e.getSize(new L());
      this._width = i.width, this._height = i.height, t = new Z(this._width * this._pixelRatio, this._height * this._pixelRatio, { type: se }), t.texture.name = "EffectComposer.rt1";
    } else
      this._width = t.width, this._height = t.height;
    this.renderTarget1 = t, this.renderTarget2 = t.clone(), this.renderTarget2.texture.name = "EffectComposer.rt2", this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.renderToScreen = !0, this.passes = [], this.copyPass = new ln(nt), this.copyPass.material.blending = Rt, this.timer = new qr();
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
        Di !== void 0 && (n instanceof Di ? i = !0 : n instanceof cn && (i = !1));
      }
    }
    this.renderer.setRenderTarget(t);
  }
  reset(e) {
    if (e === void 0) {
      const t = this.renderer.getSize(new L());
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
}, un = class extends pe {
  constructor(e, t, i = null, s = null, r = null) {
    super(), this.scene = e, this.camera = t, this.overrideMaterial = i, this.clearColor = s, this.clearAlpha = r, this.clear = !0, this.clearDepth = !1, this.needsSwap = !1, this.isRenderPass = !0, this._oldClearColor = new he();
  }
  render(e, t, i) {
    const s = e.autoClear;
    e.autoClear = !1;
    let r, n;
    this.overrideMaterial !== null && (n = this.scene.overrideMaterial, this.scene.overrideMaterial = this.overrideMaterial), this.clearColor !== null && (e.getClearColor(this._oldClearColor), e.setClearColor(this.clearColor, e.getClearAlpha())), this.clearAlpha !== null && (r = e.getClearAlpha(), e.setClearAlpha(this.clearAlpha)), this.clearDepth == !0 && e.clearDepth(), e.setRenderTarget(this.renderToScreen ? null : i), this.clear === !0 && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), e.render(this.scene, this.camera), this.clearColor !== null && e.setClearColor(this._oldClearColor), this.clearAlpha !== null && e.setClearAlpha(r), this.overrideMaterial !== null && (this.scene.overrideMaterial = n), e.autoClear = s;
  }
}, dn = {
  name: "LuminosityHighPassShader",
  uniforms: {
    tDiffuse: { value: null },
    luminosityThreshold: { value: 1 },
    smoothWidth: { value: 1 },
    defaultColor: { value: new he(0) },
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
}, ni = class Ot extends pe {
  constructor(t, i = 1, s, r) {
    super(), this.strength = i, this.radius = s, this.threshold = r, this.resolution = t !== void 0 ? new L(t.x, t.y) : new L(256, 256), this.clearColor = new he(0, 0, 0), this.needsSwap = !1, this.renderTargetsHorizontal = [], this.renderTargetsVertical = [], this.nMips = 5;
    let n = Math.round(this.resolution.x / 2), a = Math.round(this.resolution.y / 2);
    this.renderTargetBright = new Z(n, a, { type: se }), this.renderTargetBright.texture.name = "UnrealBloomPass.bright", this.renderTargetBright.texture.generateMipmaps = !1;
    for (let h = 0; h < this.nMips; h++) {
      const d = new Z(n, a, { type: se });
      d.texture.name = "UnrealBloomPass.h" + h, d.texture.generateMipmaps = !1, this.renderTargetsHorizontal.push(d);
      const u = new Z(n, a, { type: se });
      u.texture.name = "UnrealBloomPass.v" + h, u.texture.generateMipmaps = !1, this.renderTargetsVertical.push(u), n = Math.round(n / 2), a = Math.round(a / 2);
    }
    const o = dn;
    this.highPassUniforms = Ie.clone(o.uniforms), this.highPassUniforms.luminosityThreshold.value = r, this.highPassUniforms.smoothWidth.value = 0.01, this.materialHighPassFilter = new Q({
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
      this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])), this.separableBlurMaterials[h].uniforms.invSize.value = new L(1 / n, 1 / a), n = Math.round(n / 2), a = Math.round(a / 2);
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
    ], this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, this.copyUniforms = Ie.clone(nt.uniforms), this.blendMaterial = new Q({
      uniforms: this.copyUniforms,
      vertexShader: nt.vertexShader,
      fragmentShader: nt.fragmentShader,
      premultipliedAlpha: !0,
      blending: ps,
      depthTest: !1,
      depthWrite: !1,
      transparent: !0
    }), this._oldClearColor = new he(), this._oldClearAlpha = 1, this._basic = new Or(), this._fsQuad = new Ue(null);
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
      this.renderTargetsHorizontal[n].setSize(s, r), this.renderTargetsVertical[n].setSize(s, r), this.separableBlurMaterials[n].uniforms.invSize.value = new L(1 / s, 1 / r), s = Math.round(s / 2), r = Math.round(r / 2);
  }
  render(t, i, s, r, n) {
    t.getClearColor(this._oldClearColor), this._oldClearAlpha = t.getClearAlpha();
    const a = t.autoClear;
    t.autoClear = !1, t.setClearColor(this.clearColor, 0), n && t.state.buffers.stencil.setTest(!1), this.renderToScreen && (this._fsQuad.material = this._basic, this._basic.map = s.texture, t.setRenderTarget(null), t.clear(), this._fsQuad.render(t)), this.highPassUniforms.tDiffuse.value = s.texture, this.highPassUniforms.luminosityThreshold.value = this.threshold, this._fsQuad.material = this.materialHighPassFilter, t.setRenderTarget(this.renderTargetBright), t.clear(), this._fsQuad.render(t);
    let o = this.renderTargetBright;
    for (let l = 0; l < this.nMips; l++)
      this._fsQuad.material = this.separableBlurMaterials[l], this.separableBlurMaterials[l].uniforms.colorTexture.value = o.texture, this.separableBlurMaterials[l].uniforms.direction.value = Ot.BlurDirectionX, t.setRenderTarget(this.renderTargetsHorizontal[l]), t.clear(), this._fsQuad.render(t), this.separableBlurMaterials[l].uniforms.colorTexture.value = this.renderTargetsHorizontal[l].texture, this.separableBlurMaterials[l].uniforms.direction.value = Ot.BlurDirectionY, t.setRenderTarget(this.renderTargetsVertical[l]), t.clear(), this._fsQuad.render(t), o = this.renderTargetsVertical[l];
    this._fsQuad.material = this.compositeMaterial, this.compositeMaterial.uniforms.bloomStrength.value = this.strength, this.compositeMaterial.uniforms.bloomRadius.value = this.radius, this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, t.setRenderTarget(this.renderTargetsHorizontal[0]), t.clear(), this._fsQuad.render(t), this._fsQuad.material = this.blendMaterial, this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture, n && t.state.buffers.stencil.setTest(!0), this.renderToScreen ? (t.setRenderTarget(null), this._fsQuad.render(t)) : (t.setRenderTarget(s), this._fsQuad.render(t)), t.setClearColor(this._oldClearColor, this._oldClearAlpha), t.autoClear = a;
  }
  _getSeparableBlurMaterial(t) {
    const i = [], s = t / 3;
    for (let r = 0; r < t; r++) i.push(0.39894 * Math.exp(-0.5 * r * r / (s * s)) / s);
    return new Q({
      defines: { KERNEL_RADIUS: t },
      uniforms: {
        colorTexture: { value: null },
        invSize: { value: new L(0.5, 0.5) },
        direction: { value: new L(0.5, 0.5) },
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
    return new Q({
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
ni.BlurDirectionX = new L(1, 0);
ni.BlurDirectionY = new L(0, 1);
var ai = class tt extends pe {
  constructor(t, i, s, r) {
    super(), this.renderScene = i, this.renderCamera = s, this.selectedObjects = r !== void 0 ? r : [], this.visibleEdgeColor = new he(1, 1, 1), this.hiddenEdgeColor = new he(0.1, 0.04, 0.02), this.edgeGlow = 0, this.usePatternTexture = !1, this.patternTexture = null, this.edgeThickness = 1, this.edgeStrength = 3, this.downSampleRatio = 2, this.pulsePeriod = 0, this._visibilityCache = /* @__PURE__ */ new Map(), this._selectionCache = /* @__PURE__ */ new Set(), this.resolution = t !== void 0 ? new L(t.x, t.y) : new L(256, 256);
    const n = Math.round(this.resolution.x / this.downSampleRatio), a = Math.round(this.resolution.y / this.downSampleRatio);
    this.renderTargetMaskBuffer = new Z(this.resolution.x, this.resolution.y), this.renderTargetMaskBuffer.texture.name = "OutlinePass.mask", this.renderTargetMaskBuffer.texture.generateMipmaps = !1, this.depthMaterial = new Lr(), this.depthMaterial.side = Pi, this.depthMaterial.depthPacking = $r, this.depthMaterial.blending = Rt, this.prepareMaskMaterial = this._getPrepareMaskMaterial(), this.prepareMaskMaterial.side = Pi, this.prepareMaskMaterial.fragmentShader = h(this.prepareMaskMaterial.fragmentShader, this.renderCamera), this.renderTargetDepthBuffer = new Z(this.resolution.x, this.resolution.y, { type: se }), this.renderTargetDepthBuffer.texture.name = "OutlinePass.depth", this.renderTargetDepthBuffer.texture.generateMipmaps = !1, this.renderTargetMaskDownSampleBuffer = new Z(n, a, { type: se }), this.renderTargetMaskDownSampleBuffer.texture.name = "OutlinePass.depthDownSample", this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = !1, this.renderTargetBlurBuffer1 = new Z(n, a, { type: se }), this.renderTargetBlurBuffer1.texture.name = "OutlinePass.blur1", this.renderTargetBlurBuffer1.texture.generateMipmaps = !1, this.renderTargetBlurBuffer2 = new Z(Math.round(n / 2), Math.round(a / 2), { type: se }), this.renderTargetBlurBuffer2.texture.name = "OutlinePass.blur2", this.renderTargetBlurBuffer2.texture.generateMipmaps = !1, this.edgeDetectionMaterial = this._getEdgeDetectionMaterial(), this.renderTargetEdgeBuffer1 = new Z(n, a, { type: se }), this.renderTargetEdgeBuffer1.texture.name = "OutlinePass.edge1", this.renderTargetEdgeBuffer1.texture.generateMipmaps = !1, this.renderTargetEdgeBuffer2 = new Z(Math.round(n / 2), Math.round(a / 2), { type: se }), this.renderTargetEdgeBuffer2.texture.name = "OutlinePass.edge2", this.renderTargetEdgeBuffer2.texture.generateMipmaps = !1;
    const o = 4, l = 4;
    this.separableBlurMaterial1 = this._getSeparableBlurMaterial(o), this.separableBlurMaterial1.uniforms.texSize.value.set(n, a), this.separableBlurMaterial1.uniforms.kernelRadius.value = 1, this.separableBlurMaterial2 = this._getSeparableBlurMaterial(l), this.separableBlurMaterial2.uniforms.texSize.value.set(Math.round(n / 2), Math.round(a / 2)), this.separableBlurMaterial2.uniforms.kernelRadius.value = l, this.overlayMaterial = this._getOverlayMaterial();
    const c = nt;
    this.copyUniforms = Ie.clone(c.uniforms), this.materialCopy = new Q({
      uniforms: this.copyUniforms,
      vertexShader: c.vertexShader,
      fragmentShader: c.fragmentShader,
      blending: Rt,
      depthTest: !1,
      depthWrite: !1
    }), this.enabled = !0, this.needsSwap = !1, this._oldClearColor = new he(), this.oldClearAlpha = 1, this._fsQuad = new Ue(null), this.tempPulseColor1 = new he(), this.tempPulseColor2 = new he(), this.textureMatrix = new Ir();
    function h(d, u) {
      const g = u.isPerspectiveCamera ? "perspective" : "orthographic";
      return d.replace(/DEPTH_TO_VIEW_Z/g, g + "DepthToViewZ");
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
      this._fsQuad.material = this.edgeDetectionMaterial, this.edgeDetectionMaterial.uniforms.maskTexture.value = this.renderTargetMaskDownSampleBuffer.texture, this.edgeDetectionMaterial.uniforms.texSize.value.set(this.renderTargetMaskDownSampleBuffer.width, this.renderTargetMaskDownSampleBuffer.height), this.edgeDetectionMaterial.uniforms.visibleEdgeColor.value = this.tempPulseColor1, this.edgeDetectionMaterial.uniforms.hiddenEdgeColor.value = this.tempPulseColor2, t.setRenderTarget(this.renderTargetEdgeBuffer1), t.clear(), this._fsQuad.render(t), this._fsQuad.material = this.separableBlurMaterial1, this.separableBlurMaterial1.uniforms.colorTexture.value = this.renderTargetEdgeBuffer1.texture, this.separableBlurMaterial1.uniforms.direction.value = tt.BlurDirectionX, this.separableBlurMaterial1.uniforms.kernelRadius.value = this.edgeThickness, t.setRenderTarget(this.renderTargetBlurBuffer1), t.clear(), this._fsQuad.render(t), this.separableBlurMaterial1.uniforms.colorTexture.value = this.renderTargetBlurBuffer1.texture, this.separableBlurMaterial1.uniforms.direction.value = tt.BlurDirectionY, t.setRenderTarget(this.renderTargetEdgeBuffer1), t.clear(), this._fsQuad.render(t), this._fsQuad.material = this.separableBlurMaterial2, this.separableBlurMaterial2.uniforms.colorTexture.value = this.renderTargetEdgeBuffer1.texture, this.separableBlurMaterial2.uniforms.direction.value = tt.BlurDirectionX, t.setRenderTarget(this.renderTargetBlurBuffer2), t.clear(), this._fsQuad.render(t), this.separableBlurMaterial2.uniforms.colorTexture.value = this.renderTargetBlurBuffer2.texture, this.separableBlurMaterial2.uniforms.direction.value = tt.BlurDirectionY, t.setRenderTarget(this.renderTargetEdgeBuffer2), t.clear(), this._fsQuad.render(t), this._fsQuad.material = this.overlayMaterial, this.overlayMaterial.uniforms.maskTexture.value = this.renderTargetMaskBuffer.texture, this.overlayMaterial.uniforms.edgeTexture1.value = this.renderTargetEdgeBuffer1.texture, this.overlayMaterial.uniforms.edgeTexture2.value = this.renderTargetEdgeBuffer2.texture, this.overlayMaterial.uniforms.patternTexture.value = this.patternTexture, this.overlayMaterial.uniforms.edgeStrength.value = this.edgeStrength, this.overlayMaterial.uniforms.edgeGlow.value = this.edgeGlow, this.overlayMaterial.uniforms.usePatternTexture.value = this.usePatternTexture, n && t.state.buffers.stencil.setTest(!0), t.setRenderTarget(s), this._fsQuad.render(t), t.setClearColor(this._oldClearColor, this.oldClearAlpha), t.autoClear = a;
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
    return new Q({
      uniforms: {
        depthTexture: { value: null },
        cameraNearFar: { value: new L(0.5, 0.5) },
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
    return new Q({
      uniforms: {
        maskTexture: { value: null },
        texSize: { value: new L(0.5, 0.5) },
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
    return new Q({
      defines: { MAX_RADIUS: t },
      uniforms: {
        colorTexture: { value: null },
        texSize: { value: new L(0.5, 0.5) },
        direction: { value: new L(0.5, 0.5) },
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
    return new Q({
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
ai.BlurDirectionX = new L(1, 0);
ai.BlurDirectionY = new L(0, 1);
var pn = {
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
}, fn = class extends pe {
  constructor(e = 0.5, t = !1) {
    super();
    const i = pn;
    this.uniforms = Ie.clone(i.uniforms), this.material = new Q({
      name: i.name,
      uniforms: this.uniforms,
      vertexShader: i.vertexShader,
      fragmentShader: i.fragmentShader
    }), this.uniforms.intensity.value = e, this.uniforms.grayscale.value = t, this._fsQuad = new Ue(this.material);
  }
  render(e, t, i, s) {
    this.uniforms.tDiffuse.value = i.texture, this.uniforms.time.value += s, this.renderToScreen ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(t), this.clear && e.clear(), this._fsQuad.render(e));
  }
  dispose() {
    this.material.dispose(), this._fsQuad.dispose();
  }
}, mn = class extends pe {
  constructor(e, t, i, s = {}) {
    super(), this.pixelSize = e, this.scene = t, this.camera = i, this.normalEdgeStrength = s.normalEdgeStrength || 0.3, this.depthEdgeStrength = s.depthEdgeStrength || 0.4, this.pixelatedMaterial = this._createPixelatedMaterial(), this._resolution = new L(), this._renderResolution = new L(), this._normalMaterial = new Ur(), this._beautyRenderTarget = new Z(), this._beautyRenderTarget.texture.minFilter = mt, this._beautyRenderTarget.texture.magFilter = mt, this._beautyRenderTarget.texture.type = se, this._beautyRenderTarget.depthTexture = new Rr(), this._normalRenderTarget = new Z(), this._normalRenderTarget.texture.minFilter = mt, this._normalRenderTarget.texture.magFilter = mt, this._normalRenderTarget.texture.type = se, this._fsQuad = new Ue(this.pixelatedMaterial);
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
    return new Q({
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
}, yt = {
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
}, gn = class extends pe {
  constructor() {
    super(), this.isOutputPass = !0, this.uniforms = Ie.clone(yt.uniforms), this.material = new Kr({
      name: yt.name,
      uniforms: this.uniforms,
      vertexShader: yt.vertexShader,
      fragmentShader: yt.fragmentShader
    }), this._fsQuad = new Ue(this.material), this._outputColorSpace = null, this._toneMapping = null;
  }
  render(e, t, i) {
    this.uniforms.tDiffuse.value = i.texture, this.uniforms.toneMappingExposure.value = e.toneMappingExposure, (this._outputColorSpace !== e.outputColorSpace || this._toneMapping !== e.toneMapping) && (this._outputColorSpace = e.outputColorSpace, this._toneMapping = e.toneMapping, this.material.defines = {}, Vr.getTransfer(this._outputColorSpace) === jr && (this.material.defines.SRGB_TRANSFER = ""), this._toneMapping === Fr ? this.material.defines.LINEAR_TONE_MAPPING = "" : this._toneMapping === Hr ? this.material.defines.REINHARD_TONE_MAPPING = "" : this._toneMapping === zr ? this.material.defines.CINEON_TONE_MAPPING = "" : this._toneMapping === Br ? this.material.defines.ACES_FILMIC_TONE_MAPPING = "" : this._toneMapping === kr ? this.material.defines.AGX_TONE_MAPPING = "" : this._toneMapping === Wr ? this.material.defines.NEUTRAL_TONE_MAPPING = "" : this._toneMapping === Dr && (this.material.defines.CUSTOM_TONE_MAPPING = ""), this.material.needsUpdate = !0), this.renderToScreen === !0 ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(t), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this._fsQuad.render(e));
  }
  dispose() {
    this.material.dispose(), this._fsQuad.dispose();
  }
}, yn = class {
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
    this.renderer = e, this.scene = t, this.camera = i, this.composer = new hn(e), this.renderPass = new un(t, i), this.composer.addPass(this.renderPass), this.pixelatedPass = new mn(6, t, i), this.pixelatedPass.enabled = !1, this.composer.addPass(this.pixelatedPass), this.outlinePass = new ai(new f.Vector2(window.innerWidth, window.innerHeight), t, i), this.outlinePass.edgeStrength = 3, this.outlinePass.edgeGlow = 0.5, this.outlinePass.edgeThickness = 1, this.outlinePass.visibleEdgeColor.set("#ffffff"), this.outlinePass.hiddenEdgeColor.set("#222222"), this.outlinePass.enabled = !1, this.composer.addPass(this.outlinePass), this.bloomPass = new ni(new f.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85), this.bloomPass.enabled = !1, this.composer.addPass(this.bloomPass), this.filmPass = new fn(), this.filmPass.enabled = !1, this.composer.addPass(this.filmPass), this.outputPass = new gn(), this.composer.addPass(this.outputPass), window.addEventListener("resize", () => {
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
}, vn = class {
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
    this.renderer = e, this.scene = t, this.camera = i, this.postProcessing = new yn(this.renderer, this.scene, this.camera), this.setupRendererDefaults();
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
}, mc = class {
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
function fe(e, t = {}) {
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
function gc(e, t) {
  return fe(new f.BoxGeometry(...e), t);
}
function yc(e, t) {
  return fe(new f.SphereGeometry(e, t?.castShadow === !1 ? 16 : 32, 16), t);
}
function vc(e, t, i) {
  const s = fe(new f.PlaneGeometry(e, t, 1, 1), i);
  return s.rotation.x = -Math.PI / 2, i?.rotation && s.rotation.set(...i.rotation), s;
}
function bc(e, t, i, s) {
  return fe(new f.CylinderGeometry(e, t, i, 24), s);
}
function xc(e, t, i) {
  return fe(new f.ConeGeometry(e, t, 24), i);
}
function wc(e, t, i) {
  return fe(new f.TorusGeometry(e, t, 16, 48), i);
}
function Sc(e, t, i) {
  return fe(new f.CapsuleGeometry(e, t, 8, 16), i);
}
function Mc(e, t = 1, i) {
  return fe(new f.IcosahedronGeometry(e, t), i);
}
function Tc(e, t = 0, i) {
  return fe(new f.DodecahedronGeometry(e, t), i);
}
function Ri(e, t, i, s, r) {
  let n = 0, a = 1, o = 1, l = 0;
  for (let c = 0; c < s; c++)
    n += e.noise2D(t * a, i * a) * o, l += o, o *= r, a *= 2;
  return (n / l + 1) / 2;
}
function bn(e = {}) {
  const t = e.size ?? 100, i = e.segments ?? 128, s = e.seed ?? 1337, r = e.amplitude ?? 6, n = e.frequency ?? 0.08, a = e.octaves ?? 5, o = e.persistence ?? 0.5, l = e.position ?? [
    0,
    0,
    0
  ], c = new ql(s), h = new f.PlaneGeometry(t, t, i, i);
  h.rotateX(-Math.PI / 2);
  const d = h.attributes.position, u = [], g = new Float32Array(d.count * 3), p = new f.Color(e.color ?? 4881471), y = new f.Color(e.highColor ?? 9416299);
  for (let S = 0; S < d.count; S++) {
    const w = d.getX(S), _ = d.getZ(S), b = Ri(c, w * n, _ * n, a, o);
    d.setY(S, b * r);
    const x = Math.floor((_ + t / 2) / t * i);
    u[x] || (u[x] = []), u[x][Math.floor((w + t / 2) / t * i)] = b;
    const T = p.clone().lerp(y, b);
    g[S * 3] = T.r, g[S * 3 + 1] = T.g, g[S * 3 + 2] = T.b;
  }
  d.needsUpdate = !0, h.setAttribute("color", new f.BufferAttribute(g, 3)), h.computeVertexNormals();
  const m = new f.MeshStandardMaterial({
    vertexColors: !0,
    roughness: e.roughness ?? 0.95,
    metalness: e.metalness ?? 0,
    wireframe: e.wireframe ?? !1
  }), v = new f.Mesh(h, m);
  return v.position.set(...l), v.castShadow = !0, v.receiveShadow = !0, v.name = "Terrain", {
    mesh: v,
    geometry: h,
    heightAt: (S, w) => Ri(c, (S - l[0]) * n, (w - l[2]) * n, a, o) * r + l[1],
    heights: u
  };
}
function Cc(e = {}) {
  const t = e.count ?? 2e3, i = e.area ?? 40, [s, r] = e.height ?? [0.5, 1.2], n = e.width ?? 0.12, a = e.seed ?? 1, o = e.position ?? [
    0,
    0,
    0
  ], l = e.heightAt ?? null, c = new dt(a), h = new f.PlaneGeometry(n, 1, 1, 1);
  h.translate(0, 0.5, 0);
  const d = new f.Color(e.color ?? 5020223), u = new f.Color(e.tipColor ?? 9426016), g = new Float32Array(h.attributes.position.count * 3);
  for (let A = 0; A < h.attributes.position.count; A++) {
    const S = h.attributes.position.getY(A), w = d.clone().lerp(u, S);
    g[A * 3] = w.r, g[A * 3 + 1] = w.g, g[A * 3 + 2] = w.b;
  }
  h.setAttribute("color", new f.BufferAttribute(g, 3));
  const p = new f.MeshStandardMaterial({
    vertexColors: !0,
    side: f.DoubleSide,
    roughness: 1
  }), y = new f.InstancedMesh(h, p, t);
  y.position.set(...o), y.castShadow = e.castShadow ?? !1;
  const m = i / 2, v = new f.Object3D();
  for (let A = 0; A < t; A++) {
    const S = c.nextFloat(-m, m), w = c.nextFloat(-m, m), _ = c.nextFloat(s, r), b = l ? l(S + o[0], w + o[2]) - o[1] : 0;
    v.position.set(S, b - 0.03, w), v.rotation.set(0, c.nextFloat(0, Math.PI), c.nextFloat(-0.2, 0.2)), v.scale.set(c.nextFloat(0.7, 1.3), _, 1), v.updateMatrix(), y.setMatrixAt(A, v.matrix);
  }
  return y.instanceMatrix.needsUpdate = !0, y;
}
function _c(e = {}) {
  const t = e.position ?? [
    0,
    0,
    0
  ], i = e.scale ?? 1, s = (e.trunkHeight ?? 2.2) * i, r = (e.trunkRadius ?? 0.25) * i, n = (e.canopyRadius ?? 1.5) * i, a = new dt(e.seed ?? Math.floor(Math.random() * 99999)), o = new f.Group();
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
  const d = new f.Mesh(new f.IcosahedronGeometry(n * 0.55, 1), c);
  return d.position.set(n * 0.5, s + n * 0.3, a.nextFloat(-0.3, 0.3)), d.castShadow = !0, o.add(d), o;
}
function Ac(e = {}) {
  const t = e.position ?? [
    0,
    0,
    0
  ], i = e.scale ?? 1, s = (e.radius ?? 0.6) * i, r = new dt(e.seed ?? Math.floor(Math.random() * 99999)), n = new f.DodecahedronGeometry(s, 1), a = n.attributes.position;
  for (let l = 0; l < a.count; l++) {
    const c = a.getX(l), h = a.getY(l), d = a.getZ(l), u = 1 + r.nextFloat(-0.25, 0.35);
    a.setXYZ(l, c * u, h * u, d * u);
  }
  n.computeVertexNormals();
  const o = new f.Mesh(n, new f.MeshStandardMaterial({
    color: e.color ?? 9079434,
    roughness: 0.95
  }));
  return o.position.set(...t), o.castShadow = !0, o.receiveShadow = !0, o;
}
function Pc(e = {}) {
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
function xn(e) {
  const t = new Ve(), i = e.geometry, s = e.getWorldScale(new f.Vector3()), r = (o, l, c) => {
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
var Bc = /* @__PURE__ */ (function(e) {
  return e[e.Left = 0] = "Left", e[e.Middle = 1] = "Middle", e[e.Right = 2] = "Right", e;
})({}), wn = class {
  keysPressed = /* @__PURE__ */ new Set();
  keysJustPressed = /* @__PURE__ */ new Set();
  keysJustReleased = /* @__PURE__ */ new Set();
  mousePosition = new gt();
  mouseDelta = new gt();
  mouseButtonsPressed = /* @__PURE__ */ new Set();
  mouseButtonsJustPressed = /* @__PURE__ */ new Set();
  touchJoystickActive = !1;
  touchJoystickVector = new gt(0, 0);
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
    const e = new gt(0, 0);
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
}, Sn = new wn(), Mn = class {
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
}, Tn = new Mn(), Cn = class {
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
    const a = typeof t.width == "number" ? `${t.width}px` : t.width || "200px", o = typeof t.height == "number" ? `${t.height}px` : t.height || "auto", l = t.opacity ?? 1, c = t.blendMode || "normal", h = t.x !== void 0 ? typeof t.x == "number" ? `${t.x}px` : t.x : "50%", d = t.y !== void 0 ? typeof t.y == "number" ? `${t.y}px` : t.y : "50%";
    return s.style.cssText = `
      position: absolute;
      left: ${h};
      top: ${d};
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
}, Xe = new Cn(), _n = {
  primaryColor: "#3b82f6",
  accentColor: "#10b981",
  backgroundColor: "#09090b",
  cardBackground: "rgba(24, 24, 27, 0.85)",
  textColor: "#fafafa",
  mutedTextColor: "#a1a1aa",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  borderRadius: "12px"
}, An = class {
  container = null;
  theme;
  constructor(e = _n) {
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
    return Xe.showImageOverlay(e, t);
  }
  removeImageOverlay(e) {
    Xe.removeImageOverlay(e);
  }
  setLetterbox(e, t) {
    Xe.setLetterbox(e, t);
  }
  async transitionCut(e, t) {
    await Xe.transitionCut(e, t);
  }
  setColorGrading(e) {
    Xe.setColorGrading(e);
  }
}, Pn = new An(), Bn = class {
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
}, kn = new Bn(), kc = class {
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
      const d = JSON.stringify(h, null, 2), u = new TextEncoder().encode(d).length;
      r += u;
      const g = [];
      if (i.prebakeSpatialHash && h.elements) {
        const S = /* @__PURE__ */ new Map();
        h.elements.forEach((w, _) => {
          const b = w.id || `elem_${_}`, x = `${w.pos[0]},${w.pos[1]}`;
          S.has(x) || S.set(x, []), S.get(x).push(b);
        }), S.forEach((w, _) => {
          g.push({
            key: _,
            elementIds: w
          });
        });
      }
      const p = JSON.stringify(h), y = Ne.createSaveEnvelope(JSON.parse(p)), m = JSON.stringify(y), v = i.compressBinaryLevels ? Ne.compressToBase64(m) : m, A = new TextEncoder().encode(v).length;
      n += A, a.push({
        id: h.id,
        name: h.name,
        world: h.world,
        binaryPayload: v,
        spatialHashBake: g,
        checksum: y.checksum
      }), s.push(`[Level ${h.id}] '${h.name}' compiled (${u}B -> ${A}B)`);
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
}, En = class {
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
}, zn = class {
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
          if (!(e >= i.startTime && e <= s)) continue;
          const r = e - i.startTime, n = r / i.duration;
          if (t.type === "camera" && this.app?.cameraController) {
            if (i.props.shotType === "pan" && i.props.fromPos && i.props.toPos && i.props.target) {
              const a = new f.Vector3().lerpVectors(new f.Vector3(...i.props.fromPos), new f.Vector3(...i.props.toPos), n);
              this.app.cameraController.camera.position.copy(a), this.app.cameraController.camera.lookAt(new f.Vector3(...i.props.target));
            } else if (i.props.shotType === "orbit" && i.props.target) {
              const a = r * (i.props.speed || 1), o = i.props.radius || 8, l = new f.Vector3(...i.props.target);
              this.app.cameraController.camera.position.set(l.x + Math.sin(a) * o, l.y + 3, l.z + Math.cos(a) * o), this.app.cameraController.camera.lookAt(l);
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
}, Vn = class {
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
        const t = JSON.parse(e), i = Ne.verifyAndUnwrapSave(t);
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
      const e = Ne.createSaveEnvelope(this.data);
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
}, Dn = class {
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
}, it = class extends Error {
  constructor() {
    super("Cutscene Aborted"), this.name = "CutsceneAbortError";
  }
}, Rn = class {
  app;
  aborted = !1;
  constructor(e) {
    this.app = e;
  }
  abort() {
    this.aborted = !0, this.app.ui.hideSubtitle();
  }
  checkAbort() {
    if (this.aborted) throw new it();
  }
  async wait(e) {
    return this.checkAbort(), new Promise((t, i) => {
      let s = 0;
      const r = (n) => {
        if (this.aborted)
          return this.app.engine.events.off("update", r), i(new it());
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
          return this.app.engine.events.off("update", o), s(new it());
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
          return this.app.engine.events.off("update", l), s(new it());
        r += c;
        const h = Math.min(r / t, 1), d = h * h * (3 - 2 * h);
        this.app.camera.quaternion.slerpQuaternions(n, o, d), h >= 1 && (this.app.engine.events.off("update", l), i());
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
}, Fn = class {
  app;
  activeContext = null;
  constructor(e) {
    this.app = e;
  }
  async play(e) {
    this.stop(), this.activeContext = new Rn(this.app);
    try {
      await e(this.activeContext);
    } catch (t) {
      if (t instanceof it) console.log("[CutsceneManager] Cutscene skipped.");
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
function In(e, t) {
  e.indexOf(t) === -1 && e.push(t);
}
function oi(e, t) {
  const i = e.indexOf(t);
  i > -1 && e.splice(i, 1);
}
var xe = (e, t, i) => i > t ? t : i < e ? e : i;
function Lt(e, t) {
  return t ? `${e}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${t}` : e;
}
var We = () => {
}, de = () => {
};
typeof process < "u" && process.env.NODE_ENV !== "production" && (We = (e, t, i) => {
  !e && typeof console < "u" && console.warn(Lt(t, i));
}, de = (e, t, i) => {
  if (!e) throw new Error(Lt(t, i));
});
var we = {}, bs = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), Nn = (e) => typeof e == "object" && e !== null, xs = (e) => /^0[^.\s]+$/u.test(e);
// @__NO_SIDE_EFFECTS__
function ws(e) {
  let t;
  return () => (t === void 0 && (t = e()), t);
}
var Ge = /* @__NO_SIDE_EFFECTS__ */ (e) => e, li = (...e) => e.reduce((t, i) => (s) => i(t(s))), ci = /* @__NO_SIDE_EFFECTS__ */ (e, t, i) => {
  const s = t - e;
  return s ? (i - e) / s : 1;
}, Ss = class {
  constructor() {
    this.subscriptions = [];
  }
  add(e) {
    return In(this.subscriptions, e), () => oi(this.subscriptions, e);
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
}, ee = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, ne = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, Ms = /* @__NO_SIDE_EFFECTS__ */ (e, t) => t ? e * (1e3 / t) : 0, Ii = /* @__PURE__ */ new Set();
function Ts(e, t, i) {
  e || Ii.has(t) || (console.warn(Lt(t, i)), Ii.add(t));
}
var On = (e, t, i) => {
  const s = t - e;
  return ((i - e) % s + s) % s + e;
}, Cs = (e, t, i) => (((1 - 3 * i + 3 * t) * e + (3 * i - 6 * t)) * e + 3 * t) * e, Ln = 1e-7, Un = 12;
function Wn(e, t, i, s, r) {
  let n, a, o = 0;
  do
    a = t + (i - t) / 2, n = Cs(a, s, r) - e, n > 0 ? i = a : t = a;
  while (Math.abs(n) > Ln && ++o < Un);
  return a;
}
// @__NO_SIDE_EFFECTS__
function ht(e, t, i, s) {
  if (e === t && i === s) return Ge;
  const r = (n) => Wn(n, 0, 1, e, i);
  return (n) => n === 0 || n === 1 ? n : Cs(r(n), t, s);
}
var _s = /* @__NO_SIDE_EFFECTS__ */ (e) => (t) => t <= 0.5 ? e(2 * t) / 2 : (2 - e(2 * (1 - t))) / 2, hi = /* @__NO_SIDE_EFFECTS__ */ (e) => (t) => 1 - e(1 - t), As = /* @__PURE__ */ ht(0.33, 1.53, 0.69, 0.99), ui = /* @__PURE__ */ hi(As), Ps = /* @__PURE__ */ _s(ui), Bs = (e) => e >= 1 ? 1 : (e *= 2) < 1 ? 0.5 * ui(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), di = (e) => 1 - Math.sin(Math.acos(e)), Gn = hi(di), ks = _s(di), $n = /* @__PURE__ */ ht(0.42, 0, 1, 1), Kn = /* @__PURE__ */ ht(0, 0, 0.58, 1), Es = /* @__PURE__ */ ht(0.42, 0, 0.58, 1), zs = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] != "number";
// @__NO_SIDE_EFFECTS__
function Vs(e, t) {
  return zs(e) ? e[On(0, e.length, t)] : e;
}
var Ds = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] == "number", Ni = {
  linear: Ge,
  easeIn: $n,
  easeInOut: Es,
  easeOut: Kn,
  circIn: di,
  circInOut: ks,
  circOut: Gn,
  backIn: ui,
  backInOut: Ps,
  backOut: As,
  anticipate: Bs
}, Hn = (e) => typeof e == "string", Oi = (e) => {
  if (Ds(e)) {
    de(e.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
    const [t, i, s, r] = e;
    return /* @__PURE__ */ ht(t, i, s, r);
  } else if (Hn(e))
    return de(Ni[e] !== void 0, `Invalid easing type '${e}'`, "invalid-easing-type"), Ni[e];
  return e;
}, vt = [
  "setup",
  "read",
  "resolveKeyframes",
  "preUpdate",
  "update",
  "preRender",
  "render",
  "postRender"
];
function jn(e) {
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
    schedule: (c, h = !1, d = !1) => {
      const u = d && s ? t : i;
      return h && n.add(c), u.add(c), c;
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
var qn = 40;
function Rs(e, t) {
  let i = !1, s = !0;
  const r = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, n = () => i = !0, a = vt.reduce((S, w) => (S[w] = jn(n), S), {}), { setup: o, read: l, resolveKeyframes: c, preUpdate: h, update: d, preRender: u, render: g, postRender: p } = a, y = () => {
    const S = we.useManualTiming, w = S ? r.timestamp : performance.now();
    i = !1, S || (r.delta = s ? 1e3 / 60 : Math.max(Math.min(w - r.timestamp, qn), 1)), r.timestamp = w, r.isProcessing = !0, o.process(r), l.process(r), c.process(r), h.process(r), d.process(r), u.process(r), g.process(r), p.process(r), r.isProcessing = !1, i && t && (s = !1, e(y));
  }, m = () => {
    i = !0, s = !0, r.isProcessing || e(y);
  };
  return {
    schedule: vt.reduce((S, w) => {
      const _ = a[w];
      return S[w] = (b, x = !1, T = !1) => (i || m(), _.schedule(b, x, T)), S;
    }, {}),
    cancel: (S) => {
      for (let w = 0; w < vt.length; w++) a[vt[w]].cancel(S);
    },
    state: r,
    steps: a
  };
}
var { schedule: oe, cancel: Ut, state: St, steps: Ec } = /* @__PURE__ */ Rs(typeof requestAnimationFrame < "u" ? requestAnimationFrame : Ge, !0), xt;
function Xn() {
  xt = void 0;
}
var J = {
  now: () => (xt === void 0 && J.set(St.isProcessing || we.useManualTiming ? St.timestamp : performance.now()), xt),
  set: (e) => {
    xt = e, queueMicrotask(Xn);
  }
}, Fs = (e) => (t) => typeof t == "string" && t.startsWith(e), Is = /* @__PURE__ */ Fs("--"), Yn = /* @__PURE__ */ Fs("var(--"), pi = (e) => Yn(e) ? Zn.test(e.split("/*")[0].trim()) : !1, Zn = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function Li(e) {
  return typeof e != "string" ? !1 : e.split("/*")[0].includes("var(--");
}
var $e = {
  test: (e) => typeof e == "number",
  parse: parseFloat,
  transform: (e) => e
}, ot = {
  ...$e,
  transform: (e) => xe(0, 1, e)
}, bt = {
  ...$e,
  default: 1
}, at = (e) => Math.round(e * 1e5) / 1e5, fi = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function Qn(e) {
  return e == null;
}
var Jn = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, mi = (e, t) => (i) => !!(typeof i == "string" && Jn.test(i) && i.startsWith(e) || t && !Qn(i) && Object.prototype.hasOwnProperty.call(i, t)), Ns = (e, t, i) => (s) => {
  if (typeof s != "string") return s;
  const [r, n, a, o] = s.match(fi);
  return {
    [e]: parseFloat(r),
    [t]: parseFloat(n),
    [i]: parseFloat(a),
    alpha: o !== void 0 ? parseFloat(o) : 1
  };
}, ea = (e) => xe(0, 255, e), Bt = {
  ...$e,
  transform: (e) => Math.round(ea(e))
}, _e = {
  test: /* @__PURE__ */ mi("rgb", "red"),
  parse: /* @__PURE__ */ Ns("red", "green", "blue"),
  transform: ({ red: e, green: t, blue: i, alpha: s = 1 }) => "rgba(" + Bt.transform(e) + ", " + Bt.transform(t) + ", " + Bt.transform(i) + ", " + at(ot.transform(s)) + ")"
};
function ta(e) {
  let t = "", i = "", s = "", r = "";
  return e.length > 5 ? (t = e.substring(1, 3), i = e.substring(3, 5), s = e.substring(5, 7), r = e.substring(7, 9)) : (t = e.substring(1, 2), i = e.substring(2, 3), s = e.substring(3, 4), r = e.substring(4, 5), t += t, i += i, s += s, r += r), {
    red: parseInt(t, 16),
    green: parseInt(i, 16),
    blue: parseInt(s, 16),
    alpha: r ? parseInt(r, 16) / 255 : 1
  };
}
var Wt = {
  test: /* @__PURE__ */ mi("#"),
  parse: ta,
  transform: _e.transform
}, ut = /* @__NO_SIDE_EFFECTS__ */ (e) => ({
  test: (t) => typeof t == "string" && t.endsWith(e) && t.split(" ").length === 1,
  parse: parseFloat,
  transform: (t) => `${t}${e}`
}), ce = /* @__PURE__ */ ut("deg"), Fe = /* @__PURE__ */ ut("%"), P = /* @__PURE__ */ ut("px"), ia = /* @__PURE__ */ ut("vh"), sa = /* @__PURE__ */ ut("vw"), Ui = {
  ...Fe,
  parse: (e) => Fe.parse(e) / 100,
  transform: (e) => Fe.transform(e * 100)
}, De = {
  test: /* @__PURE__ */ mi("hsl", "hue"),
  parse: /* @__PURE__ */ Ns("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: t, lightness: i, alpha: s = 1 }) => "hsla(" + Math.round(e) + ", " + Fe.transform(at(t)) + ", " + Fe.transform(at(i)) + ", " + at(ot.transform(s)) + ")"
}, O = {
  test: (e) => _e.test(e) || Wt.test(e) || De.test(e),
  parse: (e) => _e.test(e) ? _e.parse(e) : De.test(e) ? De.parse(e) : Wt.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? _e.transform(e) : De.transform(e),
  getAnimatableNone: (e) => {
    const t = O.parse(e);
    return t.alpha = 0, O.transform(t);
  }
}, ra = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function na(e) {
  return isNaN(e) && typeof e == "string" && (e.match(fi)?.length || 0) + (e.match(ra)?.length || 0) > 0;
}
var Os = "number", Ls = "color", aa = "var", oa = "var(", Wi = "${}", la = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function Oe(e) {
  const t = e.toString(), i = [], s = {
    color: [],
    number: [],
    var: []
  }, r = [];
  let n = 0;
  return {
    values: i,
    split: t.replace(la, (a) => (O.test(a) ? (s.color.push(n), r.push(Ls), i.push(O.parse(a))) : a.startsWith(oa) ? (s.var.push(n), r.push(aa), i.push(a)) : (s.number.push(n), r.push(Os), i.push(parseFloat(a))), ++n, Wi)).split(Wi),
    indexes: s,
    types: r
  };
}
function ca(e) {
  return Oe(e).values;
}
function Us({ split: e, types: t }) {
  const i = e.length;
  return (s) => {
    let r = "";
    for (let n = 0; n < i; n++)
      if (r += e[n], s[n] !== void 0) {
        const a = t[n];
        a === Os ? r += at(s[n]) : a === Ls ? r += O.transform(s[n]) : r += s[n];
      }
    return r;
  };
}
function ha(e) {
  return Us(Oe(e));
}
var ua = (e) => typeof e == "number" ? 0 : O.test(e) ? O.getAnimatableNone(e) : e, da = (e, t) => typeof e == "number" ? t?.trim().endsWith("/") ? e : 0 : ua(e);
function pa(e) {
  const t = Oe(e);
  return Us(t)(t.values.map((i, s) => da(i, t.split[s])));
}
var ae = {
  test: na,
  parse: ca,
  createTransformer: ha,
  getAnimatableNone: pa
};
function kt(e, t, i) {
  return i < 0 && (i += 1), i > 1 && (i -= 1), i < 1 / 6 ? e + (t - e) * 6 * i : i < 1 / 2 ? t : i < 2 / 3 ? e + (t - e) * (2 / 3 - i) * 6 : e;
}
function fa({ hue: e, saturation: t, lightness: i, alpha: s }) {
  e /= 360, t /= 100, i /= 100;
  let r = 0, n = 0, a = 0;
  if (!t) r = n = a = i;
  else {
    const o = i < 0.5 ? i * (1 + t) : i + t - i * t, l = 2 * i - o;
    r = kt(l, o, e + 1 / 3), n = kt(l, o, e), a = kt(l, o, e - 1 / 3);
  }
  return {
    red: Math.round(r * 255),
    green: Math.round(n * 255),
    blue: Math.round(a * 255),
    alpha: s
  };
}
function Mt(e, t) {
  return (i) => i > 0 ? t : e;
}
var Ke = (e, t, i) => e + (t - e) * i, Et = (e, t, i) => {
  const s = e * e, r = i * (t * t - s) + s;
  return r < 0 ? 0 : Math.sqrt(r);
}, ma = [
  Wt,
  _e,
  De
], ga = (e) => ma.find((t) => t.test(e));
function Gi(e) {
  const t = ga(e);
  if (We(!!t, `'${e}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !t) return !1;
  let i = t.parse(e);
  return t === De && (i = fa(i)), i;
}
var $i = (e, t) => {
  const i = Gi(e), s = Gi(t);
  if (!i || !s) return Mt(e, t);
  const r = { ...i };
  return (n) => (r.red = Et(i.red, s.red, n), r.green = Et(i.green, s.green, n), r.blue = Et(i.blue, s.blue, n), r.alpha = Ke(i.alpha, s.alpha, n), _e.transform(r));
}, Gt = /* @__PURE__ */ new Set(["none", "hidden"]);
function ya(e, t) {
  return Gt.has(e) ? (i) => i <= 0 ? e : t : (i) => i >= 1 ? t : e;
}
function va(e, t) {
  return (i) => Ke(e, t, i);
}
function gi(e) {
  return typeof e == "number" ? va : typeof e == "string" ? pi(e) ? Mt : O.test(e) ? $i : wa : Array.isArray(e) ? Ws : typeof e == "object" ? O.test(e) ? $i : ba : Mt;
}
function Ws(e, t) {
  const i = [...e], s = i.length, r = e.map((n, a) => gi(n)(n, t[a]));
  return (n) => {
    for (let a = 0; a < s; a++) i[a] = r[a](n);
    return i;
  };
}
function ba(e, t) {
  const i = {
    ...e,
    ...t
  }, s = {};
  for (const r in i) e[r] !== void 0 && t[r] !== void 0 && (s[r] = gi(e[r])(e[r], t[r]));
  return (r) => {
    for (const n in s) i[n] = s[n](r);
    return i;
  };
}
function xa(e, t) {
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
var wa = (e, t) => {
  const i = ae.createTransformer(t), s = Oe(e), r = Oe(t);
  return s.indexes.var.length === r.indexes.var.length && s.indexes.color.length === r.indexes.color.length && s.indexes.number.length >= r.indexes.number.length ? Gt.has(e) && !r.values.length || Gt.has(t) && !s.values.length ? ya(e, t) : li(Ws(xa(s, r), r.values), i) : (We(!0, `Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), Mt(e, t));
};
function Gs(e, t, i) {
  return typeof e == "number" && typeof t == "number" && typeof i == "number" ? Ke(e, t, i) : gi(e)(e, t);
}
var Sa = (e) => {
  const t = ({ timestamp: i }) => e(i);
  return {
    start: (i = !0) => oe.update(t, i),
    stop: () => Ut(t),
    now: () => St.isProcessing ? St.timestamp : J.now()
  };
}, $s = (e, t, i = 10) => {
  let s = "";
  const r = Math.max(Math.round(t / i), 2);
  for (let n = 0; n < r; n++) s += Math.round(e(n / (r - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${s.substring(0, s.length - 2)})`;
}, Ks = 2e4;
function yi(e) {
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
  }), r = Math.min(yi(s), Ks);
  return {
    type: "keyframes",
    ease: (n) => s.next(r * n).value / t,
    duration: ne(r)
  };
}
var N = {
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
function $t(e, t) {
  return e * Math.sqrt(1 - t * t);
}
var Ma = 12;
function Ta(e, t, i) {
  let s = i;
  for (let r = 1; r < Ma; r++) s = s - e(s) / t(s);
  return s;
}
var Ki = 1e-3;
function Ca({ duration: e = N.duration, bounce: t = N.bounce, velocity: i = N.velocity, mass: s = N.mass }) {
  let r, n;
  We(e <= ee(N.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let a = 1 - t;
  a = xe(N.minDamping, N.maxDamping, a), e = xe(N.minDuration, N.maxDuration, ne(e)), a < 1 ? (r = (c) => {
    const h = c * a, d = h * e, u = h - i, g = $t(c, a), p = Math.exp(-d);
    return Ki - u / g * p;
  }, n = (c) => {
    const h = c * a * e, d = h * i + i, u = Math.pow(a, 2) * Math.pow(c, 2) * e, g = Math.exp(-h), p = $t(Math.pow(c, 2), a);
    return (-r(c) + Ki > 0 ? -1 : 1) * ((d - u) * g) / p;
  }) : (r = (c) => -1e-3 + Math.exp(-c * e) * ((c - i) * e + 1), n = (c) => Math.exp(-c * e) * ((i - c) * (e * e)));
  const o = 5 / e, l = Ta(r, n, o);
  if (e = ee(e), isNaN(l)) return {
    stiffness: N.stiffness,
    damping: N.damping,
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
var _a = ["duration", "bounce"], Aa = [
  "stiffness",
  "damping",
  "mass"
];
function Hi(e, t) {
  return t.some((i) => e[i] !== void 0);
}
function Pa(e) {
  let t = {
    velocity: N.velocity,
    stiffness: N.stiffness,
    damping: N.damping,
    mass: N.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!Hi(e, Aa) && Hi(e, _a))
    if (t.velocity = 0, e.visualDuration) {
      const i = e.visualDuration, s = 2 * Math.PI / (i * 1.2), r = s * s, n = 2 * xe(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(r);
      t = {
        ...t,
        mass: N.mass,
        stiffness: r,
        damping: n
      };
    } else {
      const i = Ca({
        ...e,
        velocity: 0
      });
      t = {
        ...t,
        ...i,
        mass: N.mass
      }, t.isResolvedFromDuration = !0;
    }
  return t;
}
function lt(e = N.visualDuration, t = N.bounce) {
  const i = typeof e != "object" ? {
    visualDuration: e,
    keyframes: [0, 1],
    bounce: t
  } : e;
  let { restSpeed: s, restDelta: r } = i;
  const n = i.keyframes[0], a = i.keyframes[i.keyframes.length - 1], o = {
    done: !1,
    value: n
  }, { stiffness: l, damping: c, mass: h, duration: d, velocity: u, isResolvedFromDuration: g } = Pa({
    ...i,
    velocity: -ne(i.velocity || 0)
  }), p = u || 0, y = c / (2 * Math.sqrt(l * h)), m = a - n, v = ne(Math.sqrt(l / h)), A = Math.abs(m) < 5;
  s || (s = A ? N.restSpeed.granular : N.restSpeed.default), r || (r = A ? N.restDelta.granular : N.restDelta.default);
  let S, w, _, b, x, T;
  if (y < 1)
    _ = $t(v, y), b = (p + y * v * m) / _, S = (B) => {
      const C = Math.exp(-y * v * B);
      return a - C * (b * Math.sin(_ * B) + m * Math.cos(_ * B));
    }, x = y * v * b + m * _, T = y * v * m - b * _, w = (B) => Math.exp(-y * v * B) * (x * Math.sin(_ * B) + T * Math.cos(_ * B));
  else if (y === 1) {
    S = (C) => a - Math.exp(-v * C) * (m + (p + v * m) * C);
    const B = p + v * m;
    w = (C) => Math.exp(-v * C) * (v * B * C - p);
  } else {
    const B = v * Math.sqrt(y * y - 1);
    S = (D) => {
      const U = Math.exp(-y * v * D), E = Math.min(B * D, 300);
      return a - U * ((p + y * v * m) * Math.sinh(E) + B * m * Math.cosh(E)) / B;
    };
    const C = (p + y * v * m) / B, V = y * v * C - m * B, z = y * v * m - C * B;
    w = (D) => {
      const U = Math.exp(-y * v * D), E = Math.min(B * D, 300);
      return U * (V * Math.sinh(E) + z * Math.cosh(E));
    };
  }
  const M = {
    calculatedDuration: g && d || null,
    velocity: (B) => ee(w(B)),
    next: (B) => {
      if (!g && y < 1) {
        const V = Math.exp(-y * v * B), z = Math.sin(_ * B), D = Math.cos(_ * B), U = a - V * (b * z + m * D), E = ee(V * (x * z + T * D));
        return o.done = Math.abs(E) <= s && Math.abs(a - U) <= r, o.value = o.done ? a : U, o;
      }
      const C = S(B);
      if (g)
        o.done = B >= d;
      else {
        const V = ee(w(B));
        o.done = Math.abs(V) <= s && Math.abs(a - C) <= r;
      }
      return o.value = o.done ? a : C, o;
    },
    toString: () => {
      const B = Math.min(yi(M), Ks), C = $s((V) => M.next(B * V).value, B, 30);
      return B + "ms " + C;
    },
    toTransition: () => {
    }
  };
  return M;
}
lt.applyToOptions = (e) => {
  const t = Hs(e, 100, lt);
  return e.ease = t.ease, e.duration = ee(t.duration), e.type = "keyframes", e;
};
var Ba = 5;
function js(e, t, i) {
  const s = Math.max(t - Ba, 0);
  return Ms(i - e(s), t - s);
}
function Kt({ keyframes: e, velocity: t = 0, power: i = 0.8, timeConstant: s = 325, bounceDamping: r = 10, bounceStiffness: n = 500, modifyTarget: a, min: o, max: l, restDelta: c = 0.5, restSpeed: h }) {
  const d = e[0], u = {
    done: !1,
    value: d
  }, g = (T) => o !== void 0 && T < o || l !== void 0 && T > l, p = (T) => o === void 0 ? l : l === void 0 || Math.abs(o - T) < Math.abs(l - T) ? o : l;
  let y = i * t;
  const m = d + y, v = a === void 0 ? m : a(m);
  v !== m && (y = v - d);
  const A = (T) => -y * Math.exp(-T / s), S = (T) => v + A(T), w = (T) => {
    const M = A(T), B = S(T);
    u.done = Math.abs(M) <= c, u.value = u.done ? v : B;
  };
  let _, b;
  const x = (T) => {
    g(u.value) && (_ = T, b = lt({
      keyframes: [u.value, p(u.value)],
      velocity: js(S, T, u.value),
      damping: r,
      stiffness: n,
      restDelta: c,
      restSpeed: h
    }));
  };
  return x(0), {
    calculatedDuration: null,
    next: (T) => {
      let M = !1;
      return !b && _ === void 0 && (M = !0, w(T), x(T)), _ !== void 0 && T >= _ ? b.next(T - _) : (!M && w(T), u);
    }
  };
}
function ka(e, t, i) {
  const s = [], r = i || we.mix || Gs, n = e.length - 1;
  for (let a = 0; a < n; a++) {
    let o = r(e[a], e[a + 1]);
    t && (o = li(Array.isArray(t) ? t[a] || Ge : t, o)), s.push(o);
  }
  return s;
}
function Ea(e, t, { clamp: i = !0, ease: s, mixer: r } = {}) {
  const n = e.length;
  if (de(n === t.length, "Both input and output ranges must be the same length", "range-length"), n === 1) return () => t[0];
  if (n === 2 && t[0] === t[1]) return () => t[1];
  const a = e[0] === e[1];
  e[0] > e[n - 1] && (e = [...e].reverse(), t = [...t].reverse());
  const o = ka(t, s, r), l = o.length, c = (h) => {
    if (a && h < e[0]) return t[0];
    let d = 0;
    if (l > 1)
      for (; d < e.length - 2 && !(h < e[d + 1]); d++) ;
    const u = ci(e[d], e[d + 1], h);
    return o[d](u);
  };
  return i ? (h) => c(xe(e[0], e[n - 1], h)) : c;
}
function qs(e, t) {
  const i = e[e.length - 1];
  for (let s = 1; s <= t; s++) {
    const r = ci(0, t, s);
    e.push(Ke(i, 1, r));
  }
}
function Xs(e) {
  const t = [0];
  return qs(t, e.length - 1), t;
}
function za(e, t) {
  return e.map((i) => i * t);
}
function Va(e, t) {
  return e.map(() => t || Es).splice(0, e.length - 1);
}
function Re({ duration: e = 300, keyframes: t, times: i, ease: s = "easeInOut" }) {
  const r = zs(s) ? s.map(Oi) : Oi(s), n = {
    done: !1,
    value: t[0]
  }, a = Ea(za(i && i.length === t.length ? i : Xs(t), e), t, { ease: Array.isArray(r) ? r : Va(t, r) });
  return {
    calculatedDuration: e,
    next: (o) => (n.value = a(o), n.done = o >= e, n)
  };
}
var Da = (e) => e !== null;
function At(e, { repeat: t, repeatType: i = "loop" }, s, r = 1) {
  const n = e.filter(Da), a = r < 0 || t && i !== "loop" && t % 2 === 1 ? 0 : n.length - 1;
  return !a || s === void 0 ? n[a] : s;
}
var Ra = {
  decay: Kt,
  inertia: Kt,
  tween: Re,
  keyframes: Re,
  spring: lt
};
function Ys(e) {
  typeof e.type == "string" && (e.type = Ra[e.type]);
}
var vi = class {
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
}, Fa = (e) => e / 100, Tt = class extends vi {
  constructor(e) {
    super(), this.state = "idle", this.startTime = null, this.isStopped = !1, this.currentTime = 0, this.holdTime = null, this.playbackSpeed = 1, this.delayState = {
      done: !1,
      value: void 0
    }, this.stop = () => {
      const { motionValue: t } = this.options;
      t && t.updatedAt !== J.now() && this.tick(J.now()), this.isStopped = !0, this.state !== "idle" && (this.teardown(), this.options.onStop?.());
    }, this.options = e, this.initAnimation(), this.play(), e.autoplay === !1 && this.pause();
  }
  initAnimation() {
    const { options: e } = this;
    Ys(e);
    const { type: t = Re, repeat: i = 0, repeatDelay: s = 0, repeatType: r, velocity: n = 0 } = e;
    let { keyframes: a } = e;
    const o = t || Re;
    process.env.NODE_ENV !== "production" && o !== Re && de(a.length <= 2, `Only two keyframes currently supported with spring and inertia animations. Trying to animate ${a}`, "spring-two-frames"), o !== Re && typeof a[0] != "number" && (this.mixKeyframes = li(Fa, Gs(a[0], a[1])), a = [0, 100]);
    const l = o({
      ...e,
      keyframes: a
    });
    r === "mirror" && (this.mirroredGenerator = o({
      ...e,
      keyframes: [...a].reverse(),
      velocity: -n
    })), l.calculatedDuration === null && (l.calculatedDuration = yi(l));
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
    const { delay: l = 0, keyframes: c, repeat: h, repeatType: d, repeatDelay: u, type: g, onUpdate: p, finalKeyframe: y } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, e) : this.speed < 0 && (this.startTime = Math.min(e - s / this.speed, this.startTime)), t ? this.currentTime = e : this.updateTime(e);
    const m = this.currentTime - l * (this.playbackSpeed >= 0 ? 1 : -1), v = this.playbackSpeed >= 0 ? m < 0 : m > s;
    this.currentTime = Math.max(m, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = s);
    let A = this.currentTime, S = i;
    if (h) {
      const x = Math.min(this.currentTime, s) / a;
      let T = Math.floor(x), M = x % 1;
      !M && x >= 1 && (M = 1), M === 1 && T--, T = Math.min(T, h + 1), T % 2 && (d === "reverse" ? (M = 1 - M, u && (M -= u / a)) : d === "mirror" && (S = n)), A = xe(0, 1, M) * a;
    }
    let w;
    v ? (this.delayState.value = c[0], w = this.delayState) : w = S.next(A), r && !v && (w.value = r(w.value));
    let { done: _ } = w;
    !v && o !== null && (_ = this.playbackSpeed >= 0 ? this.currentTime >= s : this.currentTime <= 0);
    const b = this.holdTime === null && (this.state === "finished" || this.state === "running" && _);
    return b && g !== Kt && (w.value = At(c, this.options, y, this.speed)), p && p(w.value), b && this.finish(), w;
  }
  then(e, t) {
    return this.finished.then(e, t);
  }
  get duration() {
    return ne(this.calculatedDuration);
  }
  get iterationDuration() {
    const { delay: e = 0 } = this.options || {};
    return this.duration + ne(e);
  }
  get time() {
    return ne(this.currentTime);
  }
  set time(e) {
    e = ee(e), this.currentTime = e, this.startTime === null || this.holdTime !== null || this.playbackSpeed === 0 ? this.holdTime = e : this.driver && (this.startTime = this.driver.now() - e / this.playbackSpeed), this.driver ? this.driver.start(!1) : (this.startTime = 0, this.state = "paused", this.holdTime = e, this.tick(e));
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
    t && this.driver && this.updateTime(J.now()), this.playbackSpeed = e, t && this.driver && (this.time = ne(this.currentTime));
  }
  play() {
    if (this.isStopped) return;
    const { driver: e = Sa, startTime: t } = this.options;
    this.driver || (this.driver = e((s) => this.tick(s))), this.options.onPlay?.();
    const i = this.driver.now();
    this.state === "finished" ? (this.updateFinished(), this.startTime = i) : this.holdTime !== null ? this.startTime = i - this.holdTime : this.startTime || (this.startTime = t ?? i), this.state === "finished" && this.speed < 0 && (this.startTime += this.calculatedDuration), this.holdTime = null, this.state = "running", this.driver.start();
  }
  pause() {
    this.state = "paused", this.updateTime(J.now()), this.holdTime = this.currentTime;
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
function Ia(e) {
  for (let t = 1; t < e.length; t++) e[t] ?? (e[t] = e[t - 1]);
}
var Ae = (e) => e * 180 / Math.PI, Ht = (e) => {
  const t = Ae(Math.atan2(e[1], e[0]));
  return jt(t);
}, Na = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (e) => (Math.abs(e[0]) + Math.abs(e[3])) / 2,
  rotate: Ht,
  rotateZ: Ht,
  skewX: (e) => Ae(Math.atan(e[1])),
  skewY: (e) => Ae(Math.atan(e[2])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[2])) / 2
}, jt = (e) => (e = e % 360, e < 0 && (e += 360), e), ji = Ht, qi = (e) => Math.sqrt(e[0] * e[0] + e[1] * e[1]), Xi = (e) => Math.sqrt(e[4] * e[4] + e[5] * e[5]), Oa = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: qi,
  scaleY: Xi,
  scale: (e) => (qi(e) + Xi(e)) / 2,
  rotateX: (e) => jt(Ae(Math.atan2(e[6], e[5]))),
  rotateY: (e) => jt(Ae(Math.atan2(-e[2], e[0]))),
  rotateZ: ji,
  rotate: ji,
  skewX: (e) => Ae(Math.atan(e[4])),
  skewY: (e) => Ae(Math.atan(e[1])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[4])) / 2
};
function qt(e) {
  return e.includes("scale") ? 1 : 0;
}
function Xt(e, t) {
  if (!e || e === "none") return qt(t);
  const i = e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let s, r;
  if (i)
    s = Oa, r = i;
  else {
    const o = e.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    s = Na, r = o;
  }
  if (!r) return qt(t);
  const n = s[t], a = r[1].split(",").map(Ua);
  return typeof n == "function" ? n(a) : a[n];
}
var La = (e, t) => {
  const { transform: i = "none" } = getComputedStyle(e);
  return Xt(i, t);
};
function Ua(e) {
  return parseFloat(e.trim());
}
var He = [
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
], je = /* @__PURE__ */ new Set([...He, "pathRotation"]), Yi = (e) => e === $e || e === P, Wa = /* @__PURE__ */ new Set([
  "x",
  "y",
  "z"
]), Ga = He.filter((e) => !Wa.has(e));
function $a(e) {
  const t = [];
  return Ga.forEach((i) => {
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
  x: (e, { transform: t }) => Xt(t, "x"),
  y: (e, { transform: t }) => Xt(t, "y")
};
be.translateX = be.x;
be.translateY = be.y;
var Pe = /* @__PURE__ */ new Set(), Yt = !1, Zt = !1, Qt = !1;
function Zs() {
  if (Zt) {
    const e = Array.from(Pe).filter((s) => s.needsMeasurement), t = new Set(e.map((s) => s.element)), i = /* @__PURE__ */ new Map();
    t.forEach((s) => {
      const r = $a(s);
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
  Zt = !1, Yt = !1, Pe.forEach((e) => e.complete(Qt)), Pe.clear();
}
function Qs() {
  Pe.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (Zt = !0);
  });
}
function Ka() {
  Qt = !0, Qs(), Zs(), Qt = !1;
}
var bi = class {
  constructor(e, t, i, s, r, n = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...e], this.onComplete = t, this.name = i, this.motionValue = s, this.element = r, this.isAsync = n;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (Pe.add(this), Yt || (Yt = !0, oe.read(Qs), oe.resolveKeyframes(Zs))) : (this.readKeyframes(), this.complete());
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
    Ia(e);
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
}, Ha = (e) => e.startsWith("--");
function Js(e, t, i) {
  Ha(t) ? e.style.setProperty(t, i) : e.style[t] = i;
}
var ja = {};
function er(e, t) {
  const i = /* @__PURE__ */ ws(e);
  return () => ja[t] ?? i();
}
var qa = /* @__PURE__ */ er(() => window.ScrollTimeline !== void 0, "scrollTimeline"), tr = /* @__PURE__ */ er(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), st = ([e, t, i, s]) => `cubic-bezier(${e}, ${t}, ${i}, ${s})`, Zi = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ st([
    0,
    0.65,
    0.55,
    1
  ]),
  circOut: /* @__PURE__ */ st([
    0.55,
    0,
    1,
    0.45
  ]),
  backIn: /* @__PURE__ */ st([
    0.31,
    0.01,
    0.66,
    -0.59
  ]),
  backOut: /* @__PURE__ */ st([
    0.33,
    1.53,
    0.69,
    0.99
  ])
};
function ir(e, t) {
  if (e) return typeof e == "function" ? tr() ? $s(e, t) : "ease-out" : Ds(e) ? st(e) : Array.isArray(e) ? e.map((i) => ir(i, t) || Zi.easeOut) : Zi[e];
}
function Xa(e, t, i, { delay: s = 0, duration: r = 300, repeat: n = 0, repeatType: a = "loop", ease: o = "easeOut", times: l } = {}, c = void 0) {
  const h = { [t]: i };
  l && (h.offset = l);
  const d = ir(o, r);
  Array.isArray(d) && (h.easing = d);
  const u = {
    delay: s,
    duration: r,
    easing: Array.isArray(d) ? "linear" : d,
    fill: "both",
    iterations: n + 1,
    direction: a === "reverse" ? "alternate" : "normal"
  };
  return c && (u.pseudoElement = c), e.animate(h, u);
}
function xi(e) {
  return typeof e == "function" && "applyToOptions" in e;
}
function Ya({ type: e, ...t }) {
  return xi(e) && tr() ? e.applyToOptions(t) : (t.duration ?? (t.duration = 300), t.ease ?? (t.ease = "easeOut"), t);
}
var sr = class extends vi {
  constructor(e) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !e) return;
    const { element: t, name: i, keyframes: s, pseudoElement: r, allowFlatten: n = !1, finalKeyframe: a, onComplete: o } = e;
    this.isPseudoElement = !!r, this.allowFlatten = n, this.options = e, de(typeof e.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
    const l = Ya(e);
    this.animation = Xa(t, i, s, l, r), l.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !r) {
        const c = At(s, this.options, a, this.speed);
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
    return ne(Number(e));
  }
  get iterationDuration() {
    const { delay: e = 0 } = this.options || {};
    return this.duration + ne(e);
  }
  get time() {
    return ne(Number(this.animation.currentTime) || 0);
  }
  set time(e) {
    const t = this.finishedTime !== null;
    this.manualStartTime = null, this.finishedTime = null, this.animation.currentTime = ee(e), t && this.animation.pause();
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
    return this.allowFlatten && this.animation.effect?.updateTiming({ easing: "linear" }), this.animation.onfinish = null, e && qa() ? (this.animation.timeline = e, t && (this.animation.rangeStart = t), i && (this.animation.rangeEnd = i), Ge) : s(this);
  }
}, rr = {
  anticipate: Bs,
  backInOut: Ps,
  circInOut: ks
};
function Za(e) {
  return e in rr;
}
function Qa(e) {
  typeof e.ease == "string" && Za(e.ease) && (e.ease = rr[e.ease]);
}
var zt = 10, Ja = class extends sr {
  constructor(e) {
    Qa(e), Ys(e), super(e), e.startTime !== void 0 && e.autoplay !== !1 && (this.startTime = e.startTime), this.options = e;
  }
  updateMotionValue(e) {
    const { motionValue: t, onUpdate: i, onComplete: s, element: r, ...n } = this.options;
    if (!t) return;
    if (e !== void 0) {
      t.set(e);
      return;
    }
    const a = new Tt({
      ...n,
      autoplay: !1
    }), o = Math.max(zt, J.now() - this.startTime), l = xe(0, zt, o - zt), c = a.sample(o).value, { name: h } = this.options;
    r && h && Js(r, h, c), t.setWithVelocity(a.sample(Math.max(0, o - l)).value, c, l), a.stop();
  }
}, Qi = (e, t) => t === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && (ae.test(e) || e === "0") && !e.startsWith("url("));
function eo(e) {
  const t = e[0];
  if (e.length === 1) return !0;
  for (let i = 0; i < e.length; i++) if (e[i] !== t) return !0;
}
function to(e, t, i, s) {
  const r = e[0];
  if (r === null) return !1;
  if (t === "display" || t === "visibility") return !0;
  const n = e[e.length - 1], a = Qi(r, t), o = Qi(n, t);
  return We(a === o, `You are trying to animate ${t} from "${r}" to "${n}". "${a ? n : r}" is not an animatable value.`, "value-not-animatable"), !a || !o ? !1 : eo(e) || (i === "spring" || xi(i)) && s;
}
function Jt(e) {
  e.duration = 0, e.type = "keyframes";
}
var nr = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform",
  "backgroundColor"
]), io = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function so(e) {
  for (let t = 0; t < e.length; t++) if (typeof e[t] == "string" && io.test(e[t])) return !0;
  return !1;
}
var ro = /* @__PURE__ */ new Set([
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
]), no = /* @__PURE__ */ ws(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function ao(e) {
  const { motionValue: t, name: i, repeatDelay: s, repeatType: r, damping: n, type: a, keyframes: o } = e, l = t?.owner?.current;
  if (!(l instanceof HTMLElement) && !(l instanceof SVGElement)) return !1;
  const { onUpdate: c, transformTemplate: h } = t.owner.getProps();
  return no() && i && (nr.has(i) || ro.has(i) && so(o)) && (i !== "transform" || !h) && !c && !s && r !== "mirror" && n !== 0 && a !== "inertia";
}
var oo = 40, lo = class extends vi {
  constructor({ autoplay: e = !0, delay: t = 0, type: i = "keyframes", repeat: s = 0, repeatDelay: r = 0, repeatType: n = "loop", keyframes: a, name: o, motionValue: l, element: c, ...h }) {
    super(), this.stop = () => {
      this._animation && (this._animation.stop(), this.stopTimeline?.()), this.keyframeResolver?.cancel();
    }, this.createdAt = J.now();
    const d = {
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
    }, u = c?.KeyframeResolver || bi;
    this.keyframeResolver = new u(a, (g, p, y) => this.onKeyframesResolved(g, p, d, !y), o, l, c), this.keyframeResolver?.scheduleResolve();
  }
  onKeyframesResolved(e, t, i, s) {
    this.keyframeResolver = void 0;
    const { name: r, type: n, velocity: a, delay: o, isHandoff: l, onUpdate: c } = i;
    this.resolvedAt = J.now();
    let h = !0;
    to(e, r, n, a) || (h = !1, (we.instantAnimations || !o) && c?.(At(e, i, t)), e[0] = e[e.length - 1], Jt(i), i.repeat = 0);
    const d = {
      startTime: s ? this.resolvedAt ? this.resolvedAt - this.createdAt > oo ? this.resolvedAt : this.createdAt : this.createdAt : void 0,
      finalKeyframe: t,
      ...i,
      keyframes: e
    }, u = h && !l && ao(d), g = d.motionValue?.owner?.current;
    let p;
    if (u) try {
      p = new Ja({
        ...d,
        element: g
      });
    } catch {
      p = new Tt(d);
    }
    else p = new Tt(d);
    p.finished.then(() => {
      this.notifyFinished();
    }).catch(Ge), this.pendingTimeline && (this.stopTimeline = p.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = p;
  }
  get finished() {
    return this._animation ? this.animation.finished : this._finished;
  }
  then(e, t) {
    return this.finished.finally(e).then(() => {
    });
  }
  get animation() {
    return this._animation || (this.keyframeResolver?.resume(), Ka()), this._animation;
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
}, co = class {
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
var ho = class extends co {
  then(e, t) {
    return this.finished.finally(e).then(() => {
    });
  }
}, es = 30, uo = (e) => !isNaN(parseFloat(e)), ts = { current: void 0 }, po = class {
  constructor(e, t = {}) {
    this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (i) => {
      const s = J.now();
      if (this.updatedAt !== s && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(i), this.current !== this.prev && (this.events.change?.notify(this.current), this.dependents))
        for (const r of this.dependents) r.dirty();
    }, this.hasAnimated = !1, this.setCurrent(e), this.owner = t.owner;
  }
  setCurrent(e) {
    this.current = e, this.updatedAt = J.now(), this.canTrackVelocity === null && e !== void 0 && (this.canTrackVelocity = uo(this.current));
  }
  setPrevFrameValue(e = this.current) {
    this.prevFrameValue = e, this.prevUpdatedAt = this.updatedAt;
  }
  onChange(e) {
    return process.env.NODE_ENV !== "production" && Ts(!1, 'value.onChange(callback) is deprecated. Switch to value.on("change", callback).'), this.on("change", e);
  }
  on(e, t) {
    this.events[e] || (this.events[e] = new Ss());
    const i = this.events[e].add(t);
    return e === "change" ? () => {
      i(), oe.read(() => {
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
    const e = J.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || e - this.updatedAt > es) return 0;
    const t = Math.min(this.updatedAt - this.prevUpdatedAt, es);
    return Ms(parseFloat(this.current) - parseFloat(this.prevFrameValue), t);
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
function Le(e, t) {
  return new po(e, t);
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
var fo = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, mo = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), go = {
  type: "keyframes",
  duration: 0.8
}, yo = {
  type: "keyframes",
  ease: [
    0.25,
    0.1,
    0.35,
    1
  ],
  duration: 0.3
}, vo = (e, { keyframes: t }) => t.length > 2 ? go : je.has(e) ? e.startsWith("scale") ? mo(t[1]) : fo : yo, bo = /* @__PURE__ */ new Set([
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
function xo(e) {
  for (const t in e) if (!bo.has(t)) return !0;
  return !1;
}
var lr = (e, t, i, s = {}, r, n) => (a) => {
  const o = or(s, e) || {}, l = o.delay || s.delay || 0;
  let { elapsed: c = 0 } = s;
  c = c - ee(l);
  const h = {
    keyframes: Array.isArray(i) ? i : [null, i],
    ease: "easeOut",
    velocity: t.getVelocity(),
    ...o,
    delay: -c,
    onUpdate: (u) => {
      t.set(u), o.onUpdate && o.onUpdate(u);
    },
    onComplete: () => {
      a(), o.onComplete && o.onComplete();
    },
    name: e,
    motionValue: t,
    element: n ? void 0 : r
  };
  xo(o) || Object.assign(h, vo(e, h)), h.duration && (h.duration = ee(h.duration)), h.repeatDelay && (h.repeatDelay = ee(h.repeatDelay)), h.from !== void 0 && (h.keyframes[0] = h.from);
  let d = !1;
  if ((h.type === !1 || h.duration === 0 && !h.repeatDelay) && (Jt(h), h.delay === 0 && (d = !0)), (we.instantAnimations || we.skipAnimations || r?.shouldSkipAnimations || o.skipAnimations) && (d = !0, Jt(h), h.delay = 0), h.allowFlatten = !o.type && !o.ease, d && !n && t.get() !== void 0) {
    const u = At(h.keyframes, o);
    if (u !== void 0) {
      oe.update(() => {
        h.onUpdate(u), h.onComplete();
      });
      return;
    }
  }
  return o.isSync ? new Tt(h) : new lo(h);
}, wo = /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;
function So(e) {
  const t = wo.exec(e);
  if (!t) return [,];
  const [, i, s, r] = t;
  return [`--${i ?? s}`, r];
}
var Mo = 4;
function cr(e, t, i = 1) {
  de(i <= Mo, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [s, r] = So(e);
  if (!s) return;
  const n = window.getComputedStyle(t).getPropertyValue(s);
  if (n) {
    const a = n.trim();
    return bs(a) ? parseFloat(a) : a;
  }
  return pi(r) ? cr(r, t, i + 1) : r;
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
function To(e, t, i) {
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
  ...He
]), Co = (e) => Array.isArray(e);
function _o(e, t, i) {
  e.hasValue(t) ? e.getValue(t).set(i) : e.addValue(t, Le(i));
}
function Ao(e) {
  return Co(e) ? e[e.length - 1] || 0 : e;
}
function Po(e, t) {
  let { transitionEnd: i = {}, transition: s = {}, ...r } = To(e, t) || {};
  r = {
    ...r,
    ...i
  };
  for (const n in r) _o(e, n, Ao(r[n]));
}
var H = (e) => !!(e && e.getVelocity);
function Bo(e) {
  return !!(H(e) && e.add);
}
function ko(e, t) {
  const i = e.getValue("willChange");
  if (Bo(i)) return i.add(t);
  if (!i && we.WillChange) {
    const s = new we.WillChange("auto");
    e.addValue("willChange", s), s.add(t);
  }
}
function wi(e) {
  return e.replace(/([A-Z])/g, (t) => `-${t.toLowerCase()}`);
}
var Eo = "framerAppearId", zo = "data-" + wi(Eo);
function Vo(e) {
  return e.props[zo];
}
function Do({ protectedKeys: e, needsAnimating: t }, i) {
  const s = e.hasOwnProperty(i) && t[i] !== !0;
  return t[i] = !1, s;
}
function Ro(e, t, { delay: i = 0, transitionOverride: s, type: r } = {}) {
  let { transition: n, transitionEnd: a, ...o } = t;
  const l = e.getDefaultTransition();
  n = n ? ar(n, l) : l;
  const c = n?.reduceMotion, h = n?.skipAnimations;
  s && (n = s);
  const d = [], u = r && e.animationState && e.animationState.getState()[r], g = n?.path;
  g && g.animateVisualElement(e, o, n, i, d);
  for (const p in o) {
    const y = e.getValue(p, e.latestValues[p] ?? null), m = o[p];
    if (m === void 0 || u && Do(u, p)) continue;
    const v = {
      delay: i,
      ...or(n || {}, p)
    };
    h && (v.skipAnimations = !0);
    const A = y.get();
    if (A !== void 0 && !y.isAnimating() && !Array.isArray(m) && m === A && !v.velocity) {
      oe.update(() => y.set(m));
      continue;
    }
    let S = !1;
    if (window.MotionHandoffAnimation) {
      const b = Vo(e);
      if (b) {
        const x = window.MotionHandoffAnimation(b, p, oe);
        x !== null && (v.startTime = x, S = !0);
      }
    }
    ko(e, p);
    const w = c ?? e.shouldReduceMotion;
    y.start(lr(p, y, m, w && ur.has(p) ? { type: !1 } : v, e, S));
    const _ = y.animation;
    _ && d.push(_);
  }
  if (a) {
    const p = () => oe.update(() => {
      a && Po(e, a);
    });
    d.length ? Promise.all(d).then(p) : p();
  }
  return d;
}
var Fo = {
  test: (e) => e === "auto",
  parse: (e) => e
}, dr = (e) => (t) => t.test(e), pr = [
  $e,
  P,
  Fe,
  ce,
  sa,
  ia,
  Fo
], ss = (e) => pr.find(dr(e));
function Io(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || xs(e) : !0;
}
var No = /* @__PURE__ */ new Set([
  "brightness",
  "contrast",
  "saturate",
  "opacity"
]);
function Oo(e) {
  const [t, i] = e.slice(0, -1).split("(");
  if (t === "drop-shadow") return e;
  const [s] = i.match(fi) || [];
  if (!s) return e;
  const r = i.replace(s, "");
  let n = No.has(t) ? 1 : 0;
  return s !== i && (n *= 100), t + "(" + n + r + ")";
}
var Lo = /\b([a-z-]*)\(.*?\)/gu, ei = {
  ...ae,
  getAnimatableNone: (e) => {
    const t = e.match(Lo);
    return t ? t.map(Oo).join(" ") : e;
  }
}, ti = {
  ...ae,
  getAnimatableNone: (e) => {
    const t = ae.parse(e);
    return ae.createTransformer(e)(t.map((i) => typeof i == "number" ? 0 : typeof i == "object" ? {
      ...i,
      alpha: 1
    } : i));
  }
}, rs = {
  ...$e,
  transform: Math.round
}, Uo = {
  rotate: ce,
  pathRotation: ce,
  rotateX: ce,
  rotateY: ce,
  rotateZ: ce,
  scale: bt,
  scaleX: bt,
  scaleY: bt,
  scaleZ: bt,
  skew: ce,
  skewX: ce,
  skewY: ce,
  distance: P,
  translateX: P,
  translateY: P,
  translateZ: P,
  x: P,
  y: P,
  z: P,
  perspective: P,
  transformPerspective: P,
  opacity: ot,
  originX: Ui,
  originY: Ui,
  originZ: P
}, Ct = {
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
  ...Uo,
  zIndex: rs,
  fillOpacity: ot,
  strokeOpacity: ot,
  numOctaves: rs
}, Wo = {
  ...Ct,
  color: O,
  backgroundColor: O,
  outlineColor: O,
  fill: O,
  stroke: O,
  borderColor: O,
  borderTopColor: O,
  borderRightColor: O,
  borderBottomColor: O,
  borderLeftColor: O,
  filter: ei,
  WebkitFilter: ei,
  mask: ti,
  WebkitMask: ti
}, fr = (e) => Wo[e], Go = /* @__PURE__ */ new Set([ei, ti]);
function mr(e, t) {
  let i = fr(e);
  return Go.has(i) || (i = ae), i.getAnimatableNone ? i.getAnimatableNone(t) : void 0;
}
var $o = /* @__PURE__ */ new Set([
  "auto",
  "none",
  "0"
]);
function Ko(e, t, i) {
  let s = 0, r;
  for (; s < e.length && !r; ) {
    const n = e[s];
    typeof n == "string" && !$o.has(n) && Oe(n).values.length && (r = e[s]), s++;
  }
  if (r && i) for (const n of t) e[n] = mr(i, r);
}
var Ho = class extends bi {
  constructor(e, t, i, s, r) {
    super(e, t, i, s, r, !0);
  }
  readKeyframes() {
    const { unresolvedKeyframes: e, element: t, name: i } = this;
    if (!t || !t.current) return;
    super.readKeyframes();
    for (let o = 0; o < e.length; o++) {
      let l = e[o];
      if (typeof l == "string" && (l = l.trim(), pi(l))) {
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
    for (let s = 0; s < e.length; s++) (e[s] === null || Io(e[s])) && i.push(s);
    i.length && Ko(e, i, t);
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
}, jo = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius"
];
function qo(e, t, i) {
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
var ii = (e, t) => t && typeof e == "number" ? t.transform(e) : e, { schedule: Xo, cancel: zc } = /* @__PURE__ */ Rs(queueMicrotask, !1);
function gr(e) {
  return Nn(e) && "ownerSVGElement" in e;
}
function Yo(e) {
  return gr(e) && e.tagName === "svg";
}
var Zo = [
  ...pr,
  O,
  ae
], Qo = (e) => Zo.find(dr(e)), ns = () => ({
  min: 0,
  max: 0
}), Si = () => ({
  x: ns(),
  y: ns()
}), ct = /* @__PURE__ */ new WeakMap();
function Jo(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function";
}
function el(e) {
  return typeof e == "string" || Array.isArray(e);
}
var tl = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], il = ["initial", ...tl];
function yr(e) {
  return Jo(e.animate) || il.some((t) => el(e[t]));
}
function sl(e) {
  return !!(yr(e) || e.variants);
}
function rl(e, t, i) {
  for (const s in t) {
    const r = t[s], n = i[s];
    if (H(r)) e.addValue(s, r);
    else if (H(n)) e.addValue(s, Le(r, { owner: e }));
    else if (n !== r) if (e.hasValue(s)) {
      const a = e.getValue(s);
      a.liveStyle === !0 ? a.jump(r) : a.hasAnimated || a.set(r);
    } else {
      const a = e.getStaticValue(s);
      e.addValue(s, Le(a !== void 0 ? a : r, { owner: e }));
    }
  }
  for (const s in i) t[s] === void 0 && e.removeValue(s);
  return t;
}
var si = { current: null }, vr = { current: !1 }, nl = typeof window < "u";
function al() {
  if (vr.current = !0, !!nl)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), t = () => si.current = e.matches;
      e.addEventListener("change", t), t();
    } else si.current = !1;
}
var as = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
], os = {}, br = class {
  scrapeMotionValuesFromProps(e, t, i) {
    return {};
  }
  constructor({ parent: e, props: t, presenceContext: i, reducedMotionConfig: s, skipAnimations: r, blockInitialAnimation: n, visualState: a }, o = {}) {
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = bi, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const u = J.now();
      this.renderScheduledAt < u && (this.renderScheduledAt = u, oe.render(this.render, !1, !0));
    };
    const { latestValues: l, renderState: c } = a;
    this.latestValues = l, this.baseTarget = { ...l }, this.initialValues = t.initial ? { ...l } : {}, this.renderState = c, this.parent = e, this.props = t, this.presenceContext = i, this.depth = e ? e.depth + 1 : 0, this.reducedMotionConfig = s, this.skipAnimationsConfig = r, this.options = o, this.blockInitialAnimation = !!n, this.isControllingVariants = yr(t), this.isVariantNode = sl(t), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(e && e.current);
    const { willChange: h, ...d } = this.scrapeMotionValuesFromProps(t, {}, this);
    for (const u in d) {
      const g = d[u];
      l[u] !== void 0 && H(g) && g.set(l[u]);
    }
  }
  mount(e) {
    if (this.hasBeenMounted) for (const t in this.initialValues)
      this.values.get(t)?.jump(this.initialValues[t]), this.latestValues[t] = this.initialValues[t];
    this.current = e, ct.set(e, this), this.projection && !this.projection.instance && this.projection.mount(e), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((t, i) => this.bindToMotionValue(i, t)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (vr.current || al(), this.shouldReduceMotion = si.current), process.env.NODE_ENV !== "production" && Ts(this.shouldReduceMotion !== !0, "You have Reduced Motion enabled on your device. Animations may not appear as expected.", "reduced-motion-disabled"), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, this.parent?.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
  }
  unmount() {
    this.projection && this.projection.unmount(), Ut(this.notifyUpdate), Ut(this.render), this.valueSubscriptions.forEach((e) => e()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), this.parent?.removeChild(this);
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
        duration: ee(c)
      }), d = n(h);
      this.valueSubscriptions.set(e, () => {
        d(), h.cancel();
      });
      return;
    }
    const i = je.has(e);
    i && this.onBindTransform && this.onBindTransform();
    const s = t.on("change", (n) => {
      this.latestValues[e] = n, this.props.onUpdate && oe.preRender(this.notifyUpdate), i && this.projection && (this.projection.isTransformDirty = !0), this.scheduleRender();
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
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : Si();
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
    this.prevMotionValues = rl(this, this.scrapeMotionValuesFromProps(e, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
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
    return i === void 0 && t !== void 0 && (i = Le(t === null ? void 0 : t, { owner: this }), this.addValue(e, i)), i;
  }
  readValue(e, t) {
    let i = this.latestValues[e] !== void 0 || !this.current ? this.latestValues[e] : this.getBaseTargetFromProps(this.props, e) ?? this.readValueFromInstance(this.current, e, this.options);
    return i != null && (typeof i == "string" && (bs(i) || xs(i)) ? i = parseFloat(i) : !Qo(i) && ae.test(t) && (i = mr(e, t)), this.setBaseTarget(e, H(i) ? i.get() : i)), H(i) ? i.get() : i;
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
    Xo.render(this.render);
  }
}, xr = class extends br {
  constructor() {
    super(...arguments), this.KeyframeResolver = Ho;
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
function ol({ top: e, left: t, right: i, bottom: s }) {
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
function ll(e, t) {
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
function cl(e, t) {
  return ol(ll(e.getBoundingClientRect(), t));
}
var hl = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, ul = He.length;
function dl(e, t, i) {
  let s = "", r = !0;
  for (let a = 0; a < ul; a++) {
    const o = He[a], l = e[o];
    if (l === void 0) continue;
    let c = !0;
    if (typeof l == "number") c = l === (o.startsWith("scale") ? 1 : 0);
    else {
      const h = parseFloat(l);
      c = o.startsWith("scale") ? h === 1 : h === 0;
    }
    if (!c || i) {
      const h = ii(l, Ct[o]);
      if (!c) {
        r = !1;
        const d = hl[o] || o;
        s += `${d}(${h}) `;
      }
      i && (t[o] = h);
    }
  }
  const n = e.pathRotation;
  return n && (r = !1, s += `rotate(${ii(n, Ct.pathRotation)}) `), s = s.trim(), i ? s = i(t, r ? "" : s) : r && (s = "none"), s;
}
function wr(e, t, i) {
  const { style: s, vars: r, transformOrigin: n } = e;
  let a = !1, o = !1;
  for (const l in t) {
    const c = t[l];
    if (je.has(l)) {
      a = !0;
      continue;
    } else if (Is(l)) {
      r[l] = c;
      continue;
    } else {
      const h = ii(c, Ct[l]);
      l.startsWith("origin") ? (o = !0, n[l] = h) : s[l] = h;
    }
  }
  if (t.transform || (a || i ? s.transform = dl(t, e.transform, i) : s.transform && (s.transform = "none")), o) {
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
var Ye = { correct: (e, t) => {
  if (!t.target) return e;
  if (typeof e == "string") if (P.test(e)) e = parseFloat(e);
  else return e;
  return `${ls(e, t.target.x)}% ${ls(e, t.target.y)}%`;
} }, pl = { correct: (e, { treeScale: t, projectionDelta: i }) => {
  const s = e, r = ae.parse(e);
  if (r.length > 5) return s;
  const n = ae.createTransformer(e), a = typeof r[0] != "number" ? 1 : 0, o = i.x.scale * t.x, l = i.y.scale * t.y;
  r[0 + a] /= o, r[1 + a] /= l;
  const c = Ke(o, l, 0.5);
  return typeof r[2 + a] == "number" && (r[2 + a] /= c), typeof r[3 + a] == "number" && (r[3 + a] /= c), n(r);
} }, fl = {
  borderRadius: {
    ...Ye,
    applyTo: [...jo]
  },
  borderTopLeftRadius: Ye,
  borderTopRightRadius: Ye,
  borderBottomLeftRadius: Ye,
  borderBottomRightRadius: Ye,
  boxShadow: pl
};
function ml(e, { layout: t, layoutId: i }) {
  return je.has(e) || e.startsWith("origin") || (t || i !== void 0) && (!!fl[e] || e === "opacity");
}
function Mr(e, t, i) {
  const s = e.style, r = t?.style, n = {};
  if (!s) return n;
  for (const a in s) (H(s[a]) || r && H(r[a]) || ml(a, e) || i?.getValue(a)?.liveStyle !== void 0) && (n[a] = s[a]);
  return n;
}
function gl(e) {
  return window.getComputedStyle(e);
}
var yl = class extends xr {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = Sr;
  }
  mount(e) {
    de(!!e.style, "motion.create() components must forward their ref to a HTML or SVG element", "custom-component-ref"), super.mount(e);
  }
  readValueFromInstance(e, t) {
    if (je.has(t)) return this.projection?.isProjecting ? qt(t) : La(e, t);
    {
      const i = gl(e), s = (Is(t) ? i.getPropertyValue(t) : i[t]) || 0;
      return typeof s == "string" ? s.trim() : s;
    }
  }
  measureInstanceViewportBox(e, { transformPagePoint: t }) {
    return cl(e, t);
  }
  build(e, t, i) {
    wr(e, t, i.transformTemplate);
  }
  scrapeMotionValuesFromProps(e, t, i) {
    return Mr(e, t, i);
  }
};
function vl(e, t) {
  return e in t;
}
var bl = class extends br {
  constructor() {
    super(...arguments), this.type = "object";
  }
  readValueFromInstance(e, t) {
    if (vl(t, e)) {
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
    return Si();
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
}, xl = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, wl = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function Sl(e, t, i = 1, s = 0, r = !0) {
  e.pathLength = 1;
  const n = r ? xl : wl;
  e[n.offset] = `${-s}`, e[n.array] = `${t} ${i}`;
}
var Ml = [
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function Tl(e, { attrX: t, attrY: i, attrScale: s, pathLength: r, pathSpacing: n = 1, pathOffset: a = 0, ...o }, l, c, h) {
  if (wr(e, o, c), l) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: d, style: u } = e;
  d.transform && (u.transform = d.transform, delete d.transform), (u.transform || d.transformOrigin) && (u.transformOrigin = d.transformOrigin ?? "50% 50%", delete d.transformOrigin), u.transform && (u.transformBox = h?.transformBox ?? "fill-box", delete d.transformBox);
  for (const g of Ml) d[g] !== void 0 && (u[g] = d[g], delete d[g]);
  t !== void 0 && (d.x = t), i !== void 0 && (d.y = i), s !== void 0 && (d.scale = s), r !== void 0 && Sl(d, r, n, a, !1);
}
var Tr = /* @__PURE__ */ new Set([
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
]), Cl = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function _l(e, t, i, s) {
  Sr(e, t, void 0, s);
  for (const r in t.attrs) e.setAttribute(Tr.has(r) ? r : wi(r), t.attrs[r]);
}
function Al(e, t, i) {
  const s = Mr(e, t, i);
  for (const r in e) if (H(e[r]) || H(t[r])) {
    const n = He.indexOf(r) !== -1 ? "attr" + r.charAt(0).toUpperCase() + r.substring(1) : r;
    s[n] = e[r];
  }
  return s;
}
var Pl = class extends xr {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = Si;
  }
  getBaseTargetFromProps(e, t) {
    return e[t];
  }
  readValueFromInstance(e, t) {
    if (je.has(t)) {
      const i = fr(t);
      return i && i.default || 0;
    }
    return t = Tr.has(t) ? t : wi(t), e.getAttribute(t);
  }
  scrapeMotionValuesFromProps(e, t, i) {
    return Al(e, t, i);
  }
  build(e, t, i) {
    Tl(e, t, this.isSVGTag, i.transformTemplate, i.style);
  }
  renderInstance(e, t, i, s) {
    _l(e, t, i, s);
  }
  mount(e) {
    this.isSVGTag = Cl(e.tagName), super.mount(e);
  }
};
function Bl(e, t, i) {
  const s = H(e) ? e : Le(e);
  return s.start(lr("", s, t, i)), s.animation;
}
function Mi(e) {
  return typeof e == "object" && !Array.isArray(e);
}
function Cr(e, t, i, s) {
  return e == null ? [] : typeof e == "string" && Mi(t) ? qo(e, i, s) : e instanceof NodeList ? Array.from(e) : Array.isArray(e) ? e.filter((r) => r != null) : [e];
}
function kl(e, t, i) {
  return e * (t + 1) + i * t;
}
function cs(e, t, i, s) {
  return typeof t == "number" ? t : t.startsWith("-") || t.startsWith("+") ? Math.max(0, e + parseFloat(t)) : t === "<" ? i : t.startsWith("<") ? Math.max(0, i + parseFloat(t.slice(1))) : s.get(t) ?? e;
}
function El(e, t, i) {
  for (let s = 0; s < e.length; s++) {
    const r = e[s];
    r.at > t && r.at < i && (oi(e, r), s--);
  }
}
function zl(e, t, i, s, r, n) {
  El(e, r, n);
  for (let a = 0; a < t.length; a++) e.push({
    value: t[a],
    at: Ke(r, n, s[a]),
    easing: /* @__PURE__ */ Vs(i, a)
  });
}
function Vl(e, t, i = 0) {
  const s = t + 1 + t * i;
  for (let r = 0; r < e.length; r++) e[r] = e[r] / s;
}
function Dl(e, t) {
  return e.at === t.at ? e.value === null ? 1 : t.value === null ? -1 : 0 : e.at - t.at;
}
var Rl = "easeInOut", Vt = 20;
function Fl(e, { defaultTransition: t = {}, ...i } = {}, s, r) {
  const n = t.duration || 0.3, a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), l = {}, c = /* @__PURE__ */ new Map();
  let h = 0, d = 0, u = 0;
  for (let g = 0; g < e.length; g++) {
    const p = e[g];
    if (typeof p == "string") {
      c.set(p, d);
      continue;
    } else if (!Array.isArray(p)) {
      c.set(p.name, cs(d, p.at, h, c));
      continue;
    }
    let [y, m, v = {}] = p;
    v.at !== void 0 && (d = cs(d, v.at, h, c));
    let A = 0;
    const S = (w, _, b, x = 0, T = 0) => {
      const M = Il(w), { delay: B = 0, times: C = Xs(M), type: V = t.type || "keyframes", repeat: z, repeatType: D, repeatDelay: U = 0, ...E } = _;
      let { ease: G = t.ease || "easeOut", duration: R } = _;
      const j = typeof B == "function" ? B(x, T) : B, q = M.length, X = xi(V) ? V : r?.[V || "keyframes"];
      if (q <= 2 && X) {
        let te = 100;
        if (q === 2 && Ll(M)) {
          const Me = M[1] - M[0];
          te = Math.abs(Me);
        }
        const ie = {
          ...t,
          ...E
        };
        R !== void 0 && (ie.duration = ee(R));
        const re = Hs(ie, te, X);
        G = re.ease, R = re.duration;
      }
      R ?? (R = n);
      const Be = d + j;
      C.length === 1 && C[0] === 0 && (C[1] = 1);
      const Se = C.length - M.length;
      if (Se > 0 && qs(C, Se), M.length === 1 && M.unshift(null), z && We(z < Vt, `Sequence segments can't repeat ${z} times — ignoring repeat option. Use a value below ${Vt} or apply repeat at the sequence level instead.`), z && z < Vt) {
        const te = R > 0 ? U / R : 0;
        R = kl(R, z, U);
        const ie = [...M], re = [...C];
        G = Array.isArray(G) ? [...G] : [G];
        const Me = [...G], pt = D === "reverse" || D === "mirror";
        let ft = ie, le = Me;
        pt && (ft = [...ie].reverse(), D === "reverse" && (le = [...Me].reverse().map((ge) => typeof ge == "function" ? hi(ge) : ge)));
        for (let ge = 0; ge < z; ge++) {
          const Ci = pt && ge % 2 === 0, _i = Ci ? ft : ie, Pr = Ci ? le : Me, Ai = (ge + 1) * (1 + te);
          te > 0 && (M.push(M[M.length - 1]), C.push(Ai), G.push("linear")), M.push(..._i);
          for (let qe = 0; qe < _i.length; qe++)
            C.push(re[qe] + Ai), G.push(qe === 0 ? "linear" : /* @__PURE__ */ Vs(Pr, qe - 1));
        }
        Vl(C, z, te);
      }
      const me = Be + R;
      zl(b, M, G, C, Be, me), A = Math.max(j + R, A), u = Math.max(me, u);
    };
    if (H(y)) {
      const w = hs(y, o);
      S(m, v, us("default", w));
    } else {
      const w = Cr(y, m, s, l), _ = w.length;
      for (let b = 0; b < _; b++) {
        m = m, v = v;
        const x = w[b], T = hs(x, o);
        for (const M in m) S(m[M], Nl(v, M), us(M, T), b, _);
      }
    }
    h = d, d += A;
  }
  return o.forEach((g, p) => {
    for (const y in g) {
      const m = g[y];
      m.sort(Dl);
      const v = [], A = [], S = [];
      for (let x = 0; x < m.length; x++) {
        const { at: T, value: M, easing: B } = m[x];
        v.push(M), A.push(ci(0, u, T)), S.push(B || "easeOut");
      }
      A[0] !== 0 && (A.unshift(0), v.unshift(v[0]), S.unshift(Rl)), A[A.length - 1] !== 1 && (A.push(1), v.push(null)), a.has(p) || a.set(p, {
        keyframes: {},
        transition: {}
      });
      const w = a.get(p);
      w.keyframes[y] = v;
      const { type: _, ...b } = t;
      w.transition[y] = {
        ...b,
        duration: u,
        ease: S,
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
function Il(e) {
  return Array.isArray(e) ? e : [e];
}
function Nl(e, t) {
  return e && e[t] ? {
    ...e,
    ...e[t]
  } : { ...e };
}
var Ol = (e) => typeof e == "number", Ll = (e) => e.every(Ol);
function Ul(e) {
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
  }, i = gr(e) && !Yo(e) ? new Pl(t) : new yl(t);
  i.mount(e), ct.set(e, i);
}
function Wl(e) {
  const t = new bl({
    presenceContext: null,
    props: {},
    visualState: {
      renderState: { output: {} },
      latestValues: {}
    }
  });
  t.mount(e), ct.set(e, t);
}
function Gl(e, t) {
  return H(e) || typeof e == "number" || typeof e == "string" && !Mi(t);
}
function _r(e, t, i, s) {
  const r = [];
  if (Gl(e, t)) r.push(Bl(e, Mi(t) && t.default || t, i && (i.default || i)));
  else {
    if (e == null) return r;
    const n = Cr(e, t, s), a = n.length;
    de(!!a, "No valid elements provided.", "no-valid-elements");
    for (let o = 0; o < a; o++) {
      const l = n[o], c = l instanceof Element ? Ul : Wl;
      ct.has(l) || c(l);
      const h = ct.get(l), d = { ...i };
      "delay" in d && typeof d.delay == "function" && (d.delay = d.delay(o, a)), r.push(...Ro(h, {
        ...t,
        transition: d
      }, {}));
    }
  }
  return r;
}
function $l(e, t, i) {
  const s = [];
  return Fl(e.map((r) => {
    if (Array.isArray(r) && typeof r[0] == "function") {
      const n = r[0], a = Le(0);
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
  }), t, i, { spring: lt }).forEach(({ keyframes: r, transition: n }, a) => {
    s.push(..._r(a, r, n));
  }), s;
}
function Kl(e) {
  return Array.isArray(e) && e.some(Array.isArray);
}
function Hl(e = {}) {
  const { scope: t, reduceMotion: i, skipAnimations: s } = e;
  function r(n, a, o) {
    let l = [], c;
    const h = {};
    if (i !== void 0 && (h.reduceMotion = i), s !== void 0 && (h.skipAnimations = s), Kl(n)) {
      const { onComplete: u, ...g } = a || {};
      typeof u == "function" && (c = u), l = $l(n, {
        ...h,
        ...g
      }, t);
    } else {
      const { onComplete: u, ...g } = o || {};
      typeof u == "function" && (c = u), l = _r(n, a, {
        ...h,
        ...g
      }, t);
    }
    const d = new ho(l);
    return c && d.finished.then(c), t && (t.animations.push(d), d.finished.then(() => {
      oi(t.animations, d);
    })), d;
  }
  return r;
}
var jl = Hl(), Vc = class {
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
  input = Sn;
  audio = Tn;
  ui = Pn;
  debug = kn;
  debugRenderer;
  videoTimeline;
  sceneObstacles = [];
  constructor(e = {}) {
    this.config = e, this.save = new Vn(e.gameId || "default"), this.scenes = new Dn(this), this.cutscene = new Fn(this), this.videoTimeline = new Fi(this), this.debugRenderer = new zn(this), this.engine = new Zr(), this.world = new en(), this.physics = new tn(), this.physics.gravity = e.gravity ? new k(...e.gravity) : new k(0, -9.81, 0), this.scene = new f.Scene();
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
        this.babylonEngine = new I.Engine(this.babylonCanvas, !0, {
          preserveDrawingBuffer: !0,
          stencil: !0,
          alpha: !0
        }), this.babylonScene = new I.Scene(this.babylonEngine), this.babylonScene.clearColor = new I.Color4(0, 0, 0, 0), new I.FreeCamera("babylonCam", new I.Vector3(0, 6, 12), this.babylonScene).setTarget(I.Vector3.Zero());
      } catch (r) {
        console.error("Failed to initialize Babylon.js dual-engine layer:", r);
      }
    this.screenRecorder = new En(i);
    const s = window.innerWidth / window.innerHeight;
    if (this.config.mode === "2d") {
      const r = this.config.orthoScale ?? 10;
      this.camera = new f.OrthographicCamera(-r * s / 2, r * s / 2, r / 2, -r / 2, 0.1, 1e3), this.camera.position.set(0, 0, 10);
    } else
      this.camera = new f.PerspectiveCamera(55, s, 0.1, 200), this.camera.position.set(0, 6, 12);
    this.cameraController = new rn(this.camera), this.pipeline = new vn(this.renderer, this.scene, this.camera), e.shadows !== !1 && this.pipeline.setupLighting({}), window.addEventListener("resize", () => {
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
        this.babylonScene.activeCamera.rotationQuaternion === void 0 && (this.babylonScene.activeCamera.rotationQuaternion = new I.Quaternion()), this.babylonScene.activeCamera.rotationQuaternion.set(n.x, n.y, n.z, n.w);
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
    return jl(e, t, i);
  }
  onUpdate(e) {
    this.engine.events.on("update", e);
  }
  onRender(e) {
    this.engine.events.on("render", e);
  }
  createProceduralTerrain(e) {
    const t = bn(e);
    return t && t.mesh && this.scene.add(t.mesh), t;
  }
  async start() {
    if (this.audio.init(), this.config.rendererBackend === "webgpu" && (console.log("Kairo: Initializing WebGPU Backend..."), this.config.enableBabylon && this.babylonCanvas && !this.babylonEngine))
      try {
        const e = new I.WebGPUEngine(this.babylonCanvas, { stencil: !0 });
        await e.initAsync(), this.babylonEngine = e, this.babylonScene = new I.Scene(this.babylonEngine), this.babylonScene.clearColor = new I.Color4(0, 0, 0, 0), new I.FreeCamera("babylonCam", new I.Vector3(0, 6, 12), this.babylonScene).setTarget(I.Vector3.Zero()), console.log("Kairo: Babylon.js WebGPU Engine Started successfully.");
      } catch (e) {
        console.error("Kairo: WebGPU not supported or failed to initialize in Babylon. Falling back to WebGL.", e), this.babylonEngine = new I.Engine(this.babylonCanvas, !0, {
          preserveDrawingBuffer: !0,
          stencil: !0,
          alpha: !0
        }), this.babylonScene = new I.Scene(this.babylonEngine), this.babylonScene.clearColor = new I.Color4(0, 0, 0, 0), new I.FreeCamera("babylonCam", new I.Vector3(0, 6, 12), this.babylonScene).setTarget(I.Vector3.Zero());
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
      const s = new Je();
      s.type = e.physics === "static" ? W.Static : W.Dynamic, s.mass = e.mass ?? (e.physics === "static" ? 0 : 1);
      const r = new Ve();
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
    const i = new Je();
    i.type = t.type === "static" ? W.Static : W.Dynamic, i.mass = t.mass ?? (i.type === W.Dynamic ? 1 : 0);
    const s = t.colliderType || t.size ? (() => {
      const n = new Ve();
      return n.type = t.colliderType === "sphere" ? K.Sphere : t.colliderType === "capsule" ? K.Capsule : K.Box, n.size = new k(...t.size ?? [
        1,
        1,
        1
      ]), n;
    })() : xn(e);
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
    ], i = I.MeshBuilder.CreateBox(e.name ?? "babylonBox", {
      width: t[0],
      height: t[1],
      depth: t[2]
    }, this.babylonScene);
    if (i.position.set(...e.position ?? [
      0,
      0,
      0
    ]), e.color) {
      const s = new I.StandardMaterial("babylonMat", this.babylonScene);
      s.diffuseColor = new I.Color3(...e.color), i.material = s;
    }
    if (e.physics) {
      const s = new Je();
      s.type = e.physics === "static" ? W.Static : W.Dynamic, s.mass = e.mass ?? (e.physics === "static" ? 0 : 1);
      const r = new Ve();
      r.type = K.Box, r.size = new k(...t), this.physics.registerBody(s, r, new k(i.position.x, i.position.y, i.position.z)), i.rotationQuaternion = new I.Quaternion();
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
      const n = new Je();
      n.type = e.physics === "static" ? W.Static : W.Dynamic, n.mass = e.mass ?? (e.physics === "static" ? 0 : 1), e.fixedRotation && (n.fixedRotation = !0), e.lockZAxis && (n.lockLinearAxis = [
        !1,
        !1,
        !0
      ], n.lockAngularAxis = [
        !0,
        !0,
        !1
      ]);
      const a = new Ve();
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
    const d = n.textAlign === "center" ? r.width / 2 : n.textAlign === "right" ? r.width - 10 : 10, u = r.height / 2;
    n.fillText(t, d, u);
    const g = new f.CanvasTexture(r);
    g.minFilter = f.LinearFilter, g.colorSpace = f.SRGBColorSpace;
    const p = new f.MeshBasicMaterial({
      map: g,
      transparent: !0,
      side: f.DoubleSide
    }), y = r.width / r.height, m = e.size ?? 1, v = m * y, A = m, S = new f.Mesh(new f.PlaneGeometry(v, A), p);
    S.position.set(...e.position ?? [
      0,
      0,
      0
    ]), this.scene.add(S);
    let w;
    return e.billboard && (w = this.engine.events.on("update", () => {
      S.quaternion.copy(this.camera.quaternion);
    })), {
      mesh: S,
      setText: (_) => {
        n.clearRect(0, 0, r.width, r.height), n.font = i;
        const b = n.measureText(_), x = Math.ceil(b.width) + 20;
        let T = !1;
        x > r.width && (r.width = x, T = !0), n.font = i, n.fillStyle = s, n.textAlign = e.align || "center", n.textBaseline = "middle";
        const M = n.textAlign === "center" ? r.width / 2 : n.textAlign === "right" ? r.width - 10 : 10;
        if (n.fillText(_, M, r.height / 2), g.needsUpdate = !0, T) {
          const B = r.width / r.height;
          S.geometry.dispose(), S.geometry = new f.PlaneGeometry(m * B, m);
        }
      },
      dispose: () => {
        w && w(), this.scene.remove(S), S.geometry.dispose(), p.dispose(), g.dispose();
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
    const n = typeof performance < "u" ? performance.memory : null, a = n ? n.usedJSHeapSize : 0, o = n ? n.totalJSHeapSize : 0, l = n ? n.jsHeapSizeLimit : 0, c = e.memory.geometries * 45e3, h = e.memory.textures * 1024 * 1024, d = c + h, u = this.getCpuProfileMap(), g = [
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
        cpuProfileMap: u
      },
      cpuProfileMap: u,
      gpuMemory: {
        geometries: e.memory.geometries,
        textures: e.memory.textures,
        estimatedVramBytes: d,
        estimatedVramMb: (d / (1024 * 1024)).toFixed(2) + " MB"
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
    this.rigidBody = new Je(), this.rigidBody.type = t ? W.Static : W.Dynamic, this.rigidBody.mass = e.mass ?? (t ? 0 : 1), this.collider = new Ve(), this.collider.type = K.Box;
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
}, dt = class {
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
}, ql = class {
  p = /* @__PURE__ */ new Uint8Array(512);
  perm = /* @__PURE__ */ new Uint8Array(512);
  permMod12 = /* @__PURE__ */ new Uint8Array(512);
  constructor(e) {
    const t = new dt(e ?? Date.now());
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
    const i = 0.5 * (Math.sqrt(3) - 1), s = (3 - Math.sqrt(3)) / 6, r = (e + t) * i, n = Math.floor(e + r), a = Math.floor(t + r), o = (n + a) * s, l = n - o, c = a - o, h = e - l, d = t - c;
    let u, g;
    h > d ? (u = 1, g = 0) : (u = 0, g = 1);
    const p = h - u + s, y = d - g + s, m = h - 1 + 2 * s, v = d - 1 + 2 * s, A = n & 255, S = a & 255, w = this.permMod12[A + this.perm[S]], _ = this.permMod12[A + u + this.perm[S + g]], b = this.permMod12[A + 1 + this.perm[S + 1]];
    let x = 0.5 - h * h - d * d, T = 0;
    x >= 0 && (x *= x, T = x * x * this.dot(Dt[w], h, d));
    let M = 0.5 - p * p - y * y, B = 0;
    M >= 0 && (M *= M, B = M * M * this.dot(Dt[_], p, y));
    let C = 0.5 - m * m - v * v, V = 0;
    return C >= 0 && (C *= C, V = C * C * this.dot(Dt[b], m, v)), 70 * (T + B + V);
  }
}, Dt = [
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
], Dc = class {
  map;
  width;
  height;
  prng;
  constructor(e, t, i = 0.45, s) {
    this.width = e, this.height = t, this.map = [], this.prng = new dt(s ?? Date.now());
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
}, Xl = class {
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
  attach(e, t) {
    this.object = e, this.app = t, this.object && (this._baseY = this.object.position.y, this._startX = this.object.position.x, this._baseScale.copy(this.object.scale)), this.onStart();
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
    if (!this.object) return this;
    const s = Array.isArray(e) ? new f.Vector3(...e) : e, r = s.clone().sub(this.object.position).normalize();
    return this.object.position.add(r.multiplyScalar(t * i)), this.object.lookAt(s), this;
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
}, Rc = class {
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
}, Fc = { createBehavior: (e) => {
  const t = new Xl();
  return e.onStart && (t.onStart = e.onStart.bind(t)), e.onUpdate && (t.onUpdate = e.onUpdate.bind(t)), e.onInteract && (t.onInteract = e.onInteract.bind(t)), e.onCollision && (t.onCollision = e.onCollision.bind(t)), t;
} }, _t = {
  Success: "SUCCESS",
  Failure: "FAILURE",
  Running: "RUNNING"
}, Ti = class {
}, Ic = class extends Ti {
  children;
  constructor(e) {
    super(), this.children = e;
  }
  tick(e) {
    for (const t of this.children) {
      const i = t.tick(e);
      if (i !== _t.Success) return i;
    }
    return _t.Success;
  }
}, Nc = class extends Ti {
  children;
  constructor(e) {
    super(), this.children = e;
  }
  tick(e) {
    for (const t of this.children) {
      const i = t.tick(e);
      if (i !== _t.Failure) return i;
    }
    return _t.Failure;
  }
}, Oc = class extends Ti {
  actionFn;
  constructor(e) {
    super(), this.actionFn = e;
  }
  tick(e) {
    return this.actionFn(e);
  }
}, Lc = class {
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
    const o = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), c = [n], h = /* @__PURE__ */ new Set([n]), d = /* @__PURE__ */ new Set();
    o.set(n, 0), l.set(n, null);
    const u = (p) => {
      if (i === 0) return 0;
      const y = Math.abs(p.x - a.x), m = Math.abs(p.z - a.z);
      return s ? (Math.max(y, m) + (Math.SQRT2 - 1) * Math.min(y, m)) * i : (y + m) * i;
    }, g = (p) => (o.get(p) ?? 1 / 0) + u(p);
    for (; c.length > 0; ) {
      c.sort((m, v) => g(m) - g(v));
      const p = c.shift();
      if (h.delete(p), p === a) return this.reconstructSinglePath(p, l);
      d.add(p);
      const y = this.getNeighbors(p, s);
      for (const { node: m, moveCost: v } of y) {
        if (!m.walkable || d.has(m)) continue;
        const A = (o.get(p) ?? 0) + v;
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
    const o = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), c = [n], h = /* @__PURE__ */ new Set([n]), d = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), p = [a], y = /* @__PURE__ */ new Set([a]), m = /* @__PURE__ */ new Set();
    o.set(n, 0), l.set(n, null), u.set(a, 0), g.set(a, null);
    const v = (x) => {
      if (i === 0) return 0;
      const T = Math.abs(x.x - a.x), M = Math.abs(x.z - a.z);
      return s ? (Math.max(T, M) + (Math.SQRT2 - 1) * Math.min(T, M)) * i : (T + M) * i;
    }, A = (x) => {
      if (i === 0) return 0;
      const T = Math.abs(x.x - n.x), M = Math.abs(x.z - n.z);
      return s ? (Math.max(T, M) + (Math.SQRT2 - 1) * Math.min(T, M)) * i : (T + M) * i;
    }, S = (x) => (o.get(x) ?? 1 / 0) + v(x), w = (x) => (u.get(x) ?? 1 / 0) + A(x);
    let _ = 1 / 0, b = null;
    for (; c.length > 0 && p.length > 0; ) {
      c.sort((C, V) => S(C) - S(V));
      const x = c.shift();
      if (h.delete(x), d.add(x), m.has(x)) {
        const C = (o.get(x) ?? 0) + (u.get(x) ?? 0);
        if (C < _) {
          _ = C, b = x;
          break;
        }
      }
      const T = this.getNeighbors(x, s);
      for (const { node: C, moveCost: V } of T) {
        if (!C.walkable || d.has(C)) continue;
        const z = (o.get(x) ?? 0) + V;
        if (z < (o.get(C) ?? 1 / 0) && (o.set(C, z), l.set(C, x), h.has(C) || (c.push(C), h.add(C)), u.has(C))) {
          const D = z + u.get(C);
          D < _ && (_ = D, b = C);
        }
      }
      p.sort((C, V) => w(C) - w(V));
      const M = p.shift();
      if (y.delete(M), m.add(M), d.has(M)) {
        const C = (o.get(M) ?? 0) + (u.get(M) ?? 0);
        if (C < _) {
          _ = C, b = M;
          break;
        }
      }
      const B = this.getNeighbors(M, s);
      for (const { node: C, moveCost: V } of B) {
        if (!C.walkable || m.has(C)) continue;
        const z = (u.get(M) ?? 0) + V;
        if (z < (u.get(C) ?? 1 / 0) && (u.set(C, z), g.set(C, M), y.has(C) || (p.push(C), y.add(C)), o.has(C))) {
          const D = z + o.get(C);
          D < _ && (_ = D, b = C);
        }
      }
      if (b && c.length > 0 && p.length > 0 && S(c[0]) + w(p[0]) >= _)
        break;
    }
    return b ? this.reconstructBidirectionalPath(b, l, g) : [e, t];
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
}, Uc = class {
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
    if (this.duration > 0) e = ve.clamp(e % this.duration, 0, this.duration);
    else {
      const s = this.positionKeys[this.positionKeys.length - 1].time || 0;
      e = ve.clamp(e, 0, s);
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
    const i = t || new rt();
    if (this.rotationKeys.length === 0) return i.set(0, 0, 0, 1);
    if (this.duration > 0) e = ve.clamp(e % this.duration, 0, this.duration);
    else {
      const s = this.rotationKeys[this.rotationKeys.length - 1].time || 0;
      e = ve.clamp(e, 0, s);
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
    if (this.duration > 0) e = ve.clamp(e % this.duration, 0, this.duration);
    else {
      const s = this.scaleKeys[this.scaleKeys.length - 1].time || 0;
      e = ve.clamp(e, 0, s);
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
}, Wc = class {
  clips = [];
  _p1 = new k();
  _p2 = new k();
  _r1 = new rt();
  _r2 = new rt();
  addClip(e, t) {
    this.clips.push({
      clip: e,
      threshold: t
    }), this.clips.sort((i, s) => i.threshold - s.threshold);
  }
  evaluate(e, t, i, s) {
    const r = i || new k(), n = s || new rt();
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
        const h = c.threshold - l.threshold, d = h > 0 ? (e - l.threshold) / h : 0;
        return l.clip.samplePosition(t, this._p1), c.clip.samplePosition(t, this._p2), l.clip.sampleRotation(t, this._r1), c.clip.sampleRotation(t, this._r2), r.copy(this._p1).lerp(this._p2, d), n.copy(this._r1).slerp(this._r2, d), {
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
}, Gc = class {
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
}, $c = class {
  static solveTwoBone(e, t, i, s, r) {
    const n = i.x - e.x, a = i.y - e.y, o = i.z - e.z, l = Math.sqrt(n * n + a * a + o * o), c = ve.clamp(l, 1e-3, s + r - 1e-3), h = (s * s + c * c - r * r) / (2 * s * c), d = Math.acos(ve.clamp(h, -1, 1)), u = l > 0 ? 1 / l : 0, g = n * u, p = a * u, y = o * u;
    let m = 0, v = 0, A = 0;
    const S = g * g + y * y;
    if (S >= 1e-6) {
      const b = Math.sqrt(S);
      m = -g * p / b, v = b, A = -p * y / b;
    } else {
      const b = y * y + p * p;
      if (b >= 1e-6) {
        const x = Math.sqrt(b);
        m = 0, v = y / x, A = -p / x;
      } else {
        const x = p * p + g * g, T = Math.sqrt(x), M = T > 0 ? 1 / T : 0;
        m = p * M, v = -g * M, A = 0;
      }
    }
    const w = Math.cos(d) * s, _ = Math.sin(d) * s;
    return {
      jointPos: new k(e.x + g * w + m * _, e.y + p * w + v * _, e.z + y * w + A * _),
      endPos: new k(i.x, i.y, i.z)
    };
  }
}, Yl = class {
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
}, Kc = class {
  static evaluate(e, t, i = 1) {
    const s = new Yl(), r = t * i * 5;
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
}, Hc = /* @__PURE__ */ (function(e) {
  return e[e.LOW = 0] = "LOW", e[e.NORMAL = 1] = "NORMAL", e[e.HIGH = 2] = "HIGH", e[e.CRITICAL = 3] = "CRITICAL", e;
})({}), Zl = class {
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
}, Ar = new Zl(), jc = class {
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
}, qc = class {
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
  Oc as ActionNode,
  Uc as AnimationClip,
  Gc as AnimationStateMachine,
  Mn as AudioManager,
  Ti as BTNode,
  Wc as BlendTree1D,
  ms as BoundingBox,
  rn as CameraController,
  Dc as CellularAutomata,
  Cn as CinematicOverlayManager,
  Ve as Collider,
  K as ColliderType,
  F as Color,
  ze as CustomShaderMaterial,
  it as CutsceneAbortError,
  Rn as CutsceneContext,
  Fn as CutsceneManager,
  Bn as DebugInspector,
  zn as DebugRenderer,
  _n as DefaultTheme,
  Fc as EasyScript,
  Zr as Engine,
  kc as EngineCompiler,
  ye as EngineState,
  ds as EntityHandle,
  qc as EventActionDispatcher,
  Zl as EventBus,
  ri as EventEmitter,
  Hc as EventPriority,
  nc as FastSoAWorld,
  mc as FrustumCulling,
  Tn as GlobalAudio,
  Xe as GlobalCinematicOverlay,
  kn as GlobalDebugInspector,
  ec as GlobalEventBus,
  Ar as GlobalEvents,
  Sn as GlobalInput,
  Pn as GlobalUI,
  wn as InputManager,
  $c as InverseKinematicsSolver,
  Vc as KairoApp,
  jc as KeyEventTrigger,
  dc as Light,
  Vi as LightType,
  hc as Material,
  ve as MathUtils,
  ki as Matrix4,
  Bc as MouseButton,
  Lc as NavGrid,
  _t as NodeStatus,
  tc as ObjectPool,
  dt as PRNG,
  fc as ParticleSystem,
  Lc as PathfindingGrid,
  tn as PhysicsWorld,
  yn as PostProcessManager,
  rt as Quaternion,
  rc as Query,
  Ei as Ray,
  oc as RaycastVehicle,
  vn as RenderPipeline,
  cc as RenderQueue,
  Je as RigidBody,
  W as RigidBodyType,
  lc as SHADER_PRESETS,
  Vn as SaveSystem,
  Yr as Scene,
  Dn as SceneManager,
  zi as SceneNode,
  En as ScreenRecorder,
  Xl as ScriptBehavior,
  Rc as ScriptRunner,
  Nc as SelectorNode,
  Ic as SequenceNode,
  Ne as Serializer,
  uc as ShaderGraphCompiler,
  ys as ShaderPresets,
  Qr as SharedEntityContext,
  Jr as SharedEntityContextManager,
  ql as SimplexNoise,
  pc as SkyboxSettings,
  ac as SpatialHashGrid3D,
  Kc as StickmanAnimator,
  Yl as StickmanPose,
  sc as System,
  ic as SystemStage,
  ke as Time,
  An as UIManager,
  gt as Vector2,
  k as Vector3,
  Jl as Vector4,
  Fi as VideoTimeline,
  en as World,
  gc as createBlock,
  Sc as createCapsule,
  Pc as createCloud,
  xc as createCone,
  bc as createCylinder,
  Tc as createDodecahedron,
  Cc as createGrassField,
  Mc as createIcosahedron,
  vc as createPlane,
  Ac as createRock,
  yc as createSphere,
  bn as createTerrain,
  wc as createTorus,
  _c as createTree,
  xn as deriveCollider
};
