import { module, test } from 'qunit';
import { setupTest } from 'frontend-lmb/tests/helpers';

module('Unit | Route | mandatenbeheer/bestuursorganen/edit', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:mandatenbeheer/bestuursorganen/edit');
    assert.ok(route);
  });
});
