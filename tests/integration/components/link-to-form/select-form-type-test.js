import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | link-to-form/select-form-type',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<LinkToForm::SelectFormType />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`<LinkToForm::SelectFormType>
  template block text
</LinkToForm::SelectFormType>`);

      assert.dom().hasText('template block text');
    });
  }
);
