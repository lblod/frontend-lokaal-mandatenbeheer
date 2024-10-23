import Component from '@glimmer/component';

import { service } from '@ember/service';

import { task } from 'ember-concurrency';

export default class DownloadMandatarissenFromTableComponent extends Component {
  @service('mandataris-api') mandatarisApi;

  download = task(async () => {
    await this.mandatarisApi.downloadAsCsv({
      bestuursperiodeId: this.args.bestuursperiode?.id,
      activeOnly: this.args.activeOnly,
    });
  });
}
