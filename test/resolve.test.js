import assert from 'node:assert/strict';
import test from 'node:test';
import { CATALOG } from '../src/config.js';
import { hashFromState, resolveLook, stateFromHash } from '../src/state.js';

test('brushed steel keeps the satin roughness and the bracelet', () => {
  const look = resolveLook(CATALOG, {
    shape: 'round',
    finish: 'brushed',
    metal: 'steel',
    bezel: 'alu-black',
    dial: 'ink',
    strap: 'bracelet',
  });
  assert.equal(look.caseRoughness, CATALOG.metals[0].look.satin);
  assert.equal(look.brushStrength, 1);
  assert.equal(look.showBracelet, true);
  assert.equal(look.bezelCeramic, false);
});

test('polished gold with a rubber strap switches finish and strap mesh', () => {
  const gold = CATALOG.metals.find((item) => item.id === 'gold');
  const look = resolveLook(CATALOG, {
    shape: 'cushion',
    finish: 'polished',
    metal: 'gold',
    bezel: 'cer-sand',
    dial: 'sand',
    strap: 'rubber-olive',
  });
  assert.equal(look.caseRoughness, gold.look.gloss);
  assert.equal(look.brushStrength, 0);
  assert.equal(look.bezelCeramic, true);
  assert.equal(look.showBracelet, false);
  assert.equal(look.rubberColor, '#505a3c');
  assert.equal(look.dial.look.sub, undefined);
});

test('every case shape carries the measurements the mesh builder reads', () => {
  const ids = CATALOG.shapes.map((shape) => shape.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const shape of CATALOG.shapes) {
    assert.ok(shape.opening > 10, shape.id);
    assert.ok(shape.lugReach > shape.opening, shape.id);
    assert.ok(shape.bezelOuter > shape.bezelInner, shape.id);
    if (shape.kind === 'circle') assert.ok(shape.radius > shape.opening, shape.id);
    if (shape.kind === 'rounded') {
      assert.ok(shape.width > shape.opening * 2, shape.id);
      assert.ok(shape.height > shape.opening * 2, shape.id);
      assert.ok(shape.corner >= 0, shape.id);
    }
  }
});

test('a shared hash restores known ids and drops unknown ones', () => {
  const state = stateFromHash('#metal=nope&dial=harbor&night=1&view=back&bezel=alu-green');
  assert.equal(state.metal, 'steel');
  assert.equal(state.dial, 'harbor');
  assert.equal(state.bezel, 'alu-green');
  assert.equal(state.night, true);
  assert.equal(state.view, 'back');
  assert.equal(stateFromHash('#' + hashFromState(state)).dial, 'harbor');
});
