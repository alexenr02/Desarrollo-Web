import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { resolveLook } from './state.js';
import { CATALOG } from './config.js';
import { brushedNormalTexture, paintDate, paintDial } from './textures.js';

const FRONT_CAM = new THREE.Vector3(22, 12, 148);
const BACK_CAM = new THREE.Vector3(0, 8, -156);

// Builds one procedural watch and keeps a single material per slot.
// Option changes lerp those materials; they do not swap meshes, except
// the case shape and the bracelet/rubber pair, which are visibility toggles.
export function createWatch(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.96;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e7e4dc');

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 500);
  camera.position.copy(FRONT_CAM);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight('#fff6ea', 1.05);
  key.position.set(40, 60, 80);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#d5e4ff', 0.55);
  rim.position.set(-50, 20, -30);
  scene.add(rim);
  scene.environmentIntensity = 0.72;

  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 80;
  controls.maxDistance = 260;
  controls.target.set(0, 0, 0);
  controls.autoRotateSpeed = 0.7;

  const brushMap = brushedNormalTexture();
  const mats = createMaterials(brushMap);
  const parts = buildWatch(mats);
  scene.add(parts.root);

  const dialCanvas = document.createElement('canvas');
  // 2048 is the dial print. Raise this for a closer crop; the paint stays proportional.
  dialCanvas.width = dialCanvas.height = 2048;
  const dialMap = new THREE.CanvasTexture(dialCanvas);
  dialMap.colorSpace = THREE.SRGBColorSpace;
  dialMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
  mats.dial.map = dialMap;

  const dateCanvas = document.createElement('canvas');
  dateCanvas.width = 512;
  dateCanvas.height = 384;
  paintDate(dateCanvas);
  const dateMap = new THREE.CanvasTexture(dateCanvas);
  dateMap.colorSpace = THREE.SRGBColorSpace;
  mats.date.map = dateMap;

  const targets = {
    case: new THREE.Color('#c5c8cc'),
    polish: new THREE.Color('#e7e9eb'),
    bezel: new THREE.Color('#1a3f86'),
    frame: new THREE.Color('#d7d8da'),
    lume: new THREE.Color('#d5e3c4'),
    second: new THREE.Color('#d5e3c4'),
    rubber: new THREE.Color('#2a2c30'),
    sub: new THREE.Color('#0e1a2b'),
    subHand: new THREE.Color('#f0ddb0'),
    dialTop: new THREE.Color('#3e4148'),
    dialBot: new THREE.Color('#141518'),
  };
  const current = {
    case: targets.case.clone(),
    polish: targets.polish.clone(),
    bezel: targets.bezel.clone(),
    frame: targets.frame.clone(),
    lume: targets.lume.clone(),
    second: targets.second.clone(),
    rubber: targets.rubber.clone(),
    sub: targets.sub.clone(),
    subHand: targets.subHand.clone(),
    dialTop: targets.dialTop.clone(),
    dialBot: targets.dialBot.clone(),
  };

  const watch = {
    view: 'front',
    night: 0,
    nightTarget: 0,
    rough: 0.36,
    roughTarget: 0.36,
    polishRough: 0.07,
    polishRoughTarget: 0.07,
    brush: 1,
    brushTarget: 1,
    ceramic: 1,
    ceramicTarget: 1,
    dialLook: CATALOG.dials[0].look,
    dialDirty: true,
    viewTween: null,
    lastInput: performance.now(),
    driving: false,
  };

  controls.addEventListener('start', () => {
    watch.driving = true;
    watch.lastInput = performance.now();
    controls.autoRotate = false;
  });
  controls.addEventListener('end', () => {
    watch.driving = false;
    watch.lastInput = performance.now();
  });

  let raf = 0;
  let last = performance.now();

  function resize() {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function apply(state, { immediate = false } = {}) {
    const look = resolveLook(CATALOG, state);
    for (const [id, caseGroup] of Object.entries(parts.cases)) {
      caseGroup.visible = id === look.shapeId;
      caseGroup.userData.bracelet.visible = caseGroup.visible && look.showBracelet;
      caseGroup.userData.rubber.visible = caseGroup.visible && !look.showBracelet;
    }
    parts.subdial.visible = Boolean(look.dial.look.sub);

    targets.case.set(look.caseColor);
    targets.polish.set(look.polishedColor);
    targets.bezel.set(look.bezelColor);
    targets.frame.set(look.dial.look.frame);
    targets.lume.set(look.dial.look.lume);
    targets.second.set(look.dial.look.second);
    targets.rubber.set(look.rubberColor);
    targets.dialTop.set(look.dial.look.top);
    targets.dialBot.set(look.dial.look.bottom);
    if (look.dial.look.sub) {
      targets.sub.set(look.dial.look.sub.colour);
      targets.subHand.set(look.dial.look.sub.hand);
    }
    watch.roughTarget = look.caseRoughness;
    watch.polishRoughTarget = look.polishRoughness;
    watch.brushTarget = look.brushStrength;
    watch.ceramicTarget = look.bezelCeramic ? 1 : 0;
    watch.nightTarget = state.night ? 1 : 0;
    watch.dialLook = look.dial.look;
    watch.dialDirty = true;

    if (state.view !== watch.view) {
      watch.view = state.view;
      if (immediate) snapView(state.view);
      else startView(state.view);
    }

    if (immediate) {
      snapMaterials();
      paintDial(dialCanvas, current.dialTop, current.dialBot, watch.dialLook);
      dialMap.needsUpdate = true;
      watch.dialDirty = false;
    }
  }

  function snapView(view) {
    camera.position.copy(view === 'back' ? BACK_CAM : FRONT_CAM);
    watch.viewTween = null;
    controls.enabled = true;
    controls.update();
  }

  function startView(view) {
    watch.viewTween = {
      from: camera.position.clone(),
      to: (view === 'back' ? BACK_CAM : FRONT_CAM).clone(),
      t: 0,
    };
    controls.enabled = false;
    controls.autoRotate = false;
  }

  function snapMaterials() {
    for (const key of Object.keys(current)) current[key].copy(targets[key]);
    watch.rough = watch.roughTarget;
    watch.polishRough = watch.polishRoughTarget;
    watch.brush = watch.brushTarget;
    watch.ceramic = watch.ceramicTarget;
    watch.night = watch.nightTarget;
    writeMaterials();
  }

  function writeMaterials() {
    const night = watch.night;
    mats.brushed.color.copy(current.case);
    mats.brushed.roughness = watch.rough;
    mats.brushed.normalScale.set(0.45 * watch.brush, 0.45 * watch.brush);
    mats.brushed.anisotropy = 0.65 * watch.brush;
    mats.polished.color.copy(current.polish);
    mats.polished.roughness = watch.polishRough;
    mats.bezel.color.copy(current.bezel);
    // Ceramic is glossy and non-metal. Aluminium stays half-metal and satin.
    mats.bezel.metalness = THREE.MathUtils.lerp(0.55, 0, watch.ceramic);
    mats.bezel.roughness = THREE.MathUtils.lerp(0.42, 0.28, watch.ceramic);
    mats.bezel.clearcoat = THREE.MathUtils.lerp(0, 0.85, watch.ceramic);
    mats.bezel.clearcoatRoughness = THREE.MathUtils.lerp(0.3, 0.05, watch.ceramic);
    mats.tick.color.copy(current.bezel).lerp(new THREE.Color('#f4f1ea'), 0.62);
    mats.frame.color.copy(current.frame);
    mats.lume.color.copy(current.lume);
    mats.lume.emissive.copy(current.lume);
    mats.lume.emissiveIntensity = THREE.MathUtils.lerp(0.15, 2.8, night);
    mats.second.color.copy(current.second);
    mats.rubber.color.copy(current.rubber);
    mats.sub.color.copy(current.sub);
    mats.subHand.color.copy(current.subHand);
    mats.dial.color.setScalar(THREE.MathUtils.lerp(1, 0.42, night));
    scene.background.copy(new THREE.Color('#e7e4dc')).lerp(new THREE.Color('#101216'), night);
    scene.environmentIntensity = THREE.MathUtils.lerp(0.72, 0.12, night);
    key.intensity = THREE.MathUtils.lerp(1.05, 0.12, night);
    rim.intensity = THREE.MathUtils.lerp(0.55, 0.04, night);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const blend = 1 - Math.pow(0.0015, dt);

    for (const key of Object.keys(current)) current[key].lerp(targets[key], blend);
    watch.rough += (watch.roughTarget - watch.rough) * blend;
    watch.polishRough += (watch.polishRoughTarget - watch.polishRough) * blend;
    watch.brush += (watch.brushTarget - watch.brush) * blend;
    watch.ceramic += (watch.ceramicTarget - watch.ceramic) * blend;
    watch.night += (watch.nightTarget - watch.night) * blend;
    writeMaterials();

    if (watch.dialDirty) {
      paintDial(dialCanvas, current.dialTop, current.dialBot, watch.dialLook);
      dialMap.needsUpdate = true;
      // Color has no distanceTo; compare channels so the canvas stops repainting once it arrives.
      const settled = channelGap(current.dialTop, targets.dialTop) < 0.004
        && channelGap(current.dialBot, targets.dialBot) < 0.004;
      if (settled) watch.dialDirty = false;
    }

    const time = new Date();
    const seconds = time.getSeconds() + time.getMilliseconds() / 1000;
    const minutes = time.getMinutes() + seconds / 60;
    const hours = (time.getHours() % 12) + minutes / 60;
    parts.hands.hour.rotation.z = -hours / 12 * Math.PI * 2;
    parts.hands.minute.rotation.z = -minutes / 60 * Math.PI * 2;
    parts.hands.second.rotation.z = -seconds / 60 * Math.PI * 2;
    parts.subHand.rotation.z = -seconds / 60 * Math.PI * 2;

    const t = now / 1000;
    parts.balance.rotation.z = Math.sin(t * Math.PI * 2 * 3) * 0.55;
    parts.rotor.rotation.z = Math.sin(t * 0.4) * 0.45;
    parts.wheel.rotation.z = Math.floor(t * 4) / 4;

    if (watch.viewTween) {
      watch.viewTween.t = Math.min(1, watch.viewTween.t + dt / 0.85);
      const k = 1 - Math.pow(1 - watch.viewTween.t, 3);
      camera.position.lerpVectors(watch.viewTween.from, watch.viewTween.to, k);
      camera.lookAt(0, 0, 0);
      if (watch.viewTween.t >= 1) {
        watch.viewTween = null;
        controls.enabled = true;
        controls.update();
      }
    } else {
      if (!watch.driving && watch.view === 'front' && now - watch.lastInput > 4000) {
        controls.autoRotate = true;
      }
      controls.update();
    }

    renderer.render(scene, camera);
  }

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  raf = requestAnimationFrame(frame);

  return {
    apply,
    resize,
    dispose() {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
    },
  };
}

function createMaterials(brushMap) {
  const brushed = new THREE.MeshPhysicalMaterial({
    color: '#c5c8cc',
    metalness: 1,
    roughness: 0.36,
    anisotropy: 0.65,
    anisotropyRotation: Math.PI / 2,
    normalMap: brushMap,
    normalScale: new THREE.Vector2(0.45, 0.45),
    envMapIntensity: 0.72,
  });
  const polished = new THREE.MeshPhysicalMaterial({
    color: '#e7e9eb',
    metalness: 1,
    roughness: 0.07,
    clearcoat: 0.25,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.25,
  });
  const bezel = new THREE.MeshPhysicalMaterial({
    color: '#1a3f86',
    metalness: 0,
    roughness: 0.28,
    clearcoat: 0.85,
    clearcoatRoughness: 0.05,
    envMapIntensity: 0.9,
  });
  return {
    brushed,
    polished,
    bezel,
    tick: new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: 0.45 }),
    frame: new THREE.MeshPhysicalMaterial({
      color: '#d7d8da',
      metalness: 1,
      roughness: 0.28,
      clearcoat: 0.2,
    }),
    lume: new THREE.MeshStandardMaterial({
      color: '#d5e3c4',
      emissive: '#d5e3c4',
      emissiveIntensity: 0.15,
      roughness: 0.55,
    }),
    second: new THREE.MeshStandardMaterial({ color: '#d5e3c4', roughness: 0.4, metalness: 0.2 }),
    dial: new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0 }),
    crystal: new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 0,
      roughness: 0.04,
      transmission: 1,
      thickness: 0.8,
      ior: 1.5,
      transparent: true,
      envMapIntensity: 1,
    }),
    rubber: new THREE.MeshPhysicalMaterial({
      color: '#2a2c30',
      metalness: 0,
      roughness: 0.62,
      clearcoat: 0.15,
      clearcoatRoughness: 0.4,
    }),
    plate: new THREE.MeshStandardMaterial({ color: '#6d7270', metalness: 0.75, roughness: 0.4, side: THREE.DoubleSide }),
    bridge: new THREE.MeshStandardMaterial({ color: '#e2c98a', metalness: 0.9, roughness: 0.28, side: THREE.DoubleSide }),
    gear: new THREE.MeshStandardMaterial({ color: '#f2efe6', metalness: 0.85, roughness: 0.28, side: THREE.DoubleSide }),
    rotor: new THREE.MeshStandardMaterial({ color: '#c4963a', metalness: 1, roughness: 0.26, side: THREE.DoubleSide }),
    jewel: new THREE.MeshStandardMaterial({ color: '#c42938', roughness: 0.2, metalness: 0.15, emissive: '#6a1020', emissiveIntensity: 0.45 }),
    sub: new THREE.MeshStandardMaterial({ color: '#0e1a2b', roughness: 0.55 }),
    subHand: new THREE.MeshStandardMaterial({ color: '#f0ddb0', metalness: 0.6, roughness: 0.3 }),
    date: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
  };
}

function buildWatch(mats) {
  const root = new THREE.Group();
  const cases = {};
  for (const spec of CATALOG.shapes) {
    const group = buildCase(spec, mats);
    group.visible = spec.id === CATALOG.shapes[0].id;
    cases[spec.id] = group;
    root.add(group);
  }

  const face = buildFace(mats);
  root.add(face.group);

  const movement = buildMovement(mats);
  root.add(movement.group);

  return {
    root,
    cases,
    subdial: face.subdial,
    subHand: face.subHand,
    hands: face.hands,
    balance: movement.balance,
    rotor: movement.rotor,
    wheel: movement.wheel,
  };
}

function buildCase(spec, mats) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(extrude(caseOutline(spec), 11), mats.brushed);
  group.add(body);

  // The colored insert stays a ring around the dial. The case body around it stays metal.
  const bezel = new THREE.Mesh(extrude(ringShape(spec.bezelOuter, spec.bezelInner), 2.3), mats.bezel);
  bezel.position.z = 5.6;
  group.add(bezel);

  const lip = new THREE.Mesh(new THREE.TorusGeometry(spec.opening + 0.08, 0.42, 10, 64), mats.polished);
  lip.position.z = 5.15;
  group.add(lip);

  addLugs(group, mats.brushed, spec.lugReach);
  addTicks(group, (spec.bezelOuter + spec.bezelInner) / 2, 7.15, mats.tick);

  const crown = makeCrown(mats.brushed, mats.polished);
  crown.position.x = spec.crownShift || 0;
  group.add(crown);

  const strapStart = spec.lugReach + 5.3;
  const bracelet = buildBracelet(mats.brushed, mats.polished, strapStart);
  const rubber = buildRubber(mats.rubber, mats.polished, strapStart);
  rubber.visible = false;
  group.add(bracelet, rubber);
  group.userData.bracelet = bracelet;
  group.userData.rubber = rubber;

  // Open caseback. A glass disc here goes opaque in WebGL and hides the movement.
  const backLip = new THREE.Mesh(new THREE.TorusGeometry(spec.opening - 0.35, 0.4, 10, 48), mats.polished);
  backLip.position.z = -5.7;
  group.add(backLip);
  return group;
}

function buildFace(mats) {
  const group = new THREE.Group();
  const dial = new THREE.Mesh(new THREE.CircleGeometry(15.15, 128), mats.dial);
  dial.position.z = 4.55;
  group.add(dial);

  const hands = {
    hour: makeHand(7.2, 1.15, 0.28, mats.frame, 0.4),
    minute: makeHand(10.4, 0.85, 0.22, mats.frame, 0.2),
    second: makeHand(12.4, 0.28, 0.16, mats.second, 3.2),
  };
  hands.hour.position.z = 5.05;
  hands.minute.position.z = 5.35;
  hands.second.position.z = 5.65;
  group.add(hands.hour, hands.minute, hands.second);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.35, 20), mats.polished);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 5.9;
  group.add(cap);

  addIndices(group, mats);

  const date = new THREE.Group();
  const dateFrame = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 2.7), mats.polished);
  const dateFace = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 2.15), mats.date);
  dateFace.position.z = 0.04;
  date.add(dateFrame, dateFace);
  date.position.set(9.4, 0, 4.75);
  group.add(date);

  const subdial = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(3.15, 40), mats.sub);
  const subHand = makeHand(2.3, 0.28, 0.14, mats.subHand, 0.15);
  subHand.position.z = 0.16;
  const subRing = new THREE.Mesh(new THREE.TorusGeometry(3.15, 0.12, 8, 32), mats.frame);
  subdial.add(disc, subRing, subHand);
  subdial.position.set(0, -6.4, 4.8);
  subdial.visible = false;
  group.add(subdial);

  const crystal = new THREE.Mesh(crystalGeo(15.7), mats.crystal);
  crystal.position.z = 6.7;
  group.add(crystal);

  return { group, hands, subdial, subHand };
}

function buildMovement(mats) {
  const group = new THREE.Group();
  // Plate sits deepest. Bridges, wheels, and the rotor sit toward the open back.
  const plate = new THREE.Mesh(new THREE.CircleGeometry(14.6, 48), mats.plate);
  plate.position.z = -2.1;
  group.add(plate);

  const bridges = [
    [0, 3.6, 16, 3.6],
    [-2, -3.2, 10, 3.2],
    [4.2, 1.2, 6.5, 2.6],
  ];
  for (const [x, y, w, h] of bridges) {
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.7), mats.bridge);
    bridge.position.set(x, y, -3.5);
    group.add(bridge);
  }

  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 0.45, 20), mats.gear);
  wheel.rotation.x = Math.PI / 2;
  wheel.position.set(-4.2, -1.4, -4.0);
  group.add(wheel);
  const teeth = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.22, 6, 18), mats.gear);
  teeth.position.copy(wheel.position);
  group.add(teeth);

  const balance = new THREE.Group();
  balance.add(new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.2, 8, 28), mats.gear));
  balance.add(new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.28, 0.2), mats.gear));
  balance.position.set(4.6, 2.4, -4.05);
  group.add(balance);

  const rotor = new THREE.Mesh(new THREE.CircleGeometry(8.2, 40, Math.PI * 0.15, Math.PI * 0.9), mats.rotor);
  rotor.position.z = -4.7;
  group.add(rotor);

  for (const [x, y] of [[0, 3.6], [-4.2, -1.4], [4.6, 2.4], [1.5, -5.2]]) {
    const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 14), mats.jewel);
    jewel.position.set(x, y, -4.15);
    group.add(jewel);
  }

  return { group, balance, rotor, wheel };
}

// Three-row bracelet. All rows share the case metal. The center row sits proud,
// and a pin fills the gap. One geometry is reused, so a new size is one call.
function buildBracelet(brushed, polished, start) {
  const group = new THREE.Group();
  const outer = roundedLinkGeometry(4.55, 2.55, 2.45, 1.05);
  const center = roundedLinkGeometry(5.15, 2.45, 2.15, 0.95);
  const pin = new THREE.CylinderGeometry(0.22, 0.22, 14.8, 10);
  pin.rotateZ(Math.PI / 2);
  const pitch = 3.55;

  for (const dir of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const row = new THREE.Group();
      const y = start + i * pitch;
      row.position.set(0, dir * y, -0.02 - i * 0.18);
      row.rotation.x = dir * i * 0.05;

      const left = new THREE.Mesh(outer, brushed);
      left.position.x = -5.15;
      const right = new THREE.Mesh(outer, brushed);
      right.position.x = 5.15;
      // Proud of the outer rows, so the center link catches a highlight of its own.
      const mid = new THREE.Mesh(center, brushed);
      mid.position.z = 0.22;
      row.add(left, mid, right);

      const joint = new THREE.Mesh(pin, polished);
      joint.position.set(0, -pitch / 2, 0);
      row.add(joint);
      group.add(row);
    }
  }
  return group;
}

function roundedLinkGeometry(width, height, depth, radius) {
  const geo = new THREE.ExtrudeGeometry(roundedRect(width, height, radius), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.28,
    bevelSize: 0.32,
    bevelSegments: 3,
    curveSegments: 10,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return geo;
}

function buildRubber(rubberMat, metalMat, start) {
  const group = new THREE.Group();
  for (const dir of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const segment = new THREE.Mesh(new THREE.BoxGeometry(18, 6.2, 3.1), rubberMat);
      segment.position.set(0, dir * (start + i * 6.0), -0.15 - i * 0.45);
      segment.rotation.x = dir * i * 0.05;
      group.add(segment);
    }
  }
  const buckle = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.35, 8, 20), metalMat);
  buckle.position.set(0, -(start + 5 * 6.0), -2.2);
  group.add(buckle);
  return group;
}

function caseOutline(spec) {
  if (spec.kind === 'circle') return ringShape(spec.radius, spec.opening);
  const shape = roundedRect(spec.width, spec.height, spec.corner);
  const hole = new THREE.Path();
  hole.absarc(0, 0, spec.opening, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

function channelGap(a, b) {
  return Math.max(Math.abs(a.r - b.r), Math.abs(a.g - b.g), Math.abs(a.b - b.b));
}

function addLugs(group, material, reach) {
  for (const side of [-1, 1]) {
    for (const x of [-6.4, 6.4]) {
      const lug = new THREE.Mesh(new THREE.BoxGeometry(4.6, 10.4, 4.2), material);
      lug.position.set(x, side * reach, 0);
      group.add(lug);
    }
  }
}

function addTicks(group, radius, z, material) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.PI / 2 - (i / 12) * Math.PI * 2;
    const tick = new THREE.Mesh(new THREE.BoxGeometry(i % 3 === 0 ? 1.15 : 0.55, 1.7, 0.28), material);
    tick.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
    tick.rotation.z = angle - Math.PI / 2;
    group.add(tick);
  }
}

function addIndices(group, mats) {
  for (let i = 0; i < 12; i++) {
    if (i === 3) continue;
    const angle = Math.PI / 2 - (i / 12) * Math.PI * 2;
    const length = i % 3 === 0 ? 3.5 : 2.15;
    const marker = new THREE.Mesh(new THREE.BoxGeometry(i % 3 === 0 ? 1.15 : 0.72, length, 0.32), mats.frame);
    const radius = 12.7;
    marker.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 4.9);
    marker.rotation.z = angle - Math.PI / 2;
    group.add(marker);

    const lume = new THREE.Mesh(new THREE.BoxGeometry(0.42, length * 0.62, 0.16), mats.lume);
    lume.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 5.12);
    lume.rotation.z = marker.rotation.z;
    group.add(lume);
  }
}

function makeHand(length, width, depth, material, tail) {
  const geo = new THREE.BoxGeometry(width, length + tail, depth);
  geo.translate(0, length / 2 - tail / 2, 0);
  return new THREE.Mesh(geo, material);
}

function makeCrown(brushed, polished) {
  const group = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 2.4, 16), polished);
  stem.rotation.z = Math.PI / 2;
  stem.position.x = 20.8;
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 2.5, 22), brushed);
  knob.rotation.z = Math.PI / 2;
  knob.position.x = 22.8;
  group.add(stem, knob);
  return group;
}

function crystalGeo(radius) {
  const geo = new THREE.CylinderGeometry(radius, radius, 0.7, 64);
  geo.rotateX(Math.PI / 2);
  return geo;
}

function extrude(shape, depth) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 48,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return geo;
}

function ringShape(outer, inner) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

function roundedRect(width, height, radius) {
  const shape = new THREE.Shape();
  traceRoundRect(shape, width, height, radius);
  return shape;
}

function traceRoundRect(path, width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  path.moveTo(x + r, y);
  path.lineTo(x + width - r, y);
  path.absarc(x + width - r, y + r, r, -Math.PI / 2, 0, false);
  path.lineTo(x + width, y + height - r);
  path.absarc(x + width - r, y + height - r, r, 0, Math.PI / 2, false);
  path.lineTo(x + r, y + height);
  path.absarc(x + r, y + height - r, r, Math.PI / 2, Math.PI, false);
  path.lineTo(x, y + r);
  path.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
}
