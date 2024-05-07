import Controller from '@ember/controller';

import { restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class SettingsController extends Controller {
  @service currentSession;
  @tracked bestuurseenheidEmail;

  get bestuurseenheid() {
    return { email: this.bestuurseenheidEmail };
  }

  prepareSettings = restartableTask(async () => {
    await timeout(SEARCH_TIMEOUT);
    console.log(`model`, this.model);
    console.log(`model.bestuurseenheid`, this.model.bestuurseenheid);
  });

  saveBestuurseenheidSettings = restartableTask(async () => {});
  cancelBestuurseenheidSettings = restartableTask(async () => {});

  get bestuurseenheidLabel() {
    console.log(this.currentSession);
    return `${this.currentSession.groupClassification.label} ${this.currentSession.group.naam}`;
  }
}
