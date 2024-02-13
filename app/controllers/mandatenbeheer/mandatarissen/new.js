import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { getBestuursorgaanMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { syncMandatarisMembership } from 'frontend-lmb/utils/form-business-rules/mandataris-membership';

export default class MandatenbeheerMandatarissenNewController extends Controller {
  @service router;
  @service store;

  @action
  selectPersoon(persoon) {
    this.router.transitionTo(
      'mandatenbeheer.mandatarissen.edit',
      persoon.get('id')
    );
  }

  @action
  createNewPerson(hasData) {
    hasData
      ? this.router.transitionTo('mandatenbeheer.mandatarissen.new-person', {
          queryParams: hasData,
        })
      : this.router.transitionTo('mandatenbeheer.mandatarissen.new-person');
  }

  @action
  cancel() {
    this.router.transitionTo('mandatenbeheer.mandatarissen');
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

    this.router.transitionTo('mandatenbeheer.mandatarissen');
  }

  @action
  buildMetaTtl() {
    return getBestuursorgaanMetaTtl(this.model.bestuursorgaan);
  }
}
