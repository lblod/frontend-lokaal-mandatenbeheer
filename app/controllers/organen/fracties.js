import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class FractiesController extends Controller {
  queryParams = ['bestuursperiode'];
  @service router;

  @tracked page = 0;
  sort = 'naam';
  size = 10;
  @tracked bestuursperiode;

  @tracked modal = false;
  edit = 'edit';
  create = 'create';
  @tracked instanceId = null;

  @tracked formInitialized;

  @action
  openCreateFractieModal() {
    this.modal = 'create';
  }
  @action
  openEditFractieModal(instanceId) {
    this.modal = 'edit';
    this.instanceId = instanceId;
  }
  @action
  closeModal() {
    this.modal = null;
    this.formInitialized = false;
    this.router.refresh();
  }
  @action
  saveModal() {
    this.modal = null;
    this.formInitialized = false;
    this.send('reloadModel');
  }

  @action
  selectPeriod(period) {
    this.bestuursperiode = period.id;
  }

  @action
  buildSourceTtlCreateFractie(instanceUri) {
    const bestuurseenheid = this.model.bestuurseenheid;
    const bestuursorganen = this.model.tijdsspecialisaties;

    const bestuurseenheidUri = bestuurseenheid.get('uri');
    const bestuursOrganenUris = bestuursorganen.map((b) => `<${b.get('uri')}>`);
    const defaultFractieTypeUri = this.model.defaultFractieType.get('uri');

    return `<${instanceUri}> <http://www.w3.org/ns/org#memberOf> ${bestuursOrganenUris.join(
      ', '
    )} .
    <${instanceUri}> <http://www.w3.org/ns/org#linkedTo> <${bestuurseenheidUri}> .
    <${instanceUri}> <http://mu.semte.ch/vocabularies/ext/isFractietype> <${defaultFractieTypeUri}> .`;
  }
}
