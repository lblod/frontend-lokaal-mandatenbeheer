import Route from '@ember/routing/route';

export default class BulkBekrachtigingRoute extends Route {
  async model() {
    const parentModel = this.modelFor('organen.orgaan');
    const currentBestuursorgaan = await parentModel.currentBestuursorgaan;

    return {
      bestuursorgaan: parentModel.bestuursorgaan,
      currentBestuursorgaan: currentBestuursorgaan,
    };
  }
}
