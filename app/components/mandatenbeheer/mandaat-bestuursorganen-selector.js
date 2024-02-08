import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MandaatBestuursorganenSelector extends Component {
  @service store;

  @tracked mandaat = null;
  @tracked mandaten = null;
  @tracked bestuursorganen = [];
  @tracked initialized = false;

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
    this.mandaten = mandaten;
    this.initialized = true;
  }

  @action
  select(mandaat) {
    this.mandaat = mandaat;
    this.args.onSelect(mandaat);
  }
}
