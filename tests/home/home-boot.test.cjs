const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../../assets/js/home-core.js');
const homeBoot = require('../../_data/homeBoot.js');

test('HOME-68: the boot data hands the layout the session key home-core uses', () => {
  assert.equal(core.BOOT_KEY, 'id-home-booted');
  assert.equal(homeBoot().key, core.BOOT_KEY);
});
