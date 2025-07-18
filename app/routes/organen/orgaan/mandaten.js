import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { MANDAAT_EXTRA_INFO_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

export default class OrganenOrgaanMandatenRoute extends Route {
  @service semanticFormRepository;

  async model() {
    const parentModel = this.modelFor('organen.orgaan');
    const mandaten = await parentModel.currentBestuursorgaan.bevat;
    const currentIsCBS = await parentModel.currentBestuursorgaan.isCBS;
    const mandatenFilter = (mandaat) => {
      if (currentIsCBS) {
        // CBS has all mandaten that burgemeester has. We only show the ones that are not in burgemeester orgaan
        const isBurgemeesterMandaat = mandaat.get('isBurgemeester');
        return isBurgemeesterMandaat ? null : mandaat;
      }

      return mandaat;
    };

    const mandaatExtraInfoForm =
      await this.semanticFormRepository.getFormDefinition(
        MANDAAT_EXTRA_INFO_FORM_ID,
        true
      );

    return {
      mandaatExtraInfoForm,
      mandaten: mandaten.filter(mandatenFilter),
    };
  }
}
