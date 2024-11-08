import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class GlobalSystemMessageService extends Service {
  @service store;

  @tracked messageModel = null;

  async findMessage() {
    const globalSystemMessages = await this.store.findAll(
      'global-system-message'
    );
    this.messageModel =
      globalSystemMessages.length >= 1 ? globalSystemMessages.at(0) : null;

    return this.messageModel;
  }

  async createMessage(message) {
    const newMessage = this.store.createRecord('global-system-message', {
      message,
    });
    await newMessage.save();
    this.messageModel = newMessage;

    return newMessage;
  }

  async removeMessage() {
    if (this.messageModel?.id) {
      await this.messageModel.destroyRecord();
      this.messageModel = null;
    }
  }

  get message() {
    return this.messageModel?.message;
  }

  get isActive() {
    return this.messageModel ? true : false;
  }
}
