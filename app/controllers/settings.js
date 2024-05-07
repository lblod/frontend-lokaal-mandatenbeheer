import Controller from '@ember/controller';

import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import {
  SEARCH_TIMEOUT,
  USER_INPUT_DEBOUNCE,
} from 'frontend-lmb/utils/constants';

export default class SettingsController extends Controller {
  @tracked bestuurseenheidEmail;

  get bestuurseenheid() {
    return { email: this.bestuurseenheidEmail };
  }

  prepareSettings = restartableTask(async () => {
    await timeout(SEARCH_TIMEOUT);
  });

  validateEmailBestuurseenheid = restartableTask(async (event) => {
    await timeout(USER_INPUT_DEBOUNCE);

    const inputValue = event.target?.value;

    if (!inputValue) {
      console.log(`No input in email field`);
    }

    this.bestuurseenheidEmail = `${inputValue}`.trim();
  });
}
