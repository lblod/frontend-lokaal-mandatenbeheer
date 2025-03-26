import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | mandatarissen/timeline-card',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<Mandatarissen::TimelineCard />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`<Mandatarissen::TimelineCard>
  template block text
</Mandatarissen::TimelineCard>`);

      assert.dom().hasText('template block text');
    });
  }
);
