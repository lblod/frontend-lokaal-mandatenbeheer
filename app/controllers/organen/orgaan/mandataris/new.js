import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { getApplicationContextMetaTtl } from 'frontend-lmb/utils/form-context/application-context-meta-ttl';
import { buildNewMandatarisSourceTtl } from 'frontend-lmb/utils/build-new-mandataris-source-ttl';

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
  async onCreate({ instanceId }) {
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
  async buildMetaTtl() {
    const metaTtl = await getApplicationContextMetaTtl([
      this.model.currentBestuursorgaan,
    ]);
    return `${metaTtl}
    <http://mu.semte.ch/vocabularies/ext/applicationContext> <http://mu.semte.ch/vocabularies/ext/limitPersonFractions> true .
    `;
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
