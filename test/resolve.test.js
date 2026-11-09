import assert from 'node:assert/strict';
import test from 'node:test';
import { CATALOG } from '../src/config.js';
import { hashFromState, resolveLook, stateFromHash } from '../src/state.js';

test('brushed steel keeps the satin roughness and the bracelet', () => {
  const look = resolveLook(CATALOG, {
    shape: 'octagon',
    finish: 'brushed',
    metal: 'silver',
    bezel: 'case',
    dial: 'black',
    strap: 'bracelet',
  });
  const steel = CATALOG.metals.find((item) => item.id === 'silver');
  assert.equal(look.caseRoughness, steel.look.satin);
  assert.equal(look.caseColor, steel.look.metal);
  assert.equal(look.brushStrength, 1);
  assert.equal(look.showBracelet, true);
  assert.equal(look.bezelCeramic, false);
});

test('polished gold with a rubber strap switches finish and strap mesh', () => {
  const gold = CATALOG.metals.find((item) => item.id === 'gold');
  const look = resolveLook(CATALOG, {
    shape: 'octagon',
    finish: 'polished',
    metal: 'gold',
    bezel: 'case',
    dial: 'green',
    strap: 'rubber-black',
  });
  assert.equal(look.caseRoughness, gold.look.gloss);
  assert.equal(look.brushStrength, 0);
  assert.equal(look.showBracelet, false);
  assert.equal(look.rubberColor, '#26282c');
  assert.equal(look.dial.look.sub, undefined);
  assert.equal(look.dial.look.top, '#2b8553');
});

test('a chrono ceramic bezel and a subdial stay on that family', () => {
  const look = resolveLook(CATALOG, {
    shape: 'chrono',
    finish: 'brushed',
    metal: 'rosegold',
    bezel: 'cer-blue',
    dial: 'ch-yellow',
    strap: 'rubber-blue',
  });
  assert.equal(look.bezelCeramic, true);
  assert.equal(look.bezelColor, '#101d3c');
  assert.equal(look.dial.family, 'chrono');
  assert.equal(look.dial.look.top, '#ddbf43');
  assert.ok(look.dial.look.sub);
  assert.equal(look.rubberColor, '#1f3a72');
});

test('every case shape carries the measurements the mesh builder reads', () => {
  const ids = CATALOG.shapes.map((shape) => shape.id);
  assert.deepEqual(ids, ['octagon', 'diver', 'chrono']);
  for (const shape of CATALOG.shapes) {
    assert.ok(shape.opening > 10, shape.id);
    assert.ok(shape.lugReach > shape.opening, shape.id);
    assert.ok(shape.bezelOuter > shape.bezelInner, shape.id);
    assert.ok(shape.bezels.length >= 1, shape.id);
    if (shape.kind === 'circle') assert.ok(shape.radius > shape.opening, shape.id);
    if (shape.kind === 'polygon') {
      assert.ok(shape.sides >= 3, shape.id);
      assert.ok(shape.radius > shape.opening, shape.id);
    }
  }
});

test('the public hash maps onto our ids and keeps the color model', () => {
  const state = stateFromHash('#style=s2268&finish=brushed&case=black&dial=black&strap=rubber-black&mode=conversion');
  assert.equal(state.shape, 'octagon');
  assert.equal(state.finish, 'brushed');
  assert.equal(state.metal, 'black');
  assert.equal(state.dial, 'black');
  assert.equal(state.strap, 'rubber-black');
  const look = resolveLook(CATALOG, state);
  assert.equal(look.caseColor, '#3a3c40');
  assert.equal(look.dial.look.top, '#393b41');
  assert.equal(look.dial.look.bottom, '#15130e');
  assert.equal(stateFromHash('#' + hashFromState(state)).dial, 'black');
});

test('an unknown dial falls back inside the active family', () => {
  const state = stateFromHash('#shape=diver&metal=nope&dial=harbor&night=1&view=back');
  assert.equal(state.metal, 'silver');
  assert.equal(state.shape, 'diver');
  assert.equal(state.dial, 'diver-navy');
  assert.equal(state.night, true);
  assert.equal(state.view, 'back');
});
