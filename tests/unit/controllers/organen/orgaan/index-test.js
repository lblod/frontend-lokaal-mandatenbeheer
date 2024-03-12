import { module, test } from 'qunit';
import { setupTest } from 'frontend-lmb/tests/helpers';

module('Unit | Controller | organen/orgaan/index', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:organen/orgaan/index');
    assert.ok(controller);
  });
});
