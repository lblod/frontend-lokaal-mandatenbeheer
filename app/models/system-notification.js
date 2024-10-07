import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SystemNotificationModel extends Model {
  @attr('string') uri;

  @attr('string') subject;
  @attr('string') message;
  @attr('datetime', {
    defaultValue() {
      return new Date();
    },
  })
  createdAt;
  @attr('datetime') readAt;
  @attr('datetime') archivedAt;

  @belongsTo('gebruiker', {
    async: true,
    inverse: 'systemNotifications',
  })
  gebruiker;

  @belongsTo('system-notification-code', {
    async: true,
    inverse: null,
  })
  code;

  @hasMany('system-notification-link', {
    async: true,
    inverse: null,
  })
  linkedItems;
}
