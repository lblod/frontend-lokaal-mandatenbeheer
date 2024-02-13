import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { MANDATARIS_NEW_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class MandatenbeheerMandatarissenNewRoute extends Route {
  @service store;

  async model() {
    const parentModel = this.modelFor('mandatenbeheer');
    const mandatarisNewForm = getFormFrom(this.store, MANDATARIS_NEW_FORM_ID);

    return RSVP.hash({
      // TODO temporary workaround, we will switch to an application layout where only a  single
      // bestuursorgaan is selected
      bestuursorgaan: parentModel.bestuursorganen[0],
      mandatarisNewForm,
    });
  }
}
