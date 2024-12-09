import Component from '@glimmer/component';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { restartableTask, task } from 'ember-concurrency';

import { buildNewMandatarisSourceTtl } from 'frontend-lmb/utils/build-new-mandataris-source-ttl';
import { getApplicationContextMetaTtl } from 'frontend-lmb/utils/form-context/application-context-meta-ttl';
import { showErrorToast, showWarningToast } from 'frontend-lmb/utils/toasts';
import {
  CBS_BESTUURSORGAAN_URI,
  GEMEENTERAAD_BESTUURSORGAAN_URI,
} from 'frontend-lmb/utils/well-known-uris';

const CREATE_MODE = 'create';

export default class PrepareLegislatuurSectionComponent extends Component {
  @service toaster;
  @service installatievergadering;
  @service store;
  @service router;
  @service fractieApi;
  @service('mandataris') mandatarisService;
  @service('mandataris-api') mandatarisApi;

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
    this.installatievergadering.removeMandatarissen(this.mandatarissen);

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
    this.installatievergadering.addMandatarissen(this.mandatarissen);
    this.installatievergadering.forceRecomputeBCSD();
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
        'Kon niet synchroniseren. Geen orgaan gevonden.'
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

    await fetch(
      '/mandataris-api/installatievergadering-api/copy-gemeente-to-ocmw-draft',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gemeenteUri: bestuursorgaanToSyncFrom.id,
          ocmwUri: this.args.bestuursorgaan.id,
        }),
      }
    ).catch((e) => {
      console.log(e);
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het overzetten van de mandatarissen.'
      );
    });
    this.installatievergadering.forceRecomputeBCSD();
    this.getMandatarissen.perform({ updated: true });
    this.router.refresh(); // not doing this breaks burgemeester selector synchronization
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
    this.isGeneratingRows = false;
  }

  @action
  async onCreate({ instanceId }) {
    this.editMode = null;
    const mandataris = await this.store.findRecord('mandataris', instanceId);
    await this.getMandatarissen.perform({ added: [mandataris] });
    await this.fractieApi.updateCurrentFractie(instanceId);
    await this.mandatarisService.removeDanglingFractiesInPeriod(instanceId);
    this.installatievergadering.forceRecomputeBCSD();
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
