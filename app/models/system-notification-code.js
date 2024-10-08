import Model, { attr } from '@ember-data/model';

export default class SystemNotificationCodeModel extends Model {
  @attr('string') uri;
  @attr('string') label;
}
