import { CATALOG } from './config.js';
import { describe, hashFromState, stateFromHash } from './state.js';
import { createWatch } from './scene.js';

const stage = document.querySelector('#stage');
const canvas = document.querySelector('#view');
const panel = document.querySelector('#panel');
const nightButton = document.querySelector('#night');
const movementButton = document.querySelector('#movement');

const watch = createWatch(canvas);
let state = stateFromHash(location.hash);

function commit({ immediate = false } = {}) {
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
  const dial = CATALOG.dials.find((item) => item.id === state.dial);
  const bezel = CATALOG.bezels.find((item) => item.id === state.bezel);
  const strap = CATALOG.straps.find((item) => item.id === state.strap);
  const shape = CATALOG.shapes.find((item) => item.id === state.shape);
  const finish = CATALOG.finishes.find((item) => item.id === state.finish);

  panel.innerHTML = `
    <h2>Build</h2>
    <p class="sub">Pick a part. The preview keeps one watch and only changes materials, the case shape, and the strap.</p>
    ${group('Case shape', shape.name, pills('shape', CATALOG.shapes))}
    ${group('Finish', finish.name, pills('finish', CATALOG.finishes))}
    ${group('Case', metal.name, dots('metal', CATALOG.metals))}
    ${group('Bezel', `${bezel.material === 'ceramic' ? 'Ceramic' : 'Aluminium'} · ${bezel.name}`, bezelRows())}
    ${group('Dial', dial.name, dots('dial', CATALOG.dials))}
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

function bezelRows() {
  return ['aluminium', 'ceramic'].map((material) => {
    const label = material === 'ceramic' ? 'Ceramic' : 'Aluminium';
    const items = CATALOG.bezels.filter((item) => item.material === material);
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
