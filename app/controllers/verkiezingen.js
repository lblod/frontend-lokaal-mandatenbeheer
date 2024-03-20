import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class VerkiezingenController extends Controller {
  @service router;

  @action
  goToInstallatievergadering(targetOrgaan) {
    // TODO: use the correct route name
  }
}
