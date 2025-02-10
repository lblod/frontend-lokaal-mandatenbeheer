import Route from '@ember/routing/route';

export default class CodelijstenDetailEditRoute extends Route {
  async model() {
    const codelijst = this.modelFor('codelijsten.detail');

    return { codelijst, concepten: await codelijst.concepts };
  }

  async setupController(controller, model) {
    super.setupController(...arguments);

    controller.resetToModelValues(model.codelijst, model.concepten);
  }
}
