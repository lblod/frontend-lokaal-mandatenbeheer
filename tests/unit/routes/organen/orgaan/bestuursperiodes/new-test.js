import { module, test } from 'qunit';
import { setupTest } from 'frontend-lmb/tests/helpers';

module('Unit | Route | organen/orgaan/bestuursperiodes/new', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:organen/orgaan/bestuursperiodes/new');
    assert.ok(route);
  });
});
