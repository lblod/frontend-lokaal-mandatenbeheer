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

  @tracked filter = '';
  @tracked page = 0;
  @tracked isCreatingMandataris = false;
  sort = 'is-bestuurlijke-alias-van.achternaam';
  // we are folding the mandataris instances, so just pick a very high number here and hope our government is reasonable about the
  // number of mandatarisses that can exist
  size = 900000;

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
    setTimeout(() => this.router.refresh(), 1000);
    this.isCreatingMandataris = false;
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
}
