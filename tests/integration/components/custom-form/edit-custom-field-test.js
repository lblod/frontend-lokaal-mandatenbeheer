import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | custom-form/edit-custom-field',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<CustomForm::EditCustomField />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`<CustomForm::EditCustomField>
  template block text
</CustomForm::EditCustomField>`);

      assert.dom().hasText('template block text');
    });
  }
);
