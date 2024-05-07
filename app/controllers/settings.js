import Controller from '@ember/controller';

import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class SettingsController extends Controller {
  @tracked bestuurseenheidEmail;

  get bestuurseenheid() {
    return { email: this.bestuurseenheidEmail };
  }

  prepareSettings = restartableTask(async () => {
    await timeout(SEARCH_TIMEOUT);
  });

  saveBestuurseenheidSettings = restartableTask(async () => {});
  cancelBestuurseenheidSettings = restartableTask(async () => {});
}
