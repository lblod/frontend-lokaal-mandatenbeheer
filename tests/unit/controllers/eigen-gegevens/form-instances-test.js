import { module, test } from 'qunit';
import { setupTest } from 'frontend-lmb/tests/helpers';

module('Unit | Controller | eigen-gegevens/form-instances', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup(
      'controller:eigen-gegevens/form-instances'
    );
    assert.ok(controller);
  });
});
