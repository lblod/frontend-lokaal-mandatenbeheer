import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class MandatenbeheerMandatarissenEditRoute extends Route {
  @service store;

  async model(params) {
    const parentModel = this.modelFor('mandatenbeheer');
    const persoon = await this.store.findRecord('persoon', params.id);
    const mandatarissen = this.getMandatarissen(
      parentModel.bestuursorganen,
      persoon
    );

    return RSVP.hash({
      bestuurseenheid: parentModel.bestuurseenheid,
      bestuursorganen: parentModel.bestuursorganen,
      persoon,
      mandatarissen,
    });
  }

  async getMandatarissen(bestuursorganen, persoon) {
    let bestuursorganenIds = bestuursorganen.map((o) => o.get('id'));
    let queryParams = {
      filter: {
        'is-bestuurlijke-alias-van': {
          id: persoon.id,
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
    return mandatarissen.slice();
  }
}
