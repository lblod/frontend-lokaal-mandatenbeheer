import Route from '@ember/routing/route';

import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { BESTUURSEENHEID_CONTACT_INFO_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import { service } from '@ember/service';

export default class SettingsRoute extends Route {
  @service session;
  @service currentSession;
  @service store;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const bestuurseenheid = this.currentSession.group;
    const contactInfoForm = await getFormFrom(
      this.store,
      BESTUURSEENHEID_CONTACT_INFO_FORM_ID
    );

    let contactInfo = await bestuurseenheid.contact;
    if (!contactInfo) {
      const newContact = this.store.createRecord(
        'bestuurseenheid-contact-info',
        {
          email: null,
        }
      );
      await newContact.save();

      bestuurseenheid.contact = newContact;
      await bestuurseenheid.save();
    }

    return {
      bestuurseenheid: {
        contactInfo: {
          instanceId: contactInfo.id,
          form: contactInfoForm,
        },
      },
    };
  }
}
