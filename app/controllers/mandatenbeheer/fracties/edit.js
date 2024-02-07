import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { getBestuursorgaanMetaTtl } from 'frontend-lmb/utils/bestuursorgaanMetaTtl';

export default class MandatenbeheerFractiesEditController extends Controller {
  @service router;

  @action
  buildMetaTtl() {
    return getBestuursorgaanMetaTtl(this.model.bestuursorgaan);
  }

  @action
  onSave() {
    this.router.transitionTo('mandatenbeheer.fracties');
  }

  @action
  cancel() {
    this.router.transitionTo('mandatenbeheer.fracties');
  }
}
