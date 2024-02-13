import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { getBestuursorgaanMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { syncMandatarisMembership } from 'frontend-lmb/utils/form-business-rules/mandataris-membership';

export default class MandatenbeheerMandatarissenEditController extends Controller {
  @service router;
  @service store;

  @tracked createMode = false;

  @action
  createMandataris() {
    this.createMode = !this.createMode;
    // TODO add create mandataris logic here.
  }

  @action
  async onCreate({ instanceTtl, instanceId }) {
    const store = new ForkingStore();
    store.parse(instanceTtl, SOURCE_GRAPH, 'text/turtle');
    // TODO this is bad design, but works for now. It is due to only having access to the instance ID and not the URI
    const mandataris = await this.store.findRecord('mandataris', instanceId);

    await syncMandatarisMembership(mandataris.uri, this.store, {
      store,
      sourceGraph: SOURCE_GRAPH,
    });

    // TODO remove when resource caching is fixed
    setTimeout(() => mandataris.reload(), 1000);
  }

  @action
  cancel() {
    this.router.transitionTo('mandatenbeheer.mandatarissen');
  }

  @action
  buildMetaTtl() {
    return getBestuursorgaanMetaTtl(this.model.bestuursorgaan);
  }

  @action
  buildSourceTtl(instanceUri) {
    const persoon = this.model.persoon;
    const persoonUri = persoon.get('uri');

    return `
    <${instanceUri}> <http://data.vlaanderen.be/ns/mandaat#isBestuurlijkeAliasVan> <${persoonUri}>.
    `;
  }
}
