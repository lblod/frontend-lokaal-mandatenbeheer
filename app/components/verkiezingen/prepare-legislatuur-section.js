import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { getBestuursorganenMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { buildNewMandatarisSourceTtl } from 'frontend-lmb/utils/build-new-mandataris-source-ttl';
import { syncNewMandatarisMembership } from 'frontend-lmb/utils/sync-new-mandataris-membership';
import {
  BURGEMEESTER_BESTUURSORGAAN_URI,
  RMW_BESTUURSORGAAN_URI,
  VAST_BUREAU_BESTUURSORGAAN_URI,
  CBS_BESTUURSORGAAN_URI,
  GEMEENTERAAD_BESTUURSORGAAN_URI,
  MANDAAT_LID_RMW_CODE,
  BESTUURSFUNCTIE_CODE_BURGEMEESTER,
  MANDAAT_SCHEPEN_CODE,
  MANDAAT_GEMEENTERAADSLID_CODE,
  MANDAAT_VOORZITTER_GEMEENTERAAD_CODE,
  VOORZITTER_RMW_CODE,
  LID_VAST_BUREAU_CODE,
  VOORZITTER_VAST_BUREAU_CODE,
  BCSD_BESTUURSORGAAN_URI,
  VOORZITTER_BCSD_CODE,
} from 'frontend-lmb/utils/well-known-uris';
import {
  getDraftPublicationStatus,
  getEffectiefStatus,
} from 'frontend-lmb/utils/get-mandataris-status';
import { queryRecord } from 'frontend-lmb/utils/query-record';

const CREATE_MODE = 'create';

export default class PrepareLegislatuurSectionComponent extends Component {
  @service toaster;
  @service store;
  @service router;

  @tracked editMode = null;
  @tracked bcsdError = '';

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
      VAST_BUREAU_BESTUURSORGAAN_URI
    );
  }

  get CBSClassification() {
    return CBS_BESTUURSORGAAN_URI;
  }

  constructor(...args) {
    super(...args);
    this.load();
  }

  async load() {
    const voorzitter = await this.getVoorzitterBCSD();
    if (!voorzitter) {
      return;
    }
    const isMemberOfRMW = await this.isMemberOfRMW(voorzitter);
    const isMemberOfVB = await this.isMemberOfVB(voorzitter);

    if (!isMemberOfRMW && !isMemberOfVB) {
      this.bcsdError =
        'De voorzitter van de BCSD moet lid zijn van de RMW of het vast bureau.';
    }
  }

  // TODO restrict to this bestuurseenheid
  async getVoorzitterBCSD() {
    return await queryRecord(this.store, 'persoon', {
      filter: {
        'is-aangesteld-als': {
          bekleedt: {
            bestuursfunctie: {
              ':uri:': VOORZITTER_BCSD_CODE,
            },
          },
        },
      },
    });
  }

  // TODO restrict to this bestuurseenheid
  async isMemberOfRMW(persoon) {
    const mandataris = await queryRecord(this.store, 'mandataris', {
      filter: {
        'is-bestuurlijke-alias-van': {
          ':uri:': persoon.uri,
        },
        bekleedt: {
          bestuursfunctie: {
            ':uri:': LID_VAST_BUREAU_CODE,
          },
        },
      },
    });
    return Boolean(mandataris);
  }

  // TODO restrict to this bestuurseenheid
  async isMemberOfVB(persoon) {
    const mandataris = await queryRecord(this.store, 'mandataris', {
      filter: {
        'is-bestuurlijke-alias-van': {
          ':uri:': persoon.uri,
        },
        bekleedt: {
          bestuursfunctie: {
            ':uri:': MANDAAT_LID_RMW_CODE,
          },
        },
      },
    });
    return Boolean(mandataris);
  }

  mirrorTable = restartableTask(async () => {
    // bestuursorganenInTijd
    const bestuursorganen = this.args.bestuursorganen;
    let syncId = null;
    if (await this.isRMW) {
      syncId = GEMEENTERAAD_BESTUURSORGAAN_URI;
    }
    if (await this.isLidVanVB) {
      syncId = CBS_BESTUURSORGAAN_URI;
    }

    let bestuursorgaanToSyncFrom = null;
    for (const bestuursorgaan of bestuursorganen) {
      const classificatie = await bestuursorgaan.get(
        'isTijdsspecialisatieVan.classificatie'
      );
      if (classificatie.uri == syncId) {
        bestuursorgaanToSyncFrom = bestuursorgaan;
      }
    }

    if (!bestuursorgaanToSyncFrom) {
      throw `Kon niet synchroniseren. Geen bestuursorgaan gevonden.`;
    }
    const mandatarissenToSync = await this.getBestuursorgaanMandatarissen(
      bestuursorgaanToSyncFrom
    );

    if (mandatarissenToSync.length == 0) {
      throw `Geen mandatarissen gevonden om te synchroniseren.`;
    }

    const currentMandatarissen = await this.getBestuursorgaanMandatarissen(
      this.args.bestuursorgaan
    );

    for (const mandataris of currentMandatarissen) {
      mandataris.destroyRecord();
    }

    for (const mandatarisToAdd of mandatarissenToSync) {
      const mandaatOfMandataris = await mandatarisToAdd.bekleedt;
      const bestuursfunctie = await mandaatOfMandataris.bestuursfunctie;

      const bestuursfunctieCodeMapping = {
        [MANDAAT_GEMEENTERAADSLID_CODE]: MANDAAT_LID_RMW_CODE,
        [MANDAAT_VOORZITTER_GEMEENTERAAD_CODE]: VOORZITTER_RMW_CODE,
        [MANDAAT_SCHEPEN_CODE]: LID_VAST_BUREAU_CODE,
        [BESTUURSFUNCTIE_CODE_BURGEMEESTER]: VOORZITTER_VAST_BUREAU_CODE,
      };

      const bestuurfunctieCodes = await this.store.query(
        'bestuursfunctie-code',
        { filter: { ':uri:': bestuursfunctieCodeMapping[bestuursfunctie.uri] } }
      );

      if (bestuurfunctieCodes.length == 0) {
        throw `Geen bestuursfunctie gevonden om te synchroniseren.`;
      }

      const toBestuursfunctie = bestuurfunctieCodes[0];
      const mandatenOpBestuursOrgaan = await this.args.bestuursorgaan.bevat;
      let mandaat = null;

      for (const existingMandaat of mandatenOpBestuursOrgaan) {
        if (mandaat) {
          continue;
        }
        const bestuursfunctie = await existingMandaat.bestuursfunctie;

        if (bestuursfunctie.uri == toBestuursfunctie.uri) {
          mandaat = existingMandaat;
        }
      }

      if (!mandaat) {
        mandaat = this.store.createRecord('mandaat', {
          bestuursfunctie: toBestuursfunctie,
          bevatIn: [this.args.bestuursorgaan],
        });
        await mandaat.save();
      }

      const lidmaatschap = await mandatarisToAdd.heeftLidmaatschap;
      let newLidmaatschap = null;
      if (lidmaatschap) {
        newLidmaatschap = this.store.createRecord('lidmaatschap', {
          binnenFractie: await lidmaatschap.binnenFractie,
          lidGedurende: await lidmaatschap.lidGedurende,
        });
      }

      const newMandataris = await this.createMandatarisFromMandataris(
        mandatarisToAdd,
        mandaat,
        newLidmaatschap
      );

      if (newLidmaatschap) {
        newLidmaatschap.lid = newMandataris;
        await newLidmaatschap.save();
      }

      const mandatarissen = await mandaat.bekleedDoor;
      mandatarissen.pushObject(newMandataris);
      await mandatarissen.save();
    }
  });

  async createMandatarisFromMandataris(mandataris, mandaat, lidmaatschap) {
    let propertiesForMandataris = {
      rangorde: null,
      start: mandataris.start,
      einde: mandataris.einde,
      bekleedt: mandaat,
      isBestuurlijkeAliasVan: await mandataris.isBestuurlijkeAliasVan,
      beleidsdomein: [],
      status: await getEffectiefStatus(this.store),
      publicationStatus: await getDraftPublicationStatus(this.store),
      heeftLidmaatschap: lidmaatschap,
    };

    if (!(await this.isLidVanVB)) {
      propertiesForMandataris.rangorde = mandataris.rangorde;
      propertiesForMandataris.beleidsdomein = await mandataris.beleidsdomein;
    }

    return this.store.createRecord('mandataris', propertiesForMandataris);
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

  onCreate = restartableTask(async ({ instanceTtl, instanceId }) => {
    this.editMode = null;
    await syncNewMandatarisMembership(this.store, instanceTtl, instanceId);
    await timeout(1000);
  });

  @action
  async buildSourceTtl(instanceUri) {
    return await buildNewMandatarisSourceTtl(this.store, instanceUri);
  }

  @action
  buildMetaTtl() {
    return getBestuursorganenMetaTtl([this.args.bestuursorgaan]);
  }
}
