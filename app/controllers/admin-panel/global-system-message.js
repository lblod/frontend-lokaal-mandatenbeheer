import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';

import { restartableTask } from 'ember-concurrency';

export default class AdminPanelGlobalSystemMessageController extends Controller {
  @service store;
  @service('globalSystemMessage') messageService;

  get isDisabled() {
    return !this.messageService.message || this.messageService.message === '';
  }

  @action
  async toggleIsActive() {
    this.messageService.updateCurrentMessage(
      this.messageService.message,
      !this.messageService.isActive
    );
  }

  onInputBlur = restartableTask(async (event) => {
    this.messageService.updateCurrentMessage(
      event.target?.value?.trim(),
      this.messageService.isActive
    );
  });
}
