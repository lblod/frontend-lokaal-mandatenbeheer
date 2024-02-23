import Route from '@ember/routing/route';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { MANDAAT_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default class MandaatEditRoute extends Route {
  @service store;

  async model(params) {
    const form = getFormFrom(this.store, MANDAAT_FORM_ID);
    const mandaat = await this.store.findRecord('mandaat', params.id, {
      include: 'bestuursfunctie',
    });

    return RSVP.hash({ form, instanceId: params.id, mandaat });
  }
}
