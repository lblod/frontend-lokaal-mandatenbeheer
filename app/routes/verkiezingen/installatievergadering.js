import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { MANDATARIS_EXTENDED_FORM } from 'frontend-lmb/utils/well-known-ids';
import {
  BCSD_BESTUURSORGAAN_URI,
  BURGEMEESTER_BESTUURSORGAAN_URI,
  CBS_BESTUURSORGAAN_URI,
  GEMEENTERAAD_BESTUURSORGAAN_URI,
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
  @service('installatievergadering') ivService;

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

    const bestuursorganenInTijd =
      await this.getBestuursorganenInTijd(selectedPeriod);

    await this.ivService.setup(selectedPeriod, bestuursorganenInTijd);

    const verkiezingen = await this.getVerkiezingen(selectedPeriod);
    const kandidatenlijsten = await this.getKandidatenLijsten(selectedPeriod);

    const mandatarisForm = await this.semanticFormRepository.getFormDefinition(
      MANDATARIS_EXTENDED_FORM
    );

    return RSVP.hash({
      bestuurseenheid,
      mandatarisForm,
      verkiezingen,
      kandidatenlijsten,
      bestuursPeriods,
      isRelevant: parentModel.isRelevant,
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
