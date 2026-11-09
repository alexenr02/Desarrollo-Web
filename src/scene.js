import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { resolveLook } from './state.js';
import { CATALOG } from './config.js';
import { brushedNormalTexture, brushedRoughnessTexture, brushedStreakTexture, paintDate, paintDial } from './textures.js';

const FRONT_CAM = new THREE.Vector3(5, 2, 186);
const BACK_CAM = new THREE.Vector3(0, 8, -156);

// Builds one procedural watch and keeps a single material per slot.
// Option changes lerp those materials; they do not swap meshes, except
// the case shape and the bracelet/rubber pair, which are visibility toggles.
export function createWatch(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.86;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e7e4dc');

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 500);
  camera.position.copy(FRONT_CAM);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight('#fff6ea', 0.82);
  key.position.set(40, 60, 80);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#d5e4ff', 0.55);
  rim.position.set(-50, 20, -30);
  scene.add(rim);
  scene.environmentIntensity = 0.48;

  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 80;
  controls.maxDistance = 260;
  controls.target.set(0, 0, 0);
  controls.autoRotateSpeed = 0.7;

  const brushMap = brushedNormalTexture();
  const mats = createMaterials(brushMap, brushedRoughnessTexture(), brushedStreakTexture());
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
    const integrated = look.shapeId === 'octagon';
    parts.date.visible = !integrated;
    parts.indexAt3.visible = integrated;

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
    mats.brushed.normalScale.set(0.8 * watch.brush, 0.8 * watch.brush);
    mats.brushed.anisotropy = 0.85 * watch.brush;
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
    mats.frame.roughness = watch.dialLook.frameRough ?? 0.28;
    mats.frame.clearcoat = watch.dialLook.frameCoat ?? 0.2;
    mats.lume.color.copy(current.lume);
    mats.lume.emissive.copy(current.lume);
    mats.lume.emissiveIntensity = THREE.MathUtils.lerp(0.15, 2.8, night);
    mats.second.color.copy(current.second);
    mats.rubber.color.copy(current.rubber);
    mats.sub.color.copy(current.sub);
    mats.subHand.color.copy(current.subHand);
    mats.dial.color.setScalar(THREE.MathUtils.lerp(1, 0.42, night));
    scene.background.copy(new THREE.Color('#e7e4dc')).lerp(new THREE.Color('#101216'), night);
    scene.environmentIntensity = THREE.MathUtils.lerp(0.48, 0.1, night);
    key.intensity = THREE.MathUtils.lerp(0.82, 0.1, night);
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

function createMaterials(brushMap, roughMap, streakMap) {
  const brushed = new THREE.MeshPhysicalMaterial({
    color: '#c5c8cc',
    map: streakMap,
    metalness: 0.72,
    roughness: 0.5,
    roughnessMap: roughMap,
    anisotropy: 0.9,
    anisotropyRotation: Math.PI / 2,
    normalMap: brushMap,
    normalScale: new THREE.Vector2(0.9, 0.9),
    envMapIntensity: 0.4,
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
    gasket: new THREE.MeshStandardMaterial({ color: '#121418', roughness: 0.62, metalness: 0.35 }),
    slot: new THREE.MeshStandardMaterial({ color: '#14161a', roughness: 0.45, metalness: 0.7 }),
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
    date: face.date,
    indexAt3: face.indexAt3,
    hands: face.hands,
    balance: movement.balance,
    rotor: movement.rotor,
    wheel: movement.wheel,
  };
}

function buildCase(spec, mats) {
  const group = new THREE.Group();
  const bodyDepth = spec.integrated ? 8.6 : 11;
  const bodySpec = spec.integrated ? { ...spec, radius: spec.radius * 0.94 } : spec;
  const body = new THREE.Mesh(extrude(caseOutline(bodySpec), bodyDepth), mats.brushed);
  group.add(body);

  // Octagon uses the case metal for the bezel. The other shapes use the insert color.
  const bezelDepth = spec.integrated ? 3.4 : 2.3;
  const bezelOutline = spec.kind === 'polygon'
    ? polygonRing(spec.sides, spec.bezelOuter, spec.bezelInner)
    : ringShape(spec.bezelOuter, spec.bezelInner);
  const bezel = new THREE.Mesh(extrude(bezelOutline, bezelDepth), spec.bezelFollowsCase ? mats.brushed : mats.bezel);
  bezel.position.z = spec.integrated ? bodyDepth / 2 + bezelDepth / 2 - 0.35 : 5.6;
  group.add(bezel);

  if (spec.integrated) {
    const bezelTop = bezel.position.z + bezelDepth / 2;
    // The hole must stay inside the flats. A circle larger than the apothem fills the dial.
    const rimOuter = spec.bezelOuter + 0.22;
    const rimInner = rimOuter * Math.cos(Math.PI / spec.sides) - 0.42;
    const chamfer = new THREE.Mesh(
      extrude(polygonRing(spec.sides, rimOuter, rimInner), 0.55),
      mats.polished,
    );
    chamfer.position.z = bezelTop - 0.7;
    group.add(chamfer);
    addScrews(group, spec, mats.polished, mats.slot, bezelTop - 0.08);
    const gasket = new THREE.Mesh(new THREE.TorusGeometry(spec.bezelInner - 0.15, 0.28, 8, 64), mats.gasket);
    gasket.position.z = bezel.position.z - 0.2;
    group.add(gasket);
  } else {
    const lip = new THREE.Mesh(new THREE.TorusGeometry(spec.opening + 0.08, 0.42, 10, 64), mats.polished);
    lip.position.z = 5.15;
    group.add(lip);
    addLugs(group, mats.brushed, spec.lugReach);
    addTicks(group, (spec.bezelOuter + spec.bezelInner) / 2, 7.15, mats.tick);
  }

  const wall = spec.kind === 'polygon'
    ? spec.bezelOuter * Math.cos(Math.PI / spec.sides)
    : spec.radius;
  const crown = makeCrown(mats.brushed, mats.polished);
  crown.position.x = wall + 0.05;
  group.add(crown);

  const flat = spec.kind === 'polygon'
    ? spec.bezelOuter * Math.cos(Math.PI / spec.sides)
    : spec.lugReach;
  const strapStart = spec.integrated ? flat + 2.6 : spec.lugReach + 5.3;
  const bracelet = spec.integrated
    ? buildIntegratedBracelet(mats.brushed, flat)
    : buildBracelet(mats.brushed, mats.polished, strapStart);
  const rubber = buildRubber(mats.rubber, mats.polished, strapStart, spec.integrated ? 26 : 18);
  rubber.visible = false;
  group.add(bracelet, rubber);
  group.userData.bracelet = bracelet;
  group.userData.rubber = rubber;

  // Open caseback. A glass disc here goes opaque in WebGL and hides the movement.
  const backLip = new THREE.Mesh(new THREE.TorusGeometry(spec.opening - 0.35, 0.4, 10, 48), mats.polished);
  backLip.position.z = spec.integrated ? -bodyDepth / 2 - 0.15 : -5.7;
  group.add(backLip);
  return group;
}

function buildFace(mats) {
  const group = new THREE.Group();
  const dial = new THREE.Mesh(new THREE.CircleGeometry(15.15, 128), mats.dial);
  dial.position.z = 4.55;
  group.add(dial);

  const hands = {
    hour: makeHand(6.6, 1.35, 0.32, mats.polished, 0.55),
    minute: makeHand(10.2, 1.05, 0.26, mats.polished, 0.35),
    second: makeHand(12.2, 0.16, 0.1, mats.second, 3.4),
  };
  hands.hour.position.z = 5.05;
  hands.minute.position.z = 5.35;
  hands.second.position.z = 5.65;
  addHandStripe(hands.hour, 6.6, mats.lume);
  addHandStripe(hands.minute, 10.2, mats.lume);
  group.add(hands.hour, hands.minute, hands.second);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.35, 20), mats.polished);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 5.9;
  group.add(cap);

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

  const crystal = new THREE.Mesh(crystalGeo(15.35), mats.crystal);
  crystal.position.z = 6.55;
  group.add(crystal);

  return { group, hands, subdial, subHand, date, indexAt3: addIndices(group, mats) };
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

function buildRubber(rubberMat, metalMat, start, width = 18) {
  const group = new THREE.Group();
  for (const dir of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const segment = new THREE.Mesh(new THREE.BoxGeometry(width, 6.2, 3.1), rubberMat);
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
  if (spec.kind === 'polygon') return polygonRing(spec.sides, spec.radius, spec.opening);
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
  const at3 = new THREE.Group();
  at3.visible = false;
  group.add(at3);
  for (let i = 0; i < 12; i++) {
    const angle = Math.PI / 2 - (i / 12) * Math.PI * 2;
    const parent = i === 3 ? at3 : group;
    const length = 4.35;
    const twins = i === 0 ? [-0.58, 0.58] : [0];
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const tx = -dy;
    const ty = dx;
    for (const side of twins) {
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.42, length, 0.28), mats.frame);
      const radius = 12.35;
      marker.position.set(dx * radius + tx * side, dy * radius + ty * side, 4.95);
      marker.rotation.z = angle - Math.PI / 2;
      parent.add(marker);

      const lume = new THREE.Mesh(new THREE.BoxGeometry(0.16, length * 0.72, 0.1), mats.lume);
      lume.position.set(marker.position.x, marker.position.y, 5.14);
      lume.rotation.z = marker.rotation.z;
      parent.add(lume);
    }
  }
  return at3;
}

function addHandStripe(hand, length, material) {
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.16, length * 0.68, 0.08), material);
  stripe.position.set(0, length * 0.36, 0.16);
  hand.add(stripe);
}

function makeHand(length, width, depth, material, tail) {
  if (width < 0.4) {
    const geo = new THREE.BoxGeometry(width, length + tail, depth);
    geo.translate(0, length / 2 - tail / 2, 0);
    return new THREE.Mesh(geo, material);
  }
  const shape = new THREE.Shape();
  shape.moveTo(0, -tail);
  shape.lineTo(width * 0.5, length * 0.12);
  shape.lineTo(width * 0.16, length * 0.82);
  shape.lineTo(0, length);
  shape.lineTo(-width * 0.16, length * 0.82);
  shape.lineTo(-width * 0.5, length * 0.12);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 1,
    curveSegments: 2,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, material);
}

function makeCrown(brushed, polished) {
  const group = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 1.5, 16), polished);
  stem.rotation.z = Math.PI / 2;
  stem.position.x = 0.75;
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 2.15, 28), brushed);
  knob.rotation.z = Math.PI / 2;
  knob.position.x = 2.35;
  group.add(stem, knob);
  for (let i = 0; i < 5; i++) {
    const groove = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.68, 0.1, 28), polished);
    groove.rotation.z = Math.PI / 2;
    groove.position.x = 1.55 + i * 0.38;
    group.add(groove);
  }
  return group;
}

function addScrews(group, spec, polished, slotMat, z) {
  const start = -Math.PI / 2 + Math.PI / spec.sides;
  const radius = spec.bezelOuter * 0.86;
  const recessGeo = new THREE.CylinderGeometry(1.28, 1.28, 0.22, 18);
  recessGeo.rotateX(Math.PI / 2);
  const headGeo = new THREE.CylinderGeometry(1.02, 1.08, 0.42, 6);
  headGeo.rotateX(Math.PI / 2);
  const slotGeo = new THREE.BoxGeometry(1.35, 0.14, 0.08);
  for (let i = 0; i < spec.sides; i++) {
    const angle = start + (i / spec.sides) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const recess = new THREE.Mesh(recessGeo, slotMat);
    recess.position.set(x, y, z - 0.08);
    const screw = new THREE.Mesh(headGeo, polished);
    screw.position.set(x, y, z + 0.18);
    screw.rotation.z = angle;
    const slot = new THREE.Mesh(slotGeo, slotMat);
    slot.position.set(x, y, z + 0.26);
    slot.rotation.z = angle + 0.5;
    group.add(recess, screw, slot);
  }
}

// Wide, flat, three-row bracelet. The first link sits on the octagon flat.
function buildIntegratedBracelet(brushed, flat) {
  const group = new THREE.Group();
  const outerW = 8.4;
  const centerW = 9.6;
  const gap = 0.42;
  const linkH = 2.72;
  const pitch = 2.86;
  const outerX = centerW / 2 + gap + outerW / 2;
  const outerGeo = flatLinkGeometry(outerW, linkH, 1.85, 0.28);
  const centerGeo = flatLinkGeometry(centerW, linkH - 0.06, 1.75, 0.24);
  const endH = 3.6;
  const endOuterGeo = flatLinkGeometry(outerW, endH, 2.0, 0.28);
  const endCenterGeo = flatLinkGeometry(centerW, endH - 0.06, 1.9, 0.24);
  const endY = flat + endH / 2 - 0.12;
  const first = endY + endH / 2 + 0.14 + linkH / 2;

  for (const dir of [-1, 1]) {
    const end = new THREE.Group();
    end.position.set(0, dir * endY, 0.02);
    const endLeft = new THREE.Mesh(endOuterGeo, brushed);
    endLeft.position.x = -outerX;
    const endRight = new THREE.Mesh(endOuterGeo, brushed);
    endRight.position.x = outerX;
    const endMid = new THREE.Mesh(endCenterGeo, brushed);
    end.add(endLeft, endMid, endRight);
    group.add(end);
    for (let i = 0; i < 7; i++) {
      const row = new THREE.Group();
      row.position.set(0, dir * (first + i * pitch), -i * 0.012);
      row.rotation.x = dir * i * 0.008;
      const left = new THREE.Mesh(outerGeo, brushed);
      left.position.x = -outerX;
      const right = new THREE.Mesh(outerGeo, brushed);
      right.position.x = outerX;
      const mid = new THREE.Mesh(centerGeo, brushed);
      row.add(left, mid, right);
      group.add(row);
    }
  }
  return group;
}

function flatLinkGeometry(width, height, depth, radius) {
  const geo = new THREE.ExtrudeGeometry(roundedRect(width, height, radius), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.07,
    bevelSegments: 1,
    curveSegments: 4,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return geo;
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

function polygonRing(sides, outer, inner) {
  const shape = new THREE.Shape();
  // Start mid-edge so the octagon has a flat at 12, 3, 6, and 9.
  const start = -Math.PI / 2 + Math.PI / sides;
  for (let i = 0; i < sides; i++) {
    const angle = start + (i / sides) * Math.PI * 2;
    const x = Math.cos(angle) * outer;
    const y = Math.sin(angle) * outer;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
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
