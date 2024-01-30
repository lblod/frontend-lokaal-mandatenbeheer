import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MandatenbeheerMandatarissenNewController extends Controller {
  @service() router;

  @action
  selectPersoon(persoon) {
    this.router.transitionTo(
      'legacy.mandatenbeheer.mandatarissen.edit',
      persoon.get('id')
    );
  }

  @action
  createNewPerson(hasData) {
    hasData
      ? this.router.transitionTo('legacy.mandatenbeheer.mandatarissen.new-person', {
          queryParams: hasData,
        })
      : this.router.transitionTo('legacy.mandatenbeheer.mandatarissen.new-person');
  }

  @action
  cancel() {
    this.router.transitionTo('legacy.mandatenbeheer.mandatarissen');
  }
}
