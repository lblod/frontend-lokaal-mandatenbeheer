import { module, test } from 'qunit';
import { setupTest } from 'frontend-lmb/tests/helpers';

module(
  'Unit | Controller | custom-forms/instances/definition',
  function (hooks) {
    setupTest(hooks);

    // TODO: Replace this with your real tests.
    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:custom-forms/instances/definition'
      );
      assert.ok(controller);
    });
  }
);
