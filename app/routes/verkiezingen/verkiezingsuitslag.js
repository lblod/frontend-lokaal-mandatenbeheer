import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class VerkiezingenVerkiezingsuitslagRoute extends Route {
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
    const options = this.getOptions(params);
    const verkiezingsresultaten = await this.store.query(
      'verkiezingsresultaat',
      options
    );
    const ivStatuses = await this.store.findAll(
      'installatievergadering-status'
    );
    // This query returns a single installatievergadering wrapped in an array
    const installatievergaderingen = await this.store.query(
      'installatievergadering',
      {
        'filter[bestuursorgaan-in-tijd][id]': params.bestuursorgaan_in_tijd_id,
        include: 'status',
      }
    );
    const installatievergadering = installatievergaderingen[0];
    const selectedStatus = installatievergadering.get('status');

    return {
      verkiezingsresultaten,
      ivStatuses,
      selectedStatus,
      installatievergadering,
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
