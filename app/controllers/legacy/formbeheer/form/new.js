import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class FormNewController extends Controller {
  @service router;

  @action
  onCreate(id) {
    const definitionId = this.model.formDefinition.id;
    this.router.transitionTo(
      'legacy.formbeheer.form.instance',
      definitionId,
      id
    );
  }
}
