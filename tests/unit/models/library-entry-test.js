import { module, test } from 'qunit';

import { setupTest } from 'frontend-lmb/tests/helpers';

module('Unit | Model | library entry', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('library-entry', {});
    assert.ok(model);
  });
});
