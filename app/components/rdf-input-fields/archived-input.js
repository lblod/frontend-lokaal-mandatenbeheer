import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';

export default class RDFArchivedInput extends InputFieldComponent {
  inputId = 'archived-' + guidFor(this);

  @service store;
  @tracked active;

  constructor() {
    super(...arguments);
    this.loadProvidedValue();
  }

  get label() {
    return this.args.field.label || 'Actief?';
  }

  async loadProvidedValue() {
    const matches = triplesForPath(this.storeOptions);
    if (matches.values.length > 0) {
      this.active = !matches.values[0].object.value;
    } else {
      this.active = true;
    }
  }

  @action
  async toggleActive(newActive) {
    this.active = newActive;

    this.updateValidations();

    const newArchivedDate = this.active ? null : new Date().toISOString();
    replaceSingleFormValue(this.storeOptions, newArchivedDate);

    this.hasBeenFocused = true;
  }
}
