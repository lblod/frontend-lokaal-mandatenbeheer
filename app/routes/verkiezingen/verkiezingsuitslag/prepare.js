import Route from '@ember/routing/route';

export default class PrepareInstallatievergaderingRoute extends Route {
  async model() {
    return {
      ...this.modelFor('verkiezingen.verkiezingsuitslag'),
    };
  }
}
