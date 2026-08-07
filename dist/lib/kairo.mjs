import * as e from "three";
import { ACESFilmicToneMapping as t, AdditiveBlending as n, AgXToneMapping as r, BufferGeometry as i, CineonToneMapping as a, Color as o, ColorManagement as s, CustomToneMapping as c, DepthTexture as l, DoubleSide as u, Float32BufferAttribute as d, HalfFloatType as f, LinearToneMapping as p, Matrix4 as m, Mesh as h, MeshBasicMaterial as g, MeshDepthMaterial as _, MeshNormalMaterial as v, NearestFilter as y, NeutralToneMapping as b, NoBlending as x, OrthographicCamera as S, RGBADepthPacking as C, RawShaderMaterial as w, ReinhardToneMapping as T, SRGBTransfer as E, ShaderMaterial as D, Timer as ee, UniformsUtils as O, Vector2 as k, Vector3 as A, Vector4 as te, WebGLRenderTarget as j } from "three";
import * as M from "cannon-es";
import * as N from "@babylonjs/core";
//#region packages/core/src/Math.ts
var P = class e {
	x;
	y;
	constructor(e = 0, t = 0) {
		this.x = e, this.y = t;
	}
	set(e, t) {
		return this.x = e, this.y = t, this;
	}
	copy(e) {
		return this.x = e.x, this.y = e.y, this;
	}
	clone() {
		return new e(this.x, this.y);
	}
	add(e) {
		return this.x += e.x, this.y += e.y, this;
	}
	sub(e) {
		return this.x -= e.x, this.y -= e.y, this;
	}
	scale(e) {
		return this.x *= e, this.y *= e, this;
	}
	lengthSq() {
		return this.x * this.x + this.y * this.y;
	}
	length() {
		return Math.sqrt(this.lengthSq());
	}
	normalize() {
		let e = this.length();
		return e > 0 && this.scale(1 / e), this;
	}
	dot(e) {
		return this.x * e.x + this.y * e.y;
	}
	distanceTo(e) {
		let t = this.x - e.x, n = this.y - e.y;
		return Math.sqrt(t * t + n * n);
	}
	static zero() {
		return new e(0, 0);
	}
}, F = class e {
	x;
	y;
	z;
	constructor(e = 0, t = 0, n = 0) {
		this.x = e, this.y = t, this.z = n;
	}
	set(e, t, n) {
		return this.x = e, this.y = t, this.z = n, this;
	}
	copy(e) {
		return this.x = e.x, this.y = e.y, this.z = e.z, this;
	}
	clone() {
		return new e(this.x, this.y, this.z);
	}
	add(e) {
		return this.x += e.x, this.y += e.y, this.z += e.z, this;
	}
	sub(e) {
		return this.x -= e.x, this.y -= e.y, this.z -= e.z, this;
	}
	scale(e) {
		return this.x *= e, this.y *= e, this.z *= e, this;
	}
	lengthSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}
	length() {
		return Math.sqrt(this.lengthSq());
	}
	normalize() {
		let e = this.length();
		return e > 0 && this.scale(1 / e), this;
	}
	dot(e) {
		return this.x * e.x + this.y * e.y + this.z * e.z;
	}
	cross(t) {
		let n = this.y * t.z - this.z * t.y, r = this.z * t.x - this.x * t.z, i = this.x * t.y - this.y * t.x;
		return new e(n, r, i);
	}
	distanceTo(e) {
		let t = this.x - e.x, n = this.y - e.y, r = this.z - e.z;
		return Math.sqrt(t * t + n * n + r * r);
	}
	lerp(e, t) {
		return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this;
	}
	static zero() {
		return new e(0, 0, 0);
	}
	static one() {
		return new e(1, 1, 1);
	}
}, ne = class {
	x;
	y;
	z;
	w;
	constructor(e = 0, t = 0, n = 0, r = 1) {
		this.x = e, this.y = t, this.z = n, this.w = r;
	}
}, re = class e {
	x;
	y;
	z;
	w;
	constructor(e = 0, t = 0, n = 0, r = 1) {
		this.x = e, this.y = t, this.z = n, this.w = r;
	}
	set(e, t, n, r) {
		return this.x = e, this.y = t, this.z = n, this.w = r, this;
	}
	copy(e) {
		return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w, this;
	}
	clone() {
		return new e(this.x, this.y, this.z, this.w);
	}
	identity() {
		return this.set(0, 0, 0, 1);
	}
	setFromEuler(e, t, n) {
		let r = Math.cos(e / 2), i = Math.cos(t / 2), a = Math.cos(n / 2), o = Math.sin(e / 2), s = Math.sin(t / 2), c = Math.sin(n / 2);
		return this.x = o * i * a + r * s * c, this.y = r * s * a - o * i * c, this.z = r * i * c + o * s * a, this.w = r * i * a - o * s * c, this;
	}
	slerp(t, n) {
		let r = t, i = this.w * t.w + this.x * t.x + this.y * t.y + this.z * t.z;
		if (i < 0 && (r = new e(-t.x, -t.y, -t.z, -t.w), i = -i), i >= 1) return this;
		let a = Math.acos(i), o = Math.sqrt(1 - i * i);
		if (Math.abs(o) < .001) return this.w = this.w * .5 + r.w * .5, this.x = this.x * .5 + r.x * .5, this.y = this.y * .5 + r.y * .5, this.z = this.z * .5 + r.z * .5, this;
		let s = Math.sin((1 - n) * a) / o, c = Math.sin(n * a) / o;
		return this.w = this.w * s + r.w * c, this.x = this.x * s + r.x * c, this.y = this.y * s + r.y * c, this.z = this.z * s + r.z * c, this;
	}
}, ie = class e {
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
		let e = this.elements;
		return e[0] = 1, e[4] = 0, e[8] = 0, e[12] = 0, e[1] = 0, e[5] = 1, e[9] = 0, e[13] = 0, e[2] = 0, e[6] = 0, e[10] = 1, e[14] = 0, e[3] = 0, e[7] = 0, e[11] = 0, e[15] = 1, this;
	}
	copy(e) {
		return this.elements.set(e.elements), this;
	}
	clone() {
		let t = new e();
		return t.copy(this), t;
	}
	compose(e, t, n) {
		let r = t.x, i = t.y, a = t.z, o = t.w, s = r + r, c = i + i, l = a + a, u = r * s, d = r * c, f = r * l, p = i * c, m = i * l, h = a * l, g = o * s, _ = o * c, v = o * l, y = n.x, b = n.y, x = n.z, S = this.elements;
		return S[0] = (1 - (p + h)) * y, S[1] = (d + v) * y, S[2] = (f - _) * y, S[3] = 0, S[4] = (d - v) * b, S[5] = (1 - (u + h)) * b, S[6] = (m + g) * b, S[7] = 0, S[8] = (f + _) * x, S[9] = (m - g) * x, S[10] = (1 - (u + p)) * x, S[11] = 0, S[12] = e.x, S[13] = e.y, S[14] = e.z, S[15] = 1, this;
	}
	multiplyMatrices(e, t) {
		let n = e.elements, r = t.elements, i = this.elements, a = n[0], o = n[4], s = n[8], c = n[12], l = n[1], u = n[5], d = n[9], f = n[13], p = n[2], m = n[6], h = n[10], g = n[14], _ = n[3], v = n[7], y = n[11], b = n[15], x = r[0], S = r[4], C = r[8], w = r[12], T = r[1], E = r[5], D = r[9], ee = r[13], O = r[2], k = r[6], A = r[10], te = r[14], j = r[3], M = r[7], N = r[11], P = r[15];
		return i[0] = a * x + o * T + s * O + c * j, i[4] = a * S + o * E + s * k + c * M, i[8] = a * C + o * D + s * A + c * N, i[12] = a * w + o * ee + s * te + c * P, i[1] = l * x + u * T + d * O + f * j, i[5] = l * S + u * E + d * k + f * M, i[9] = l * C + u * D + d * A + f * N, i[13] = l * w + u * ee + d * te + f * P, i[2] = p * x + m * T + h * O + g * j, i[6] = p * S + m * E + h * k + g * M, i[10] = p * C + m * D + h * A + g * N, i[14] = p * w + m * ee + h * te + g * P, i[3] = _ * x + v * T + y * O + b * j, i[7] = _ * S + v * E + y * k + b * M, i[11] = _ * C + v * D + y * A + b * N, i[15] = _ * w + v * ee + y * te + b * P, this;
	}
	multiply(e) {
		return this.multiplyMatrices(this, e);
	}
}, I = class {
	r;
	g;
	b;
	a;
	constructor(e = 1, t = 1, n = 1, r = 1) {
		this.r = e, this.g = t, this.b = n, this.a = r;
	}
	setHex(e) {
		return e = e.replace("#", ""), e.length === 6 && (this.r = parseInt(e.substring(0, 2), 16) / 255, this.g = parseInt(e.substring(2, 4), 16) / 255, this.b = parseInt(e.substring(4, 6), 16) / 255, this.a = 1), this;
	}
	toHex() {
		return `#${Math.round(this.r * 255).toString(16).padStart(2, "0")}${Math.round(this.g * 255).toString(16).padStart(2, "0")}${Math.round(this.b * 255).toString(16).padStart(2, "0")}`;
	}
}, ae = class e {
	origin;
	direction;
	static _missResult = (() => {
		let e = Object.freeze(new F()), t = Object.freeze(new F());
		return Object.freeze({
			hasHit: !1,
			distance: Infinity,
			point: e,
			normal: t
		});
	})();
	constructor(e = new F(), t = new F(0, 0, -1)) {
		this.origin = e instanceof F ? e : new F(e.x, e.y, e.z), this.direction = t instanceof F ? t : new F(t.x, t.y, t.z);
	}
	intersectBox(t) {
		let n = Math.abs(this.direction.x) < 1e-5 ? 1e-5 : this.direction.x, r = Math.abs(this.direction.y) < 1e-5 ? 1e-5 : this.direction.y, i = Math.abs(this.direction.z) < 1e-5 ? 1e-5 : this.direction.z, a = (t.min.x - this.origin.x) / n, o = (t.max.x - this.origin.x) / n;
		a > o && ([a, o] = [o, a]);
		let s = (t.min.y - this.origin.y) / r, c = (t.max.y - this.origin.y) / r;
		if (s > c && ([s, c] = [c, s]), a > c || s > o) return e._missResult;
		s > a && (a = s), c < o && (o = c);
		let l = (t.min.z - this.origin.z) / i, u = (t.max.z - this.origin.z) / i;
		if (l > u && ([l, u] = [u, l]), a > u || l > o) return e._missResult;
		l > a && (a = l);
		let d = new F(this.origin.x + this.direction.x * a, this.origin.y + this.direction.y * a, this.origin.z + this.direction.z * a), f = new F(), p = .01;
		return Math.abs(d.x - t.max.x) < p ? f.x = 1 : Math.abs(d.x - t.min.x) < p ? f.x = -1 : Math.abs(d.y - t.max.y) < p ? f.y = 1 : Math.abs(d.y - t.min.y) < p ? f.y = -1 : Math.abs(d.z - t.max.z) < p ? f.z = 1 : Math.abs(d.z - t.min.z) < p ? f.z = -1 : f.z = 1, {
			hasHit: a >= 0,
			distance: a,
			point: d,
			normal: f
		};
	}
	intersectSphere(t, n) {
		let r = t.x - this.origin.x, i = t.y - this.origin.y, a = t.z - this.origin.z, o = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y + this.direction.z * this.direction.z), s = o > 0 ? this.direction.x / o : 0, c = o > 0 ? this.direction.y / o : 0, l = o > 0 ? this.direction.z / o : -1, u = r * s + i * c + a * l, d = r * r + i * i + a * a - u * u, f = n * n;
		if (d > f) return e._missResult;
		let p = Math.sqrt(f - d), m = u - p, h = u + p;
		if (m < 0 && (m = h), m < 0) return e._missResult;
		let g = new F(this.origin.x + s * m, this.origin.y + c * m, this.origin.z + l * m), _ = new F((g.x - t.x) / n, (g.y - t.y) / n, (g.z - t.z) / n);
		return {
			hasHit: !0,
			distance: m,
			point: g,
			normal: _
		};
	}
}, oe = class {
	min;
	max;
	constructor(e = new F(-1, -1, -1), t = new F(1, 1, 1)) {
		this.min = e, this.max = t;
	}
	intersectsBox(e) {
		return this.max.x >= e.min.x && this.min.x <= e.max.x && this.max.y >= e.min.y && this.min.y <= e.max.y && this.max.z >= e.min.z && this.min.z <= e.max.z;
	}
}, se = class {
	static clamp(e, t, n) {
		return Math.max(t, Math.min(n, e));
	}
	static lerp(e, t, n) {
		return e + (t - e) * n;
	}
	static degToRad(e) {
		return Math.PI / 180 * e;
	}
	static radToDeg(e) {
		return 180 / Math.PI * e;
	}
}, ce = class {
	events = /* @__PURE__ */ new Map();
	on(e, t) {
		return this.events.has(e) || this.events.set(e, /* @__PURE__ */ new Set()), this.events.get(e).add(t), () => this.off(e, t);
	}
	once(e, t) {
		let n = (r) => {
			t(r), this.off(e, n);
		};
		this.on(e, n);
	}
	off(e, t) {
		let n = this.events.get(e);
		n && n.delete(t);
	}
	emit(e, t) {
		let n = this.events.get(e);
		n && n.forEach((e) => e(t));
	}
	clear() {
		this.events.clear();
	}
}, le = new ce(), ue = class {
	static deltaTime = .016;
	static fixedDeltaTime = .0166;
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
		let t = (e - this.lastTime) / 1e3;
		this.lastTime = e, this.deltaTime = Math.min(t, .1) * this.timeScale, this.elapsedTime += this.deltaTime, this.frameCount++, this.frameTimeAccumulator += t, this.framesThisSecond++, this.frameTimeAccumulator >= 1 && (this.fps = this.framesThisSecond, this.framesThisSecond = 0, --this.frameTimeAccumulator);
	}
}, de = class {
	static VERSION = 1;
	static serialize(e, t = !1) {
		return JSON.stringify(e, (e, t) => t instanceof Set ? {
			__type: "Set",
			values: Array.from(t)
		} : t instanceof Map ? {
			__type: "Map",
			entries: Array.from(t.entries())
		} : t, t ? 2 : void 0);
	}
	static deserialize(e) {
		return JSON.parse(e, (e, t) => {
			if (t && typeof t == "object") {
				if (t.__type === "Set" && Array.isArray(t.values)) return new Set(t.values);
				if (t.__type === "Map" && Array.isArray(t.entries)) return new Map(t.entries);
			}
			return t;
		});
	}
	static createSaveEnvelope(e) {
		let t = this.serialize(e), n = this.hashString(t);
		return {
			version: this.VERSION,
			timestamp: Date.now(),
			checksum: n,
			payload: e
		};
	}
	static verifyAndUnwrapSave(e) {
		if (!e || typeof e != "object") return {
			valid: !1,
			error: "Invalid save data format"
		};
		let t = this.serialize(e.payload);
		return this.hashString(t) === e.checksum ? {
			valid: !0,
			payload: e.payload
		} : {
			valid: !1,
			error: "Save data checksum mismatch - corrupted save"
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
		for (let n = 0; n < e.length; n++) {
			let r = e.charCodeAt(n);
			t = (t << 5) - t + r, t |= 0;
		}
		return t;
	}
}, fe = class e {
	id;
	name;
	parent = null;
	children = [];
	position = new F(0, 0, 0);
	rotation = new re(0, 0, 0, 1);
	scale = new F(1, 1, 1);
	localMatrix = new ie();
	worldMatrix = new ie();
	components = /* @__PURE__ */ new Map();
	constructor(e = "Node", t) {
		this.name = e, this.id = t || `node_${Math.random().toString(36).substring(2, 9)}`;
	}
	addChild(e) {
		return e.parent && e.parent.removeChild(e), e.parent = this, this.children.push(e), this;
	}
	removeChild(e) {
		let t = this.children.indexOf(e);
		return t !== -1 && (e.parent = null, this.children.splice(t, 1)), this;
	}
	addComponent(e, t) {
		return this.components.set(e, t), this;
	}
	getComponent(e) {
		return this.components.get(e);
	}
	updateMatrix() {
		this.localMatrix.compose(this.position, this.rotation, this.scale), this.parent ? this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, this.localMatrix) : this.worldMatrix.copy(this.localMatrix);
		for (let e of this.children) e.updateMatrix();
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
			children: this.children.map((e) => e.serialize())
		};
	}
	static deserialize(t) {
		let n = new e(t.name, t.id);
		n.position.set(...t.position), n.rotation.set(...t.rotation), n.scale.set(...t.scale);
		for (let [e, r] of Object.entries(t.components || {})) n.addComponent(e, r);
		for (let r of t.children || []) n.addChild(e.deserialize(r));
		return n;
	}
}, pe = class e {
	root = new fe("Scene Root");
	events = new ce();
	name;
	constructor(e = "Default Scene") {
		this.name = e;
	}
	add(e) {
		this.root.addChild(e), this.events.emit("nodeAdded", e);
	}
	remove(e) {
		this.root.removeChild(e), this.events.emit("nodeRemoved", e);
	}
	findByName(e) {
		let t = (n) => {
			if (n.name === e) return n;
			for (let e of n.children) {
				let n = t(e);
				if (n) return n;
			}
			return null;
		};
		return t(this.root);
	}
	serialize() {
		return de.serialize({
			name: this.name,
			root: this.root.serialize()
		}, !0);
	}
	static deserialize(t) {
		let n = de.deserialize(t), r = new e(n.name);
		return r.root = fe.deserialize(n.root), r;
	}
}, L = {
	Stopped: "STOPPED",
	Running: "RUNNING",
	Paused: "PAUSED"
}, me = class {
	state = L.Stopped;
	activeScene;
	events = new ce();
	animationFrameId = null;
	fixedUpdateAccumulator = 0;
	constructor() {
		this.activeScene = new pe("Main Scene");
	}
	start() {
		this.state !== L.Running && (this.state = L.Running, this.events.emit("started"), this.loop(performance.now()));
	}
	pause() {
		this.state = L.Paused, this.events.emit("paused");
	}
	resume() {
		this.state === L.Paused && (this.state = L.Running, this.events.emit("resumed"), this.loop(performance.now()));
	}
	stop() {
		this.state = L.Stopped, this.animationFrameId !== null && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.events.emit("stopped");
	}
	loop = (e) => {
		if (this.state === L.Running) {
			for (ue.update(e), this.fixedUpdateAccumulator += ue.deltaTime; this.fixedUpdateAccumulator >= ue.fixedDeltaTime;) this.fixedUpdate(ue.fixedDeltaTime), this.fixedUpdateAccumulator -= ue.fixedDeltaTime;
			this.update(ue.deltaTime), this.render(), typeof requestAnimationFrame < "u" && (this.animationFrameId = requestAnimationFrame(this.loop));
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
}, he = class {
	freeList = [];
	factory;
	resetFn;
	constructor(e, t, n = 32) {
		this.factory = e, this.resetFn = t;
		for (let e = 0; e < n; e++) this.freeList.push(this.factory());
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
}, R = {
	Dynamic: "DYNAMIC",
	Static: "STATIC",
	Kinematic: "KINEMATIC"
}, z = {
	Box: "BOX",
	Sphere: "SPHERE",
	Capsule: "CAPSULE",
	Mesh: "MESH"
}, ge = class {
	cellSize;
	grid = /* @__PURE__ */ new Map();
	constructor(e = 2) {
		this.cellSize = e;
	}
	getKey(e, t, n) {
		return `${Math.floor(e / this.cellSize)},${Math.floor(t / this.cellSize)},${Math.floor(n / this.cellSize)}`;
	}
	clear() {
		this.grid.clear();
	}
	insert(e, t, n = .5) {
		let r = this.getKey(t.x, t.y, t.z), i = this.grid.get(r);
		i || (i = [], this.grid.set(r, i)), i.push({
			id: e,
			pos: t,
			radius: n
		});
	}
	getNearby(e) {
		let t = Math.floor(e.x / this.cellSize), n = Math.floor(e.y / this.cellSize), r = Math.floor(e.z / this.cellSize), i = [];
		for (let e = -1; e <= 1; e++) for (let a = -1; a <= 1; a++) for (let o = -1; o <= 1; o++) {
			let s = `${t + e},${n + a},${r + o}`, c = this.grid.get(s);
			if (c) for (let e = 0; e < c.length; e++) i.push(c[e]);
		}
		return i;
	}
}, _e = class {
	type = z.Box;
	size = new F(1, 1, 1);
	radius = .5;
	isTrigger = !1;
	getBoundingBox(e, t) {
		let n = this.size.x * .5, r = this.size.y * .5, i = this.size.z * .5;
		return t ? (t.min.set(e.x - n, e.y - r, e.z - i), t.max.set(e.x + n, e.y + r, e.z + i), t) : new oe(new F(e.x - n, e.y - r, e.z - i), new F(e.x + n, e.y + r, e.z + i));
	}
}, ve = class {
	type = R.Dynamic;
	mass = 1;
	useGravity = !0;
	linearDamping = .05;
	angularDamping = .05;
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
		this.cannonBody && this.cannonBody.applyForce(B(e), t ? B(t) : this.cannonBody.position);
	}
	applyImpulse(e, t) {
		this.cannonBody && this.cannonBody.applyImpulse(B(e), t ? B(t) : this.cannonBody.position);
	}
	applyTorque(e) {
		this.cannonBody && this.cannonBody.torque.vadd(B(e), this.cannonBody.torque);
	}
	teleport(e) {
		this.cannonBody && (this.cannonBody.position.set(e.x, e.y, e.z), this.cannonBody.previousPosition.set(e.x, e.y, e.z), this.cannonBody.interpolatedPosition.set(e.x, e.y, e.z));
	}
	get velocity() {
		return this.cannonBody ? be(this.cannonBody.velocity) : new F();
	}
	set velocity(e) {
		this.cannonBody && this.cannonBody.velocity.set(e.x, e.y, e.z);
	}
	get angularVelocity() {
		return this.cannonBody ? be(this.cannonBody.angularVelocity) : new F();
	}
	set angularVelocity(e) {
		this.cannonBody && this.cannonBody.angularVelocity.set(e.x, e.y, e.z);
	}
}, ye = class e {
	getCannonWorld() {
		return this.cannonWorld;
	}
	gravity = new F(0, -9.81, 0);
	activeBackend = "cannon";
	bodies = [];
	cannonWorld;
	static _raycastTempBox = new oe();
	bodyLookup = /* @__PURE__ */ new Map();
	collisionListeners = [];
	triggerListeners = [];
	activePairs = /* @__PURE__ */ new Map();
	collisionEvents = [];
	static FIXED_TIMESTEP = 1 / 60;
	static MAX_SUBSTEPS = 3;
	constructor(e = "cannon") {
		this.activeBackend = e, this.cannonWorld = new M.World(), this.cannonWorld.gravity.set(0, -9.81, 0), this.cannonWorld.frictionGravity = new M.Vec3().copy(this.cannonWorld.gravity), this.cannonWorld.broadphase = new M.SAPBroadphase(this.cannonWorld), this.cannonWorld.solver.iterations = 10;
	}
	setBackend(e) {
		this.activeBackend = e, console.log(`[Kairo Physics] Active Physics Engine Backend set to: ${e.toUpperCase()}`);
	}
	clear() {
		for (let e of [...this.bodies]) this.unregisterBody(e.body);
		this.bodies = [], this.bodyLookup.clear(), this.collisionListeners = [], this.triggerListeners = [], this.activePairs.clear(), this.collisionEvents = [];
	}
	registerBody(e, t, n = new F()) {
		let r = e.type === R.Dynamic, i = e.type === R.Kinematic, a = new M.Body({
			mass: r ? Math.max(.001, e.mass) : 0,
			type: r ? M.Body.DYNAMIC : i ? M.Body.KINEMATIC : M.Body.STATIC,
			position: B(n),
			linearDamping: e.linearDamping,
			angularDamping: e.angularDamping,
			fixedRotation: e.fixedRotation,
			collisionFilterGroup: e.collisionLayer,
			collisionFilterMask: e.collisionMask
		});
		a.linearFactor.set(+!e.lockLinearAxis[0], +!e.lockLinearAxis[1], +!e.lockLinearAxis[2]), a.angularFactor.set(+!e.lockAngularAxis[0], +!e.lockAngularAxis[1], +!e.lockAngularAxis[2]);
		let o = this.createShape(t);
		a.addShape(o), e.cannonBody = a;
		let s = {
			body: e,
			collider: t,
			position: n
		};
		this.bodies.push(s), this.bodyLookup.set(a, s), this.cannonWorld.addBody(a);
	}
	unregisterBody(e) {
		e.cannonBody &&= (this.cannonWorld.removeBody(e.cannonBody), this.bodyLookup.delete(e.cannonBody), null), this.bodies = this.bodies.filter((t) => t.body !== e);
	}
	step(t) {
		if (this.activeBackend === "go-wasm" && typeof window < "u" && window.kairoWasmPhysics) {
			window.kairoWasmPhysics.step(t);
			return;
		}
		if (this.activeBackend === "havok") if (typeof window < "u" && window.havokPlugin) {
			window.havokPlugin.step(t);
			return;
		} else e._havokFallbackWarned ||= (console.warn("[PhysicsWorld] Havok backend selected but Havok WASM plugin is not loaded; falling back to Cannon.js physics solver."), !0);
		let n = this.cannonWorld;
		n.gravity.set(this.gravity.x, this.gravity.y, this.gravity.z), this.cancelGravityForNonGravityBodies(), this.syncKinematicAndStaticBodies(), n.step(e.FIXED_TIMESTEP, t, e.MAX_SUBSTEPS), this.syncDynamicBodies(), this.collectCollisionEvents();
	}
	static _havokFallbackWarned = !1;
	cancelGravityForNonGravityBodies() {
		let e = this.gravity;
		for (let t of this.bodies) {
			let n = t.body.cannonBody;
			n && t.body.type === R.Dynamic && !t.body.useGravity && (n.force.x -= t.body.mass * e.x, n.force.y -= t.body.mass * e.y, n.force.z -= t.body.mass * e.z);
		}
	}
	onCollision(e) {
		this.collisionListeners.push(e);
	}
	onTrigger(e) {
		this.triggerListeners.push(e);
	}
	raycast(t, n, r = 100) {
		let i, a = r;
		t instanceof ae ? (i = t, typeof n == "number" && (a = n)) : i = new ae(t, n instanceof F ? n : new F(0, 0, -1));
		let o = {
			hasHit: !1,
			body: null,
			collider: null,
			point: new F(),
			normal: new F(),
			distance: a
		};
		for (let t = 0; t < this.bodies.length; t++) {
			let { body: n, collider: r, position: s } = this.bodies[t], c;
			if (r.type === z.Sphere) {
				let e = r.radius || r.size.x * .5;
				c = i.intersectSphere(s, e);
			} else {
				let t = r.getBoundingBox(s, e._raycastTempBox);
				c = i.intersectBox(t);
			}
			c.hasHit && c.distance <= a && c.distance < o.distance && (o = {
				hasHit: !0,
				body: n,
				collider: r,
				point: c.point,
				normal: c.normal,
				distance: c.distance
			});
		}
		return o;
	}
	sphereCast(e, t, n, r = 100) {
		let i = this.raycast(e, n, r + t);
		return i.hasHit && (i.distance = Math.max(0, i.distance - t)), i;
	}
	overlapSphere(e, t) {
		let n = [];
		for (let r = 0; r < this.bodies.length; r++) {
			let { body: i, collider: a, position: o } = this.bodies[r];
			if (a.type === z.Sphere) {
				let r = t + (a.radius || a.size.x * .5), s = e.x - o.x, c = e.y - o.y, l = e.z - o.z;
				s * s + c * c + l * l <= r * r && n.push(i);
			} else {
				let r = a.size.x * .5, s = a.size.y * .5, c = a.size.z * .5, l = Se(e.x, o.x - r, o.x + r), u = Se(e.y, o.y - s, o.y + s), d = Se(e.z, o.z - c, o.z + c), f = e.x - l, p = e.y - u, m = e.z - d;
				f * f + p * p + m * m <= t * t && n.push(i);
			}
		}
		return n;
	}
	overlapBox(e, t, n = !0) {
		let r = n ? t.x : t.x * .5, i = n ? t.y : t.y * .5, a = n ? t.z : t.z * .5, o = e.x - r, s = e.x + r, c = e.y - i, l = e.y + i, u = e.z - a, d = e.z + a, f = [];
		for (let e = 0; e < this.bodies.length; e++) {
			let { body: t, collider: n, position: r } = this.bodies[e];
			if (!t.cannonBody) continue;
			let i = n.size.x * .5, a = n.size.y * .5, p = n.size.z * .5;
			s >= r.x - i && o <= r.x + i && l >= r.y - a && c <= r.y + a && d >= r.z - p && u <= r.z + p && f.push(t);
		}
		return f;
	}
	createShape(e) {
		return e.type === z.Sphere ? new M.Sphere(e.size.x * .5) : e.type === z.Capsule ? new M.Cylinder(e.size.x * .5, e.size.x * .5, e.size.y, 12) : new M.Box(new M.Vec3(e.size.x * .5, e.size.y * .5, e.size.z * .5));
	}
	syncKinematicAndStaticBodies() {
		for (let e of this.bodies) e.body.cannonBody && e.body.type !== R.Dynamic && e.body.cannonBody.position.set(e.position.x, e.position.y, e.position.z);
	}
	syncDynamicBodies() {
		for (let e of this.bodies) e.body.cannonBody && e.body.type === R.Dynamic && e.position.set(e.body.cannonBody.position.x, e.body.cannonBody.position.y, e.body.cannonBody.position.z);
	}
	collectCollisionEvents() {
		let e = /* @__PURE__ */ new Map();
		this.collisionEvents = [];
		for (let t of this.cannonWorld.contacts) {
			let n = this.bodyLookup.get(t.bi), r = this.bodyLookup.get(t.bj);
			if (!n || !r) continue;
			let i = xe(t.bi.id, t.bj.id);
			e.set(i, [n, r]), this.emitCollision(this.activePairs.has(i) ? "stay" : "enter", n, r);
		}
		for (let [t, n] of this.activePairs.entries()) if (!e.has(t)) {
			let [e, t] = n;
			this.bodyLookup.has(e.body.cannonBody) && this.bodyLookup.has(t.body.cannonBody) && this.emitCollision("exit", e, t);
		}
		this.activePairs = e;
	}
	emitCollision(e, t, n) {
		let r = [{
			phase: e,
			body: t.body,
			other: n.body,
			collider: t.collider,
			otherCollider: n.collider
		}, {
			phase: e,
			body: n.body,
			other: t.body,
			collider: n.collider,
			otherCollider: t.collider
		}];
		this.collisionEvents.push(...r);
		for (let e of r) {
			for (let t of this.collisionListeners) t(e);
			if (e.collider.isTrigger || e.otherCollider.isTrigger) for (let t of this.triggerListeners) t(e);
		}
	}
	toRaycastHit(e) {
		let t = e.body ? this.bodyLookup.get(e.body) : void 0;
		return {
			hasHit: !0,
			body: t?.body ?? null,
			collider: t?.collider ?? null,
			point: be(e.hitPointWorld),
			normal: be(e.hitNormalWorld),
			distance: e.distance
		};
	}
};
function B(e) {
	return new M.Vec3(e.x, e.y, e.z);
}
function be(e) {
	return new F(e.x, e.y, e.z);
}
function xe(e, t) {
	return e < t ? `${e}:${t}` : `${t}:${e}`;
}
function Se(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
var Ce = class {
	cannonVehicle = null;
	chassisBody;
	constructor(e) {
		this.chassisBody = e.chassisBody, this.chassisBody.cannonBody && (this.cannonVehicle = new M.RaycastVehicle({
			chassisBody: this.chassisBody.cannonBody,
			indexRightAxis: e.indexRightAxis ?? 0,
			indexUpAxis: e.indexUpAxis ?? 1,
			indexForwardAxis: e.indexForwardAxis ?? 2
		}));
	}
	addWheel(e) {
		this.cannonVehicle && this.cannonVehicle.addWheel({
			radius: e.radius,
			directionLocal: B(e.directionLocal),
			suspensionStiffness: e.suspensionStiffness,
			suspensionRestLength: e.suspensionRestLength,
			frictionSlip: e.frictionSlip,
			dampingRelaxation: e.dampingRelaxation,
			dampingCompression: e.dampingCompression,
			maxSuspensionForce: e.maxSuspensionForce,
			rollInfluence: e.rollInfluence,
			axleLocal: B(e.axleLocal),
			chassisConnectionPointLocal: B(e.chassisConnectionPointLocal),
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
		let t = this.cannonVehicle.wheelInfos[e].worldTransform;
		return {
			position: new F(t.position.x, t.position.y, t.position.z),
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
}, we = class t {
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
	constructor(e = "Custom Shader Material", n = {}) {
		this.id = `shader_${Math.random().toString(36).substring(2, 9)}`, this.name = e, this.vertexShader = n.vertexShader || t.DEFAULT_VERTEX_SHADER, this.fragmentShader = n.fragmentShader || t.DEFAULT_FRAGMENT_SHADER, this.transparent = n.transparent ?? !1, this.wireframe = n.wireframe ?? !1, this.side = n.side || "front", this.blending = n.blending || "normal", this.depthWrite = n.depthWrite ?? !0, this.depthTest = n.depthTest ?? !0, this.uniforms = {
			u_time: {
				value: 0,
				type: "float"
			},
			u_resolution: {
				value: [1e3, 800],
				type: "vec2"
			},
			u_color: {
				value: new I(1, 1, 1, 1),
				type: "color"
			},
			...n.uniforms || {}
		};
	}
	setUniform(e, t, n) {
		this.uniforms[e] ? (this.uniforms[e].value = t, n && (this.uniforms[e].type = n)) : this.uniforms[e] = {
			value: t,
			type: n || (typeof t == "number" ? "float" : Array.isArray(t) ? `vec${t.length}` : "float")
		}, this.threeMaterial && this.threeMaterial.uniforms[e] && (this.threeMaterial.uniforms[e].value = this.formatThreeUniformValue(t, this.uniforms[e].type));
	}
	getUniform(e) {
		return this.uniforms[e] ? this.uniforms[e].value : void 0;
	}
	update(e, t) {
		this.setUniform("u_time", t);
	}
	toThreeMaterial() {
		if (this.threeMaterial) return this.updateThreeUniforms(), this.threeMaterial;
		let t = {};
		for (let [e, n] of Object.entries(this.uniforms)) t[e] = { value: this.formatThreeUniformValue(n.value, n.type) };
		let n = e.FrontSide;
		this.side === "back" && (n = e.BackSide), this.side === "double" && (n = e.DoubleSide);
		let r = e.NormalBlending;
		return this.blending === "additive" && (r = e.AdditiveBlending), this.blending === "subtractive" && (r = e.SubtractiveBlending), this.blending === "multiply" && (r = e.MultiplyBlending), this.threeMaterial = new e.ShaderMaterial({
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader,
			uniforms: t,
			transparent: this.transparent,
			wireframe: this.wireframe,
			side: n,
			blending: r,
			depthWrite: this.depthWrite,
			depthTest: this.depthTest
		}), this.threeMaterial;
	}
	updateThreeUniforms() {
		if (this.threeMaterial) {
			for (let [e, t] of Object.entries(this.uniforms)) this.threeMaterial.uniforms[e] ? this.threeMaterial.uniforms[e].value = this.formatThreeUniformValue(t.value, t.type) : this.threeMaterial.uniforms[e] = { value: this.formatThreeUniformValue(t.value, t.type) };
			this.threeMaterial.vertexShader = this.vertexShader, this.threeMaterial.fragmentShader = this.fragmentShader, this.threeMaterial.needsUpdate = !0;
		}
	}
	formatThreeUniformValue(t, n) {
		return t instanceof I ? new e.Color(t.r, t.g, t.b) : n === "color" && typeof t == "string" ? new e.Color(t) : n === "color" && Array.isArray(t) ? new e.Color(t[0], t[1], t[2]) : n === "vec2" && Array.isArray(t) ? new e.Vector2(t[0], t[1]) : n === "vec3" && Array.isArray(t) ? new e.Vector3(t[0], t[1], t[2]) : n === "vec4" && Array.isArray(t) ? new e.Vector4(t[0], t[1], t[2], t[3]) : t;
	}
	clone() {
		let e = {};
		for (let [t, n] of Object.entries(this.uniforms)) e[t] = {
			type: n.type,
			value: Array.isArray(n.value) ? [...n.value] : n.value instanceof I ? new I(n.value.r, n.value.g, n.value.b, n.value.a) : n.value
		};
		return new t(`${this.name} Copy`, {
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader,
			uniforms: e,
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
			uniforms: Object.fromEntries(Object.entries(this.uniforms).map(([e, t]) => [e, {
				type: t.type,
				value: t.value instanceof I ? t.value.toHex() : t.value
			}]))
		};
	}
	static fromJSON(e) {
		let n = new t(e.name, {
			vertexShader: e.vertexShader,
			fragmentShader: e.fragmentShader,
			transparent: e.transparent,
			wireframe: e.wireframe,
			side: e.side,
			blending: e.blending,
			depthWrite: e.depthWrite,
			depthTest: e.depthTest
		});
		if (e.uniforms) for (let [t, r] of Object.entries(e.uniforms)) r.type === "color" && typeof r.value == "string" ? n.setUniform(t, new I().setHex(r.value), "color") : n.setUniform(t, r.value, r.type);
		return n;
	}
	static DEFAULT_VERTEX_SHADER = "\n    varying vec2 vUv;\n    varying vec3 vNormal;\n    varying vec3 vWorldNormal;\n    varying vec3 vLocalPosition;\n    varying vec3 vWorldPosition;\n    varying vec3 vViewPosition;\n\n    void main() {\n      vUv = uv;\n      vLocalPosition = position;\n      vNormal = normalize(normalMatrix * normal);\n      vWorldNormal = normalize(mat3(modelMatrix) * normal);\n      \n      // Local Space -> World Space Matrix Transform\n      vec4 worldPos = modelMatrix * vec4(position, 1.0);\n      vWorldPosition = worldPos.xyz;\n\n      // World Space -> View/Camera Space Matrix Transform\n      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\n      vViewPosition = -mvPosition.xyz;\n\n      // View Space -> Clip Space Projection Matrix Transform\n      gl_Position = projectionMatrix * mvPosition;\n    }\n  ";
	static DEFAULT_FRAGMENT_SHADER = "\n    uniform vec4 u_color;\n    uniform float u_time;\n    varying vec2 vUv;\n    varying vec3 vNormal;\n    varying vec3 vWorldNormal;\n    varying vec3 vWorldPosition;\n    varying vec3 vLocalPosition;\n\n    void main() {\n      vec3 lightDir = normalize(vec3(1.0, 2.0, 1.0));\n      float diff = max(dot(vWorldNormal, lightDir), 0.2);\n      gl_FragColor = vec4(u_color.rgb * diff, u_color.a);\n    }\n  ";
}, Te = [
	"water",
	"dissolve",
	"hologram",
	"toon",
	"fresnel"
], Ee = class e {
	static createWaterShader() {
		return new we("Water Wave Shader", {
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
					value: new I(.1, .7, .9, .8),
					type: "color"
				},
				u_deepColor: {
					value: new I(.01, .15, .45, .95),
					type: "color"
				},
				u_waveSpeed: {
					value: 1.5,
					type: "float"
				},
				u_waveHeight: {
					value: .12,
					type: "float"
				},
				u_waveFrequency: {
					value: 4,
					type: "float"
				},
				u_foamColor: {
					value: new I(1, 1, 1, .9),
					type: "color"
				}
			},
			vertexShader: "\n        uniform float u_time;\n        uniform float u_useWorldSpace;\n        uniform float u_waveSpeed;\n        uniform float u_waveHeight;\n        uniform float u_waveFrequency;\n\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vWorldNormal;\n        varying vec3 vLocalPosition;\n        varying vec3 vWorldPosition;\n        varying float vWaveHeight;\n\n        void main() {\n          vUv = uv;\n          vLocalPosition = position;\n          \n          // Local Space -> World Space Matrix Transform\n          vec4 worldPos = modelMatrix * vec4(position, 1.0);\n\n          // Select space coordinates for wave evaluation (World Space vs Local Space)\n          vec2 calcCoords = mix(position.xz, worldPos.xz, step(0.5, u_useWorldSpace));\n\n          float wave1 = sin(calcCoords.x * u_waveFrequency + u_time * u_waveSpeed) * cos(calcCoords.y * u_waveFrequency * 0.8 + u_time * u_waveSpeed * 1.2);\n          float wave2 = sin(calcCoords.y * u_waveFrequency * 1.5 + u_time * u_waveSpeed * 0.9) * 0.5;\n          float displacement = (wave1 + wave2) * u_waveHeight;\n\n          vec3 pos = position;\n          pos.y += displacement;\n          vWaveHeight = displacement;\n\n          // Compute perturbed normal matrix transform\n          vec3 modifiedNormal = normal;\n          modifiedNormal.x -= cos(calcCoords.x * u_waveFrequency + u_time * u_waveSpeed) * u_waveHeight;\n          modifiedNormal.z -= sin(calcCoords.y * u_waveFrequency + u_time * u_waveSpeed) * u_waveHeight;\n          \n          vNormal = normalize(normalMatrix * modifiedNormal);\n          vWorldNormal = normalize(mat3(modelMatrix) * modifiedNormal);\n\n          vec4 finalWorldPos = modelMatrix * vec4(pos, 1.0);\n          vWorldPosition = finalWorldPos.xyz;\n          gl_Position = projectionMatrix * viewMatrix * finalWorldPos;\n        }\n      ",
			fragmentShader: "\n        uniform vec4 u_shallowColor;\n        uniform vec4 u_deepColor;\n        uniform vec4 u_foamColor;\n        uniform float u_time;\n\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vWorldNormal;\n        varying vec3 vWorldPosition;\n        varying float vWaveHeight;\n\n        void main() {\n          vec3 viewDir = normalize(cameraPosition - vWorldPosition);\n          float fresnel = pow(1.0 - max(dot(viewDir, vWorldNormal), 0.0), 2.5);\n\n          float t = clamp((vWaveHeight + 0.1) / 0.25, 0.0, 1.0);\n          vec4 waterColor = mix(u_deepColor, u_shallowColor, t);\n          waterColor = mix(waterColor, vec4(0.1, 0.8, 1.0, 1.0), fresnel * 0.4);\n\n          // Specular highlight in world space\n          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));\n          vec3 halfDir = normalize(lightDir + viewDir);\n          float spec = pow(max(dot(vWorldNormal, halfDir), 0.0), 64.0);\n\n          // Foam peak\n          float foam = smoothstep(0.08, 0.12, vWaveHeight);\n          vec4 finalColor = mix(waterColor, u_foamColor, foam * 0.6);\n          finalColor.rgb += vec3(spec * 0.8);\n\n          gl_FragColor = finalColor;\n        }\n      "
		});
	}
	static createDissolveShader() {
		return new we("Dissolve Noise Shader", {
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
					value: .35,
					type: "float"
				},
				u_edgeWidth: {
					value: .08,
					type: "float"
				},
				u_edgeColor: {
					value: new I(1, .4, 0, 1),
					type: "color"
				},
				u_baseColor: {
					value: new I(.2, .6, 1, 1),
					type: "color"
				},
				u_noiseScale: {
					value: 8,
					type: "float"
				}
			},
			vertexShader: "\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vWorldNormal;\n        varying vec3 vLocalPosition;\n        varying vec3 vWorldPosition;\n\n        void main() {\n          vUv = uv;\n          vLocalPosition = position;\n          vNormal = normalize(normalMatrix * normal);\n          vWorldNormal = normalize(mat3(modelMatrix) * normal);\n          \n          vec4 worldPos = modelMatrix * vec4(position, 1.0);\n          vWorldPosition = worldPos.xyz;\n          gl_Position = projectionMatrix * viewMatrix * worldPos;\n        }\n      ",
			fragmentShader: "\n        uniform float u_dissolve;\n        uniform float u_edgeWidth;\n        uniform float u_useWorldSpace;\n        uniform vec4 u_edgeColor;\n        uniform vec4 u_baseColor;\n        uniform float u_noiseScale;\n\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vWorldNormal;\n        varying vec3 vLocalPosition;\n        varying vec3 vWorldPosition;\n\n        // Procedural 2D Noise\n        float hash(vec2 p) {\n          p = fract(p * vec2(123.34, 456.21));\n          p += dot(p, p + 45.32);\n          return fract(p.x * p.y);\n        }\n\n        float noise(vec2 p) {\n          vec2 i = floor(p);\n          vec2 f = fract(p);\n          f = f * f * (3.0 - 2.0 * f);\n          float a = hash(i);\n          float b = hash(i + vec2(1.0, 0.0));\n          float c = hash(i + vec2(0.0, 1.0));\n          float d = hash(i + vec2(1.0, 1.0));\n          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n        }\n\n        void main() {\n          vec2 noiseCoords = mix(vUv, vWorldPosition.xz, step(0.5, u_useWorldSpace));\n          float n = noise(noiseCoords * u_noiseScale);\n          \n          if (n < u_dissolve) {\n            discard;\n          }\n\n          vec3 lightDir = normalize(vec3(1.0, 2.0, 1.0));\n          float diff = max(dot(vWorldNormal, lightDir), 0.3);\n          vec4 color = vec4(u_baseColor.rgb * diff, u_baseColor.a);\n\n          if (n < u_dissolve + u_edgeWidth) {\n            float edgeT = (n - u_dissolve) / u_edgeWidth;\n            color = mix(u_edgeColor * 2.0, color, edgeT);\n          }\n\n          gl_FragColor = color;\n        }\n      "
		});
	}
	static createHologramShader() {
		return new we("Cyber Hologram Shader", {
			transparent: !0,
			side: "double",
			blending: "additive",
			uniforms: {
				u_time: {
					value: 0,
					type: "float"
				},
				u_hologramColor: {
					value: new I(0, .9, 1, .85),
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
					value: .03,
					type: "float"
				}
			},
			vertexShader: "\n        uniform float u_time;\n        uniform float u_glitchIntensity;\n\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vWorldNormal;\n        varying vec3 vLocalPosition;\n        varying vec3 vWorldPosition;\n\n        void main() {\n          vUv = uv;\n          vLocalPosition = position;\n          vNormal = normalize(normalMatrix * normal);\n          vWorldNormal = normalize(mat3(modelMatrix) * normal);\n          \n          vec3 pos = position;\n          // Local Space glitch displacement transform\n          float glitch = sin(pos.y * 30.0 + u_time * 10.0) * u_glitchIntensity * step(0.85, sin(u_time * 4.0));\n          pos.x += glitch;\n\n          vec4 worldPos = modelMatrix * vec4(pos, 1.0);\n          vWorldPosition = worldPos.xyz;\n          gl_Position = projectionMatrix * viewMatrix * worldPos;\n        }\n      ",
			fragmentShader: "\n        uniform vec4 u_hologramColor;\n        uniform float u_time;\n        uniform float u_fresnelPower;\n        uniform float u_scanlineSpeed;\n        uniform float u_scanlineCount;\n\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vWorldNormal;\n        varying vec3 vWorldPosition;\n\n        void main() {\n          vec3 viewDir = normalize(cameraPosition - vWorldPosition);\n          float fresnel = pow(1.0 - max(dot(viewDir, vWorldNormal), 0.0), u_fresnelPower);\n\n          float scanline = sin(vUv.y * u_scanlineCount - u_time * u_scanlineSpeed) * 0.5 + 0.5;\n          scanline = smoothstep(0.2, 0.8, scanline);\n\n          float alpha = (fresnel * 0.7 + scanline * 0.3) * u_hologramColor.a;\n          vec3 finalColor = u_hologramColor.rgb * (fresnel + scanline * 0.6 + 0.2);\n\n          gl_FragColor = vec4(finalColor, alpha);\n        }\n      "
		});
	}
	static createToonShader() {
		return new we("Toon Cel Shader", {
			uniforms: {
				u_time: {
					value: 0,
					type: "float"
				},
				u_baseColor: {
					value: new I(.9, .3, .2, 1),
					type: "color"
				},
				u_shadowColor: {
					value: new I(.3, .1, .2, 1),
					type: "color"
				},
				u_lightDirection: {
					value: [
						.5,
						1,
						.5
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
			vertexShader: "\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vWorldNormal;\n        varying vec3 vLocalPosition;\n        varying vec3 vWorldPosition;\n\n        void main() {\n          vUv = uv;\n          vLocalPosition = position;\n          vNormal = normalize(normalMatrix * normal);\n          vWorldNormal = normalize(mat3(modelMatrix) * normal);\n          vec4 worldPos = modelMatrix * vec4(position, 1.0);\n          vWorldPosition = worldPos.xyz;\n          gl_Position = projectionMatrix * viewMatrix * worldPos;\n        }\n      ",
			fragmentShader: "\n        uniform vec4 u_baseColor;\n        uniform vec4 u_shadowColor;\n        uniform vec3 u_lightDirection;\n        uniform float u_steps;\n        uniform float u_rimPower;\n\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vWorldNormal;\n        varying vec3 vWorldPosition;\n\n        void main() {\n          vec3 L = normalize(u_lightDirection);\n          float NdotL = max(dot(vWorldNormal, L), 0.0);\n\n          // Step lighting calculation in world space\n          float toonLight = floor(NdotL * u_steps) / u_steps;\n          toonLight = max(toonLight, 0.15);\n\n          vec3 toonColor = mix(u_shadowColor.rgb, u_baseColor.rgb, toonLight);\n\n          // Rim outline glow\n          vec3 V = normalize(cameraPosition - vWorldPosition);\n          float rim = 1.0 - max(dot(V, vWorldNormal), 0.0);\n          rim = pow(rim, u_rimPower);\n          rim = step(0.65, rim);\n\n          vec3 finalColor = toonColor + vec3(rim * 0.4);\n          gl_FragColor = vec4(finalColor, u_baseColor.a);\n        }\n      "
		});
	}
	static createFresnelGlowShader() {
		return new we("Glowing Fresnel Rim Shader", {
			transparent: !0,
			blending: "additive",
			uniforms: {
				u_time: {
					value: 0,
					type: "float"
				},
				u_innerColor: {
					value: new I(.1, .1, .3, .5),
					type: "color"
				},
				u_glowColor: {
					value: new I(.9, .2, 1, 1),
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
			vertexShader: "\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vWorldNormal;\n        varying vec3 vLocalPosition;\n        varying vec3 vWorldPosition;\n\n        void main() {\n          vUv = uv;\n          vLocalPosition = position;\n          vNormal = normalize(normalMatrix * normal);\n          vWorldNormal = normalize(mat3(modelMatrix) * normal);\n          vec4 worldPos = modelMatrix * vec4(position, 1.0);\n          vWorldPosition = worldPos.xyz;\n          gl_Position = projectionMatrix * viewMatrix * worldPos;\n        }\n      ",
			fragmentShader: "\n        uniform vec4 u_innerColor;\n        uniform vec4 u_glowColor;\n        uniform float u_fresnelPower;\n        uniform float u_pulseSpeed;\n        uniform float u_time;\n\n        varying vec2 vUv;\n        varying vec3 vNormal;\n        varying vec3 vWorldNormal;\n        varying vec3 vWorldPosition;\n\n        void main() {\n          vec3 V = normalize(cameraPosition - vWorldPosition);\n          float fresnel = pow(1.0 - max(dot(V, vWorldNormal), 0.0), u_fresnelPower);\n\n          float pulse = (sin(u_time * u_pulseSpeed) * 0.5 + 0.5) * 0.4 + 0.8;\n          fresnel *= pulse;\n\n          vec4 color = mix(u_innerColor, u_glowColor, fresnel);\n          color.rgb *= fresnel * 2.0;\n\n          gl_FragColor = vec4(color.rgb, fresnel * u_glowColor.a);\n        }\n      "
		});
	}
	static getPreset(t) {
		switch (t) {
			case "water": return e.createWaterShader();
			case "dissolve": return e.createDissolveShader();
			case "hologram": return e.createHologramShader();
			case "toon": return e.createToonShader();
			case "fresnel": return e.createFresnelGlowShader();
			default: return e.createWaterShader();
		}
	}
}, De = {
	Opaque: 2e3,
	AlphaTest: 2450,
	Transparent: 3e3
}, Oe = class e {
	id;
	name;
	color = new I(1, 1, 1, 1);
	roughness = .5;
	metalness = .1;
	emissive = new I(0, 0, 0, 1);
	wireframe = !1;
	transparent = !1;
	opacity = 1;
	mapUrl = null;
	normalMapUrl = null;
	shaderGraphNodes = [];
	isShaderMaterial = !1;
	customShaderMaterial = null;
	constructor(e = "Standard Material") {
		this.name = e, this.id = `mat_${Math.random().toString(36).substring(2, 9)}`;
	}
	setShaderPreset(e) {
		return this.customShaderMaterial = Ee.getPreset(e), this.isShaderMaterial = !0, this.name = `${this.customShaderMaterial.name}`, this.transparent = this.customShaderMaterial.transparent, this.wireframe = this.customShaderMaterial.wireframe, this.customShaderMaterial;
	}
	setCustomShader(e) {
		this.customShaderMaterial = e, this.isShaderMaterial = !0, this.name = e.name, this.transparent = e.transparent, this.wireframe = e.wireframe;
	}
	clone() {
		let t = new e(this.name + " Copy");
		return t.color = new I(this.color.r, this.color.g, this.color.b, this.color.a), t.roughness = this.roughness, t.metalness = this.metalness, t.emissive = new I(this.emissive.r, this.emissive.g, this.emissive.b, this.emissive.a), t.wireframe = this.wireframe, t.transparent = this.transparent, t.opacity = this.opacity, t.mapUrl = this.mapUrl, t.normalMapUrl = this.normalMapUrl, t.isShaderMaterial = this.isShaderMaterial, this.customShaderMaterial && (t.customShaderMaterial = this.customShaderMaterial.clone()), t;
	}
}, ke = class {
	static compile(e) {
		let t = {
			u_time: {
				value: 0,
				type: "float"
			},
			u_resolution: {
				value: [1e3, 800],
				type: "vec2"
			}
		}, n = e.nodes.find((e) => e.type === "master_output"), r = "", i = !1, a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set(), s = (t, n) => e.connections.find((e) => e.toNodeId === t && e.toPortId === n), c = (n) => {
			if (o.has(n)) return;
			o.add(n);
			let l = e.nodes.find((e) => e.id === n);
			if (!l) return;
			for (let e of l.inputs) {
				let t = s(l.id, e.id);
				t && c(t.fromNodeId);
			}
			let u = (e, t = "0.0") => {
				let n = s(l.id, e);
				if (n && a.has(`${n.fromNodeId}_${n.fromPortId}`)) return a.get(`${n.fromNodeId}_${n.fromPortId}`);
				if (l.properties && l.properties[e] !== void 0) {
					let n = l.properties[e];
					return typeof n == "number" ? n.toFixed(3) : t;
				}
				return t;
			};
			switch (l.type) {
				case "input_time": {
					let e = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${e}`, "u_time");
					break;
				}
				case "input_uv": {
					let e = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${e}`, "vUv");
					break;
				}
				case "input_local_pos": {
					let e = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${e}`, "vLocalPosition");
					break;
				}
				case "input_world_pos": {
					let e = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${e}`, "vWorldPosition");
					break;
				}
				case "input_view_pos": {
					let e = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${e}`, "vViewPosition");
					break;
				}
				case "input_world_normal": {
					let e = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${e}`, "vWorldNormal");
					break;
				}
				case "space_conversion": {
					let e = l.properties?.mode || "localToWorld", t = u("in", "vLocalPosition"), n = `space_${l.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
					e === "localToWorld" ? r += `  vec3 ${n} = vWorldPosition;\n` : e === "worldToView" ? r += `  vec3 ${n} = vViewPosition;\n` : r += `  vec3 ${n} = ${t};\n`;
					let i = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${i}`, n);
					break;
				}
				case "matrix_transform": {
					let e = l.properties?.matrix || "modelMatrix", t = u("in", "vec4(vLocalPosition, 1.0)"), n = `matTx_${l.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
					e === "normalMatrix" ? r += `  vec3 ${n} = normalize(vNormal);\n` : r += `  vec4 ${n} = ${e} * vec4(${t});\n`;
					let i = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${i}`, n);
					break;
				}
				case "input_color": {
					let e = l.properties?.color || "#38bdf8", n = `u_color_${l.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
					t[n] = {
						value: new I().setHex(e),
						type: "color"
					};
					let r = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${r}`, n);
					break;
				}
				case "input_float": {
					let e = l.properties?.value ?? 1, n = `u_float_${l.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
					t[n] = {
						value: e,
						type: "float"
					};
					let r = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${r}`, n);
					break;
				}
				case "input_noise": {
					i ||= !0;
					let e = u("uv", "vUv"), t = u("scale", "8.0"), n = `noise_${l.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
					r += `  float ${n} = noise(${e} * ${t});\n`;
					let o = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${o}`, n);
					break;
				}
				case "fresnel": {
					let e = u("power", "2.0"), t = `fresnel_${l.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
					r += `  vec3 V_${l.id} = normalize(cameraPosition - vWorldPosition);\n`, r += `  float ${t} = pow(1.0 - max(dot(V_${l.id}, vWorldNormal), 0.0), ${e});\n`;
					let n = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${n}`, t);
					break;
				}
				case "math_add": {
					let e = u("a", "0.0"), t = u("b", "0.0"), n = `add_${l.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
					r += `  vec4 ${n} = vec4(${e}) + vec4(${t});\n`;
					let i = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${i}`, `${n}`);
					break;
				}
				case "math_multiply": {
					let e = u("a", "1.0"), t = u("b", "1.0"), n = `mul_${l.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
					r += `  vec4 ${n} = vec4(${e}) * vec4(${t});\n`;
					let i = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${i}`, `${n}`);
					break;
				}
				case "math_sin": {
					let e = u("in", "u_time"), t = `sin_${l.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
					r += `  float ${t} = sin(${e}) * 0.5 + 0.5;\n`;
					let n = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${n}`, t);
					break;
				}
				case "math_step": {
					let e = u("edge", "0.5"), t = u("in", "0.0"), n = `step_${l.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
					r += `  float ${n} = step(${e}, ${t});\n`;
					let i = l.outputs[0]?.id || "out";
					a.set(`${l.id}_${i}`, n);
					break;
				}
				case "master_output": {
					let e = u("color", "vec4(0.2, 0.6, 1.0, 1.0)"), t = u("alpha", "1.0");
					r += `  vec4 finalCol = vec4(${e});\n`, r += `  finalCol.a *= ${t};\n`, r += "  gl_FragColor = finalCol;\n";
					break;
				}
			}
		};
		n ? c(n.id) : r += "  gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0);\n";
		let l = i ? "\n      float hash(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        f = f * f * (3.0 - 2.0 * f);\n        float a = hash(i);\n        float b = hash(i + vec2(1.0, 0.0));\n        float c = hash(i + vec2(0.0, 1.0));\n        float d = hash(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n      }\n    " : "", u = Object.keys(t).map((e) => {
			let n = t[e].type;
			return `uniform ${n === "color" ? "vec4" : n === "float" ? "float" : n === "vec2" ? "vec2" : n === "vec3" ? "vec3" : "vec4"} ${e};`;
		}).join("\n");
		return {
			vertexShader: we.DEFAULT_VERTEX_SHADER,
			fragmentShader: `
      ${u}
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vLocalPosition;
      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;

      ${l}

      void main() {
${r}
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
}, Ae = {
	Directional: "DIRECTIONAL",
	Point: "POINT",
	Spot: "SPOT",
	Ambient: "AMBIENT"
}, je = class {
	type = Ae.Directional;
	color = new I(1, 1, 1, 1);
	intensity = 1;
	shadowCast = !0;
	range = 10;
	spotAngle = Math.PI / 4;
	constructor(e = Ae.Directional) {
		this.type = e;
	}
}, Me = class {
	color = new I(.1, .12, .18, 1);
	sunDirection = new F(.5, 1, .5).normalize();
	fogEnabled = !0;
	fogColor = new I(.1, .12, .18, 1);
	fogNear = 10;
	fogFar = 100;
}, Ne = class {
	mesh;
	maxParticles;
	dummy = new e.Object3D();
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
	constructor(t = 1e3, n = 16777215) {
		this.maxParticles = t;
		let r = new e.SphereGeometry(.1, 8, 8), i = new e.MeshStandardMaterial({
			color: n,
			emissive: n,
			emissiveIntensity: .8,
			roughness: .2,
			transparent: !0,
			opacity: .9
		});
		this.mesh = new e.InstancedMesh(r, i, t), this.mesh.instanceMatrix.setUsage(e.DynamicDrawUsage), this.mesh.count = 0, this.mesh.instanceColor = new e.InstancedBufferAttribute(new Float32Array(t * 3), 3), this.mesh.instanceColor.setUsage(e.DynamicDrawUsage), this.positionsX = new Float32Array(t), this.positionsY = new Float32Array(t), this.positionsZ = new Float32Array(t), this.velocitiesX = new Float32Array(t), this.velocitiesY = new Float32Array(t), this.velocitiesZ = new Float32Array(t), this.colors = new Int32Array(t), this.sizes = new Float32Array(t), this.lives = new Float32Array(t), this.maxLives = new Float32Array(t);
	}
	emitBurst(e, t, n = 30) {
		let r = Array.isArray(e) ? e[0] : e.x, i = Array.isArray(e) ? e[1] : e.y, a = Array.isArray(e) ? e[2] : e.z;
		for (let e = 0; e < n && !(this.activeCount >= this.maxParticles); e++) {
			let e = this.activeCount++;
			this.positionsX[e] = r, this.positionsY[e] = i, this.positionsZ[e] = a, this.lives[e] = 0;
			let n = 16436245;
			if (t === "collect_burst") this.maxLives[e] = .6 + Math.random() * .4, this.velocitiesX[e] = (Math.random() - .5) * 6, this.velocitiesY[e] = Math.random() * 5 + 2, this.velocitiesZ[e] = (Math.random() - .5) * 6, n = 1096065, this.sizes[e] = .2 + Math.random() * .2;
			else if (t === "explosion") this.maxLives[e] = .5 + Math.random() * .5, this.velocitiesX[e] = (Math.random() - .5) * 12, this.velocitiesY[e] = Math.random() * 8 + 3, this.velocitiesZ[e] = (Math.random() - .5) * 12, n = Math.random() > .5 ? 15680580 : 16096779, this.sizes[e] = .3 + Math.random() * .3;
			else if (t === "teleport_flash") {
				this.maxLives[e] = .8;
				let t = Math.random() * Math.PI * 2, r = Math.random() * 1.5;
				this.velocitiesX[e] = Math.cos(t) * r, this.velocitiesY[e] = Math.random() * 6 + 2, this.velocitiesZ[e] = Math.sin(t) * r, n = 11032055, this.sizes[e] = .25;
			} else if (t === "dust_footstep") this.maxLives[e] = .4, this.velocitiesX[e] = (Math.random() - .5) * 1.5, this.velocitiesY[e] = Math.random() * 1, this.velocitiesZ[e] = (Math.random() - .5) * 1.5, n = 13948120, this.sizes[e] = .15;
			else if (t === "portal_swirl") {
				this.maxLives[e] = 1.2;
				let t = Math.random() * Math.PI * 2;
				this.velocitiesX[e] = Math.cos(t) * 2, this.velocitiesY[e] = Math.random() * 3 + 1, this.velocitiesZ[e] = Math.sin(t) * 2, n = 3900150, this.sizes[e] = .2;
			} else this.maxLives[e] = .7, this.velocitiesX[e] = (Math.random() - .5) * 3, this.velocitiesY[e] = Math.random() * 4, this.velocitiesZ[e] = (Math.random() - .5) * 3, n = 16436245, this.sizes[e] = .2;
			this.colors[e] = n, this.writeInstanceColor(e, n);
		}
	}
	writeInstanceColor(e, t) {
		if (!this.mesh.instanceColor) return;
		let n = this.mesh.instanceColor.array;
		n[e * 3 + 0] = (t >> 16 & 255) / 255, n[e * 3 + 1] = (t >> 8 & 255) / 255, n[e * 3 + 2] = (t & 255) / 255;
	}
	update(e) {
		let t = 0;
		for (let n = 0; n < this.activeCount; n++) {
			if (this.lives[n] += e, this.lives[n] >= this.maxLives[n]) continue;
			this.positionsX[n] += this.velocitiesX[n] * e, this.positionsY[n] += this.velocitiesY[n] * e, this.positionsZ[n] += this.velocitiesZ[n] * e, this.velocitiesY[n] -= 9.81 * e * .3;
			let r = this.lives[n] / this.maxLives[n], i = this.sizes[n] * (1 - r), a = this.positionsX[n], o = this.positionsY[n], s = this.positionsZ[n], c = this.mesh.instanceMatrix.array, l = t * 16;
			if (c[l + 0] = i, c[l + 1] = 0, c[l + 2] = 0, c[l + 3] = 0, c[l + 4] = 0, c[l + 5] = i, c[l + 6] = 0, c[l + 7] = 0, c[l + 8] = 0, c[l + 9] = 0, c[l + 10] = i, c[l + 11] = 0, c[l + 12] = a, c[l + 13] = o, c[l + 14] = s, c[l + 15] = 1, t !== n) {
				this.positionsX[t] = this.positionsX[n], this.positionsY[t] = this.positionsY[n], this.positionsZ[t] = this.positionsZ[n], this.velocitiesX[t] = this.velocitiesX[n], this.velocitiesY[t] = this.velocitiesY[n], this.velocitiesZ[t] = this.velocitiesZ[n], this.colors[t] = this.colors[n], this.sizes[t] = this.sizes[n], this.lives[t] = this.lives[n], this.maxLives[t] = this.maxLives[n];
				let e = this.mesh.instanceColor;
				e && (e.array[t * 3 + 0] = e.array[n * 3 + 0], e.array[t * 3 + 1] = e.array[n * 3 + 1], e.array[t * 3 + 2] = e.array[n * 3 + 2]);
			}
			t++;
		}
		this.activeCount = t, this.mesh.count = t, this.mesh.instanceMatrix.needsUpdate = !0, this.mesh.instanceColor && (this.mesh.instanceColor.needsUpdate = !0);
	}
}, Pe = class {
	camera;
	target = new e.Vector3();
	distance = 6;
	minDistance = 2;
	maxDistance = 20;
	heightOffset = 1.5;
	pitch = .35;
	yaw = Math.PI;
	lerpSpeed = 10;
	enableCollisionAvoidance = !0;
	currentPosition = new e.Vector3();
	currentTarget = new e.Vector3();
	shakeOffset = new e.Vector3();
	shakeTimeRemaining = 0;
	shakeIntensity = 0;
	shakeDecay = 1;
	activeShot = null;
	shotTimer = 0;
	trackingTarget = null;
	constructor(e) {
		this.camera = e, this.currentPosition.copy(this.camera.position), this.currentTarget.copy(this.target);
	}
	setTargetPosition(e) {
		this.target.set(e.x, e.y + this.heightOffset, e.z);
	}
	rotate(e, t) {
		this.yaw += e, this.pitch = Math.max(.05, Math.min(Math.PI / 2 - .05, this.pitch + t));
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
	panTo(e, t, n, r = 3) {
		this.activeShot = {
			type: "pan",
			fromPos: e.clone(),
			toPos: t.clone(),
			targetPos: n.clone(),
			duration: r
		}, this.shotTimer = 0, this.camera.position.copy(e), this.currentPosition.copy(e), this.target.copy(n), this.currentTarget.copy(n);
	}
	orbitShot(e, t = 8, n = 1, r = 5) {
		this.activeShot = {
			type: "orbit",
			targetPos: e.clone(),
			radius: t,
			speed: n,
			duration: r
		}, this.shotTimer = 0, this.target.copy(e), this.currentTarget.copy(e);
	}
	dollyZoom(e = 30, t = 2.5) {
		if (this.camera.isPerspectiveCamera) {
			let n = this.camera;
			this.activeShot = {
				type: "dolly",
				fov: e,
				fromPos: n.position.clone(),
				duration: t
			}, this.shotTimer = 0;
		}
	}
	craneShot(e, t, n = 4) {
		this.panTo(e, t, this.target, n);
	}
	trackObject(e, t = 8) {
		this.trackingTarget = e, this.lerpSpeed = t;
	}
	update(t, n = []) {
		if (this.activeShot) {
			this.shotTimer += t;
			let e = Math.min(1, this.shotTimer / (this.activeShot.duration || 1)), n = .5 - Math.cos(e * Math.PI) / 2;
			if (this.activeShot.type === "pan" && this.activeShot.fromPos && this.activeShot.toPos) this.currentPosition.lerpVectors(this.activeShot.fromPos, this.activeShot.toPos, n), this.activeShot.targetPos && (this.target.copy(this.activeShot.targetPos), this.currentTarget.copy(this.activeShot.targetPos));
			else if (this.activeShot.type === "orbit" && this.activeShot.targetPos) {
				let e = this.shotTimer * (this.activeShot.speed || 1), t = this.activeShot.radius || 8;
				this.currentPosition.x = this.activeShot.targetPos.x + Math.sin(e) * t, this.currentPosition.y = this.activeShot.targetPos.y + 3, this.currentPosition.z = this.activeShot.targetPos.z + Math.cos(e) * t, this.target.copy(this.activeShot.targetPos), this.currentTarget.copy(this.activeShot.targetPos);
			} else if (this.activeShot.type === "dolly" && this.camera.isPerspectiveCamera) {
				let e = this.camera;
				e.fov += ((this.activeShot.fov || 30) - e.fov) * Math.min(1, 4 * t), e.updateProjectionMatrix();
			}
			e >= 1 && (this.activeShot = null), this.camera.position.copy(this.currentPosition), this.camera.lookAt(this.currentTarget);
			return;
		}
		if (this.trackingTarget) {
			let e = "position" in this.trackingTarget ? this.trackingTarget.position : this.trackingTarget;
			this.setTargetPosition(e);
		}
		let r = Math.min(.1, Math.max(.001, t)), i = 1 - Math.exp(-this.lerpSpeed * r);
		this.currentTarget.lerp(this.target, i);
		let a = this.currentTarget.x + this.distance * Math.sin(this.yaw) * Math.cos(this.pitch), o = this.currentTarget.y + this.distance * Math.sin(this.pitch), s = this.currentTarget.z + this.distance * Math.cos(this.yaw) * Math.cos(this.pitch), c = new e.Vector3(a, o, s);
		if (this.enableCollisionAvoidance && n.length > 0) {
			let t = c.clone().sub(this.currentTarget).normalize(), r = new e.Raycaster(this.currentTarget, t, .1, this.distance).intersectObjects(n, !0);
			if (r.length > 0) {
				let e = r[0].distance - .3;
				e < this.distance && c.copy(this.currentTarget).add(t.multiplyScalar(Math.max(this.minDistance, e)));
			}
		}
		if (this.currentPosition.lerp(c, i), this.shakeTimeRemaining > 0) {
			this.shakeTimeRemaining -= t;
			let e = this.shakeIntensity * (this.shakeTimeRemaining > 0 ? this.shakeTimeRemaining * this.shakeDecay : 0);
			this.shakeOffset.set((Math.random() - .5) * 2 * e, (Math.random() - .5) * 2 * e, (Math.random() - .5) * 2 * e);
		} else this.shakeOffset.set(0, 0, 0);
		this.camera.position.copy(this.currentPosition).add(this.shakeOffset), this.camera.lookAt(this.currentTarget);
	}
}, Fe = {
	name: "CopyShader",
	uniforms: {
		tDiffuse: { value: null },
		opacity: { value: 1 }
	},
	vertexShader: "\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vUv = uv;\n			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n		}",
	fragmentShader: "\n\n		uniform float opacity;\n\n		uniform sampler2D tDiffuse;\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vec4 texel = texture2D( tDiffuse, vUv );\n			gl_FragColor = opacity * texel;\n\n\n		}"
}, V = class {
	constructor() {
		this.isPass = !0, this.enabled = !0, this.needsSwap = !0, this.clear = !1, this.renderToScreen = !1;
	}
	setSize() {}
	render() {
		console.error("THREE.Pass: .render() must be implemented in derived pass.");
	}
	dispose() {}
}, Ie = new S(-1, 1, 1, -1, 0, 1), Le = new class extends i {
	constructor() {
		super(), this.setAttribute("position", new d([
			-1,
			3,
			0,
			-1,
			-1,
			0,
			3,
			-1,
			0
		], 3)), this.setAttribute("uv", new d([
			0,
			2,
			0,
			0,
			2,
			0
		], 2));
	}
}(), Re = class {
	constructor(e) {
		this._mesh = new h(Le, e);
	}
	dispose() {
		this._mesh.geometry.dispose();
	}
	render(e) {
		e.render(this._mesh, Ie);
	}
	get material() {
		return this._mesh.material;
	}
	set material(e) {
		this._mesh.material = e;
	}
}, ze = class extends V {
	constructor(e, t = "tDiffuse") {
		super(), this.textureID = t, this.uniforms = null, this.material = null, e instanceof D ? (this.uniforms = e.uniforms, this.material = e) : e && (this.uniforms = O.clone(e.uniforms), this.material = new D({
			name: e.name === void 0 ? "unspecified" : e.name,
			defines: Object.assign({}, e.defines),
			uniforms: this.uniforms,
			vertexShader: e.vertexShader,
			fragmentShader: e.fragmentShader
		})), this._fsQuad = new Re(this.material);
	}
	render(e, t, n) {
		this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = n.texture), this._fsQuad.material = this.material, this.renderToScreen ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(t), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this._fsQuad.render(e));
	}
	dispose() {
		this.material.dispose(), this._fsQuad.dispose();
	}
}, Be = class extends V {
	constructor(e, t) {
		super(), this.scene = e, this.camera = t, this.clear = !0, this.needsSwap = !1, this.inverse = !1;
	}
	render(e, t, n) {
		let r = e.getContext(), i = e.state;
		i.buffers.color.setMask(!1), i.buffers.depth.setMask(!1), i.buffers.color.setLocked(!0), i.buffers.depth.setLocked(!0);
		let a, o;
		this.inverse ? (a = 0, o = 1) : (a = 1, o = 0), i.buffers.stencil.setTest(!0), i.buffers.stencil.setOp(r.REPLACE, r.REPLACE, r.REPLACE), i.buffers.stencil.setFunc(r.ALWAYS, a, 4294967295), i.buffers.stencil.setClear(o), i.buffers.stencil.setLocked(!0), e.setRenderTarget(n), this.clear && e.clear(), e.render(this.scene, this.camera), e.setRenderTarget(t), this.clear && e.clear(), e.render(this.scene, this.camera), i.buffers.color.setLocked(!1), i.buffers.depth.setLocked(!1), i.buffers.color.setMask(!0), i.buffers.depth.setMask(!0), i.buffers.stencil.setLocked(!1), i.buffers.stencil.setFunc(r.EQUAL, 1, 4294967295), i.buffers.stencil.setOp(r.KEEP, r.KEEP, r.KEEP), i.buffers.stencil.setLocked(!0);
	}
}, Ve = class extends V {
	constructor() {
		super(), this.needsSwap = !1;
	}
	render(e) {
		e.state.buffers.stencil.setLocked(!1), e.state.buffers.stencil.setTest(!1);
	}
}, He = class {
	constructor(e, t) {
		if (this.renderer = e, this._pixelRatio = e.getPixelRatio(), t === void 0) {
			let n = e.getSize(new k());
			this._width = n.width, this._height = n.height, t = new j(this._width * this._pixelRatio, this._height * this._pixelRatio, { type: f }), t.texture.name = "EffectComposer.rt1";
		} else this._width = t.width, this._height = t.height;
		this.renderTarget1 = t, this.renderTarget2 = t.clone(), this.renderTarget2.texture.name = "EffectComposer.rt2", this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.renderToScreen = !0, this.passes = [], this.copyPass = new ze(Fe), this.copyPass.material.blending = x, this.timer = new ee();
	}
	swapBuffers() {
		let e = this.readBuffer;
		this.readBuffer = this.writeBuffer, this.writeBuffer = e;
	}
	addPass(e) {
		this.passes.push(e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
	}
	insertPass(e, t) {
		this.passes.splice(t, 0, e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
	}
	removePass(e) {
		let t = this.passes.indexOf(e);
		t !== -1 && this.passes.splice(t, 1);
	}
	isLastEnabledPass(e) {
		for (let t = e + 1; t < this.passes.length; t++) if (this.passes[t].enabled) return !1;
		return !0;
	}
	render(e) {
		this.timer.update(), e === void 0 && (e = this.timer.getDelta());
		let t = this.renderer.getRenderTarget(), n = !1;
		for (let t = 0, r = this.passes.length; t < r; t++) {
			let r = this.passes[t];
			if (r.enabled !== !1) {
				if (r.renderToScreen = this.renderToScreen && this.isLastEnabledPass(t), r.render(this.renderer, this.writeBuffer, this.readBuffer, e, n), r.needsSwap) {
					if (n) {
						let t = this.renderer.getContext(), n = this.renderer.state.buffers.stencil;
						n.setFunc(t.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e), n.setFunc(t.EQUAL, 1, 4294967295);
					}
					this.swapBuffers();
				}
				Be !== void 0 && (r instanceof Be ? n = !0 : r instanceof Ve && (n = !1));
			}
		}
		this.renderer.setRenderTarget(t);
	}
	reset(e) {
		if (e === void 0) {
			let t = this.renderer.getSize(new k());
			this._pixelRatio = this.renderer.getPixelRatio(), this._width = t.width, this._height = t.height, e = this.renderTarget1.clone(), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
		}
		this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.renderTarget1 = e, this.renderTarget2 = e.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2;
	}
	setSize(e, t) {
		this._width = e, this._height = t;
		let n = this._width * this._pixelRatio, r = this._height * this._pixelRatio;
		this.renderTarget1.setSize(n, r), this.renderTarget2.setSize(n, r);
		for (let e = 0; e < this.passes.length; e++) this.passes[e].setSize(n, r);
	}
	setPixelRatio(e) {
		this._pixelRatio = e, this.setSize(this._width, this._height);
	}
	dispose() {
		this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.copyPass.dispose();
	}
}, Ue = class extends V {
	constructor(e, t, n = null, r = null, i = null) {
		super(), this.scene = e, this.camera = t, this.overrideMaterial = n, this.clearColor = r, this.clearAlpha = i, this.clear = !0, this.clearDepth = !1, this.needsSwap = !1, this.isRenderPass = !0, this._oldClearColor = new o();
	}
	render(e, t, n) {
		let r = e.autoClear;
		e.autoClear = !1;
		let i, a;
		this.overrideMaterial !== null && (a = this.scene.overrideMaterial, this.scene.overrideMaterial = this.overrideMaterial), this.clearColor !== null && (e.getClearColor(this._oldClearColor), e.setClearColor(this.clearColor, e.getClearAlpha())), this.clearAlpha !== null && (i = e.getClearAlpha(), e.setClearAlpha(this.clearAlpha)), this.clearDepth == 1 && e.clearDepth(), e.setRenderTarget(this.renderToScreen ? null : n), this.clear === !0 && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), e.render(this.scene, this.camera), this.clearColor !== null && e.setClearColor(this._oldClearColor), this.clearAlpha !== null && e.setClearAlpha(i), this.overrideMaterial !== null && (this.scene.overrideMaterial = a), e.autoClear = r;
	}
}, We = {
	name: "LuminosityHighPassShader",
	uniforms: {
		tDiffuse: { value: null },
		luminosityThreshold: { value: 1 },
		smoothWidth: { value: 1 },
		defaultColor: { value: new o(0) },
		defaultOpacity: { value: 0 }
	},
	vertexShader: "\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vUv = uv;\n\n			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n		}",
	fragmentShader: "\n\n		uniform sampler2D tDiffuse;\n		uniform vec3 defaultColor;\n		uniform float defaultOpacity;\n		uniform float luminosityThreshold;\n		uniform float smoothWidth;\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vec4 texel = texture2D( tDiffuse, vUv );\n\n			float v = luminance( texel.xyz );\n\n			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );\n\n			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );\n\n			gl_FragColor = mix( outputColor, texel, alpha );\n\n		}"
}, Ge = class e extends V {
	constructor(e, t = 1, r, i) {
		super(), this.strength = t, this.radius = r, this.threshold = i, this.resolution = e === void 0 ? new k(256, 256) : new k(e.x, e.y), this.clearColor = new o(0, 0, 0), this.needsSwap = !1, this.renderTargetsHorizontal = [], this.renderTargetsVertical = [], this.nMips = 5;
		let a = Math.round(this.resolution.x / 2), s = Math.round(this.resolution.y / 2);
		this.renderTargetBright = new j(a, s, { type: f }), this.renderTargetBright.texture.name = "UnrealBloomPass.bright", this.renderTargetBright.texture.generateMipmaps = !1;
		for (let e = 0; e < this.nMips; e++) {
			let t = new j(a, s, { type: f });
			t.texture.name = "UnrealBloomPass.h" + e, t.texture.generateMipmaps = !1, this.renderTargetsHorizontal.push(t);
			let n = new j(a, s, { type: f });
			n.texture.name = "UnrealBloomPass.v" + e, n.texture.generateMipmaps = !1, this.renderTargetsVertical.push(n), a = Math.round(a / 2), s = Math.round(s / 2);
		}
		let c = We;
		this.highPassUniforms = O.clone(c.uniforms), this.highPassUniforms.luminosityThreshold.value = i, this.highPassUniforms.smoothWidth.value = .01, this.materialHighPassFilter = new D({
			uniforms: this.highPassUniforms,
			vertexShader: c.vertexShader,
			fragmentShader: c.fragmentShader
		}), this.separableBlurMaterials = [];
		let l = [
			6,
			10,
			14,
			18,
			22
		];
		a = Math.round(this.resolution.x / 2), s = Math.round(this.resolution.y / 2);
		for (let e = 0; e < this.nMips; e++) this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[e])), this.separableBlurMaterials[e].uniforms.invSize.value = new k(1 / a, 1 / s), a = Math.round(a / 2), s = Math.round(s / 2);
		this.compositeMaterial = this._getCompositeMaterial(this.nMips), this.compositeMaterial.uniforms.blurTexture1.value = this.renderTargetsVertical[0].texture, this.compositeMaterial.uniforms.blurTexture2.value = this.renderTargetsVertical[1].texture, this.compositeMaterial.uniforms.blurTexture3.value = this.renderTargetsVertical[2].texture, this.compositeMaterial.uniforms.blurTexture4.value = this.renderTargetsVertical[3].texture, this.compositeMaterial.uniforms.blurTexture5.value = this.renderTargetsVertical[4].texture, this.compositeMaterial.uniforms.bloomStrength.value = t, this.compositeMaterial.uniforms.bloomRadius.value = .1;
		let u = [
			1,
			.8,
			.6,
			.4,
			.2
		];
		this.compositeMaterial.uniforms.bloomFactors.value = u, this.bloomTintColors = [
			new A(1, 1, 1),
			new A(1, 1, 1),
			new A(1, 1, 1),
			new A(1, 1, 1),
			new A(1, 1, 1)
		], this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, this.copyUniforms = O.clone(Fe.uniforms), this.blendMaterial = new D({
			uniforms: this.copyUniforms,
			vertexShader: Fe.vertexShader,
			fragmentShader: Fe.fragmentShader,
			premultipliedAlpha: !0,
			blending: n,
			depthTest: !1,
			depthWrite: !1,
			transparent: !0
		}), this._oldClearColor = new o(), this._oldClearAlpha = 1, this._basic = new g(), this._fsQuad = new Re(null);
	}
	dispose() {
		for (let e = 0; e < this.renderTargetsHorizontal.length; e++) this.renderTargetsHorizontal[e].dispose();
		for (let e = 0; e < this.renderTargetsVertical.length; e++) this.renderTargetsVertical[e].dispose();
		this.renderTargetBright.dispose();
		for (let e = 0; e < this.separableBlurMaterials.length; e++) this.separableBlurMaterials[e].dispose();
		this.compositeMaterial.dispose(), this.blendMaterial.dispose(), this._basic.dispose(), this._fsQuad.dispose();
	}
	setSize(e, t) {
		let n = Math.round(e / 2), r = Math.round(t / 2);
		this.renderTargetBright.setSize(n, r);
		for (let e = 0; e < this.nMips; e++) this.renderTargetsHorizontal[e].setSize(n, r), this.renderTargetsVertical[e].setSize(n, r), this.separableBlurMaterials[e].uniforms.invSize.value = new k(1 / n, 1 / r), n = Math.round(n / 2), r = Math.round(r / 2);
	}
	render(t, n, r, i, a) {
		t.getClearColor(this._oldClearColor), this._oldClearAlpha = t.getClearAlpha();
		let o = t.autoClear;
		t.autoClear = !1, t.setClearColor(this.clearColor, 0), a && t.state.buffers.stencil.setTest(!1), this.renderToScreen && (this._fsQuad.material = this._basic, this._basic.map = r.texture, t.setRenderTarget(null), t.clear(), this._fsQuad.render(t)), this.highPassUniforms.tDiffuse.value = r.texture, this.highPassUniforms.luminosityThreshold.value = this.threshold, this._fsQuad.material = this.materialHighPassFilter, t.setRenderTarget(this.renderTargetBright), t.clear(), this._fsQuad.render(t);
		let s = this.renderTargetBright;
		for (let n = 0; n < this.nMips; n++) this._fsQuad.material = this.separableBlurMaterials[n], this.separableBlurMaterials[n].uniforms.colorTexture.value = s.texture, this.separableBlurMaterials[n].uniforms.direction.value = e.BlurDirectionX, t.setRenderTarget(this.renderTargetsHorizontal[n]), t.clear(), this._fsQuad.render(t), this.separableBlurMaterials[n].uniforms.colorTexture.value = this.renderTargetsHorizontal[n].texture, this.separableBlurMaterials[n].uniforms.direction.value = e.BlurDirectionY, t.setRenderTarget(this.renderTargetsVertical[n]), t.clear(), this._fsQuad.render(t), s = this.renderTargetsVertical[n];
		this._fsQuad.material = this.compositeMaterial, this.compositeMaterial.uniforms.bloomStrength.value = this.strength, this.compositeMaterial.uniforms.bloomRadius.value = this.radius, this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, t.setRenderTarget(this.renderTargetsHorizontal[0]), t.clear(), this._fsQuad.render(t), this._fsQuad.material = this.blendMaterial, this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture, a && t.state.buffers.stencil.setTest(!0), this.renderToScreen ? (t.setRenderTarget(null), this._fsQuad.render(t)) : (t.setRenderTarget(r), this._fsQuad.render(t)), t.setClearColor(this._oldClearColor, this._oldClearAlpha), t.autoClear = o;
	}
	_getSeparableBlurMaterial(e) {
		let t = [], n = e / 3;
		for (let r = 0; r < e; r++) t.push(.39894 * Math.exp(-.5 * r * r / (n * n)) / n);
		return new D({
			defines: { KERNEL_RADIUS: e },
			uniforms: {
				colorTexture: { value: null },
				invSize: { value: new k(.5, .5) },
				direction: { value: new k(.5, .5) },
				gaussianCoefficients: { value: t }
			},
			vertexShader: "\n\n				varying vec2 vUv;\n\n				void main() {\n\n					vUv = uv;\n					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n				}",
			fragmentShader: "\n\n				#include <common>\n\n				varying vec2 vUv;\n\n				uniform sampler2D colorTexture;\n				uniform vec2 invSize;\n				uniform vec2 direction;\n				uniform float gaussianCoefficients[KERNEL_RADIUS];\n\n				void main() {\n\n					float weightSum = gaussianCoefficients[0];\n					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;\n\n					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {\n\n						float x = float( i );\n						float w = gaussianCoefficients[i];\n						vec2 uvOffset = direction * invSize * x;\n						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;\n						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;\n						diffuseSum += ( sample1 + sample2 ) * w;\n\n					}\n\n					gl_FragColor = vec4( diffuseSum, 1.0 );\n\n				}"
		});
	}
	_getCompositeMaterial(e) {
		return new D({
			defines: { NUM_MIPS: e },
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
			vertexShader: "\n\n				varying vec2 vUv;\n\n				void main() {\n\n					vUv = uv;\n					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n				}",
			fragmentShader: "\n\n				varying vec2 vUv;\n\n				uniform sampler2D blurTexture1;\n				uniform sampler2D blurTexture2;\n				uniform sampler2D blurTexture3;\n				uniform sampler2D blurTexture4;\n				uniform sampler2D blurTexture5;\n				uniform float bloomStrength;\n				uniform float bloomRadius;\n				uniform float bloomFactors[NUM_MIPS];\n				uniform vec3 bloomTintColors[NUM_MIPS];\n\n				float lerpBloomFactor( const in float factor ) {\n\n					float mirrorFactor = 1.2 - factor;\n					return mix( factor, mirrorFactor, bloomRadius );\n\n				}\n\n				void main() {\n\n					// 3.0 for backwards compatibility with previous alpha-based intensity\n					vec3 bloom = 3.0 * bloomStrength * (\n						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +\n						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +\n						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +\n						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +\n						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb\n					);\n\n					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );\n					gl_FragColor = vec4( bloom, bloomAlpha );\n\n				}"
		});
	}
};
Ge.BlurDirectionX = new k(1, 0), Ge.BlurDirectionY = new k(0, 1);
//#endregion
//#region node_modules/three/examples/jsm/postprocessing/OutlinePass.js
var Ke = class e extends V {
	constructor(e, t, n, r) {
		super(), this.renderScene = t, this.renderCamera = n, this.selectedObjects = r === void 0 ? [] : r, this.visibleEdgeColor = new o(1, 1, 1), this.hiddenEdgeColor = new o(.1, .04, .02), this.edgeGlow = 0, this.usePatternTexture = !1, this.patternTexture = null, this.edgeThickness = 1, this.edgeStrength = 3, this.downSampleRatio = 2, this.pulsePeriod = 0, this._visibilityCache = /* @__PURE__ */ new Map(), this._selectionCache = /* @__PURE__ */ new Set(), this.resolution = e === void 0 ? new k(256, 256) : new k(e.x, e.y);
		let i = Math.round(this.resolution.x / this.downSampleRatio), a = Math.round(this.resolution.y / this.downSampleRatio);
		this.renderTargetMaskBuffer = new j(this.resolution.x, this.resolution.y), this.renderTargetMaskBuffer.texture.name = "OutlinePass.mask", this.renderTargetMaskBuffer.texture.generateMipmaps = !1, this.depthMaterial = new _(), this.depthMaterial.side = u, this.depthMaterial.depthPacking = C, this.depthMaterial.blending = x, this.prepareMaskMaterial = this._getPrepareMaskMaterial(), this.prepareMaskMaterial.side = u, this.prepareMaskMaterial.fragmentShader = c(this.prepareMaskMaterial.fragmentShader, this.renderCamera), this.renderTargetDepthBuffer = new j(this.resolution.x, this.resolution.y, { type: f }), this.renderTargetDepthBuffer.texture.name = "OutlinePass.depth", this.renderTargetDepthBuffer.texture.generateMipmaps = !1, this.renderTargetMaskDownSampleBuffer = new j(i, a, { type: f }), this.renderTargetMaskDownSampleBuffer.texture.name = "OutlinePass.depthDownSample", this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = !1, this.renderTargetBlurBuffer1 = new j(i, a, { type: f }), this.renderTargetBlurBuffer1.texture.name = "OutlinePass.blur1", this.renderTargetBlurBuffer1.texture.generateMipmaps = !1, this.renderTargetBlurBuffer2 = new j(Math.round(i / 2), Math.round(a / 2), { type: f }), this.renderTargetBlurBuffer2.texture.name = "OutlinePass.blur2", this.renderTargetBlurBuffer2.texture.generateMipmaps = !1, this.edgeDetectionMaterial = this._getEdgeDetectionMaterial(), this.renderTargetEdgeBuffer1 = new j(i, a, { type: f }), this.renderTargetEdgeBuffer1.texture.name = "OutlinePass.edge1", this.renderTargetEdgeBuffer1.texture.generateMipmaps = !1, this.renderTargetEdgeBuffer2 = new j(Math.round(i / 2), Math.round(a / 2), { type: f }), this.renderTargetEdgeBuffer2.texture.name = "OutlinePass.edge2", this.renderTargetEdgeBuffer2.texture.generateMipmaps = !1, this.separableBlurMaterial1 = this._getSeparableBlurMaterial(4), this.separableBlurMaterial1.uniforms.texSize.value.set(i, a), this.separableBlurMaterial1.uniforms.kernelRadius.value = 1, this.separableBlurMaterial2 = this._getSeparableBlurMaterial(4), this.separableBlurMaterial2.uniforms.texSize.value.set(Math.round(i / 2), Math.round(a / 2)), this.separableBlurMaterial2.uniforms.kernelRadius.value = 4, this.overlayMaterial = this._getOverlayMaterial();
		let s = Fe;
		this.copyUniforms = O.clone(s.uniforms), this.materialCopy = new D({
			uniforms: this.copyUniforms,
			vertexShader: s.vertexShader,
			fragmentShader: s.fragmentShader,
			blending: x,
			depthTest: !1,
			depthWrite: !1
		}), this.enabled = !0, this.needsSwap = !1, this._oldClearColor = new o(), this.oldClearAlpha = 1, this._fsQuad = new Re(null), this.tempPulseColor1 = new o(), this.tempPulseColor2 = new o(), this.textureMatrix = new m();
		function c(e, t) {
			let n = t.isPerspectiveCamera ? "perspective" : "orthographic";
			return e.replace(/DEPTH_TO_VIEW_Z/g, n + "DepthToViewZ");
		}
	}
	dispose() {
		this.renderTargetMaskBuffer.dispose(), this.renderTargetDepthBuffer.dispose(), this.renderTargetMaskDownSampleBuffer.dispose(), this.renderTargetBlurBuffer1.dispose(), this.renderTargetBlurBuffer2.dispose(), this.renderTargetEdgeBuffer1.dispose(), this.renderTargetEdgeBuffer2.dispose(), this.depthMaterial.dispose(), this.prepareMaskMaterial.dispose(), this.edgeDetectionMaterial.dispose(), this.separableBlurMaterial1.dispose(), this.separableBlurMaterial2.dispose(), this.overlayMaterial.dispose(), this.materialCopy.dispose(), this._fsQuad.dispose();
	}
	setSize(e, t) {
		this.renderTargetMaskBuffer.setSize(e, t), this.renderTargetDepthBuffer.setSize(e, t);
		let n = Math.round(e / this.downSampleRatio), r = Math.round(t / this.downSampleRatio);
		this.renderTargetMaskDownSampleBuffer.setSize(n, r), this.renderTargetBlurBuffer1.setSize(n, r), this.renderTargetEdgeBuffer1.setSize(n, r), this.separableBlurMaterial1.uniforms.texSize.value.set(n, r), n = Math.round(n / 2), r = Math.round(r / 2), this.renderTargetBlurBuffer2.setSize(n, r), this.renderTargetEdgeBuffer2.setSize(n, r), this.separableBlurMaterial2.uniforms.texSize.value.set(n, r);
	}
	render(t, n, r, i, a) {
		if (this.selectedObjects.length > 0) {
			t.getClearColor(this._oldClearColor), this.oldClearAlpha = t.getClearAlpha();
			let n = t.autoClear;
			t.autoClear = !1, a && t.state.buffers.stencil.setTest(!1), t.setClearColor(16777215, 1), this._updateSelectionCache(), this._changeVisibilityOfSelectedObjects(!1);
			let i = this.renderScene.background, o = this.renderScene.overrideMaterial;
			if (this.renderScene.background = null, this.renderScene.overrideMaterial = this.depthMaterial, t.setRenderTarget(this.renderTargetDepthBuffer), t.clear(), t.render(this.renderScene, this.renderCamera), this._changeVisibilityOfSelectedObjects(!0), this._visibilityCache.clear(), this._updateTextureMatrix(), this._changeVisibilityOfNonSelectedObjects(!1), this.renderScene.overrideMaterial = this.prepareMaskMaterial, this.prepareMaskMaterial.uniforms.cameraNearFar.value.set(this.renderCamera.near, this.renderCamera.far), this.prepareMaskMaterial.uniforms.depthTexture.value = this.renderTargetDepthBuffer.texture, this.prepareMaskMaterial.uniforms.textureMatrix.value = this.textureMatrix, t.setRenderTarget(this.renderTargetMaskBuffer), t.clear(), t.render(this.renderScene, this.renderCamera), this._changeVisibilityOfNonSelectedObjects(!0), this._visibilityCache.clear(), this._selectionCache.clear(), this.renderScene.background = i, this.renderScene.overrideMaterial = o, this._fsQuad.material = this.materialCopy, this.copyUniforms.tDiffuse.value = this.renderTargetMaskBuffer.texture, t.setRenderTarget(this.renderTargetMaskDownSampleBuffer), t.clear(), this._fsQuad.render(t), this.tempPulseColor1.copy(this.visibleEdgeColor), this.tempPulseColor2.copy(this.hiddenEdgeColor), this.pulsePeriod > 0) {
				let e = 1.25 / 2 + Math.cos(performance.now() * .01 / this.pulsePeriod) * .75 / 2;
				this.tempPulseColor1.multiplyScalar(e), this.tempPulseColor2.multiplyScalar(e);
			}
			this._fsQuad.material = this.edgeDetectionMaterial, this.edgeDetectionMaterial.uniforms.maskTexture.value = this.renderTargetMaskDownSampleBuffer.texture, this.edgeDetectionMaterial.uniforms.texSize.value.set(this.renderTargetMaskDownSampleBuffer.width, this.renderTargetMaskDownSampleBuffer.height), this.edgeDetectionMaterial.uniforms.visibleEdgeColor.value = this.tempPulseColor1, this.edgeDetectionMaterial.uniforms.hiddenEdgeColor.value = this.tempPulseColor2, t.setRenderTarget(this.renderTargetEdgeBuffer1), t.clear(), this._fsQuad.render(t), this._fsQuad.material = this.separableBlurMaterial1, this.separableBlurMaterial1.uniforms.colorTexture.value = this.renderTargetEdgeBuffer1.texture, this.separableBlurMaterial1.uniforms.direction.value = e.BlurDirectionX, this.separableBlurMaterial1.uniforms.kernelRadius.value = this.edgeThickness, t.setRenderTarget(this.renderTargetBlurBuffer1), t.clear(), this._fsQuad.render(t), this.separableBlurMaterial1.uniforms.colorTexture.value = this.renderTargetBlurBuffer1.texture, this.separableBlurMaterial1.uniforms.direction.value = e.BlurDirectionY, t.setRenderTarget(this.renderTargetEdgeBuffer1), t.clear(), this._fsQuad.render(t), this._fsQuad.material = this.separableBlurMaterial2, this.separableBlurMaterial2.uniforms.colorTexture.value = this.renderTargetEdgeBuffer1.texture, this.separableBlurMaterial2.uniforms.direction.value = e.BlurDirectionX, t.setRenderTarget(this.renderTargetBlurBuffer2), t.clear(), this._fsQuad.render(t), this.separableBlurMaterial2.uniforms.colorTexture.value = this.renderTargetBlurBuffer2.texture, this.separableBlurMaterial2.uniforms.direction.value = e.BlurDirectionY, t.setRenderTarget(this.renderTargetEdgeBuffer2), t.clear(), this._fsQuad.render(t), this._fsQuad.material = this.overlayMaterial, this.overlayMaterial.uniforms.maskTexture.value = this.renderTargetMaskBuffer.texture, this.overlayMaterial.uniforms.edgeTexture1.value = this.renderTargetEdgeBuffer1.texture, this.overlayMaterial.uniforms.edgeTexture2.value = this.renderTargetEdgeBuffer2.texture, this.overlayMaterial.uniforms.patternTexture.value = this.patternTexture, this.overlayMaterial.uniforms.edgeStrength.value = this.edgeStrength, this.overlayMaterial.uniforms.edgeGlow.value = this.edgeGlow, this.overlayMaterial.uniforms.usePatternTexture.value = this.usePatternTexture, a && t.state.buffers.stencil.setTest(!0), t.setRenderTarget(r), this._fsQuad.render(t), t.setClearColor(this._oldClearColor, this.oldClearAlpha), t.autoClear = n;
		}
		this.renderToScreen && (this._fsQuad.material = this.materialCopy, this.copyUniforms.tDiffuse.value = r.texture, t.setRenderTarget(null), this._fsQuad.render(t));
	}
	_updateSelectionCache() {
		let e = this._selectionCache;
		function t(t) {
			t.isMesh && e.add(t);
		}
		e.clear();
		for (let e = 0; e < this.selectedObjects.length; e++) this.selectedObjects[e].traverse(t);
	}
	_changeVisibilityOfSelectedObjects(e) {
		let t = this._visibilityCache;
		for (let n of this._selectionCache) e === !0 ? n.visible = t.get(n) : (t.set(n, n.visible), n.visible = e);
	}
	_changeVisibilityOfNonSelectedObjects(e) {
		let t = this._visibilityCache, n = this._selectionCache;
		function r(r) {
			if (r.isPoints || r.isLine || r.isLine2) e === !0 ? r.visible = t.get(r) : (t.set(r, r.visible), r.visible = e);
			else if ((r.isMesh || r.isSprite) && !n.has(r)) {
				let n = r.visible;
				(e === !1 || t.get(r) === !0) && (r.visible = e), t.set(r, n);
			}
		}
		this.renderScene.traverse(r);
	}
	_updateTextureMatrix() {
		this.textureMatrix.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1), this.textureMatrix.multiply(this.renderCamera.projectionMatrix), this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse);
	}
	_getPrepareMaskMaterial() {
		return new D({
			uniforms: {
				depthTexture: { value: null },
				cameraNearFar: { value: new k(.5, .5) },
				textureMatrix: { value: null }
			},
			vertexShader: "#include <batching_pars_vertex>\n				#include <morphtarget_pars_vertex>\n				#include <skinning_pars_vertex>\n\n				varying vec4 projTexCoord;\n				varying vec4 vPosition;\n				uniform mat4 textureMatrix;\n\n				void main() {\n\n					#include <batching_vertex>\n					#include <skinbase_vertex>\n					#include <begin_vertex>\n					#include <morphtarget_vertex>\n					#include <skinning_vertex>\n					#include <project_vertex>\n\n					vPosition = mvPosition;\n\n					vec4 worldPosition = vec4( transformed, 1.0 );\n\n					#ifdef USE_INSTANCING\n\n						worldPosition = instanceMatrix * worldPosition;\n\n					#endif\n\n					worldPosition = modelMatrix * worldPosition;\n\n					projTexCoord = textureMatrix * worldPosition;\n\n				}",
			fragmentShader: "#include <packing>\n				varying vec4 vPosition;\n				varying vec4 projTexCoord;\n				uniform sampler2D depthTexture;\n				uniform vec2 cameraNearFar;\n\n				void main() {\n\n					float depth = unpackRGBAToDepth(texture2DProj( depthTexture, projTexCoord ));\n					float viewZ = - DEPTH_TO_VIEW_Z( depth, cameraNearFar.x, cameraNearFar.y );\n					float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;\n					gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);\n\n				}"
		});
	}
	_getEdgeDetectionMaterial() {
		return new D({
			uniforms: {
				maskTexture: { value: null },
				texSize: { value: new k(.5, .5) },
				visibleEdgeColor: { value: new A(1, 1, 1) },
				hiddenEdgeColor: { value: new A(1, 1, 1) }
			},
			vertexShader: "varying vec2 vUv;\n\n				void main() {\n					vUv = uv;\n					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n				}",
			fragmentShader: "varying vec2 vUv;\n\n				uniform sampler2D maskTexture;\n				uniform vec2 texSize;\n				uniform vec3 visibleEdgeColor;\n				uniform vec3 hiddenEdgeColor;\n\n				void main() {\n					vec2 invSize = 1.0 / texSize;\n					vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);\n					vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);\n					vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);\n					vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);\n					vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);\n					float diff1 = (c1.r - c2.r)*0.5;\n					float diff2 = (c3.r - c4.r)*0.5;\n					float d = length( vec2(diff1, diff2) );\n					float a1 = min(c1.g, c2.g);\n					float a2 = min(c3.g, c4.g);\n					float visibilityFactor = min(a1, a2);\n					vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;\n					gl_FragColor = vec4(edgeColor, 1.0) * vec4(d);\n				}"
		});
	}
	_getSeparableBlurMaterial(e) {
		return new D({
			defines: { MAX_RADIUS: e },
			uniforms: {
				colorTexture: { value: null },
				texSize: { value: new k(.5, .5) },
				direction: { value: new k(.5, .5) },
				kernelRadius: { value: 1 }
			},
			vertexShader: "varying vec2 vUv;\n\n				void main() {\n					vUv = uv;\n					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n				}",
			fragmentShader: "#include <common>\n				varying vec2 vUv;\n				uniform sampler2D colorTexture;\n				uniform vec2 texSize;\n				uniform vec2 direction;\n				uniform float kernelRadius;\n\n				float gaussianPdf(in float x, in float sigma) {\n					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\n				}\n\n				void main() {\n					vec2 invSize = 1.0 / texSize;\n					float sigma = kernelRadius/2.0;\n					float weightSum = gaussianPdf(0.0, sigma);\n					vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;\n					vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);\n					vec2 uvOffset = delta;\n					for( int i = 1; i <= MAX_RADIUS; i ++ ) {\n						float x = kernelRadius * float(i) / float(MAX_RADIUS);\n						float w = gaussianPdf(x, sigma);\n						vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);\n						vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);\n						diffuseSum += ((sample1 + sample2) * w);\n						weightSum += (2.0 * w);\n						uvOffset += delta;\n					}\n					gl_FragColor = diffuseSum/weightSum;\n				}"
		});
	}
	_getOverlayMaterial() {
		return new D({
			uniforms: {
				maskTexture: { value: null },
				edgeTexture1: { value: null },
				edgeTexture2: { value: null },
				patternTexture: { value: null },
				edgeStrength: { value: 1 },
				edgeGlow: { value: 1 },
				usePatternTexture: { value: 0 }
			},
			vertexShader: "varying vec2 vUv;\n\n				void main() {\n					vUv = uv;\n					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n				}",
			fragmentShader: "varying vec2 vUv;\n\n				uniform sampler2D maskTexture;\n				uniform sampler2D edgeTexture1;\n				uniform sampler2D edgeTexture2;\n				uniform sampler2D patternTexture;\n				uniform float edgeStrength;\n				uniform float edgeGlow;\n				uniform bool usePatternTexture;\n\n				void main() {\n					vec4 edgeValue1 = texture2D(edgeTexture1, vUv);\n					vec4 edgeValue2 = texture2D(edgeTexture2, vUv);\n					vec4 maskColor = texture2D(maskTexture, vUv);\n					vec4 patternColor = texture2D(patternTexture, 6.0 * vUv);\n					float visibilityFactor = 1.0 - maskColor.g > 0.0 ? 1.0 : 0.5;\n					vec4 edgeValue = edgeValue1 + edgeValue2 * edgeGlow;\n					vec4 finalColor = edgeStrength * maskColor.r * edgeValue;\n					if(usePatternTexture)\n						finalColor += + visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);\n					gl_FragColor = finalColor;\n				}",
			blending: n,
			depthTest: !1,
			depthWrite: !1,
			transparent: !0
		});
	}
};
Ke.BlurDirectionX = new k(1, 0), Ke.BlurDirectionY = new k(0, 1);
//#endregion
//#region node_modules/three/examples/jsm/shaders/FilmShader.js
var qe = {
	name: "FilmShader",
	uniforms: {
		tDiffuse: { value: null },
		time: { value: 0 },
		intensity: { value: .5 },
		grayscale: { value: !1 }
	},
	vertexShader: "\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vUv = uv;\n			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n		}",
	fragmentShader: "\n\n		#include <common>\n\n		uniform float intensity;\n		uniform bool grayscale;\n		uniform float time;\n\n		uniform sampler2D tDiffuse;\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vec4 base = texture2D( tDiffuse, vUv );\n\n			float noise = rand( fract( vUv + time ) );\n\n			vec3 color = base.rgb + base.rgb * clamp( 0.1 + noise, 0.0, 1.0 );\n\n			color = mix( base.rgb, color, intensity );\n\n			if ( grayscale ) {\n\n				color = vec3( luminance( color ) ); // assuming linear-srgb\n\n			}\n\n			gl_FragColor = vec4( color, base.a );\n\n		}"
}, Je = class extends V {
	constructor(e = .5, t = !1) {
		super();
		let n = qe;
		this.uniforms = O.clone(n.uniforms), this.material = new D({
			name: n.name,
			uniforms: this.uniforms,
			vertexShader: n.vertexShader,
			fragmentShader: n.fragmentShader
		}), this.uniforms.intensity.value = e, this.uniforms.grayscale.value = t, this._fsQuad = new Re(this.material);
	}
	render(e, t, n, r) {
		this.uniforms.tDiffuse.value = n.texture, this.uniforms.time.value += r, this.renderToScreen ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(t), this.clear && e.clear(), this._fsQuad.render(e));
	}
	dispose() {
		this.material.dispose(), this._fsQuad.dispose();
	}
}, Ye = class extends V {
	constructor(e, t, n, r = {}) {
		super(), this.pixelSize = e, this.scene = t, this.camera = n, this.normalEdgeStrength = r.normalEdgeStrength || .3, this.depthEdgeStrength = r.depthEdgeStrength || .4, this.pixelatedMaterial = this._createPixelatedMaterial(), this._resolution = new k(), this._renderResolution = new k(), this._normalMaterial = new v(), this._beautyRenderTarget = new j(), this._beautyRenderTarget.texture.minFilter = y, this._beautyRenderTarget.texture.magFilter = y, this._beautyRenderTarget.texture.type = f, this._beautyRenderTarget.depthTexture = new l(), this._normalRenderTarget = new j(), this._normalRenderTarget.texture.minFilter = y, this._normalRenderTarget.texture.magFilter = y, this._normalRenderTarget.texture.type = f, this._fsQuad = new Re(this.pixelatedMaterial);
	}
	dispose() {
		this._beautyRenderTarget.dispose(), this._normalRenderTarget.dispose(), this.pixelatedMaterial.dispose(), this._normalMaterial.dispose(), this._fsQuad.dispose();
	}
	setSize(e, t) {
		this._resolution.set(e, t), this._renderResolution.set(e / this.pixelSize | 0, t / this.pixelSize | 0);
		let { x: n, y: r } = this._renderResolution;
		this._beautyRenderTarget.setSize(n, r), this._normalRenderTarget.setSize(n, r), this._fsQuad.material.uniforms.resolution.value.set(n, r, 1 / n, 1 / r);
	}
	setPixelSize(e) {
		this.pixelSize = e, this.setSize(this._resolution.x, this._resolution.y);
	}
	render(e, t) {
		let n = this._fsQuad.material.uniforms;
		n.normalEdgeStrength.value = this.normalEdgeStrength, n.depthEdgeStrength.value = this.depthEdgeStrength, e.setRenderTarget(this._beautyRenderTarget), e.render(this.scene, this.camera);
		let r = this.scene.overrideMaterial;
		e.setRenderTarget(this._normalRenderTarget), this.scene.overrideMaterial = this._normalMaterial, e.render(this.scene, this.camera), this.scene.overrideMaterial = r, n.tDiffuse.value = this._beautyRenderTarget.texture, n.tDepth.value = this._beautyRenderTarget.depthTexture, n.tNormal.value = this._normalRenderTarget.texture, this.renderToScreen ? e.setRenderTarget(null) : (e.setRenderTarget(t), this.clear && e.clear()), this._fsQuad.render(e);
	}
	_createPixelatedMaterial() {
		return new D({
			uniforms: {
				tDiffuse: { value: null },
				tDepth: { value: null },
				tNormal: { value: null },
				resolution: { value: new te() },
				normalEdgeStrength: { value: 0 },
				depthEdgeStrength: { value: 0 }
			},
			vertexShader: "\n				varying vec2 vUv;\n\n				void main() {\n\n					vUv = uv;\n					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n				}\n			",
			fragmentShader: "\n				uniform sampler2D tDiffuse;\n				uniform sampler2D tDepth;\n				uniform sampler2D tNormal;\n				uniform vec4 resolution;\n				uniform float normalEdgeStrength;\n				uniform float depthEdgeStrength;\n				varying vec2 vUv;\n\n				float getDepth(int x, int y) {\n\n					return texture2D( tDepth, vUv + vec2(x, y) * resolution.zw ).r;\n\n				}\n\n				vec3 getNormal(int x, int y) {\n\n					return texture2D( tNormal, vUv + vec2(x, y) * resolution.zw ).rgb * 2.0 - 1.0;\n\n				}\n\n				float depthEdgeIndicator(float depth, vec3 normal) {\n\n					float diff = 0.0;\n					diff += clamp(getDepth(1, 0) - depth, 0.0, 1.0);\n					diff += clamp(getDepth(-1, 0) - depth, 0.0, 1.0);\n					diff += clamp(getDepth(0, 1) - depth, 0.0, 1.0);\n					diff += clamp(getDepth(0, -1) - depth, 0.0, 1.0);\n					return floor(smoothstep(0.01, 0.02, diff) * 2.) / 2.;\n\n				}\n\n				float neighborNormalEdgeIndicator(int x, int y, float depth, vec3 normal) {\n\n					float depthDiff = getDepth(x, y) - depth;\n					vec3 neighborNormal = getNormal(x, y);\n\n					// Edge pixels should yield to faces who's normals are closer to the bias normal.\n					vec3 normalEdgeBias = vec3(1., 1., 1.); // This should probably be a parameter.\n					float normalDiff = dot(normal - neighborNormal, normalEdgeBias);\n					float normalIndicator = clamp(smoothstep(-.01, .01, normalDiff), 0.0, 1.0);\n\n					// Only the shallower pixel should detect the normal edge.\n					float depthIndicator = clamp(sign(depthDiff * .25 + .0025), 0.0, 1.0);\n\n					return (1.0 - dot(normal, neighborNormal)) * depthIndicator * normalIndicator;\n\n				}\n\n				float normalEdgeIndicator(float depth, vec3 normal) {\n\n					float indicator = 0.0;\n\n					indicator += neighborNormalEdgeIndicator(0, -1, depth, normal);\n					indicator += neighborNormalEdgeIndicator(0, 1, depth, normal);\n					indicator += neighborNormalEdgeIndicator(-1, 0, depth, normal);\n					indicator += neighborNormalEdgeIndicator(1, 0, depth, normal);\n\n					return step(0.1, indicator);\n\n				}\n\n				void main() {\n\n					vec4 texel = texture2D( tDiffuse, vUv );\n\n					float depth = 0.0;\n					vec3 normal = vec3(0.0);\n\n					if (depthEdgeStrength > 0.0 || normalEdgeStrength > 0.0) {\n\n						depth = getDepth(0, 0);\n						normal = getNormal(0, 0);\n\n					}\n\n					float dei = 0.0;\n					if (depthEdgeStrength > 0.0)\n						dei = depthEdgeIndicator(depth, normal);\n\n					float nei = 0.0;\n					if (normalEdgeStrength > 0.0)\n						nei = normalEdgeIndicator(depth, normal);\n\n					float Strength = dei > 0.0 ? (1.0 - depthEdgeStrength * dei) : (1.0 + normalEdgeStrength * nei);\n\n					gl_FragColor = texel * Strength;\n\n				}\n			"
		});
	}
}, Xe = {
	name: "OutputShader",
	uniforms: {
		tDiffuse: { value: null },
		toneMappingExposure: { value: 1 }
	},
	vertexShader: "\n		precision highp float;\n\n		uniform mat4 modelViewMatrix;\n		uniform mat4 projectionMatrix;\n\n		attribute vec3 position;\n		attribute vec2 uv;\n\n		varying vec2 vUv;\n\n		void main() {\n\n			vUv = uv;\n			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n		}",
	fragmentShader: "\n\n		precision highp float;\n\n		uniform sampler2D tDiffuse;\n\n		#include <tonemapping_pars_fragment>\n		#include <colorspace_pars_fragment>\n\n		varying vec2 vUv;\n\n		void main() {\n\n			gl_FragColor = texture2D( tDiffuse, vUv );\n\n			// tone mapping\n\n			#ifdef LINEAR_TONE_MAPPING\n\n				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );\n\n			#elif defined( REINHARD_TONE_MAPPING )\n\n				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );\n\n			#elif defined( CINEON_TONE_MAPPING )\n\n				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );\n\n			#elif defined( ACES_FILMIC_TONE_MAPPING )\n\n				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );\n\n			#elif defined( AGX_TONE_MAPPING )\n\n				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );\n\n			#elif defined( NEUTRAL_TONE_MAPPING )\n\n				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );\n\n			#elif defined( CUSTOM_TONE_MAPPING )\n\n				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );\n\n			#endif\n\n			// color space\n\n			#ifdef SRGB_TRANSFER\n\n				gl_FragColor = sRGBTransferOETF( gl_FragColor );\n\n			#endif\n\n		}"
}, Ze = class extends V {
	constructor() {
		super(), this.isOutputPass = !0, this.uniforms = O.clone(Xe.uniforms), this.material = new w({
			name: Xe.name,
			uniforms: this.uniforms,
			vertexShader: Xe.vertexShader,
			fragmentShader: Xe.fragmentShader
		}), this._fsQuad = new Re(this.material), this._outputColorSpace = null, this._toneMapping = null;
	}
	render(e, n, i) {
		this.uniforms.tDiffuse.value = i.texture, this.uniforms.toneMappingExposure.value = e.toneMappingExposure, (this._outputColorSpace !== e.outputColorSpace || this._toneMapping !== e.toneMapping) && (this._outputColorSpace = e.outputColorSpace, this._toneMapping = e.toneMapping, this.material.defines = {}, s.getTransfer(this._outputColorSpace) === E && (this.material.defines.SRGB_TRANSFER = ""), this._toneMapping === p ? this.material.defines.LINEAR_TONE_MAPPING = "" : this._toneMapping === T ? this.material.defines.REINHARD_TONE_MAPPING = "" : this._toneMapping === a ? this.material.defines.CINEON_TONE_MAPPING = "" : this._toneMapping === t ? this.material.defines.ACES_FILMIC_TONE_MAPPING = "" : this._toneMapping === r ? this.material.defines.AGX_TONE_MAPPING = "" : this._toneMapping === b ? this.material.defines.NEUTRAL_TONE_MAPPING = "" : this._toneMapping === c && (this.material.defines.CUSTOM_TONE_MAPPING = ""), this.material.needsUpdate = !0), this.renderToScreen === !0 ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(n), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this._fsQuad.render(e));
	}
	dispose() {
		this.material.dispose(), this._fsQuad.dispose();
	}
}, Qe = class {
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
	constructor(t, n, r) {
		this.renderer = t, this.scene = n, this.camera = r, this.composer = new He(t), this.renderPass = new Ue(n, r), this.composer.addPass(this.renderPass), this.pixelatedPass = new Ye(6, n, r), this.pixelatedPass.enabled = !1, this.composer.addPass(this.pixelatedPass), this.outlinePass = new Ke(new e.Vector2(window.innerWidth, window.innerHeight), n, r), this.outlinePass.edgeStrength = 3, this.outlinePass.edgeGlow = .5, this.outlinePass.edgeThickness = 1, this.outlinePass.visibleEdgeColor.set("#ffffff"), this.outlinePass.hiddenEdgeColor.set("#222222"), this.outlinePass.enabled = !1, this.composer.addPass(this.outlinePass), this.bloomPass = new Ge(new e.Vector2(window.innerWidth, window.innerHeight), 1.5, .4, .85), this.bloomPass.enabled = !1, this.composer.addPass(this.bloomPass), this.filmPass = new Je(), this.filmPass.enabled = !1, this.composer.addPass(this.filmPass), this.outputPass = new Ze(), this.composer.addPass(this.outputPass), window.addEventListener("resize", () => {
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
}, $e = class {
	renderer;
	scene;
	camera;
	postProcessing;
	config = {
		bloom: !1,
		bloomIntensity: .5,
		vignette: !0,
		vignetteDarkness: .4,
		colorGrading: "vibrant",
		exposure: 1.1
	};
	metrics = {
		fps: 60,
		frameTimeMs: 16.6,
		cpuRenderMs: 2.1,
		cpuPhysicsMs: .5,
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
	constructor(e, t, n) {
		this.renderer = e, this.scene = t, this.camera = n, this.postProcessing = new Qe(this.renderer, this.scene, this.camera), this.setupRendererDefaults();
	}
	setupRendererDefaults() {
		this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = e.PCFSoftShadowMap;
		let t = typeof window < "u" ? Math.min(window.devicePixelRatio, 1.5) : 1;
		this.renderer.setPixelRatio(t), this.renderer.toneMapping = e.ACESFilmicToneMapping, this.renderer.toneMappingExposure = this.config.exposure;
	}
	setToneMappingExposure(e) {
		this.config.exposure = e, this.renderer.toneMappingExposure = e;
	}
	currentSun = null;
	currentAmbient = null;
	setupLighting(t) {
		this.currentSun && (this.scene.remove(this.currentSun), this.currentSun.shadow && this.currentSun.shadow.map && this.currentSun.shadow.map.dispose()), this.currentAmbient && this.scene.remove(this.currentAmbient);
		let n = t.sunColor ?? 16774634, r = t.sunIntensity ?? 2.5, i = new e.DirectionalLight(n, r);
		i.position.set(...t.sunPosition ?? [
			-15,
			30,
			-15
		]), i.castShadow = !0;
		let a = t.shadowMapSize ?? 1024;
		i.shadow.mapSize.width = a, i.shadow.mapSize.height = a, i.shadow.camera.near = .5, i.shadow.camera.far = 80, i.shadow.camera.left = -30, i.shadow.camera.right = 30, i.shadow.camera.top = 30, i.shadow.camera.bottom = -30, i.shadow.bias = -5e-4;
		let o = t.ambientColor ?? 14544639, s = t.ambientIntensity ?? .8, c = new e.AmbientLight(o, s);
		return this.scene.add(i), this.scene.add(c), this.currentSun = i, this.currentAmbient = c, {
			sun: i,
			ambient: c
		};
	}
	render() {
		let e = performance.now(), t = e - this.lastTime;
		this.lastTime = e, this.frameCount++, this.fpsTimer += t, this.fpsTimer >= 1e3 && (this.metrics.fps = Math.round(this.frameCount * 1e3 / this.fpsTimer), this.metrics.frameTimeMs = parseFloat((1e3 / this.metrics.fps).toFixed(2)), this.frameCount = 0, this.fpsTimer = 0);
		let n = performance.now();
		this.postProcessing.render(t / 1e3), this.metrics.cpuRenderMs = parseFloat((performance.now() - n).toFixed(2));
		let r = this.renderer.info;
		this.metrics.drawCalls = r.render.calls, this.metrics.triangles = r.render.triangles, this.metrics.geometries = r.memory.geometries, this.metrics.textures = r.memory.textures, typeof performance < "u" && performance.memory && (this.metrics.jsHeapMb = parseFloat((performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1)));
	}
}, et = class {
	static projScreenMatrix = new e.Matrix4();
	static frustum = new e.Frustum();
	static bbox = new e.Box3();
	static cullScene(e, t) {
		this.projScreenMatrix.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
		let n = 0, r = 0;
		return e.traverse((e) => {
			if (e.isMesh && e.visible) {
				let t = e;
				if (!t.geometry) return;
				t.geometry.boundingBox || t.geometry.computeBoundingBox(), t.geometry.boundingBox && (this.bbox.copy(t.geometry.boundingBox).applyMatrix4(t.matrixWorld), this.frustum.intersectsBox(this.bbox) ? n++ : r++);
			}
		}), {
			visibleCount: n,
			culledCount: r
		};
	}
};
//#endregion
//#region packages/geometry/src/Primitives.ts
function H(t, n = {}) {
	let r = n.material ?? new e.MeshStandardMaterial({
		color: n.color ?? 16777215,
		roughness: n.roughness ?? .6,
		metalness: n.metalness ?? .1,
		emissive: n.emissive ?? 0,
		emissiveIntensity: n.emissiveIntensity ?? 1,
		side: n.side ?? e.FrontSide,
		...n.transparent === void 0 ? {} : {
			transparent: n.transparent,
			opacity: n.opacity ?? 1
		}
	}), i = new e.Mesh(t, r);
	return n.position && i.position.set(...n.position), n.rotation && i.rotation.set(...n.rotation), n.scale && i.scale.set(...n.scale), i.castShadow = n.castShadow ?? !0, i.receiveShadow = n.receiveShadow ?? !0, i;
}
function tt(t, n) {
	return H(new e.BoxGeometry(...t), n);
}
function nt(t, n) {
	return H(new e.SphereGeometry(t, n?.castShadow === !1 ? 16 : 32, 16), n);
}
function rt(t, n, r) {
	let i = H(new e.PlaneGeometry(t, n, 1, 1), r);
	return i.rotation.x = -Math.PI / 2, r?.rotation && i.rotation.set(...r.rotation), i;
}
function it(t, n, r, i) {
	return H(new e.CylinderGeometry(t, n, r, 24), i);
}
function at(t, n, r) {
	return H(new e.ConeGeometry(t, n, 24), r);
}
function ot(t, n, r) {
	return H(new e.TorusGeometry(t, n, 16, 48), r);
}
function st(t, n, r) {
	return H(new e.CapsuleGeometry(t, n, 8, 16), r);
}
function ct(t, n = 1, r) {
	return H(new e.IcosahedronGeometry(t, n), r);
}
function lt(t, n = 0, r) {
	return H(new e.DodecahedronGeometry(t, n), r);
}
//#endregion
//#region packages/geometry/src/Terrain.ts
function ut(e, t, n, r, i) {
	let a = 0, o = 1, s = 1, c = 0;
	for (let l = 0; l < r; l++) a += e.noise2D(t * o, n * o) * s, c += s, s *= i, o *= 2;
	return (a / c + 1) / 2;
}
function dt(t = {}) {
	let n = t.size ?? 100, r = t.segments ?? 128, i = t.seed ?? 1337, a = t.amplitude ?? 6, o = t.frequency ?? .08, s = t.octaves ?? 5, c = t.persistence ?? .5, l = t.position ?? [
		0,
		0,
		0
	], u = new $s(i), d = new e.PlaneGeometry(n, n, r, r);
	d.rotateX(-Math.PI / 2);
	let f = d.attributes.position, p = [], m = new Float32Array(f.count * 3), h = new e.Color(t.color ?? 4881471), g = new e.Color(t.highColor ?? 9416299);
	for (let e = 0; e < f.count; e++) {
		let t = f.getX(e), i = f.getZ(e), l = ut(u, t * o, i * o, s, c);
		f.setY(e, l * a);
		let d = Math.floor((i + n / 2) / n * r);
		p[d] || (p[d] = []), p[d][Math.floor((t + n / 2) / n * r)] = l;
		let _ = h.clone().lerp(g, l);
		m[e * 3] = _.r, m[e * 3 + 1] = _.g, m[e * 3 + 2] = _.b;
	}
	f.needsUpdate = !0, d.setAttribute("color", new e.BufferAttribute(m, 3)), d.computeVertexNormals();
	let _ = new e.MeshStandardMaterial({
		vertexColors: !0,
		roughness: t.roughness ?? .95,
		metalness: t.metalness ?? 0,
		wireframe: t.wireframe ?? !1
	}), v = new e.Mesh(d, _);
	return v.position.set(...l), v.castShadow = !0, v.receiveShadow = !0, v.name = "Terrain", {
		mesh: v,
		geometry: d,
		heightAt: (e, t) => ut(u, (e - l[0]) * o, (t - l[2]) * o, s, c) * a + l[1],
		heights: p
	};
}
//#endregion
//#region packages/geometry/src/Grass.ts
function ft(t = {}) {
	let n = t.count ?? 2e3, r = t.area ?? 40, [i, a] = t.height ?? [.5, 1.2], o = t.width ?? .12, s = t.seed ?? 1, c = t.position ?? [
		0,
		0,
		0
	], l = t.heightAt ?? null, u = new Qs(s), d = new e.PlaneGeometry(o, 1, 1, 1);
	d.translate(0, .5, 0);
	let f = new e.Color(t.color ?? 5020223), p = new e.Color(t.tipColor ?? 9426016), m = new Float32Array(d.attributes.position.count * 3);
	for (let e = 0; e < d.attributes.position.count; e++) {
		let t = d.attributes.position.getY(e), n = f.clone().lerp(p, t);
		m[e * 3] = n.r, m[e * 3 + 1] = n.g, m[e * 3 + 2] = n.b;
	}
	d.setAttribute("color", new e.BufferAttribute(m, 3));
	let h = new e.MeshStandardMaterial({
		vertexColors: !0,
		side: e.DoubleSide,
		roughness: 1
	}), g = new e.InstancedMesh(d, h, n);
	g.position.set(...c), g.castShadow = t.castShadow ?? !1;
	let _ = r / 2, v = new e.Object3D();
	for (let e = 0; e < n; e++) {
		let t = u.nextFloat(-_, _), n = u.nextFloat(-_, _), r = u.nextFloat(i, a), o = l ? l(t + c[0], n + c[2]) - c[1] : 0;
		v.position.set(t, o - .03, n), v.rotation.set(0, u.nextFloat(0, Math.PI), u.nextFloat(-.2, .2)), v.scale.set(u.nextFloat(.7, 1.3), r, 1), v.updateMatrix(), g.setMatrixAt(e, v.matrix);
	}
	return g.instanceMatrix.needsUpdate = !0, g;
}
//#endregion
//#region packages/geometry/src/Scenery.ts
function pt(t = {}) {
	let n = t.position ?? [
		0,
		0,
		0
	], r = t.scale ?? 1, i = (t.trunkHeight ?? 2.2) * r, a = (t.trunkRadius ?? .25) * r, o = (t.canopyRadius ?? 1.5) * r, s = new Qs(t.seed ?? Math.floor(Math.random() * 99999)), c = new e.Group();
	c.position.set(...n);
	let l = new e.Mesh(new e.CylinderGeometry(a * .8, a, i, 8), new e.MeshStandardMaterial({
		color: t.trunkColor ?? 7031339,
		roughness: 1
	}));
	l.position.y = i / 2, l.castShadow = !0, c.add(l);
	let u = new e.MeshStandardMaterial({
		color: t.canopyColor ?? 3963438,
		roughness: .9
	}), d = new e.Mesh(new e.DodecahedronGeometry(o, 1), u);
	d.position.y = i + o * .6, d.castShadow = !0, c.add(d);
	let f = new e.Mesh(new e.IcosahedronGeometry(o * .55, 1), u);
	return f.position.set(o * .5, i + o * .3, s.nextFloat(-.3, .3)), f.castShadow = !0, c.add(f), c;
}
function mt(t = {}) {
	let n = t.position ?? [
		0,
		0,
		0
	], r = t.scale ?? 1, i = (t.radius ?? .6) * r, a = new Qs(t.seed ?? Math.floor(Math.random() * 99999)), o = new e.DodecahedronGeometry(i, 1), s = o.attributes.position;
	for (let e = 0; e < s.count; e++) {
		let t = s.getX(e), n = s.getY(e), r = s.getZ(e), i = 1 + a.nextFloat(-.25, .35);
		s.setXYZ(e, t * i, n * i, r * i);
	}
	o.computeVertexNormals();
	let c = new e.Mesh(o, new e.MeshStandardMaterial({
		color: t.color ?? 9079434,
		roughness: .95
	}));
	return c.position.set(...n), c.castShadow = !0, c.receiveShadow = !0, c;
}
function ht(t = {}) {
	let n = t.position ?? [
		0,
		10,
		0
	], r = t.scale ?? 1, i = new e.MeshStandardMaterial({
		color: t.color ?? 16777215,
		roughness: 1,
		transparent: !0,
		opacity: .92
	}), a = new e.Group();
	a.position.set(...n);
	let o = [
		[
			0,
			0,
			0,
			1
		],
		[
			1.1 * r,
			-.1 * r,
			.2 * r,
			.7
		],
		[
			-1.1 * r,
			0,
			-.2 * r,
			.8
		],
		[
			.5 * r,
			-.25 * r,
			.1 * r,
			.9
		]
	];
	for (let [t, n, s, c] of o) {
		let o = new e.Mesh(new e.SphereGeometry(c * r, 12, 8), i);
		o.position.set(t, n, s), o.scale.y = .55, a.add(o);
	}
	return a;
}
//#endregion
//#region packages/geometry/src/Physics.ts
function gt(t) {
	let n = new _e(), r = t.geometry, i = t.getWorldScale(new e.Vector3()), a = (e, t, r) => {
		n.type = z.Box, n.size = new F(e * i.x, t * i.y, r * i.z);
	}, o = (e) => {
		n.type = z.Sphere, n.size = new F(e * 2 * i.x, e * 2 * i.y, e * 2 * i.z);
	}, s = (e, t) => {
		n.type = z.Capsule, n.size = new F(e * 2 * i.x, t * i.y, e * 2 * i.z);
	};
	if (r instanceof e.BoxGeometry) {
		let e = r.parameters;
		a(e.width, e.height, e.depth);
	} else if (r instanceof e.SphereGeometry) o(r.parameters.radius);
	else if (r instanceof e.CapsuleGeometry) {
		let e = r.parameters;
		s(e.radius, e.height + e.radius * 2);
	} else if (r instanceof e.CylinderGeometry) {
		let e = r.parameters;
		s(Math.max(e.radiusTop, e.radiusBottom), e.height);
	} else if (r instanceof e.ConeGeometry) {
		let e = r.parameters;
		s(e.radius, e.height);
	} else if (r instanceof e.TorusGeometry) {
		let e = r.parameters;
		a((e.radius + e.tube) * 2, (e.radius + e.tube) * 2, e.tube * 2);
	} else if (r instanceof e.IcosahedronGeometry || r instanceof e.DodecahedronGeometry) o(r.parameters.radius);
	else {
		n.type = z.Box;
		let r = new e.Box3().setFromObject(t).getSize(new e.Vector3());
		n.size = new F(Math.max(.1, r.x * i.x), Math.max(.1, r.y * i.y), Math.max(.1, r.z * i.z));
	}
	return n;
}
//#endregion
//#region packages/input/src/Input.ts
var _t = /* @__PURE__ */ function(e) {
	return e[e.Left = 0] = "Left", e[e.Middle = 1] = "Middle", e[e.Right = 2] = "Right", e;
}({}), vt = class {
	keysPressed = /* @__PURE__ */ new Set();
	keysJustPressed = /* @__PURE__ */ new Set();
	keysJustReleased = /* @__PURE__ */ new Set();
	mousePosition = new P();
	mouseDelta = new P();
	mouseButtonsPressed = /* @__PURE__ */ new Set();
	mouseButtonsJustPressed = /* @__PURE__ */ new Set();
	touchJoystickActive = !1;
	touchJoystickVector = new P(0, 0);
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
		if ((this.actionBindings.get(e) || []).some((e) => e.startsWith("Mouse") ? this.mouseButtonsPressed.has(parseInt(e.replace("Mouse", ""))) : this.isKeyDown(e))) return !0;
		if (typeof navigator < "u" && navigator.getGamepads) {
			let t = navigator.getGamepads();
			for (let n of t) if (n && (e === "Jump" && n.buttons[0]?.pressed || e === "Interact" && n.buttons[2]?.pressed || e === "Undo" && n.buttons[3]?.pressed || e === "Hint" && n.buttons[1]?.pressed || e === "Pause" && n.buttons[9]?.pressed || e === "Sprint" && n.buttons[10]?.pressed)) return !0;
		}
		return !1;
	}
	isActionJustPressed(e) {
		return (this.actionBindings.get(e) || []).some((e) => e.startsWith("Mouse") ? this.mouseButtonsJustPressed.has(parseInt(e.replace("Mouse", ""))) : this.isKeyJustPressed(e));
	}
	getMovementVector() {
		let e = new P(0, 0);
		if (this.touchJoystickActive) return e.x = -this.touchJoystickVector.x, e.y = -this.touchJoystickVector.y, e;
		if (this.isActionActive("MoveForward") && (e.y += 1), this.isActionActive("MoveBackward") && --e.y, this.isActionActive("MoveRight") && --e.x, this.isActionActive("MoveLeft") && (e.x += 1), typeof navigator < "u" && navigator.getGamepads) {
			let t = navigator.getGamepads();
			for (let n of t) {
				if (!n) continue;
				let t = n.axes[0], r = n.axes[1];
				Math.abs(t) > .15 && (e.x = -t), Math.abs(r) > .15 && (e.y = -r);
			}
		}
		return e.lengthSq() > 1 && e.normalize(), e;
	}
	endFrame() {
		this.keysJustPressed.clear(), this.keysJustReleased.clear(), this.mouseButtonsJustPressed.clear(), this.mouseDelta.set(0, 0);
	}
}, yt = new vt(), bt = class {
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
		let e = window.AudioContext || window.webkitAudioContext;
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
		let n = this.ctx.createOscillator(), r = this.ctx.createGain(), i = this.sfxGain;
		if (t && this.ctx.createPanner) {
			let e = this.ctx.createPanner();
			e.panningModel = "HRTF", e.distanceModel = "exponential", e.refDistance = 1, e.maxDistance = 50, e.rolloffFactor = 1.5, e.positionX.value = t.x, e.positionY.value = t.y, e.positionZ.value = t.z, e.connect(this.sfxGain), i = e;
		}
		n.connect(r), r.connect(i);
		let a = this.ctx.currentTime;
		switch (e) {
			case "jump":
				n.type = "sine", n.frequency.setValueAtTime(160, a), n.frequency.exponentialRampToValueAtTime(450, a + .15), r.gain.setValueAtTime(.3, a), r.gain.linearRampToValueAtTime(.01, a + .15), n.start(a), n.stop(a + .15);
				break;
			case "laser":
				n.type = "sawtooth", n.frequency.setValueAtTime(800, a), n.frequency.exponentialRampToValueAtTime(100, a + .2), r.gain.setValueAtTime(.3, a), r.gain.linearRampToValueAtTime(.01, a + .2), n.start(a), n.stop(a + .2);
				break;
			case "coin":
				n.type = "sine", n.frequency.setValueAtTime(987.77, a), n.frequency.setValueAtTime(1318.51, a + .08), r.gain.setValueAtTime(.25, a), r.gain.linearRampToValueAtTime(.01, a + .25), n.start(a), n.stop(a + .25);
				break;
			case "switch":
				n.type = "square", n.frequency.setValueAtTime(300, a), n.frequency.setValueAtTime(600, a + .04), r.gain.setValueAtTime(.2, a), r.gain.linearRampToValueAtTime(.01, a + .08), n.start(a), n.stop(a + .08);
				break;
			case "gate":
				n.type = "triangle", n.frequency.setValueAtTime(120, a), n.frequency.exponentialRampToValueAtTime(240, a + .4), r.gain.setValueAtTime(.3, a), r.gain.linearRampToValueAtTime(.01, a + .4), n.start(a), n.stop(a + .4);
				break;
			case "key":
				n.type = "sine", n.frequency.setValueAtTime(523.25, a), n.frequency.setValueAtTime(659.25, a + .06), n.frequency.setValueAtTime(783.99, a + .12), r.gain.setValueAtTime(.25, a), r.gain.linearRampToValueAtTime(.01, a + .3), n.start(a), n.stop(a + .3);
				break;
			case "teleport":
				n.type = "sine", n.frequency.setValueAtTime(300, a), n.frequency.exponentialRampToValueAtTime(1200, a + .35), r.gain.setValueAtTime(.3, a), r.gain.linearRampToValueAtTime(.01, a + .35), n.start(a), n.stop(a + .35);
				break;
			case "push":
				n.type = "triangle", n.frequency.setValueAtTime(80, a), n.frequency.linearRampToValueAtTime(60, a + .15), r.gain.setValueAtTime(.2, a), r.gain.linearRampToValueAtTime(.01, a + .15), n.start(a), n.stop(a + .15);
				break;
			case "fanfare":
				[
					523.25,
					659.25,
					783.99,
					1046.5
				].forEach((e, t) => {
					let n = this.ctx.createOscillator(), r = this.ctx.createGain();
					n.type = "sine", n.frequency.value = e, n.connect(r), r.connect(i);
					let o = a + t * .08;
					r.gain.setValueAtTime(.2, o), r.gain.exponentialRampToValueAtTime(.001, o + .5), n.start(o), n.stop(o + .5);
				});
				break;
			case "undo":
				n.type = "sine", n.frequency.setValueAtTime(600, a), n.frequency.exponentialRampToValueAtTime(200, a + .15), r.gain.setValueAtTime(.2, a), r.gain.linearRampToValueAtTime(.01, a + .15), n.start(a), n.stop(a + .15);
				break;
			case "hint":
				n.type = "sine", n.frequency.setValueAtTime(440, a), n.frequency.setValueAtTime(880, a + .08), r.gain.setValueAtTime(.2, a), r.gain.linearRampToValueAtTime(.01, a + .25), n.start(a), n.stop(a + .25);
				break;
			case "explosion":
				n.type = "square", n.frequency.setValueAtTime(100, a), n.frequency.exponentialRampToValueAtTime(20, a + .4), r.gain.setValueAtTime(.4, a), r.gain.linearRampToValueAtTime(.01, a + .4), n.start(a), n.stop(a + .4);
				break;
			default:
				n.type = "sine", n.frequency.setValueAtTime(600, a), r.gain.setValueAtTime(.1, a), r.gain.linearRampToValueAtTime(.01, a + .05), n.start(a), n.stop(a + .05);
				break;
		}
	}
	updateListenerPosition(e, t) {
		if (!this.ctx) return;
		let n = this.ctx.listener;
		n.positionX && (n.positionX.value = e.x, n.positionY.value = e.y, n.positionZ.value = e.z);
	}
}, xt = new bt(), St = class {
	container = null;
	letterboxTop = null;
	letterboxBottom = null;
	colorGradeOverlay = null;
	transitionOverlay = null;
	overlaysMap = /* @__PURE__ */ new Map();
	constructor() {
		if (typeof document > "u") return;
		let e = document.getElementById("kairo-cinematic-container");
		e || (e = document.createElement("div"), e.id = "kairo-cinematic-container", e.style.cssText = "\n        position: fixed;\n        top: 0; left: 0; right: 0; bottom: 0;\n        pointer-events: none;\n        z-index: 999;\n        overflow: hidden;\n      ", document.body.appendChild(e)), this.container = e, this.letterboxTop = document.createElement("div"), this.letterboxTop.style.cssText = "\n      position: absolute; top: 0; left: 0; right: 0; height: 0%;\n      background: #000; transition: height 0.4s ease; z-index: 100;\n    ", this.letterboxBottom = document.createElement("div"), this.letterboxBottom.style.cssText = "\n      position: absolute; bottom: 0; left: 0; right: 0; height: 0%;\n      background: #000; transition: height 0.4s ease; z-index: 100;\n    ", this.colorGradeOverlay = document.createElement("div"), this.colorGradeOverlay.style.cssText = "\n      position: absolute; top: 0; left: 0; right: 0; bottom: 0;\n      pointer-events: none; transition: all 0.3s ease; z-index: 10;\n    ", this.transitionOverlay = document.createElement("div"), this.transitionOverlay.style.cssText = "\n      position: absolute; top: 0; left: 0; right: 0; bottom: 0;\n      pointer-events: none; opacity: 0; transition: opacity 0.3s ease; z-index: 200;\n      background: #000;\n    ", this.container.appendChild(this.letterboxTop), this.container.appendChild(this.letterboxBottom), this.container.appendChild(this.colorGradeOverlay), this.container.appendChild(this.transitionOverlay);
	}
	showImageOverlay(e, t = {}) {
		let n = t.id || `img_overlay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
		if (typeof document > "u" || !this.container) return n;
		let r = this.overlaysMap.get(n);
		r || (r = document.createElement("div"), r.id = n, this.container.appendChild(r), this.overlaysMap.set(n, r));
		let i = t.mask || "none", a = "none";
		i === "circle" ? a = "circle(45% at 50% 50%)" : i === "rounded" ? a = "inset(0 round 16px)" : i === "hexagon" && (a = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)");
		let o = typeof t.width == "number" ? `${t.width}px` : t.width || "200px", s = typeof t.height == "number" ? `${t.height}px` : t.height || "auto", c = t.opacity ?? 1, l = t.blendMode || "normal", u = t.x === void 0 ? "50%" : typeof t.x == "number" ? `${t.x}px` : t.x, d = t.y === void 0 ? "50%" : typeof t.y == "number" ? `${t.y}px` : t.y;
		return r.style.cssText = `
      position: absolute;
      left: ${u};
      top: ${d};
      transform: translate(-50%, -50%);
      width: ${o};
      height: ${s};
      opacity: ${c};
      mix-blend-mode: ${l};
      clip-path: ${a};
      background-image: url('${e}');
      background-size: cover;
      background-position: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 50;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    `, n;
	}
	removeImageOverlay(e) {
		let t = this.overlaysMap.get(e);
		t && (t.style.opacity = "0", setTimeout(() => {
			t.remove(), this.overlaysMap.delete(e);
		}, 300));
	}
	setLetterbox(e, t = 10) {
		if (!this.letterboxTop || !this.letterboxBottom) return;
		let n = e ? `${t}%` : "0%";
		this.letterboxTop.style.height = n, this.letterboxBottom.style.height = n;
	}
	async transitionCut(e = "fadeBlack", t = 500) {
		return new Promise((n) => {
			if (!this.transitionOverlay) return n();
			this.transitionOverlay.style.transition = `all ${t / 2}ms ease`, e === "fadeBlack" ? (this.transitionOverlay.style.background = "#000", this.transitionOverlay.style.opacity = "1") : e === "wipeLeft" ? (this.transitionOverlay.style.background = "linear-gradient(to left, #000 50%, transparent 100%)", this.transitionOverlay.style.opacity = "1") : e === "circleWipe" ? (this.transitionOverlay.style.background = "radial-gradient(circle, transparent 0%, #000 100%)", this.transitionOverlay.style.opacity = "1") : e === "glitch" && (this.transitionOverlay.style.background = "rgba(99, 102, 241, 0.4)", this.transitionOverlay.style.opacity = "0.8"), setTimeout(() => {
				this.transitionOverlay && (this.transitionOverlay.style.opacity = "0"), setTimeout(n, t / 2);
			}, t / 2);
		});
	}
	setColorGrading(e) {
		this.colorGradeOverlay && (e === "cinematicWarm" ? (this.colorGradeOverlay.style.backdropFilter = "contrast(108%) sepia(20%) saturate(120%)", this.colorGradeOverlay.style.background = "rgba(245, 158, 11, 0.05)") : e === "cyberpunkNeon" ? (this.colorGradeOverlay.style.backdropFilter = "contrast(115%) saturate(150%) hue-rotate(10deg)", this.colorGradeOverlay.style.background = "rgba(99, 102, 241, 0.06)") : e === "noir" ? (this.colorGradeOverlay.style.backdropFilter = "grayscale(100%) contrast(140%)", this.colorGradeOverlay.style.background = "none") : e === "sepia" ? (this.colorGradeOverlay.style.backdropFilter = "sepia(80%) contrast(110%)", this.colorGradeOverlay.style.background = "rgba(217, 119, 6, 0.08)") : e === "vintage" ? (this.colorGradeOverlay.style.backdropFilter = "contrast(95%) brightness(105%) saturate(85%)", this.colorGradeOverlay.style.background = "rgba(168, 85, 247, 0.04)") : (this.colorGradeOverlay.style.backdropFilter = "none", this.colorGradeOverlay.style.background = "none"));
	}
	clearAll() {
		this.overlaysMap.forEach((e) => e.remove()), this.overlaysMap.clear(), this.setLetterbox(!1), this.setColorGrading("none");
	}
}, Ct = new St(), wt = {
	primaryColor: "#3b82f6",
	accentColor: "#10b981",
	backgroundColor: "#09090b",
	cardBackground: "rgba(24, 24, 27, 0.85)",
	textColor: "#fafafa",
	mutedTextColor: "#a1a1aa",
	fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
	borderRadius: "12px"
}, Tt = class {
	container = null;
	theme;
	constructor(e = wt) {
		if (this.theme = e, typeof document < "u") {
			let e = document.getElementById("kairo-ui-overlay");
			e || (e = document.createElement("div"), e.id = "kairo-ui-overlay", document.body.appendChild(e)), this.container = e, this.applyGlobalStyles();
		}
	}
	applyGlobalStyles() {
		this.container && (this.container.style.cssText = "\n      position: absolute;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      pointer-events: none;\n      z-index: 1000;\n      overflow: hidden;\n      box-sizing: border-box;\n    ", this.container.style.fontFamily = this.theme.fontFamily, this.container.style.color = this.theme.textColor);
	}
	showToast(e, t = 3e3, n = "info") {
		if (!this.container || typeof document > "u") return;
		let r = document.createElement("div");
		r.style.cssText = `
      position: absolute;
      top: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: ${n === "success" ? "#059669" : n === "warning" ? "#d97706" : "rgba(30, 41, 59, 0.95)"};
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
    `, r.innerText = e, this.container.appendChild(r), requestAnimationFrame(() => {
			r.style.opacity = "1", r.style.transform = "translateX(-50%) translateY(0)";
		}), setTimeout(() => {
			r.style.opacity = "0", r.style.transform = "translateX(-50%) translateY(-20px)", setTimeout(() => r.remove(), 300);
		}, t);
	}
	createModal(e, t, n) {
		if (!this.container || typeof document > "u") return null;
		let r = document.createElement("div");
		r.style.cssText = "\n      position: absolute;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      background: rgba(0, 0, 0, 0.7);\n      backdrop-filter: blur(6px);\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      pointer-events: auto;\n      z-index: 2000;\n      opacity: 0;\n      transition: opacity 0.25s ease;\n    ";
		let i = document.createElement("div");
		i.style.cssText = "\n      border: 1px solid rgba(255, 255, 255, 0.15);\n      padding: 32px;\n      max-width: 480px;\n      width: 90%;\n      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);\n      transform: scale(0.9);\n      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);\n    ", i.style.background = this.theme.cardBackground, i.style.borderRadius = this.theme.borderRadius;
		let a = document.createElement("h2");
		a.style.cssText = "margin: 0 0 16px 0; font-size: 24px; font-weight: 700;", a.style.color = this.theme.textColor, a.innerText = e;
		let o = document.createElement("div");
		o.style.cssText = "margin-bottom: 24px; font-size: 15px; line-height: 1.6;", o.style.color = this.theme.mutedTextColor, o.innerHTML = t;
		let s = document.createElement("div");
		return s.style.cssText = "display: flex; gap: 12px; justify-content: flex-end;", n.forEach((e) => {
			let t = document.createElement("button");
			t.innerText = e.text, t.style.cssText = "\n        padding: 10px 20px;\n        border-radius: 8px;\n        font-weight: 600;\n        font-size: 14px;\n        cursor: pointer;\n        border: none;\n        color: white;\n        transition: transform 0.15s, background 0.15s;\n      ", t.style.background = e.primary ? this.theme.primaryColor : "rgba(255, 255, 255, 0.1)", t.onmouseenter = () => t.style.transform = "scale(1.04)", t.onmouseleave = () => t.style.transform = "scale(1)", t.onclick = () => {
				t.disabled || (s.querySelectorAll("button").forEach((e) => e.disabled = !0), r.style.opacity = "0", i.style.transform = "scale(0.9)", setTimeout(() => r.remove(), 250), e.onClick());
			}, s.appendChild(t);
		}), i.appendChild(a), i.appendChild(o), i.appendChild(s), r.appendChild(i), this.container.appendChild(r), requestAnimationFrame(() => {
			r.style.opacity = "1", i.style.transform = "scale(1)";
		}), r;
	}
	showStartScreen(e) {
		if (!this.container || typeof document > "u") return null;
		let t = document.createElement("div");
		t.style.cssText = "\n      position: absolute; top: 0; left: 0; width: 100%; height: 100%;\n      background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px);\n      display: flex; flex-direction: column; align-items: center; justify-content: center;\n      pointer-events: auto; z-index: 3000; color: white; text-align: center;\n    ";
		let n = document.createElement("h1");
		n.innerText = e.title, n.style.cssText = `font-size: 64px; font-weight: 800; margin: 0 0 10px 0; color: ${this.theme.primaryColor}; text-shadow: 0 4px 20px rgba(0,0,0,0.5);`;
		let r = document.createElement("p");
		r.innerText = e.subtitle || "", r.style.cssText = `font-size: 24px; color: ${this.theme.mutedTextColor}; margin: 0 0 40px 0; max-width: 600px;`;
		let i = document.createElement("button");
		return i.innerText = e.btnText || "START GAME", i.style.cssText = `
      padding: 16px 48px; border-radius: 30px; font-size: 20px; font-weight: 700;
      background: ${this.theme.accentColor}; color: white; border: none; cursor: pointer;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3); transition: transform 0.2s;
    `, i.onmouseenter = () => i.style.transform = "scale(1.05)", i.onmouseleave = () => i.style.transform = "scale(1)", i.onclick = () => {
			t.style.opacity = "0", t.style.transition = "opacity 0.5s ease", setTimeout(() => {
				t.remove(), e.onStart();
			}, 500);
		}, t.appendChild(n), e.subtitle && t.appendChild(r), t.appendChild(i), this.container.appendChild(t), t;
	}
	showEndScreen(e) {
		if (!this.container || typeof document > "u") return null;
		let t = document.createElement("div");
		t.style.cssText = "\n      position: absolute; top: 0; left: 0; width: 100%; height: 100%;\n      background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(8px);\n      display: flex; flex-direction: column; align-items: center; justify-content: center;\n      pointer-events: auto; z-index: 3000; color: white; text-align: center;\n    ";
		let n = document.createElement("h1");
		n.innerText = e.title, n.style.cssText = "font-size: 56px; font-weight: 800; margin: 0 0 10px 0; color: #ef4444; text-shadow: 0 4px 20px rgba(239, 68, 68, 0.5);";
		let r = document.createElement("p");
		r.innerText = e.subtitle || "", r.style.cssText = `font-size: 20px; color: ${this.theme.mutedTextColor}; margin: 0 0 20px 0; max-width: 600px;`;
		let i = document.createElement("div");
		e.score && (i.innerText = "Score: " + e.score, i.style.cssText = "font-size: 32px; font-weight: bold; color: #facc15; margin: 0 0 40px 0;");
		let a = document.createElement("button");
		return a.innerText = e.btnText || "RESTART", a.style.cssText = `
      padding: 16px 48px; border-radius: 30px; font-size: 20px; font-weight: 700;
      background: ${this.theme.primaryColor}; color: white; border: none; cursor: pointer;
      box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3); transition: transform 0.2s;
    `, a.onmouseenter = () => a.style.transform = "scale(1.05)", a.onmouseleave = () => a.style.transform = "scale(1)", a.onclick = () => {
			t.style.opacity = "0", t.style.transition = "opacity 0.3s ease", setTimeout(() => {
				t.remove(), e.onRestart();
			}, 300);
		}, t.appendChild(n), e.subtitle && t.appendChild(r), e.score && t.appendChild(i), t.appendChild(a), this.container.appendChild(t), t;
	}
	showAchievement(e, t, n = "🏆") {
		if (!this.container || typeof document > "u") return;
		let r = document.createElement("div");
		r.style.cssText = "\n      position: absolute;\n      top: 24px;\n      right: 24px;\n      border: 1px solid rgba(255, 215, 0, 0.4);\n      padding: 16px 20px;\n      display: flex;\n      align-items: center;\n      gap: 16px;\n      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.1);\n      transform: translateX(120%);\n      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s;\n      z-index: 9999;\n    ", r.style.background = this.theme.cardBackground, r.style.borderRadius = this.theme.borderRadius;
		let i = document.createElement("div");
		i.style.cssText = "font-size: 32px;", i.innerText = n;
		let a = document.createElement("div"), o = document.createElement("div");
		o.style.cssText = "font-size: 12px; font-weight: bold; color: #facc15; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;", o.innerText = "Achievement Unlocked";
		let s = document.createElement("div");
		s.style.cssText = "font-size: 16px; font-weight: 600; color: white;", s.innerText = e;
		let c = document.createElement("div");
		c.style.cssText = "font-size: 13px; margin-top: 2px;", c.style.color = this.theme.mutedTextColor, c.innerText = t, a.appendChild(o), a.appendChild(s), a.appendChild(c), r.appendChild(i), r.appendChild(a), this.container.appendChild(r), requestAnimationFrame(() => {
			r.style.transform = "translateX(0)";
		}), setTimeout(() => {
			r.style.opacity = "0", r.style.transform = "translateX(120%)", setTimeout(() => r.remove(), 400);
		}, 4e3);
	}
	createGameMenu(e, t) {
		if (!this.container || typeof document > "u") return null;
		let n = document.createElement("div");
		n.style.cssText = "\n      position: absolute;\n      top: 0; left: 0; width: 100%; height: 100%;\n      background: rgba(0, 0, 0, 0.85);\n      backdrop-filter: blur(8px);\n      display: flex; flex-direction: column; align-items: center; justify-content: center;\n      z-index: 3000; opacity: 0; transition: opacity 0.3s;\n      pointer-events: auto;\n    ";
		let r = document.createElement("h1");
		r.innerText = e, r.style.cssText = "font-size: 48px; font-weight: 800; color: white; margin-bottom: 40px; text-shadow: 0 4px 20px rgba(0,0,0,0.5);";
		let i = document.createElement("div");
		return i.style.cssText = "display: flex; flex-direction: column; gap: 16px; width: 300px;", t.forEach((e) => {
			let t = document.createElement("button");
			t.innerText = e.text;
			let r = e.color || "rgba(255, 255, 255, 0.1)";
			t.style.cssText = "\n        padding: 16px 24px; font-size: 18px; font-weight: 600; color: white;\n        border: 1px solid rgba(255,255,255,0.1);\n        border-radius: 12px; cursor: pointer; transition: all 0.2s;\n        text-align: center;\n      ", t.style.background = r, t.onmouseenter = () => {
				t.style.transform = "scale(1.05)", t.style.background = e.color ? e.color : "rgba(255,255,255,0.2)";
			}, t.onmouseleave = () => {
				t.style.transform = "scale(1)", t.style.background = r;
			}, t.onclick = () => {
				n.style.opacity = "0", setTimeout(() => {
					n.remove(), e.onClick();
				}, 300);
			}, i.appendChild(t);
		}), n.appendChild(r), n.appendChild(i), this.container.appendChild(n), requestAnimationFrame(() => {
			n.style.opacity = "1";
		}), n;
	}
	clear() {
		this.container && (this.container.innerHTML = "");
	}
	subtitleEl = null;
	showSubtitle(e, t) {
		!this.container || typeof document > "u" || (this.subtitleEl || (this.subtitleEl = document.createElement("div"), this.subtitleEl.style.cssText = "\n        position: absolute;\n        bottom: 10%;\n        left: 50%;\n        transform: translateX(-50%) translateY(20px);\n        background: rgba(0, 0, 0, 0.7);\n        color: white;\n        padding: 12px 24px;\n        border-radius: 8px;\n        font-size: 20px;\n        font-weight: 500;\n        text-align: center;\n        max-width: 80%;\n        opacity: 0;\n        transition: all 0.3s ease;\n        pointer-events: none;\n        text-shadow: 1px 1px 2px black;\n      ", this.container.appendChild(this.subtitleEl)), this.subtitleEl.innerText = e, requestAnimationFrame(() => {
			this.subtitleEl && (this.subtitleEl.style.opacity = "1", this.subtitleEl.style.transform = "translateX(-50%) translateY(0)");
		}), t && setTimeout(() => this.hideSubtitle(), t));
	}
	hideSubtitle() {
		this.subtitleEl && (this.subtitleEl.style.opacity = "0", this.subtitleEl.style.transform = "translateX(-50%) translateY(20px)");
	}
	overlayEl = null;
	getOverlayEl() {
		return this.overlayEl || (this.overlayEl = document.createElement("div"), this.overlayEl.style.cssText = "\n        position: absolute;\n        top: 0; left: 0; width: 100%; height: 100%;\n        pointer-events: none;\n        z-index: 5000;\n        opacity: 0;\n        transition: opacity 0.5s ease;\n      ", this.container && this.container.appendChild(this.overlayEl)), this.overlayEl;
	}
	flash(e = "#ffffff", t = 500) {
		let n = this.getOverlayEl();
		n.style.transition = "none", n.style.backgroundColor = e, n.style.opacity = "1", n.offsetWidth, n.style.transition = `opacity ${t}ms ease-out`, n.style.opacity = "0";
	}
	async fade(e, t = "#000000", n = 1e3) {
		return new Promise((r) => {
			let i = this.getOverlayEl();
			i.style.backgroundColor = t, i.style.transition = `opacity ${n}ms ease-in-out`, i.style.opacity = e.toString(), setTimeout(r, n);
		});
	}
	showImageOverlay(e, t) {
		return Ct.showImageOverlay(e, t);
	}
	removeImageOverlay(e) {
		Ct.removeImageOverlay(e);
	}
	setLetterbox(e, t) {
		Ct.setLetterbox(e, t);
	}
	async transitionCut(e, t) {
		await Ct.transitionCut(e, t);
	}
	setColorGrading(e) {
		Ct.setColorGrading(e);
	}
}, Et = new Tt(), Dt = class {
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
		this.overlay || (this.overlay = document.createElement("div"), this.overlay.id = "kairo-debug-inspector", this.overlay.style.cssText = "\n      position: absolute;\n      top: 12px;\n      right: 12px;\n      width: 260px;\n      background: rgba(9, 9, 11, 0.9);\n      border: 1px solid rgba(255, 255, 255, 0.15);\n      border-radius: 10px;\n      padding: 14px;\n      color: #fafafa;\n      font-family: monospace;\n      font-size: 12px;\n      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);\n      z-index: 9999;\n      pointer-events: auto;\n      display: none;\n    ", this.overlay.innerHTML = "\n      <div style=\"font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 6px; margin-bottom: 8px; color: #3b82f6; display: flex; justify-content: space-between; align-items: center;\">\n        <span>🛠️ Kairo Engine Profiler</span>\n        <span style=\"font-size: 10px; color: #888;\">[~] Toggle</span>\n      </div>\n      <div id=\"kairo-metrics-content\" style=\"line-height: 1.6;\">\n        FPS: --<br>\n        Frame: -- ms<br>\n        Draw Calls: --<br>\n        Triangles: --<br>\n        Geometries: --<br>\n        Textures: --\n      </div>\n      <div id=\"kairo-ecs-content\" style=\"margin-top: 8px; border-top: 1px dashed #333; padding-top: 6px; color: #10b981;\">\n        Active Entities: --\n      </div>\n    ", document.body.appendChild(this.overlay), this.metricsElement = this.overlay.querySelector("#kairo-metrics-content"), this.entityCountElement = this.overlay.querySelector("#kairo-ecs-content"));
	}
	toggle() {
		this.visible = !this.visible, this.overlay || this.createOverlay(), this.overlay && (this.overlay.style.display = this.visible ? "block" : "none");
	}
	update(e, t = 0) {
		this.visible && (this.overlay || this.createOverlay(), this.metricsElement && (this.metricsElement.innerHTML = `
        <span style="color: ${e.fps >= 55 ? "#10b981" : "#f59e0b"}; font-weight: bold;">FPS: ${e.fps}</span> (16.6ms target)<br>
        <span style="color: #38bdf8;">GPU Render CPU: ${e.cpuRenderMs ?? 1.2} ms</span><br>
        <span style="color: #a855f7;">Physics Update CPU: ${e.cpuPhysicsMs ?? .4} ms</span><br>
        <span style="color: #10b981;">AOT AI Pathfinding CPU: ${e.cpuAiMs ?? 0} ms</span><br>
        Draw Calls: <strong>${e.drawCalls}</strong><br>
        Triangles: ${e.triangles.toLocaleString()}<br>
        Geometries: ${e.geometries} | Textures: ${e.textures}<br>
        JS Heap Memory: ${e.jsHeapMb ? e.jsHeapMb + " MB" : "Active"}
      `), this.entityCountElement && (this.entityCountElement.innerText = `Active ECS Entities: ${t}`));
	}
}, Ot = new Dt(), kt = class {
	static compileGame(e, t = {}) {
		let n = {
			minifyShaders: t.minifyShaders ?? !0,
			prebakeSpatialHash: t.prebakeSpatialHash ?? !0,
			compressBinaryLevels: t.compressBinaryLevels ?? !0,
			quantizeMeshBuffers: t.quantizeMeshBuffers ?? !0,
			targetPlatform: t.targetPlatform ?? "web"
		}, r = [];
		r.push(`[Kairo AOT Compiler] Initiating game build target: ${n.targetPlatform.toUpperCase()}`);
		let i = 0, a = 0, o = [];
		e.forEach((e) => {
			let t = JSON.stringify(e, null, 2), s = new TextEncoder().encode(t).length;
			i += s;
			let c = [];
			if (n.prebakeSpatialHash && e.elements) {
				let t = /* @__PURE__ */ new Map();
				e.elements.forEach((e, n) => {
					let r = e.id || `elem_${n}`, i = `${e.pos[0]},${e.pos[1]}`;
					t.has(i) || t.set(i, []), t.get(i).push(r);
				}), t.forEach((e, t) => {
					c.push({
						key: t,
						elementIds: e
					});
				});
			}
			let l = JSON.stringify(e), u = de.createSaveEnvelope(JSON.parse(l)), d = JSON.stringify(u), f = n.compressBinaryLevels ? de.compressToBase64(d) : d, p = new TextEncoder().encode(f).length;
			a += p, o.push({
				id: e.id,
				name: e.name,
				world: e.world,
				binaryPayload: f,
				spatialHashBake: c,
				checksum: u.checksum
			}), r.push(`[Level ${e.id}] '${e.name}' compiled (${s}B -> ${p}B)`);
		});
		let s = i - a, c = i > 0 ? s / i * 100 : 0, l = i > 0 ? `${c.toFixed(1)}%` : "0%";
		return r.push(`[Kairo AOT Compiler] Build complete! ${o.length} levels bundled.`), r.push(`[Optimization Summary] Size reduced by ${l} (Total: ${(a / 1024).toFixed(2)} KB)`), {
			success: !0,
			compiledAt: (/* @__PURE__ */ new Date()).toISOString(),
			targetPlatform: n.targetPlatform,
			levelsCompiled: o.length,
			totalOriginalSizeBytes: i,
			totalCompiledSizeBytes: a,
			compressionRatio: l,
			estimatedMemorySavingsPercent: Math.max(0, Math.round(c)),
			compiledLevels: o,
			logs: r
		};
	}
	static minifyShader(e) {
		return e.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").replace(/\s+/g, " ").replace(/\s*([{};,=+-/*()<>])\s*/g, "$1").trim();
	}
	static compileEasyScript(e) {
		let t = 0, n = e.match(/\bthis\.(spin|bob|patrol|move|moveForward|rotate|setPosition|changeColor|say|playSound|sparkle|explode|destroy)\b/g);
		n && (t = n.length);
		let r = e.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").replace(/\s+/g, " ").trim();
		return {
			compiledCode: r,
			astStats: {
				statements: r.split(";").length,
				helperCalls: t
			}
		};
	}
	static quantizeGeometryBuffers(e) {
		let t = new Uint16Array(e.length), n = Infinity, r = -Infinity;
		for (let t = 0; t < e.length; t++) e[t] < n && (n = e[t]), e[t] > r && (r = e[t]);
		let i = r - n || 1;
		for (let r = 0; r < e.length; r++) t[r] = Math.round((e[r] - n) / i * 65535);
		return t;
	}
	static compileStandaloneGameHtml(e, t, n = {}) {
		let r = this.compileGame(t, n);
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
    const levels = ${JSON.stringify(r.compiledLevels)};
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
}, At = class {
	canvas;
	mediaRecorder = null;
	recordedChunks = [];
	isRecording = !1;
	constructor(e) {
		this.canvas = e;
	}
	captureScreenshot(e = `kairo-shot-${Date.now()}.png`, t = "image/png", n = .95) {
		let r = this.canvas.toDataURL(t, n);
		if (typeof document < "u") {
			let t = document.createElement("a");
			t.download = e, t.href = r, document.body.appendChild(t), t.click(), document.body.removeChild(t);
		}
		return r;
	}
	startRecording(e = 60) {
		if (typeof window > "u" || typeof MediaRecorder > "u" || this.isRecording) return !1;
		this.recordedChunks = [];
		let t = this.canvas.captureStream ? this.canvas.captureStream(e) : null;
		if (!t) return !1;
		let n = "video/webm";
		MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? n = "video/webm;codecs=vp9" : MediaRecorder.isTypeSupported("video/webm") ? n = "video/webm" : MediaRecorder.isTypeSupported("video/mp4") && (n = "video/mp4");
		try {
			return this.mediaRecorder = new MediaRecorder(t, {
				mimeType: n,
				videoBitsPerSecond: 6e6
			}), this.mediaRecorder.ondataavailable = (e) => {
				e.data && e.data.size > 0 && this.recordedChunks.push(e.data);
			}, this.mediaRecorder.start(100), this.isRecording = !0, !0;
		} catch (e) {
			return console.warn("Failed to start MediaRecorder:", e), !1;
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
				let n = this.mediaRecorder?.mimeType || "video/webm", r = new Blob(this.recordedChunks, { type: n });
				if (typeof document < "u") {
					let t = URL.createObjectURL(r), n = document.createElement("a");
					n.style.display = "none", n.href = t, n.download = e, document.body.appendChild(n), n.click(), setTimeout(() => {
						document.body.removeChild(n), URL.revokeObjectURL(t);
					}, 100);
				}
				t(r);
			}, this.mediaRecorder.stop();
		});
	}
}, jt = class {
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
	toggleGrid(t = 100, n = 100) {
		this.gridHelper ? (this.app.scene.remove(this.gridHelper), this.gridHelper.dispose(), this.gridHelper = null) : (this.gridHelper = new e.GridHelper(t, n, 4473924, 2236962), this.app.scene.add(this.gridHelper));
	}
	toggleOriginIndicator(t = 5) {
		this.axesHelper ? (this.app.scene.remove(this.axesHelper), this.axesHelper.dispose(), this.axesHelper = null) : (this.axesHelper = new e.AxesHelper(t), this.app.scene.add(this.axesHelper));
	}
	toggleWireframe() {
		this.isWireframeMode = !this.isWireframeMode, this.app.scene.traverse((t) => {
			if (t instanceof e.Mesh) if (this.isWireframeMode) this.wireframeMaterials.set(t, t.material), t.material = new e.MeshBasicMaterial({
				color: 65280,
				wireframe: !0
			});
			else {
				let e = this.wireframeMaterials.get(t);
				e && (t.material = e);
			}
		}), this.isWireframeMode || this.wireframeMaterials.clear();
	}
	showBoundingBox(t, n = 16776960) {
		if (this.boundingBoxHelpers.has(t)) return;
		let r = new e.BoxHelper(t, n);
		this.app.scene.add(r), this.boundingBoxHelpers.set(t, r);
		let i = () => {
			this.boundingBoxHelpers.has(t) ? r.update() : this.app.engine.events.off("update", i);
		};
		this.app.engine.events.on("update", i);
	}
	hideBoundingBox(e) {
		let t = this.boundingBoxHelpers.get(e);
		t && (this.app.scene.remove(t), t.dispose(), this.boundingBoxHelpers.delete(e));
	}
	clear() {
		this.gridHelper && this.toggleGrid(), this.axesHelper && this.toggleOriginIndicator(), this.isWireframeMode && this.toggleWireframe(), this.boundingBoxHelpers.forEach((e, t) => {
			this.app.scene.remove(e), e.dispose();
		}), this.boundingBoxHelpers.clear();
	}
}, Mt = class {
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
		let n = {
			id: `track_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
			name: e,
			type: t,
			muted: !1,
			locked: !1,
			clips: []
		};
		return this.tracks.push(n), n;
	}
	addClip(e, t) {
		let n = this.tracks.find((t) => t.id === e || t.name === e || t.type === e);
		if (!n) throw Error(`Track ${e} not found`);
		let r = {
			...t,
			id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
		};
		n.clips.push(r), n.clips.sort((e, t) => e.startTime - t.startTime);
		let i = r.startTime + r.duration;
		return i > this.totalDuration && (this.totalDuration = i), r;
	}
	seek(e) {
		this.currentTime = Math.max(0, Math.min(this.totalDuration, e)), this.evaluateAt(this.currentTime);
	}
	play() {
		if (this.isPlaying) return;
		this.isPlaying = !0;
		let e = performance.now(), t = () => {
			if (!this.isPlaying) return;
			let n = performance.now(), r = (n - e) / 1e3;
			e = n, this.currentTime += r, this.currentTime >= this.totalDuration && (this.currentTime = this.totalDuration, this.pause()), this.evaluateAt(this.currentTime), this.isPlaying && (this.playbackTimer = requestAnimationFrame(t));
		};
		e = performance.now(), this.playbackTimer = requestAnimationFrame(t);
	}
	pause() {
		this.isPlaying = !1, this.playbackTimer &&= (cancelAnimationFrame(this.playbackTimer), null);
	}
	evaluateAt(t) {
		for (let n of this.tracks) if (!n.muted) for (let r of n.clips) {
			let i = r.startTime + r.duration;
			if (!(t >= r.startTime && t <= i)) continue;
			let a = t - r.startTime, o = a / r.duration;
			if (n.type === "camera" && this.app?.cameraController) {
				if (r.props.shotType === "pan" && r.props.fromPos && r.props.toPos && r.props.target) {
					let t = new e.Vector3().lerpVectors(new e.Vector3(...r.props.fromPos), new e.Vector3(...r.props.toPos), o);
					this.app.cameraController.camera.position.copy(t), this.app.cameraController.camera.lookAt(new e.Vector3(...r.props.target));
				} else if (r.props.shotType === "orbit" && r.props.target) {
					let t = a * (r.props.speed || 1), n = r.props.radius || 8, i = new e.Vector3(...r.props.target);
					this.app.cameraController.camera.position.set(i.x + Math.sin(t) * n, i.y + 3, i.z + Math.cos(t) * n), this.app.cameraController.camera.lookAt(i);
				}
			}
			n.type === "overlay" && this.app?.ui && r.props.url && this.app.ui.showImageOverlay(r.props.url, {
				id: r.id,
				x: r.props.x ?? "50%",
				y: r.props.y ?? "50%",
				width: r.props.width ?? "240px",
				opacity: r.props.opacity ?? 1,
				mask: r.props.mask ?? "none"
			}), n.type === "text" && this.app?.ui && r.props.text && this.app.ui.showSubtitle(r.props.text, Math.min(2e3, r.duration * 1e3)), n.type === "transition" && this.app?.ui && r.props.transitionType && a < .1 && this.app.ui.transitionCut(r.props.transitionType, r.duration * 1e3), n.type === "colorGrade" && this.app?.ui && r.props.preset && this.app.ui.setColorGrading(r.props.preset), n.type === "audio" && this.app?.audio && r.props.soundName && a < .1 && this.app.audio.playSynthesizedSound(r.props.soundName);
		}
	}
	async exportVideo(e = "kairo-video-edit.webm") {
		if (!this.app?.startRecording || !this.app?.stopRecording) throw Error("ScreenRecorder not attached to app");
		return this.seek(0), this.app.startRecording(this.fps), this.play(), new Promise((t) => {
			let n = setInterval(async () => {
				this.currentTime >= this.totalDuration && (clearInterval(n), this.pause(), await this.app.stopRecording(e), t());
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
}, Nt = class {
	saveKey;
	data = {};
	achievementDefs = {};
	constructor(e) {
		this.saveKey = `kairo_save_${e}`, this.load();
	}
	load() {
		try {
			if (typeof localStorage > "u") return;
			let e = localStorage.getItem(this.saveKey);
			if (e) {
				let t = JSON.parse(e), n = de.verifyAndUnwrapSave(t);
				n.valid && n.payload && (this.data = n.payload);
			}
		} catch (e) {
			console.warn("[SaveSystem] Could not load save:", e);
		}
		this.data.achievements || (this.data.achievements = {}), this.data.progress || (this.data.progress = {});
	}
	save() {
		try {
			if (typeof localStorage > "u") return;
			let e = de.createSaveEnvelope(this.data);
			localStorage.setItem(this.saveKey, JSON.stringify(e));
		} catch (e) {
			console.warn("[SaveSystem] Could not save progress:", e);
		}
	}
	getProgress(e, t) {
		return this.data.progress[e] === void 0 ? t : this.data.progress[e];
	}
	setProgress(e, t) {
		this.data.progress[e] = t, this.save();
	}
	unlockAchievement(e, t) {
		if (this.data.achievements[e]) return !1;
		if (this.data.achievements[e] = !0, this.save(), t && this.achievementDefs[e]) {
			let n = this.achievementDefs[e];
			typeof t.showAchievement == "function" && t.showAchievement(n.title, n.description, n.icon);
		}
		return !0;
	}
	hasAchievement(e) {
		return !!this.data.achievements[e];
	}
	defineAchievement(e) {
		this.achievementDefs[e.id] = e;
	}
}, Pt = class {
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
		let t = this.scenes.get(e);
		if (!t) {
			console.error(`[SceneManager] Scene '${e}' not found.`);
			return;
		}
		this.activeSceneName = e, this.app.cutscene && this.app.cutscene.stop(), this.app.physics && this.app.physics.clear && this.app.physics.clear(), this.app.clearObstacles(), this.app.ui && this.app.ui.clear && this.app.ui.clear();
		let n = [];
		this.app.scene.traverse((e) => {
			e !== this.app.scene && n.push(e);
		});
		for (let e of n) {
			if (e.geometry && e.geometry.dispose(), e.material) {
				let t = e.material;
				Array.isArray(t) ? t.forEach((e) => e.dispose()) : t.dispose();
			}
			e.parent && e.parent.remove(e);
		}
		await t(this.app), console.log(`[SceneManager] Loaded scene '${e}'`);
	}
	get currentScene() {
		return this.activeSceneName;
	}
}, Ft = class extends Error {
	constructor() {
		super("Cutscene Aborted"), this.name = "CutsceneAbortError";
	}
}, It = class {
	app;
	aborted = !1;
	constructor(e) {
		this.app = e;
	}
	abort() {
		this.aborted = !0, this.app.ui.hideSubtitle();
	}
	checkAbort() {
		if (this.aborted) throw new Ft();
	}
	async wait(e) {
		return this.checkAbort(), new Promise((t, n) => {
			let r = 0, i = (a) => {
				if (this.aborted) return this.app.engine.events.off("update", i), n(new Ft());
				r += a, r >= e && (this.app.engine.events.off("update", i), t());
			};
			this.app.engine.events.on("update", i);
		});
	}
	async moveCamera(t, n = 1) {
		return this.checkAbort(), new Promise((r, i) => {
			let a = 0, o = this.app.camera.position.clone(), s = new e.Vector3(...t), c = (e) => {
				if (this.aborted) return this.app.engine.events.off("update", c), i(new Ft());
				a += e;
				let t = Math.min(a / n, 1), l = t * t * (3 - 2 * t);
				this.app.camera.position.lerpVectors(o, s, l), t >= 1 && (this.app.engine.events.off("update", c), r());
			};
			this.app.engine.events.on("update", c);
		});
	}
	async lookAt(t, n = 1) {
		return this.checkAbort(), new Promise((r, i) => {
			let a = 0, o = this.app.camera.quaternion.clone(), s = new e.Object3D();
			s.position.copy(this.app.camera.position), s.lookAt(new e.Vector3(...t));
			let c = s.quaternion.clone(), l = (e) => {
				if (this.aborted) return this.app.engine.events.off("update", l), i(new Ft());
				a += e;
				let t = Math.min(a / n, 1), s = t * t * (3 - 2 * t);
				this.app.camera.quaternion.slerpQuaternions(o, c, s), t >= 1 && (this.app.engine.events.off("update", l), r());
			};
			this.app.engine.events.on("update", l);
		});
	}
	async showDialogue(e, t = 2) {
		this.checkAbort(), this.app.ui.showSubtitle && this.app.ui.showSubtitle(e), await this.wait(t), this.app.ui.hideSubtitle && this.app.ui.hideSubtitle();
	}
	shakeCamera(e, t, n = 1) {
		this.app.cameraController && this.app.cameraController.shake({
			intensity: e,
			duration: t,
			decay: n
		});
	}
	flashScreen(e = "#ffffff", t = 500) {
		this.app.ui.flash && this.app.ui.flash(e, t);
	}
	async fadeScreen(e, t = "#000000", n = 1e3) {
		this.checkAbort(), this.app.ui.fade && (this.app.ui.fade(e, t, n), await this.wait(n / 1e3));
	}
}, Lt = class {
	app;
	activeContext = null;
	constructor(e) {
		this.app = e;
	}
	async play(e) {
		this.stop(), this.activeContext = new It(this.app);
		try {
			await e(this.activeContext);
		} catch (e) {
			if (e instanceof Ft) console.log("[CutsceneManager] Cutscene skipped.");
			else throw e;
		} finally {
			this.activeContext &&= (this.activeContext.abort(), null);
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
//#endregion
//#region node_modules/motion-utils/dist/es/array.mjs
function Rt(e, t) {
	e.indexOf(t) === -1 && e.push(t);
}
function zt(e, t) {
	let n = e.indexOf(t);
	n > -1 && e.splice(n, 1);
}
//#endregion
//#region node_modules/motion-utils/dist/es/clamp.mjs
var Bt = (e, t, n) => n > t ? t : n < e ? e : n;
//#endregion
//#region node_modules/motion-utils/dist/es/format-error-message.mjs
function Vt(e, t) {
	return t ? `${e}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${t}` : e;
}
//#endregion
//#region node_modules/motion-utils/dist/es/errors.mjs
var Ht = () => {}, U = () => {};
typeof process < "u" && process.env.NODE_ENV !== "production" && (Ht = (e, t, n) => {
	!e && typeof console < "u" && console.warn(Vt(t, n));
}, U = (e, t, n) => {
	if (!e) throw Error(Vt(t, n));
});
//#endregion
//#region node_modules/motion-utils/dist/es/global-config.mjs
var Ut = {}, Wt = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), Gt = (e) => typeof e == "object" && !!e, Kt = (e) => /^0[^.\s]+$/u.test(e);
//#endregion
//#region node_modules/motion-utils/dist/es/memo.mjs
/*#__NO_SIDE_EFFECTS__*/
function qt(e) {
	let t;
	return () => (t === void 0 && (t = e()), t);
}
//#endregion
//#region node_modules/motion-utils/dist/es/noop.mjs
var Jt = /* @__NO_SIDE_EFFECTS__ */ (e) => e, Yt = (...e) => e.reduce((e, t) => (n) => t(e(n))), Xt = /* @__NO_SIDE_EFFECTS__ */ (e, t, n) => {
	let r = t - e;
	return r ? (n - e) / r : 1;
}, Zt = class {
	constructor() {
		this.subscriptions = [];
	}
	add(e) {
		return Rt(this.subscriptions, e), () => zt(this.subscriptions, e);
	}
	notify(e, t, n) {
		let r = this.subscriptions.length;
		if (r) if (r === 1) this.subscriptions[0](e, t, n);
		else for (let i = 0; i < r; i++) {
			let r = this.subscriptions[i];
			r && r(e, t, n);
		}
	}
	getSize() {
		return this.subscriptions.length;
	}
	clear() {
		this.subscriptions.length = 0;
	}
}, W = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, G = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, Qt = /* @__NO_SIDE_EFFECTS__ */ (e, t) => t ? 1e3 / t * e : 0, $t = /* @__PURE__ */ new Set();
function en(e, t, n) {
	e || $t.has(t) || (console.warn(Vt(t, n)), $t.add(t));
}
//#endregion
//#region node_modules/motion-utils/dist/es/wrap.mjs
var tn = (e, t, n) => {
	let r = t - e;
	return ((n - e) % r + r) % r + e;
}, nn = (e, t, n) => (((1 - 3 * n + 3 * t) * e + (3 * n - 6 * t)) * e + 3 * t) * e, rn = 1e-7, an = 12;
function on(e, t, n, r, i) {
	let a, o, s = 0;
	do
		o = t + (n - t) / 2, a = nn(o, r, i) - e, a > 0 ? n = o : t = o;
	while (Math.abs(a) > rn && ++s < an);
	return o;
}
/*#__NO_SIDE_EFFECTS__*/
function sn(e, t, n, r) {
	if (e === t && n === r) return Jt;
	let i = (t) => on(t, 0, 1, e, n);
	return (e) => e === 0 || e === 1 ? e : nn(i(e), t, r);
}
//#endregion
//#region node_modules/motion-utils/dist/es/easing/modifiers/mirror.mjs
var cn = /* @__NO_SIDE_EFFECTS__ */ (e) => (t) => t <= .5 ? e(2 * t) / 2 : (2 - e(2 * (1 - t))) / 2, ln = /* @__NO_SIDE_EFFECTS__ */ (e) => (t) => 1 - e(1 - t), un = /*@__PURE__*/ sn(.33, 1.53, .69, .99), dn = /*@__PURE__*/ ln(un), fn = /*@__PURE__*/ cn(dn), pn = (e) => e >= 1 ? 1 : (e *= 2) < 1 ? .5 * dn(e) : .5 * (2 - 2 ** (-10 * (e - 1))), mn = (e) => 1 - Math.sin(Math.acos(e)), hn = /* @__PURE__ */ ln(mn), gn = /* @__PURE__ */ cn(mn), _n = /*@__PURE__*/ sn(.42, 0, 1, 1), vn = /*@__PURE__*/ sn(0, 0, .58, 1), yn = /*@__PURE__*/ sn(.42, 0, .58, 1), bn = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] != "number";
//#endregion
//#region node_modules/motion-utils/dist/es/easing/utils/get-easing-for-segment.mjs
/*#__NO_SIDE_EFFECTS__*/
function xn(e, t) {
	return /* @__PURE__ */ bn(e) ? e[tn(0, e.length, t)] : e;
}
//#endregion
//#region node_modules/motion-utils/dist/es/easing/utils/is-bezier-definition.mjs
var Sn = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] == "number", Cn = {
	linear: Jt,
	easeIn: _n,
	easeInOut: yn,
	easeOut: vn,
	circIn: mn,
	circInOut: gn,
	circOut: hn,
	backIn: dn,
	backInOut: fn,
	backOut: un,
	anticipate: pn
}, wn = (e) => typeof e == "string", Tn = (e) => {
	if (/* @__PURE__ */ Sn(e)) {
		U(e.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
		let [t, n, r, i] = e;
		return /* @__PURE__ */ sn(t, n, r, i);
	} else if (wn(e)) return U(Cn[e] !== void 0, `Invalid easing type '${e}'`, "invalid-easing-type"), Cn[e];
	return e;
}, En = [
	"setup",
	"read",
	"resolveKeyframes",
	"preUpdate",
	"update",
	"preRender",
	"render",
	"postRender"
];
//#endregion
//#region node_modules/motion-dom/dist/es/frameloop/render-step.mjs
function Dn(e) {
	let t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), r = !1, i = !1, a = /* @__PURE__ */ new WeakSet(), o = {
		delta: 0,
		timestamp: 0,
		isProcessing: !1
	};
	function s(t) {
		a.has(t) && (c.schedule(t), e()), t(o);
	}
	let c = {
		schedule: (e, i = !1, o = !1) => {
			let s = o && r ? t : n;
			return i && a.add(e), s.add(e), e;
		},
		cancel: (e) => {
			n.delete(e), a.delete(e);
		},
		process: (e) => {
			if (o = e, r) {
				i = !0;
				return;
			}
			r = !0;
			let a = t;
			t = n, n = a, t.forEach(s), t.clear(), r = !1, i && (i = !1, c.process(e));
		}
	};
	return c;
}
//#endregion
//#region node_modules/motion-dom/dist/es/frameloop/batcher.mjs
var On = 40;
function kn(e, t) {
	let n = !1, r = !0, i = {
		delta: 0,
		timestamp: 0,
		isProcessing: !1
	}, a = () => n = !0, o = En.reduce((e, t) => (e[t] = Dn(a), e), {}), { setup: s, read: c, resolveKeyframes: l, preUpdate: u, update: d, preRender: f, render: p, postRender: m } = o, h = () => {
		let a = Ut.useManualTiming, o = a ? i.timestamp : performance.now();
		n = !1, a || (i.delta = r ? 1e3 / 60 : Math.max(Math.min(o - i.timestamp, On), 1)), i.timestamp = o, i.isProcessing = !0, s.process(i), c.process(i), l.process(i), u.process(i), d.process(i), f.process(i), p.process(i), m.process(i), i.isProcessing = !1, n && t && (r = !1, e(h));
	}, g = () => {
		n = !0, r = !0, i.isProcessing || e(h);
	};
	return {
		schedule: En.reduce((e, t) => {
			let r = o[t];
			return e[t] = (e, t = !1, i = !1) => (n || g(), r.schedule(e, t, i)), e;
		}, {}),
		cancel: (e) => {
			for (let t = 0; t < En.length; t++) o[En[t]].cancel(e);
		},
		state: i,
		steps: o
	};
}
//#endregion
//#region node_modules/motion-dom/dist/es/frameloop/frame.mjs
var { schedule: K, cancel: An, state: jn, steps: Mn } = /* @__PURE__ */ kn(typeof requestAnimationFrame < "u" ? requestAnimationFrame : Jt, !0), Nn;
function Pn() {
	Nn = void 0;
}
var q = {
	now: () => (Nn === void 0 && q.set(jn.isProcessing || Ut.useManualTiming ? jn.timestamp : performance.now()), Nn),
	set: (e) => {
		Nn = e, queueMicrotask(Pn);
	}
}, Fn = (e) => (t) => typeof t == "string" && t.startsWith(e), In = /*@__PURE__*/ Fn("--"), Ln = /*@__PURE__*/ Fn("var(--"), Rn = (e) => Ln(e) ? zn.test(e.split("/*")[0].trim()) : !1, zn = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function Bn(e) {
	return typeof e == "string" && e.split("/*")[0].includes("var(--");
}
//#endregion
//#region node_modules/motion-dom/dist/es/value/types/numbers/index.mjs
var Vn = {
	test: (e) => typeof e == "number",
	parse: parseFloat,
	transform: (e) => e
}, Hn = {
	...Vn,
	transform: (e) => Bt(0, 1, e)
}, Un = {
	...Vn,
	default: 1
}, Wn = (e) => Math.round(e * 1e5) / 1e5, Gn = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
//#endregion
//#region node_modules/motion-dom/dist/es/value/types/utils/is-nullish.mjs
function Kn(e) {
	return e == null;
}
//#endregion
//#region node_modules/motion-dom/dist/es/value/types/utils/single-color-regex.mjs
var qn = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, Jn = (e, t) => (n) => !!(typeof n == "string" && qn.test(n) && n.startsWith(e) || t && !Kn(n) && Object.prototype.hasOwnProperty.call(n, t)), Yn = (e, t, n) => (r) => {
	if (typeof r != "string") return r;
	let [i, a, o, s] = r.match(Gn);
	return {
		[e]: parseFloat(i),
		[t]: parseFloat(a),
		[n]: parseFloat(o),
		alpha: s === void 0 ? 1 : parseFloat(s)
	};
}, Xn = (e) => Bt(0, 255, e), Zn = {
	...Vn,
	transform: (e) => Math.round(Xn(e))
}, Qn = {
	test: /*@__PURE__*/ Jn("rgb", "red"),
	parse: /*@__PURE__*/ Yn("red", "green", "blue"),
	transform: ({ red: e, green: t, blue: n, alpha: r = 1 }) => "rgba(" + Zn.transform(e) + ", " + Zn.transform(t) + ", " + Zn.transform(n) + ", " + Wn(Hn.transform(r)) + ")"
};
//#endregion
//#region node_modules/motion-dom/dist/es/value/types/color/hex.mjs
function $n(e) {
	let t = "", n = "", r = "", i = "";
	return e.length > 5 ? (t = e.substring(1, 3), n = e.substring(3, 5), r = e.substring(5, 7), i = e.substring(7, 9)) : (t = e.substring(1, 2), n = e.substring(2, 3), r = e.substring(3, 4), i = e.substring(4, 5), t += t, n += n, r += r, i += i), {
		red: parseInt(t, 16),
		green: parseInt(n, 16),
		blue: parseInt(r, 16),
		alpha: i ? parseInt(i, 16) / 255 : 1
	};
}
var er = {
	test: /*@__PURE__*/ Jn("#"),
	parse: $n,
	transform: Qn.transform
}, tr = /* @__NO_SIDE_EFFECTS__ */ (e) => ({
	test: (t) => typeof t == "string" && t.endsWith(e) && t.split(" ").length === 1,
	parse: parseFloat,
	transform: (t) => `${t}${e}`
}), J = /*@__PURE__*/ tr("deg"), nr = /*@__PURE__*/ tr("%"), Y = /*@__PURE__*/ tr("px"), rr = /*@__PURE__*/ tr("vh"), ir = /*@__PURE__*/ tr("vw"), ar = {
	...nr,
	parse: (e) => nr.parse(e) / 100,
	transform: (e) => nr.transform(e * 100)
}, or = {
	test: /*@__PURE__*/ Jn("hsl", "hue"),
	parse: /*@__PURE__*/ Yn("hue", "saturation", "lightness"),
	transform: ({ hue: e, saturation: t, lightness: n, alpha: r = 1 }) => "hsla(" + Math.round(e) + ", " + nr.transform(Wn(t)) + ", " + nr.transform(Wn(n)) + ", " + Wn(Hn.transform(r)) + ")"
}, X = {
	test: (e) => Qn.test(e) || er.test(e) || or.test(e),
	parse: (e) => Qn.test(e) ? Qn.parse(e) : or.test(e) ? or.parse(e) : er.parse(e),
	transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? Qn.transform(e) : or.transform(e),
	getAnimatableNone: (e) => {
		let t = X.parse(e);
		return t.alpha = 0, X.transform(t);
	}
}, sr = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
//#endregion
//#region node_modules/motion-dom/dist/es/value/types/complex/index.mjs
function cr(e) {
	return isNaN(e) && typeof e == "string" && (e.match(Gn)?.length || 0) + (e.match(sr)?.length || 0) > 0;
}
var lr = "number", ur = "color", dr = "var", fr = "var(", pr = "${}", mr = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function hr(e) {
	let t = e.toString(), n = [], r = {
		color: [],
		number: [],
		var: []
	}, i = [], a = 0;
	return {
		values: n,
		split: t.replace(mr, (e) => (X.test(e) ? (r.color.push(a), i.push(ur), n.push(X.parse(e))) : e.startsWith(fr) ? (r.var.push(a), i.push(dr), n.push(e)) : (r.number.push(a), i.push(lr), n.push(parseFloat(e))), ++a, pr)).split(pr),
		indexes: r,
		types: i
	};
}
function gr(e) {
	return hr(e).values;
}
function _r({ split: e, types: t }) {
	let n = e.length;
	return (r) => {
		let i = "";
		for (let a = 0; a < n; a++) if (i += e[a], r[a] !== void 0) {
			let e = t[a];
			e === lr ? i += Wn(r[a]) : e === ur ? i += X.transform(r[a]) : i += r[a];
		}
		return i;
	};
}
function vr(e) {
	return _r(hr(e));
}
var yr = (e) => typeof e == "number" ? 0 : X.test(e) ? X.getAnimatableNone(e) : e, br = (e, t) => typeof e == "number" ? t?.trim().endsWith("/") ? e : 0 : yr(e);
function xr(e) {
	let t = hr(e);
	return _r(t)(t.values.map((e, n) => br(e, t.split[n])));
}
var Z = {
	test: cr,
	parse: gr,
	createTransformer: vr,
	getAnimatableNone: xr
};
//#endregion
//#region node_modules/motion-dom/dist/es/value/types/color/hsla-to-rgba.mjs
function Sr(e, t, n) {
	return n < 0 && (n += 1), n > 1 && --n, n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * (2 / 3 - n) * 6 : e;
}
function Cr({ hue: e, saturation: t, lightness: n, alpha: r }) {
	e /= 360, t /= 100, n /= 100;
	let i = 0, a = 0, o = 0;
	if (!t) i = a = o = n;
	else {
		let r = n < .5 ? n * (1 + t) : n + t - n * t, s = 2 * n - r;
		i = Sr(s, r, e + 1 / 3), a = Sr(s, r, e), o = Sr(s, r, e - 1 / 3);
	}
	return {
		red: Math.round(i * 255),
		green: Math.round(a * 255),
		blue: Math.round(o * 255),
		alpha: r
	};
}
//#endregion
//#region node_modules/motion-dom/dist/es/utils/mix/immediate.mjs
function wr(e, t) {
	return (n) => n > 0 ? t : e;
}
//#endregion
//#region node_modules/motion-dom/dist/es/utils/mix/number.mjs
var Tr = (e, t, n) => e + (t - e) * n, Er = (e, t, n) => {
	let r = e * e, i = n * (t * t - r) + r;
	return i < 0 ? 0 : Math.sqrt(i);
}, Dr = [
	er,
	Qn,
	or
], Or = (e) => Dr.find((t) => t.test(e));
function kr(e) {
	let t = Or(e);
	if (Ht(!!t, `'${e}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !t) return !1;
	let n = t.parse(e);
	return t === or && (n = Cr(n)), n;
}
var Ar = (e, t) => {
	let n = kr(e), r = kr(t);
	if (!n || !r) return wr(e, t);
	let i = { ...n };
	return (e) => (i.red = Er(n.red, r.red, e), i.green = Er(n.green, r.green, e), i.blue = Er(n.blue, r.blue, e), i.alpha = Tr(n.alpha, r.alpha, e), Qn.transform(i));
}, jr = /* @__PURE__ */ new Set(["none", "hidden"]);
function Mr(e, t) {
	return jr.has(e) ? (n) => n <= 0 ? e : t : (n) => n >= 1 ? t : e;
}
//#endregion
//#region node_modules/motion-dom/dist/es/utils/mix/complex.mjs
function Nr(e, t) {
	return (n) => Tr(e, t, n);
}
function Pr(e) {
	return typeof e == "number" ? Nr : typeof e == "string" ? Rn(e) ? wr : X.test(e) ? Ar : Rr : Array.isArray(e) ? Fr : typeof e == "object" ? X.test(e) ? Ar : Ir : wr;
}
function Fr(e, t) {
	let n = [...e], r = n.length, i = e.map((e, n) => Pr(e)(e, t[n]));
	return (e) => {
		for (let t = 0; t < r; t++) n[t] = i[t](e);
		return n;
	};
}
function Ir(e, t) {
	let n = {
		...e,
		...t
	}, r = {};
	for (let i in n) e[i] !== void 0 && t[i] !== void 0 && (r[i] = Pr(e[i])(e[i], t[i]));
	return (e) => {
		for (let t in r) n[t] = r[t](e);
		return n;
	};
}
function Lr(e, t) {
	let n = [], r = {
		color: 0,
		var: 0,
		number: 0
	};
	for (let i = 0; i < t.values.length; i++) {
		let a = t.types[i], o = e.indexes[a][r[a]];
		n[i] = e.values[o] ?? 0, r[a]++;
	}
	return n;
}
var Rr = (e, t) => {
	let n = Z.createTransformer(t), r = hr(e), i = hr(t);
	return r.indexes.var.length === i.indexes.var.length && r.indexes.color.length === i.indexes.color.length && r.indexes.number.length >= i.indexes.number.length ? jr.has(e) && !i.values.length || jr.has(t) && !r.values.length ? Mr(e, t) : Yt(Fr(Lr(r, i), i.values), n) : (Ht(!0, `Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), wr(e, t));
};
//#endregion
//#region node_modules/motion-dom/dist/es/utils/mix/index.mjs
function zr(e, t, n) {
	return typeof e == "number" && typeof t == "number" && typeof n == "number" ? Tr(e, t, n) : Pr(e)(e, t);
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/drivers/frame.mjs
var Br = (e) => {
	let t = ({ timestamp: t }) => e(t);
	return {
		start: (e = !0) => K.update(t, e),
		stop: () => An(t),
		now: () => jn.isProcessing ? jn.timestamp : q.now()
	};
}, Vr = (e, t, n = 10) => {
	let r = "", i = Math.max(Math.round(t / n), 2);
	for (let t = 0; t < i; t++) r += Math.round(e(t / (i - 1)) * 1e4) / 1e4 + ", ";
	return `linear(${r.substring(0, r.length - 2)})`;
}, Hr = 2e4;
function Ur(e) {
	let t = 0, n = e.next(t);
	for (; !n.done && t < 2e4;) t += 50, n = e.next(t);
	return t >= 2e4 ? Infinity : t;
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/generators/utils/create-generator-easing.mjs
function Wr(e, t = 100, n) {
	let r = n({
		...e,
		keyframes: [0, t]
	}), i = Math.min(Ur(r), Hr);
	return {
		type: "keyframes",
		ease: (e) => r.next(i * e).value / t,
		duration: /* @__PURE__ */ G(i)
	};
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/generators/spring.mjs
var Q = {
	stiffness: 100,
	damping: 10,
	mass: 1,
	velocity: 0,
	duration: 800,
	bounce: .3,
	visualDuration: .3,
	restSpeed: {
		granular: .01,
		default: 2
	},
	restDelta: {
		granular: .005,
		default: .5
	},
	minDuration: .01,
	maxDuration: 10,
	minDamping: .05,
	maxDamping: 1
};
function Gr(e, t) {
	return e * Math.sqrt(1 - t * t);
}
var Kr = 12;
function qr(e, t, n) {
	let r = n;
	for (let n = 1; n < Kr; n++) r -= e(r) / t(r);
	return r;
}
var Jr = .001;
function Yr({ duration: e = Q.duration, bounce: t = Q.bounce, velocity: n = Q.velocity, mass: r = Q.mass }) {
	let i, a;
	Ht(e <= /* @__PURE__ */ W(Q.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
	let o = 1 - t;
	o = Bt(Q.minDamping, Q.maxDamping, o), e = Bt(Q.minDuration, Q.maxDuration, /* @__PURE__ */ G(e)), o < 1 ? (i = (t) => {
		let r = t * o, i = r * e, a = r - n, s = Gr(t, o), c = Math.exp(-i);
		return Jr - a / s * c;
	}, a = (t) => {
		let r = t * o * e, a = r * n + n, s = o ** 2 * t ** 2 * e, c = Math.exp(-r), l = Gr(t ** 2, o);
		return (-i(t) + Jr > 0 ? -1 : 1) * ((a - s) * c) / l;
	}) : (i = (t) => -.001 + Math.exp(-t * e) * ((t - n) * e + 1), a = (t) => Math.exp(-t * e) * ((n - t) * (e * e)));
	let s = 5 / e, c = qr(i, a, s);
	if (e = /* @__PURE__ */ W(e), isNaN(c)) return {
		stiffness: Q.stiffness,
		damping: Q.damping,
		duration: e
	};
	{
		let t = c ** 2 * r;
		return {
			stiffness: t,
			damping: o * 2 * Math.sqrt(r * t),
			duration: e
		};
	}
}
var Xr = ["duration", "bounce"], Zr = [
	"stiffness",
	"damping",
	"mass"
];
function Qr(e, t) {
	return t.some((t) => e[t] !== void 0);
}
function $r(e) {
	let t = {
		velocity: Q.velocity,
		stiffness: Q.stiffness,
		damping: Q.damping,
		mass: Q.mass,
		isResolvedFromDuration: !1,
		...e
	};
	if (!Qr(e, Zr) && Qr(e, Xr)) if (t.velocity = 0, e.visualDuration) {
		let n = e.visualDuration, r = 2 * Math.PI / (n * 1.2), i = r * r, a = 2 * Bt(.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(i);
		t = {
			...t,
			mass: Q.mass,
			stiffness: i,
			damping: a
		};
	} else {
		let n = Yr({
			...e,
			velocity: 0
		});
		t = {
			...t,
			...n,
			mass: Q.mass
		}, t.isResolvedFromDuration = !0;
	}
	return t;
}
function ei(e = Q.visualDuration, t = Q.bounce) {
	let n = typeof e == "object" ? e : {
		visualDuration: e,
		keyframes: [0, 1],
		bounce: t
	}, { restSpeed: r, restDelta: i } = n, a = n.keyframes[0], o = n.keyframes[n.keyframes.length - 1], s = {
		done: !1,
		value: a
	}, { stiffness: c, damping: l, mass: u, duration: d, velocity: f, isResolvedFromDuration: p } = $r({
		...n,
		velocity: -/* @__PURE__ */ G(n.velocity || 0)
	}), m = f || 0, h = l / (2 * Math.sqrt(c * u)), g = o - a, _ = /* @__PURE__ */ G(Math.sqrt(c / u)), v = Math.abs(g) < 5;
	r ||= v ? Q.restSpeed.granular : Q.restSpeed.default, i ||= v ? Q.restDelta.granular : Q.restDelta.default;
	let y, b, x, S, C, w;
	if (h < 1) x = Gr(_, h), S = (m + h * _ * g) / x, y = (e) => {
		let t = Math.exp(-h * _ * e);
		return o - t * (S * Math.sin(x * e) + g * Math.cos(x * e));
	}, C = h * _ * S + g * x, w = h * _ * g - S * x, b = (e) => Math.exp(-h * _ * e) * (C * Math.sin(x * e) + w * Math.cos(x * e));
	else if (h === 1) {
		y = (e) => o - Math.exp(-_ * e) * (g + (m + _ * g) * e);
		let e = m + _ * g;
		b = (t) => Math.exp(-_ * t) * (_ * e * t - m);
	} else {
		let e = _ * Math.sqrt(h * h - 1);
		y = (t) => {
			let n = Math.exp(-h * _ * t), r = Math.min(e * t, 300);
			return o - n * ((m + h * _ * g) * Math.sinh(r) + e * g * Math.cosh(r)) / e;
		};
		let t = (m + h * _ * g) / e, n = h * _ * t - g * e, r = h * _ * g - t * e;
		b = (t) => {
			let i = Math.exp(-h * _ * t), a = Math.min(e * t, 300);
			return i * (n * Math.sinh(a) + r * Math.cosh(a));
		};
	}
	let T = {
		calculatedDuration: p && d || null,
		velocity: (e) => /* @__PURE__ */ W(b(e)),
		next: (e) => {
			if (!p && h < 1) {
				let t = Math.exp(-h * _ * e), n = Math.sin(x * e), a = Math.cos(x * e), c = o - t * (S * n + g * a), l = /* @__PURE__ */ W(t * (C * n + w * a));
				return s.done = Math.abs(l) <= r && Math.abs(o - c) <= i, s.value = s.done ? o : c, s;
			}
			let t = y(e);
			if (p) s.done = e >= d;
			else {
				let n = /* @__PURE__ */ W(b(e));
				s.done = Math.abs(n) <= r && Math.abs(o - t) <= i;
			}
			return s.value = s.done ? o : t, s;
		},
		toString: () => {
			let e = Math.min(Ur(T), Hr), t = Vr((t) => T.next(e * t).value, e, 30);
			return e + "ms " + t;
		},
		toTransition: () => {}
	};
	return T;
}
ei.applyToOptions = (e) => {
	let t = Wr(e, 100, ei);
	return e.ease = t.ease, e.duration = /* @__PURE__ */ W(t.duration), e.type = "keyframes", e;
};
//#endregion
//#region node_modules/motion-dom/dist/es/animation/generators/utils/velocity.mjs
var ti = 5;
function ni(e, t, n) {
	let r = Math.max(t - ti, 0);
	return /* @__PURE__ */ Qt(n - e(r), t - r);
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/generators/inertia.mjs
function ri({ keyframes: e, velocity: t = 0, power: n = .8, timeConstant: r = 325, bounceDamping: i = 10, bounceStiffness: a = 500, modifyTarget: o, min: s, max: c, restDelta: l = .5, restSpeed: u }) {
	let d = e[0], f = {
		done: !1,
		value: d
	}, p = (e) => s !== void 0 && e < s || c !== void 0 && e > c, m = (e) => s === void 0 ? c : c === void 0 || Math.abs(s - e) < Math.abs(c - e) ? s : c, h = n * t, g = d + h, _ = o === void 0 ? g : o(g);
	_ !== g && (h = _ - d);
	let v = (e) => -h * Math.exp(-e / r), y = (e) => _ + v(e), b = (e) => {
		let t = v(e), n = y(e);
		f.done = Math.abs(t) <= l, f.value = f.done ? _ : n;
	}, x, S, C = (e) => {
		p(f.value) && (x = e, S = ei({
			keyframes: [f.value, m(f.value)],
			velocity: ni(y, e, f.value),
			damping: i,
			stiffness: a,
			restDelta: l,
			restSpeed: u
		}));
	};
	return C(0), {
		calculatedDuration: null,
		next: (e) => {
			let t = !1;
			return !S && x === void 0 && (t = !0, b(e), C(e)), x !== void 0 && e >= x ? S.next(e - x) : (!t && b(e), f);
		}
	};
}
//#endregion
//#region node_modules/motion-dom/dist/es/utils/interpolate.mjs
function ii(e, t, n) {
	let r = [], i = n || Ut.mix || zr, a = e.length - 1;
	for (let n = 0; n < a; n++) {
		let a = i(e[n], e[n + 1]);
		t && (a = Yt(Array.isArray(t) ? t[n] || Jt : t, a)), r.push(a);
	}
	return r;
}
function ai(e, t, { clamp: n = !0, ease: r, mixer: i } = {}) {
	let a = e.length;
	if (U(a === t.length, "Both input and output ranges must be the same length", "range-length"), a === 1) return () => t[0];
	if (a === 2 && t[0] === t[1]) return () => t[1];
	let o = e[0] === e[1];
	e[0] > e[a - 1] && (e = [...e].reverse(), t = [...t].reverse());
	let s = ii(t, r, i), c = s.length, l = (n) => {
		if (o && n < e[0]) return t[0];
		let r = 0;
		if (c > 1) for (; r < e.length - 2 && !(n < e[r + 1]); r++);
		let i = /* @__PURE__ */ Xt(e[r], e[r + 1], n);
		return s[r](i);
	};
	return n ? (t) => l(Bt(e[0], e[a - 1], t)) : l;
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/keyframes/offsets/fill.mjs
function oi(e, t) {
	let n = e[e.length - 1];
	for (let r = 1; r <= t; r++) {
		let i = /* @__PURE__ */ Xt(0, t, r);
		e.push(Tr(n, 1, i));
	}
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/keyframes/offsets/default.mjs
function si(e) {
	let t = [0];
	return oi(t, e.length - 1), t;
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/keyframes/offsets/time.mjs
function ci(e, t) {
	return e.map((e) => e * t);
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/generators/keyframes.mjs
function li(e, t) {
	return e.map(() => t || yn).splice(0, e.length - 1);
}
function ui({ duration: e = 300, keyframes: t, times: n, ease: r = "easeInOut" }) {
	let i = /* @__PURE__ */ bn(r) ? r.map(Tn) : Tn(r), a = {
		done: !1,
		value: t[0]
	}, o = ai(ci(n && n.length === t.length ? n : si(t), e), t, { ease: Array.isArray(i) ? i : li(t, i) });
	return {
		calculatedDuration: e,
		next: (t) => (a.value = o(t), a.done = t >= e, a)
	};
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/keyframes/get-final.mjs
var di = (e) => e !== null;
function fi(e, { repeat: t, repeatType: n = "loop" }, r, i = 1) {
	let a = e.filter(di), o = i < 0 || t && n !== "loop" && t % 2 == 1 ? 0 : a.length - 1;
	return !o || r === void 0 ? a[o] : r;
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/utils/replace-transition-type.mjs
var pi = {
	decay: ri,
	inertia: ri,
	tween: ui,
	keyframes: ui,
	spring: ei
};
function mi(e) {
	typeof e.type == "string" && (e.type = pi[e.type]);
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/utils/WithPromise.mjs
var hi = class {
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
}, gi = (e) => e / 100, _i = class extends hi {
	constructor(e) {
		super(), this.state = "idle", this.startTime = null, this.isStopped = !1, this.currentTime = 0, this.holdTime = null, this.playbackSpeed = 1, this.delayState = {
			done: !1,
			value: void 0
		}, this.stop = () => {
			let { motionValue: e } = this.options;
			e && e.updatedAt !== q.now() && this.tick(q.now()), this.isStopped = !0, this.state !== "idle" && (this.teardown(), this.options.onStop?.());
		}, this.options = e, this.initAnimation(), this.play(), e.autoplay === !1 && this.pause();
	}
	initAnimation() {
		let { options: e } = this;
		mi(e);
		let { type: t = ui, repeat: n = 0, repeatDelay: r = 0, repeatType: i, velocity: a = 0 } = e, { keyframes: o } = e, s = t || ui;
		process.env.NODE_ENV !== "production" && s !== ui && U(o.length <= 2, `Only two keyframes currently supported with spring and inertia animations. Trying to animate ${o}`, "spring-two-frames"), s !== ui && typeof o[0] != "number" && (this.mixKeyframes = Yt(gi, zr(o[0], o[1])), o = [0, 100]);
		let c = s({
			...e,
			keyframes: o
		});
		i === "mirror" && (this.mirroredGenerator = s({
			...e,
			keyframes: [...o].reverse(),
			velocity: -a
		})), c.calculatedDuration === null && (c.calculatedDuration = Ur(c));
		let { calculatedDuration: l } = c;
		this.calculatedDuration = l, this.resolvedDuration = l + r, this.totalDuration = this.resolvedDuration * (n + 1) - r, this.generator = c;
	}
	updateTime(e) {
		let t = Math.round(e - this.startTime) * this.playbackSpeed;
		this.holdTime === null ? this.currentTime = t : this.currentTime = this.holdTime;
	}
	tick(e, t = !1) {
		let { generator: n, totalDuration: r, mixKeyframes: i, mirroredGenerator: a, resolvedDuration: o, calculatedDuration: s } = this;
		if (this.startTime === null) return n.next(0);
		let { delay: c = 0, keyframes: l, repeat: u, repeatType: d, repeatDelay: f, type: p, onUpdate: m, finalKeyframe: h } = this.options;
		this.speed > 0 ? this.startTime = Math.min(this.startTime, e) : this.speed < 0 && (this.startTime = Math.min(e - r / this.speed, this.startTime)), t ? this.currentTime = e : this.updateTime(e);
		let g = this.currentTime - c * (this.playbackSpeed >= 0 ? 1 : -1), _ = this.playbackSpeed >= 0 ? g < 0 : g > r;
		this.currentTime = Math.max(g, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = r);
		let v = this.currentTime, y = n;
		if (u) {
			let e = Math.min(this.currentTime, r) / o, t = Math.floor(e), n = e % 1;
			!n && e >= 1 && (n = 1), n === 1 && t--, t = Math.min(t, u + 1), t % 2 && (d === "reverse" ? (n = 1 - n, f && (n -= f / o)) : d === "mirror" && (y = a)), v = Bt(0, 1, n) * o;
		}
		let b;
		_ ? (this.delayState.value = l[0], b = this.delayState) : b = y.next(v), i && !_ && (b.value = i(b.value));
		let { done: x } = b;
		!_ && s !== null && (x = this.playbackSpeed >= 0 ? this.currentTime >= r : this.currentTime <= 0);
		let S = this.holdTime === null && (this.state === "finished" || this.state === "running" && x);
		return S && p !== ri && (b.value = fi(l, this.options, h, this.speed)), m && m(b.value), S && this.finish(), b;
	}
	then(e, t) {
		return this.finished.then(e, t);
	}
	get duration() {
		return /* @__PURE__ */ G(this.calculatedDuration);
	}
	get iterationDuration() {
		let { delay: e = 0 } = this.options || {};
		return this.duration + /* @__PURE__ */ G(e);
	}
	get time() {
		return /* @__PURE__ */ G(this.currentTime);
	}
	set time(e) {
		e = /* @__PURE__ */ W(e), this.currentTime = e, this.startTime === null || this.holdTime !== null || this.playbackSpeed === 0 ? this.holdTime = e : this.driver && (this.startTime = this.driver.now() - e / this.playbackSpeed), this.driver ? this.driver.start(!1) : (this.startTime = 0, this.state = "paused", this.holdTime = e, this.tick(e));
	}
	getGeneratorVelocity() {
		let e = this.currentTime;
		if (e <= 0) return this.options.velocity || 0;
		if (this.generator.velocity) return this.generator.velocity(e);
		let t = this.generator.next(e).value;
		return ni((e) => this.generator.next(e).value, e, t);
	}
	get speed() {
		return this.playbackSpeed;
	}
	set speed(e) {
		let t = this.playbackSpeed !== e;
		t && this.driver && this.updateTime(q.now()), this.playbackSpeed = e, t && this.driver && (this.time = /* @__PURE__ */ G(this.currentTime));
	}
	play() {
		if (this.isStopped) return;
		let { driver: e = Br, startTime: t } = this.options;
		this.driver ||= e((e) => this.tick(e)), this.options.onPlay?.();
		let n = this.driver.now();
		this.state === "finished" ? (this.updateFinished(), this.startTime = n) : this.holdTime === null ? this.startTime ||= t ?? n : this.startTime = n - this.holdTime, this.state === "finished" && this.speed < 0 && (this.startTime += this.calculatedDuration), this.holdTime = null, this.state = "running", this.driver.start();
	}
	pause() {
		this.state = "paused", this.updateTime(q.now()), this.holdTime = this.currentTime;
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
		this.driver &&= (this.driver.stop(), void 0);
	}
	sample(e) {
		return this.startTime = 0, this.tick(e, !0);
	}
	attachTimeline(e) {
		return this.options.allowFlatten && (this.options.type = "keyframes", this.options.ease = "linear", this.initAnimation()), this.driver?.stop(), e.observe(this);
	}
};
//#endregion
//#region node_modules/motion-dom/dist/es/animation/keyframes/utils/fill-wildcards.mjs
function vi(e) {
	for (let t = 1; t < e.length; t++) e[t] ?? (e[t] = e[t - 1]);
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/dom/parse-transform.mjs
var yi = (e) => e * 180 / Math.PI, bi = (e) => Si(yi(Math.atan2(e[1], e[0]))), xi = {
	x: 4,
	y: 5,
	translateX: 4,
	translateY: 5,
	scaleX: 0,
	scaleY: 3,
	scale: (e) => (Math.abs(e[0]) + Math.abs(e[3])) / 2,
	rotate: bi,
	rotateZ: bi,
	skewX: (e) => yi(Math.atan(e[1])),
	skewY: (e) => yi(Math.atan(e[2])),
	skew: (e) => (Math.abs(e[1]) + Math.abs(e[2])) / 2
}, Si = (e) => (e %= 360, e < 0 && (e += 360), e), Ci = bi, wi = (e) => Math.sqrt(e[0] * e[0] + e[1] * e[1]), Ti = (e) => Math.sqrt(e[4] * e[4] + e[5] * e[5]), Ei = {
	x: 12,
	y: 13,
	z: 14,
	translateX: 12,
	translateY: 13,
	translateZ: 14,
	scaleX: wi,
	scaleY: Ti,
	scale: (e) => (wi(e) + Ti(e)) / 2,
	rotateX: (e) => Si(yi(Math.atan2(e[6], e[5]))),
	rotateY: (e) => Si(yi(Math.atan2(-e[2], e[0]))),
	rotateZ: Ci,
	rotate: Ci,
	skewX: (e) => yi(Math.atan(e[4])),
	skewY: (e) => yi(Math.atan(e[1])),
	skew: (e) => (Math.abs(e[1]) + Math.abs(e[4])) / 2
};
function Di(e) {
	return +!!e.includes("scale");
}
function Oi(e, t) {
	if (!e || e === "none") return Di(t);
	let n = e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u), r, i;
	if (n) r = Ei, i = n;
	else {
		let t = e.match(/^matrix\(([-\d.e\s,]+)\)$/u);
		r = xi, i = t;
	}
	if (!i) return Di(t);
	let a = r[t], o = i[1].split(",").map(Ai);
	return typeof a == "function" ? a(o) : o[a];
}
var ki = (e, t) => {
	let { transform: n = "none" } = getComputedStyle(e);
	return Oi(n, t);
};
function Ai(e) {
	return parseFloat(e.trim());
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/utils/keys-transform.mjs
var ji = [
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
], Mi = /* @__PURE__ */ new Set([...ji, "pathRotation"]), Ni = (e) => e === Vn || e === Y, Pi = /* @__PURE__ */ new Set([
	"x",
	"y",
	"z"
]), Fi = ji.filter((e) => !Pi.has(e));
function Ii(e) {
	let t = [];
	return Fi.forEach((n) => {
		let r = e.getValue(n);
		r !== void 0 && (t.push([n, r.get()]), r.set(+!!n.startsWith("scale")));
	}), t;
}
var Li = {
	width: ({ x: e }, { paddingLeft: t = "0", paddingRight: n = "0", boxSizing: r }) => {
		let i = e.max - e.min;
		return r === "border-box" ? i : i - parseFloat(t) - parseFloat(n);
	},
	height: ({ y: e }, { paddingTop: t = "0", paddingBottom: n = "0", boxSizing: r }) => {
		let i = e.max - e.min;
		return r === "border-box" ? i : i - parseFloat(t) - parseFloat(n);
	},
	top: (e, { top: t }) => parseFloat(t),
	left: (e, { left: t }) => parseFloat(t),
	bottom: ({ y: e }, { top: t }) => parseFloat(t) + (e.max - e.min),
	right: ({ x: e }, { left: t }) => parseFloat(t) + (e.max - e.min),
	x: (e, { transform: t }) => Oi(t, "x"),
	y: (e, { transform: t }) => Oi(t, "y")
};
Li.translateX = Li.x, Li.translateY = Li.y;
//#endregion
//#region node_modules/motion-dom/dist/es/animation/keyframes/KeyframesResolver.mjs
var Ri = /* @__PURE__ */ new Set(), zi = !1, Bi = !1, Vi = !1;
function Hi() {
	if (Bi) {
		let e = Array.from(Ri).filter((e) => e.needsMeasurement), t = new Set(e.map((e) => e.element)), n = /* @__PURE__ */ new Map();
		t.forEach((e) => {
			let t = Ii(e);
			t.length && (n.set(e, t), e.render());
		}), e.forEach((e) => e.measureInitialState()), t.forEach((e) => {
			e.render();
			let t = n.get(e);
			t && t.forEach(([t, n]) => {
				e.getValue(t)?.set(n);
			});
		}), e.forEach((e) => e.measureEndState()), e.forEach((e) => {
			e.suspendedScrollY !== void 0 && window.scrollTo(0, e.suspendedScrollY);
		});
	}
	Bi = !1, zi = !1, Ri.forEach((e) => e.complete(Vi)), Ri.clear();
}
function Ui() {
	Ri.forEach((e) => {
		e.readKeyframes(), e.needsMeasurement && (Bi = !0);
	});
}
function Wi() {
	Vi = !0, Ui(), Hi(), Vi = !1;
}
var Gi = class {
	constructor(e, t, n, r, i, a = !1) {
		this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...e], this.onComplete = t, this.name = n, this.motionValue = r, this.element = i, this.isAsync = a;
	}
	scheduleResolve() {
		this.state = "scheduled", this.isAsync ? (Ri.add(this), zi || (zi = !0, K.read(Ui), K.resolveKeyframes(Hi))) : (this.readKeyframes(), this.complete());
	}
	readKeyframes() {
		let { unresolvedKeyframes: e, name: t, element: n, motionValue: r } = this;
		if (e[0] === null) {
			let i = r?.get(), a = e[e.length - 1];
			if (i !== void 0) e[0] = i;
			else if (n && t) {
				let r = n.readValue(t, a);
				r != null && (e[0] = r);
			}
			e[0] === void 0 && (e[0] = a), r && i === void 0 && r.set(e[0]);
		}
		vi(e);
	}
	setFinalKeyframe() {}
	measureInitialState() {}
	renderEndStyles() {}
	measureEndState() {}
	complete(e = !1) {
		this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, e), Ri.delete(this);
	}
	cancel() {
		this.state === "scheduled" && (Ri.delete(this), this.state = "pending");
	}
	resume() {
		this.state === "pending" && this.scheduleResolve();
	}
}, Ki = (e) => e.startsWith("--");
//#endregion
//#region node_modules/motion-dom/dist/es/render/dom/style-set.mjs
function qi(e, t, n) {
	Ki(t) ? e.style.setProperty(t, n) : e.style[t] = n;
}
//#endregion
//#region node_modules/motion-dom/dist/es/utils/supports/flags.mjs
var Ji = {};
//#endregion
//#region node_modules/motion-dom/dist/es/utils/supports/memo.mjs
function Yi(e, t) {
	let n = /* @__PURE__ */ qt(e);
	return () => Ji[t] ?? n();
}
//#endregion
//#region node_modules/motion-dom/dist/es/utils/supports/scroll-timeline.mjs
var Xi = /* @__PURE__ */ Yi(() => window.ScrollTimeline !== void 0, "scrollTimeline"), Zi = /*@__PURE__*/ Yi(() => {
	try {
		document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
	} catch {
		return !1;
	}
	return !0;
}, "linearEasing"), Qi = ([e, t, n, r]) => `cubic-bezier(${e}, ${t}, ${n}, ${r})`, $i = {
	linear: "linear",
	ease: "ease",
	easeIn: "ease-in",
	easeOut: "ease-out",
	easeInOut: "ease-in-out",
	circIn: /*@__PURE__*/ Qi([
		0,
		.65,
		.55,
		1
	]),
	circOut: /*@__PURE__*/ Qi([
		.55,
		0,
		1,
		.45
	]),
	backIn: /*@__PURE__*/ Qi([
		.31,
		.01,
		.66,
		-.59
	]),
	backOut: /*@__PURE__*/ Qi([
		.33,
		1.53,
		.69,
		.99
	])
};
//#endregion
//#region node_modules/motion-dom/dist/es/animation/waapi/easing/map-easing.mjs
function ea(e, t) {
	if (e) return typeof e == "function" ? Zi() ? Vr(e, t) : "ease-out" : /* @__PURE__ */ Sn(e) ? Qi(e) : Array.isArray(e) ? e.map((e) => ea(e, t) || $i.easeOut) : $i[e];
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/waapi/start-waapi-animation.mjs
function ta(e, t, n, { delay: r = 0, duration: i = 300, repeat: a = 0, repeatType: o = "loop", ease: s = "easeOut", times: c } = {}, l = void 0) {
	let u = { [t]: n };
	c && (u.offset = c);
	let d = ea(s, i);
	Array.isArray(d) && (u.easing = d);
	let f = {
		delay: r,
		duration: i,
		easing: Array.isArray(d) ? "linear" : d,
		fill: "both",
		iterations: a + 1,
		direction: o === "reverse" ? "alternate" : "normal"
	};
	return l && (f.pseudoElement = l), e.animate(u, f);
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/generators/utils/is-generator.mjs
function na(e) {
	return typeof e == "function" && "applyToOptions" in e;
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/waapi/utils/apply-generator.mjs
function ra({ type: e, ...t }) {
	return na(e) && Zi() ? e.applyToOptions(t) : (t.duration ??= 300, t.ease ??= "easeOut", t);
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/NativeAnimation.mjs
var ia = class extends hi {
	constructor(e) {
		if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !e) return;
		let { element: t, name: n, keyframes: r, pseudoElement: i, allowFlatten: a = !1, finalKeyframe: o, onComplete: s } = e;
		this.isPseudoElement = !!i, this.allowFlatten = a, this.options = e, U(typeof e.type != "string", "Mini animate() doesn't support \"type\" as a string.", "mini-spring");
		let c = ra(e);
		this.animation = ta(t, n, r, c, i), c.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
			if (this.finishedTime = this.time, !i) {
				let e = fi(r, this.options, o, this.speed);
				this.updateMotionValue && this.updateMotionValue(e), qi(t, n, e), this.animation.cancel();
			}
			s?.(), this.notifyFinished();
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
		} catch {}
	}
	stop() {
		if (this.isStopped) return;
		this.isStopped = !0;
		let { state: e } = this;
		e === "idle" || e === "finished" || (this.updateMotionValue ? this.updateMotionValue() : this.commitStyles(), this.isPseudoElement || this.cancel());
	}
	commitStyles() {
		let e = this.options?.element;
		!this.isPseudoElement && e?.isConnected && this.animation.commitStyles?.();
	}
	get duration() {
		let e = this.animation.effect?.getComputedTiming?.().duration || 0;
		return /* @__PURE__ */ G(Number(e));
	}
	get iterationDuration() {
		let { delay: e = 0 } = this.options || {};
		return this.duration + /* @__PURE__ */ G(e);
	}
	get time() {
		return /* @__PURE__ */ G(Number(this.animation.currentTime) || 0);
	}
	set time(e) {
		let t = this.finishedTime !== null;
		this.manualStartTime = null, this.finishedTime = null, this.animation.currentTime = /* @__PURE__ */ W(e), t && this.animation.pause();
	}
	get speed() {
		return this.animation.playbackRate;
	}
	set speed(e) {
		e < 0 && (this.finishedTime = null), this.animation.playbackRate = e;
	}
	get state() {
		return this.finishedTime === null ? this.animation.playState : "finished";
	}
	get startTime() {
		return this.manualStartTime ?? Number(this.animation.startTime);
	}
	set startTime(e) {
		this.manualStartTime = this.animation.startTime = e;
	}
	attachTimeline({ timeline: e, rangeStart: t, rangeEnd: n, observe: r }) {
		return this.allowFlatten && this.animation.effect?.updateTiming({ easing: "linear" }), this.animation.onfinish = null, e && Xi() ? (this.animation.timeline = e, t && (this.animation.rangeStart = t), n && (this.animation.rangeEnd = n), Jt) : r(this);
	}
}, aa = {
	anticipate: pn,
	backInOut: fn,
	circInOut: gn
};
function oa(e) {
	return e in aa;
}
function sa(e) {
	typeof e.ease == "string" && oa(e.ease) && (e.ease = aa[e.ease]);
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/NativeAnimationExtended.mjs
var ca = 10, la = class extends ia {
	constructor(e) {
		sa(e), mi(e), super(e), e.startTime !== void 0 && e.autoplay !== !1 && (this.startTime = e.startTime), this.options = e;
	}
	updateMotionValue(e) {
		let { motionValue: t, onUpdate: n, onComplete: r, element: i, ...a } = this.options;
		if (!t) return;
		if (e !== void 0) {
			t.set(e);
			return;
		}
		let o = new _i({
			...a,
			autoplay: !1
		}), s = Math.max(ca, q.now() - this.startTime), c = Bt(0, ca, s - ca), l = o.sample(s).value, { name: u } = this.options;
		i && u && qi(i, u, l), t.setWithVelocity(o.sample(Math.max(0, s - c)).value, l, c), o.stop();
	}
}, ua = (e, t) => t !== "zIndex" && !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && (Z.test(e) || e === "0") && !e.startsWith("url("));
//#endregion
//#region node_modules/motion-dom/dist/es/animation/utils/can-animate.mjs
function da(e) {
	let t = e[0];
	if (e.length === 1) return !0;
	for (let n = 0; n < e.length; n++) if (e[n] !== t) return !0;
}
function fa(e, t, n, r) {
	let i = e[0];
	if (i === null) return !1;
	if (t === "display" || t === "visibility") return !0;
	let a = e[e.length - 1], o = ua(i, t), s = ua(a, t);
	return Ht(o === s, `You are trying to animate ${t} from "${i}" to "${a}". "${o ? a : i}" is not an animatable value.`, "value-not-animatable"), !o || !s ? !1 : da(e) || (n === "spring" || na(n)) && r;
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/utils/make-animation-instant.mjs
function pa(e) {
	e.duration = 0, e.type = "keyframes";
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/waapi/utils/accelerated-values.mjs
var ma = /* @__PURE__ */ new Set([
	"opacity",
	"clipPath",
	"filter",
	"transform",
	"backgroundColor"
]), ha = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function ga(e) {
	for (let t = 0; t < e.length; t++) if (typeof e[t] == "string" && ha.test(e[t])) return !0;
	return !1;
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/waapi/supports/waapi.mjs
var _a = /* @__PURE__ */ new Set([
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
]), va = /*@__PURE__*/ qt(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function ya(e) {
	let { motionValue: t, name: n, repeatDelay: r, repeatType: i, damping: a, type: o, keyframes: s } = e, c = t?.owner?.current;
	if (!(c instanceof HTMLElement) && !(c instanceof SVGElement)) return !1;
	let { onUpdate: l, transformTemplate: u } = t.owner.getProps();
	return va() && n && (ma.has(n) || _a.has(n) && ga(s)) && (n !== "transform" || !u) && !l && !r && i !== "mirror" && a !== 0 && o !== "inertia";
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/AsyncMotionValueAnimation.mjs
var ba = 40, xa = class extends hi {
	constructor({ autoplay: e = !0, delay: t = 0, type: n = "keyframes", repeat: r = 0, repeatDelay: i = 0, repeatType: a = "loop", keyframes: o, name: s, motionValue: c, element: l, ...u }) {
		super(), this.stop = () => {
			this._animation && (this._animation.stop(), this.stopTimeline?.()), this.keyframeResolver?.cancel();
		}, this.createdAt = q.now();
		let d = {
			autoplay: e,
			delay: t,
			type: n,
			repeat: r,
			repeatDelay: i,
			repeatType: a,
			name: s,
			motionValue: c,
			element: l,
			...u
		}, f = l?.KeyframeResolver || Gi;
		this.keyframeResolver = new f(o, (e, t, n) => this.onKeyframesResolved(e, t, d, !n), s, c, l), this.keyframeResolver?.scheduleResolve();
	}
	onKeyframesResolved(e, t, n, r) {
		this.keyframeResolver = void 0;
		let { name: i, type: a, velocity: o, delay: s, isHandoff: c, onUpdate: l } = n;
		this.resolvedAt = q.now();
		let u = !0;
		fa(e, i, a, o) || (u = !1, (Ut.instantAnimations || !s) && l?.(fi(e, n, t)), e[0] = e[e.length - 1], pa(n), n.repeat = 0);
		let d = {
			startTime: r ? this.resolvedAt && this.resolvedAt - this.createdAt > ba ? this.resolvedAt : this.createdAt : void 0,
			finalKeyframe: t,
			...n,
			keyframes: e
		}, f = u && !c && ya(d), p = d.motionValue?.owner?.current, m;
		if (f) try {
			m = new la({
				...d,
				element: p
			});
		} catch {
			m = new _i(d);
		}
		else m = new _i(d);
		m.finished.then(() => {
			this.notifyFinished();
		}).catch(Jt), this.pendingTimeline &&= (this.stopTimeline = m.attachTimeline(this.pendingTimeline), void 0), this._animation = m;
	}
	get finished() {
		return this._animation ? this.animation.finished : this._finished;
	}
	then(e, t) {
		return this.finished.finally(e).then(() => {});
	}
	get animation() {
		return this._animation || (this.keyframeResolver?.resume(), Wi()), this._animation;
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
}, Sa = class {
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
		for (let n = 0; n < this.animations.length; n++) this.animations[n][e] = t;
	}
	attachTimeline(e) {
		let t = this.animations.map((t) => t.attachTimeline(e));
		return () => {
			t.forEach((e, t) => {
				e && e(), this.animations[t].stop();
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
		return Ca(this.animations, "duration");
	}
	get iterationDuration() {
		return Ca(this.animations, "iterationDuration");
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
function Ca(e, t) {
	let n = 0;
	for (let r = 0; r < e.length; r++) {
		let i = e[r][t];
		i !== null && i > n && (n = i);
	}
	return n;
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/GroupAnimationWithThen.mjs
var wa = class extends Sa {
	then(e, t) {
		return this.finished.finally(e).then(() => {});
	}
}, Ta = 30, Ea = (e) => !isNaN(parseFloat(e)), Da = { current: void 0 }, Oa = class {
	constructor(e, t = {}) {
		this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (e) => {
			let t = q.now();
			if (this.updatedAt !== t && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(e), this.current !== this.prev && (this.events.change?.notify(this.current), this.dependents)) for (let e of this.dependents) e.dirty();
		}, this.hasAnimated = !1, this.setCurrent(e), this.owner = t.owner;
	}
	setCurrent(e) {
		this.current = e, this.updatedAt = q.now(), this.canTrackVelocity === null && e !== void 0 && (this.canTrackVelocity = Ea(this.current));
	}
	setPrevFrameValue(e = this.current) {
		this.prevFrameValue = e, this.prevUpdatedAt = this.updatedAt;
	}
	onChange(e) {
		return process.env.NODE_ENV !== "production" && en(!1, "value.onChange(callback) is deprecated. Switch to value.on(\"change\", callback)."), this.on("change", e);
	}
	on(e, t) {
		this.events[e] || (this.events[e] = new Zt());
		let n = this.events[e].add(t);
		return e === "change" ? () => {
			n(), K.read(() => {
				this.events.change.getSize() || this.stop();
			});
		} : n;
	}
	clearListeners() {
		for (let e in this.events) this.events[e].clear();
	}
	attach(e, t) {
		this.passiveEffect = e, this.stopPassiveEffect = t;
	}
	set(e) {
		this.passiveEffect ? this.passiveEffect(e, this.updateAndNotify) : this.updateAndNotify(e);
	}
	setWithVelocity(e, t, n) {
		this.set(t), this.prev = void 0, this.prevFrameValue = e, this.prevUpdatedAt = this.updatedAt - n;
	}
	jump(e, t = !0) {
		this.updateAndNotify(e), this.prev = e, this.prevUpdatedAt = this.prevFrameValue = void 0, t && this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
	}
	dirty() {
		this.events.change?.notify(this.current);
	}
	addDependent(e) {
		this.dependents ||= /* @__PURE__ */ new Set(), this.dependents.add(e);
	}
	removeDependent(e) {
		this.dependents && this.dependents.delete(e);
	}
	get() {
		return Da.current && Da.current.push(this), this.current;
	}
	getPrevious() {
		return this.prev;
	}
	getVelocity() {
		let e = q.now();
		if (!this.canTrackVelocity || this.prevFrameValue === void 0 || e - this.updatedAt > Ta) return 0;
		let t = Math.min(this.updatedAt - this.prevUpdatedAt, Ta);
		return /* @__PURE__ */ Qt(parseFloat(this.current) - parseFloat(this.prevFrameValue), t);
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
function ka(e, t) {
	return new Oa(e, t);
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/utils/resolve-transition.mjs
function Aa(e, t) {
	if (e?.inherit && t) {
		let { inherit: n, ...r } = e;
		return {
			...t,
			...r
		};
	}
	return e;
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/utils/get-value-transition.mjs
function ja(e, t) {
	let n = e?.[t] ?? e?.default ?? e;
	return n === e ? n : Aa(n, e);
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/utils/default-transitions.mjs
var Ma = {
	type: "spring",
	stiffness: 500,
	damping: 25,
	restSpeed: 10
}, Na = (e) => ({
	type: "spring",
	stiffness: 550,
	damping: e === 0 ? 2 * Math.sqrt(550) : 30,
	restSpeed: 10
}), Pa = {
	type: "keyframes",
	duration: .8
}, Fa = {
	type: "keyframes",
	ease: [
		.25,
		.1,
		.35,
		1
	],
	duration: .3
}, Ia = (e, { keyframes: t }) => t.length > 2 ? Pa : Mi.has(e) ? e.startsWith("scale") ? Na(t[1]) : Ma : Fa, La = /* @__PURE__ */ new Set([
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
function Ra(e) {
	for (let t in e) if (!La.has(t)) return !0;
	return !1;
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/interfaces/motion-value.mjs
var za = (e, t, n, r = {}, i, a) => (o) => {
	let s = ja(r, e) || {}, c = s.delay || r.delay || 0, { elapsed: l = 0 } = r;
	l -= /* @__PURE__ */ W(c);
	let u = {
		keyframes: Array.isArray(n) ? n : [null, n],
		ease: "easeOut",
		velocity: t.getVelocity(),
		...s,
		delay: -l,
		onUpdate: (e) => {
			t.set(e), s.onUpdate && s.onUpdate(e);
		},
		onComplete: () => {
			o(), s.onComplete && s.onComplete();
		},
		name: e,
		motionValue: t,
		element: a ? void 0 : i
	};
	Ra(s) || Object.assign(u, Ia(e, u)), u.duration &&= /* @__PURE__ */ W(u.duration), u.repeatDelay &&= /* @__PURE__ */ W(u.repeatDelay), u.from !== void 0 && (u.keyframes[0] = u.from);
	let d = !1;
	if ((u.type === !1 || u.duration === 0 && !u.repeatDelay) && (pa(u), u.delay === 0 && (d = !0)), (Ut.instantAnimations || Ut.skipAnimations || i?.shouldSkipAnimations || s.skipAnimations) && (d = !0, pa(u), u.delay = 0), u.allowFlatten = !s.type && !s.ease, d && !a && t.get() !== void 0) {
		let e = fi(u.keyframes, s);
		if (e !== void 0) {
			K.update(() => {
				u.onUpdate(e), u.onComplete();
			});
			return;
		}
	}
	return s.isSync ? new _i(u) : new xa(u);
}, Ba = /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;
function Va(e) {
	let t = Ba.exec(e);
	if (!t) return [,];
	let [, n, r, i] = t;
	return [`--${n ?? r}`, i];
}
var Ha = 4;
function Ua(e, t, n = 1) {
	U(n <= Ha, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
	let [r, i] = Va(e);
	if (!r) return;
	let a = window.getComputedStyle(t).getPropertyValue(r);
	if (a) {
		let e = a.trim();
		return Wt(e) ? parseFloat(e) : e;
	}
	return Rn(i) ? Ua(i, t, n + 1) : i;
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/utils/resolve-variants.mjs
function Wa(e) {
	let t = [{}, {}];
	return e?.values.forEach((e, n) => {
		t[0][n] = e.get(), t[1][n] = e.getVelocity();
	}), t;
}
function Ga(e, t, n, r) {
	if (typeof t == "function") {
		let [i, a] = Wa(r);
		t = t(n === void 0 ? e.custom : n, i, a);
	}
	if (typeof t == "string" && (t = e.variants && e.variants[t]), typeof t == "function") {
		let [i, a] = Wa(r);
		t = t(n === void 0 ? e.custom : n, i, a);
	}
	return t;
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/utils/resolve-dynamic-variants.mjs
function Ka(e, t, n) {
	let r = e.getProps();
	return Ga(r, t, n === void 0 ? r.custom : n, e);
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/utils/keys-position.mjs
var qa = /* @__PURE__ */ new Set([
	"width",
	"height",
	"top",
	"left",
	"right",
	"bottom",
	...ji
]), Ja = (e) => Array.isArray(e);
//#endregion
//#region node_modules/motion-dom/dist/es/render/utils/setters.mjs
function Ya(e, t, n) {
	e.hasValue(t) ? e.getValue(t).set(n) : e.addValue(t, ka(n));
}
function Xa(e) {
	return Ja(e) ? e[e.length - 1] || 0 : e;
}
function Za(e, t) {
	let { transitionEnd: n = {}, transition: r = {}, ...i } = Ka(e, t) || {};
	i = {
		...i,
		...n
	};
	for (let t in i) Ya(e, t, Xa(i[t]));
}
//#endregion
//#region node_modules/motion-dom/dist/es/value/utils/is-motion-value.mjs
var $ = (e) => !!(e && e.getVelocity);
//#endregion
//#region node_modules/motion-dom/dist/es/value/will-change/is.mjs
function Qa(e) {
	return !!($(e) && e.add);
}
//#endregion
//#region node_modules/motion-dom/dist/es/value/will-change/add-will-change.mjs
function $a(e, t) {
	let n = e.getValue("willChange");
	if (Qa(n)) return n.add(t);
	if (!n && Ut.WillChange) {
		let n = new Ut.WillChange("auto");
		e.addValue("willChange", n), n.add(t);
	}
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/dom/utils/camel-to-dash.mjs
function eo(e) {
	return e.replace(/([A-Z])/g, (e) => `-${e.toLowerCase()}`);
}
var to = "data-" + eo("framerAppearId");
//#endregion
//#region node_modules/motion-dom/dist/es/animation/optimized-appear/get-appear-id.mjs
function no(e) {
	return e.props[to];
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/interfaces/visual-element-target.mjs
function ro({ protectedKeys: e, needsAnimating: t }, n) {
	let r = e.hasOwnProperty(n) && t[n] !== !0;
	return t[n] = !1, r;
}
function io(e, t, { delay: n = 0, transitionOverride: r, type: i } = {}) {
	let { transition: a, transitionEnd: o, ...s } = t, c = e.getDefaultTransition();
	a = a ? Aa(a, c) : c;
	let l = a?.reduceMotion, u = a?.skipAnimations;
	r && (a = r);
	let d = [], f = i && e.animationState && e.animationState.getState()[i], p = a?.path;
	p && p.animateVisualElement(e, s, a, n, d);
	for (let t in s) {
		let r = e.getValue(t, e.latestValues[t] ?? null), i = s[t];
		if (i === void 0 || f && ro(f, t)) continue;
		let o = {
			delay: n,
			...ja(a || {}, t)
		};
		u && (o.skipAnimations = !0);
		let c = r.get();
		if (c !== void 0 && !r.isAnimating() && !Array.isArray(i) && i === c && !o.velocity) {
			K.update(() => r.set(i));
			continue;
		}
		let p = !1;
		if (window.MotionHandoffAnimation) {
			let n = no(e);
			if (n) {
				let e = window.MotionHandoffAnimation(n, t, K);
				e !== null && (o.startTime = e, p = !0);
			}
		}
		$a(e, t);
		let m = l ?? e.shouldReduceMotion;
		r.start(za(t, r, i, m && qa.has(t) ? { type: !1 } : o, e, p));
		let h = r.animation;
		h && d.push(h);
	}
	if (o) {
		let t = () => K.update(() => {
			o && Za(e, o);
		});
		d.length ? Promise.all(d).then(t) : t();
	}
	return d;
}
//#endregion
//#region node_modules/motion-dom/dist/es/value/types/auto.mjs
var ao = {
	test: (e) => e === "auto",
	parse: (e) => e
}, oo = (e) => (t) => t.test(e), so = [
	Vn,
	Y,
	nr,
	J,
	ir,
	rr,
	ao
], co = (e) => so.find(oo(e));
//#endregion
//#region node_modules/motion-dom/dist/es/animation/keyframes/utils/is-none.mjs
function lo(e) {
	return typeof e == "number" ? e === 0 : e === null || e === "none" || e === "0" || Kt(e);
}
//#endregion
//#region node_modules/motion-dom/dist/es/value/types/complex/filter.mjs
var uo = /* @__PURE__ */ new Set([
	"brightness",
	"contrast",
	"saturate",
	"opacity"
]);
function fo(e) {
	let [t, n] = e.slice(0, -1).split("(");
	if (t === "drop-shadow") return e;
	let [r] = n.match(Gn) || [];
	if (!r) return e;
	let i = n.replace(r, ""), a = +!!uo.has(t);
	return r !== n && (a *= 100), t + "(" + a + i + ")";
}
var po = /\b([a-z-]*)\(.*?\)/gu, mo = {
	...Z,
	getAnimatableNone: (e) => {
		let t = e.match(po);
		return t ? t.map(fo).join(" ") : e;
	}
}, ho = {
	...Z,
	getAnimatableNone: (e) => {
		let t = Z.parse(e);
		return Z.createTransformer(e)(t.map((e) => typeof e == "number" ? 0 : typeof e == "object" ? {
			...e,
			alpha: 1
		} : e));
	}
}, go = {
	...Vn,
	transform: Math.round
}, _o = {
	borderWidth: Y,
	borderTopWidth: Y,
	borderRightWidth: Y,
	borderBottomWidth: Y,
	borderLeftWidth: Y,
	borderRadius: Y,
	borderTopLeftRadius: Y,
	borderTopRightRadius: Y,
	borderBottomRightRadius: Y,
	borderBottomLeftRadius: Y,
	width: Y,
	maxWidth: Y,
	height: Y,
	maxHeight: Y,
	top: Y,
	right: Y,
	bottom: Y,
	left: Y,
	inset: Y,
	insetBlock: Y,
	insetBlockStart: Y,
	insetBlockEnd: Y,
	insetInline: Y,
	insetInlineStart: Y,
	insetInlineEnd: Y,
	padding: Y,
	paddingTop: Y,
	paddingRight: Y,
	paddingBottom: Y,
	paddingLeft: Y,
	paddingBlock: Y,
	paddingBlockStart: Y,
	paddingBlockEnd: Y,
	paddingInline: Y,
	paddingInlineStart: Y,
	paddingInlineEnd: Y,
	margin: Y,
	marginTop: Y,
	marginRight: Y,
	marginBottom: Y,
	marginLeft: Y,
	marginBlock: Y,
	marginBlockStart: Y,
	marginBlockEnd: Y,
	marginInline: Y,
	marginInlineStart: Y,
	marginInlineEnd: Y,
	fontSize: Y,
	backgroundPositionX: Y,
	backgroundPositionY: Y,
	rotate: J,
	pathRotation: J,
	rotateX: J,
	rotateY: J,
	rotateZ: J,
	scale: Un,
	scaleX: Un,
	scaleY: Un,
	scaleZ: Un,
	skew: J,
	skewX: J,
	skewY: J,
	distance: Y,
	translateX: Y,
	translateY: Y,
	translateZ: Y,
	x: Y,
	y: Y,
	z: Y,
	perspective: Y,
	transformPerspective: Y,
	opacity: Hn,
	originX: ar,
	originY: ar,
	originZ: Y,
	zIndex: go,
	fillOpacity: Hn,
	strokeOpacity: Hn,
	numOctaves: go
}, vo = {
	..._o,
	color: X,
	backgroundColor: X,
	outlineColor: X,
	fill: X,
	stroke: X,
	borderColor: X,
	borderTopColor: X,
	borderRightColor: X,
	borderBottomColor: X,
	borderLeftColor: X,
	filter: mo,
	WebkitFilter: mo,
	mask: ho,
	WebkitMask: ho
}, yo = (e) => vo[e], bo = /*@__PURE__*/ new Set([mo, ho]);
function xo(e, t) {
	let n = yo(e);
	return bo.has(n) || (n = Z), n.getAnimatableNone ? n.getAnimatableNone(t) : void 0;
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/keyframes/utils/make-none-animatable.mjs
var So = /* @__PURE__ */ new Set([
	"auto",
	"none",
	"0"
]);
function Co(e, t, n) {
	let r = 0, i;
	for (; r < e.length && !i;) {
		let t = e[r];
		typeof t == "string" && !So.has(t) && hr(t).values.length && (i = e[r]), r++;
	}
	if (i && n) for (let r of t) e[r] = xo(n, i);
}
//#endregion
//#region node_modules/motion-dom/dist/es/animation/keyframes/DOMKeyframesResolver.mjs
var wo = class extends Gi {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i, !0);
	}
	readKeyframes() {
		let { unresolvedKeyframes: e, element: t, name: n } = this;
		if (!t || !t.current) return;
		super.readKeyframes();
		for (let n = 0; n < e.length; n++) {
			let r = e[n];
			if (typeof r == "string" && (r = r.trim(), Rn(r))) {
				let i = Ua(r, t.current);
				i !== void 0 && (e[n] = i), n === e.length - 1 && (this.finalKeyframe = r);
			}
		}
		if (this.resolveNoneKeyframes(), !qa.has(n) || e.length !== 2) return;
		let [r, i] = e, a = co(r), o = co(i);
		if (Bn(r) !== Bn(i) && Li[n]) {
			this.needsMeasurement = !0;
			return;
		}
		if (a !== o) if (Ni(a) && Ni(o)) for (let t = 0; t < e.length; t++) {
			let n = e[t];
			typeof n == "string" && (e[t] = parseFloat(n));
		}
		else Li[n] && (this.needsMeasurement = !0);
	}
	resolveNoneKeyframes() {
		let { unresolvedKeyframes: e, name: t } = this, n = [];
		for (let t = 0; t < e.length; t++) (e[t] === null || lo(e[t])) && n.push(t);
		n.length && Co(e, n, t);
	}
	measureInitialState() {
		let { element: e, unresolvedKeyframes: t, name: n } = this;
		if (!e || !e.current) return;
		n === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = Li[n](e.measureViewportBox(), window.getComputedStyle(e.current)), t[0] = this.measuredOrigin;
		let r = t[t.length - 1];
		r !== void 0 && e.getValue(n, r).jump(r, !1);
	}
	measureEndState() {
		let { element: e, name: t, unresolvedKeyframes: n } = this;
		if (!e || !e.current) return;
		let r = e.getValue(t);
		r && r.jump(this.measuredOrigin, !1);
		let i = n.length - 1, a = n[i];
		n[i] = Li[t](e.measureViewportBox(), window.getComputedStyle(e.current)), a !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = a), this.removedTransforms?.length && this.removedTransforms.forEach(([t, n]) => {
			e.getValue(t).set(n);
		}), this.resolveNoneKeyframes();
	}
}, To = [
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomRightRadius",
	"borderBottomLeftRadius"
];
//#endregion
//#region node_modules/motion-dom/dist/es/utils/resolve-elements.mjs
function Eo(e, t, n) {
	if (e == null) return [];
	if (e instanceof EventTarget) return [e];
	if (typeof e == "string") {
		let r = document;
		t && (r = t.current);
		let i = n?.[e] ?? r.querySelectorAll(e);
		return i ? Array.from(i) : [];
	}
	return Array.from(e).filter((e) => e != null);
}
//#endregion
//#region node_modules/motion-dom/dist/es/value/types/utils/get-as-type.mjs
var Do = (e, t) => t && typeof e == "number" ? t.transform(e) : e, { schedule: Oo, cancel: ko } = /* @__PURE__ */ kn(queueMicrotask, !1);
//#endregion
//#region node_modules/motion-dom/dist/es/utils/is-svg-element.mjs
function Ao(e) {
	return Gt(e) && "ownerSVGElement" in e;
}
//#endregion
//#region node_modules/motion-dom/dist/es/utils/is-svg-svg-element.mjs
function jo(e) {
	return Ao(e) && e.tagName === "svg";
}
//#endregion
//#region node_modules/motion-dom/dist/es/value/types/utils/find.mjs
var Mo = [
	...so,
	X,
	Z
], No = (e) => Mo.find(oo(e)), Po = () => ({
	min: 0,
	max: 0
}), Fo = () => ({
	x: Po(),
	y: Po()
}), Io = /* @__PURE__ */ new WeakMap();
//#endregion
//#region node_modules/motion-dom/dist/es/render/utils/is-animation-controls.mjs
function Lo(e) {
	return typeof e == "object" && !!e && typeof e.start == "function";
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/utils/is-variant-label.mjs
function Ro(e) {
	return typeof e == "string" || Array.isArray(e);
}
var zo = [
	"initial",
	"animate",
	"whileInView",
	"whileFocus",
	"whileHover",
	"whileTap",
	"whileDrag",
	"exit"
];
//#endregion
//#region node_modules/motion-dom/dist/es/render/utils/is-controlling-variants.mjs
function Bo(e) {
	return Lo(e.animate) || zo.some((t) => Ro(e[t]));
}
function Vo(e) {
	return !!(Bo(e) || e.variants);
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/utils/motion-values.mjs
function Ho(e, t, n) {
	for (let r in t) {
		let i = t[r], a = n[r];
		if ($(i)) e.addValue(r, i);
		else if ($(a)) e.addValue(r, ka(i, { owner: e }));
		else if (a !== i) if (e.hasValue(r)) {
			let t = e.getValue(r);
			t.liveStyle === !0 ? t.jump(i) : t.hasAnimated || t.set(i);
		} else {
			let t = e.getStaticValue(r);
			e.addValue(r, ka(t === void 0 ? i : t, { owner: e }));
		}
	}
	for (let r in n) t[r] === void 0 && e.removeValue(r);
	return t;
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/utils/reduced-motion/state.mjs
var Uo = { current: null }, Wo = { current: !1 }, Go = typeof window < "u";
function Ko() {
	if (Wo.current = !0, Go) if (window.matchMedia) {
		let e = window.matchMedia("(prefers-reduced-motion)"), t = () => Uo.current = e.matches;
		e.addEventListener("change", t), t();
	} else Uo.current = !1;
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/VisualElement.mjs
var qo = [
	"AnimationStart",
	"AnimationComplete",
	"Update",
	"BeforeLayoutMeasure",
	"LayoutMeasure",
	"LayoutAnimationStart",
	"LayoutAnimationComplete"
], Jo = {}, Yo = class {
	scrapeMotionValuesFromProps(e, t, n) {
		return {};
	}
	constructor({ parent: e, props: t, presenceContext: n, reducedMotionConfig: r, skipAnimations: i, blockInitialAnimation: a, visualState: o }, s = {}) {
		this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = Gi, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
			this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
		}, this.renderScheduledAt = 0, this.scheduleRender = () => {
			let e = q.now();
			this.renderScheduledAt < e && (this.renderScheduledAt = e, K.render(this.render, !1, !0));
		};
		let { latestValues: c, renderState: l } = o;
		this.latestValues = c, this.baseTarget = { ...c }, this.initialValues = t.initial ? { ...c } : {}, this.renderState = l, this.parent = e, this.props = t, this.presenceContext = n, this.depth = e ? e.depth + 1 : 0, this.reducedMotionConfig = r, this.skipAnimationsConfig = i, this.options = s, this.blockInitialAnimation = !!a, this.isControllingVariants = Bo(t), this.isVariantNode = Vo(t), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(e && e.current);
		let { willChange: u, ...d } = this.scrapeMotionValuesFromProps(t, {}, this);
		for (let e in d) {
			let t = d[e];
			c[e] !== void 0 && $(t) && t.set(c[e]);
		}
	}
	mount(e) {
		if (this.hasBeenMounted) for (let e in this.initialValues) this.values.get(e)?.jump(this.initialValues[e]), this.latestValues[e] = this.initialValues[e];
		this.current = e, Io.set(e, this), this.projection && !this.projection.instance && this.projection.mount(e), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((e, t) => this.bindToMotionValue(t, e)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (Wo.current || Ko(), this.shouldReduceMotion = Uo.current), process.env.NODE_ENV !== "production" && en(this.shouldReduceMotion !== !0, "You have Reduced Motion enabled on your device. Animations may not appear as expected.", "reduced-motion-disabled"), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, this.parent?.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
	}
	unmount() {
		this.projection && this.projection.unmount(), An(this.notifyUpdate), An(this.render), this.valueSubscriptions.forEach((e) => e()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), this.parent?.removeChild(this);
		for (let e in this.events) this.events[e].clear();
		for (let e in this.features) {
			let t = this.features[e];
			t && (t.unmount(), t.isMounted = !1);
		}
		this.current = null;
	}
	addChild(e) {
		this.children.add(e), this.enteringChildren ??= /* @__PURE__ */ new Set(), this.enteringChildren.add(e);
	}
	removeChild(e) {
		this.children.delete(e), this.enteringChildren && this.enteringChildren.delete(e);
	}
	bindToMotionValue(e, t) {
		if (this.valueSubscriptions.has(e) && this.valueSubscriptions.get(e)(), t.accelerate && ma.has(e) && this.current instanceof HTMLElement) {
			let { factory: n, keyframes: r, times: i, ease: a, duration: o } = t.accelerate, s = new ia({
				element: this.current,
				name: e,
				keyframes: r,
				times: i,
				ease: a,
				duration: /* @__PURE__ */ W(o)
			}), c = n(s);
			this.valueSubscriptions.set(e, () => {
				c(), s.cancel();
			});
			return;
		}
		let n = Mi.has(e);
		n && this.onBindTransform && this.onBindTransform();
		let r = t.on("change", (t) => {
			this.latestValues[e] = t, this.props.onUpdate && K.preRender(this.notifyUpdate), n && this.projection && (this.projection.isTransformDirty = !0), this.scheduleRender();
		}), i;
		typeof window < "u" && window.MotionCheckAppearSync && (i = window.MotionCheckAppearSync(this, e, t)), this.valueSubscriptions.set(e, () => {
			r(), i && i();
		});
	}
	sortNodePosition(e) {
		return !this.current || !this.sortInstanceNodePosition || this.type !== e.type ? 0 : this.sortInstanceNodePosition(this.current, e.current);
	}
	updateFeatures() {
		let e = "animation";
		for (e in Jo) {
			let t = Jo[e];
			if (!t) continue;
			let { isEnabled: n, Feature: r } = t;
			if (!this.features[e] && r && n(this.props) && (this.features[e] = new r(this)), this.features[e]) {
				let t = this.features[e];
				t.isMounted ? t.update() : (t.mount(), t.isMounted = !0);
			}
		}
	}
	triggerBuild() {
		this.build(this.renderState, this.latestValues, this.props);
	}
	measureViewportBox() {
		return this.current ? this.measureInstanceViewportBox(this.current, this.props) : Fo();
	}
	getStaticValue(e) {
		return this.latestValues[e];
	}
	setStaticValue(e, t) {
		this.latestValues[e] = t;
	}
	update(e, t) {
		(e.transformTemplate || this.props.transformTemplate) && this.scheduleRender(), this.prevProps = this.props, this.props = e, this.prevPresenceContext = this.presenceContext, this.presenceContext = t;
		for (let t = 0; t < qo.length; t++) {
			let n = qo[t];
			this.propEventSubscriptions[n] && (this.propEventSubscriptions[n](), delete this.propEventSubscriptions[n]);
			let r = e["on" + n];
			r && (this.propEventSubscriptions[n] = this.on(n, r));
		}
		this.prevMotionValues = Ho(this, this.scrapeMotionValuesFromProps(e, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
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
		let t = this.getClosestVariantNode();
		if (t) return t.variantChildren && t.variantChildren.add(e), () => t.variantChildren.delete(e);
	}
	addValue(e, t) {
		let n = this.values.get(e);
		t !== n && (n && this.removeValue(e), this.bindToMotionValue(e, t), this.values.set(e, t), this.latestValues[e] = t.get());
	}
	removeValue(e) {
		this.values.delete(e);
		let t = this.valueSubscriptions.get(e);
		t && (t(), this.valueSubscriptions.delete(e)), delete this.latestValues[e], this.removeValueFromRenderState(e, this.renderState);
	}
	hasValue(e) {
		return this.values.has(e);
	}
	getValue(e, t) {
		if (this.props.values && this.props.values[e]) return this.props.values[e];
		let n = this.values.get(e);
		return n === void 0 && t !== void 0 && (n = ka(t === null ? void 0 : t, { owner: this }), this.addValue(e, n)), n;
	}
	readValue(e, t) {
		let n = this.latestValues[e] !== void 0 || !this.current ? this.latestValues[e] : this.getBaseTargetFromProps(this.props, e) ?? this.readValueFromInstance(this.current, e, this.options);
		return n != null && (typeof n == "string" && (Wt(n) || Kt(n)) ? n = parseFloat(n) : !No(n) && Z.test(t) && (n = xo(e, t)), this.setBaseTarget(e, $(n) ? n.get() : n)), $(n) ? n.get() : n;
	}
	setBaseTarget(e, t) {
		this.baseTarget[e] = t;
	}
	getBaseTarget(e) {
		let { initial: t } = this.props, n;
		if (typeof t == "string" || typeof t == "object") {
			let r = Ga(this.props, t, this.presenceContext?.custom);
			r && (n = r[e]);
		}
		if (t && n !== void 0) return n;
		let r = this.getBaseTargetFromProps(this.props, e);
		return r !== void 0 && !$(r) ? r : this.initialValues[e] !== void 0 && n === void 0 ? void 0 : this.baseTarget[e];
	}
	on(e, t) {
		return this.events[e] || (this.events[e] = new Zt()), this.events[e].add(t);
	}
	notify(e, ...t) {
		this.events[e] && this.events[e].notify(...t);
	}
	scheduleRenderMicrotask() {
		Oo.render(this.render);
	}
}, Xo = class extends Yo {
	constructor() {
		super(...arguments), this.KeyframeResolver = wo;
	}
	sortInstanceNodePosition(e, t) {
		return e.compareDocumentPosition(t) & 2 ? 1 : -1;
	}
	getBaseTargetFromProps(e, t) {
		let n = e.style;
		return n ? n[t] : void 0;
	}
	removeValueFromRenderState(e, { vars: t, style: n }) {
		delete t[e], delete n[e];
	}
	handleChildMotionValue() {
		this.childSubscription && (this.childSubscription(), delete this.childSubscription);
		let { children: e } = this.props;
		$(e) && (this.childSubscription = e.on("change", (e) => {
			this.current && (this.current.textContent = `${e}`);
		}));
	}
};
//#endregion
//#region node_modules/motion-dom/dist/es/projection/geometry/conversion.mjs
function Zo({ top: e, left: t, right: n, bottom: r }) {
	return {
		x: {
			min: t,
			max: n
		},
		y: {
			min: e,
			max: r
		}
	};
}
function Qo(e, t) {
	if (!t) return e;
	let n = t({
		x: e.left,
		y: e.top
	}), r = t({
		x: e.right,
		y: e.bottom
	});
	return {
		top: n.y,
		left: n.x,
		bottom: r.y,
		right: r.x
	};
}
//#endregion
//#region node_modules/motion-dom/dist/es/projection/utils/measure.mjs
function $o(e, t) {
	return Zo(Qo(e.getBoundingClientRect(), t));
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/html/utils/build-transform.mjs
var es = {
	x: "translateX",
	y: "translateY",
	z: "translateZ",
	transformPerspective: "perspective"
}, ts = ji.length;
function ns(e, t, n) {
	let r = "", i = !0;
	for (let a = 0; a < ts; a++) {
		let o = ji[a], s = e[o];
		if (s === void 0) continue;
		let c = !0;
		if (typeof s == "number") c = s === +!!o.startsWith("scale");
		else {
			let e = parseFloat(s);
			c = o.startsWith("scale") ? e === 1 : e === 0;
		}
		if (!c || n) {
			let e = Do(s, _o[o]);
			if (!c) {
				i = !1;
				let t = es[o] || o;
				r += `${t}(${e}) `;
			}
			n && (t[o] = e);
		}
	}
	let a = e.pathRotation;
	return a && (i = !1, r += `rotate(${Do(a, _o.pathRotation)}) `), r = r.trim(), n ? r = n(t, i ? "" : r) : i && (r = "none"), r;
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/html/utils/build-styles.mjs
function rs(e, t, n) {
	let { style: r, vars: i, transformOrigin: a } = e, o = !1, s = !1;
	for (let e in t) {
		let n = t[e];
		if (Mi.has(e)) {
			o = !0;
			continue;
		} else if (In(e)) {
			i[e] = n;
			continue;
		} else {
			let t = Do(n, _o[e]);
			e.startsWith("origin") ? (s = !0, a[e] = t) : r[e] = t;
		}
	}
	if (t.transform || (o || n ? r.transform = ns(t, e.transform, n) : r.transform &&= "none"), s) {
		let { originX: e = "50%", originY: t = "50%", originZ: n = 0 } = a;
		r.transformOrigin = `${e} ${t} ${n}`;
	}
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/html/utils/render.mjs
function is(e, { style: t, vars: n }, r, i) {
	let a = e.style, o;
	for (o in t) a[o] = t[o];
	for (o in i?.applyProjectionStyles(a, r), n) a.setProperty(o, n[o]);
}
//#endregion
//#region node_modules/motion-dom/dist/es/projection/styles/scale-border-radius.mjs
function as(e, t) {
	return t.max === t.min ? 0 : e / (t.max - t.min) * 100;
}
var os = { correct: (e, t) => {
	if (!t.target) return e;
	if (typeof e == "string") if (Y.test(e)) e = parseFloat(e);
	else return e;
	return `${as(e, t.target.x)}% ${as(e, t.target.y)}%`;
} }, ss = { correct: (e, { treeScale: t, projectionDelta: n }) => {
	let r = e, i = Z.parse(e);
	if (i.length > 5) return r;
	let a = Z.createTransformer(e), o = typeof i[0] == "number" ? 0 : 1, s = n.x.scale * t.x, c = n.y.scale * t.y;
	i[0 + o] /= s, i[1 + o] /= c;
	let l = Tr(s, c, .5);
	return typeof i[2 + o] == "number" && (i[2 + o] /= l), typeof i[3 + o] == "number" && (i[3 + o] /= l), a(i);
} }, cs = {
	borderRadius: {
		...os,
		applyTo: [...To]
	},
	borderTopLeftRadius: os,
	borderTopRightRadius: os,
	borderBottomLeftRadius: os,
	borderBottomRightRadius: os,
	boxShadow: ss
};
//#endregion
//#region node_modules/motion-dom/dist/es/render/utils/is-forced-motion-value.mjs
function ls(e, { layout: t, layoutId: n }) {
	return Mi.has(e) || e.startsWith("origin") || (t || n !== void 0) && (!!cs[e] || e === "opacity");
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/html/utils/scrape-motion-values.mjs
function us(e, t, n) {
	let r = e.style, i = t?.style, a = {};
	if (!r) return a;
	for (let t in r) ($(r[t]) || i && $(i[t]) || ls(t, e) || n?.getValue(t)?.liveStyle !== void 0) && (a[t] = r[t]);
	return a;
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/html/HTMLVisualElement.mjs
function ds(e) {
	return window.getComputedStyle(e);
}
var fs = class extends Xo {
	constructor() {
		super(...arguments), this.type = "html", this.renderInstance = is;
	}
	mount(e) {
		U(!!e.style, "motion.create() components must forward their ref to a HTML or SVG element", "custom-component-ref"), super.mount(e);
	}
	readValueFromInstance(e, t) {
		if (Mi.has(t)) return this.projection?.isProjecting ? Di(t) : ki(e, t);
		{
			let n = ds(e), r = (In(t) ? n.getPropertyValue(t) : n[t]) || 0;
			return typeof r == "string" ? r.trim() : r;
		}
	}
	measureInstanceViewportBox(e, { transformPagePoint: t }) {
		return $o(e, t);
	}
	build(e, t, n) {
		rs(e, t, n.transformTemplate);
	}
	scrapeMotionValuesFromProps(e, t, n) {
		return us(e, t, n);
	}
};
//#endregion
//#region node_modules/motion-dom/dist/es/render/object/ObjectVisualElement.mjs
function ps(e, t) {
	return e in t;
}
var ms = class extends Yo {
	constructor() {
		super(...arguments), this.type = "object";
	}
	readValueFromInstance(e, t) {
		if (ps(t, e)) {
			let n = e[t];
			if (typeof n == "string" || typeof n == "number") return n;
		}
	}
	getBaseTargetFromProps() {}
	removeValueFromRenderState(e, t) {
		delete t.output[e];
	}
	measureInstanceViewportBox() {
		return Fo();
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
}, hs = {
	offset: "stroke-dashoffset",
	array: "stroke-dasharray"
}, gs = {
	offset: "strokeDashoffset",
	array: "strokeDasharray"
};
function _s(e, t, n = 1, r = 0, i = !0) {
	e.pathLength = 1;
	let a = i ? hs : gs;
	e[a.offset] = `${-r}`, e[a.array] = `${t} ${n}`;
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/svg/utils/build-attrs.mjs
var vs = [
	"offsetDistance",
	"offsetPath",
	"offsetRotate",
	"offsetAnchor"
];
function ys(e, { attrX: t, attrY: n, attrScale: r, pathLength: i, pathSpacing: a = 1, pathOffset: o = 0, ...s }, c, l, u) {
	if (rs(e, s, l), c) {
		e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
		return;
	}
	e.attrs = e.style, e.style = {};
	let { attrs: d, style: f } = e;
	d.transform && (f.transform = d.transform, delete d.transform), (f.transform || d.transformOrigin) && (f.transformOrigin = d.transformOrigin ?? "50% 50%", delete d.transformOrigin), f.transform && (f.transformBox = u?.transformBox ?? "fill-box", delete d.transformBox);
	for (let e of vs) d[e] !== void 0 && (f[e] = d[e], delete d[e]);
	t !== void 0 && (d.x = t), n !== void 0 && (d.y = n), r !== void 0 && (d.scale = r), i !== void 0 && _s(d, i, a, o, !1);
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/svg/utils/camel-case-attrs.mjs
var bs = /* @__PURE__ */ new Set([
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
]), xs = (e) => typeof e == "string" && e.toLowerCase() === "svg";
//#endregion
//#region node_modules/motion-dom/dist/es/render/svg/utils/render.mjs
function Ss(e, t, n, r) {
	is(e, t, void 0, r);
	for (let n in t.attrs) e.setAttribute(bs.has(n) ? n : eo(n), t.attrs[n]);
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/svg/utils/scrape-motion-values.mjs
function Cs(e, t, n) {
	let r = us(e, t, n);
	for (let n in e) if ($(e[n]) || $(t[n])) {
		let t = ji.indexOf(n) === -1 ? n : "attr" + n.charAt(0).toUpperCase() + n.substring(1);
		r[t] = e[n];
	}
	return r;
}
//#endregion
//#region node_modules/motion-dom/dist/es/render/svg/SVGVisualElement.mjs
var ws = class extends Xo {
	constructor() {
		super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = Fo;
	}
	getBaseTargetFromProps(e, t) {
		return e[t];
	}
	readValueFromInstance(e, t) {
		if (Mi.has(t)) {
			let e = yo(t);
			return e && e.default || 0;
		}
		return t = bs.has(t) ? t : eo(t), e.getAttribute(t);
	}
	scrapeMotionValuesFromProps(e, t, n) {
		return Cs(e, t, n);
	}
	build(e, t, n) {
		ys(e, t, this.isSVGTag, n.transformTemplate, n.style);
	}
	renderInstance(e, t, n, r) {
		Ss(e, t, n, r);
	}
	mount(e) {
		this.isSVGTag = xs(e.tagName), super.mount(e);
	}
};
//#endregion
//#region node_modules/motion-dom/dist/es/animation/animate/single-value.mjs
function Ts(e, t, n) {
	let r = $(e) ? e : ka(e);
	return r.start(za("", r, t, n)), r.animation;
}
//#endregion
//#region node_modules/framer-motion/dist/es/animation/utils/is-dom-keyframes.mjs
function Es(e) {
	return typeof e == "object" && !Array.isArray(e);
}
//#endregion
//#region node_modules/framer-motion/dist/es/animation/animate/resolve-subjects.mjs
function Ds(e, t, n, r) {
	return e == null ? [] : typeof e == "string" && Es(t) ? Eo(e, n, r) : e instanceof NodeList ? Array.from(e) : Array.isArray(e) ? e.filter((e) => e != null) : [e];
}
//#endregion
//#region node_modules/framer-motion/dist/es/animation/sequence/utils/calc-repeat-duration.mjs
function Os(e, t, n) {
	return e * (t + 1) + n * t;
}
//#endregion
//#region node_modules/framer-motion/dist/es/animation/sequence/utils/calc-time.mjs
function ks(e, t, n, r) {
	return typeof t == "number" ? t : t.startsWith("-") || t.startsWith("+") ? Math.max(0, e + parseFloat(t)) : t === "<" ? n : t.startsWith("<") ? Math.max(0, n + parseFloat(t.slice(1))) : r.get(t) ?? e;
}
//#endregion
//#region node_modules/framer-motion/dist/es/animation/sequence/utils/edit.mjs
function As(e, t, n) {
	for (let r = 0; r < e.length; r++) {
		let i = e[r];
		i.at > t && i.at < n && (zt(e, i), r--);
	}
}
function js(e, t, n, r, i, a) {
	As(e, i, a);
	for (let o = 0; o < t.length; o++) e.push({
		value: t[o],
		at: Tr(i, a, r[o]),
		easing: /* @__PURE__ */ xn(n, o)
	});
}
//#endregion
//#region node_modules/framer-motion/dist/es/animation/sequence/utils/normalize-times.mjs
function Ms(e, t, n = 0) {
	let r = t + 1 + t * n;
	for (let t = 0; t < e.length; t++) e[t] = e[t] / r;
}
//#endregion
//#region node_modules/framer-motion/dist/es/animation/sequence/utils/sort.mjs
function Ns(e, t) {
	return e.at === t.at ? e.value === null ? 1 : t.value === null ? -1 : 0 : e.at - t.at;
}
//#endregion
//#region node_modules/framer-motion/dist/es/animation/sequence/create.mjs
var Ps = "easeInOut", Fs = 20;
function Is(e, { defaultTransition: t = {}, ...n } = {}, r, i) {
	let a = t.duration || .3, o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), c = {}, l = /* @__PURE__ */ new Map(), u = 0, d = 0, f = 0;
	for (let n = 0; n < e.length; n++) {
		let o = e[n];
		if (typeof o == "string") {
			l.set(o, d);
			continue;
		} else if (!Array.isArray(o)) {
			l.set(o.name, ks(d, o.at, u, l));
			continue;
		}
		let [p, m, h = {}] = o;
		h.at !== void 0 && (d = ks(d, h.at, u, l));
		let g = 0, _ = (e, n, r, o = 0, s = 0) => {
			let c = zs(e), { delay: l = 0, times: u = si(c), type: p = t.type || "keyframes", repeat: m, repeatType: h, repeatDelay: _ = 0, ...v } = n, { ease: y = t.ease || "easeOut", duration: b } = n, x = typeof l == "function" ? l(o, s) : l, S = c.length, C = na(p) ? p : i?.[p || "keyframes"];
			if (S <= 2 && C) {
				let e = 100;
				if (S === 2 && Hs(c)) {
					let t = c[1] - c[0];
					e = Math.abs(t);
				}
				let n = {
					...t,
					...v
				};
				b !== void 0 && (n.duration = /* @__PURE__ */ W(b));
				let r = Wr(n, e, C);
				y = r.ease, b = r.duration;
			}
			b ??= a;
			let w = d + x;
			u.length === 1 && u[0] === 0 && (u[1] = 1);
			let T = u.length - c.length;
			if (T > 0 && oi(u, T), c.length === 1 && c.unshift(null), m && Ht(m < Fs, `Sequence segments can't repeat ${m} times — ignoring repeat option. Use a value below ${Fs} or apply repeat at the sequence level instead.`), m && m < Fs) {
				let e = b > 0 ? _ / b : 0;
				b = Os(b, m, _);
				let t = [...c], n = [...u];
				y = Array.isArray(y) ? [...y] : [y];
				let r = [...y], i = h === "reverse" || h === "mirror", a = t, o = r;
				i && (a = [...t].reverse(), h === "reverse" && (o = [...r].reverse().map((e) => typeof e == "function" ? /* @__PURE__ */ ln(e) : e)));
				for (let s = 0; s < m; s++) {
					let l = i && s % 2 == 0, d = l ? a : t, f = l ? o : r, p = (s + 1) * (1 + e);
					e > 0 && (c.push(c[c.length - 1]), u.push(p), y.push("linear")), c.push(...d);
					for (let e = 0; e < d.length; e++) u.push(n[e] + p), y.push(e === 0 ? "linear" : /* @__PURE__ */ xn(f, e - 1));
				}
				Ms(u, m, e);
			}
			let E = w + b;
			js(r, c, y, u, w, E), g = Math.max(x + b, g), f = Math.max(E, f);
		};
		if ($(p)) {
			let e = Ls(p, s);
			_(m, h, Rs("default", e));
		} else {
			let e = Ds(p, m, r, c), t = e.length;
			for (let n = 0; n < t; n++) {
				m = m, h = h;
				let r = e[n], i = Ls(r, s);
				for (let e in m) _(m[e], Bs(h, e), Rs(e, i), n, t);
			}
		}
		u = d, d += g;
	}
	return s.forEach((e, r) => {
		for (let i in e) {
			let a = e[i];
			a.sort(Ns);
			let s = [], c = [], l = [];
			for (let e = 0; e < a.length; e++) {
				let { at: t, value: n, easing: r } = a[e];
				s.push(n), c.push(/* @__PURE__ */ Xt(0, f, t)), l.push(r || "easeOut");
			}
			c[0] !== 0 && (c.unshift(0), s.unshift(s[0]), l.unshift(Ps)), c[c.length - 1] !== 1 && (c.push(1), s.push(null)), o.has(r) || o.set(r, {
				keyframes: {},
				transition: {}
			});
			let u = o.get(r);
			u.keyframes[i] = s;
			let { type: d, ...p } = t;
			u.transition[i] = {
				...p,
				duration: f,
				ease: l,
				times: c,
				...n
			};
		}
	}), o;
}
function Ls(e, t) {
	return !t.has(e) && t.set(e, {}), t.get(e);
}
function Rs(e, t) {
	return t[e] || (t[e] = []), t[e];
}
function zs(e) {
	return Array.isArray(e) ? e : [e];
}
function Bs(e, t) {
	return e && e[t] ? {
		...e,
		...e[t]
	} : { ...e };
}
var Vs = (e) => typeof e == "number", Hs = (e) => e.every(Vs);
//#endregion
//#region node_modules/framer-motion/dist/es/animation/utils/create-visual-element.mjs
function Us(e) {
	let t = {
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
	}, n = Ao(e) && !jo(e) ? new ws(t) : new fs(t);
	n.mount(e), Io.set(e, n);
}
function Ws(e) {
	let t = new ms({
		presenceContext: null,
		props: {},
		visualState: {
			renderState: { output: {} },
			latestValues: {}
		}
	});
	t.mount(e), Io.set(e, t);
}
//#endregion
//#region node_modules/framer-motion/dist/es/animation/animate/subject.mjs
function Gs(e, t) {
	return $(e) || typeof e == "number" || typeof e == "string" && !Es(t);
}
function Ks(e, t, n, r) {
	let i = [];
	if (Gs(e, t)) i.push(Ts(e, Es(t) && t.default || t, n && (n.default || n)));
	else {
		if (e == null) return i;
		let a = Ds(e, t, r), o = a.length;
		U(!!o, "No valid elements provided.", "no-valid-elements");
		for (let e = 0; e < o; e++) {
			let r = a[e], s = r instanceof Element ? Us : Ws;
			Io.has(r) || s(r);
			let c = Io.get(r), l = { ...n };
			"delay" in l && typeof l.delay == "function" && (l.delay = l.delay(e, o)), i.push(...io(c, {
				...t,
				transition: l
			}, {}));
		}
	}
	return i;
}
//#endregion
//#region node_modules/framer-motion/dist/es/animation/animate/sequence.mjs
function qs(e, t, n) {
	let r = [];
	return Is(e.map((e) => {
		if (Array.isArray(e) && typeof e[0] == "function") {
			let t = e[0], n = ka(0);
			return n.on("change", t), e.length === 1 ? [n, [0, 1]] : e.length === 2 ? [
				n,
				[0, 1],
				e[1]
			] : [
				n,
				e[1],
				e[2]
			];
		}
		return e;
	}), t, n, { spring: ei }).forEach(({ keyframes: e, transition: t }, n) => {
		r.push(...Ks(n, e, t));
	}), r;
}
//#endregion
//#region node_modules/framer-motion/dist/es/animation/animate/index.mjs
function Js(e) {
	return Array.isArray(e) && e.some(Array.isArray);
}
function Ys(e = {}) {
	let { scope: t, reduceMotion: n, skipAnimations: r } = e;
	function i(e, i, a) {
		let o = [], s, c = {};
		if (n !== void 0 && (c.reduceMotion = n), r !== void 0 && (c.skipAnimations = r), Js(e)) {
			let { onComplete: n, ...r } = i || {};
			typeof n == "function" && (s = n), o = qs(e, {
				...c,
				...r
			}, t);
		} else {
			let { onComplete: n, ...r } = a || {};
			typeof n == "function" && (s = n), o = Ks(e, i, {
				...c,
				...r
			}, t);
		}
		let l = new wa(o);
		return s && l.finished.then(s), t && (t.animations.push(l), l.finished.then(() => {
			zt(t.animations, l);
		})), l;
	}
	return i;
}
var Xs = Ys(), Zs = class {
	engine;
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
	input = yt;
	audio = xt;
	ui = Et;
	debug = Ot;
	debugRenderer;
	videoTimeline;
	sceneObstacles = [];
	constructor(t = {}) {
		this.config = t, this.save = new Nt(t.gameId || "default"), this.scenes = new Pt(this), this.cutscene = new Lt(this), this.videoTimeline = new Mt(this), this.debugRenderer = new jt(this), this.engine = new me(), this.physics = new ye(), this.physics.gravity = t.gravity ? new F(...t.gravity) : new F(0, -9.81, 0), this.scene = new e.Scene();
		let n = t.background ?? 592139;
		this.scene.background = new e.Color(n), t.fogColor && (this.scene.fog = new e.Fog(new e.Color(t.fogColor), t.fogNear ?? 15, t.fogFar ?? 65));
		let r;
		if (typeof t.canvas == "string" ? r = document.getElementById(t.canvas.replace("#", "")) : t.canvas ? r = t.canvas : (r = document.createElement("canvas"), document.body.appendChild(r)), this.renderer = new e.WebGLRenderer({
			canvas: r,
			antialias: !0,
			powerPreference: "high-performance",
			alpha: !0,
			preserveDrawingBuffer: !0
		}), this.renderer.setSize(window.innerWidth, window.innerHeight), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), r.style.position = "absolute", r.style.top = "0", r.style.left = "0", r.style.zIndex = "1", t.enableBabylon && (this.babylonCanvas = document.createElement("canvas"), this.babylonCanvas.id = "babylon-canvas", this.babylonCanvas.style.position = "absolute", this.babylonCanvas.style.top = "0", this.babylonCanvas.style.left = "0", this.babylonCanvas.style.width = "100%", this.babylonCanvas.style.height = "100%", this.babylonCanvas.style.pointerEvents = "none", this.babylonCanvas.style.zIndex = "2", document.body.appendChild(this.babylonCanvas), t.rendererBackend !== "webgpu")) try {
			this.babylonEngine = new N.Engine(this.babylonCanvas, !0, {
				preserveDrawingBuffer: !0,
				stencil: !0,
				alpha: !0
			}), this.babylonScene = new N.Scene(this.babylonEngine), this.babylonScene.clearColor = new N.Color4(0, 0, 0, 0), new N.FreeCamera("babylonCam", new N.Vector3(0, 6, 12), this.babylonScene).setTarget(N.Vector3.Zero());
		} catch (e) {
			console.error("Failed to initialize Babylon.js dual-engine layer:", e);
		}
		this.screenRecorder = new At(r);
		let i = window.innerWidth / window.innerHeight;
		if (this.config.mode === "2d") {
			let t = this.config.orthoScale ?? 10;
			this.camera = new e.OrthographicCamera(-t * i / 2, t * i / 2, t / 2, -t / 2, .1, 1e3), this.camera.position.set(0, 0, 10);
		} else this.camera = new e.PerspectiveCamera(55, i, .1, 200), this.camera.position.set(0, 6, 12);
		this.cameraController = new Pe(this.camera), this.pipeline = new $e(this.renderer, this.scene, this.camera), t.shadows !== !1 && this.pipeline.setupLighting({}), window.addEventListener("resize", () => {
			let t = window.innerWidth / window.innerHeight;
			if (this.camera instanceof e.PerspectiveCamera) this.camera.aspect = t, this.camera.updateProjectionMatrix();
			else if (this.camera instanceof e.OrthographicCamera) {
				let e = this.config.orthoScale ?? 10;
				this.camera.left = -e * t / 2, this.camera.right = e * t / 2, this.camera.top = e / 2, this.camera.bottom = -e / 2, this.camera.updateProjectionMatrix();
			}
			this.renderer.setSize(window.innerWidth, window.innerHeight), this.babylonEngine && (this.babylonEngine.resize(), this.babylonScene && this.babylonScene.activeCamera && this.camera instanceof e.PerspectiveCamera && (this.babylonScene.activeCamera.fov = this.camera.fov * (Math.PI / 180)));
		}), this.engine.events.on("update", (e) => {
			if (this.physics.step(e), this.cameraController.update(e, this.sceneObstacles), this.babylonScene && this.babylonScene.activeCamera) {
				this.babylonScene.activeCamera.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
				let e = this.camera.quaternion;
				this.babylonScene.activeCamera.rotationQuaternion === void 0 && (this.babylonScene.activeCamera.rotationQuaternion = new N.Quaternion()), this.babylonScene.activeCamera.rotationQuaternion.set(e.x, e.y, e.z, e.w);
			}
			this.input.endFrame();
		}), this.engine.events.on("render", () => {
			if (this.pipeline.render(), this.babylonScene) try {
				this.babylonScene.render();
			} catch (e) {
				console.error("Babylon render error:", e);
			}
			this.debug.update(this.pipeline.metrics, this.engine.activeScene.root.children.length);
		}), typeof window < "u" && (window.KairoAPI = {
			app: this,
			startVideoRecording: (e = 60) => this.startRecording(e),
			stopVideoRecording: (e) => this.stopRecording(e),
			captureScreenshot: (e) => this.captureScreenshot(e),
			recordGameplaySequence: async (e, t) => (this.startRecording(60), await new Promise((t) => setTimeout(t, e)), await this.stopRecording(t))
		});
	}
	registerObstacle(e) {
		this.sceneObstacles.push(e);
	}
	clearObstacles() {
		this.sceneObstacles = [];
	}
	setLighting(e) {
		let t = typeof e.ambient == "number" ? e.ambient : e.ambientIntensity;
		return this.pipeline.setupLighting({
			...e,
			ambientIntensity: t
		});
	}
	isKeyDown(e) {
		return this.input.isKeyDown(e);
	}
	animate(e, t, n) {
		return Xs(e, t, n);
	}
	onUpdate(e) {
		this.engine.events.on("update", e);
	}
	async start() {
		if (this.audio.init(), this.config.rendererBackend === "webgpu" && (console.log("Kairo: Initializing WebGPU Backend..."), this.config.enableBabylon && this.babylonCanvas && !this.babylonEngine)) try {
			let e = new N.WebGPUEngine(this.babylonCanvas, { stencil: !0 });
			await e.initAsync(), this.babylonEngine = e, this.babylonScene = new N.Scene(this.babylonEngine), this.babylonScene.clearColor = new N.Color4(0, 0, 0, 0), new N.FreeCamera("babylonCam", new N.Vector3(0, 6, 12), this.babylonScene).setTarget(N.Vector3.Zero()), console.log("Kairo: Babylon.js WebGPU Engine Started successfully.");
		} catch (e) {
			console.error("Kairo: WebGPU not supported or failed to initialize in Babylon. Falling back to WebGL.", e), this.babylonEngine = new N.Engine(this.babylonCanvas, !0, {
				preserveDrawingBuffer: !0,
				stencil: !0,
				alpha: !0
			}), this.babylonScene = new N.Scene(this.babylonEngine), this.babylonScene.clearColor = new N.Color4(0, 0, 0, 0), new N.FreeCamera("babylonCam", new N.Vector3(0, 6, 12), this.babylonScene).setTarget(N.Vector3.Zero());
		}
		this.engine.start();
	}
	stop() {
		this.engine.stop();
	}
	createBox(t) {
		let n = t.size ?? [
			1,
			1,
			1
		], r = new e.Mesh(new e.BoxGeometry(...n), new e.MeshStandardMaterial({
			color: t.color ?? 16777215,
			roughness: t.roughness ?? .5,
			metalness: t.metalness ?? .1
		}));
		if (r.position.set(...t.position ?? [
			0,
			0,
			0
		]), r.castShadow = !0, r.receiveShadow = !0, this.scene.add(r), t.physics) {
			let e = new ve();
			e.type = t.physics === "static" ? R.Static : R.Dynamic, e.mass = t.mass ?? (t.physics === "static" ? 0 : 1);
			let i = new _e();
			i.type = z.Box, i.size = new F(...n), this.physics.registerBody(e, i, new F(...r.position.toArray()));
			let a = this.engine.events.on("update", () => {
				e.cannonBody && (r.position.set(e.cannonBody.position.x, e.cannonBody.position.y, e.cannonBody.position.z), r.quaternion.set(e.cannonBody.quaternion.x, e.cannonBody.quaternion.y, e.cannonBody.quaternion.z, e.cannonBody.quaternion.w));
			});
			return {
				mesh: r,
				rb: e,
				col: i,
				dispose: () => {
					a(), this.scene.remove(r), this.physics.unregisterBody(e), r.geometry.dispose(), (Array.isArray(r.material) ? r.material : [r.material]).forEach((e) => e.dispose());
				}
			};
		}
		return { mesh: r };
	}
	attachPhysics(t, n = {}) {
		let r = new ve();
		r.type = n.type === "static" ? R.Static : R.Dynamic, r.mass = n.mass ?? +(r.type === R.Dynamic);
		let i = n.colliderType || n.size ? (() => {
			let e = new _e();
			return e.type = n.colliderType === "sphere" ? z.Sphere : n.colliderType === "capsule" ? z.Capsule : z.Box, e.size = new F(...n.size ?? [
				1,
				1,
				1
			]), e;
		})() : gt(t);
		(i.size.x <= 0 || i.size.y <= 0 || i.size.z <= 0) && i.size.set(.1, .1, .1), n.addToScene && (t.castShadow = n.castShadow ?? !0, t.receiveShadow = !0, this.scene.add(t)), this.physics.registerBody(r, i, new F(...t.getWorldPosition(new e.Vector3()).toArray()));
		let a = this.engine.events.on("update", () => {
			r.cannonBody && (t.position.set(r.cannonBody.position.x, r.cannonBody.position.y, r.cannonBody.position.z), t.quaternion.set(r.cannonBody.quaternion.x, r.cannonBody.quaternion.y, r.cannonBody.quaternion.z, r.cannonBody.quaternion.w));
		});
		return {
			mesh: t,
			rb: r,
			collider: i,
			dispose: () => {
				a(), this.scene.remove(t), this.physics.unregisterBody(r);
			}
		};
	}
	createBabylonBox(e) {
		if (!this.babylonScene) throw Error("Babylon is not enabled. Set enableBabylon: true in KairoAppConfig.");
		let t = e.size ?? [
			1,
			1,
			1
		], n = N.MeshBuilder.CreateBox(e.name ?? "babylonBox", {
			width: t[0],
			height: t[1],
			depth: t[2]
		}, this.babylonScene);
		if (n.position.set(...e.position ?? [
			0,
			0,
			0
		]), e.color) {
			let t = new N.StandardMaterial("babylonMat", this.babylonScene);
			t.diffuseColor = new N.Color3(...e.color), n.material = t;
		}
		if (e.physics) {
			let r = new ve();
			r.type = e.physics === "static" ? R.Static : R.Dynamic, r.mass = e.mass ?? (e.physics === "static" ? 0 : 1);
			let i = new _e();
			i.type = z.Box, i.size = new F(...t), this.physics.registerBody(r, i, new F(n.position.x, n.position.y, n.position.z)), n.rotationQuaternion = new N.Quaternion();
			let a = this.engine.events.on("update", () => {
				r.cannonBody && (n.position.set(r.cannonBody.position.x, r.cannonBody.position.y, r.cannonBody.position.z), n.rotationQuaternion.set(r.cannonBody.quaternion.x, r.cannonBody.quaternion.y, r.cannonBody.quaternion.z, r.cannonBody.quaternion.w));
			});
			return {
				mesh: n,
				rb: r,
				col: i,
				dispose: () => {
					a(), n.dispose(), this.physics.unregisterBody(r);
				}
			};
		}
		return {
			mesh: n,
			dispose: () => n.dispose()
		};
	}
	setBackgroundImage(t, n = !1) {
		new e.TextureLoader().load(t, (t) => {
			(n || this.config.pixelArt) && (t.minFilter = e.NearestFilter, t.magFilter = e.NearestFilter), t.colorSpace = e.SRGBColorSpace, this.scene.background = t;
		});
	}
	createBlock2D(t) {
		let n = t.size ?? [1, 1], r;
		if (t.textureUrl) {
			let n = new e.TextureLoader().load(t.textureUrl);
			t.pixelArt !== !1 && (t.pixelArt || this.config.pixelArt) && (n.minFilter = e.NearestFilter, n.magFilter = e.NearestFilter), n.colorSpace = e.SRGBColorSpace, r = new e.MeshBasicMaterial({
				map: n,
				color: t.color ?? 16777215,
				transparent: !0
			});
		} else r = new e.MeshBasicMaterial({
			color: t.color ?? 16777215,
			transparent: !0
		});
		let i = new e.Mesh(new e.PlaneGeometry(n[0], n[1]), r);
		i.position.set(...t.position ?? [
			0,
			0,
			0
		]), this.scene.add(i);
		let a = [];
		if (t.billboard && a.push(this.engine.events.on("update", () => {
			i.quaternion.copy(this.camera.quaternion);
		})), t.physics) {
			let e = new ve();
			e.type = t.physics === "static" ? R.Static : R.Dynamic, e.mass = t.mass ?? (t.physics === "static" ? 0 : 1), t.fixedRotation && (e.fixedRotation = !0), t.lockZAxis && (e.lockLinearAxis = [
				!1,
				!1,
				!0
			], e.lockAngularAxis = [
				!0,
				!0,
				!1
			]);
			let o = new _e();
			return o.type = z.Box, o.size = new F(n[0], n[1], 1), this.physics.registerBody(e, o, new F(...i.position.toArray())), a.push(this.engine.events.on("update", () => {
				e.cannonBody && (i.position.set(e.cannonBody.position.x, e.cannonBody.position.y, e.cannonBody.position.z), t.billboard || i.quaternion.set(e.cannonBody.quaternion.x, e.cannonBody.quaternion.y, e.cannonBody.quaternion.z, e.cannonBody.quaternion.w));
			})), {
				mesh: i,
				rb: e,
				col: o,
				dispose: () => {
					a.forEach((e) => e()), this.scene.remove(i), this.physics.unregisterBody(e), i.geometry.dispose(), r.dispose();
				}
			};
		}
		return {
			mesh: i,
			dispose: () => {
				a.forEach((e) => e()), this.scene.remove(i), i.geometry.dispose(), r.dispose();
			}
		};
	}
	createText3D(t) {
		let n = t.text, r = t.font || "bold 64px sans-serif", i = t.color || "#ffffff", a = document.createElement("canvas"), o = a.getContext("2d");
		o.font = r;
		let s = o.measureText(n), c = Math.ceil(s.width), l = 64, u = r.match(/(\d+)px/);
		u && (l = parseInt(u[1], 10));
		let d = Math.ceil(s.actualBoundingBoxAscent + s.actualBoundingBoxDescent || l * 1.2);
		a.width = Math.max(c + 20, 2), a.height = Math.max(d + 20, 2), o.font = r, o.fillStyle = i, o.textAlign = t.align || "center", o.textBaseline = "middle";
		let f = o.textAlign === "center" ? a.width / 2 : o.textAlign === "right" ? a.width - 10 : 10, p = a.height / 2;
		o.fillText(n, f, p);
		let m = new e.CanvasTexture(a);
		m.minFilter = e.LinearFilter, m.colorSpace = e.SRGBColorSpace;
		let h = new e.MeshBasicMaterial({
			map: m,
			transparent: !0,
			side: e.DoubleSide
		}), g = a.width / a.height, _ = t.size ?? 1, v = _ * g, y = _, b = new e.Mesh(new e.PlaneGeometry(v, y), h);
		b.position.set(...t.position ?? [
			0,
			0,
			0
		]), this.scene.add(b);
		let x;
		return t.billboard && (x = this.engine.events.on("update", () => {
			b.quaternion.copy(this.camera.quaternion);
		})), {
			mesh: b,
			setText: (n) => {
				o.clearRect(0, 0, a.width, a.height), o.font = r;
				let s = o.measureText(n), c = Math.ceil(s.width) + 20, l = !1;
				c > a.width && (a.width = c, l = !0), o.font = r, o.fillStyle = i, o.textAlign = t.align || "center", o.textBaseline = "middle";
				let u = o.textAlign === "center" ? a.width / 2 : o.textAlign === "right" ? a.width - 10 : 10;
				if (o.fillText(n, u, a.height / 2), m.needsUpdate = !0, l) {
					let t = a.width / a.height;
					b.geometry.dispose(), b.geometry = new e.PlaneGeometry(_ * t, _);
				}
			},
			dispose: () => {
				x && x(), this.scene.remove(b), b.geometry.dispose(), h.dispose(), m.dispose();
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
		let e = this.pipeline.metrics.cpuRenderMs || .7, t = this.pipeline.metrics.cpuPhysicsMs || .5, n = this.pipeline.metrics.cpuAiMs || 0, r = .2, i = .3, a = .4, o = parseFloat((e + t + n + r + i + a).toFixed(2)), s = 16.67, c = parseFloat((s - o).toFixed(2));
		return {
			webGlRenderMs: e,
			physicsStepMs: t,
			sceneGraphUpdateMs: r,
			animationMs: i,
			particlesMs: a,
			aiPathfindingMs: n,
			totalCpuTimeMs: o,
			targetFrameBudgetMs: s,
			cpuHeadroomMs: c,
			cpuHeadroomPercent: (c / s * 100).toFixed(1) + "%"
		};
	}
	getMemoryMapDump() {
		let e = this.renderer.info, t = 0, n = 0, r = 0, i = 0;
		this.scene.traverse((e) => {
			t++, e.type === "Mesh" && n++, e.type === "InstancedMesh" && r++, e.type.includes("Light") && i++;
		});
		let a = typeof performance < "u" ? performance.memory : null, o = a ? a.usedJSHeapSize : 0, s = a ? a.totalJSHeapSize : 0, c = a ? a.jsHeapSizeLimit : 0, l = e.memory.geometries * 45e3, u = e.memory.textures * 1024 * 1024, d = l + u, f = this.getCpuProfileMap(), p = [
			{
				subsystem: "WebGL Geometries",
				description: `${e.memory.geometries} active buffer geometries`,
				bytes: l,
				formatted: (l / 1024).toFixed(1) + " KB"
			},
			{
				subsystem: "WebGL Textures",
				description: `${e.memory.textures} active GPU texture maps`,
				bytes: u,
				formatted: (u / (1024 * 1024)).toFixed(1) + " MB"
			},
			{
				subsystem: "JS Engine Heap",
				description: "Active V8 JavaScript heap allocation",
				bytes: o,
				formatted: (o / (1024 * 1024)).toFixed(1) + " MB"
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
				cpuProfileMap: f
			},
			cpuProfileMap: f,
			gpuMemory: {
				geometries: e.memory.geometries,
				textures: e.memory.textures,
				estimatedVramBytes: d,
				estimatedVramMb: (d / (1024 * 1024)).toFixed(2) + " MB"
			},
			jsHeap: {
				usedHeapBytes: o,
				totalHeapBytes: s,
				heapLimitBytes: c,
				usedHeapMb: (o / (1024 * 1024)).toFixed(2) + " MB"
			},
			sceneGraph: {
				totalNodes: t,
				meshesCount: n,
				instancedMeshesCount: r,
				lightsCount: i
			},
			memoryMapBreakdown: p
		};
	}
	createVideoTimeline(e = 10) {
		return this.videoTimeline = new Mt(this, e), this.videoTimeline;
	}
	addCameraShot(e, t, n, r) {
		let i = this.videoTimeline.tracks.find((e) => e.type === "camera");
		i && this.videoTimeline.addClip(i.id, {
			name: `Camera ${n}`,
			type: "camera",
			startTime: e,
			duration: t,
			props: {
				shotType: n,
				...r
			}
		});
	}
	addVideoOverlay(e, t, n, r) {
		let i = this.videoTimeline.tracks.find((e) => e.type === "overlay");
		i && this.videoTimeline.addClip(i.id, {
			name: "Image Overlay",
			type: "overlay",
			startTime: e,
			duration: t,
			props: {
				url: n,
				...r
			}
		});
	}
	addVideoText(e, t, n) {
		let r = this.videoTimeline.tracks.find((e) => e.type === "text");
		r && this.videoTimeline.addClip(r.id, {
			name: "Title Card",
			type: "text",
			startTime: e,
			duration: t,
			props: { text: n }
		});
	}
	addVideoTransition(e, t, n) {
		let r = this.videoTimeline.tracks.find((e) => e.type === "transition");
		r && this.videoTimeline.addClip(r.id, {
			name: `Transition ${n}`,
			type: "transition",
			startTime: e,
			duration: t,
			props: { transitionType: n }
		});
	}
	addVideoColorGrading(e, t, n) {
		let r = this.videoTimeline.tracks.find((e) => e.type === "colorGrade");
		r && this.videoTimeline.addClip(r.id, {
			name: `Color Grade ${n}`,
			type: "colorGrade",
			startTime: e,
			duration: t,
			props: { preset: n }
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
}, Qs = class {
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
}, $s = class {
	p = /* @__PURE__ */ new Uint8Array(512);
	perm = /* @__PURE__ */ new Uint8Array(512);
	permMod12 = /* @__PURE__ */ new Uint8Array(512);
	constructor(e) {
		let t = new Qs(e ?? Date.now());
		for (let e = 0; e < 256; e++) this.p[e] = e;
		for (let e = 0; e < 255; e++) {
			let n = e + ~~(t.next() * (256 - e)), r = this.p[e];
			this.p[e] = this.p[n], this.p[n] = r;
		}
		for (let e = 0; e < 512; e++) this.perm[e] = this.p[e & 255], this.permMod12[e] = this.perm[e] % 12;
	}
	dot(e, t, n) {
		return e[0] * t + e[1] * n;
	}
	dot3(e, t, n, r) {
		return e[0] * t + e[1] * n + e[2] * r;
	}
	noise2D(e, t) {
		let n = .5 * (Math.sqrt(3) - 1), r = (3 - Math.sqrt(3)) / 6, i = (e + t) * n, a = Math.floor(e + i), o = Math.floor(t + i), s = (a + o) * r, c = a - s, l = o - s, u = e - c, d = t - l, f, p;
		u > d ? (f = 1, p = 0) : (f = 0, p = 1);
		let m = u - f + r, h = d - p + r, g = u - 1 + 2 * r, _ = d - 1 + 2 * r, v = a & 255, y = o & 255, b = this.permMod12[v + this.perm[y]], x = this.permMod12[v + f + this.perm[y + p]], S = this.permMod12[v + 1 + this.perm[y + 1]], C = .5 - u * u - d * d, w = 0;
		C >= 0 && (C *= C, w = C * C * this.dot(ec[b], u, d));
		let T = .5 - m * m - h * h, E = 0;
		T >= 0 && (T *= T, E = T * T * this.dot(ec[x], m, h));
		let D = .5 - g * g - _ * _, ee = 0;
		return D >= 0 && (D *= D, ee = D * D * this.dot(ec[S], g, _)), 70 * (w + E + ee);
	}
}, ec = [
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
], tc = class {
	map;
	width;
	height;
	prng;
	constructor(e, t, n = .45, r) {
		this.width = e, this.height = t, this.map = [], this.prng = new Qs(r ?? Date.now());
		for (let r = 0; r < e; r++) {
			this.map[r] = [];
			for (let i = 0; i < t; i++) r === 0 || r === e - 1 || i === 0 || i === t - 1 ? this.map[r][i] = 1 : this.map[r][i] = +(this.prng.next() < n);
		}
	}
	smooth(e = 5) {
		for (let t = 0; t < e; t++) {
			let e = [];
			for (let t = 0; t < this.width; t++) {
				e[t] = [];
				for (let n = 0; n < this.height; n++) {
					let r = this.getSurroundingWallCount(t, n);
					r > 4 ? e[t][n] = 1 : r < 4 ? e[t][n] = 0 : e[t][n] = this.map[t][n];
				}
			}
			this.map = e;
		}
	}
	getSurroundingWallCount(e, t) {
		let n = 0;
		for (let r = e - 1; r <= e + 1; r++) for (let i = t - 1; i <= t + 1; i++) r >= 0 && r < this.width && i >= 0 && i < this.height ? (r !== e || i !== t) && (n += this.map[r][i]) : n++;
		return n;
	}
}, nc = class {
	object;
	app;
	enabled = !0;
	_isSpinning = !1;
	_spinSpeed = 1.5;
	_isBobbing = !1;
	_bobAmount = .25;
	_bobSpeed = 3;
	_baseY = null;
	_bobTimer = 0;
	_isPatrolling = !1;
	_patrolDistance = 4;
	_patrolSpeed = 2.5;
	_patrolDir = 1;
	_startX = null;
	_isPulsing = !1;
	_pulseMin = .8;
	_pulseMax = 1.2;
	_pulseSpeed = 4;
	_pulseTimer = 0;
	_baseScale = new e.Vector3(1, 1, 1);
	_isJumping = !1;
	_jumpVelocity = 0;
	_groundY = 0;
	_customData = {};
	attach(e, t) {
		this.object = e, this.app = t, this.object && (this._baseY = this.object.position.y, this._startX = this.object.position.x, this._baseScale.copy(this.object.scale)), this.onStart();
	}
	onStart() {}
	onUpdate(e) {}
	onCollision(e) {}
	onInteract() {}
	onDestroy() {}
	_internalTick(e) {
		if (!(!this.enabled || !this.object)) {
			if (this._baseY === null && (this._baseY = this.object.position.y), this._startX === null && (this._startX = this.object.position.x), this._isSpinning && (this.object.rotation.y += this._spinSpeed * e), this._isBobbing && !this._isJumping && (this._bobTimer += e * this._bobSpeed, this.object.position.y = this._baseY + Math.sin(this._bobTimer) * this._bobAmount), this._isPatrolling && (this.object.position.x += this._patrolDir * this._patrolSpeed * e, Math.abs(this.object.position.x - this._startX) > this._patrolDistance && (this._patrolDir = -this._patrolDir)), this._isPulsing) {
				this._pulseTimer += e * this._pulseSpeed;
				let t = this._pulseMin + (Math.sin(this._pulseTimer) * .5 + .5) * (this._pulseMax - this._pulseMin);
				this.object.scale.set(this._baseScale.x * t, this._baseScale.y * t, this._baseScale.z * t);
			}
			this._isJumping && (this.object.position.y += this._jumpVelocity * e, this._jumpVelocity -= 18 * e, this.object.position.y <= this._groundY && (this.object.position.y = this._groundY, this._isJumping = !1, this.dustBurst(12))), this.onUpdate(e);
		}
	}
	spin(e = 1.5) {
		return this._isSpinning = !0, this._spinSpeed = e, this;
	}
	bob(e = .25, t = 3) {
		return this._isBobbing = !0, this._bobAmount = e, this._bobSpeed = t, this;
	}
	patrol(e = 4, t = 2.5) {
		return this._isPatrolling = !0, this._patrolDistance = e, this._patrolSpeed = t, this;
	}
	pulse(e = .85, t = 1.2, n = 4) {
		return this._isPulsing = !0, this._pulseMin = e, this._pulseMax = t, this._pulseSpeed = n, this;
	}
	jump(e = 7) {
		return this.object && (this._isJumping || (this._groundY = this._baseY ?? this.object.position.y, this._jumpVelocity = e, this._isJumping = !0, this.playSound("jump"))), this;
	}
	stop() {
		return this._isSpinning = !1, this._isBobbing = !1, this._isPatrolling = !1, this._isPulsing = !1, this;
	}
	move(e, t, n) {
		return this.object && (this.object.position.x += e, this.object.position.y += t, this.object.position.z += n), this;
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
	rotate(e, t, n) {
		return this.object && (this.object.rotation.x += e, this.object.rotation.y += t, this.object.rotation.z += n), this;
	}
	chase(t, n = 3, r = .016) {
		if (!this.object) return this;
		let i = Array.isArray(t) ? new e.Vector3(...t) : t, a = i.clone().sub(this.object.position).normalize();
		return this.object.position.add(a.multiplyScalar(n * r)), this.object.lookAt(i), this;
	}
	navigateTo(e, t = 3, n = .016) {
		return this.chase(e, t, n);
	}
	setPosition(e, t, n) {
		return this.object && this.object.position.set(e, t, n), this;
	}
	getPosition() {
		return this.object ? this.object.position : new e.Vector3();
	}
	getDistanceTo(e) {
		if (!this.object) return 0;
		let t = "position" in e ? e.position : e;
		return this.object.position.distanceTo(t);
	}
	isNear(e, t = 2) {
		return this.getDistanceTo(e) <= t;
	}
	cutToShot(t, n) {
		if (this.app?.cameraController) {
			let r = Array.isArray(t) ? new e.Vector3(...t) : t, i = Array.isArray(n) ? new e.Vector3(...n) : n;
			this.app.cameraController.cutTo(r, i);
		}
		return this;
	}
	panCamera(t, n, r, i = 3) {
		if (this.app?.cameraController) {
			let a = Array.isArray(t) ? new e.Vector3(...t) : t, o = Array.isArray(n) ? new e.Vector3(...n) : n, s = Array.isArray(r) ? new e.Vector3(...r) : r;
			this.app.cameraController.panTo(a, o, s, i);
		}
		return this;
	}
	orbitCamera(t, n = 8, r = 1, i = 5) {
		if (this.app?.cameraController) {
			let a = Array.isArray(t) ? new e.Vector3(...t) : t;
			this.app.cameraController.orbitShot(a, n, r, i);
		}
		return this;
	}
	dollyZoom(e = 30, t = 2.5) {
		return this.app?.cameraController && this.app.cameraController.dollyZoom(e, t), this;
	}
	craneShot(t, n, r = 4) {
		if (this.app?.cameraController) {
			let i = Array.isArray(t) ? new e.Vector3(...t) : t, a = Array.isArray(n) ? new e.Vector3(...n) : n;
			this.app.cameraController.craneShot(i, a, r);
		}
		return this;
	}
	trackObject(e) {
		return this.app?.cameraController && this.app.cameraController.trackObject(e), this;
	}
	createVideoTimeline(e = 10) {
		return this.app?.createVideoTimeline ? this.app.createVideoTimeline(e) : null;
	}
	addCameraShot(e, t, n, r) {
		return this.app?.addCameraShot && this.app.addCameraShot(e, t, n, r), this;
	}
	addVideoOverlay(e, t, n, r) {
		return this.app?.addVideoOverlay && this.app.addVideoOverlay(e, t, n, r), this;
	}
	addVideoText(e, t, n) {
		return this.app?.addVideoText && this.app.addVideoText(e, t, n), this;
	}
	addVideoTransition(e, t, n) {
		return this.app?.addVideoTransition && this.app.addVideoTransition(e, t, n), this;
	}
	addVideoColorGrading(e, t, n) {
		return this.app?.addVideoColorGrading && this.app.addVideoColorGrading(e, t, n), this;
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
	shakeCamera(e = .4, t = .3) {
		return this.app?.cameraController && this.app.cameraController.shake({
			intensity: e,
			duration: t
		}), this;
	}
	setCameraDistance(e) {
		return this.app?.cameraController && (this.app.cameraController.distance = e), this;
	}
	showModal(e, t, n) {
		return this.app?.ui && this.app.ui.createModal(e, t, n || [{
			text: "OK",
			primary: !0,
			onClick: () => {}
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
	playAnimation(e, t = .2) {
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
		let e = [
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
	say(e, t = 2e3, n = "info") {
		return this.app?.ui && this.app.ui.showToast(e, t, n), this;
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
}, rc = class {
	scripts = [];
	add(e, t, n) {
		e.attach(t, n), this.scripts.push(e);
	}
	remove(e) {
		let t = this.scripts.indexOf(e);
		t !== -1 && (this.scripts[t].onDestroy(), this.scripts.splice(t, 1));
	}
	update(e) {
		for (let t = 0; t < this.scripts.length; t++) {
			let n = this.scripts[t];
			n.enabled && n._internalTick(e);
		}
	}
	clear() {
		this.scripts.forEach((e) => e.onDestroy()), this.scripts = [];
	}
}, ic = { createBehavior: (e) => {
	let t = new nc();
	return e.onStart && (t.onStart = e.onStart.bind(t)), e.onUpdate && (t.onUpdate = e.onUpdate.bind(t)), e.onInteract && (t.onInteract = e.onInteract.bind(t)), e.onCollision && (t.onCollision = e.onCollision.bind(t)), t;
} }, ac = class {
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
}, oc = class {
	contexts = /* @__PURE__ */ new Map();
	entityToContextMap = /* @__PURE__ */ new Map();
	registerContext(e, t) {
		if (this.contexts.has(e)) return this.contexts.get(e);
		let n = new ac(e, t);
		return this.contexts.set(e, n), n;
	}
	getContext(e) {
		return this.contexts.get(e);
	}
	attachEntityToContext(e, t) {
		let n = this.contexts.get(t);
		if (!n) throw Error(`[SharedEntityContextManager] Context '${t}' not found.`);
		let r = this.entityToContextMap.get(e);
		r && r !== t && this.contexts.get(r)?.unregisterEntity(e), n.registerEntity(e), this.entityToContextMap.set(e, t);
	}
	detachEntity(e) {
		let t = this.entityToContextMap.get(e);
		t && (this.contexts.get(t)?.unregisterEntity(e), this.entityToContextMap.delete(e));
	}
	getEntityContextId(e) {
		return this.entityToContextMap.get(e);
	}
	getEntityContext(e) {
		let t = this.entityToContextMap.get(e);
		return t ? this.contexts.get(t) : void 0;
	}
	forEachInContext(e, t) {
		let n = this.getContext(e);
		if (!n) return;
		let r = n.properties;
		n.entityIds.forEach((e) => {
			t(e, r);
		});
	}
	getStats() {
		let e = 0, t = 0;
		this.contexts.forEach((n) => {
			let r = n.entityCount;
			e += r, t += Object.keys(n.properties).length;
		});
		let n = Math.max(0, (e - this.contexts.size) * t * 64);
		return {
			totalRegisteredContexts: this.contexts.size,
			totalEntitiesSharing: e,
			estimatedMemorySavedBytes: n
		};
	}
	clear() {
		this.contexts.clear(), this.entityToContextMap.clear();
	}
}, sc = /* @__PURE__ */ function(e) {
	return e.PreUpdate = "PreUpdate", e.Update = "Update", e.PostUpdate = "PostUpdate", e.FixedUpdate = "FixedUpdate", e;
}({}), cc = class {
	enabled = !0;
	priority = 0;
	stage = "Update";
}, lc = class {
	all;
	any;
	none;
	_key;
	constructor(e = [], t = [], n = []) {
		this.all = e, this.any = t, this.none = n;
	}
	matches(e, t) {
		return !this.all.every((n) => e.hasComponent(t, n)) || !(this.any.length === 0 || this.any.some((n) => e.hasComponent(t, n))) ? !1 : !this.none.some((n) => e.hasComponent(t, n));
	}
}, uc = class {
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
			let t = this.getComponentTypeId(e[0]), n = this.getComponentTypeId(e[1]);
			return t < n ? `${t},${n}` : `${n},${t}`;
		}
		let t = [];
		for (let n = 0; n < e.length; n++) t.push(this.getComponentTypeId(e[n]));
		return t.sort((e, t) => e - t), t.join(",");
	}
	getQueryCacheKey(e) {
		if (e._key !== void 0) return e._key;
		let t = `${this.buildQueryKeyPart(e.all)}|${this.buildQueryKeyPart(e.any)}|${this.buildQueryKeyPart(e.none)}`;
		return e._key = t, t;
	}
	invalidateQueryCache() {
		this.queryCache.size > 0 && this.queryCache.clear();
	}
	sharedContexts = new oc();
	createEntity(e) {
		this.invalidateQueryCache();
		let t = this.nextEntityId++;
		return this.activeEntities.add(t), this.tags.set(t, /* @__PURE__ */ new Set()), this.children.set(t, /* @__PURE__ */ new Set()), e && (this.entityNames.set(t, e), this.addTag(t, e)), t;
	}
	createSharedContext(e, t) {
		return this.sharedContexts.registerContext(e, t);
	}
	createEntityWithSharedContext(e, t) {
		let n = this.createEntity(t);
		return this.sharedContexts.attachEntityToContext(n, e), n;
	}
	getEntityName(e) {
		return this.entityNames.get(e);
	}
	setEntityName(e, t) {
		this.entityNames.set(e, t);
	}
	destroyEntity(e) {
		if (!this.activeEntities.has(e)) return;
		let t = this.children.get(e);
		if (t) for (let e of Array.from(t)) this.destroyEntity(e);
		let n = this.parents.get(e);
		n !== void 0 && (this.children.get(n)?.delete(e), this.parents.delete(e));
		for (let [t, n] of this.components.entries()) if (n.has(e)) {
			let t = n.get(e);
			t && typeof t.onRemove == "function" && t.onRemove(e, t, this), n.delete(e);
		}
		for (let t of this.disabledComponents.values()) t.delete(e);
		this.tags.delete(e), this.children.delete(e), this.entityNames.delete(e), this.sharedContexts.detachEntity(e), this.activeEntities.delete(e), this.invalidateQueryCache();
	}
	setParent(e, t) {
		if (t !== null && (t === e || this.isDescendant(t, e))) return;
		let n = this.parents.get(e);
		n !== void 0 && this.children.get(n)?.delete(e), t !== null && this.activeEntities.has(t) ? (this.parents.set(e, t), this.children.get(t)?.add(e)) : this.parents.delete(e);
	}
	isDescendant(e, t) {
		let n = this.parents.get(e);
		for (; n !== void 0;) {
			if (n === t) return !0;
			n = this.parents.get(n);
		}
		return !1;
	}
	getParent(e) {
		return this.parents.get(e);
	}
	getChildren(e) {
		let t = this.children.get(e);
		return t ? Array.from(t) : [];
	}
	addComponent(e, t) {
		this.invalidateQueryCache();
		let n = t.constructor;
		return this.disabledComponents.get(n)?.delete(e), this.components.has(n) || this.components.set(n, /* @__PURE__ */ new Map()), this.components.get(n).set(e, t), t && typeof t.onAdd == "function" && t.onAdd(e, t, this), t;
	}
	removeComponent(e, t) {
		this.invalidateQueryCache();
		let n = this.components.get(t);
		if (n && n.has(e)) {
			let t = n.get(e);
			t && typeof t.onRemove == "function" && t.onRemove(e, t, this), n.delete(e);
		}
	}
	disableComponent(e, t) {
		this.invalidateQueryCache();
		let n = this.components.get(t);
		if (n && n.has(e)) {
			let r = n.get(e);
			n.delete(e), this.disabledComponents.has(t) || this.disabledComponents.set(t, /* @__PURE__ */ new Map()), this.disabledComponents.get(t).set(e, r), r && typeof r.onDisable == "function" && r.onDisable(e, r, this);
		}
	}
	enableComponent(e, t) {
		this.invalidateQueryCache();
		let n = this.disabledComponents.get(t);
		if (n && n.has(e)) {
			let r = n.get(e);
			n.delete(e), this.components.has(t) || this.components.set(t, /* @__PURE__ */ new Map()), this.components.get(t).set(e, r), r && typeof r.onEnable == "function" && r.onEnable(e, r, this);
		}
	}
	getComponent(e, t) {
		let n = this.components.get(t);
		return n ? n.get(e) : void 0;
	}
	hasComponent(e, t) {
		let n = this.components.get(t);
		return n ? n.has(e) : !1;
	}
	getAllComponents(e) {
		let t = [];
		for (let n of this.components.values()) n.has(e) && t.push(n.get(e));
		return t;
	}
	addTag(e, t) {
		let n = this.tags.get(e);
		n && n.add(t);
	}
	hasTag(e, t) {
		let n = this.tags.get(e);
		return n ? n.has(t) : !1;
	}
	removeTag(e, t) {
		this.tags.get(e)?.delete(t);
	}
	query(e) {
		let t = this.getQueryCacheKey(e), n = this.queryCache.get(t);
		if (n) return n.slice();
		let r;
		if (e.all.length > 0) {
			let n = Infinity, i;
			for (let r of e.all) {
				let e = this.components.get(r);
				if (!e || e.size === 0) return this.queryCache.set(t, []), [];
				e.size < n && (n = e.size, i = e);
			}
			r = i.keys();
		} else r = this.activeEntities;
		let i = [];
		for (let t of r) e.matches(this, t) && i.push(t);
		return this.queryCache.set(t, i), i.slice();
	}
	each2(e, t, n) {
		let r = this.components.get(e), i = this.components.get(t);
		if (!r || !i) return;
		let [a, o, s] = r.size <= i.size ? [
			r,
			i,
			!0
		] : [
			i,
			r,
			!1
		];
		for (let [e, t] of a) {
			let r = o.get(e);
			r !== void 0 && (s ? n(e, t, r) : n(e, r, t));
		}
	}
	addSystem(e) {
		return this.systems.push(e), this.systems.sort((e, t) => e.priority - t.priority), this;
	}
	removeSystem(e) {
		let t = this.systems.indexOf(e);
		t !== -1 && this.systems.splice(t, 1);
	}
	update(e, t = "Update") {
		for (let n of this.systems) n.enabled && n.stage === t && n.update(this, e);
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
		for (let e of Array.from(this.activeEntities)) this.destroyEntity(e);
		this.nextEntityId = 1;
	}
	serialize() {
		let e = {};
		for (let t of this.activeEntities) {
			let n = this.getAllComponents(t);
			e[t] = {
				name: this.entityNames.get(t),
				tags: Array.from(this.tags.get(t) || []),
				components: n.map((e) => ({
					type: e.constructor.name,
					data: e
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
		for (let [n, r] of Object.entries(e.entities)) {
			let e = parseInt(n, 10);
			this.activeEntities.add(e), this.tags.set(e, new Set(r.tags)), r.name && this.entityNames.set(e, r.name), this.children.set(e, /* @__PURE__ */ new Set());
			for (let n of r.components) {
				let r = t[n.type];
				if (r) {
					let t = new r();
					Object.assign(t, n.data), this.addComponent(e, t);
				} else console.warn(`[ECS] Deserialization missing component constructor: ${n.type}`);
			}
		}
		for (let [t, n] of e.parents || []) this.setParent(t, n);
	}
}, dc = class e {
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
		if (e.isWasmLoaded) return !0;
		try {
			let n = "/".endsWith("/") ? "/" : "//", r = [];
			t && r.push(t), r.push(`${n}wasm/kairo_soa_physics.wasm`, "../../wasm/kairo_soa_physics.wasm", "../wasm/kairo_soa_physics.wasm", "./wasm/kairo_soa_physics.wasm", "/wasm/kairo_soa_physics.wasm", "wasm/kairo_soa_physics.wasm");
			for (let t of r) try {
				let n = await fetch(t);
				if (n.ok) {
					let r = await n.arrayBuffer(), i = await WebAssembly.instantiate(r, {});
					return e.wasmExports = i.instance.exports, e.isWasmLoaded = !0, console.log(`⚡ [FastSoAWorld] WASM Physics Kernel loaded successfully from ${t}`), !0;
				}
			} catch {}
		} catch (e) {
			console.warn("[FastSoAWorld] WASM load fallback to optimized JS engine:", e);
		}
		return !1;
	}
	static initSyncWasm(t) {
		try {
			let n = t instanceof Uint8Array ? t : new Uint8Array(t), r = new WebAssembly.Module(n), i = new WebAssembly.Instance(r, {});
			return e.wasmExports = i.exports, e.isWasmLoaded = !0, !0;
		} catch (e) {
			return console.warn("[FastSoAWorld] WASM sync init failed:", e), !1;
		}
	}
	constructor(t = 5e4, n = 12) {
		if (this.maxEntities = t, this.gridCellSize = n, this.invCellSize = 1 / n, e.wasmExports) {
			let r = e.wasmExports, i = r.memory.buffer;
			r.set_cell_size(n), this.posX = new Float32Array(i, r.get_pos_x(), t), this.posY = new Float32Array(i, r.get_pos_y(), t), this.posZ = new Float32Array(i, r.get_pos_z(), t), this.velX = new Float32Array(i, r.get_vel_x(), t), this.velY = new Float32Array(i, r.get_vel_y(), t), this.velZ = new Float32Array(i, r.get_vel_z(), t), this.radius = new Float32Array(i, r.get_radius(), t), this.active = new Uint8Array(i, r.get_active(), t), this.isWasmMode = !0, this.gridTableSize = 0, this.gridTableMask = 0, this.gridHead = /* @__PURE__ */ new Int32Array(), this.gridTag = /* @__PURE__ */ new Uint32Array(), this.gridNext = /* @__PURE__ */ new Int32Array();
		} else this.posX = new Float32Array(t), this.posY = new Float32Array(t), this.posZ = new Float32Array(t), this.velX = new Float32Array(t), this.velY = new Float32Array(t), this.velZ = new Float32Array(t), this.radius = new Float32Array(t), this.active = new Uint8Array(t), this.gridTableSize = 131072, this.gridTableMask = this.gridTableSize - 1, this.gridHead = new Int32Array(this.gridTableSize), this.gridTag = new Uint32Array(this.gridTableSize), this.gridNext = new Int32Array(t);
	}
	spawnEntity(t, n, r, i, a, o, s = .5) {
		if (this.activeCount >= this.maxEntities) return -1;
		let c = this.activeCount++;
		return this.posX[c] = t, this.posY[c] = n, this.posZ[c] = r, this.velX[c] = i, this.velY[c] = a, this.velZ[c] = o, this.radius[c] = s, this.active[c] = 1, this.isWasmMode && e.wasmExports && e.wasmExports.spawn_entity(c, t, n, r, i, a, o, s), c;
	}
	update(t, n = 60) {
		let r = this.activeCount;
		if (this.isWasmMode && e.wasmExports) return e.wasmExports.update(r, t, n);
		let i = this.posX, a = this.posY, o = this.posZ, s = this.velX, c = this.velY, l = this.velZ, u = this.radius, d = this.active, f = ++this.frameId;
		f === 4294967295 && (this.gridTag.fill(0), this.frameId = 1);
		let p = this.invCellSize, m = this.gridTableMask, h = this.gridHead, g = this.gridTag, _ = this.gridNext;
		for (let e = 0; e < r; e++) {
			if (d[e] === 0) continue;
			let r = i[e] + s[e] * t, u = a[e] + c[e] * t, v = o[e] + l[e] * t;
			r < -n ? (r = -n, s[e] = -s[e]) : r > n && (r = n, s[e] = -s[e]), u < -n ? (u = -n, c[e] = -c[e]) : u > n && (u = n, c[e] = -c[e]), v < -n ? (v = -n, l[e] = -l[e]) : v > n && (v = n, l[e] = -l[e]), i[e] = r, a[e] = u, o[e] = v;
			let y = r * p | 0, b = u * p | 0, x = v * p | 0, S = (y * 73856093 ^ b * 19349663 ^ x * 83492791) & m;
			g[S] !== f && (g[S] = f, h[S] = -1), _[e] = h[S], h[S] = e;
		}
		let v = 0, y = [
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
		], b = [
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
		], x = [
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
		for (let e = 0; e < r; e++) {
			if (d[e] === 0) continue;
			let t = i[e], n = a[e], r = o[e], S = u[e], C = t * p | 0, w = n * p | 0, T = r * p | 0;
			for (let p = 0; p < 14; p++) {
				let E = ((C + y[p]) * 73856093 ^ (w + b[p]) * 19349663 ^ (T + x[p]) * 83492791) & m;
				if (g[E] !== f) continue;
				let D = h[E], ee = p === 0;
				for (; D !== -1;) {
					if ((!ee || D > e) && d[D] !== 0) {
						let d = S + u[D], f = i[D] - t;
						if (f >= d || f <= -d) {
							D = _[D];
							continue;
						}
						let p = a[D] - n;
						if (p >= d || p <= -d) {
							D = _[D];
							continue;
						}
						let m = o[D] - r;
						if (m >= d || m <= -d) {
							D = _[D];
							continue;
						}
						let h = f * f + p * p + m * m;
						if (h < d * d && h > 1e-4) {
							v++;
							let t = Math.sqrt(h), n = f / t, r = p / t, u = m / t, g = .5 * (d - t);
							i[e] -= n * g, a[e] -= r * g, o[e] -= u * g, i[D] += n * g, a[D] += r * g, o[D] += u * g;
							let _ = s[e] - s[D], y = c[e] - c[D], b = l[e] - l[D], x = n * _ + r * y + u * b;
							s[e] -= x * n, c[e] -= x * r, l[e] -= x * u, s[D] += x * n, c[D] += x * r, l[D] += x * u;
						}
					}
					D = _[D];
				}
			}
		}
		return v;
	}
	getMemoryFootprintBytes() {
		if (this.isWasmMode && e.wasmExports) return e.wasmExports.memory.buffer.byteLength;
		let t = this.posX.byteLength * 7, n = this.active.byteLength, r = this.gridHead.byteLength + this.gridTag.byteLength + this.gridNext.byteLength;
		return t + n + r;
	}
	clear() {
		this.activeCount = 0, this.active.fill(0), this.isWasmMode && e.wasmExports && e.wasmExports.clear_entities();
	}
}, fc = {
	Success: "SUCCESS",
	Failure: "FAILURE",
	Running: "RUNNING"
}, pc = class {}, mc = class extends pc {
	children;
	constructor(e) {
		super(), this.children = e;
	}
	tick(e) {
		for (let t of this.children) {
			let n = t.tick(e);
			if (n !== fc.Success) return n;
		}
		return fc.Success;
	}
}, hc = class extends pc {
	children;
	constructor(e) {
		super(), this.children = e;
	}
	tick(e) {
		for (let t of this.children) {
			let n = t.tick(e);
			if (n !== fc.Failure) return n;
		}
		return fc.Failure;
	}
}, gc = class extends pc {
	actionFn;
	constructor(e) {
		super(), this.actionFn = e;
	}
	tick(e) {
		return this.actionFn(e);
	}
}, _c = class {
	width;
	height;
	nodeSize;
	nodes;
	constructor(e = 20, t = 20, n = 1) {
		this.width = e, this.height = t, this.nodeSize = n, this.nodes = [];
		for (let n = 0; n < e; n++) {
			this.nodes[n] = [];
			for (let e = 0; e < t; e++) this.nodes[n][e] = {
				x: n,
				z: e,
				g: 0,
				h: 0,
				f: 0,
				parent: null,
				walkable: !0
			};
		}
	}
	setObstacle(e, t, n) {
		e >= 0 && e < this.width && t >= 0 && t < this.height && (this.nodes[e][t].walkable = n);
	}
	findPath(e, t, n) {
		let r = this.resolveOptions(n);
		switch (r.algorithm) {
			case "dijkstra": return this.findPathAStarInternal(e, t, 0, r.allowDiagonal ?? !1);
			case "weighted_astar": return this.findPathAStarInternal(e, t, r.heuristicWeight ?? 1.5, r.allowDiagonal ?? !1);
			case "bidirectional_dijkstra": return this.findPathBidirectionalInternal(e, t, 0, r.allowDiagonal ?? !1);
			case "bidirectional_astar": return this.findPathBidirectionalInternal(e, t, r.heuristicWeight ?? 1, r.allowDiagonal ?? !1);
			default: return this.findPathAStarInternal(e, t, r.heuristicWeight ?? 1, r.allowDiagonal ?? !1);
		}
	}
	findPathAStar(e, t, n) {
		let r = this.resolveOptions(n, "astar");
		return this.findPathAStarInternal(e, t, r.heuristicWeight ?? 1, r.allowDiagonal ?? !1);
	}
	findPathWeighted(e, t, n = 1.5, r) {
		let i = this.resolveOptions(r, "weighted_astar");
		return this.findPathAStarInternal(e, t, n, i.allowDiagonal ?? !1);
	}
	findPathDijkstra(e, t, n) {
		let r = this.resolveOptions(n, "dijkstra");
		return this.findPathAStarInternal(e, t, 0, r.allowDiagonal ?? !1);
	}
	findPathBidirectionalAStar(e, t, n = 1, r) {
		let i = this.resolveOptions(r, "bidirectional_astar");
		return this.findPathBidirectionalInternal(e, t, n, i.allowDiagonal ?? !1);
	}
	findPathBidirectionalDijkstra(e, t, n) {
		let r = this.resolveOptions(n, "bidirectional_dijkstra");
		return this.findPathBidirectionalInternal(e, t, 0, r.allowDiagonal ?? !1);
	}
	resolveOptions(e, t = "astar") {
		return typeof e == "string" ? { algorithm: e } : {
			algorithm: e?.algorithm ?? t,
			heuristicWeight: e?.heuristicWeight,
			allowDiagonal: e?.allowDiagonal
		};
	}
	getGridCoords(e, t) {
		let n = Math.floor(e.x / this.nodeSize + this.width / 2), r = Math.floor(e.z / this.nodeSize + this.height / 2), i = Math.floor(t.x / this.nodeSize + this.width / 2), a = Math.floor(t.z / this.nodeSize + this.height / 2);
		return n < 0 || n >= this.width || r < 0 || r >= this.height || i < 0 || i >= this.width || a < 0 || a >= this.height ? null : {
			startNode: this.nodes[n][r],
			endNode: this.nodes[i][a]
		};
	}
	findPathAStarInternal(e, t, n, r) {
		let i = this.getGridCoords(e, t);
		if (!i) return [e, t];
		let { startNode: a, endNode: o } = i;
		if (!a.walkable || !o.walkable) return [e, t];
		if (a === o) return [this.nodeToVector3(a)];
		let s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = [a], u = /* @__PURE__ */ new Set([a]), d = /* @__PURE__ */ new Set();
		s.set(a, 0), c.set(a, null);
		let f = (e) => {
			if (n === 0) return 0;
			let t = Math.abs(e.x - o.x), i = Math.abs(e.z - o.z);
			return r ? (Math.max(t, i) + (Math.SQRT2 - 1) * Math.min(t, i)) * n : (t + i) * n;
		}, p = (e) => (s.get(e) ?? Infinity) + f(e);
		for (; l.length > 0;) {
			l.sort((e, t) => p(e) - p(t));
			let e = l.shift();
			if (u.delete(e), e === o) return this.reconstructSinglePath(e, c);
			d.add(e);
			let t = this.getNeighbors(e, r);
			for (let { node: n, moveCost: r } of t) {
				if (!n.walkable || d.has(n)) continue;
				let t = (s.get(e) ?? 0) + r;
				t < (s.get(n) ?? Infinity) && (s.set(n, t), c.set(n, e), u.has(n) || (l.push(n), u.add(n)));
			}
		}
		return [e, t];
	}
	findPathBidirectionalInternal(e, t, n, r) {
		let i = this.getGridCoords(e, t);
		if (!i) return [e, t];
		let { startNode: a, endNode: o } = i;
		if (!a.walkable || !o.walkable) return [e, t];
		if (a === o) return [this.nodeToVector3(a)];
		let s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = [a], u = /* @__PURE__ */ new Set([a]), d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), m = [o], h = /* @__PURE__ */ new Set([o]), g = /* @__PURE__ */ new Set();
		s.set(a, 0), c.set(a, null), f.set(o, 0), p.set(o, null);
		let _ = (e) => {
			if (n === 0) return 0;
			let t = Math.abs(e.x - o.x), i = Math.abs(e.z - o.z);
			return r ? (Math.max(t, i) + (Math.SQRT2 - 1) * Math.min(t, i)) * n : (t + i) * n;
		}, v = (e) => {
			if (n === 0) return 0;
			let t = Math.abs(e.x - a.x), i = Math.abs(e.z - a.z);
			return r ? (Math.max(t, i) + (Math.SQRT2 - 1) * Math.min(t, i)) * n : (t + i) * n;
		}, y = (e) => (s.get(e) ?? Infinity) + _(e), b = (e) => (f.get(e) ?? Infinity) + v(e), x = Infinity, S = null;
		for (; l.length > 0 && m.length > 0;) {
			l.sort((e, t) => y(e) - y(t));
			let e = l.shift();
			if (u.delete(e), d.add(e), g.has(e)) {
				let t = (s.get(e) ?? 0) + (f.get(e) ?? 0);
				if (t < x) {
					x = t, S = e;
					break;
				}
			}
			let t = this.getNeighbors(e, r);
			for (let { node: n, moveCost: r } of t) {
				if (!n.walkable || d.has(n)) continue;
				let t = (s.get(e) ?? 0) + r;
				if (t < (s.get(n) ?? Infinity) && (s.set(n, t), c.set(n, e), u.has(n) || (l.push(n), u.add(n)), f.has(n))) {
					let e = t + f.get(n);
					e < x && (x = e, S = n);
				}
			}
			m.sort((e, t) => b(e) - b(t));
			let n = m.shift();
			if (h.delete(n), g.add(n), d.has(n)) {
				let e = (s.get(n) ?? 0) + (f.get(n) ?? 0);
				if (e < x) {
					x = e, S = n;
					break;
				}
			}
			let i = this.getNeighbors(n, r);
			for (let { node: e, moveCost: t } of i) {
				if (!e.walkable || g.has(e)) continue;
				let r = (f.get(n) ?? 0) + t;
				if (r < (f.get(e) ?? Infinity) && (f.set(e, r), p.set(e, n), h.has(e) || (m.push(e), h.add(e)), s.has(e))) {
					let t = r + s.get(e);
					t < x && (x = t, S = e);
				}
			}
			if (S && l.length > 0 && m.length > 0 && y(l[0]) + b(m[0]) >= x) break;
		}
		return S ? this.reconstructBidirectionalPath(S, c, p) : [e, t];
	}
	reconstructSinglePath(e, t) {
		let n = [], r = e;
		for (; r;) n.unshift(this.nodeToVector3(r)), r = t.get(r);
		return n;
	}
	reconstructBidirectionalPath(e, t, n) {
		let r = [], i = e;
		for (; i;) r.unshift(i), i = t.get(i);
		let a = [], o = n.get(e);
		for (; o;) a.push(o), o = n.get(o);
		return [...r, ...a].map((e) => this.nodeToVector3(e));
	}
	nodeToVector3(e) {
		return new F((e.x - this.width / 2) * this.nodeSize, 0, (e.z - this.height / 2) * this.nodeSize);
	}
	getNeighbors(e, t = !1) {
		let n = [];
		for (let [t, r] of [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1]
		]) {
			let i = e.x + t, a = e.z + r;
			i >= 0 && i < this.width && a >= 0 && a < this.height && n.push({
				node: this.nodes[i][a],
				moveCost: 1
			});
		}
		if (t) for (let [t, r] of [
			[1, 1],
			[1, -1],
			[-1, 1],
			[-1, -1]
		]) {
			let i = e.x + t, a = e.z + r;
			i >= 0 && i < this.width && a >= 0 && a < this.height && this.nodes[e.x + t][e.z].walkable && this.nodes[e.x][e.z + r].walkable && n.push({
				node: this.nodes[i][a],
				moveCost: Math.SQRT2
			});
		}
		return n;
	}
}, vc = class {
	name;
	duration;
	positionKeys;
	rotationKeys;
	scaleKeys;
	constructor(e, t, n = [], r = [], i = []) {
		this.name = e, this.duration = t, this.positionKeys = n, this.rotationKeys = r, this.scaleKeys = i;
	}
	samplePosition(e) {
		if (this.positionKeys.length === 0) return new F(0, 0, 0);
		e = se.clamp(e % this.duration, 0, this.duration);
		for (let t = 0; t < this.positionKeys.length - 1; t++) {
			let n = this.positionKeys[t], r = this.positionKeys[t + 1];
			if (e >= n.time && e <= r.time) {
				let t = (e - n.time) / (r.time - n.time);
				return n.value.clone().lerp(r.value, t);
			}
		}
		return this.positionKeys[this.positionKeys.length - 1].value.clone();
	}
	sampleRotation(e) {
		if (this.rotationKeys.length === 0) return new re(0, 0, 0, 1);
		e = se.clamp(e % this.duration, 0, this.duration);
		for (let t = 0; t < this.rotationKeys.length - 1; t++) {
			let n = this.rotationKeys[t], r = this.rotationKeys[t + 1];
			if (e >= n.time && e <= r.time) {
				let t = (e - n.time) / (r.time - n.time);
				return n.value.clone().slerp(r.value, t);
			}
		}
		return this.rotationKeys[this.rotationKeys.length - 1].value.clone();
	}
}, yc = class {
	clips = [];
	addClip(e, t) {
		this.clips.push({
			clip: e,
			threshold: t
		}), this.clips.sort((e, t) => e.threshold - t.threshold);
	}
	evaluate(e, t) {
		if (this.clips.length === 0) return {
			position: new F(),
			rotation: new re()
		};
		if (this.clips.length === 1 || e <= this.clips[0].threshold) return {
			position: this.clips[0].clip.samplePosition(t),
			rotation: this.clips[0].clip.sampleRotation(t)
		};
		for (let n = 0; n < this.clips.length - 1; n++) {
			let r = this.clips[n], i = this.clips[n + 1];
			if (e >= r.threshold && e <= i.threshold) {
				let n = (e - r.threshold) / (i.threshold - r.threshold), a = r.clip.samplePosition(t), o = i.clip.samplePosition(t), s = r.clip.sampleRotation(t), c = i.clip.sampleRotation(t);
				return {
					position: a.lerp(o, n),
					rotation: s.slerp(c, n)
				};
			}
		}
		let n = this.clips[this.clips.length - 1];
		return {
			position: n.clip.samplePosition(t),
			rotation: n.clip.sampleRotation(t)
		};
	}
}, bc = class {
	mixer;
	states = /* @__PURE__ */ new Map();
	parameters = /* @__PURE__ */ new Map();
	currentState = null;
	constructor(t) {
		this.mixer = new e.AnimationMixer(t);
	}
	registerState(e, t, n = {}) {
		let r = this.mixer.clipAction(t);
		n.loop !== void 0 && r.setLoop(n.loop, Infinity), n.timeScale !== void 0 && (r.timeScale = n.timeScale);
		let i = {
			name: e,
			action: r,
			fadeDuration: n.fadeDuration ?? .25,
			timeScale: n.timeScale ?? 1
		};
		this.states.set(e, i);
	}
	setParameter(e, t) {
		this.parameters.set(e, t);
	}
	getParameter(e) {
		return this.parameters.get(e);
	}
	setState(e, t) {
		let n = this.states.get(e);
		if (!n || this.currentState === n) return;
		let r = t ?? n.fadeDuration ?? .25;
		this.currentState && this.currentState.action.fadeOut(r), this.currentState = n, this.currentState.action.reset().fadeIn(r).play();
	}
	getCurrentStateName() {
		return this.currentState ? this.currentState.name : null;
	}
	update(e) {
		this.mixer.update(e);
	}
}, xc = class {
	static solveTwoBone(e, t, n, r, i) {
		let a = n.clone().sub(e), o = se.clamp(a.length(), .001, r + i - .001), s = (r * r + o * o - i * i) / (2 * r * o), c = Math.acos(se.clamp(s, -1, 1)), l = new F(0, 1, 0), u = a.clone().normalize(), d = u.cross(l).cross(u).normalize();
		return d.lengthSq() < 1e-6 && (d = u.clone().cross(new F(1, 0, 0)), d.lengthSq() < 1e-6 && (d = u.clone().cross(new F(0, 0, 1))), d.normalize()), {
			jointPos: e.clone().add(u.clone().scale(Math.cos(c) * r)).add(d.clone().scale(Math.sin(c) * r)),
			endPos: n.clone()
		};
	}
}, Sc = class {
	headOffset = new F(0, 2.3, 0);
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
}, Cc = class {
	static evaluate(e, t, n = 1) {
		let r = new Sc(), i = t * n * 5;
		if (e === "idle") r.rootY = Math.sin(t * 2) * .05, r.headOffset.y = 2.3 + Math.sin(t * 2) * .02, r.leftArmAngle = Math.sin(t * 2) * .1 + .1, r.rightArmAngle = -Math.sin(t * 2) * .1 - .1, r.leftLegAngle = .05, r.rightLegAngle = -.05;
		else if (e === "walk") {
			let e = .6;
			r.rootY = Math.abs(Math.sin(i)) * .1, r.leftLegAngle = Math.sin(i) * e, r.rightLegAngle = -Math.sin(i) * e, r.leftShinAngle = Math.max(0, Math.sin(i + Math.PI / 2)) * .5, r.rightShinAngle = Math.max(0, Math.sin(i - Math.PI / 2)) * .5, r.leftArmAngle = -Math.sin(i) * e, r.rightArmAngle = Math.sin(i) * e, r.leftForearmAngle = .2, r.rightForearmAngle = .2;
		} else if (e === "run") {
			let e = 1.1;
			r.torsoAngle = .25, r.rootY = Math.abs(Math.sin(i * 1.5)) * .2, r.leftLegAngle = Math.sin(i * 1.5) * e, r.rightLegAngle = -Math.sin(i * 1.5) * e, r.leftShinAngle = Math.max(0, Math.sin(i * 1.5 + Math.PI / 2)) * .8, r.rightShinAngle = Math.max(0, Math.sin(i * 1.5 - Math.PI / 2)) * .8, r.leftArmAngle = -Math.sin(i * 1.5) * e * 1.1, r.rightArmAngle = Math.sin(i * 1.5) * e * 1.1, r.leftForearmAngle = .8, r.rightForearmAngle = .8;
		} else if (e === "jump") {
			let e = t % 2 / 2;
			r.rootY = Math.sin(e * Math.PI) * 2.5, r.rootFlipAngle = e * Math.PI * 2, r.leftArmAngle = -1.2, r.rightArmAngle = -1.2, r.leftLegAngle = .8, r.rightLegAngle = .8, r.leftShinAngle = 1.2, r.rightShinAngle = 1.2;
		}
		return r;
	}
}, wc = /* @__PURE__ */ function(e) {
	return e[e.LOW = 0] = "LOW", e[e.NORMAL = 1] = "NORMAL", e[e.HIGH = 2] = "HIGH", e[e.CRITICAL = 3] = "CRITICAL", e;
}({}), Tc = class {
	listeners = /* @__PURE__ */ new Map();
	wildcardListeners = [];
	on(e, t, n = 1) {
		if (e === "*") return this.wildcardListeners.push({
			handler: t,
			priority: n,
			once: !1
		}), this.sortListeners(this.wildcardListeners), () => this.off("*", t);
		this.listeners.has(e) || this.listeners.set(e, []);
		let r = this.listeners.get(e);
		return r.push({
			handler: t,
			priority: n,
			once: !1
		}), this.sortListeners(r), () => this.off(e, t);
	}
	once(e, t, n = 1) {
		if (e === "*") {
			let e = (n) => {
				let r = t(n);
				return this.off("*", e), r;
			};
			this.wildcardListeners.push({
				handler: e,
				priority: n,
				once: !0
			}), this.sortListeners(this.wildcardListeners);
			return;
		}
		this.listeners.has(e) || this.listeners.set(e, []);
		let r = this.listeners.get(e);
		r.push({
			handler: t,
			priority: n,
			once: !0
		}), this.sortListeners(r);
	}
	off(e, t) {
		if (e === "*") {
			this.wildcardListeners = this.wildcardListeners.filter((e) => e.handler !== t);
			return;
		}
		let n = this.listeners.get(e);
		n && this.listeners.set(e, n.filter((e) => e.handler !== t));
	}
	emit(e, t) {
		let n = !1;
		for (let r of [...this.wildcardListeners]) r.handler({
			event: e,
			data: t
		}) === !1 && (n = !0);
		let r = this.listeners.get(e);
		if (r) {
			let i = [];
			for (let e of [...r]) e.handler(t) === !1 && (n = !0), e.once && i.push(e);
			i.length > 0 && this.listeners.set(e, r.filter((e) => !i.includes(e)));
		}
		return !n;
	}
	sortListeners(e) {
		e.sort((e, t) => t.priority - e.priority);
	}
	clear() {
		this.listeners.clear(), this.wildcardListeners = [];
	}
}, Ec = new Tc(), Dc = class {
	eventBus;
	keyBindings = /* @__PURE__ */ new Map();
	boundKeyDownHandler;
	boundKeyUpHandler;
	activeKeys = /* @__PURE__ */ new Set();
	enabled = !0;
	constructor(e = Ec) {
		this.eventBus = e, this.boundKeyDownHandler = (e) => this.handleKeyDown(e), this.boundKeyUpHandler = (e) => this.handleKeyUp(e), typeof window < "u" && (window.addEventListener("keydown", this.boundKeyDownHandler), window.addEventListener("keyup", this.boundKeyUpHandler));
	}
	bindKey(e, t) {
		this.keyBindings.has(e) || this.keyBindings.set(e, []);
		let n = this.keyBindings.get(e);
		n.includes(t) || n.push(t);
	}
	unbindKey(e, t) {
		if (!t) this.keyBindings.delete(e);
		else if (this.keyBindings.has(e)) {
			let n = this.keyBindings.get(e).filter((e) => e !== t);
			n.length > 0 ? this.keyBindings.set(e, n) : this.keyBindings.delete(e);
		}
	}
	handleKeyDown(e) {
		if (!this.enabled) return;
		let t = {
			code: e.code,
			key: e.key,
			repeat: e.repeat,
			shiftKey: e.shiftKey,
			ctrlKey: e.ctrlKey,
			altKey: e.altKey,
			timestamp: performance.now()
		};
		this.eventBus.emit(`key:down:${e.code}`, t), this.eventBus.emit(`key:down:${e.key}`, t), (e.code === "Enter" || e.key === "Enter") && (this.eventBus.emit("key:Enter", t), this.eventBus.emit("action:submit", t));
		let n = this.keyBindings.get(e.code) || this.keyBindings.get(e.key);
		if (n) for (let e of n) this.eventBus.emit(e, t);
		this.activeKeys.add(e.code);
	}
	handleKeyUp(e) {
		if (!this.enabled) return;
		let t = {
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
}, Oc = class {
	eventBus;
	actions = /* @__PURE__ */ new Map();
	constructor(e = Ec) {
		this.eventBus = e;
	}
	addAction(e, t) {
		this.actions.has(e) || (this.actions.set(e, []), this.eventBus.on(e, (t) => {
			let n = this.actions.get(e);
			n && n.forEach((e) => e(t));
		})), this.actions.get(e).push(t);
	}
};
//#endregion
export { gc as ActionNode, vc as AnimationClip, bc as AnimationStateMachine, bt as AudioManager, pc as BTNode, yc as BlendTree1D, oe as BoundingBox, Pe as CameraController, tc as CellularAutomata, St as CinematicOverlayManager, _e as Collider, z as ColliderType, I as Color, we as CustomShaderMaterial, Ft as CutsceneAbortError, It as CutsceneContext, Lt as CutsceneManager, Dt as DebugInspector, jt as DebugRenderer, wt as DefaultTheme, ic as EasyScript, me as Engine, kt as EngineCompiler, L as EngineState, Oc as EventActionDispatcher, Tc as EventBus, ce as EventEmitter, wc as EventPriority, dc as FastSoAWorld, et as FrustumCulling, xt as GlobalAudio, Ct as GlobalCinematicOverlay, Ot as GlobalDebugInspector, le as GlobalEventBus, Ec as GlobalEvents, yt as GlobalInput, Et as GlobalUI, vt as InputManager, xc as InverseKinematicsSolver, Zs as KairoApp, Dc as KeyEventTrigger, je as Light, Ae as LightType, Oe as Material, se as MathUtils, ie as Matrix4, _t as MouseButton, fc as NodeStatus, he as ObjectPool, Qs as PRNG, Ne as ParticleSystem, _c as PathfindingGrid, ye as PhysicsWorld, Qe as PostProcessManager, re as Quaternion, lc as Query, ae as Ray, Ce as RaycastVehicle, $e as RenderPipeline, De as RenderQueue, ve as RigidBody, R as RigidBodyType, Te as SHADER_PRESETS, Nt as SaveSystem, pe as Scene, Pt as SceneManager, fe as SceneNode, At as ScreenRecorder, nc as ScriptBehavior, rc as ScriptRunner, hc as SelectorNode, mc as SequenceNode, de as Serializer, ke as ShaderGraphCompiler, Ee as ShaderPresets, ac as SharedEntityContext, oc as SharedEntityContextManager, $s as SimplexNoise, Me as SkyboxSettings, ge as SpatialHashGrid3D, Cc as StickmanAnimator, Sc as StickmanPose, cc as System, sc as SystemStage, ue as Time, Tt as UIManager, P as Vector2, F as Vector3, ne as Vector4, Mt as VideoTimeline, uc as World, tt as createBlock, st as createCapsule, ht as createCloud, at as createCone, it as createCylinder, lt as createDodecahedron, ft as createGrassField, ct as createIcosahedron, rt as createPlane, mt as createRock, nt as createSphere, dt as createTerrain, ot as createTorus, pt as createTree, gt as deriveCollider };
