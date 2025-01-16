import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | read-only-field-for-display-type',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<ReadOnlyFieldForDisplayType />`);

      assert.dom(this.element).hasText('');

      // Template block usage:
      await render(hbs`<ReadOnlyFieldForDisplayType>
  template block text
</ReadOnlyFieldForDisplayType>`);

      assert.dom(this.element).hasText('template block text');
    });
  }
);
