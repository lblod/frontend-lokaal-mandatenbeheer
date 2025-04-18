import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | refresh-validations-button',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<RefreshValidationsButton />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`<RefreshValidationsButton>
  template block text
</RefreshValidationsButton>`);

      assert.dom().hasText('template block text');
    });
  }
);
