import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MandatarissenPersoonIndexController extends Controller {
  @service router;
  @service features;

  @tracked showUsage = false;

  get canShowUsage() {
    return (
      this.features.isEnabled('editable-forms') && this.model.usages.length > 0
    );
  }

  @action
  onSave() {
    this.router.refresh();
  }

  @action
  toggleShowUsage() {
    this.showUsage = !this.showUsage;
  }
}
