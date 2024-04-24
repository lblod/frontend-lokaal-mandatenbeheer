import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class VerkiezingenVerkiezingsuitslagIndexRoute extends Route {
  @service store;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  getOptions(params) {
    const options = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      'filter[kandidatenlijst][verkiezing][bestuursorgaan-in-tijd][id]':
        params.bestuursorgaan_in_tijd_id,
      'filter[:has:persoon]': 'true',
      include: ['kandidatenlijst', 'persoon'].join(','),
    };
    if (params.filter && params.filter.length > 0) {
      options['filter[persoon]'] = params.filter;
    }
    return options;
  }

  async model(params) {
    const parentModel = this.modelFor('verkiezingen.verkiezingsuitslag');
    const options = this.getOptions(params);
    const verkiezingsresultaten = await this.store.query(
      'verkiezingsresultaat',
      options
    );
    return {
      verkiezingsresultaten,
      ...parentModel,
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.searchData = this.paramsFor('verkiezingen.verkiezingsuitslag')[
      'filter'
    ];
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
