import { CATALOG, DEFAULT_STATE } from './config.js';

export function byId(list, id) {
  return list.find((item) => item.id === id) || list[0];
}

// Turn the picked ids into the numbers the materials use.
// Roughness: 0 is mirror, 1 is matte. Ceramic bezels drop metalness and gain clearcoat.
export function resolveLook(catalog, state) {
  const shape = byId(catalog.shapes, state.shape);
  const finish = byId(catalog.finishes, state.finish);
  const metal = byId(catalog.metals, state.metal);
  const bezel = byId(catalog.bezels, state.bezel);
  const dial = byId(catalog.dials, state.dial);
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
  const bits = [
    look.shapeId === 'round' ? 'Round' : 'Cushion',
    look.metal.name,
    look.finishId,
    `${look.bezel.name} ${look.bezel.material}`,
    `${look.dial.name} dial`,
    look.strap.name,
  ];
  return bits.join(' · ');
}
