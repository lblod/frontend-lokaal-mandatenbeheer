import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';

import { restartableTask, timeout } from 'ember-concurrency';

export default class AdminPanelGlobalSystemMessageController extends Controller {
  @service store;
  @service('globalSystemMessage') messageService;

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
      this.systemMessageModel = null;
    }

    if (this.isActive && !this.systemMessageModel) {
      this.systemMessageModel = await this.messageService.createMessage(
        this.message
      );
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
