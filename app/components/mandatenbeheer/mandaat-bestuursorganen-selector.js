import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class MandaatBestuursorganenSelector extends Component {
  @service store;

  @tracked mandaat = null;
  @tracked mandaatOptions = null;
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
    this.mandaatOptions = mandaten;
    if (
      this.args.person &&
      this.args.bestuursorganen.length === 1 &&
      !(await this.args.bestuursorganen.at(0).isBCSD)
    ) {
      console.log(`bestuursorgaan is not BCSD`);
      const isPersonElected =
        (await this.store.query('persoon', {
          include: [
            'verkiezingsresultaten',
            'verkiezingsresultaten.kandidatenlijst',
            'verkiezingsresultaten.kandidatenlijst.verkiezing',
            'verkiezingsresultaten.kandidatenlijst.verkiezing.bestuursorgaan-in-tijd',
            'verkiezingsresultaten.kandidatenlijst.verkiezing.bestuursorgaan-in-tijd.heeft-bestuursperiode',
          ].join(','),
          'filter[verkiezingsresultaten][kandidatenlijst][verkiezing][bestuursorgaan-in-tijd][heeft-bestuursperiode][:id:]':
            await this.args.bestuursorganen.at(0).heeftBestuursperiode.id,
          'filter[verkiezingsresultaten][persoon][:id:]': this.args.person.id,
        }).length) === 1;
      console.log(`person is elected?`, isPersonElected);
      if (!isPersonElected) {
        console.log(`Only show burgemeester mandaten`);
        const burgemeesterMandaten = await Promise.all(
          this.mandaatOptions.map(async (m) => {
            const isBurgemeester = await m.isBurgemeester;
            if (isBurgemeester) {
              return m;
            }
          })
        );
        this.mandaatOptions = burgemeesterMandaten.filter((m) => m);
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
