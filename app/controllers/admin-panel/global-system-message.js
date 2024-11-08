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

  get isDisabled() {
    return !this.message || this.message.trim === '';
  }

  @action
  async toggleIsActive() {
    const isActive = !this.messageService.isActive;
    if (!isActive && this.messageService.messageModel) {
      await this.messageService.removeMessage();
    }

    if (isActive && !this.messageService.messageModel) {
      this.systemMessageModel = await this.messageService.createMessage(
        this.message
      );
    }
  }

  async setMessageFromModel() {
    this.systemMessageModel = await this.messageService.findMessage();
    this.message = this.systemMessageModel?.message;
  }

  onInputChange = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);

    this.message = event.target?.value;
  });
}
