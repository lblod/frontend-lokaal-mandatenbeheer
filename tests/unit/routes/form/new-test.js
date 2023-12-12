import { module, test } from 'qunit';
import { setupTest } from 'frontend-loket/tests/helpers';

module('Unit | Route | form/new', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:form/new');
    assert.ok(route);
  });
});
