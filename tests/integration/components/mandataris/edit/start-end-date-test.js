import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | mandataris/edit/start-end-date',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<Mandataris::Edit::StartEndDate />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`<Mandataris::Edit::StartEndDate>
  template block text
</Mandataris::Edit::StartEndDate>`);

      assert.dom().hasText('template block text');
    });
  }
);
