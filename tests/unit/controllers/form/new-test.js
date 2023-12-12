import { module, test } from 'qunit';
import { setupTest } from 'frontend-loket/tests/helpers';

module('Unit | Controller | form/new', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:form/new');
    assert.ok(controller);
  });
});
