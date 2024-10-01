import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { getBestuursorganenMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { buildNewMandatarisSourceTtl } from 'frontend-lmb/utils/build-new-mandataris-source-ttl';
import { syncNewMandatarisMembership } from 'frontend-lmb/utils/sync-new-mandataris-membership';

export default class OrganenMandatarissenController extends Controller {
  @service router;
  @service store;

  @service fractieApi;
  @service toaster;
  @service('mandataris') mandatarisService;

  queryParams = ['activeOnly'];

  @tracked filter = '';
  @tracked page = 0;
  @tracked isCreatingMandataris = false;
  @tracked createdMandataris = false;
  @tracked activeOnly = false;
  sort = 'is-bestuurlijke-alias-van.achternaam';
  // we are folding the mandataris instances, so just pick a very high number here and hope our government is reasonable about the
  // number of mandatarisses that can exist
  size = 900000;

  @tracked newestMandatarisId = null;

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
    await this.fractieApi.updateCurrentFractie(instanceId);
    await this.mandatarisService.removeDanglingFractiesInPeriod(instanceId);
    this.isCreatingMandataris = false;
    this.newestMandatarisId = instanceId;
    this.createdMandataris = true;
    this.router.refresh();
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
  toggleActiveOnly() {
    this.activeOnly = !this.activeOnly;
  }

  get toolTipText() {
    return 'Het is niet mogelijk mandatarissen toe te voegen aan een bestuursperiode terwijl de voorbereiding van de legislatuur actief is.';
  }
}
