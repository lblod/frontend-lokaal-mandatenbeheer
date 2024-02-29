import Route from '@ember/routing/route';

export default class MandatenbeheerMandatarissenRoute extends Route {
  async model() {
    const mandatenbeheer = this.modelFor('mandatenbeheer');

    return {
      mandatenbeheer,
    };
  }
}
