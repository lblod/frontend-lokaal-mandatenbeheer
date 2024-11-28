import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';

import { restartableTask } from 'ember-concurrency';

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
  @service store;
  @service router;
  @service fractieApi;
  @service('mandataris') mandatarisService;
  @service('mandataris-api') mandatarisApi;
  @service('installatievergadering') ivService;

  @tracked editMode = null;
  @tracked isGeneratingRows;
  @tracked skeletonRowsOfMirror = null;
  @tracked mandatarissen = A();

  constructor() {
    super(...arguments);
    const current = this.ivService.bestuursorganenInTijdMap?.get(
      this.args.bestuursorgaan?.id
    )?.mandatarissen;
    this.getMandatarissen.perform({ updated: current });
  }

  getMandatarissen = restartableTask(async (state) => {
    const { added, updated, removed } = state;

    if (added) {
      this.ivService.addMandatarissen(this.args.bestuursorgaan, added);
    }
    if (removed) {
      this.ivService.removeMandatarissen(this.args.bestuursorgaan, removed);
    }

    if (updated) {
      await this.ivService.fetchMandatarissenForBoi(this.args.bestuursorgaan);
    }
    this.mandatarissen = A(
      this.ivService.bestuursorganenInTijdMap?.get(this.args.bestuursorgaan?.id)
        ?.mandatarissen
    );
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
    for (const bestuursorgaan of this.ivService.bestuursorganenInTijd) {
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

    const mandatarissenToSync =
      await this.mandatarisService.getBestuursorgaanMandatarissen(
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
    this.ivService.forceRecomputeBCSD();
    this.getMandatarissen.perform({ updated: true });
    this.router.refresh(); // not doing this breaks burgemeester selector synchronization
  });

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
    this.ivService.forceRecomputeBCSD();
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
