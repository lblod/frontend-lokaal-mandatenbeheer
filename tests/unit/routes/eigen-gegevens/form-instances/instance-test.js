import { module, test } from 'qunit';
import { setupTest } from 'frontend-lmb/tests/helpers';

module(
  'Unit | Route | eigen-gegevens/form-instances/instance',
  function (hooks) {
    setupTest(hooks);

    test('it exists', function (assert) {
      let route = this.owner.lookup(
        'route:eigen-gegevens/form-instances/instance'
      );
      assert.ok(route);
    });
  }
);
