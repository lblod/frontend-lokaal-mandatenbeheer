import Route from '@ember/routing/route';

import { service } from '@ember/service';
import { action } from '@ember/object';

export default class VerkiezingenVerkiezingsuitslagRoute extends Route {
  @service store;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const options = this.getOptions(params);
    const verkiezing = await this.store.findRecord(
      'rechtstreekse-verkiezing',
      params.id,
      {
        include: 'kandidatenlijsten.kandidaten,kandidatenlijsten.resultaten',
      }
    );
    const verkiezingsresultaten = await this.store.query(
      'verkiezingsresultaat',
      options
    );

    return {
      verkiezing,
      verkiezingsresultaten,
    };
  }

  getOptions(params) {
    const options = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      'filter[kandidatenlijst][verkiezing][:id:]': params.id,
      'filter[:has:persoon]': 'true',
      include: ['kandidatenlijst', 'persoon'].join(','),
    };
    if (params.filter && params.filter.length > 0) {
      options['filter[persoon]'] = params.filter;
    }
    return options;
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
