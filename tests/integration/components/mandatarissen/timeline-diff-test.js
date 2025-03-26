import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | mandatarissen/timeline-diff',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<Mandatarissen::TimelineDiff />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`<Mandatarissen::TimelineDiff>
  template block text
</Mandatarissen::TimelineDiff>`);

      assert.dom().hasText('template block text');
    });
  }
);
