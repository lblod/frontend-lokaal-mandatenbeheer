import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { service } from '@ember/service';

const OFFENDING_STATUS_CODES = [401, 403];

export default class ApplicationAdapter extends JSONAPIAdapter {
  @service validatie;
  constructor() {
    super(...arguments);
    this.monkeyPatchFetch();
  }

  monkeyPatchFetch() {
    const originalFetch = window.fetch;
    const router = this.router;
    const validatie = this.validatie;
    const self = this;
    window.fetch = async function () {
      const response = await self.withRetries(
        arguments[0],
        arguments[1],
        originalFetch
      );
      if (OFFENDING_STATUS_CODES.indexOf(response?.status) > -1) {
        router.transitionTo('session-expired');
      }
      if (
        arguments[1] &&
        arguments[1].method != 'GET' &&
        [
          'validation-report-api/reports/generate',
          '/mock/sessions',
          '/mock/sessions/current',
          '/sessions/current',
          '/sessions',
        ].indexOf(arguments[0]) < 0 &&
        arguments[0].indexOf('http') !== 0
      ) {
        validatie.queueValidatie.perform();
      }
      return response;
    };
  }

  async withRetries(url, options, originalFetch) {
    const newOptions = { ...(options || { method: 'GET' }) };
    if (['GET', 'PATCH', 'PUT'].indexOf(newOptions.method) < 0) {
      return originalFetch(url, newOptions);
    }
    const timeout = {
      GET: 3000,
      PATCH: 1000,
      PUT: 3000,
    };
    let retries = 3;
    let response = null;
    let abortionTimeout = null;
    while (retries > 0 && !response?.ok) {
      if (retries > 1) {
        response = null;
        const aborter = new AbortController();
        newOptions.signal = aborter.signal;
        // need to do manual timeout handling because we don't want the body to
        // be cancelled if it's not been read yet but the request has succeeded
        // this is the default behavior of AbortSignal.timeout
        abortionTimeout = setTimeout(() => {
          if (!response) {
            aborter.abort();
          }
        }, timeout[newOptions.method] || 1000);
      } else {
        // if it's our last shot, try without timeout
        newOptions.signal = undefined;
      }
      try {
        response = await originalFetch(url, newOptions);
        if (abortionTimeout) {
          clearTimeout(abortionTimeout);
        }

        if (response.ok) {
          return response;
        } else {
          retries = retries - 1;
        }
      } catch (error) {
        retries = retries - 1;
        console.error(
          `Fetch failed (${retries} left) for ${url} with error:`,
          error
        );
      }
    }
    if (!response) {
      throw new Error(`Failed to fetch ${url} after retries.`);
    }
    return response;
  }

  @service router;
  handleResponse(status, headers, payload, requestData) {
    if (OFFENDING_STATUS_CODES.indexOf(status) > -1) {
      this.router.transitionTo('session-expired');
    }
    return super.handleResponse(status, headers, payload, requestData);
  }
}
