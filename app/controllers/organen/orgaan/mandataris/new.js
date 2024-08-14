import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { getBestuursorganenMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { buildNewMandatarisSourceTtl } from 'frontend-lmb/utils/build-new-mandataris-source-ttl';
import { syncNewMandatarisMembership } from 'frontend-lmb/utils/sync-new-mandataris-membership';

export default class OrganenMandatarisNewController extends Controller {
  @service router;
  @service store;
  @service fractieApi;
  @service('mandataris') mandatarisService;

  queryParams = ['person'];

  @tracked person = null;
  @tracked createdMandataris = false;
  @tracked newestMandatarisId = null;

  @action
  cancel() {
    this.person = null;
    this.router.transitionTo('organen.orgaan.mandatarissen');
  }

  @action
  async onCreate({ instanceTtl, instanceId }) {
    await syncNewMandatarisMembership(this.store, instanceTtl, instanceId);
    await this.fractieApi.updateCurrentFractie(instanceId);
    await this.mandatarisService.removeDanglingFractiesInPeriod(instanceId);
    this.newestMandatarisId = instanceId;
    this.createdMandataris = true;
  }

  @action
  callbackAfterCreate() {
    this.router.transitionTo('organen.orgaan.mandatarissen');
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
