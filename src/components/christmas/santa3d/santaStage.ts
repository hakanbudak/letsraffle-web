/**
 * Real-time 3D Santa (three.js).
 *
 * - Model: src/assets/characters/santa.glb (Blender: art/build_character.py -> export_glb, gltfpack -cc -kn -km)
 * - Look: cel shading (3-step toon ramp) + soft rim light + stepped specular + inverted-hull outlines
 * - Motion: fully procedural (no baked clips) so moods blend smoothly, blinks are random,
 *   eyes ease toward targets and the hat/pompom react with spring physics.
 */
import {
  AmbientLight,
  BackSide,
  CanvasTexture,
  Color,
  DataTexture,
  DirectionalLight,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  RedFormat,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import modelUrl from "@/assets/characters/santa.glb?url";

export type SantaMood = "wave" | "thinking" | "sad" | "celebrate";

// ---------------------------------------------------------------------------
// model loading (shared by every instance)
// ---------------------------------------------------------------------------
let gltfPromise: Promise<GLTF> | null = null;

function loadModel(): Promise<GLTF> {
  if (!gltfPromise) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    gltfPromise = loader.loadAsync(modelUrl).catch((e) => {
      gltfPromise = null;
      throw e;
    });
  }
  return gltfPromise;
}

/** Start downloading the model early (e.g. on hover / route enter). */
export function preloadSanta(): void {
  loadModel().catch(() => undefined);
}

// ---------------------------------------------------------------------------
// materials
// ---------------------------------------------------------------------------
type MatSpec = { color: string; spec?: number; specSize?: number; rim?: number };

const MATERIALS: Record<string, MatSpec> = {
  T_Kirmizi: { color: "#e3433a", spec: 0.14, specSize: 0.978, rim: 0.14 },
  T_Kurk: { color: "#f8f5f1", rim: 0.05 },
  T_Sakal: { color: "#eef2f6", rim: 0.05 },
  T_Ten: { color: "#f7d3b0", rim: 0.08 },
  T_Yanak: { color: "#f5a3a0" },
  T_Burun: { color: "#f39f99", spec: 0.55, specSize: 0.94 },
  T_Goz: { color: "#1b1515", spec: 0.0 },
  T_Beyaz: { color: "#ffffff" },
  T_Kas: { color: "#b9c1cb" },
  T_Agiz: { color: "#a92c27" },
  T_Dil: { color: "#ee786e" },
  T_Kemer: { color: "#2d2929", spec: 0.25, specSize: 0.95 },
  T_Altin: { color: "#f3c234", spec: 0.85, specSize: 0.9, rim: 0.12 },
  T_Bot: { color: "#3a3636", spec: 0.35, specSize: 0.93, rim: 0.12 },
  T_Taban: { color: "#242121" },
  // accessories
  Altin: { color: "#f3c234", spec: 0.7, specSize: 0.9 },
  Kirmizi: { color: "#e3433a", spec: 0.14, specSize: 0.97 },
  Yesil: { color: "#22a05a", spec: 0.2, specSize: 0.95 },
  Mavi: { color: "#3373dc", spec: 0.2, specSize: 0.95 },
  Mor: { color: "#8c52c9", spec: 0.2, specSize: 0.95 },
  Beyaz_Kurk: { color: "#f8f5f1" },
  Cuval: { color: "#b07a45", rim: 0.08 },
};

const NO_OUTLINE = /^(Goz_Parlak|Dil$|Yanak_|Toka_Dil)/;
const OUTLINE_COLOR = new Color("#2a1b1b");

const shared = {
  keyDirView: { value: new Vector3(0, 0, 1) },
};

let gradientMap: DataTexture | null = null;
function toonRamp(): DataTexture {
  if (!gradientMap) {
    // shadow / mid / lit
    const data = new Uint8Array([150, 205, 255]);
    gradientMap = new DataTexture(data, data.length, 1, RedFormat);
    gradientMap.minFilter = gradientMap.magFilter = NearestFilter;
    gradientMap.generateMipmaps = false;
    gradientMap.needsUpdate = true;
  }
  return gradientMap;
}

const materialCache = new Map<string, Material>();

function toonMaterial(name: string): Material {
  const cached = materialCache.get(name);
  if (cached) return cached;
  const spec = MATERIALS[name] ?? { color: "#cccccc" };
  const m = new MeshToonMaterial({ color: new Color(spec.color), gradientMap: toonRamp() });
  const specAmt = spec.spec ?? 0;
  const specSize = spec.specSize ?? 0.95;
  const rim = spec.rim ?? 0;
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uKeyDir = shared.keyDirView;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform vec3 uKeyDir;`
      )
      .replace(
        "#include <opaque_fragment>",
        `{
  vec3 V = normalize(vViewPosition);
  vec3 N = normalize(normal);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float rim = smoothstep(0.62, 0.68, 1.0 - ndv) * smoothstep(-0.2, 0.4, dot(N, uKeyDir));
  outgoingLight += vec3(1.0, 0.96, 0.9) * rim * ${rim.toFixed(3)};
  vec3 H = normalize(uKeyDir + V);
  float sp = smoothstep(${specSize.toFixed(3)}, ${(specSize + 0.012).toFixed(3)}, dot(N, H));
  outgoingLight = mix(outgoingLight, vec3(1.0), sp * ${specAmt.toFixed(3)});
}
#include <opaque_fragment>`
      );
  };
  m.customProgramCacheKey = () => `santa-toon-${name}`;
  materialCache.set(name, m);
  return m;
}

let outlineMat: ShaderMaterial | null = null;
function outlineMaterial(): ShaderMaterial {
  if (!outlineMat) {
    outlineMat = new ShaderMaterial({
      uniforms: { uThickness: { value: 0.017 }, uColor: { value: OUTLINE_COLOR } },
      vertexShader: `
uniform float uThickness;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * normal);
  mv.xyz += n * uThickness;
  gl_Position = projectionMatrix * mv;
}`,
      fragmentShader: `
uniform vec3 uColor;
void main() { gl_FragColor = vec4(uColor, 1.0); }`,
      side: BackSide,
      toneMapped: false,
    });
  }
  return outlineMat;
}

function namedAncestor(o: Object3D): string {
  let p: Object3D | null = o;
  while (p && !p.name) p = p.parent;
  return p?.name ?? "";
}

function prepareModel(src: Object3D): Object3D {
  const root = src.clone(true);
  const meshes: Mesh[] = [];
  root.traverse((o) => {
    if ((o as Mesh).isMesh) meshes.push(o as Mesh);
  });
  for (const mesh of meshes) {
    const srcMat = mesh.material as Material;
    mesh.material = toonMaterial(srcMat.name);
    mesh.frustumCulled = false;
    const owner = mesh.name || namedAncestor(mesh);
    if (!NO_OUTLINE.test(owner) && !NO_OUTLINE.test(namedAncestor(mesh))) {
      const hull = new Mesh(mesh.geometry, outlineMaterial());
      hull.frustumCulled = false;
      hull.renderOrder = -1;
      mesh.add(hull);
    }
  }
  return root;
}

// ---------------------------------------------------------------------------
// math helpers
// ---------------------------------------------------------------------------
const TAU = Math.PI * 2;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x));
const damp = (cur: number, target: number, lambda: number, dt: number) =>
  lerp(cur, target, 1 - Math.exp(-lambda * dt));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

class Spring {
  v = 0;
  constructor(public x = 0, public k = 90, public zeta = 0.35) {}
  step(target: number, dt: number) {
    const c = 2 * this.zeta * Math.sqrt(this.k);
    const a = this.k * (target - this.x) - c * this.v;
    this.v += a * dt;
    this.x += this.v * dt;
    return this.x;
  }
}

// ---------------------------------------------------------------------------
// poses
// ---------------------------------------------------------------------------
type V3 = [number, number, number];
interface Pose {
  rootY: number;
  upY: number;
  upSquash: number; // + = squash (wider, shorter)
  upRX: number;
  upRZ: number;
  headX: number;
  headY: number;
  headZ: number;
  hatZ: number;
  armL: V3;
  armR: V3;
  armLStretch: number;
  armRStretch: number;
  eyeX: number;
  eyeY: number;
  eyeOpen: number;
  browY: number;
  browInner: number; // + = worried
  browRaiseL: number;
  mouthX: number;
  mouthY: number;
  sack: number;
  gifts: number;
}

const REST: Pose = {
  rootY: 0, upY: 0, upSquash: 0, upRX: 0, upRZ: 0,
  headX: 0, headY: 0, headZ: 0, hatZ: 0,
  armL: [0.38, -1, 0.08], armR: [-0.38, -1, 0.08], armLStretch: 1, armRStretch: 1,
  eyeX: 0, eyeY: 0, eyeOpen: 1, browY: 0, browInner: 0, browRaiseL: 0,
  mouthX: 1, mouthY: 1, sack: 0, gifts: 0,
};

const pose = (p: Partial<Pose>): Pose => ({ ...REST, ...p });

function blendPose(a: Pose, b: Pose, t: number): Pose {
  const out = { ...a } as Pose;
  for (const k of Object.keys(a) as (keyof Pose)[]) {
    const va = a[k];
    const vb = b[k];
    if (Array.isArray(va)) {
      (out[k] as V3) = [lerp(va[0], (vb as V3)[0], t), lerp(va[1], (vb as V3)[1], t), lerp(va[2], (vb as V3)[2], t)];
    } else {
      (out[k] as number) = lerp(va as number, vb as number, t);
    }
  }
  return out;
}

const MOODS: Record<SantaMood, (t: number) => Pose> = {
  wave(t) {
    // greet every ~7s: raise, three relaxed waves, lower, idle
    const ph = (t + 6.4) % 7;
    const w = ph < 0.75 ? easeInOut(ph / 0.75) : ph < 3.2 ? 1 : ph < 4.1 ? 1 - easeInOut((ph - 3.2) / 0.9) : 0;
    const osc = ph > 0.75 && ph < 3.2 ? Math.sin(((ph - 0.75) / 2.45) * 3 * TAU) * easeInOut(Math.min(1, (ph - 0.75) * 3, (3.2 - ph) * 3)) : 0;
    const th = lerp(22, 150 + 16 * osc, w) * (Math.PI / 180);
    return pose({
      armR: [-Math.sin(th), -Math.cos(th), 0.1 + 0.12 * w],
      armL: [0.38 + 0.03 * Math.sin(t * TAU / 5.3), -1, 0.1],
      headZ: 0.07 * w + 0.025 * Math.sin(t * TAU / 5.3),
      headY: -0.05 * w,
      upRZ: 0.025 * w,
      mouthX: 1 + 0.06 * w,
      mouthY: 1 + 0.18 * w,
      browY: 0.012 * w,
    });
  },
  thinking(t) {
    const stroke = 0.5 + 0.5 * Math.sin(t * TAU / 2.9);
    const hi: V3 = [0.33, 0.22, 0.66];
    const lo: V3 = [0.36, 0.08, 0.68];
    const glance = (() => {
      const ph = t % 6.5;
      return ph > 3.8 && ph < 5.0 ? easeInOut(Math.min(1, (ph - 3.8) * 3, (5.0 - ph) * 3)) : 0;
    })();
    return pose({
      armR: [lerp(hi[0], lo[0], stroke), lerp(hi[1], lo[1], stroke), lerp(hi[2], lo[2], stroke)],
      armRStretch: 1.33,
      armL: [0.36, -1, 0.12],
      headZ: 0.15 + 0.03 * Math.sin(t * TAU / 5.2),
      headX: -0.07,
      headY: -0.06 * (1 - glance),
      eyeX: lerp(-0.026, 0.0, glance),
      eyeY: lerp(0.028, 0.0, glance),
      browRaiseL: 0.03 + 0.008 * Math.sin(t * TAU / 2.9),
      mouthX: 0.5,
      mouthY: 0.42,
      upRZ: 0.02 * Math.sin(t * TAU / 5.2),
    });
  },
  sad(t) {
    const ph = t % 5;
    const s = ph < 1.7 ? easeInOut(ph / 1.7) : ph < 2.6 ? 1 : 1 - easeInOut((ph - 2.6) / 2.4);
    return pose({
      upY: 0.025 * s,
      upSquash: -0.02 * s + 0.02,
      upRX: 0.1 - 0.03 * s,
      headX: 0.26 - 0.07 * s,
      headY: 0.11 * Math.sin(t * TAU / 6.2),
      hatZ: -0.08,
      armR: [-0.2, -1, 0.06],
      armL: [0.3 + 0.05 * Math.sin(t * TAU / 3.1), -1, 0.14 + 0.03 * Math.cos(t * TAU / 3.1)],
      eyeOpen: 0.56,
      eyeY: -0.018,
      browInner: 0.38,
      browY: 0.008,
      mouthX: 0.62,
      mouthY: 0.38,
      sack: 1,
    });
  },
  celebrate(t) {
    const P = 0.95;
    const ph = (t % P) / P;
    const air = ph > 0.16 && ph < 0.84 ? Math.sin((Math.PI * (ph - 0.16)) / 0.68) : 0;
    const squash = ph < 0.16 ? Math.sin((Math.PI * ph) / 0.16) * 0.09 : ph > 0.84 ? Math.sin((Math.PI * (ph - 0.84)) / 0.16) * 0.11 : -0.04 * air;
    const a = 0.5 + 0.5 * Math.sin((t * TAU) / (P / 2));
    return pose({
      rootY: 0.27 * air,
      upSquash: squash,
      armR: [lerp(-0.6, -0.3, a), 0.9, 0.16],
      armL: [lerp(0.3, 0.6, a), 0.9, 0.16],
      headZ: 0.06 * Math.sin((t * TAU) / P),
      headX: -0.06,
      eyeOpen: 0.34,
      browY: 0.025,
      mouthX: 1.22,
      mouthY: 1.5,
      gifts: 1,
    });
  },
};

// ---------------------------------------------------------------------------
// stage
// ---------------------------------------------------------------------------
interface Rest {
  o: Object3D;
  p: Vector3;
  q: Quaternion;
  s: Vector3;
}

export interface SantaStageOptions {
  mood: SantaMood;
  interactive?: boolean;
  onReady?: () => void;
}

const DOWN = new Vector3(0, -1, 0);
const tmpV = new Vector3();
const tmpQ = new Quaternion();

export class SantaStage {
  readonly canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(17, 0.8, 1, 40);
  private key = new DirectionalLight(0xffffff, 2.1);
  private nodes: Record<string, Rest> = {};
  private gifts: Rest[] = [];
  private shadow: Mesh | null = null;
  private ready = false;
  private disposed = false;

  private mood: SantaMood;
  private prevMood: SantaMood;
  private blend = 1;
  private time = rand(0, 3);
  private moodTime = 0;
  private prevMoodTime = 0;

  // live layers
  private interactive: boolean;
  private pointer = { x: 0, y: 0, active: false };
  private look = { x: 0, y: 0, hx: 0, hy: 0, tx: 0, ty: 0, nextSaccade: 1.5 };
  private blinkAt = rand(1.2, 3);
  private blinkT = -1;
  private doubleBlink = false;
  private boopT = -1;
  private sackVis = 0;
  private giftVis = 0;
  private tip = new Spring(0, 70, 0.22);
  private hat = new Spring(0, 55, 0.3);
  private lastRootY = 0;
  private lastHeadY = 0;
  private lastHeadZ = 0;
  private eyeOpenS = 1;

  constructor(opts: SantaStageOptions) {
    this.mood = this.prevMood = opts.mood;
    this.interactive = !!opts.interactive;
    this.canvas = document.createElement("canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.display = "block";
    this.renderer = new WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setClearColor(0x000000, 0);

    this.camera.position.set(0, 2.55, 12.6);
    this.camera.lookAt(0, 1.55, 0);

    this.key.position.set(-3.2, 5.5, 6.5);
    this.scene.add(this.key, new AmbientLight(0xffffff, 1.05));

    loadModel()
      .then((gltf) => {
        if (this.disposed) return;
        this.build(gltf);
        this.ready = true;
        this.renderFrame(0);
        opts.onReady?.();
      })
      .catch((e) => console.warn("[SantaStage] model failed to load", e));
  }

  private build(gltf: GLTF) {
    const model = prepareModel(gltf.scene);
    this.scene.add(model);
    const names = [
      "NoelBaba_Root", "UstGovde_Pivot", "Kafa_Pivot", "Sapka_Pivot", "Sapka_Uc_Pivot",
      "Kol_Pivot_L", "Kol_Pivot_R", "Goz_1", "Goz_-1", "Kas_1", "Kas_-1", "Agiz", "BosCuval", "BosCuval_Agiz",
    ];
    for (const n of names) {
      const o = model.getObjectByName(n);
      if (o) this.nodes[n] = { o, p: o.position.clone(), q: o.quaternion.clone(), s: o.scale.clone() };
    }
    for (let i = 1; i <= 4; i++) {
      const o = model.getObjectByName(`Hediye_${i}`);
      if (o) this.gifts.push({ o, p: o.position.clone(), q: o.quaternion.clone(), s: o.scale.clone() });
    }
    // soft contact shadow
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    grd.addColorStop(0, "rgba(40,10,10,0.55)");
    grd.addColorStop(0.6, "rgba(40,10,10,0.22)");
    grd.addColorStop(1, "rgba(40,10,10,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;
    const sh = new Mesh(new PlaneGeometry(2.1, 1.0), new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2;
    sh.position.set(0, 0.005, 0.05);
    sh.renderOrder = -2;
    this.scene.add(sh);
    this.shadow = sh;
  }

  // ------------------------------------------------------------------ public
  setMood(m: SantaMood) {
    if (m === this.mood) return;
    this.prevMood = this.mood;
    this.prevMoodTime = this.moodTime;
    this.mood = m;
    this.moodTime = 0;
    this.blend = 0;
  }

  setInteractive(v: boolean) {
    this.interactive = v;
  }

  /** pointer in canvas-relative normalized coords (-1..1, y down) */
  setPointer(x: number, y: number) {
    this.pointer.x = Math.max(-1.5, Math.min(1.5, x));
    this.pointer.y = Math.max(-1.5, Math.min(1.5, y));
    this.pointer.active = true;
  }

  boop() {
    this.boopT = 0;
    this.tip.v -= 6;
  }

  resize(w: number, h: number, dpr = Math.min(window.devicePixelRatio || 1, 2)) {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** advance by dt seconds and draw */
  tick(dt: number) {
    if (!this.ready || this.disposed) return;
    dt = Math.min(dt, 1 / 20);
    this.time += dt;
    this.moodTime += dt;
    this.prevMoodTime += dt;
    if (this.blend < 1) this.blend = Math.min(1, this.blend + dt / 0.7);
    this.renderFrame(dt);
  }

  /** draw a deterministic frame of a mood at time t (used for still images) */
  snapshot(m: SantaMood, t: number) {
    if (!this.ready) return;
    this.mood = this.prevMood = m;
    this.blend = 1;
    this.moodTime = t;
    this.blinkAt = 999;
    this.blinkT = -1;
    this.look = { x: 0, y: 0, hx: 0, hy: 0, tx: 0, ty: 0, nextSaccade: 999 };
    this.sackVis = m === "sad" ? 1 : 0;
    this.giftVis = m === "celebrate" ? 1 : 0;
    for (let i = 0; i < 90; i++) this.renderFrame(1 / 60, true);
  }

  get isReady() {
    return this.ready;
  }

  dispose() {
    this.disposed = true;
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  // ------------------------------------------------------------------ frame
  private renderFrame(dt: number, frozen = false) {
    const b = easeInOut(this.blend);
    const cur = MOODS[this.mood](this.moodTime);
    const p = b < 1 ? blendPose(MOODS[this.prevMood](this.prevMoodTime), cur, b) : cur;

    // --- blink (random, natural timing: fast close, slower open)
    if (!frozen) {
      this.blinkAt -= dt;
      if (this.blinkAt <= 0 && this.blinkT < 0) {
        this.blinkT = 0;
        this.doubleBlink = Math.random() < 0.18;
      }
    }
    let blink = 0;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      const t = this.blinkT;
      blink = t < 0.075 ? easeInOut(t / 0.075) : t < 0.11 ? 1 : 1 - easeInOut((t - 0.11) / 0.16);
      if (t > 0.27) {
        if (this.doubleBlink) {
          this.blinkT = 0;
          this.doubleBlink = false;
        } else {
          this.blinkT = -1;
          this.blinkAt = rand(2.6, 5.8);
        }
        blink = 0;
      }
    }

    // --- look: cursor (interactive) or gentle idle saccades
    const L = this.look;
    if (this.interactive && this.pointer.active) {
      L.tx = this.pointer.x;
      L.ty = this.pointer.y;
    } else if (!frozen) {
      L.nextSaccade -= dt;
      if (L.nextSaccade <= 0) {
        L.tx = Math.random() < 0.45 ? 0 : rand(-0.55, 0.55);
        L.ty = Math.random() < 0.45 ? 0 : rand(-0.35, 0.3);
        L.nextSaccade = rand(2.2, 4.5);
      }
    }
    L.x = damp(L.x, L.tx, 5.5, dt); // eyes: smooth, never snappy
    L.y = damp(L.y, L.ty, 5.5, dt);
    L.hx = damp(L.hx, L.tx, 2.6, dt); // head follows slower
    L.hy = damp(L.hy, L.ty, 2.6, dt);
    const lookW = this.mood === "celebrate" ? 0.3 : this.mood === "thinking" ? 0.35 : 1;

    // --- boop (click reaction)
    let boop = 0;
    if (this.boopT >= 0) {
      this.boopT += dt;
      boop = this.boopT < 0.5 ? Math.sin((Math.PI * this.boopT) / 0.5) : 0;
      if (this.boopT >= 0.5) this.boopT = -1;
    }

    // --- breathing
    const breath = Math.sin((this.time * TAU) / 3.6);

    const n = this.nodes;
    const set = (name: string, f: (r: Rest) => void) => {
      const r = n[name];
      if (r) f(r);
    };

    const rootY = p.rootY + 0.16 * boop;
    set("NoelBaba_Root", (r) => r.o.position.set(r.p.x, r.p.y + rootY, r.p.z));
    set("UstGovde_Pivot", (r) => {
      r.o.position.set(r.p.x, r.p.y + p.upY + 0.006 * breath, r.p.z);
      const sq = p.upSquash - 0.012 * breath - 0.05 * boop;
      r.o.scale.set(r.s.x * (1 + sq * 0.6), r.s.y * (1 - sq), r.s.z * (1 + sq * 0.6));
      r.o.quaternion.copy(r.q);
      r.o.rotateX(p.upRX);
      r.o.rotateZ(p.upRZ + 0.012 * Math.sin((this.time * TAU) / 5.3));
    });
    const headY = p.headY + L.hx * 0.22 * lookW;
    const headX = p.headX + L.hy * 0.11 * lookW;
    set("Kafa_Pivot", (r) => {
      r.o.quaternion.copy(r.q);
      r.o.rotateY(headY);
      r.o.rotateX(headX);
      r.o.rotateZ(p.headZ);
    });

    // hat & pompom secondary motion
    const fdt = Math.max(dt, 1e-3);
    const vRoot = (rootY - this.lastRootY) / fdt;
    const vHeadZ = (p.headZ - this.lastHeadZ) / fdt;
    const vHeadY = (headY - this.lastHeadY) / fdt;
    this.lastRootY = rootY;
    this.lastHeadZ = p.headZ;
    this.lastHeadY = headY;
    const hatZ = this.hat.step(p.hatZ - vHeadZ * 0.05, dt);
    const tipZ = this.tip.step(-vRoot * 0.09 - vHeadZ * 0.12 - vHeadY * 0.04 + 0.04 * Math.sin((this.time * TAU) / 4.1), dt);
    set("Sapka_Pivot", (r) => {
      r.o.quaternion.copy(r.q);
      r.o.rotateZ(hatZ);
    });
    set("Sapka_Uc_Pivot", (r) => {
      r.o.quaternion.copy(r.q);
      r.o.rotateZ(Math.max(-0.6, Math.min(0.6, tipZ)));
    });

    // arms
    const arm = (name: string, d: V3, stretch: number) =>
      set(name, (r) => {
        tmpV.set(d[0], d[1], d[2]).normalize();
        tmpQ.setFromUnitVectors(DOWN, tmpV);
        r.o.quaternion.copy(r.q).multiply(tmpQ);
        r.o.scale.set(r.s.x, r.s.y * stretch, r.s.z);
      });
    arm("Kol_Pivot_L", [p.armL[0] + 0.02 * breath, p.armL[1], p.armL[2]], p.armLStretch);
    arm("Kol_Pivot_R", [p.armR[0] - 0.02 * breath, p.armR[1], p.armR[2]], p.armRStretch);

    // eyes
    this.eyeOpenS = damp(this.eyeOpenS, p.eyeOpen * (1 - 0.65 * boop), 14, dt);
    const open = Math.max(0.07, this.eyeOpenS * (1 - blink));
    const ex = p.eyeX + L.x * 0.03 * lookW;
    const ey = p.eyeY - L.y * 0.022 * lookW;
    for (const name of ["Goz_1", "Goz_-1"]) {
      set(name, (r) => {
        r.o.position.set(r.p.x + ex, r.p.y + ey, r.p.z);
        r.o.scale.set(r.s.x, r.s.y * open, r.s.z);
      });
    }
    // brows
    for (const [name, side] of [["Kas_1", 1], ["Kas_-1", -1]] as const) {
      set(name, (r) => {
        const raise = p.browY + (side === 1 ? p.browRaiseL : 0) + 0.02 * boop + 0.01 * blink;
        r.o.position.set(r.p.x, r.p.y + raise, r.p.z);
        r.o.quaternion.copy(r.q);
        r.o.rotateZ(-p.browInner * side);
      });
    }
    set("Agiz", (r) => r.o.scale.set(r.s.x * p.mouthX, r.s.y * (p.mouthY + 0.25 * boop), r.s.z));

    // accessories pop in/out with overshoot
    this.sackVis = damp(this.sackVis, p.sack, 7, dt);
    this.giftVis = damp(this.giftVis, p.gifts, 6, dt);
    const pop = (v: number) => (v < 0.02 ? 0 : 1 + 0.12 * Math.sin(Math.PI * clamp01(v)) * (1 - v));
    for (const nm of ["BosCuval", "BosCuval_Agiz"]) {
      set(nm, (r) => {
        const k = pop(this.sackVis) * this.sackVis;
        r.o.visible = k > 0.01;
        r.o.scale.copy(r.s).multiplyScalar(Math.max(0.001, k));
      });
    }
    this.gifts.forEach((g, i) => {
      const k = pop(this.giftVis) * this.giftVis;
      g.o.visible = k > 0.01;
      const hop = Math.max(0, Math.sin((this.moodTime * TAU) / 0.95 + i * 1.3)) * 0.12 * k;
      g.o.position.set(g.p.x, g.p.y + hop, g.p.z);
      g.o.scale.copy(g.s).multiplyScalar(Math.max(0.001, k));
      g.o.quaternion.copy(g.q);
      g.o.rotateY(0.1 * Math.sin(this.moodTime * 2 + i));
    });

    if (this.shadow) {
      const k = 1 - Math.min(0.6, rootY * 1.6);
      this.shadow.scale.set(k, k, k);
      (this.shadow.material as MeshBasicMaterial).opacity = 0.85 * k;
    }

    // key light direction in view space for spec / rim
    shared.keyDirView.value.copy(this.key.position).normalize().transformDirection(this.camera.matrixWorldInverse);
    this.renderer.render(this.scene, this.camera);
  }
}

// ---------------------------------------------------------------------------
// one RAF loop for every visible stage
// ---------------------------------------------------------------------------
const active = new Set<SantaStage>();
let raf = 0;
let last = 0;

function loop(now: number) {
  const dt = last ? (now - last) / 1000 : 0;
  last = now;
  if (!document.hidden) active.forEach((s) => s.tick(dt));
  raf = active.size ? requestAnimationFrame(loop) : 0;
  if (!raf) last = 0;
}

export function startStage(s: SantaStage) {
  active.add(s);
  if (!raf) raf = requestAnimationFrame(loop);
}

export function stopStage(s: SantaStage) {
  active.delete(s);
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

