import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class FormInstancesController extends Controller {
  @service router;

  @action
  createNewInstance() {
    this.router.transitionTo('formbeheer.form.new', this.model.formId);
  }

  @action
  async removeInstance(instanceId) {
    const result = await fetch(
      `/form-content/${this.model.formId}/instances/${instanceId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }
    );

    if (!result.ok) {
      this.errorMessage =
        'Er ging iets mis bij het verwijderen van het formulier. Probeer het later opnieuw.';
      return;
    }
    this.send('reloadModel');
  }
}
