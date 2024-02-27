import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class MandatarissenPersoonRoute extends Route {
  @service store;

  async model(params) {
    const persoon = await this.store.findRecord('persoon', params.id);
    const mandatarissen = this.getMandatarissen(persoon);

    return RSVP.hash({
      persoon,
      mandatarissen,
    });
  }

  async getMandatarissen(persoon) {
    let queryParams = {
      filter: {
        'is-bestuurlijke-alias-van': {
          id: persoon.id,
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
    return mandatarissen.slice();
  }
}
