import { module, test } from 'qunit';
import { setupTest } from 'frontend-lmb/tests/helpers';

module('Unit | Route | verkiezingen/verkiezingsuitslag', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:verkiezingen/verkiezingsuitslag');
    assert.ok(route);
  });
});
