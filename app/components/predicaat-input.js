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
  @tracked isValidUri = true;
  @tracked isAllowed = true;

  get predicaatUri() {
    return this.uri || this.args.value;
  }

  onUpdate = task({ restartable: true }, async (event) => {
    this.uri = event.target?.value;
    this.args.onUpdate?.(this.uri, false);
    await timeout(INPUT_DEBOUNCE);

    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form/field/is-uri-allowed-as-path`,
      {
        method: 'POST',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
        body: JSON.stringify({
          uri: this.uri,
        }),
      }
    );
    const jsonResponse = await response.json();
    if (!response.ok) {
      console.error({ jsonResponse });
    }

    this.isValidUri = jsonResponse?.isValidUri;
    this.isAllowed = this.isValidUri ? jsonResponse?.isAllowed : true;

    this.args.onUpdate?.(this.uri, this.isValidUri && this.isAllowed);
  });
}
