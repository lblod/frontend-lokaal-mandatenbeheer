import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { getBestuursorganenMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { buildNewMandatarisSourceTtl } from 'frontend-lmb/utils/build-new-mandataris-source-ttl';
import { syncNewMandatarisMembership } from 'frontend-lmb/utils/sync-new-mandataris-membership';
import {
  BURGEMEESTER_BESTUURSORGAAN_URI,
  RMW_BESTUURSORGAAN_URI,
  VB_BESTUURSORGAAN_URI,
} from 'frontend-lmb/utils/well-known-uris';

const CREATE_MODE = 'create';

export default class PrepareLegislatuurSectionComponent extends Component {
  @service toaster;
  @service store;
  @service router;

  @tracked editMode = null;

  @action
  createMandataris() {
    this.editMode = CREATE_MODE;
  }

  get isCreating() {
    return this.editMode === CREATE_MODE;
  }

  get isBurgemeester() {
    return this.args.bestuursorgaan.hasBestuursorgaanClassificatie(
      BURGEMEESTER_BESTUURSORGAAN_URI
    );
  }

  get isRMW() {
    return this.args.bestuursorgaan.hasBestuursorgaanClassificatie(
      RMW_BESTUURSORGAAN_URI
    );
  }
  get isLidVanVB() {
    return this.args.bestuursorgaan.hasBestuursorgaanClassificatie(
      VB_BESTUURSORGAAN_URI
    );
  }

  mirrorTable = restartableTask(async () => {
    const bestuursorganen = this.args.bestuursorganen;
    let syncId = null;
    if (await this.isRMW) {
      syncId = RMW_BESTUURSORGAAN_URI;
    }
    if (await this.isLidVanVB) {
      syncId = VB_BESTUURSORGAAN_URI;
    }

    const bestuursorgaan = bestuursorganen.find(
      async (bestuursorgaan) =>
        (await bestuursorgaan.classificatie.uri) == syncId
    );

    if (!bestuursorgaan) {
      throw `Could not sync`;
    }

    const mandatarissenToSyncWith =
      await this.getBestuursorgaanMandatarissen(bestuursorgaan);
    const currentMandatarissen = await this.getBestuursorgaanMandatarissen(
      this.args.bestuursorgaan
    );

    for (const mandatarisToAdd of mandatarissenToSyncWith) {
      const isAlreadyAdded = currentMandatarissen.find(
        (mandataris) => mandataris.id == mandatarisToAdd.id
      );

      if (isAlreadyAdded) {
        continue;
      }

      const mandaatOfMandatarisToAdd = await mandatarisToAdd.bekleedt;

      const mandaten = await this.args.bestuursorgaan.bevat;
      mandaten.pushObject(mandaatOfMandatarisToAdd);
      await mandaten.save();
    }
  });

  async getBestuursorgaanMandatarissen(bestuursorgaan) {
    const queryParams = {
      page: {
        number: 0,
        size: 9999,
      },
      filter: {
        bekleedt: {
          'bevat-in': {
            id: bestuursorgaan.id,
          },
        },
      },
      include: [
        'is-bestuurlijke-alias-van',
        'bekleedt.bestuursfunctie',
        'heeft-lidmaatschap.binnen-fractie',
        'status',
        'beleidsdomein',
      ].join(','),
    };

    return await this.store.query('mandataris', queryParams);
  }

  @action
  cancel() {
    this.editMode = null;
  }

  @action
  async onCreate({ instanceTtl, instanceId }) {
    this.editMode = null;
    await syncNewMandatarisMembership(this.store, instanceTtl, instanceId);
    setTimeout(() => this.router.refresh(), 1000);
  }

  @action
  async buildSourceTtl(instanceUri) {
    return await buildNewMandatarisSourceTtl(this.store, instanceUri);
  }

  @action
  buildMetaTtl() {
    return getBestuursorganenMetaTtl([this.args.bestuursorgaan]);
  }
}
