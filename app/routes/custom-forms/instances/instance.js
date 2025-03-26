import Route from '@ember/routing/route';

export default class CustomFormsInstancesInstanceRoute extends Route {
  async model({ id }) {
    const formModel = this.modelFor('custom-forms.instances');

    return { form: formModel.form, instanceId: id };
  }
}
