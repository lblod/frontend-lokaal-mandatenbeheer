import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { findFirst } from 'frontend-lmb/utils/async-array-functions';
import { queryRecord } from 'frontend-lmb/utils/query-record';
import {
  LID_VAST_BUREAU_CODE,
  MANDAAT_LID_RMW_CODE,
  VOORZITTER_BCSD_CODE,
} from 'frontend-lmb/utils/well-known-uris';

export default class VerkiezingenBcsdVoorzitterAlertComponent extends Component {
  @service store;

  @tracked errorMessage = '';

  get bcsdBestuursorgaanInTijd() {
    return this.args.bcsdBestuursorgaanInTijd;
  }

  get bestuursorganenInTijd() {
    return this.args.bestuursorganenInTijd;
  }

  // Polling because otherwise changes in the installatievergadering data are not picked up
  handleErrorMessage = task({ restartable: true }, async () => {
    if (this.isDestroyed) {
      return;
    }

    const voorzitter = await this.getVoorzitterBCSD();
    if (!voorzitter) {
      return;
    }
    const isMemberOfRMW = await this.isMemberOfRMW(voorzitter);
    const isMemberOfVastBureau = await this.isMemberOfVastBureau(voorzitter);

    this.errorMessage =
      isMemberOfRMW || isMemberOfVastBureau
        ? ''
        : 'De voorzitter van de BCSD moet lid zijn van de RMW of het Vast Bureau.';

    await timeout(10000);
    this.handleErrorMessage.perform();
  });

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

  async isMemberOfRMW(persoon) {
    const rmwInTijd = await findFirst(
      this.bestuursorganenInTijd,
      async (bestuursorgaanInTijd) => await bestuursorgaanInTijd.isRMW
    );

    if (!rmwInTijd) {
      return false;
    }

    const mandataris = await queryRecord(this.store, 'mandataris', {
      filter: {
        'is-bestuurlijke-alias-van': {
          ':uri:': persoon.uri,
        },
        bekleedt: {
          bestuursfunctie: {
            ':uri:': MANDAAT_LID_RMW_CODE,
          },
          'bevat-in': {
            ':uri:': rmwInTijd.uri,
          },
        },
      },
    });
    return Boolean(mandataris);
  }

  async isMemberOfVastBureau(persoon) {
    const vastBureauInTijd = await findFirst(
      this.bestuursorganenInTijd,
      async (bestuursorgaanInTijd) => await bestuursorgaanInTijd.isVastBureau
    );

    if (!vastBureauInTijd) {
      return false;
    }

    const mandataris = await queryRecord(this.store, 'mandataris', {
      filter: {
        'is-bestuurlijke-alias-van': {
          ':uri:': persoon.uri,
        },
        bekleedt: {
          bestuursfunctie: {
            ':uri:': LID_VAST_BUREAU_CODE,
          },
          'bevat-in': {
            ':uri:': vastBureauInTijd.uri,
          },
        },
      },
    });
    return Boolean(mandataris);
  }
}
