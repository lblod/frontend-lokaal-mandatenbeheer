import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | rdf-input-field/custom-concept-scheme-selector-input',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await render(hbs`<RdfInputField::CustomConceptSchemeSelectorInput />`);

      assert.dom().hasText('');

      // Template block usage:
      await render(hbs`<RdfInputField::CustomConceptSchemeSelectorInput>
  template block text
</RdfInputField::CustomConceptSchemeSelectorInput>`);

      assert.dom().hasText('template block text');
    });
  }
);
