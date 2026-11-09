import { CATALOG } from './config.js';
import { bezelsFor, describe, dialsFor, hashFromState, stateFromHash } from './state.js';
import { createWatch } from './scene.js';

const stage = document.querySelector('#stage');
const canvas = document.querySelector('#view');
const panel = document.querySelector('#panel');
const nightButton = document.querySelector('#night');
const movementButton = document.querySelector('#movement');

const watch = createWatch(canvas);
let state = stateFromHash(location.hash);

function commit({ immediate = false } = {}) {
  state = stateFromHash(hashFromState(state));
  const next = '#' + hashFromState(state);
  if (location.hash !== next) history.replaceState(null, '', next);
  watch.apply(state, { immediate });
  stage.classList.toggle('is-night', state.night);
  nightButton.setAttribute('aria-pressed', String(state.night));
  movementButton.setAttribute('aria-pressed', String(state.view === 'back'));
  nightButton.textContent = state.night ? 'Day' : 'Night';
  movementButton.textContent = state.view === 'back' ? 'Dial' : 'Movement';
  renderPanel();
}

function renderPanel() {
  const metal = CATALOG.metals.find((item) => item.id === state.metal);
  const shape = CATALOG.shapes.find((item) => item.id === state.shape);
  const dials = dialsFor(CATALOG, shape);
  const dial = dials.find((item) => item.id === state.dial);
  const bezels = bezelsFor(shape);
  const bezel = bezels.find((item) => item.id === state.bezel);
  const strap = CATALOG.straps.find((item) => item.id === state.strap);
  const finish = CATALOG.finishes.find((item) => item.id === state.finish);
  const bezelBlock = bezels.length > 1
    ? group('Bezel', `${bezel.material === 'ceramic' ? 'Ceramic' : 'Aluminium'} · ${bezel.name}`, bezelRows(bezels))
    : '';

  panel.innerHTML = `
    <h2>Build</h2>
    <p class="sub">Pick a part. The preview keeps one watch and only changes materials, the case shape, and the strap.</p>
    ${group('Case shape', shape.name, pills('shape', CATALOG.shapes))}
    ${group('Finish', finish.name, pills('finish', CATALOG.finishes))}
    ${group('Case', metal.name, dots('metal', CATALOG.metals))}
    ${bezelBlock}
    ${group('Dial', dial.name, dots('dial', dials))}
    ${group('Strap', strap.name, dots('strap', CATALOG.straps))}
    <p class="summary">${describe(state)}</p>
    <p class="note">Night lifts the lume and drops the studio light. Movement turns the camera to the display back. Drag the watch to orbit.</p>
  `;

  panel.querySelectorAll('[data-key]').forEach((button) => {
    button.addEventListener('click', () => {
      state = { ...state, [button.dataset.key]: button.dataset.value };
      commit();
    });
  });
}

function group(label, value, body) {
  return `<div class="label"><span>${label}</span><b>${value}</b></div>${body}`;
}

function pills(key, items) {
  const buttons = items.map((item) => {
    const on = state[key] === item.id;
    return `<button type="button" class="pill" data-key="${key}" data-value="${item.id}" aria-pressed="${on}">${item.name}</button>`;
  }).join('');
  return `<div class="row">${buttons}</div>`;
}

function dots(key, items) {
  const buttons = items.map((item) => {
    const on = state[key] === item.id;
    const swatch = item.swatch.startsWith('linear')
      ? `background-image:${item.swatch}`
      : `background:${item.swatch}`;
    return `<button type="button" class="chip" data-key="${key}" data-value="${item.id}" aria-pressed="${on}" aria-label="${item.name}" title="${item.name}"><span class="swatch" style="${swatch}"></span></button>`;
  }).join('');
  return `<div class="row">${buttons}</div>`;
}

function bezelRows(bezels) {
  return ['aluminium', 'ceramic'].map((material) => {
    const label = material === 'ceramic' ? 'Ceramic' : 'Aluminium';
    const items = bezels.filter((item) => item.material === material);
    if (!items.length) return '';
    const buttons = items.map((item) => {
      const on = state.bezel === item.id;
      return `<button type="button" class="chip" data-key="bezel" data-value="${item.id}" aria-pressed="${on}" aria-label="${label} ${item.name}" title="${label} · ${item.name}"><span class="swatch${material === 'ceramic' ? ' gloss' : ''}" style="background:${item.colour}"></span></button>`;
    }).join('');
    return `<div class="row bezels"><span class="kind">${label}</span>${buttons}</div>`;
  }).join('');
}

nightButton.addEventListener('click', () => {
  state = { ...state, night: !state.night };
  commit();
});

movementButton.addEventListener('click', () => {
  state = { ...state, view: state.view === 'back' ? 'front' : 'back' };
  commit();
});

window.addEventListener('hashchange', () => {
  state = stateFromHash(location.hash);
  commit({ immediate: true });
});

commit({ immediate: true });
