import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { getBestuursorganenMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { syncMandatarisMembership } from 'frontend-lmb/utils/form-business-rules/mandataris-membership';
import { MANDATARIS_DRAFT_STATE } from 'frontend-lmb/utils/well-known-uris';

export default class OrganenMandatarisNewController extends Controller {
  @service router;
  @service store;

  queryParams = ['person'];

  @tracked person = null;

  @action
  cancel() {
    this.person = null;
    this.router.transitionTo('organen.orgaan.mandatarissen');
  }

  @action
  async onCreate({ instanceTtl, instanceId }) {
    const store = new ForkingStore();
    store.parse(instanceTtl, SOURCE_GRAPH, 'text/turtle');
    const mandataris = await this.store.findRecord('mandataris', instanceId);
    await syncMandatarisMembership(mandataris.uri, this.store, {
      store,
      sourceGraph: SOURCE_GRAPH,
    });
    this.router.transitionTo('organen.orgaan.mandatarissen');
  }

  @action
  buildMetaTtl() {
    return getBestuursorganenMetaTtl([this.model.currentBestuursorgaan]);
  }

  @action
  async buildSourceTtl(instanceUri) {
    const draftTriple = `<${instanceUri}> <http://mu.semte.ch/vocabularies/ext/lmb/hasPublicationStatus> <${MANDATARIS_DRAFT_STATE}>.`;
    if (!this.person) {
      return draftTriple;
    }
    const persoon = await this.store.findRecord('persoon', this.person);
    if (!persoon) {
      return draftTriple;
    }

    return `
    ${draftTriple}
    <${instanceUri}> <http://data.vlaanderen.be/ns/mandaat#isBestuurlijkeAliasVan> <${persoon.uri}>.
    `;
  }
}
