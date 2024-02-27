import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import {
  MANDATARIS_EINDE_EDIT_FORM_ID,
  MANDATARIS_EDIT_FORM_ID,
} from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class MandatarissenMandatarisRoute extends Route {
  @service store;

  async model(params) {
    const mandataris = await this.getMandataris(params.id);
    const mandatarisEindeEditForm = getFormFrom(
      this.store,
      MANDATARIS_EINDE_EDIT_FORM_ID
    );
    const mandatarisEditForm = getFormFrom(this.store, MANDATARIS_EDIT_FORM_ID);

    const bestuursorganen = await (await mandataris.bekleedt).get('bevatIn');

    return RSVP.hash({
      mandataris,
      mandatarisEindeEditForm,
      mandatarisEditForm,
      // TODO should be all bestuursorganen, but this is not supported by the mandateselector for now.
      bestuursorgaan: bestuursorganen[0],
    });
  }

  async getMandataris(id) {
    let queryParams = {
      include: [
        'is-bestuurlijke-alias-van',
        'bekleedt.bestuursfunctie',
        'bekleedt.bevat-in',
        'beleidsdomein',
        'heeft-lidmaatschap.binnen-fractie',
      ].join(','),
    };

    let mandataris = await this.store.findRecord('mandataris', id, queryParams);
    return mandataris;
  }
}