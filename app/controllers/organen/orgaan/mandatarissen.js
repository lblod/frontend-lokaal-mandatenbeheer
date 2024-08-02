import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { getBestuursorganenMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { buildNewMandatarisSourceTtl } from 'frontend-lmb/utils/build-new-mandataris-source-ttl';
import { syncNewMandatarisMembership } from 'frontend-lmb/utils/sync-new-mandataris-membership';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class OrganenMandatarissenController extends Controller {
  @service router;
  @service store;
  @service toaster;

  @tracked filter = '';
  @tracked page = 0;
  @tracked isCreatingMandataris = false;
  sort = 'is-bestuurlijke-alias-van.achternaam';
  // we are folding the mandataris instances, so just pick a very high number here and hope our government is reasonable about the
  // number of mandatarisses that can exist
  size = 900000;

  @tracked doubleMandateTitle = '';
  @tracked doubleMandateText = '';
  @tracked doubleMandateModal = false;
  newestMandatarisId = null;

  search = task({ restartable: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    this.page = 0;
    this.filter = searchData;
  });

  @action
  setIsCreatingMandataris(toggleTo) {
    this.isCreatingMandataris = toggleTo;
  }

  @action
  async onCreate({ instanceTtl, instanceId }) {
    await syncNewMandatarisMembership(this.store, instanceTtl, instanceId);
    this.isCreatingMandataris = false;
    this.newestMandatarisId = instanceId;
    await this.checkDoubleMandataris();
    this.router.refresh();
    // setTimeout(() => this.router.refresh(), 1000);
  }

  @action
  buildMetaTtl() {
    return getBestuursorganenMetaTtl([this.model.currentBestuursorgaan]);
  }

  @action
  async buildSourceTtl(instanceUri) {
    return await buildNewMandatarisSourceTtl(
      this.store,
      instanceUri,
      this.person
    );
  }

  @action
  toggleDoubleMandateModal() {
    this.doubleMandateModal = !this.doubleMandateModal;
  }

  @action
  async checkDoubleMandataris() {
    const response = await fetch(
      `/mandataris-api/mandatarissen/${this.newestMandatarisId}/check-possible-double`
    );
    const jsonReponse = await response.json();

    if (response.status !== 200) {
      console.error(jsonReponse.message);
      throw jsonReponse.message;
    }

    if (!jsonReponse.duplicateMandate || jsonReponse.hasDouble) {
      return;
    }

    this.doubleMandateModal = true;
    const currentMandate = jsonReponse.currentMandate;
    const duplicateMandate = jsonReponse.duplicateMandate;
    this.doubleMandateTitle = `Aanmaken mandaat ${duplicateMandate}`;
    this.doubleMandateText = `
    U heeft zonet een mandataris met het mandaat ${currentMandate} aangemaakt.
    Normaliter heeft een mandataris met dit mandaat ook een corresponderend mandaat als ${duplicateMandate}.
    Wenst u dit mandaat aan te maken?`;
  }

  @action
  async createDoubleMandataris() {
    const response = await fetch(
      `/mandataris-api/mandatarissen/${this.newestMandatarisId}/create-linked-mandataris`,
      { method: 'POST' }
    );
    const jsonReponse = await response.json();

    if (response.status !== 201) {
      console.error(jsonReponse.message);
      showErrorToast(this.toaster, jsonReponse.message);
    }
    showSuccessToast(this.toaster, `Mandataris werd succesvol aangemaakt.`);
    this.toggleDoubleMandateModal();
  }
}
