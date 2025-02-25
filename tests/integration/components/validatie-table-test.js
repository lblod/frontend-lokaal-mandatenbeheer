import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-lmb/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

// Stub validatie service
class ValidatieStub extends Service {
  latestValidationReport = {};
}

module('Integration | Component | validatie-table', function (hooks) {
  setupRenderingTest(hooks);

  let store, mandataris;

  hooks.beforeEach(function () {
    // Registering the stubbed validatie service
    this.owner.register('service:validatie', ValidatieStub);
    this.set('validatie', this.owner.lookup('service:validatie'));

    // Setting up store and creating a mandataris record as instance to test
    store = this.owner.lookup('service:store');
    mandataris = store.createRecord('mandataris', {
      rangorde: 1,
      start: new Date(2022, 0, 1), // January 1, 2022
      uri: 'http://example.com/mandataris/1',
      linkToBesluit: 'http://example.com/besluit/1',
      modified: new Date(),
      effectiefAt: new Date(),
    });
    this.set('instance', mandataris);

    // Enable shacl-report feature service
    this.set('features', this.owner.lookup('service:features'));
    this.set('features.isEnabled', function (feature) {
      if (feature === 'shacl-report') {
        return true;
      }
      return false;
    });
  });

  test('mandataris instance exists', function (assert) {
    assert.ok(this.instance, 'Mandataris instance is created');
  });

  test('it does not render ValidatieTable when instance does not have results', async function (assert) {
    this.set('validatie.getResultsByInstance', async function () {
      return [];
    });

    await render(hbs`<ValidatieTable @instance={{this.instance}} />`);

    assert
      .dom('[data-test-validatie-table]')
      .doesNotExist(
        'ValidatieTable component is not rendered when results are empty'
      );
  });

  test('it does render ValidatieTable when instance has validation results', async function (assert) {
    // Stubbing the validatie service to return validation results
    this.set('validatie.getResultsByInstance', async function () {
      return [
        {
          focusNode: 'http://example.com/mandataris/1',
          resultMessage: 'Validation error occurred',
          targetClassOfFocusNode:
            'http://data.vlaanderen.be/ns/mandaat#Mandataris',
          focusNodeId: '123',
        },
      ];
    });

    await render(hbs`<ValidatieTable @instance={{this.instance}} />`);

    assert
      .dom('[data-test-validatie-table]')
      .exists('ValidatieTable component is rendered when results are present');
  });
});
