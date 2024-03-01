import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { getBestuursorgaanMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { syncMandatarisMembership } from 'frontend-lmb/utils/form-business-rules/mandataris-membership';
import { NamedNode } from 'rdflib';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';

export default class OrganenMandatarisNewController extends Controller {
  @service router;
  @service store;

  queryParams = ['person'];

  person = null;

  @action
  cancel() {
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
  buildSourceTtl(instanceUri) {
    return `<${instanceUri}> <http://mu.semte.ch/vocabularies/ext/isDraft> "true".`;
  }

  @action
  buildMetaTtl() {
    return getBestuursorgaanMetaTtl(this.model.currentBestuursorgaan);
  }

  @action
  async prefillValues(storeOptions) {
    if (!this.person) {
      return;
    }
    const persoon = await this.store.findRecord('persoon', this.person);
    if (!persoon) {
      return;
    }
    storeOptions.path = new NamedNode(
      'http://data.vlaanderen.be/ns/mandaat#isBestuurlijkeAliasVan'
    );
    replaceSingleFormValue(storeOptions, new NamedNode(persoon.uri));
  }
}
