import { CATALOG, DEFAULT_STATE } from './config.js';

export function byId(list, id) {
  return list.find((item) => item.id === id) || list[0];
}

// Turn the picked ids into the numbers the materials use.
// Roughness: 0 is mirror, 1 is matte. Ceramic bezels drop metalness and gain clearcoat.
const STYLE_ALIAS = { s2268: 'octagon', s2386: 'diver', moonswatch: 'chrono' };

export function dialsFor(catalog, shape) {
  return catalog.dials.filter((dial) => dial.family === shape.family);
}

export function bezelsFor(shape) {
  return shape.bezels?.length ? shape.bezels : [];
}

const DIAL_ALIAS = { tiffany: 'aqua' };

function pickDial(list, id) {
  const wanted = DIAL_ALIAS[id] || String(id || '');
  return list.find((dial) => dial.id === wanted)
    || list.find((dial) => dial.id.endsWith('-' + wanted))
    || list.find((dial) => dial.name.toLowerCase() === wanted.toLowerCase())
    || list[0];
}

export function resolveLook(catalog, state) {
  const shape = byId(catalog.shapes, STYLE_ALIAS[state.shape] || state.shape);
  const finish = byId(catalog.finishes, state.finish);
  const metal = byId(catalog.metals, state.metal);
  const bezelList = bezelsFor(shape);
  const bezel = bezelList.find((item) => item.id === state.bezel) || bezelList[0];
  const dial = pickDial(dialsFor(catalog, shape), state.dial);
  const strap = byId(catalog.straps, state.strap);
  const polished = finish.id === 'polished';

  return {
    shapeId: shape.id,
    finishId: finish.id,
    metal,
    bezel,
    dial,
    strap,
    showBracelet: !strap.rubber,
    caseColor: metal.look.metal,
    polishedColor: metal.look.polished,
    caseRoughness: polished ? metal.look.gloss : metal.look.satin,
    polishRoughness: metal.look.gloss,
    brushStrength: polished ? 0 : 1,
    bezelColor: bezel.colour,
    bezelCeramic: bezel.material === 'ceramic',
    rubberColor: strap.rubber || '#2a2c30',
  };
}

export function stateFromHash(hash) {
  const params = new URLSearchParams(String(hash || '').replace(/^#/, ''));
  const raw = { ...DEFAULT_STATE };
  for (const key of Object.keys(DEFAULT_STATE)) {
    const value = params.get(key);
    if (value == null || value === '') continue;
    raw[key] = key === 'night' ? value === '1' || value === 'true' : value;
  }
  // The public configurator uses style, case, and dial. Map those onto our ids.
  if (params.get('style')) raw.shape = STYLE_ALIAS[params.get('style')] || params.get('style');
  if (params.get('case')) raw.metal = params.get('case');
  if (params.get('dial')) raw.dial = params.get('dial');
  const look = resolveLook(CATALOG, raw);
  return {
    shape: look.shapeId,
    finish: look.finishId,
    metal: look.metal.id,
    bezel: look.bezel.id,
    dial: look.dial.id,
    strap: look.strap.id,
    night: Boolean(raw.night),
    view: raw.view === 'back' ? 'back' : 'front',
  };
}

export function hashFromState(state) {
  const params = new URLSearchParams();
  for (const key of ['shape', 'finish', 'metal', 'bezel', 'dial', 'strap', 'view']) {
    params.set(key, state[key]);
  }
  if (state.night) params.set('night', '1');
  return params.toString();
}

export function describe(state) {
  const look = resolveLook(CATALOG, state);
  const shape = byId(CATALOG.shapes, look.shapeId);
  const bits = [
    shape.name,
    look.metal.name,
    look.finishId,
    shape.bezelFollowsCase || (shape.bezels?.length || 0) < 2
      ? null
      : `${look.bezel.name} ${look.bezel.material}`,
    `${look.dial.name} dial`,
    look.strap.name,
  ].filter(Boolean);
  return bits.join(' · ');
}
