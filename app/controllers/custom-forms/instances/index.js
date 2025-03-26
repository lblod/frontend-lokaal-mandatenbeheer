import Controller from '@ember/controller';

import { action } from '@ember/object';

export default class CustomFormsInstancesIndexController extends Controller {
  @action
  preventSave(ttl) {
    if (!ttl) {
      return;
    }
    throw new Error('Niet bewaren aub', ttl); // TODO:
  }
}
