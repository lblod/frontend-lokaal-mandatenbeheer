import Route from '@ember/routing/route';

export default class CustomFormsInstancesIndexRoute extends Route {
  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: false },
    size: { refreshModel: false },
    sort: { refreshModel: true },
  };
}
