import Controller from '@ember/controller';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SettingsController extends Controller {
  @service currentSession;
  @tracked bestuurseenheidEmail;

  get bestuurseenheid() {
    return { email: this.bestuurseenheidEmail };
  }

  get bestuurseenheidLabel() {
    return `${this.currentSession.groupClassification.label} ${this.currentSession.group.naam}`;
  }
}
