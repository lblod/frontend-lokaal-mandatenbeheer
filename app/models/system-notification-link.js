import Model, { attr } from '@ember-data/model';

export default class SystemNotificationLinkModel extends Model {
  @attr('string') uri;
  @attr('string') target;
  @attr('string') kind;
}
