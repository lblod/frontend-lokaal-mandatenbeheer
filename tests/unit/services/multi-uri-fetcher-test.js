import { module, test } from 'qunit';
import { setupTest } from 'frontend-lmb/tests/helpers';

module('Unit | Service | multi-uri-fetcher', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:multi-uri-fetcher');
    assert.ok(service);
  });
});
