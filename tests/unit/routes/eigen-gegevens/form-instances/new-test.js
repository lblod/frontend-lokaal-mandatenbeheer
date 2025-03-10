import { module, test } from 'qunit';
import { setupTest } from 'frontend-lmb/tests/helpers';

module('Unit | Route | eigen-gegevens/form-instances/new', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:eigen-gegevens/form-instances/new');
    assert.ok(route);
  });
});
