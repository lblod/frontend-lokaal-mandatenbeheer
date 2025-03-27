import Route from '@ember/routing/route';

export default class CustomFormsInstancesInstanceRoute extends Route {
  async model(params) {
    const parent = this.modelFor('custom-forms.instances.index');

    return { form: parent.formDefinition, instanceId: params.instance_id };
  }
}
