import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';

import { NamedNode } from 'rdflib';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import { consume } from 'ember-provide-consume-context';
import { task } from 'ember-concurrency';

import { API, JSON_API_TYPE } from 'frontend-lmb/utils/constants';

export default class CustomFormLinkToFormInstance extends InputFieldComponent {
  @service store;
  @service semanticFormRepository;

  formTypeId = 'persoon';

  @consume('form-context') formContext;

  @tracked selectedInstances = A([]);
  @tracked instanceDisplayLabels = ['Voornaam', 'Achternaam'];

  constructor() {
    super(...arguments);
    this.getSelectedValues.perform();
  }

  get title() {
    return this.args.field?.label || 'Persoon';
  }

  async fetchInstancesForUris(uris) {
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/${this.formTypeId}/get-instances-by-uri`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          labels: [], // use default
          uris,
        }),
      }
    );
    if (!response.ok) {
      console.error(
        `Er ging iets mis bij het ophalen van instances met uris ${uris.split(', ')}`
      );
      return null;
    }

    return await response.json();
  }

  getSelectedValues = task(async () => {
    const matches = triplesForPath(this.storeOptions);
    if (matches.values.length > 0) {
      const selectedInstanceUris = matches.values.map((v) => v.value);
      const formInfo = await this.fetchInstancesForUris(selectedInstanceUris);

      if (formInfo.instances.length === 0) {
        return;
      }

      const selected = [...formInfo.instances];
      selected.sort((a, b) => {
        if (a.Achternaam === b.Achternaam) {
          return a.Voornaam.localeCompare(b.Voornaam);
        } else {
          return a.Achternaam.localeCompare(b.Achternaam);
        }
      });

      this.selectedInstances = selected;
    } else {
      this.selectedInstances = [];
    }
  });

  @action
  onPersonSelect(person) {
    const uri = person?.uri;

    updateSimpleFormValue(this.storeOptions, new NamedNode(uri));

    this.hasBeenFocused = true;
    super.updateValidations();
    this.getSelectedValues.perform();
  }

  @action
  removePerson(person) {
    const matches = triplesForPath(this.storeOptions).values;
    matches
      .filter((m) => person.uri === m.value)
      .forEach((m) => updateSimpleFormValue(this.storeOptions, undefined, m));

    this.hasBeenFocused = true;
    super.updateValidations();
    this.getSelectedValues.perform();
  }
}
