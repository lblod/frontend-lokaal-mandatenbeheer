import { module, test } from 'qunit';
import { setupTest } from 'frontend-lmb/tests/helpers';

module('Unit | Service | decretale-organen', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:decretale-organen');
    assert.ok(service);
  });
});
