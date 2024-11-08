import Service, { service } from '@ember/service';

export default class GlobalSystemMessageService extends Service {
  @service store;

  message = null;

  async findMessage() {
    const globalSystemMessages = await this.store.findAll(
      'global-system-message'
    );

    return globalSystemMessages.length >= 1 ? globalSystemMessages.at(0) : null;
  }

  async createMessage(message) {
    const newMessage = this.store.createRecord('global-system-message', {
      message,
    });
    await newMessage.save();
    return newMessage;
  }

  get isActive() {
    return this.message ? true : false;
  }
}
