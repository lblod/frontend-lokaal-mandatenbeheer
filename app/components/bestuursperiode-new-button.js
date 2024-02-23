import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { BESTUURSPERIODE_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class BestuursperiodeNewButtonComponent extends Component {
  @service store;

  @tracked isInitialized = false;
  @tracked isModalOpen = false;
  @tracked bestuursperiodeFormDefinition;

  constructor() {
    super(...arguments);
    this.load();
  }

  async load() {
    this.bestuursperiodeFormDefinition = await getFormFrom(
      this.store,
      BESTUURSPERIODE_FORM_ID
    );

    this.isInitialized = true;
  }

  get title() {
    return 'Voeg bestuursperiode toe';
  }

  @action
  openModal() {
    this.isModalOpen = true;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
  }

  @action
  buildSourceTtl(instanceUri) {
    return `<${instanceUri}> <http://data.vlaanderen.be/ns/mandaat#isTijdspecialisatieVan> <${this.args.bestuursorgaan.uri}>.`;
  }
}
