import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganenbeheerIndexRoute extends Route {
  @service store;

  async model() {
    const parentModel = this.modelFor('organen');

    return {
      bestuursorganen: parentModel.bestuursorganen,
    };
  }
}
