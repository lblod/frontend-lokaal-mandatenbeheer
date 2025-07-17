import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';

import {
  API,
  INPUT_DEBOUNCE,
  JSON_API_TYPE,
} from 'frontend-lmb/utils/constants';

import {} from 'reactiveweb/function';
import { task, timeout } from 'ember-concurrency';

export default class PredicaatInput extends Component {
  @tracked uri;
  @tracked errorMessage;

  get predicaatUri() {
    return this.uri || this.args.value;
  }

  onUpdate = task({ restartable: true }, async (event) => {
    await timeout(INPUT_DEBOUNCE);
    const inputUri = event.target?.value;

    if (!inputUri) {
      this.errorMessage = 'Dit veld is verplicht';
      this.args.onUpdate?.(inputUri, false);
      return;
    }

    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form/field/is-uri-allowed-as-path`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          uri: inputUri.trim(),
          formId: this.args.formId,
          fieldUri: this.args.fieldUri,
        }),
      }
    );
    const jsonResponse = await response.json();
    if (!response.ok) {
      console.error({ jsonResponse });
    }

    this.errorMessage = jsonResponse?.errorMessage;
    const isValid = jsonResponse?.isValid;
    if (isValid) {
      this.uri = inputUri.trim();
    }
    this.args.onUpdate?.(isValid ? this.uri : inputUri, isValid);
  });
}
