import Route from '@ember/routing/route';

export default class NewFractiesNewRouteInstancesRoute extends Route {
  async model() {
    const formModel = this.modelFor('legacy.mandatenbeheer.fracties-new');
    return { form: formModel };
  }
}
