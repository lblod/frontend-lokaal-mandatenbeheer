import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | codelijst/name-input', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Codelijst::NameInput />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`<Codelijst::NameInput>
  template block text
</Codelijst::NameInput>`);

    assert.dom().hasText('template block text');
  });
});
