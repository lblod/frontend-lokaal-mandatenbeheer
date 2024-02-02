import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';

export default class AddressSelectorComponent extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service store;

  @tracked address = null;
  @tracked initialized = false;

  constructor() {
    super(...arguments);
    this.load();
  }

  async load() {
    await this.loadProvidedValue();
    this.initialized = true;
  }

  async loadProvidedValue() {
    const addressTriples = triplesForPath(this.storeOptions, false).values;
    if (!addressTriples.length) {
      return;
    }
    const addressUri = addressTriples[0].value;

    const matches = await this.store.query('adres', {
      'filter[:uri:]': addressUri,
    });
    this.address = matches.at(0);
  }

  @action
  async updateAddress(addressFields) {
    // we will create and destroy a lot of records here. This isn't a problem as the address seems to be a very
    // fleeting concept already in the loket app. Addresses are created without checking for existence.
    // This does mean that it will not be easy to find different instances using the same address though, but
    // this already cannot be done using the loket data.
    const newAddress = this.store.createRecord('adres', {
      ...(addressFields || {}),
    });
    const addressWithUri = await newAddress.save();
    const uri = addressWithUri.uri;
    // TODO need a service to clean up unused address records since we're always creating a new one
    replaceSingleFormValue(this.storeOptions, new NamedNode(uri));
    this.hasBeenFocused = true;
    super.updateValidations();
  }
}
