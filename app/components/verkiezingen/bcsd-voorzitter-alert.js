import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { findFirst } from 'frontend-lmb/utils/async-array-functions';
import { queryRecord } from 'frontend-lmb/utils/query-record';
import { VOORZITTER_BCSD_CODE } from 'frontend-lmb/utils/well-known-uris';

export default class VerkiezingenBcsdVoorzitterAlertComponent extends Component {
  @tracked errorMessage = '';

  get bcsdBestuursorgaanInTijd() {
    return this.args.bcsdBestuursorgaanInTijd;
  }

  get bestuursorganenInTijd() {
    return this.args.bestuursorganenInTijd;
  }

  async getVoorzitterBCSD() {
    return await queryRecord(this.store, 'persoon', {
      filter: {
        'is-aangesteld-als': {
          bekleedt: {
            bestuursfunctie: {
              ':uri:': VOORZITTER_BCSD_CODE,
            },
            'bevat-in': {
              ':uri:': this.bcsdBestuursorgaanInTijd.uri,
            },
          },
        },
      },
    });
  }

  async isMemberOfRMW() {
    const rmw = await findFirst(
      this.bestuursorganenInTijd,
      async (bestuursorgaanInTijd) => {
        await bestuursorgaanInTijd.isMemberOfRMW;
      }
    );
  }
}
