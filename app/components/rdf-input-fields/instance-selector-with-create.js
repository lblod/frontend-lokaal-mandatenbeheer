import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import { inject as service } from '@ember/service';
import RdfInstanceSelectorComponent from './instance-selector';
import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';

export default class RdfInputFieldsInstanceSelectorWithCreateComponent extends RdfInstanceSelectorComponent {
  @service multiUriFetcher;

  @action
  async create(value) {
    let data = {
      data: {
        type: `${this.instanceApiUrl.substring(1)}`,
        attributes: {},
      },
    };
    data['data']['attributes'][`${this.instanceLabelProperty}`] = value;

    const response = await fetch(`${this.instanceApiUrl}`, {
      method: 'POST',
      headers: {
        Accept: JSON_API_TYPE,
        'Content-Type': JSON_API_TYPE,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let error = new Error(response.statusText);
      error.status = response.status;
      throw error;
    }
    const result = await response.json();
    const selection = {
      subject: new NamedNode(result.data.attributes.uri),
      label: result.data.attributes[this.instanceLabelProperty],
    };
    super.updateSelection(selection);
  }

  @action
  suggest(term) {
    return `Voeg "${term}" toe`;
  }
}
