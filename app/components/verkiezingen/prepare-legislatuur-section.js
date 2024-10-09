import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { A } from '@ember/array';

import { restartableTask, task } from 'ember-concurrency';

import { getApplicationContextMetaTtl } from 'frontend-lmb/utils/form-context/application-context-meta-ttl';
import { buildNewMandatarisSourceTtl } from 'frontend-lmb/utils/build-new-mandataris-source-ttl';
import {
  CBS_BESTUURSORGAAN_URI,
  GEMEENTERAAD_BESTUURSORGAAN_URI,
  MANDAAT_LID_RMW_CODE,
  MANDAAT_SCHEPEN_CODE,
  MANDAAT_GEMEENTERAADSLID_CODE,
  MANDAAT_VOORZITTER_GEMEENTERAAD_CODE,
  MANDAAT_VOORZITTER_RMW_CODE,
  MANDAAT_LID_VAST_BUREAU_CODE,
  MANDAAT_VOORZITTER_VAST_BUREAU_CODE,
  MANDAAT_BURGEMEESTER_CODE,
} from 'frontend-lmb/utils/well-known-uris';
import {
  getDraftPublicationStatus,
  getEffectiefStatus,
} from 'frontend-lmb/utils/get-mandataris-status';
import { showWarningToast } from 'frontend-lmb/utils/toasts';

const CREATE_MODE = 'create';

export default class PrepareLegislatuurSectionComponent extends Component {
  @service toaster;
  @service bcsd;
  @service store;
  @service router;
  @service fractieApi;
  @service('mandataris') mandatarisService;

  @tracked editMode = null;
  @tracked isGeneratingRows;
  @tracked skeletonRowsOfMirror = null;
  @tracked mandatarissen = A();

  constructor() {
    super(...arguments);

    this.initialLoad.perform();
  }

  initialLoad = task(async () => {
    this.mandatarissen.clear();
    const mandatarissen = await this.getBestuursorgaanMandatarissen(
      this.args.bestuursorgaan
    );
    this.skeletonRowsOfMirror = this.mandatarissen.length;
    this.getMandatarissen.perform({ added: mandatarissen });
  });

  getMandatarissen = restartableTask(async (state) => {
    const { added, removed, updated } = state;

    if (removed && removed.length >= 1) {
      this.mandatarissen.removeObjects(removed);
    }
    if (added && added.length >= 1) {
      if (added.length >= 2) {
        this.skeletonRowsOfMirror = this.mandatarissen.length + added.length;
      }
      this.mandatarissen.pushObjects(added);
    }

    if (updated) {
      await this.initialLoad.perform();
    }
  });

  @action
  createMandataris() {
    this.editMode = CREATE_MODE;
  }

  get isCreating() {
    return this.editMode === CREATE_MODE;
  }

  get CBSClassification() {
    return CBS_BESTUURSORGAAN_URI;
  }
  get gemeenteRaadClassification() {
    return GEMEENTERAAD_BESTUURSORGAAN_URI;
  }

  mirrorTable = restartableTask(async () => {
    this.skeletonRowsOfMirror = null;
    let syncId = null;
    if (await this.args.bestuursorgaan.isRMW) {
      syncId = GEMEENTERAAD_BESTUURSORGAAN_URI;
    }
    if (await this.args.bestuursorgaan.isVastBureau) {
      syncId = CBS_BESTUURSORGAAN_URI;
    }

    let bestuursorgaanToSyncFrom = null;
    for (const bestuursorgaan of this.args.bestuursorganen) {
      const classificatie = await bestuursorgaan.get(
        'isTijdsspecialisatieVan.classificatie'
      );
      if (classificatie.uri == syncId) {
        bestuursorgaanToSyncFrom = bestuursorgaan;
      }
    }

    if (!bestuursorgaanToSyncFrom) {
      showWarningToast(
        this.toaster,
        'Kon niet synchroniseren. Geen bestuursorgaan gevonden.'
      );
      return;
    }
    const mandatarissenToSync = await this.getBestuursorgaanMandatarissen(
      bestuursorgaanToSyncFrom
    );

    if (mandatarissenToSync.length == 0) {
      showWarningToast(
        this.toaster,
        'Geen mandatarissen gevonden om over te nemen.'
      );
      return;
    }
    this.skeletonRowsOfMirror = mandatarissenToSync.length;

    for (const mandataris of this.mandatarissen) {
      mandataris.destroyRecord();
    }

    const newMandatarissen = [];
    for (const mandatarisToAdd of mandatarissenToSync) {
      const mandaatOfMandataris = await mandatarisToAdd.bekleedt;
      const bestuursfunctie = await mandaatOfMandataris.bestuursfunctie;

      const bestuursfunctieCodeMapping = {
        [MANDAAT_GEMEENTERAADSLID_CODE]: MANDAAT_LID_RMW_CODE,
        [MANDAAT_VOORZITTER_GEMEENTERAAD_CODE]: MANDAAT_VOORZITTER_RMW_CODE,
        [MANDAAT_SCHEPEN_CODE]: MANDAAT_LID_VAST_BUREAU_CODE,
        [MANDAAT_BURGEMEESTER_CODE]: MANDAAT_VOORZITTER_VAST_BUREAU_CODE,
      };

      const bestuurfunctieCodes = await this.store.query(
        'bestuursfunctie-code',
        { filter: { ':uri:': bestuursfunctieCodeMapping[bestuursfunctie.uri] } }
      );

      if (bestuurfunctieCodes.length == 0) {
        showWarningToast(
          this.toaster,
          'Geen bestuursfunctie gevonden om te synchroniseren.'
        );
        return;
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

      newMandatarissen.push(newMandataris);
    }
    await this.getMandatarissen.perform({
      added: newMandatarissen,
      removed: this.mandatarissen,
    });

    this.bcsd.forceRecomputeBCSD();
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
    this.isGeneratingRows = false;
  }

  @action
  async onCreate({ instanceId }) {
    this.editMode = null;
    const mandataris = await this.store.findRecord('mandataris', instanceId);
    await this.getMandatarissen.perform({ added: [mandataris] });
    await this.fractieApi.updateCurrentFractie(instanceId);
    await this.mandatarisService.removeDanglingFractiesInPeriod(instanceId);
    this.bcsd.forceRecomputeBCSD();
  }

  @action
  async buildSourceTtl(instanceUri) {
    return await buildNewMandatarisSourceTtl(this.store, instanceUri);
  }

  @action
  buildMetaTtl() {
    return getApplicationContextMetaTtl([this.args.bestuursorgaan]);
  }
}
