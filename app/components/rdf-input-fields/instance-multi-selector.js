import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import {
  triplesForPath,
  updateSimpleFormValue,
} from '@lblod/submission-form-helpers';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { restartableTask, timeout } from 'ember-concurrency';
import { NamedNode, Namespace } from 'rdflib';

export default class RdfInstanceMultiSelectorComponent extends InputFieldComponent {
  inputId = 'select-' + guidFor(this);

  @tracked selected = null;
  @tracked options = [];
  @tracked searchEnabled = true;

  get subset() {
    return this.options.slice(0, 50);
  }

  constructor() {
    super(...arguments);
    this.load();
  }

  async load() {
    await this.loadOptions();
    this.loadProvidedValue();
  }

  async loadOptions() {
    const instanceLabelProperty = this.getFormProperty('instanceLabelProperty');
    const instanceApiUrl = this.getFormProperty('instanceApiUrl');

    const pageSize = 5;
    const response = await fetch(`${instanceApiUrl}?page[size]=${pageSize}`, {
      headers: {
        Accept: 'application/vnd.api+json',
      },
    });

    this.options = await this.parseResponse(response, instanceLabelProperty);
  }

  loadProvidedValue() {
    if (this.isValid) {
      const matches = triplesForPath(this.storeOptions, true).values;
      this.selected = this.options.filter((opt) =>
        matches.find((m) => m.equals(opt.subject))
      );
    }
  }

  @action
  updateSelection(options) {
    this.selected = options;

    // Retrieve options in store
    const matches = triplesForPath(this.storeOptions, true).values;
    const matchingOptions = matches.filter((m) =>
      this.options.find((opt) => m.equals(opt.subject))
    );

    // Cleanup old value(s) in the store
    matchingOptions
      .filter((m) => !options.find((opt) => m.equals(opt.subject)))
      .forEach((m) => updateSimpleFormValue(this.storeOptions, undefined, m));

    // Insert new value in the store
    options
      .filter((opt) => !matchingOptions.find((m) => opt.subject.equals(m)))
      .forEach((option) =>
        updateSimpleFormValue(this.storeOptions, option.subject)
      );

    this.hasBeenFocused = true;
    super.updateValidations();
  }

  search = restartableTask(async (term) => {
    await timeout(200);

    const instanceLabelProperty = this.getFormProperty('instanceLabelProperty');
    const instanceApiUrl = this.getFormProperty('instanceApiUrl');

    const url = `${instanceApiUrl}?filter=${term}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.api+json',
      },
    });
    return await this.parseResponse(response, instanceLabelProperty);
  });

  getFormProperty(property) {
    const formGraph = this.args.graphs.formGraph;
    const FORM = new Namespace('http://lblod.data.gift/vocabularies/forms/');

    return this.args.formStore.match(
      this.args.field.uri,
      FORM(property),
      undefined,
      formGraph
    )[0].object.value;
  }

  async parseResponse(response, instanceLabelProperty) {
    if (!response.ok) {
      let error = new Error(response.statusText);
      error.status = response.status;
      throw error;
    }
    const result = await response.json();
    const options = result.data.map((m) => {
      const subject = new NamedNode(m.attributes['uri']);
      return { subject: subject, label: m.attributes[instanceLabelProperty] };
    });
    return options;
  }
}
