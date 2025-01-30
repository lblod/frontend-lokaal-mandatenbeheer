import Route from '@ember/routing/route';

import { service } from '@ember/service';

import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';
import moment from 'moment';

export default class MandatarissenPersoonMandatenRoute extends Route {
  @service store;
  @service bestuursorganen;
  @service bestuursperioden;
  @service currentSession;
  @service('persoon-api') persoonApi;

  queryParams = {
    activeOnly: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = await this.modelFor('mandatarissen.persoon');
    const persoon = parentModel.persoon;
    const mandatarissen = await this.getMandatarissen(persoon, params);

    const bestuurseenheid = this.currentSession.group;
    const hasActiveMandatarissen = await this.persoonApi.hasActiveMandatarissen(
      persoon.id
    );
    const bestuursorganen =
      await this.bestuursorganen.getRealCurrentPoliticalBestuursorganen();

    const foldedMandatarissen = await foldMandatarisses(params, mandatarissen);

    let filteredMandatarissen = foldedMandatarissen;
    if (params.activeOnly) {
      filteredMandatarissen = foldedMandatarissen.filter((mandataris) => {
        const now = moment();
        return (
          moment(mandataris.foldedStart).isBefore(now) &&
          (!mandataris.foldedEnd || moment(mandataris.foldedEnd).isAfter(now))
        );
      });
    }

    const mandatarissenForOnafhankelijk = await foldMandatarisses(
      params,
      await this.getMandatarissen(persoon, params, true)
    );

    return {
      persoon,
      hasActiveMandatarissen,
      mandatarissenForOnafhankelijk,
      mandatarissen: filteredMandatarissen,
      bestuurseenheid,
      bestuursorganen,
    };
  }

  async getMandatarissen(persoon, params, onlyInCurrentPeriod = false) {
    let bestuursperiodeFilter = {};
    if (onlyInCurrentPeriod) {
      const currentPeriod =
        await this.bestuursperioden.getCurrentBestuursperiode();
      bestuursperiodeFilter = {
        'filter[bekleedt][bevat-in][heeft-bestuursperiode][:uri:]':
          currentPeriod.uri,
      };
    }

    let queryParams = {
      sort: params.sort,
      filter: {
        'is-bestuurlijke-alias-van': {
          id: persoon.id,
        },
      },
      // We have to check the original-bestuurseenheid instead of the following, because we don't have access to the
      // type of the original-bestuursorgaan (other graph) and mu-auth needs the type to be able to check the filter.
      // 'filter[bekleedt][bevat-in][:has-no:original-bestuursorgaan]': true,
      'filter[bekleedt][bevat-in][is-tijdsspecialisatie-van][:has-no:original-bestuurseenheid]': true,
      ...bestuursperiodeFilter,
      include: [
        'is-bestuurlijke-alias-van',
        'bekleedt.bestuursfunctie',
        'bekleedt.bevat-in',
        'bekleedt.bevat-in.is-tijdsspecialisatie-van',
        'beleidsdomein',
        'heeft-lidmaatschap.binnen-fractie',
        'publication-status',
        'status',
      ].join(','),
    };

    return await this.store.query('mandataris', queryParams);
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.checkFracties.perform(model.mandatarissenForOnafhankelijk);
  }
}
