import Route from '@ember/routing/route';

import { service } from '@ember/service';
import { action } from '@ember/object';

import { BESTUURSORGAAN_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';

export default class OrganenIndexRoute extends Route {
  @service currentSession;
  @service store;
  @service decretaleOrganen;
  @service bestuursperioden;
  @service bestuursorganen;
  @service installatievergadering;
  @service semanticFormRepository;

  // can't use pagination as we are filtering frontend side on optional properties, which seems to have limited support
  pageSize = 20000;
  queryParams = {
    sort: { refreshModel: true },
    activeOrgans: { refreshModel: true },
    selectedTypes: { refreshModel: true },
    bestuursperiode: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen');

    const bestuursPeriods = await this.store.query('bestuursperiode', {
      sort: 'label',
    });
    let selectedPeriod = this.bestuursperioden.getRelevantPeriod(
      bestuursPeriods,
      params.bestuursperiode
    );

    const bestuursorganen =
      await this.bestuursorganen.getFilteredRealPoliticalBestuursorganen(
        params,
        selectedPeriod
      );
    const form = await this.semanticFormRepository.getFormDefinition(
      BESTUURSORGAAN_FORM_ID
    );
    const legislatuurInBehandeling =
      await this.installatievergadering.activeOrNoLegislature(selectedPeriod);
    const isDistrict = this.currentSession.isDistrict;

    return RSVP.hash({
      bestuurseenheid: parentModel.bestuurseenheid,
      bestuursorganen,
      form,
      bestuursPeriods,
      selectedPeriod,
      legislatuurInBehandeling: isDistrict ? false : legislatuurInBehandeling,
    });
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
