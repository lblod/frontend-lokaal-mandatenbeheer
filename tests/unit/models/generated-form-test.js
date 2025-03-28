import { setupTest } from 'frontend-lmb/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Model | generated form', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('generated-form', {});
    assert.ok(model, 'model exists');
  });
});
