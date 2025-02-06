import { module, test } from 'qunit';
import { setupTest } from 'frontend-lmb/tests/helpers';

module('Unit | Controller | codelijsten/new', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:codelijsten/new');
    assert.ok(controller);
  });
});
