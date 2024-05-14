import Route from '@ember/routing/route';

import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { BESTUURSEENHEID_CONTACT_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
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
    const contactForm = await getFormFrom(
      this.store,
      BESTUURSEENHEID_CONTACT_FORM_ID
    );

    let contact = await bestuurseenheid.contact;
    if (!contact) {
      const newContact = this.store.createRecord('bestuurseenheid-contact', {
        email: null,
      });
      await newContact.save();
      contact = newContact;

      bestuurseenheid.contact = newContact;
      await bestuurseenheid.save();
    }

    return {
      bestuurseenheid: {
        contact: {
          instanceId: contact.id,
          form: contactForm,
        },
      },
    };
  }
}
