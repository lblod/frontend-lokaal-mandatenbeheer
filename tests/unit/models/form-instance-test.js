import { module, test } from 'qunit';

import { setupTest } from 'frontend-loket/tests/helpers';

module('Unit | Model | form instance', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('form-instance', {});
    assert.ok(model);
  });
});
