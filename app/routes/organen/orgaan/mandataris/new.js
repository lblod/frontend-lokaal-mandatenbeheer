import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { MANDATARIS_NEW_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class OrganenMandatarisNewRoute extends Route {
  @service store;
  @service currentSession;
  @service semanticFormRepository;

  async model() {
    const parentModel = this.modelFor('organen.orgaan');
    const mandatarisNewForm =
      await this.semanticFormRepository.getFormDefinition(
        MANDATARIS_NEW_FORM_ID
      );
    const bestuurseenheid = this.currentSession.group;

    return RSVP.hash({
      bestuurseenheid,
      currentBestuursorgaan: parentModel.currentBestuursorgaan,
      mandatarisNewForm,
      selectedBestuursperiode: parentModel.selectedBestuursperiode,
    });
  }
}
