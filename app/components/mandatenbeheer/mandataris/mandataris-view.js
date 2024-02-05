import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MandatenbeheerMandatarisViewComponent extends Component {
  @service() store;

  @tracked mandatarissen;

  constructor() {
    super(...arguments);
    this.initComponentProperties();
  }

  async initComponentProperties() {
    let bestuursorganenIds = this.args.bestuursorganen.map((o) => o.get('id'));
    let queryParams = {
      filter: {
        'is-bestuurlijke-alias-van': {
          id: this.args.persoon.id,
        },
        bekleedt: {
          'bevat-in': {
            id: bestuursorganenIds.join(','),
          },
        },
      },
      include: [
        'is-bestuurlijke-alias-van',
        'bekleedt.bestuursfunctie',
        'beleidsdomein',
        'heeft-lidmaatschap.binnen-fractie',
      ].join(','),
    };

    let mandatarissen = await this.store.query('mandataris', queryParams);
    this.mandatarissen = mandatarissen.slice();
  }
}
