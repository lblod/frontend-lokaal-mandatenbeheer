import Controller from '@ember/controller';

import { restartableTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SettingsController extends Controller {
  @service currentSession;
  @tracked bestuurseenheidEmail;

  get bestuurseenheid() {
    return { email: this.bestuurseenheidEmail };
  }

  saveBestuurseenheidSettings = restartableTask(async () => {});
  cancelBestuurseenheidSettings = restartableTask(async () => {});

  get bestuurseenheidLabel() {
    return this.currentSession.group.naam;
  }
}
