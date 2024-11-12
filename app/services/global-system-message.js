import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class GlobalSystemMessageService extends Service {
  @service store;

  @tracked currentMessage = null;

  constructor() {
    super(...arguments);
    this.#periodicallyCheckMessage();
  }

  async findMessage() {
    const globalSystemMessages = await this.store.findAll(
      'global-system-message'
    );
    this.currentMessage =
      globalSystemMessages.length >= 1 ? globalSystemMessages.at(0) : null;

    return this.currentMessage;
  }

  async createMessage(message) {
    const newMessage = this.store.createRecord('global-system-message', {
      message,
    });
    await newMessage.save();
    this.currentMessage = newMessage;

    return newMessage;
  }

  async removeMessage() {
    if (this.currentMessage?.id) {
      await this.currentMessage.destroyRecord();
      this.currentMessage = null;
    }
  }

  get message() {
    return this.currentMessage?.message;
  }

  get isActive() {
    return this.currentMessage ? true : false;
  }

  #periodicallyCheckMessage() {
    this.findMessage();

    setInterval(async () => {
      await this.findMessage();
    }, 300000); // every 5 minutes
  }
}
