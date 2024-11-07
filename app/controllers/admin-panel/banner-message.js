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

  @tracked systemMessageModel;

  get isDisabled() {
    return !this.message || this.message.trim === '';
  }

  @action
  async toggleIsActive() {
    this.isActive = !this.isActive;

    if (!this.isActive && this.systemMessageModel) {
      await this.systemMessageModel.destroyRecord();
    }

    if (this.isActive && !this.systemMessageModel) {
      const newMessage = this.store.createRecord('global-system-message', {
        message: this.message,
      });
      await newMessage.save();
      this.systemMessageModel = newMessage;
    }
  }

  setMessageFromModel(systemMessage) {
    this.systemMessageModel = systemMessage;
    this.message = this.systemMessageModel?.message;
    this.isActive = this.message ? true : false;
  }

  onInputChange = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);

    this.message = event.target?.value;
  });
}
