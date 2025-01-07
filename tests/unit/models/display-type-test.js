import { module, test } from 'qunit';

import { setupTest } from 'frontend-lmb/tests/helpers';

module('Unit | Model | display type', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('display-type', {});
    assert.ok(model);
  });
});
