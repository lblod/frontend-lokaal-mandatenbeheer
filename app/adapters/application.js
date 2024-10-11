import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { service } from '@ember/service';

const OFFENDING_STATUS_CODES = [401, 403];

export default class ApplicationAdapter extends JSONAPIAdapter {
  constructor() {
    super(...arguments);
    this.monkeyPatchFetch();
  }

  monkeyPatchFetch() {
    const originalFetch = window.fetch;
    const router = this.router;
    window.fetch = async function () {
      const response = await originalFetch.apply(this, arguments);
      if (OFFENDING_STATUS_CODES.indexOf(response.status) > -1) {
        router.transitionTo('session-expired');
      }
      return response;
    };
  }

  @service router;
  handleResponse(status, headers, payload, requestData) {
    if (OFFENDING_STATUS_CODES.indexOf(status) > -1) {
      this.router.transitionTo('session-expired');
    }
    return super.handleResponse(status, headers, payload, requestData);
  }
}
