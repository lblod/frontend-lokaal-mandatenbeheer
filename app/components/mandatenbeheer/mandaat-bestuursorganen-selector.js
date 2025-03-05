import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class MandaatBestuursorganenSelector extends Component {
  @service store;
  @service('verkiezing') verkiezingService;

  @tracked mandaat = null;
  @tracked mandaatOptions = null;
  @tracked bestuursorganen = [];
  @tracked initialized = false;
  @tracked alertMessage;

  constructor() {
    super(...arguments);
    this.mandaat = this.args.mandaat;
    this.load();
  }

  async load() {
    const mandaten = await this.store.query('mandaat', {
      sort: 'bestuursfunctie.label',
      include: 'bestuursfunctie',
      'filter[bevat-in][id]': this.args.bestuursorganen
        .map((o) => o.get('id'))
        .join(','),
    });
    this.mandaatOptions = mandaten;
    this.initialized = true;
  }

  @action
  select(mandaat) {
    this.mandaat = mandaat;
    this.validatePerson();
    this.args.onSelect(mandaat);
  }

  async validatePerson() {
    this.alertMessage = '';
    if (
      this.args.person &&
      this.args.bestuursorganen.length === 1 &&
      !(await this.mandaat.allowsNonElectedPersons)
    ) {
      const isElected = await this.verkiezingService.checkIfPersonIsElected(
        this.args.person.id,
        this.args.bestuursorganen.at(0)
      );
      if (!isElected) {
        this.alertMessage = `De geselecteerde persoon is niet gevonden in de verkiezingslijst.`;
      }
    }
  }
}
