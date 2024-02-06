import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { getUniqueBestuursorganen } from 'frontend-lmb/models/mandataris';

export default class MandatenbeheerMandatarissenRoute extends Route {
  @service store;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const mandatenbeheer = this.modelFor('mandatenbeheer');

    const options = this.getOptions(params, mandatenbeheer);

    const mandatarissen = await this.store.query('mandataris', options);

    let mandatarisBestuursorganenPromise = {};
    mandatarissen.forEach((mandataris) => {
      mandatarisBestuursorganenPromise[mandataris.id] =
        getUniqueBestuursorganen(mandataris);
    });

    const mandatarisBestuursorganen = await RSVP.hash(
      mandatarisBestuursorganenPromise
    );

    return {
      mandatarissen,
      mandatenbeheer,
      mandatarisBestuursorganen,
    };
  }

  getOptions(params, mandatenbeheer) {
    const bestuursorganenIds = mandatenbeheer.bestuursorganen.map((o) =>
      o.get('id')
    );

    const queryParams = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      filter: {
        bekleedt: {
          'bevat-in': {
            id: bestuursorganenIds.join(','),
          },
        },
      },
      include: ['is-bestuurlijke-alias-van', 'bekleedt.bestuursfunctie'].join(
        ','
      ),
    };

    if (params.filter) {
      queryParams['filter']['is-bestuurlijke-alias-van'] = params.filter;
    }

    return queryParams;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.searchData = this.paramsFor('mandatenbeheer.mandatarissen')[
      'filter'
    ];
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
