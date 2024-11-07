import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';

import { restartableTask, timeout } from 'ember-concurrency';

export default class AdminPanelBannerMessageController extends Controller {
  @service store;

  @tracked message;
  @tracked isActive;

  get isDisabled() {
    return !this.message || this.message.trim === '';
  }

  @action
  toggleIsActive() {
    this.isActive = !this.isActive;
  }

  onInputChange = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);

    this.message = event.target?.value;
  });
}
