import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class MandatarissenPersoonRoute extends Route {
  @service store;

  async model(params) {
    const persoon = await this.store.findRecord('persoon', params.id);
    const mandatarissen = await this.getMandatarissen(persoon);

    const actieveMandatarissen = [];
    const inactieveMandatarissen = [];
    await Promise.all(
      mandatarissen.map((mandataris) => {
        const active = mandataris.isActive;
        if (active) {
          actieveMandatarissen.push(mandataris);
        } else {
          inactieveMandatarissen.push(mandataris);
        }
      })
    );

    const bestuursorganen = this.store.query('bestuursorgaan', {
      'filter[:has-no:deactivated-at]': true,
      'filter[:has-no:is-tijdsspecialisatie-van]': true,
    });

    return RSVP.hash({
      persoon,
      actieveMandatarissen,
      inactieveMandatarissen,
      bestuursorganen,
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
