import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class FractiesController extends Controller {
  @service router;

  @tracked page = 0;
  sort = 'naam';
  size = 10;

  @tracked modal = false;
  edit = 'edit';
  create = 'create';
  @tracked instanceId = null;

  get hasActiveChildRoute() {
    return (
      this.router.currentRouteName.startsWith('organen.fracties.') &&
      this.router.currentRouteName != 'organen.fracties.index'
    );
  }

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
  }
  @action
  saveModal() {
    this.modal = null;
    this.router.refresh;
  }

  @action
  selectPeriod(period) {
    this.router.transitionTo('organen.fracties', {
      queryParams: {
        startDate: period.startDate,
        endDate: period.endDate,
        page: 0,
      },
    });
  }

  @action
  buildSourceTtlCreateFractie(instanceUri) {
    const bestuurseenheid = this.model.bestuurseenheid;
    const bestuursorganen = this.model.bestuursorganen;

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
