import { module, test } from 'qunit';
import { setupTest } from 'frontend-lmb/tests/helpers';

module(
  'Unit | Controller | organen/orgaan/bestuursperiodes/new',
  function (hooks) {
    setupTest(hooks);

    // TODO: Replace this with your real tests.
    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:organen/orgaan/bestuursperiodes/new'
      );
      assert.ok(controller);
    });
  }
);
