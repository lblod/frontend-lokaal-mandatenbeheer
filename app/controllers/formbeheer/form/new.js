import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class FormNewController extends Controller {
  @service router;

  @action
  onCreate(id) {
    const definitionId = this.model.form.definition.id;
    this.router.transitionTo('formbeheer.form.instance', definitionId, id);
  }
}
