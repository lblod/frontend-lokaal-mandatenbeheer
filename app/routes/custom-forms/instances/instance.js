import Route from '@ember/routing/route';

export default class CustomFormsInstancesInstanceRoute extends Route {
  async model({ id }) {
    console.log(`SINGLE INSTANCE router`, id);
  }
}
