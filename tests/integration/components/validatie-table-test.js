import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | validatie-table', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<ValidatieTable />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`<ValidatieTable>
  template block text
</ValidatieTable>`);

    assert.dom().hasText('template block text');
  });
});
