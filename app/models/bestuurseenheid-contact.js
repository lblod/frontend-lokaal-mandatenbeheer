import Model, { attr, belongsTo } from '@ember-data/model';

export default class BestuurseenheidContactModel extends Model {
  @attr('string') uri;
  @attr('string') email;

  @belongsTo('bestuurseenheid', {
    async: true,
    inverse: null,
  })
  bestuurseenheid;
}
