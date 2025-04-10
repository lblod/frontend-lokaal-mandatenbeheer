import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | custom-form/link-to-form-instance',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<CustomForm::LinkToFormInstance />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`<CustomForm::LinkToFormInstance>
  template block text
</CustomForm::LinkToFormInstance>`);

      assert.dom().hasText('template block text');
    });
  }
);
