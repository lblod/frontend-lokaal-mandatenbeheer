import Route from '@ember/routing/route';

import { service } from '@ember/service';

import RSVP from 'rsvp';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { MANDATARIS_EXTENDED_FORM } from 'frontend-lmb/utils/well-known-ids';
import {
  BCSD_BESTUURSORGAAN_URI,
  BURGEMEESTER_BESTUURSORGAAN_URI,
  CBS_BESTUURSORGAAN_URI,
  GEMEENTERAAD_BESTUURSORGAAN_URI,
  INSTALLATIEVERGADERING_BEHANDELD_STATUS,
  RMW_BESTUURSORGAAN_URI,
  VAST_BUREAU_BESTUURSORGAAN_URI,
} from 'frontend-lmb/utils/well-known-uris';

export default class PrepareInstallatievergaderingRoute extends Route {
  @service store;
  @service bestuursperioden;
  @service bestuursorganen;

  queryParams = {
    bestuursperiode: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('verkiezingen');
    const bestuurseenheid = parentModel.bestuurseenheid;

    const bestuursPeriods = await this.store.query('bestuursperiode', {
      sort: 'label',
      'filter[installatievergaderingen][bestuurseenheid][:id:]':
        bestuurseenheid.id,
    });
    if (bestuursPeriods.length == 0) {
      return RSVP.hash({
        bestuurseenheid,
        isRelevant: false,
      });
    }
    let selectedPeriod = this.bestuursperioden.getRelevantPeriod(
      bestuursPeriods,
      params.bestuursperiode
    );

    const ivStatuses = await this.store.findAll(
      'installatievergadering-status'
    );

    const installatievergadering = (
      await this.store.query('installatievergadering', {
        'filter[bestuurseenheid][id]': bestuurseenheid.id,
        'filter[bestuursperiode][:id:]': selectedPeriod.id,
        include: ['status'].join(','),
      })
    )[0];

    const bestuursorganenInTijd =
      await this.getBestuursorganenInTijd(selectedPeriod);

    const kandidatenlijsten = await this.getKandidatenLijsten(selectedPeriod);

    const mandatarisForm = getFormFrom(this.store, MANDATARIS_EXTENDED_FORM);

    return RSVP.hash({
      ivStatuses,
      installatievergadering,
      bestuurseenheid,
      bestuursorganenInTijd,
      mandatarisForm,
      kandidatenlijsten,
      bestuursPeriods,
      selectedPeriod,
      isRelevant: parentModel.isRelevant,
      isBehandeld:
        installatievergadering.get('status.uri') ===
        INSTALLATIEVERGADERING_BEHANDELD_STATUS,
    });
  }

  async getBestuursorganenInTijd(selectedPeriod) {
    const allBestuursOrganenInTijd = (
      await this.bestuursorganen.getAllRelevantPoliticalBestuursorganenInTijd(
        selectedPeriod
      )
    ).slice();

    const bestuursorgaanOrder = [
      GEMEENTERAAD_BESTUURSORGAAN_URI,
      RMW_BESTUURSORGAAN_URI,
      BURGEMEESTER_BESTUURSORGAAN_URI,
      CBS_BESTUURSORGAAN_URI,
      VAST_BUREAU_BESTUURSORGAAN_URI,
      BCSD_BESTUURSORGAAN_URI,
    ];

    const bestuursorgaanUris = await Promise.all(
      allBestuursOrganenInTijd.map(async (orgaan) => {
        return (await (await orgaan.isTijdsspecialisatieVan).classificatie).uri;
      })
    );

    let sortedBestuursorganenInTijd = [];
    bestuursorgaanOrder.forEach((uri) => {
      allBestuursOrganenInTijd.forEach((orgaan, index) => {
        if (bestuursorgaanUris[index] === uri) {
          sortedBestuursorganenInTijd.push(orgaan);
        }
      });
    });

    return sortedBestuursorganenInTijd;
  }

  async getKandidatenLijsten(bestuursperiode) {
    const queryParams = {
      'filter[verkiezing][bestuursorgaan-in-tijd][heeft-bestuursperiode][:id:]':
        bestuursperiode.id,
      include: 'resulterende-fracties',
    };

    return await this.store.query('kandidatenlijst', queryParams);
  }
}
