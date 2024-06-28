import Route from '@ember/routing/route';

import { service } from '@ember/service';
import { action } from '@ember/object';

import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { BESTUURSORGAAN_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import RSVP from 'rsvp';
import { INSTALLATIVERGADERING_BEHANDELD_STATUS } from 'frontend-lmb/utils/well-known-uris';

export default class OrganenIndexRoute extends Route {
  @service store;
  @service decretaleOrganen;
  @service bestuursperioden;
  @service bestuursorganen;

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
    const form = await getFormFrom(this.store, BESTUURSORGAAN_FORM_ID);
    const isBehandeld = await this.isBehandeld(selectedPeriod);

    return RSVP.hash({
      bestuurseenheid: parentModel.bestuurseenheid,
      bestuursorganen,
      form,
      bestuursPeriods,
      selectedPeriod,
      isBehandeld,
    });
  }

  async isBehandeld(selectedPeriod) {
    const periodeHasLegislatuur =
      (await selectedPeriod.installatievergaderingen).length >= 1;
    if (!periodeHasLegislatuur) {
      return false;
    }

    const behandeldeVergaderingen = await this.store.query(
      'installatievergadering',
      {
        'filter[status][:uri:]': INSTALLATIVERGADERING_BEHANDELD_STATUS,
        'filter[bestuursperiode][:id:]': selectedPeriod.id,
      }
    );

    return behandeldeVergaderingen.length === 0;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
