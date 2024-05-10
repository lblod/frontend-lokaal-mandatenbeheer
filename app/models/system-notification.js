import Model, { attr, belongsTo } from '@ember-data/model';

export default class SystemNotificationModel extends Model {
  @attr('string') uri;

  @attr('string') subject;
  @attr('string') message;

  @attr('datetime') createdAt;
  @attr('datetime') readAt;
  @attr('datetime') archivedAt;

  @belongsTo('gebruiker', {
    async: true,
    inverse: 'system-notification',
  })
  gebruiker;
}
