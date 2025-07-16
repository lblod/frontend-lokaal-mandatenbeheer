import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { MANDAAT_EXTRA_INFO_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class OrganenOrgaanMandatenRoute extends Route {
  @service semanticFormRepository;

  async model() {
    const parentModel = this.modelFor('organen.orgaan');
    const mandaten = await parentModel.currentBestuursorgaan.bevat;
    const mandaatExtraInfoForm =
      await this.semanticFormRepository.getFormDefinition(
        MANDAAT_EXTRA_INFO_FORM_ID,
        true
      );

    return {
      mandaatExtraInfoForm,
      mandaten,
    };
  }
}
