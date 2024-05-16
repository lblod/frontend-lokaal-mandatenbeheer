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
import {
  getDraftPublicationStatus,
  getEffectiefStatus,
} from 'frontend-lmb/utils/get-mandataris-status';

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
    const mandatarissenToSyncAdd =
      await this.getBestuursorgaanMandatarissen(bestuursorgaan);
    const currentMandatarissen = await this.getBestuursorgaanMandatarissen(
      this.args.bestuursorgaan
    );

    for (const mandataris of currentMandatarissen) {
      mandataris.destroyRecord();
    }

    const mandatenOpBestuursOrgaan = await this.args.bestuursorgaan.bevat;

    for (const mandatarisToAdd of mandatarissenToSyncAdd) {
      const mandaatOfMandataris = await mandatarisToAdd.bekleedt;
      const bestuursfunctie = await mandaatOfMandataris.bestuursfunctie;
      let mandaat = mandatenOpBestuursOrgaan.find(
        async (mandaat) =>
          (await mandaat.bestuursfunctie).id == bestuursfunctie.id
      );

      if (!mandaat) {
        mandaat = this.store.createRecord('mandaat', {
          bestuursfunctie: bestuursfunctie,
          bevatIn: [this.args.bestuursorgaan],
        });
        await mandaat.save();
      }
      const newMandataris = await this.createMandatarisFromMandataris(
        mandatarisToAdd,
        mandaat
      );

      const mandatarissen = await mandaat.bekleedDoor;
      mandatarissen.pushObject(newMandataris);
      await mandatarissen.save();
    }
  });

  async createMandatarisFromMandataris(mandataris, mandaat) {
    return this.store.createRecord('mandataris', {
      rangorde: mandataris.rangorde,
      start: mandataris.start,
      einde: mandataris.einde,
      bekleedt: mandaat,
      isBestuurlijkeAliasVan: await mandataris.isBestuurlijkeAliasVan,
      beleidsdomein: await mandataris.beleidsdomein,
      status: await getEffectiefStatus(this.store),
      publicationStatus: await getDraftPublicationStatus(this.store),
      heeftLidmaatschap: await mandataris.heeftLidmaatschap,
    });
  }

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
