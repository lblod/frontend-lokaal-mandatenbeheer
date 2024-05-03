import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { syncMandatarisMembership } from 'frontend-lmb/utils/form-business-rules/mandataris-membership';
import { getBestuursorganenMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { MANDATARIS_DRAFT_STATE } from 'frontend-lmb/utils/well-known-uris';

const CREATE_MODE = 'create';

export default class PrepareInstallatievergaderingController extends Controller {
  @service store;
  @service router;

  @tracked editMode = null;
  @tracked person = null;

  @action
  createMandataris() {
    this.editMode = CREATE_MODE;
  }

  get isCreating() {
    return this.editMode === CREATE_MODE;
  }

  @action
  cancel() {
    this.person = null;
    this.editMode = null;
  }

  @action
  async onCreate({ instanceTtl, instanceId }) {
    this.editMode = null;
    const store = new ForkingStore();
    store.parse(instanceTtl, SOURCE_GRAPH, 'text/turtle');
    const mandataris = await this.store.findRecord('mandataris', instanceId);
    await syncMandatarisMembership(mandataris.uri, this.store, {
      store,
      sourceGraph: SOURCE_GRAPH,
    });
    // TODO not sure why the timeout is needed
    setTimeout(() => this.router.refresh(), 1000);
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

  @action
  buildMetaTtl() {
    return getBestuursorganenMetaTtl([this.model.bestuursorgaanInTijd]);
  }

  @action
  async selectStatus(status) {
    const installatievergadering = this.model.installatievergadering;
    installatievergadering.status = status;
    await installatievergadering.save();
  }
}
