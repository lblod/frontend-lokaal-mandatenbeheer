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
    if (
      this.args.person &&
      this.args.bestuursorganen.length === 1 &&
      !(await this.args.bestuursorganen.at(0).isBCSD)
    ) {
      const bestuursperiode =
        await this.args.bestuursorganen.at(0).heeftBestuursperiode;
      const electedPeople = await this.verkiezingService.checkIfPersonIsElected(
        this.args.person.id,
        bestuursperiode
      );
      if (electedPeople.length === 0) {
        const burgemeesterMandaten = await Promise.all(
          this.mandaatOptions.map(async (m) => {
            const isBurgemeester = await m.isBurgemeester;
            if (isBurgemeester) {
              return m;
            }
          })
        );
        this.mandaatOptions = burgemeesterMandaten.filter((m) => m);
        if (this.mandaatOptions.length === 0) {
          this.alertMessage = `De geselecteerde persoon is niet gevonden in de verkiezingslijst.`;
        } else {
          this.alertMessage = null;
        }
      }
    }

    this.initialized = true;
  }

  @action
  select(mandaat) {
    this.mandaat = mandaat;
    this.args.onSelect(mandaat);
  }
}
