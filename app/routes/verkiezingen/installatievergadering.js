import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { MANDATARIS_EXTENDED_FORM } from 'frontend-lmb/utils/well-known-ids';
import {
  BCSD_BESTUURSORGAAN_URI,
  BURGEMEESTER_BESTUURSORGAAN_URI,
  CBS_BESTUURSORGAAN_URI,
  GEMEENTERAAD_BESTUURSORGAAN_URI,
  INSTALLATIEVERGADERING_BEHANDELD_STATUS,
  KANDIDATENLIJST_OCMW,
  RMW_BESTUURSORGAAN_URI,
  VAST_BUREAU_BESTUURSORGAAN_URI,
} from 'frontend-lmb/utils/well-known-uris';
import RSVP from 'rsvp';

export default class PrepareInstallatievergaderingRoute extends Route {
  @service store;
  @service bestuursperioden;
  @service bestuursorganen;
  @service semanticFormRepository;

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

    const verkiezingen = await this.getVerkiezingen(selectedPeriod);
    const kandidatenlijsten = await this.getKandidatenLijsten(selectedPeriod);

    const mandatarisForm = await this.semanticFormRepository.getFormDefinition(
      MANDATARIS_EXTENDED_FORM
    );

    return RSVP.hash({
      ivStatuses,
      installatievergadering,
      bestuurseenheid,
      bestuursorganenInTijd,
      mandatarisForm,
      verkiezingen,
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

  async getVerkiezingen(bestuursperiode) {
    const queryParams = {
      'filter[bestuursorganen-in-tijd][heeft-bestuursperiode][:id:]':
        bestuursperiode.id,
      include: [
        'kandidatenlijsten',
        'kandidatenlijsten.lijsttype',
        'kandidatenlijsten.resulterende-fracties',
      ].join(','),
    };

    return await this.store.query('rechtstreekse-verkiezing', queryParams);
  }

  async getKandidatenLijsten(bestuursperiode) {
    const queryParams = {
      'filter[verkiezing][bestuursorganen-in-tijd][heeft-bestuursperiode][:id:]':
        bestuursperiode.id,
      include: ['resulterende-fracties', 'lijsttype'].join(','),
    };
    const results = await this.store.query('kandidatenlijst', queryParams);
    return results.filter((lijst) => {
      return lijst.get('lijsttype').get('uri') !== KANDIDATENLIJST_OCMW;
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('verkiezingsUitslagModal', false);
    }
  }
}
