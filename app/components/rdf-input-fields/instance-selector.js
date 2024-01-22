import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import {
  updateSimpleFormValue,
  triplesForPath,
} from '@lblod/submission-form-helpers';
import { NamedNode, Namespace } from 'rdflib';
import { task, timeout } from 'ember-concurrency';

export default class RdfInstanceSelectorComponent extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service store;

  @tracked selected = null;
  @tracked options = [];
  @tracked searchEnabled = true;

  constructor() {
    super(...arguments);
    this.load();
  }

  async load() {
    await this.loadOptions();
    this.loadProvidedValue();
  }

  async fetchInput() {
    const formGraph = this.args.graphs.formGraph;
    const FORM = new Namespace('http://lblod.data.gift/vocabularies/forms/');

    const instanceLabelProperty = this.args.formStore.match(
      this.args.field.uri,
      FORM('instanceLabelProperty'),
      undefined,
      formGraph
    )[0].object.value;
    const instanceApiUrl = this.args.formStore.match(
      this.args.field.uri,
      FORM('instanceApiUrl'),
      undefined,
      formGraph
    )[0].object.value;

    const pageSize = 5;
    const response = await fetch(`${instanceApiUrl}?page[size]=${pageSize}`, {
      headers: {
        Accept: 'application/vnd.api+json',
      },
    });
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

  async loadOptions() {
    const instances = await this.fetchInput();
    this.options = instances;
  }

  loadProvidedValue() {
    if (this.isValid) {
      const matches = triplesForPath(this.storeOptions, true).values;
      this.selected = this.options.find((opt) =>
        matches.find((m) => m.equals(opt.subject))
      );
    }
  }

  @action
  updateSelection(option) {
    this.selected = option;

    // Cleanup old value(s) in the store
    const matches = triplesForPath(this.storeOptions, true).values;
    const matchingOptions = matches.filter((m) =>
      this.options.find((opt) => m.equals(opt.subject))
    );
    matchingOptions.forEach((m) =>
      updateSimpleFormValue(this.storeOptions, undefined, m)
    );

    // Insert new value in the store
    if (option) {
      updateSimpleFormValue(this.storeOptions, option.subject);
    }

    this.hasBeenFocused = true;
    super.updateValidations();
  }

  @task(function* (term) {
    yield timeout(200);
    // let url = `${instanceApiUrl}?page[size]=${pageSize}`;
    // let url = `/fracties?page[size]=5?filter=${term}`;
    let url = `/fracties?filter=${term}`;
    return fetch(url, {
      headers: {
        Accept: 'application/vnd.api+json',
      },
    })
      .then((resp) => resp.json())
      .then((json) => json.data)
      .then((data) =>
        data.map((m) => {
          const subject = new NamedNode(m.attributes['uri']);
          return {
            subject: subject,
            label: m.attributes['naam'],
          };
        })
      );
  })
  searchRepo;
}
