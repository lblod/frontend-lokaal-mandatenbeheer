import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import {
  MANDATARIS_EINDE_EDIT_FORM_ID,
  MANDATARIS_EDIT_FORM_ID,
  MANDATARIS_HIDDEN_PERSOON_NEW_FORM_ID,
} from 'frontend-lmb/utils/well-known-ids';
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
    const mandatarisEindeEditForm = getFormFrom(
      this.store,
      MANDATARIS_EINDE_EDIT_FORM_ID
    );
    const mandatarisEditForm = getFormFrom(this.store, MANDATARIS_EDIT_FORM_ID);
    const mandatarisHiddenPersoonNewForm = getFormFrom(
      this.store,
      MANDATARIS_HIDDEN_PERSOON_NEW_FORM_ID
    );

    return RSVP.hash({
      bestuurseenheid: parentModel.bestuurseenheid,
      bestuursorganen: parentModel.bestuursorganen,
      // TODO temporary workaround, we will switch to an application layout where only a  single
      // bestuursorgaan is selected
      bestuursorgaan: parentModel.bestuursorganen[0],
      persoon,
      mandatarissen,
      mandatarisEindeEditForm,
      mandatarisEditForm,
      mandatarisHiddenPersoonNewForm,
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
