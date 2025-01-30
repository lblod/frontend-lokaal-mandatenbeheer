import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | instance-table-configuration',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<InstanceTableConfiguration />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`<InstanceTableConfiguration>
  template block text
</InstanceTableConfiguration>`);

      assert.dom().hasText('template block text');
    });
  }
);
