import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class MultiUriFetcherService extends Service {
  @service store;

  async fetchUris(type, uris, options = {}) {
    return Promise.all(uris.map((uri) => this.fetchUri(type, uri, options)));
  }

  // TODO we want to do this with one call, something like the following unfortunately this doesn't work at this moment.
  // const url = `${instanceApiUrl}?filter[:uri:]=uri1,uri2`;
  // const url = `${instanceApiUrl}?filter[:or:][:uri:]=uri1&[:or:][:uri:]=uri2`;
  async fetchUri(type, uri, options = {}) {
    const queryOptions = { ...options };
    queryOptions.filter = options.filter || {};
    queryOptions.filter[':uri:'] = uri;
    const result = await this.store.query(type, queryOptions);
    return result[0];
  }
}
