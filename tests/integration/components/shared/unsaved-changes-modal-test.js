import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | shared/unsaved-changes-modal',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<Shared::UnsavedChangesModal />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`<Shared::UnsavedChangesModal>
  template block text
</Shared::UnsavedChangesModal>`);

      assert.dom().hasText('template block text');
    });
  }
);
