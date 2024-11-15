import Controller from '@ember/controller';

import { service } from '@ember/service';

export default class AdminPanelController extends Controller {
  @service router;

  get isIndex() {
    return this.router.currentRouteName === 'admin-panel.index';
  }
}
