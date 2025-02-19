import Route from '@ember/routing/route';

import { BESTUURSEENHEID_CONTACT_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import { service } from '@ember/service';

export default class SettingsRoute extends Route {
  @service session;
  @service currentSession;
  @service semanticFormRepository;
  @service store;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (this.currentSession.isLokaalBeheerd) {
      this.router.transitionTo('lokaal-beheerd');
    }
  }

  async model() {
    const bestuurseenheid = this.currentSession.group;
    const contactForm = await this.semanticFormRepository.getFormDefinition(
      BESTUURSEENHEID_CONTACT_FORM_ID
    );

    let contact = await bestuurseenheid.contact;
    if (!contact) {
      const newContact = this.store.createRecord('bestuurseenheid-contact', {
        email: null,
        bestuurseenheid: bestuurseenheid,
      });
      await newContact.save();
      contact = newContact;
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
